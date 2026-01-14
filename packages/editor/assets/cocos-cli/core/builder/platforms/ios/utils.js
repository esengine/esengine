'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePackageName = changePackageName;
exports.checkPackageNameValidity = checkPackageNameValidity;
exports.executableNameOrDefault = executableNameOrDefault;
exports.modifyPackageName = modifyPackageName;
exports.updateXcodeproject = updateXcodeproject;
exports.renameXcodeResource = renameXcodeResource;
exports.findSignIdentify = findSignIdentify;
exports.verificationFunc = verificationFunc;
exports.compareVersion = compareVersion;
const path_1 = require("path");
const fs_extra_1 = require("fs-extra");
const child_process_1 = require("child_process");
/**
 * 修改 ios 的包名
 * @param projectPath
 * @param packageName
 */
async function changePackageName(projectPath, packageName) {
    const projectJSONPath = (0, path_1.join)(projectPath, '.cocos-project.json');
    if (!(0, fs_extra_1.existsSync)(projectJSONPath)) {
        console.error(`Can't find project json [${projectJSONPath}]`);
        return;
    }
    const json = await (0, fs_extra_1.readJSON)(projectJSONPath);
    packageName = packageName || json.packageName;
    if (!checkPackageNameValidity(packageName)) {
        console.error('The package name is illegal(iOS). It can only contain these characters: [0-9], [a-z], [A-Z], [_].');
        // packageName = modifyPackageName(packageName);
        return;
    }
    let lastPackageName = json.packageName;
    if (json.mac && json.mac.packageName) {
        lastPackageName = json.mac.packageName;
    }
    const packageNameChanged = lastPackageName !== packageName;
    if (!packageNameChanged) {
        return;
    }
    const templateJsonPath = (0, path_1.join)(projectPath, 'cocos-project-template.json');
    if (!(0, fs_extra_1.existsSync)(templateJsonPath)) {
        console.error(`Can't find template json [${templateJsonPath}]`);
        return;
    }
    const templateJson = await (0, fs_extra_1.readJSON)(templateJsonPath);
    const nativeSupport = templateJson.do_add_native_support;
    let files;
    if (packageNameChanged) {
        files = nativeSupport.project_replace_ios_bundleid.files;
        for (const file of files) {
            const path = (0, path_1.join)(projectPath, file);
            if (!(0, fs_extra_1.existsSync)(path)) {
                console.error(`Can't not find file [${file}], replace package name failed`);
                continue;
            }
            let content = await (0, fs_extra_1.readFile)(path, 'utf8');
            content = content.replace(new RegExp(lastPackageName, 'gm'), packageName);
            await (0, fs_extra_1.writeFile)(path, content);
        }
    }
    if (!json.ios) {
        json.ios = {};
    }
    json.ios.packageName = packageName;
    await (0, fs_extra_1.writeFile)(projectJSONPath, JSON.stringify(json, null, 2));
}
/**
 * 检查 ios 包名的合法性
 * @param packageName
 */
function checkPackageNameValidity(packageName) {
    // only alphanumeric characters (A–Z, a–z, and 0–9), hyphens (-), and periods (.)
    // refer: https://developer.apple.com/documentation/bundleresources/information_property_list/cfbundleidentifier
    return /^[a-zA-Z]+([a-zA-Z0-9-.])+$/.test(packageName);
}
function executableNameOrDefault(projectName, executableName) {
    if (executableName)
        return executableName;
    if (/^[0-9a-zA-Z_-]+$/.test(projectName))
        return `${projectName}-mobile`;
    console.warn(`The provided project name "${projectName}" is not suitable for use as an executable name. 'CocosGame' is applied instead.`);
    return 'CocosGame';
}
/**
 * 将包名内不合法字段修改成 _
 * @param packageName
 */
function modifyPackageName(packageName) {
    return packageName;
}
async function updateXcodeproject(projectPath, options) {
    const root = options.engineInfo.native.builtin;
    const template = options.packages.native.template; // default ｜ link
    const xcodedir = (0, path_1.join)(projectPath, 'frameworks/runtime-src/proj.ios_mac', `${options.name}.xcodeproj`);
    if (template === 'link' && (0, fs_extra_1.existsSync)(xcodedir)) {
        const projectpbx = (0, path_1.join)(xcodedir, 'project.pbxproj');
        // replace content
        let txt = (await (0, fs_extra_1.readFile)(projectpbx)).toString();
        // TODO 这个逻辑应该放 engine-native 仓库，不应该在编辑器里 hack，否则耦合严重
        txt = txt.replace(/\/Applications\/CocosCreator.app\/Contents\/Resources\/cocos2d-x/g, (0, path_1.normalize)(root));
        await (0, fs_extra_1.writeFile)(projectpbx, txt);
    }
    const xcscheme = (0, path_1.join)(xcodedir, 'xcshareddata/xcschemes/HelloJavascript-clip.xcscheme');
    if ((0, fs_extra_1.existsSync)(xcscheme)) {
        let txt = (await (0, fs_extra_1.readFile)(xcscheme)).toString();
        txt = txt.replace(/HelloJavascript/g, options.name);
        await (0, fs_extra_1.writeFile)(xcscheme, txt);
    }
}
async function renameXcodeResource(projectPath, options) {
    const renameFiles = [
        (0, path_1.join)(projectPath, 'frameworks/runtime-src/proj.ios_mac', `${options.name}.xcodeproj/xcshareddata/xcschemes/HelloJavascript-clip.xcscheme`),
        (0, path_1.join)(projectPath, 'frameworks/runtime-src/proj.ios_mac', `${options.name}.xcodeproj/xcshareddata/xcschemes/${options.name}-clip.xcscheme`),
        (0, path_1.join)(projectPath, 'frameworks/runtime-src/proj.ios_mac', 'ios/HelloJavascript-mobileRelease.entitlements'),
        (0, path_1.join)(projectPath, 'frameworks/runtime-src/proj.ios_mac', `ios/${options.name}-mobileRelease.entitlements`),
        (0, path_1.join)(projectPath, 'frameworks/runtime-src/proj.ios_mac', 'ios_appclip/HelloJavascript.entitlements'),
        (0, path_1.join)(projectPath, 'frameworks/runtime-src/proj.ios_mac', `ios_appclip/${options.name}.entitlements`),
    ];
    for (let i = 0; i < renameFiles.length; i += 2) {
        if ((0, fs_extra_1.existsSync)(renameFiles[i])) {
            await (0, fs_extra_1.rename)(renameFiles[i], renameFiles[i + 1]);
        }
        else {
            console.log(`notice: file ${renameFiles[i]} not found!`);
        }
    }
}
function flatArray(recArray, output) {
    if (recArray instanceof Array) {
        for (const e of recArray) {
            flatArray(e, output);
        }
    }
    else {
        output.push(recArray);
    }
}
/**
 * 读取证书中的 Organization Unit 字段, 作为 team id 使用.
 * @param name 证书名称
 * @returns
 */
