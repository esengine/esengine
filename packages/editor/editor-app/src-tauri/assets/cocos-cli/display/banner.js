"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBanner = createBanner;
exports.createSimpleBanner = createSimpleBanner;
exports.createMinimalBanner = createMinimalBanner;
exports.createWelcomeMessage = createWelcomeMessage;
exports.createStartupMessage = createStartupMessage;
exports.createStatusBar = createStatusBar;
const figlet_1 = __importDefault(require("figlet"));
const gradient_string_1 = __importDefault(require("gradient-string"));
const chalk_1 = __importDefault(require("chalk"));
/**
 * 创建现代风格的 banner（参考 Gemini CLI 设计）
 */
function createBanner() {
    // 使用像素化风格的字体
    const asciiArt = figlet_1.default.textSync('Cocos CLI', {
        font: 'ANSI Shadow',
        horizontalLayout: 'fitted',
        verticalLayout: 'default',
        width: 100,
        whitespaceBreak: true
    });
    // 创建蓝色到紫色的渐变效果（类似 Gemini CLI）
    const gradientText = (0, gradient_string_1.default)(['#00BFFF', '#4169E1', '#8A2BE2', '#FF1493']).multiline(asciiArt);
    // 版本信息
    const version = chalk_1.default.gray('v1.0.0-alpha.2');
    const description = chalk_1.default.blue('🚀 专为 Cocos Engine 开发设计的强大命令行界面工具');
    // 添加像素化装饰元素
    const pixelDots = chalk_1.default.blue('█'.repeat(15)) + chalk_1.default.magenta('█'.repeat(15));
    return `
${gradientText}
${pixelDots}
${chalk_1.default.gray('─'.repeat(80))}
${description}
${chalk_1.default.gray('─'.repeat(80))}
${version}
`;
}
/**
 * 创建简洁的 banner（类似 Gemini CLI 风格）
 */
function createSimpleBanner() {
    // 使用像素化风格的字体
    const asciiArt = figlet_1.default.textSync('Cocos CLI', {
        font: 'ANSI Shadow',
        horizontalLayout: 'fitted',
        verticalLayout: 'default',
        width: 80,
        whitespaceBreak: true
    });
    // 蓝色到紫色的渐变
    const gradientText = (0, gradient_string_1.default)(['#00BFFF', '#4169E1', '#8A2BE2']).multiline(asciiArt);
    const version = chalk_1.default.gray('v1.0.0-alpha.2');
    const description = chalk_1.default.blue('🚀 专为 Cocos Engine 开发设计的强大命令行界面工具');
    // 像素化装饰
    const pixelDots = chalk_1.default.blue('█'.repeat(10)) + chalk_1.default.magenta('█'.repeat(10));
    return `
${gradientText}
${pixelDots}
${chalk_1.default.gray('─'.repeat(60))}
${description}
${chalk_1.default.gray('─'.repeat(60))}
${version}
`;
}
/**
 * 创建极简 banner（适合小屏幕）
 */
function createMinimalBanner() {
    // 使用小一点的像素化字体
    const asciiArt = figlet_1.default.textSync('Cocos CLI', {
        font: 'ANSI Shadow',
        horizontalLayout: 'fitted',
        verticalLayout: 'default',
        width: 60,
        whitespaceBreak: true
    });
    const gradientText = (0, gradient_string_1.default)(['#00BFFF', '#8A2BE2']).multiline(asciiArt);
    const version = chalk_1.default.gray('v1.0.0-alpha.2');
    const description = chalk_1.default.blue('🚀 专为 Cocos Engine 开发设计的强大命令行界面工具');
    return `
${gradientText}
${chalk_1.default.blue('█'.repeat(8))}${chalk_1.default.magenta('█'.repeat(8))}
${chalk_1.default.gray('─'.repeat(40))}
${description}
${chalk_1.default.gray('─'.repeat(40))}
${version}
`;
}
/**
 * 创建欢迎消息
 */
function createWelcomeMessage() {
    return chalk_1.default.cyan(`
🎉 欢迎使用 Cocos CLI！
📖 输入 'cocos --help' 查看可用命令
🚀 输入 'cocos <command> --help' 查看具体命令帮助
`);
}
/**
 * 创建启动消息（类似 Gemini CLI）
 */