function readOrganizationUnits(name) {
    const pem = (0, child_process_1.execSync)(`xcrun security find-certificate -c "${name}" -p`, { encoding: 'utf8' });
    const text = (0, child_process_1.execSync)('openssl x509 -inform PEM -noout -text', { input: pem, encoding: 'utf8' });
    const reg = /OU\s*=\s*(\w+),/;
    const lines = text.split('\n').filter(x => x.match(/^\s*Subject:/)).map(x => x.match(reg)).filter(x => x !== null).map(m => m[1]);
    return lines.length === 0 ? [] : lines;
}
/**
 * 查询可用的 DEVELOPMENT_TEAM
 * @returns 签名[]
 */
async function findSignIdentify() {
    try {
        const output = (0, child_process_1.execSync)('xcrun security find-identity -v -p codesigning').toString('utf8');
        const lines = output.split('\n');
        const reg = /(\w+\)) ([0-9A-Z]+) "([^"]+)"\s*(\((\w+)\))?/;
        const options = lines.map(l => l.match(reg)).filter(x => x !== null).map(m => {
            const ps = m[3].split(':');
            const teams = readOrganizationUnits(m[3]);
            return teams.map(fv => {
                return {
                    idx: m[1].substr(0, m[1].length - 1),
                    hash: m[2],
                    kind: ps[0],
                    displayValue: ps[1].trim(), // 较短的格式. 也可以用于显示到列表, 相比 fullValue 缺少 kind 字段.
                    outputValue: fv, // 写入到 cfg.cmake DEVELOPMENT_TEAM 字段的内容
                    fullValue: m[3].replace(/\(\w+\)/, `(TEAM:${fv})`), // 完整格式, 显示到选择列表
                    errorState: m[5],
                };
            });
        });
        const list = [];
        flatArray(options, list);
        return list.filter(x => x.outputValue.length > 0);
    }
    catch (e) {
        console.warn('ios:' + 'i18n:ios.tips.targetVersionErrorWithTaskFlow');
        console.warn(e);
        return [];
    }
}
function verificationFunc(key, value, options) {
    const res = {
        error: '',
        newValue: value,
        level: 'error',
    };
    switch (key) {
        case 'targetVersion':
            {
                let minVersion = '11.0';
                // 2~3 位，x.x(.x) 的形式，每位 x 的范围分别为 1-99, 0-99, 0-99。
                if (!/^([1-9]\d|[1-9])(\.([1-9]\d|\d)){1,2}$/.test(value)) {
                    res.error = 'i18n:ios.tips.version_style_error';
                    return res;
                }
                if (options.packages.native.JobSystem === 'taskFlow') {
                    minVersion = '12.0';
                    if (!compareVersion(value, minVersion)) {
                        res.error = 'i18n:ios.tips.targetVersionErrorWithTaskFlow';
                        res.newValue = minVersion;
                    }
                }
                if (!res.error && !compareVersion(value, minVersion)) {
                    res.error = 'i18n:ios.tips.targetVersionError';
                    res.newValue = minVersion;
                }
            }
            break;
        case 'orientation':
            if (!value) {
                res.error = 'i18n:ios.tips.not_empty';
                return res;
            }
            if (Object.keys(value).every((key) => !value[key])) {
                res.error = 'i18n:ios.tips.at_least_one';
                return res;
            }
            break;
        case 'osTarget':
            if (!value) {
                res.error = 'i18n:ios.tips.not_empty';
                return res;
            }
            if (Object.keys(value).every((key) => !value[key])) {
                res.error = 'i18n:ios.tips.at_least_one';
                return res;
            }
            break;
        case 'packageName':
            if (!value) {
                res.error = 'i18n:ios.tips.not_empty';
                return res;
            }
            if (!checkPackageNameValidity(value)) {
                res.error = 'i18n:ios.tips.packageNameRuleMessage';
                return res;
            }
            break;
        default:
            break;
    }
    return res;
}
/**
 * return result of versionMax > versionMin
 * @param versionOne
 * @param versionTwo
 * @param split
 */