function createStartupMessage() {
    // 使用像素化风格的字体
    const asciiArt = figlet_1.default.textSync('Cocos CLI', {
        font: 'ANSI Shadow',
        horizontalLayout: 'fitted',
        verticalLayout: 'default',
        width: 90,
        whitespaceBreak: true
    });
    // 蓝色到紫色的渐变
    const gradientText = (0, gradient_string_1.default)(['#00BFFF', '#4169E1', '#8A2BE2', '#FF1493']).multiline(asciiArt);
    const version = chalk_1.default.gray('v1.0.0-alpha.2');
    const description = chalk_1.default.cyan('🚀 专为 Cocos Engine 开发设计的强大命令行界面工具');
    // 像素化装饰
    const pixelDots = chalk_1.default.blue('█'.repeat(12)) + chalk_1.default.magenta('█'.repeat(12));
    // 提示信息
    const tips = [
        '🏗️ 构建项目：cocos build --project <path>',
        '📂 创建项目：cocos create --project <path>',
        'ℹ️ 查看信息：cocos info --project <path>',
        '❓ 获取帮助：cocos --help'
    ];
    return `
${gradientText}
${pixelDots}
${chalk_1.default.gray('─'.repeat(70))}
${description}
${chalk_1.default.gray('─'.repeat(70))}
${chalk_1.default.cyan('✨ 准备就绪！选择以下操作开始使用：')}
${chalk_1.default.gray('─'.repeat(70))}
${tips.map(tip => chalk_1.default.white(tip)).join('\n')}
${chalk_1.default.gray('─'.repeat(70))}
${version}
`;
}
/**
 * 创建状态栏（类似 Gemini CLI 底部状态栏）
 */
function createStatusBar(projectPath, mode = 'interactive') {
    const currentDir = projectPath || process.cwd();
    const dirName = currentDir.split('/').pop() || 'cocos-cli';
    const modeText = mode === 'interactive' ? 'interactive' : 'non-interactive';
    return `
${chalk_1.default.gray('─'.repeat(70))}
${chalk_1.default.white(`~/code/${dirName}`)} ${chalk_1.default.gray('(' + modeText + ')')} ${chalk_1.default.gray('cocos-cli v1.0.0-alpha.2')}
`;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFubmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2Rpc3BsYXkvYmFubmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBT0Esb0NBNEJDO0FBS0QsZ0RBMEJDO0FBS0Qsa0RBc0JDO0FBS0Qsb0RBTUM7QUFLRCxvREFzQ0M7QUFLRCwwQ0FTQztBQWpLRCxvREFBNEI7QUFDNUIsc0VBQXVDO0FBQ3ZDLGtEQUEwQjtBQUUxQjs7R0FFRztBQUNILFNBQWdCLFlBQVk7SUFDeEIsYUFBYTtJQUNiLE1BQU0sUUFBUSxHQUFHLGdCQUFNLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRTtRQUMxQyxJQUFJLEVBQUUsYUFBYTtRQUNuQixnQkFBZ0IsRUFBRSxRQUFRO1FBQzFCLGNBQWMsRUFBRSxTQUFTO1FBQ3pCLEtBQUssRUFBRSxHQUFHO1FBQ1YsZUFBZSxFQUFFLElBQUk7S0FDeEIsQ0FBQyxDQUFDO0lBRUgsOEJBQThCO0lBQzlCLE1BQU0sWUFBWSxHQUFHLElBQUEseUJBQVEsRUFBQyxDQUFDLFNBQVMsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBRWhHLE9BQU87SUFDUCxNQUFNLE9BQU8sR0FBRyxlQUFLLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7SUFDN0MsTUFBTSxXQUFXLEdBQUcsZUFBSyxDQUFDLElBQUksQ0FBQyxtQ0FBbUMsQ0FBQyxDQUFDO0lBRXBFLFlBQVk7SUFDWixNQUFNLFNBQVMsR0FBRyxlQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxlQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUU3RSxPQUFPO0VBQ1QsWUFBWTtFQUNaLFNBQVM7RUFDVCxlQUFLLENBQUMsSUFBSSxDQUFD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QUFDO0VBQzFCLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxlQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztFQUM1QyxlQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7RUFDMUIsT0FBTztDQUNSLENBQUM7QUFDRixDQUFDO0FBRUQ7O0dBRUc7QUFDSCxTQUFnQixlQUFlLENBQUMsV0FBb0IsRUFBRSxPQUFlLGFBQWE7SUFDOUUsTUFBTSxVQUFVLEdBQUcsV0FBVyxJQUFJLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQztJQUNoRCxNQUFNLE9BQU8sR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxJQUFJLFdBQVcsQ0FBQztJQUMzRCxNQUFNLFFBQVEsR0FBRyxJQUFJLEtBQUssYUFBYSxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLGlCQUFpQixDQUFDO0lBRTVFLE9BQU87RUFDVCxlQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7RUFDMUIsZUFBSyxDQUFDLEtBQUssQ0FBQyxVQUFVLE9BQU8sRUFBRSxDQUFDLElBQUksZUFBSyxDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsUUFBUSxHQUFHLEdBQUcsQ0FBQyxJQUFJLGVBQUssQ0FBQyxJQUFJLENBQUMsMEJBQTBCLENBQUM7Q0FDL0csQ0FBQztBQUNGLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgZmlnbGV0IGZyb20gJ2ZpZ2xldCc7XHJcbmltcG9ydCBncmFkaWVudCBmcm9tICdncmFkaWVudC1zdHJpbmcnO1xyXG5pbXBvcnQgY2hhbGsgZnJvbSAnY2hhbGsnO1xyXG5cclxuLyoqXHJcbiAqIOWIm+W7uueOsOS7o+mjjuagvOeahCBiYW5uZXLvvIjlj4LogIMgR2VtaW5pIENMSSDorr7orqHvvIlcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVCYW5uZXIoKTogc3RyaW5nIHtcclxuICAgIC8vIOS9v+eUqOWDj+e0oOWMlumjjuagvOeahOWtl+S9k1xyXG4gICAgY29uc3QgYXNjaWlBcnQgPSBmaWdsZXQudGV4dFN5bmMoJ0NvY29zIENMSScsIHtcclxuICAgICAgICBmb250OiAnQU5TSSBTaGFkb3cnLFxyXG4gICAgICAgIGhvcml6b250YWxMYXlvdXQ6ICdmaXR0ZWQnLFxyXG4gICAgICAgIHZlcnRpY2FsTGF5b3V0OiAnZGVmYXVsdCcsXHJcbiAgICAgICAgd2lkdGg6IDEwMCxcclxuICAgICAgICB3aGl0ZXNwYWNlQnJlYWs6IHRydWVcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIOWIm+W7uuiTneiJsuWIsOe0q+iJsueahOa4kOWPmOaViOaenO+8iOexu+S8vCBHZW1pbmkgQ0xJ77yJXHJcbiAgICBjb25zdCBncmFkaWVudFRleHQgPSBncmFkaWVudChbJyMwMEJGRkYnLCAnIzQxNjlFMScsICcjOEEyQkUyJywgJyNGRjE0OTMnXSkubXVsdGlsaW5lKGFzY2lpQXJ0KTtcclxuXHJcbiAgICAvLyDniYjmnKzkv6Hmga9cclxuICAgIGNvbnN0IHZlcnNpb24gPSBjaGFsay5ncmF5KCd2MS4wLjAtYWxwaGEuMicpO1xyXG4gICAgY29uc3QgZGVzY3JpcHRpb24gPSBjaGFsay5ibHVlKCfwn5qAIOS4k+S4uiBDb2NvcyBFbmdpbmUg5byA5Y+R6K6+6K6h55qE5by65aSn5ZG95Luk6KGM55WM6Z2i5bel5YW3Jyk7XHJcblxyXG4gICAgLy8g5re75Yqg5YOP57Sg5YyW6KOF6aWw5YWD57SgXHJcbiAgICBjb25zdCBwaXhlbERvdHMgPSBjaGFsay5ibHVlKCfilognLnJlcGVhdCgxNSkpICsgY2hhbGsubWFnZW50YSgn4paIJy5yZXBlYXQoMTUpKTtcclxuXHJcbiAgICByZXR1cm4gYFxyXG4ke2dyYWRpZW50VGV4dH1cclxuJHtwaXhlbERvdHN9XHJcbiR7Y2hhbGsuZ3JheSgn4pSAJy5yZXBlYXQoODApKX1cclxuJHtkZXNjcmlwdGlvbn1cclxuJHtjaGFsay5ncmF5KCfilIAnLnJlcGVhdCg4MCkpfVxyXG4ke3ZlcnNpb259XHJcbmA7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDliJvlu7rnroDmtIHnmoQgYmFubmVy77yI57G75Ly8IEdlbWluaSBDTEkg6aOO5qC877yJXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlU2ltcGxlQmFubmVyKCk6IHN0cmluZyB7XHJcbiAgICAvLyDkvb/nlKjlg4/ntKDljJbpo47moLznmoTlrZfkvZNcclxuICAgIGNvbnN0IGFzY2lpQXJ0ID0gZmlnbGV0LnRleHRTeW5jKCdDb2NvcyBDTEknLCB7XHJcbiAgICAgICAgZm9udDogJ0FOU0kgU2hhZG93JyxcclxuICAgICAgICBob3Jpem9udGFsTGF5b3V0OiAnZml0dGVkJyxcclxuICAgICAgICB2ZXJ0aWNhbExheW91dDogJ2RlZmF1bHQnLFxyXG4gICAgICAgIHdpZHRoOiA4MCxcclxuICAgICAgICB3aGl0ZXNwYWNlQnJlYWs6IHRydWVcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIOiTneiJsuWIsOe0q+iJsueahOa4kOWPmFxyXG4gICAgY29uc3QgZ3JhZGllbnRUZXh0ID0gZ3JhZGllbnQoWycjMDBCRkZGJywgJyM0MTY5RTEnLCAnIzhBMkJFMiddKS5tdWx0aWxpbmUoYXNjaWlBcnQpO1xyXG4gICAgY29uc3QgdmVyc2lvbiA9IGNoYWxrLmdyYXkoJ3YxLjAuMC1hbHBoYS4yJyk7XHJcbiAgICBjb25zdCBkZXNjcmlwdGlvbiA9IGNoYWxrLmJsdWUoJ/CfmoAg5LiT5Li6IENvY29zIEVuZ2luZSDlvIDlj5Horr7orqHnmoTlvLrlpKflkb3ku6TooYznlYzpnaLlt6XlhbcnKTtcclxuXHJcbiAgICAvLyDlg4/ntKDljJboo4XppbBcclxuICAgIGNvbnN0IHBpeGVsRG90cyA9IGNoYWxrLmJsdWUoJ+KWiCcucmVwZWF0KDEwKSkgKyBjaGFsay5tYWdlbnRhKCfilognLnJlcGVhdCgxMCkpO1xyXG5cclxuICAgIHJldHVybiBgXHJcbiR7Z3JhZGllbnRUZXh0fVxyXG4ke3BpeGVsRG90c31cclxuJHtjaGFsay5ncmF5KCfilIAnLnJlcGVhdCg2MCkpfVxyXG4ke2Rlc2NyaXB0aW9ufVxyXG4ke2NoYWxrLmdyYXkoJ+KUgCcucmVwZWF0KDYwKSl9XHJcbiR7dmVyc2lvbn1cclxuYDtcclxufVxyXG5cclxuLyoqXHJcbiAqIOWIm+W7uuaegeeugCBiYW5uZXLvvIjpgILlkIjlsI/lsY/luZXvvIlcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVNaW5pbWFsQmFubmVyKCk6IHN0cmluZyB7XHJcbiAgICAvLyDkvb/nlKjlsI/kuIDngrnnmoTlg4/ntKDljJblrZfkvZNcclxuICAgIGNvbnN0IGFzY2lpQXJ0ID0gZmlnbGV0LnRleHRTeW5jKCdDb2NvcyBDTEknLCB7XHJcbiAgICAgICAgZm9udDogJ0FOU0kgU2hhZG93JyxcclxuICAgICAgICBob3Jpem9udGFsTGF5b3V0OiAnZml0dGVkJyxcclxuICAgICAgICB2ZXJ0aWNhbExheW91dDogJ2RlZmF1bHQnLFxyXG4gICAgICAgIHdpZHRoOiA2MCxcclxuICAgICAgICB3aGl0ZXNwYWNlQnJlYWs6IHRydWVcclxuICAgIH0pO1xyXG5cclxuICAgIGNvbnN0IGdyYWRpZW50VGV4dCA9IGdyYWRpZW50KFsnIzAwQkZGRicsICcjOEEyQkUyJ10pLm11bHRpbGluZShhc2NpaUFydCk7XHJcbiAgICBjb25zdCB2ZXJzaW9uID0gY2hhbGsuZ3JheSgndjEuMC4wLWFscGhhLjInKTtcclxuICAgIGNvbnN0IGRlc2NyaXB0aW9uID0gY2hhbGsuYmx1ZSgn8J+agCDkuJPkuLogQ29jb3MgRW5naW5lIOW8gOWPkeiuvuiuoeeahOW8uuWkp+WRveS7pOihjOeVjOmdouW3peWFtycpO1xyXG5cclxuICAgIHJldHVybiBgXHJcbiR7Z3JhZGllbnRUZXh0fVxyXG4ke2NoYWxrLmJsdWUoJ+KWiCcucmVwZWF0KDgpKX0ke2NoYWxrLm1hZ2VudGEoJ+KWiCcucmVwZWF0KDgpKX1cclxuJHtjaGFsay5ncmF5KCfilIAnLnJlcGVhdCg0MCkpfVxyXG4ke2Rlc2NyaXB0aW9ufVxyXG4ke2NoYWxrLmdyYXkoJ+KUgCcucmVwZWF0KDQwKSl9XHJcbiR7dmVyc2lvbn1cclxuYDtcclxufVxyXG5cclxuLyoqXHJcbiAqIOWIm+W7uuasoui/jua2iOaBr1xyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVdlbGNvbWVNZXNzYWdlKCk6IHN0cmluZyB7XHJcbiAgICByZXR1cm4gY2hhbGsuY3lhbihgXHJcbvCfjokg5qyi6L+O5L2/55SoIENvY29zIENMSe+8gVxyXG7wn5OWIOi+k+WFpSAnY29jb3MgLS1oZWxwJyDmn6XnnIvlj6/nlKjlkb3ku6Rcclxu8J+agCDovpPlhaUgJ2NvY29zIDxjb21tYW5kPiAtLWhlbHAnIOafpeeci+WFt+S9k+WRveS7pOW4ruWKqVxyXG5gKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIOWIm+W7uuWQr+WKqOa2iOaBr++8iOexu+S8vCBHZW1pbmkgQ0xJ77yJXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlU3RhcnR1cE1lc3NhZ2UoKTogc3RyaW5nIHtcclxuICAgIC8vIOS9v+eUqOWDj+e0oOWMlumjjuagvOeahOWtl+S9k1xyXG4gICAgY29uc3QgYXNjaWlBcnQgPSBmaWdsZXQudGV4dFN5bmMoJ0NvY29zIENMSScsIHtcclxuICAgICAgICBmb250OiAnQU5TSSBTaGFkb3cnLFxyXG4gICAgICAgIGhvcml6b250YWxMYXlvdXQ6ICdmaXR0ZWQnLFxyXG4gICAgICAgIHZlcnRpY2FsTGF5b3V0OiAnZGVmYXVsdCcsXHJcbiAgICAgICAgd2lkdGg6IDkwLFxyXG4gICAgICAgIHdoaXRlc3BhY2VCcmVhazogdHJ1ZVxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8g6JOd6Imy5Yiw57Sr6Imy55qE5riQ5Y+YXHJcbiAgICBjb25zdCBncmFkaWVudFRleHQgPSBncmFkaWVudChbJyMwMEJGRkYnLCAnIzQxNjlFMScsICcjOEEyQkUyJywgJyNGRjE0OTMnXSkubXVsdGlsaW5lKGFzY2lpQXJ0KTtcclxuICAgIGNvbnN0IHZlcnNpb24gPSBjaGFsay5ncmF5KCd2MS4wLjAtYWxwaGEuMicpO1xyXG4gICAgY29uc3QgZGVzY3JpcHRpb24gPSBjaGFsay5jeWFuKCfwn5qAIOS4k+S4uiBDb2NvcyBFbmdpbmUg5byA5Y+R6K6+6K6h55qE5by65aSn5ZG95Luk6KGM55WM6Z2i5bel5YW3Jyk7XHJcblxyXG4gICAgLy8g5YOP57Sg5YyW6KOF6aWwXHJcbiAgICBjb25zdCBwaXhlbERvdHMgPSBjaGFsay5ibHVlKCfilognLnJlcGVhdCgxMikpICsgY2hhbGsubWFnZW50YSgn4paIJy5yZXBlYXQoMTIpKTtcclxuXHJcbiAgICAvLyDmj5DnpLrkv6Hmga9cclxuICAgIGNvbnN0IHRpcHMgPSBbXHJcbiAgICAgICAgJ/Cfj5fvuI8g5p6E5bu66aG555uu77yaY29jb3MgYnVpbGQgLS1wcm9qZWN0IDxwYXRoPicsXHJcbiAgICAgICAgJ/Cfk4Ig5Yib5bu66aG555uu77yaY29jb3MgY3JlYXRlIC0tcHJvamVjdCA8cGF0aD4nLFxyXG4gICAgICAgICfihLnvuI8g5p+l55yL5L+h5oGv77yaY29jb3MgaW5mbyAtLXByb2plY3QgPHBhdGg+JyxcclxuICAgICAgICAn4p2TIOiOt+WPluW4ruWKqe+8mmNvY29zIC0taGVscCdcclxuICAgIF07XHJcblxyXG4gICAgcmV0dXJuIGBcclxuJHtncmFkaWVudFRleHR9XHJcbiR7cGl4ZWxEb3RzfVxyXG4ke2NoYWxrLmdyYXkoJ+KUgCcucmVwZWF0KDcwKSl9XHJcbiR7ZGVzY3JpcHRpb259XHJcbiR7Y2hhbGsuZ3JheSgn4pSAJy5yZXBlYXQoNzApKX1cclxuJHtjaGFsay5jeWFuKCfinKgg5YeG5aSH5bCx57uq77yB6YCJ5oup5Lul5LiL5pON5L2c5byA5aeL5L2/55So77yaJyl9XHJcbiR7Y2hhbGsuZ3JheSgn4pSAJy5yZXBlYXQoNzApKX1cclxuJHt0aXBzLm1hcCh0aXAgPT4gY2hhbGsud2hpdGUodGlwKSkuam9pbignXFxuJyl9XHJcbiR7Y2hhbGsuZ3JheSgn4pSAJy5yZXBlYXQoNzApKX1cclxuJHt2ZXJzaW9ufVxyXG5gO1xyXG59XHJcblxyXG4vKipcclxuICog5Yib5bu654q25oCB5qCP77yI57G75Ly8IEdlbWluaSBDTEkg5bqV6YOo54q25oCB5qCP77yJXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlU3RhdHVzQmFyKHByb2plY3RQYXRoPzogc3RyaW5nLCBtb2RlOiBzdHJpbmcgPSAnaW50ZXJhY3RpdmUnKTogc3RyaW5nIHtcclxuICAgIGNvbnN0IGN1cnJlbnREaXIgPSBwcm9qZWN0UGF0aCB8fCBwcm9jZXNzLmN3ZCgpO1xyXG4gICAgY29uc3QgZGlyTmFtZSA9IGN1cnJlbnREaXIuc3BsaXQoJy8nKS5wb3AoKSB8fCAnY29jb3MtY2xpJztcclxuICAgIGNvbnN0IG1vZGVUZXh0ID0gbW9kZSA9PT0gJ2ludGVyYWN0aXZlJyA/ICdpbnRlcmFjdGl2ZScgOiAnbm9uLWludGVyYWN0aXZlJztcclxuXHJcbiAgICByZXR1cm4gYFxyXG4ke2NoYWxrLmdyYXkoJ+KUgCcucmVwZWF0KDcwKSl9XHJcbiR7Y2hhbGsud2hpdGUoYH4vY29kZS8ke2Rpck5hbWV9YCl9ICR7Y2hhbGsuZ3JheSgnKCcgKyBtb2RlVGV4dCArICcpJyl9ICR7Y2hhbGsuZ3JheSgnY29jb3MtY2xpIHYxLjAuMC1hbHBoYS4yJyl9XHJcbmA7XHJcbn1cclxuIl19