function compareVersion(versionMax, versionMin, split = '.') {
    if (typeof versionMax !== 'string' || typeof versionMin !== 'string') {
        return true;
    }
    const padNum = Math.max(versionMax.length, versionMin.length);
    versionMax = versionMax.replace(split, '').padStart(padNum, '0');
    versionMin = versionMin.replace(split, '').padStart(padNum, '0');
    return Number(versionMax) > Number(versionMin) || Number(versionMax) === Number(versionMin);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvY29yZS9idWlsZGVyL3BsYXRmb3Jtcy9pb3MvdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOztBQWNiLDhDQXdEQztBQU1ELDREQUlDO0FBRUQsMERBS0M7QUFNRCw4Q0FFQztBQUVELGdEQXFCQztBQUVELGtEQWlCQztBQThCRCw0Q0E0QkM7QUFFRCw0Q0E2REM7QUFRRCx3Q0FRQztBQWhSRCwrQkFBdUM7QUFDdkMsdUNBQTZFO0FBQzdFLGlEQUF5QztBQUt6Qzs7OztHQUlHO0FBQ0ksS0FBSyxVQUFVLGlCQUFpQixDQUFDLFdBQW1CLEVBQUUsV0FBbUI7SUFDNUUsTUFBTSxlQUFlLEdBQUcsSUFBQSxXQUFJLEVBQUMsV0FBVyxFQUFFLHFCQUFxQixDQUFDLENBQUM7SUFDakUsSUFBSSxDQUFDLElBQUEscUJBQVUsRUFBQyxlQUFlLENBQUMsRUFBRSxDQUFDO1FBQy9CLE9BQU8sQ0FBQyxLQUFLLENBQUMsNEJBQTRCLGVBQWUsR0FBRyxDQUFDLENBQUM7UUFDOUQsT0FBTztJQUNYLENBQUM7SUFDRCxNQUFNLElBQUksR0FBRyxNQUFNLElBQUEsbUJBQVEsRUFBQyxlQUFlLENBQUMsQ0FBQztJQUM3QyxXQUFXLEdBQUcsV0FBVyxJQUFJLElBQUksQ0FBQyxXQUFXLENBQUM7SUFFOUMsSUFBSSxDQUFDLHdCQUF3QixDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUM7UUFDekMsT0FBTyxDQUFDLEtBQUssQ0FBQyxtR0FBbUcsQ0FBQyxDQUFDO1FBQ25ILGdEQUFnRDtRQUNoRCxPQUFPO0lBQ1gsQ0FBQztJQUVELElBQUksZUFBZSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7SUFDdkMsSUFBSSxJQUFJLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDbkMsZUFBZSxHQUFHLElBQUks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QUFNLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDaEcsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcclxuXHJcbmltcG9ydCB7IGpvaW4sIG5vcm1hbGl6ZSB9IGZyb20gJ3BhdGgnO1xyXG5pbXBvcnQgeyBleGlzdHNTeW5jLCByZWFkRmlsZSwgd3JpdGVGaWxlLCByZWFkSlNPTiwgcmVuYW1lIH0gZnJvbSAnZnMtZXh0cmEnO1xyXG5pbXBvcnQgeyBleGVjU3luYyB9IGZyb20gJ2NoaWxkX3Byb2Nlc3MnO1xyXG5pbXBvcnQgeyBJVGFza09wdGlvbiB9IGZyb20gJy4uL25hdGl2ZS1jb21tb24vdHlwZSc7XHJcbmltcG9ydCB7IElPcHRpb25zIH0gZnJvbSAnLi90eXBlJ1xyXG5pbXBvcnQgeyBCdWlsZENoZWNrUmVzdWx0IH0gZnJvbSAnLi4vLi4vQHR5cGVzL3Byb3RlY3RlZCc7XHJcblxyXG4vKipcclxuICog5L+u5pS5IGlvcyDnmoTljIXlkI1cclxuICogQHBhcmFtIHByb2plY3RQYXRoIFxyXG4gKiBAcGFyYW0gcGFja2FnZU5hbWUgXHJcbiAqL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY2hhbmdlUGFja2FnZU5hbWUocHJvamVjdFBhdGg6IHN0cmluZywgcGFja2FnZU5hbWU6IHN0cmluZykge1xyXG4gICAgY29uc3QgcHJvamVjdEpTT05QYXRoID0gam9pbihwcm9qZWN0UGF0aCwgJy5jb2Nvcy1wcm9qZWN0Lmpzb24nKTtcclxuICAgIGlmICghZXhpc3RzU3luYyhwcm9qZWN0SlNPTlBhdGgpKSB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcihgQ2FuJ3QgZmluZCBwcm9qZWN0IGpzb24gWyR7cHJvamVjdEpTT05QYXRofV1gKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBjb25zdCBqc29uID0gYXdhaXQgcmVhZEpTT04ocHJvamVjdEpTT05QYXRoKTtcclxuICAgIHBhY2thZ2VOYW1lID0gcGFja2FnZU5hbWUgfHwganNvbi5wYWNrYWdlTmFtZTtcclxuXHJcbiAgICBpZiAoIWNoZWNrUGFja2FnZU5hbWVWYWxpZGl0eShwYWNrYWdlTmFtZSkpIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKCdUaGUgcGFja2FnZSBuYW1lIGlzIGlsbGVnYWwoaU9TKS4gSXQgY2FuIG9ubHkgY29udGFpbiB0aGVzZSBjaGFyYWN0ZXJzOiBbMC05XSwgW2Etel0sIFtBLVpdLCBbX10uJyk7XHJcbiAgICAgICAgLy8gcGFja2FnZU5hbWUgPSBtb2RpZnlQYWNrYWdlTmFtZShwYWNrYWdlTmFtZSk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCBsYXN0UGFja2FnZU5hbWUgPSBqc29uLnBhY2thZ2VOYW1lO1xyXG4gICAgaWYgKGpzb24ubWFjICYmIGpzb24ubWFjLnBhY2thZ2VOYW1lKSB7XHJcbiAgICAgICAgbGFzdFBhY2thZ2VOYW1lID0ganNvbi5tYWMucGFja2FnZU5hbWU7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgcGFja2FnZU5hbWVDaGFuZ2VkID0gbGFzdFBhY2thZ2VOYW1lICE9PSBwYWNrYWdlTmFtZTtcclxuXHJcbiAgICBpZiAoIXBhY2thZ2VOYW1lQ2hhbmdlZCkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB0ZW1wbGF0ZUpzb25QYXRoID0gam9pbihwcm9qZWN0UGF0aCwgJ2NvY29zLXByb2plY3QtdGVtcGxhdGUuanNvbicpO1xyXG4gICAgaWYgKCFleGlzdHNTeW5jKHRlbXBsYXRlSnNvblBhdGgpKSB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcihgQ2FuJ3QgZmluZCB0ZW1wbGF0ZSBqc29uIFske3RlbXBsYXRlSnNvblBhdGh9XWApO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGNvbnN0IHRlbXBsYXRlSnNvbiA9IGF3YWl0IHJlYWRKU09OKHRlbXBsYXRlSnNvblBhdGgpO1xyXG4gICAgY29uc3QgbmF0aXZlU3VwcG9ydCA9IHRlbXBsYXRlSnNvbi5kb19hZGRfbmF0aXZlX3N1cHBvcnQ7XHJcblxyXG4gICAgbGV0IGZpbGVzOiBzdHJpbmdbXTtcclxuXHJcbiAgICBpZiAocGFja2FnZU5hbWVDaGFuZ2VkKSB7XHJcbiAgICAgICAgZmlsZXMgPSBuYXRpdmVTdXBwb3J0LnByb2plY3RfcmVwbGFjZV9pb3NfYnVuZGxlaWQuZmlsZXM7XHJcbiAgICAgICAgZm9yIChjb25zdCBmaWxlIG9mIGZpbGVzKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHBhdGggPSBqb2luKHByb2plY3RQYXRoLCBmaWxlKTtcclxuICAgICAgICAgICAgaWYgKCFleGlzdHNTeW5jKHBhdGgpKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGBDYW4ndCBub3QgZmluZCBmaWxlIFske2ZpbGV9XSwgcmVwbGFjZSBwYWNrYWdlIG5hbWUgZmFpbGVkYCk7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IGNvbnRlbnQgPSBhd2FpdCByZWFkRmlsZShwYXRoLCAndXRmOCcpO1xyXG4gICAgICAgICAgICBjb250ZW50ID0gY29udGVudC5yZXBsYWNlKG5ldyBSZWdFeHAobGFzdFBhY2thZ2VOYW1lLCAnZ20nKSwgcGFja2FnZU5hbWUpO1xyXG4gICAgICAgICAgICBhd2FpdCB3cml0ZUZpbGUocGF0aCwgY29udGVudCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmICghanNvbi5pb3MpIHtcclxuICAgICAgICBqc29uLmlvcyA9IHt9O1xyXG4gICAgfVxyXG4gICAganNvbi5pb3MucGFja2FnZU5hbWUgPSBwYWNrYWdlTmFtZTtcclxuICAgIGF3YWl0IHdyaXRlRmlsZShwcm9qZWN0SlNPTlBhdGgsIEpTT04uc3RyaW5naWZ5KGpzb24sIG51bGwsIDIpKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIOajgOafpSBpb3Mg5YyF5ZCN55qE5ZCI5rOV5oCnXHJcbiAqIEBwYXJhbSBwYWNrYWdlTmFtZSBcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBjaGVja1BhY2thZ2VOYW1lVmFsaWRpdHkocGFja2FnZU5hbWU6IHN0cmluZykge1xyXG4gICAgLy8gb25seSBhbHBoYW51bWVyaWMgY2hhcmFjdGVycyAoQeKAk1osIGHigJN6LCBhbmQgMOKAkzkpLCBoeXBoZW5zICgtKSwgYW5kIHBlcmlvZHMgKC4pXHJcbiAgICAvLyByZWZlcjogaHR0cHM6Ly9kZXZlbG9wZXIuYXBwbGUuY29tL2RvY3VtZW50YXRpb24vYnVuZGxlcmVzb3VyY2VzL2luZm9ybWF0aW9uX3Byb3BlcnR5X2xpc3QvY2ZidW5kbGVpZGVudGlmaWVyXHJcbiAgICByZXR1cm4gL15bYS16QS1aXSsoW2EtekEtWjAtOS0uXSkrJC8udGVzdChwYWNrYWdlTmFtZSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBleGVjdXRhYmxlTmFtZU9yRGVmYXVsdChwcm9qZWN0TmFtZTogc3RyaW5nLCBleGVjdXRhYmxlTmFtZT86IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgICBpZiAoZXhlY3V0YWJsZU5hbWUpIHJldHVybiBleGVjdXRhYmxlTmFtZTtcclxuICAgIGlmICgvXlswLTlhLXpBLVpfLV0rJC8udGVzdChwcm9qZWN0TmFtZSkpIHJldHVybiBgJHtwcm9qZWN0TmFtZX0tbW9iaWxlYDtcclxuICAgIGNvbnNvbGUud2FybihgVGhlIHByb3ZpZGVkIHByb2plY3QgbmFtZSBcIiR7cHJvamVjdE5hbWV9XCIgaXMgbm90IHN1aXRhYmxlIGZvciB1c2UgYXMgYW4gZXhlY3V0YWJsZSBuYW1lLiAnQ29jb3NHYW1lJyBpcyBhcHBsaWVkIGluc3RlYWQuYCk7XHJcbiAgICByZXR1cm4gJ0NvY29zR2FtZSc7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDlsIbljIXlkI3lhoXkuI3lkIjms5XlrZfmrrXkv67mlLnmiJAgX1xyXG4gKiBAcGFyYW0gcGFja2FnZU5hbWUgXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gbW9kaWZ5UGFja2FnZU5hbWUocGFja2FnZU5hbWU6IHN0cmluZykge1xyXG4gICAgcmV0dXJuIHBhY2thZ2VOYW1lO1xyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gdXBkYXRlWGNvZGVwcm9qZWN0KHByb2plY3RQYXRoOiBzdHJpbmcsIG9wdGlvbnM6IElUYXNrT3B0aW9uKSB7XHJcbiAgICBjb25zdCByb290ID0gb3B0aW9ucy5lbmdpbmVJbmZvLm5hdGl2ZS5idWlsdGluO1xyXG4gICAgY29uc3QgdGVtcGxhdGUgPSAob3B0aW9ucyBhcyBhbnkpLnBhY2thZ2VzLm5hdGl2ZS50ZW1wbGF0ZTsgLy8gZGVmYXVsdCDvvZwgbGlua1xyXG4gICAgY29uc3QgeGNvZGVkaXIgPSBqb2luKHByb2plY3RQYXRoLCAnZnJhbWV3b3Jrcy9ydW50aW1lLXNyYy9wcm9qLmlvc19tYWMnLCBgJHtvcHRpb25zLm5hbWV9Lnhjb2RlcHJvamApO1xyXG5cclxuICAgIGlmICh0ZW1wbGF0ZSA9PT0gJ2xpbmsnICYmIGV4aXN0c1N5bmMoeGNvZGVkaXIpKSB7XHJcblxyXG4gICAgICAgIGNvbnN0IHByb2plY3RwYnggPSBqb2luKHhjb2RlZGlyLCAncHJvamVjdC5wYnhwcm9qJyk7XHJcbiAgICAgICAgLy8gcmVwbGFjZSBjb250ZW50XHJcbiAgICAgICAgbGV0IHR4dCA9IChhd2FpdCByZWFkRmlsZShwcm9qZWN0cGJ4KSkudG9TdHJpbmcoKTtcclxuICAgICAgICAvLyBUT0RPIOi/meS4qumAu+i+keW6lOivpeaUviBlbmdpbmUtbmF0aXZlIOS7k+W6k++8jOS4jeW6lOivpeWcqOe8lui+keWZqOmHjCBoYWNr77yM5ZCm5YiZ6ICm5ZCI5Lil6YeNXHJcbiAgICAgICAgdHh0ID0gdHh0LnJlcGxhY2UoL1xcL0FwcGxpY2F0aW9uc1xcL0NvY29zQ3JlYXRvci5hcHBcXC9Db250ZW50c1xcL1Jlc291cmNlc1xcL2NvY29zMmQteC9nLCBub3JtYWxpemUocm9vdCkpO1xyXG4gICAgICAgIGF3YWl0IHdyaXRlRmlsZShwcm9qZWN0cGJ4LCB0eHQpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHhjc2NoZW1lID0gam9pbih4Y29kZWRpciwgJ3hjc2hhcmVkZGF0YS94Y3NjaGVtZXMvSGVsbG9KYXZhc2NyaXB0LWNsaXAueGNzY2hlbWUnKTtcclxuICAgIGlmIChleGlzdHNTeW5jKHhjc2NoZW1lKSkge1xyXG4gICAgICAgIGxldCB0eHQgPSAoYXdhaXQgcmVhZEZpbGUoeGNzY2hlbWUpKS50b1N0cmluZygpO1xyXG4gICAgICAgIHR4dCA9IHR4dC5yZXBsYWNlKC9IZWxsb0phdmFzY3JpcHQvZywgb3B0aW9ucy5uYW1lKTtcclxuICAgICAgICBhd2FpdCB3cml0ZUZpbGUoeGNzY2hlbWUsIHR4dCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiByZW5hbWVYY29kZVJlc291cmNlKHByb2plY3RQYXRoOiBzdHJpbmcsIG9wdGlvbnM6IElUYXNrT3B0aW9uKSB7XHJcbiAgICBjb25zdCByZW5hbWVGaWxlcyA9IFtcclxuICAgICAgICBqb2luKHByb2plY3RQYXRoLCAnZnJhbWV3b3Jrcy9ydW50aW1lLXNyYy9wcm9qLmlvc19tYWMnLCBgJHtvcHRpb25zLm5hbWV9Lnhjb2RlcHJvai94Y3NoYXJlZGRhdGEveGNzY2hlbWVzL0hlbGxvSmF2YXNjcmlwdC1jbGlwLnhjc2NoZW1lYCksXHJcbiAgICAgICAgam9pbihwcm9qZWN0UGF0aCwgJ2ZyYW1ld29ya3MvcnVudGltZS1zcmMvcHJvai5pb3NfbWFjJywgYCR7b3B0aW9ucy5uYW1lfS54Y29kZXByb2oveGNzaGFyZWRkYXRhL3hjc2NoZW1lcy8ke29wdGlvbnMubmFtZX0tY2xpcC54Y3NjaGVtZWApLFxyXG4gICAgICAgIGpvaW4ocHJvamVjdFBhdGgsICdmcmFtZXdvcmtzL3J1bnRpbWUtc3JjL3Byb2ouaW9zX21hYycsICdpb3MvSGVsbG9KYXZhc2NyaXB0LW1vYmlsZVJlbGVhc2UuZW50aXRsZW1lbnRzJyksXHJcbiAgICAgICAgam9pbihwcm9qZWN0UGF0aCwgJ2ZyYW1ld29ya3MvcnVudGltZS1zcmMvcHJvai5pb3NfbWFjJywgYGlvcy8ke29wdGlvbnMubmFtZX0tbW9iaWxlUmVsZWFzZS5lbnRpdGxlbWVudHNgKSxcclxuICAgICAgICBqb2luKHByb2plY3RQYXRoLCAnZnJhbWV3b3Jrcy9ydW50aW1lLXNyYy9wcm9qLmlvc19tYWMnLCAnaW9zX2FwcGNsaXAvSGVsbG9KYXZhc2NyaXB0LmVudGl0bGVtZW50cycpLFxyXG4gICAgICAgIGpvaW4ocHJvamVjdFBhdGgsICdmcmFtZXdvcmtzL3J1bnRpbWUtc3JjL3Byb2ouaW9zX21hYycsIGBpb3NfYXBwY2xpcC8ke29wdGlvbnMubmFtZX0uZW50aXRsZW1lbnRzYCksXHJcbiAgICBdO1xyXG5cclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcmVuYW1lRmlsZXMubGVuZ3RoOyBpICs9IDIpIHtcclxuICAgICAgICBpZiAoZXhpc3RzU3luYyhyZW5hbWVGaWxlc1tpXSkpIHtcclxuICAgICAgICAgICAgYXdhaXQgcmVuYW1lKHJlbmFtZUZpbGVzW2ldLCByZW5hbWVGaWxlc1tpICsgMV0pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBub3RpY2U6IGZpbGUgJHtyZW5hbWVGaWxlc1tpXX0gbm90IGZvdW5kIWApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuZnVuY3Rpb24gZmxhdEFycmF5KHJlY0FycmF5OiBhbnksIG91dHB1dDogYW55W10pIHtcclxuICAgIGlmIChyZWNBcnJheSBpbnN0YW5jZW9mIEFycmF5KSB7XHJcbiAgICAgICAgZm9yIChjb25zdCBlIG9mIHJlY0FycmF5KSB7XHJcbiAgICAgICAgICAgIGZsYXRBcnJheShlLCBvdXRwdXQpO1xyXG4gICAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgb3V0cHV0LnB1c2gocmVjQXJyYXkpO1xyXG4gICAgfVxyXG5cclxufVxyXG5cclxuLyoqXHJcbiAqIOivu+WPluivgeS5puS4reeahCBPcmdhbml6YXRpb24gVW5pdCDlrZfmrrUsIOS9nOS4uiB0ZWFtIGlkIOS9v+eUqC4gXHJcbiAqIEBwYXJhbSBuYW1lIOivgeS5puWQjeensFxyXG4gKiBAcmV0dXJucyBcclxuICovXHJcbmZ1bmN0aW9uIHJlYWRPcmdhbml6YXRpb25Vbml0cyhuYW1lOiBzdHJpbmcpIHtcclxuICAgIGNvbnN0IHBlbSA9IGV4ZWNTeW5jKGB4Y3J1biBzZWN1cml0eSBmaW5kLWNlcnRpZmljYXRlIC1jIFwiJHtuYW1lfVwiIC1wYCwgeyBlbmNvZGluZzogJ3V0ZjgnIH0pO1xyXG4gICAgY29uc3QgdGV4dCA9IGV4ZWNTeW5jKCdvcGVuc3NsIHg1MDkgLWluZm9ybSBQRU0gLW5vb3V0IC10ZXh0JywgeyBpbnB1dDogcGVtLCBlbmNvZGluZzogJ3V0ZjgnIH0pO1xyXG4gICAgY29uc3QgcmVnID0gL09VXFxzKj1cXHMqKFxcdyspLC87XHJcbiAgICBjb25zdCBsaW5lcyA9IHRleHQuc3BsaXQoJ1xcbicpLmZpbHRlcih4ID0+IHgubWF0Y2goL15cXHMqU3ViamVjdDovKSkubWFwKHggPT4geC5tYXRjaChyZWcpKS5maWx0ZXIoeCA9PiB4ICE9PSBudWxsKS5tYXAobSA9PiBtIVsxXSk7XHJcbiAgICByZXR1cm4gbGluZXMubGVuZ3RoID09PSAwID8gW10gOiBsaW5lcztcclxufVxyXG5cclxuLyoqXHJcbiAqIOafpeivouWPr+eUqOeahCBERVZFTE9QTUVOVF9URUFNICBcclxuICogQHJldHVybnMg562+5ZCNW11cclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBmaW5kU2lnbklkZW50aWZ5KCkge1xyXG4gICAgdHJ5IHtcclxuICAgICAgICBjb25zdCBvdXRwdXQgPSBleGVjU3luYygneGNydW4gc2VjdXJpdHkgZmluZC1pZGVudGl0eSAtdiAtcCBjb2Rlc2lnbmluZycpLnRvU3RyaW5nKCd1dGY4Jyk7XHJcbiAgICAgICAgY29uc3QgbGluZXMgPSBvdXRwdXQuc3BsaXQoJ1xcbicpO1xyXG4gICAgICAgIGNvbnN0IHJlZyA9IC8oXFx3K1xcKSkgKFswLTlBLVpdKykgXCIoW15cIl0rKVwiXFxzKihcXCgoXFx3KylcXCkpPy87XHJcbiAgICAgICAgY29uc3Qgb3B0aW9ucyA9IGxpbmVzLm1hcChsID0+IGwubWF0Y2gocmVnKSkuZmlsdGVyKHggPT4geCAhPT0gbnVsbCkubWFwKG0gPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBwcyA9IG0hWzNdLnNwbGl0KCc6Jyk7XHJcbiAgICAgICAgICAgIGNvbnN0IHRlYW1zID0gcmVhZE9yZ2FuaXphdGlvblVuaXRzKG0hWzNdKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRlYW1zLm1hcChmdiA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlkeDogbSFbMV0uc3Vic3RyKDAsIG0hWzFdLmxlbmd0aCAtIDEpLFxyXG4gICAgICAgICAgICAgICAgICAgIGhhc2g6IG0hWzJdLFxyXG4gICAgICAgICAgICAgICAgICAgIGtpbmQ6IHBzWzBdLFxyXG4gICAgICAgICAgICAgICAgICAgIGRpc3BsYXlWYWx1ZTogcHNbMV0udHJpbSgpLCAvLyDovoPnn63nmoTmoLzlvI8uIOS5n+WPr+S7peeUqOS6juaYvuekuuWIsOWIl+ihqCwg55u45q+UIGZ1bGxWYWx1ZSDnvLrlsJEga2luZCDlrZfmrrUuXHJcbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0VmFsdWU6IGZ2LCAvLyDlhpnlhaXliLAgY2ZnLmNtYWtlIERFVkVMT1BNRU5UX1RFQU0g5a2X5q6155qE5YaF5a65XHJcbiAgICAgICAgICAgICAgICAgICAgZnVsbFZhbHVlOiBtIVszXS5yZXBsYWNlKC9cXChcXHcrXFwpLywgYChURUFNOiR7ZnZ9KWApLCAvLyDlrozmlbTmoLzlvI8sIOaYvuekuuWIsOmAieaLqeWIl+ihqFxyXG4gICAgICAgICAgICAgICAgICAgIGVycm9yU3RhdGU6IG0hWzVdLFxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgY29uc3QgbGlzdDogYW55W10gPSBbXTtcclxuICAgICAgICBmbGF0QXJyYXkob3B0aW9ucywgbGlzdCk7XHJcbiAgICAgICAgcmV0dXJuIGxpc3QuZmlsdGVyKHggPT4geC5vdXRwdXRWYWx1ZS5sZW5ndGggPiAwKTtcclxuICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICBjb25zb2xlLndhcm4oJ2lvczonICsgJ2kxOG46aW9zLnRpcHMudGFyZ2V0VmVyc2lvbkVycm9yV2l0aFRhc2tGbG93Jyk7XHJcbiAgICAgICAgY29uc29sZS53YXJuKGUpO1xyXG4gICAgICAgIHJldHVybiBbXTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHZlcmlmaWNhdGlvbkZ1bmMoa2V5OiBrZXlvZiBJT3B0aW9ucywgdmFsdWU6IGFueSwgb3B0aW9uczogSVRhc2tPcHRpb24pOiBCdWlsZENoZWNrUmVzdWx0IHtcclxuICAgIGNvbnN0IHJlczogQnVpbGRDaGVja1Jlc3VsdCA9IHtcclxuICAgICAgICBlcnJvcjogJycsXHJcbiAgICAgICAgbmV3VmFsdWU6IHZhbHVlLFxyXG4gICAgICAgIGxldmVsOiAnZXJyb3InLFxyXG4gICAgfTtcclxuICAgIHN3aXRjaCAoa2V5KSB7XHJcbiAgICAgICAgY2FzZSAndGFyZ2V0VmVyc2lvbic6IHtcclxuICAgICAgICAgICAgbGV0IG1pblZlcnNpb24gPSAnMTEuMCc7XHJcbiAgICAgICAgICAgIC8vIDJ+MyDkvY3vvIx4LngoLngpIOeahOW9ouW8j++8jOavj+S9jSB4IOeahOiMg+WbtOWIhuWIq+S4uiAxLTk5LCAwLTk5LCAwLTk544CCXHJcbiAgICAgICAgICAgIGlmICghL14oWzEtOV1cXGR8WzEtOV0pKFxcLihbMS05XVxcZHxcXGQpKXsxLDJ9JC8udGVzdCh2YWx1ZSkpIHtcclxuICAgICAgICAgICAgICAgIHJlcy5lcnJvciA9ICdpMThuOmlvcy50aXBzLnZlcnNpb25fc3R5bGVfZXJyb3InO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlcztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAob3B0aW9ucy5wYWNrYWdlcy5uYXRpdmUuSm9iU3lzdGVtID09PSAndGFza0Zsb3cnKSB7XHJcbiAgICAgICAgICAgICAgICBtaW5WZXJzaW9uID0gJzEyLjAnO1xyXG4gICAgICAgICAgICAgICAgaWYgKCFjb21wYXJlVmVyc2lvbih2YWx1ZSwgbWluVmVyc2lvbikpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXMuZXJyb3IgPSAnaTE4bjppb3MudGlwcy50YXJnZXRWZXJzaW9uRXJyb3JXaXRoVGFza0Zsb3cnO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlcy5uZXdWYWx1ZSA9IG1pblZlcnNpb247XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCFyZXMuZXJyb3IgJiYgIWNvbXBhcmVWZXJzaW9uKHZhbHVlLCBtaW5WZXJzaW9uKSkge1xyXG4gICAgICAgICAgICAgICAgcmVzLmVycm9yID0gJ2kxOG46aW9zLnRpcHMudGFyZ2V0VmVyc2lvbkVycm9yJztcclxuICAgICAgICAgICAgICAgIHJlcy5uZXdWYWx1ZSA9IG1pblZlcnNpb247XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgJ29yaWVudGF0aW9uJzpcclxuICAgICAgICAgICAgaWYgKCF2YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgcmVzLmVycm9yID0gJ2kxOG46aW9zLnRpcHMubm90X2VtcHR5JztcclxuICAgICAgICAgICAgICAgIHJldHVybiByZXM7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzKHZhbHVlKS5ldmVyeSgoa2V5KSA9PiAhdmFsdWVba2V5XSkpIHtcclxuICAgICAgICAgICAgICAgIHJlcy5lcnJvciA9ICdpMThuOmlvcy50aXBzLmF0X2xlYXN0X29uZSc7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgJ29zVGFyZ2V0JzpcclxuICAgICAgICAgICAgaWYgKCF2YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgcmVzLmVycm9yID0gJ2kxOG46aW9zLnRpcHMubm90X2VtcHR5JztcclxuICAgICAgICAgICAgICAgIHJldHVybiByZXM7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzKHZhbHVlKS5ldmVyeSgoa2V5KSA9PiAhdmFsdWVba2V5XSkpIHtcclxuICAgICAgICAgICAgICAgIHJlcy5lcnJvciA9ICdpMThuOmlvcy50aXBzLmF0X2xlYXN0X29uZSc7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgJ3BhY2thZ2VOYW1lJzpcclxuICAgICAgICAgICAgaWYgKCF2YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgcmVzLmVycm9yID0gJ2kxOG46aW9zLnRpcHMubm90X2VtcHR5JztcclxuICAgICAgICAgICAgICAgIHJldHVybiByZXM7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCFjaGVja1BhY2thZ2VOYW1lVmFsaWRpdHkodmFsdWUpKSB7XHJcbiAgICAgICAgICAgICAgICByZXMuZXJyb3IgPSAnaTE4bjppb3MudGlwcy5wYWNrYWdlTmFtZVJ1bGVNZXNzYWdlJztcclxuICAgICAgICAgICAgICAgIHJldHVybiByZXM7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmVzO1xyXG59XHJcblxyXG4vKipcclxuICogcmV0dXJuIHJlc3VsdCBvZiB2ZXJzaW9uTWF4ID4gdmVyc2lvbk1pblxyXG4gKiBAcGFyYW0gdmVyc2lvbk9uZVxyXG4gKiBAcGFyYW0gdmVyc2lvblR3b1xyXG4gKiBAcGFyYW0gc3BsaXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBjb21wYXJlVmVyc2lvbih2ZXJzaW9uTWF4OiBzdHJpbmcsIHZlcnNpb25NaW46IHN0cmluZywgc3BsaXQgPSAnLicpIHtcclxuICAgIGlmICh0eXBlb2YgdmVyc2lvbk1heCAhPT0gJ3N0cmluZycgfHwgdHlwZW9mIHZlcnNpb25NaW4gIT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgICBjb25zdCBwYWROdW0gPSBNYXRoLm1heCh2ZXJzaW9uTWF4Lmxlbmd0aCwgdmVyc2lvbk1pbi5sZW5ndGgpO1xyXG4gICAgdmVyc2lvbk1heCA9IHZlcnNpb25NYXgucmVwbGFjZShzcGxpdCwgJycpLnBhZFN0YXJ0KHBhZE51bSwgJzAnKTtcclxuICAgIHZlcnNpb25NaW4gPSB2ZXJzaW9uTWluLnJlcGxhY2Uoc3BsaXQsICcnKS5wYWRTdGFydChwYWROdW0sICcwJyk7XHJcbiAgICByZXR1cm4gTnVtYmVyKHZlcnNpb25NYXgpID4gTnVtYmVyKHZlcnNpb25NaW4pIHx8IE51bWJlcih2ZXJzaW9uTWF4KSA9PT0gTnVtYmVyKHZlcnNpb25NaW4pO1xyXG59Il19