"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.interactive = exports.InteractiveCLI = void 0;
const inquirer_1 = __importDefault(require("inquirer"));
const ora_1 = __importDefault(require("ora"));
const chalk_1 = __importDefault(require("chalk"));
const cli_progress_1 = __importDefault(require("cli-progress"));
const banner_1 = require("./banner");
const config_1 = require("./config");
/**
 * 交互式 CLI 界面
 */
class InteractiveCLI {
    spinner = null;
    progressBar = null;
    /**
     * 显示欢迎界面
     */
    showWelcome() {
        if (!config_1.config.shouldDisplayBanner()) {
            return;
        }
        console.clear();
        console.log((0, banner_1.createBanner)());
        console.log((0, banner_1.createWelcomeMessage)());
    }
    /**
     * 显示启动消息（类似 Gemini CLI）
     */
    showStartupMessage() {
        if (!config_1.config.shouldDisplayBanner()) {
            return;
        }
        console.clear();
        console.log((0, banner_1.createStartupMessage)());
        console.log((0, banner_1.createStatusBar)());
    }
    /**
     * 显示加载动画
     */
    startSpinner(message) {
        if (!config_1.config.shouldUseSpinner()) {
            console.log(chalk_1.default.cyan(`⏳ ${message}`));
            return;
        }
        this.spinner = (0, ora_1.default)({
            text: message,
            spinner: 'dots',
            color: 'cyan'
        }).start();
    }
    /**
     * 更新加载动画消息
     */
    updateSpinner(message) {
        if (this.spinner) {
            this.spinner.text = message;
        }
    }
    /**
     * 停止加载动画
     */
    stopSpinner(success = true, message) {
        if (!config_1.config.shouldUseSpinner()) {
            const status = success ? '✅' : '❌';
            console.log(chalk_1.default.cyan(`${status} ${message || (success ? '完成' : '失败')}`));
            return;
        }
        if (this.spinner) {
            if (success) {
                this.spinner.succeed(message || '完成');
            }
            else {
                this.spinner.fail(message || '失败');
            }
            this.spinner = null;
        }
    }
    /**
     * 显示进度条
     */
    startProgress(total, message = '处理中...') {
        if (!config_1.config.shouldUseProgressBar()) {
            console.log(chalk_1.default.cyan(`📊 ${message} (0/${total})`));
            return;
        }
        this.progressBar = new cli_progress_1.default.SingleBar({
            format: `${message} |{bar}| {percentage}% | {value}/{total} | {eta}s`,
            barCompleteChar: '\u2588',
            barIncompleteChar: '\u2591',
            hideCursor: true
        });
        this.progressBar.start(total, 0);
    }
    /**
     * 更新进度条
     */
    updateProgress(value) {
        if (!config_1.config.shouldUseProgressBar()) {
            // 在非交互模式下，每 10% 显示一次进度
            if (value % 10 === 0) {
                console.log(chalk_1.default.cyan(`📊 进度: ${value}%`));
            }
            return;
        }
        if (this.progressBar) {
            this.progressBar.update(value);
        }
    }
    /**
     * 停止进度条
     */
    stopProgress() {
        if (!config_1.config.shouldUseProgressBar()) {
            console.log(chalk_1.default.cyan('📊 进度: 100% 完成'));
            return;
        }
        if (this.progressBar) {
            this.progressBar.stop();
            this.progressBar = null;
        }
    }
    /**
     * 显示确认对话框
     */
    async confirm(message, defaultValue = true) {
        if (!config_1.config.shouldUseInteractive()) {
            console.log(chalk_1.default.cyan(`❓ ${message} (默认: ${defaultValue ? '是' : '否'})`));
            return defaultValue;
        }
        const { confirmed } = await inquirer_1.default.prompt([
            {
                type: 'confirm',
                name: 'confirmed',
                message: chalk_1.default.cyan(message),
                default: defaultValue
            }
        ]);
        return confirmed;
    }
    /**
     * 显示选择列表
     */
    async select(message, choices) {
        if (!config_1.config.shouldUseInteractive()) {
            console.log(chalk_1.default.cyan(`📋 ${message}`));
            choices.forEach((choice, index) => {
                const status = choice.disabled ? '❌' : '✅';
                console.log(chalk_1.default.gray(`  ${index + 1}. ${status} ${choice.name}`));
            });
            // 返回第一个可用选项
            const availableChoice = choices.find(choice => !choice.disabled);
            return availableChoice ? availableChoice.value : choices[0].value;
        }
        const { selected } = await inquirer_1.default.prompt([
            {
                type: 'list',
                name: 'selected',
                message: chalk_1.default.cyan(message),
                choices: choices.map(choice => ({
                    ...choice,
                    name: choice.disabled ? chalk_1.default.gray(choice.name + ' (不可用)') : choice.name
                }))
            }
        ]);
        return selected;
    }
    /**
     * 显示输入框
     */
    async input(message, defaultValue) {
        if (!config_1.config.shouldUseInteractive()) {
            console.log(chalk_1.default.cyan(`✏️  ${message} (默认: ${defaultValue || '无'})`));
            return defaultValue || '';
        }
        const { value } = await inquirer_1.default.prompt([
            {
                type: 'input',
                name: 'value',
                message: chalk_1.default.cyan(message),
                default: defaultValue,
                validate: (input) => {
                    if (!input.trim()) {
                        return '请输入有效值';
                    }
                    return true;
                }
            }
        ]);
        return value;
    }
    /**
     * 显示多选列表
     */
    async checkbox(message, choices) {
        const { selected } = await inquirer_1.default.prompt([
            {
                type: 'checkbox',
                name: 'selected',
                message: chalk_1.default.cyan(message),
                choices: choices.map(choice => ({
                    ...choice,
                    name: choice.checked ? chalk_1.default.green(`✓ ${choice.name}`) : choice.name
                }))
            }
        ]);
        return selected;
    }
    /**
     * 显示密码输入框
     */
    async password(message) {
        const { value } = await inquirer_1.default.prompt([
            {
                type: 'password',
                name: 'value',
                message: chalk_1.default.cyan(message),
                mask: '*'
            }
        ]);
        return value;
    }
    /**
     * 显示成功消息
     */
    success(message) {
        console.log(chalk_1.default.green(`✅ ${message}`));
    }
    /**
     * 显示错误消息
     */
    error(message) {
        console.log(chalk_1.default.red(`❌ ${message}`));
    }
    /**
     * 显示警告消息
     */
    warning(message) {
        console.log(chalk_1.default.yellow(`⚠️  ${message}`));
    }
    /**
     * 显示信息消息
     */
    info(message) {
        console.log(chalk_1.default.cyan(`ℹ️  ${message}`));
    }
    /**
     * 显示分隔线
     */
    separator(char = '─', length = 60) {
        console.log(chalk_1.default.gray(char.repeat(length)));
    }
    /**
     * 显示表格
     */
    table(headers, rows) {
        // 简单的表格实现
        const maxWidths = headers.map((header, i) => {
            const maxWidth = Math.max(header.length, ...rows.map(row => row[i]?.length || 0));
            return Math.min(maxWidth, 30); // 限制最大宽度
        });
        // 打印表头
        const headerRow = headers.map((header, i) => header.padEnd(maxWidths[i])).join(' | ');
        console.log(chalk_1.default.bold(headerRow));
        // 打印分隔线
        const separatorRow = maxWidths.map(width => '─'.repeat(width)).join('─┼─');
        console.log(chalk_1.default.gray(separatorRow));
        // 打印数据行
        rows.forEach(row => {
            const dataRow = row.map((cell, i) => (cell || '').padEnd(maxWidths[i])).join(' | ');
            console.log(dataRow);
        });
    }
}
exports.InteractiveCLI = InteractiveCLI;
// 创建全局实例
exports.interactive = new InteractiveCLI();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW50ZXJhY3RpdmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZGlzcGxheS9pbnRlcmFjdGl2ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSx3REFBZ0M7QUFDaEMsOENBQXNCO0FBQ3RCLGtEQUEwQjtBQUMxQixnRUFBdUM7QUFDdkMscUNBQXFHO0FBQ3JHLHFDQUFrQztBQUVsQzs7R0FFRztBQUNILE1BQWEsY0FBYztJQUNmLE9BQU8sR0FBbUIsSUFBSSxDQUFDO0lBQy9CLFdBQVcsR0FBaUMsSUFBSSxDQUFDO0lBRXpEOztPQUVHO0lBQ0gsV0FBVztRQUNQLElBQUksQ0FBQyxlQUFNLENBQUMsbUJBQW1CLEVBQUUsRUFBRSxDQUFDO1lBQ2hDLE9BQU87UUFDWCxDQUFDO1FBRUQsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ2hCLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBQSxxQkFBWSxHQUFFLENBQUMsQ0FBQztRQUM1QixPQUFPLENBQUMsR0FBRyxDQUFDLElBQUEsNkJBQW9CLEdBQUUsQ0FBQyxDQUFDO0lBQ3hDLENBQUM7SUFFRDs7T0FFRztJQUNILGtCQUFrQjtRQUNkLElBQUksQ0FBQyxlQUFNLENBQUMsbUJBQW1CLEVBQUUsRUFBRSxDQUFDO1lBQ2hDLE9BQU87UUFDWCxDQUFDO1FBRUQsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ2hCLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBQSw2QkFBb0IsR0FBRSxDQUFDLENBQUM7UUFDcEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFBLHdCQUFlLEdBQUUsQ0FBQyxDQUFDO0lBQ25DLENBQUM7SUFFRDs7T0FFRztJQUNILFlBQVksQ0FBQyxPQUFlO1FBQ3hCLElBQUksQ0FBQyxlQUFNLENBQUMsZ0JBQWdCLEVBQUUsRUFBRSxDQUFDO1lBQzdCLE9BQU8sQ0FBQyxHQUFHLENBQUMsZUFBSyxDQUFDLElBQUksQ0FBQyxLQUFLLE9BQU8sRUFBRSxD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LENBQUMsR0FBRyxDQUFDLGVBQUssQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztRQUV0QyxRQUFRO1FBQ1IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUNmLE1BQU0sT0FBTyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FDaEMsQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUNwQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNkLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDekIsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0NBQ0o7QUFuVEQsd0NBbVRDO0FBRUQsU0FBUztBQUNJLFFBQUEsV0FBVyxHQUFHLElBQUksY0FBYyxFQUFFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgaW5xdWlyZXIgZnJvbSAnaW5xdWlyZXInO1xyXG5pbXBvcnQgb3JhIGZyb20gJ29yYSc7XHJcbmltcG9ydCBjaGFsayBmcm9tICdjaGFsayc7XHJcbmltcG9ydCBjbGlQcm9ncmVzcyBmcm9tICdjbGktcHJvZ3Jlc3MnO1xyXG5pbXBvcnQgeyBjcmVhdGVCYW5uZXIsIGNyZWF0ZVdlbGNvbWVNZXNzYWdlLCBjcmVhdGVTdGFydHVwTWVzc2FnZSwgY3JlYXRlU3RhdHVzQmFyIH0gZnJvbSAnLi9iYW5uZXInO1xyXG5pbXBvcnQgeyBjb25maWcgfSBmcm9tICcuL2NvbmZpZyc7XHJcblxyXG4vKipcclxuICog5Lqk5LqS5byPIENMSSDnlYzpnaJcclxuICovXHJcbmV4cG9ydCBjbGFzcyBJbnRlcmFjdGl2ZUNMSSB7XHJcbiAgICBwcml2YXRlIHNwaW5uZXI6IG9yYS5PcmEgfCBudWxsID0gbnVsbDtcclxuICAgIHByaXZhdGUgcHJvZ3Jlc3NCYXI6IGNsaVByb2dyZXNzLlNpbmdsZUJhciB8IG51bGwgPSBudWxsO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICog5pi+56S65qyi6L+O55WM6Z2iXHJcbiAgICAgKi9cclxuICAgIHNob3dXZWxjb21lKCk6IHZvaWQge1xyXG4gICAgICAgIGlmICghY29uZmlnLnNob3VsZERpc3BsYXlCYW5uZXIoKSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zb2xlLmNsZWFyKCk7XHJcbiAgICAgICAgY29uc29sZS5sb2coY3JlYXRlQmFubmVyKCkpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGNyZWF0ZVdlbGNvbWVNZXNzYWdlKCkpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5pi+56S65ZCv5Yqo5raI5oGv77yI57G75Ly8IEdlbWluaSBDTEnvvIlcclxuICAgICAqL1xyXG4gICAgc2hvd1N0YXJ0dXBNZXNzYWdlKCk6IHZvaWQge1xyXG4gICAgICAgIGlmICghY29uZmlnLnNob3VsZERpc3BsYXlCYW5uZXIoKSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zb2xlLmNsZWFyKCk7XHJcbiAgICAgICAgY29uc29sZS5sb2coY3JlYXRlU3RhcnR1cE1lc3NhZ2UoKSk7XHJcbiAgICAgICAgY29uc29sZS5sb2coY3JlYXRlU3RhdHVzQmFyKCkpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5pi+56S65Yqg6L295Yqo55S7XHJcbiAgICAgKi9cclxuICAgIHN0YXJ0U3Bpbm5lcihtZXNzYWdlOiBzdHJpbmcpOiB2b2lkIHtcclxuICAgICAgICBpZiAoIWNvbmZpZy5zaG91bGRVc2VTcGlubmVyKCkpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coY2hhbGsuY3lhbihg4o+zICR7bWVzc2FnZX1gKSk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuc3Bpbm5lciA9IG9yYSh7XHJcbiAgICAgICAgICAgIHRleHQ6IG1lc3NhZ2UsXHJcbiAgICAgICAgICAgIHNwaW5uZXI6ICdkb3RzJyxcclxuICAgICAgICAgICAgY29sb3I6ICdjeWFuJ1xyXG4gICAgICAgIH0pLnN0YXJ0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmm7TmlrDliqDovb3liqjnlLvmtojmga9cclxuICAgICAqL1xyXG4gICAgdXBkYXRlU3Bpbm5lcihtZXNzYWdlOiBzdHJpbmcpOiB2b2lkIHtcclxuICAgICAgICBpZiAodGhpcy5zcGlubmVyKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc3Bpbm5lci50ZXh0ID0gbWVzc2FnZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDlgZzmraLliqDovb3liqjnlLtcclxuICAgICAqL1xyXG4gICAgc3RvcFNwaW5uZXIoc3VjY2VzczogYm9vbGVhbiA9IHRydWUsIG1lc3NhZ2U/OiBzdHJpbmcpOiB2b2lkIHtcclxuICAgICAgICBpZiAoIWNvbmZpZy5zaG91bGRVc2VTcGlubmVyKCkpIHtcclxuICAgICAgICAgICAgY29uc3Qgc3RhdHVzID0gc3VjY2VzcyA/ICfinIUnIDogJ+KdjCc7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGNoYWxrLmN5YW4oYCR7c3RhdHVzfSAke21lc3NhZ2UgfHwgKHN1Y2Nlc3MgPyAn5a6M5oiQJyA6ICflpLHotKUnKX1gKSk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLnNwaW5uZXIpIHtcclxuICAgICAgICAgICAgaWYgKHN1Y2Nlc3MpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc3Bpbm5lci5zdWNjZWVkKG1lc3NhZ2UgfHwgJ+WujOaIkCcpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zcGlubmVyLmZhaWwobWVzc2FnZSB8fCAn5aSx6LSlJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5zcGlubmVyID0gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmmL7npLrov5vluqbmnaFcclxuICAgICAqL1xyXG4gICAgc3RhcnRQcm9ncmVzcyh0b3RhbDogbnVtYmVyLCBtZXNzYWdlOiBzdHJpbmcgPSAn5aSE55CG5LitLi4uJyk6IHZvaWQge1xyXG4gICAgICAgIGlmICghY29uZmlnLnNob3VsZFVzZVByb2dyZXNzQmFyKCkpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coY2hhbGsuY3lhbihg8J+TiiAke21lc3NhZ2V9ICgwLyR7dG90YWx9KWApKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5wcm9ncmVzc0JhciA9IG5ldyBjbGlQcm9ncmVzcy5TaW5nbGVCYXIoe1xyXG4gICAgICAgICAgICBmb3JtYXQ6IGAke21lc3NhZ2V9IHx7YmFyfXwge3BlcmNlbnRhZ2V9JSB8IHt2YWx1ZX0ve3RvdGFsfSB8IHtldGF9c2AsXHJcbiAgICAgICAgICAgIGJhckNvbXBsZXRlQ2hhcjogJ1xcdTI1ODgnLFxyXG4gICAgICAgICAgICBiYXJJbmNvbXBsZXRlQ2hhcjogJ1xcdTI1OTEnLFxyXG4gICAgICAgICAgICBoaWRlQ3Vyc29yOiB0cnVlXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5wcm9ncmVzc0Jhci5zdGFydCh0b3RhbCwgMCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmm7TmlrDov5vluqbmnaFcclxuICAgICAqL1xyXG4gICAgdXBkYXRlUHJvZ3Jlc3ModmFsdWU6IG51bWJlcik6IHZvaWQge1xyXG4gICAgICAgIGlmICghY29uZmlnLnNob3VsZFVzZVByb2dyZXNzQmFyKCkpIHtcclxuICAgICAgICAgICAgLy8g5Zyo6Z2e5Lqk5LqS5qih5byP5LiL77yM5q+PIDEwJSDmmL7npLrkuIDmrKHov5vluqZcclxuICAgICAgICAgICAgaWYgKHZhbHVlICUgMTAgPT09IDApIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGNoYWxrLmN5YW4oYPCfk4og6L+b5bqmOiAke3ZhbHVlfSVgKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMucHJvZ3Jlc3NCYXIpIHtcclxuICAgICAgICAgICAgdGhpcy5wcm9ncmVzc0Jhci51cGRhdGUodmFsdWUpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOWBnOatoui/m+W6puadoVxyXG4gICAgICovXHJcbiAgICBzdG9wUHJvZ3Jlc3MoKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKCFjb25maWcuc2hvdWxkVXNlUHJvZ3Jlc3NCYXIoKSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhjaGFsay5jeWFuKCfwn5OKIOi/m+W6pjogMTAwJSDlrozmiJAnKSk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLnByb2dyZXNzQmFyKSB7XHJcbiAgICAgICAgICAgIHRoaXMucHJvZ3Jlc3NCYXIuc3RvcCgpO1xyXG4gICAgICAgICAgICB0aGlzLnByb2dyZXNzQmFyID0gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmmL7npLrnoa7orqTlr7nor53moYZcclxuICAgICAqL1xyXG4gICAgYXN5bmMgY29uZmlybShtZXNzYWdlOiBzdHJpbmcsIGRlZmF1bHRWYWx1ZTogYm9vbGVhbiA9IHRydWUpOiBQcm9taXNlPGJvb2xlYW4+IHtcclxuICAgICAgICBpZiAoIWNvbmZpZy5zaG91bGRVc2VJbnRlcmFjdGl2ZSgpKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGNoYWxrLmN5YW4oYOKdkyAke21lc3NhZ2V9ICjpu5jorqQ6ICR7ZGVmYXVsdFZhbHVlID8gJ+aYrycgOiAn5ZCmJ30pYCkpO1xyXG4gICAgICAgICAgICByZXR1cm4gZGVmYXVsdFZhbHVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgeyBjb25maXJtZWQgfSA9IGF3YWl0IGlucXVpcmVyLnByb21wdChbXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHR5cGU6ICdjb25maXJtJyxcclxuICAgICAgICAgICAgICAgIG5hbWU6ICdjb25maXJtZWQnLFxyXG4gICAgICAgICAgICAgICAgbWVzc2FnZTogY2hhbGsuY3lhbihtZXNzYWdlKSxcclxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6IGRlZmF1bHRWYWx1ZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgXSk7XHJcbiAgICAgICAgcmV0dXJuIGNvbmZpcm1lZDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOaYvuekuumAieaLqeWIl+ihqFxyXG4gICAgICovXHJcbiAgICBhc3luYyBzZWxlY3Q8VCA9IHN0cmluZz4oXHJcbiAgICAgICAgbWVzc2FnZTogc3RyaW5nLFxyXG4gICAgICAgIGNob2ljZXM6IEFycmF5PHsgbmFtZTogc3RyaW5nOyB2YWx1ZTogVDsgZGlzYWJsZWQ/OiBib29sZWFuIH0+XHJcbiAgICApOiBQcm9taXNlPFQ+IHtcclxuICAgICAgICBpZiAoIWNvbmZpZy5zaG91bGRVc2VJbnRlcmFjdGl2ZSgpKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGNoYWxrLmN5YW4oYPCfk4sgJHttZXNzYWdlfWApKTtcclxuICAgICAgICAgICAgY2hvaWNlcy5mb3JFYWNoKChjaG9pY2UsIGluZGV4KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBzdGF0dXMgPSBjaG9pY2UuZGlzYWJsZWQgPyAn4p2MJyA6ICfinIUnO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coY2hhbGsuZ3JheShgICAke2luZGV4ICsgMX0uICR7c3RhdHVzfSAke2Nob2ljZS5uYW1lfWApKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIC8vIOi/lOWbnuesrOS4gOS4quWPr+eUqOmAiemhuVxyXG4gICAgICAgICAgICBjb25zdCBhdmFpbGFibGVDaG9pY2UgPSBjaG9pY2VzLmZpbmQoY2hvaWNlID0+ICFjaG9pY2UuZGlzYWJsZWQpO1xyXG4gICAgICAgICAgICByZXR1cm4gYXZhaWxhYmxlQ2hvaWNlID8gYXZhaWxhYmxlQ2hvaWNlLnZhbHVlIDogY2hvaWNlc1swXS52YWx1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHsgc2VsZWN0ZWQgfSA9IGF3YWl0IGlucXVpcmVyLnByb21wdChbXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHR5cGU6ICdsaXN0JyxcclxuICAgICAgICAgICAgICAgIG5hbWU6ICdzZWxlY3RlZCcsXHJcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiBjaGFsay5jeWFuKG1lc3NhZ2UpLFxyXG4gICAgICAgICAgICAgICAgY2hvaWNlczogY2hvaWNlcy5tYXAoY2hvaWNlID0+ICh7XHJcbiAgICAgICAgICAgICAgICAgICAgLi4uY2hvaWNlLFxyXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IGNob2ljZS5kaXNhYmxlZCA/IGNoYWxrLmdyYXkoY2hvaWNlLm5hbWUgKyAnICjkuI3lj6/nlKgpJykgOiBjaG9pY2UubmFtZVxyXG4gICAgICAgICAgICAgICAgfSkpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICBdKTtcclxuICAgICAgICByZXR1cm4gc2VsZWN0ZWQ7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmmL7npLrovpPlhaXmoYZcclxuICAgICAqL1xyXG4gICAgYXN5bmMgaW5wdXQobWVzc2FnZTogc3RyaW5nLCBkZWZhdWx0VmFsdWU/OiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xyXG4gICAgICAgIGlmICghY29uZmlnLnNob3VsZFVzZUludGVyYWN0aXZlKCkpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coY2hhbGsuY3lhbihg4pyP77iPICAke21lc3NhZ2V9ICjpu5jorqQ6ICR7ZGVmYXVsdFZhbHVlIHx8ICfml6AnfSlgKSk7XHJcbiAgICAgICAgICAgIHJldHVybiBkZWZhdWx0VmFsdWUgfHwgJyc7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCB7IHZhbHVlIH0gPSBhd2FpdCBpbnF1aXJlci5wcm9tcHQoW1xyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0eXBlOiAnaW5wdXQnLFxyXG4gICAgICAgICAgICAgICAgbmFtZTogJ3ZhbHVlJyxcclxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGNoYWxrLmN5YW4obWVzc2FnZSksXHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0OiBkZWZhdWx0VmFsdWUsXHJcbiAgICAgICAgICAgICAgICB2YWxpZGF0ZTogKGlucHV0OiBzdHJpbmcpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIWlucHV0LnRyaW0oKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ+ivt+i+k+WFpeacieaViOWAvCc7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgXSk7XHJcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5pi+56S65aSa6YCJ5YiX6KGoXHJcbiAgICAgKi9cclxuICAgIGFzeW5jIGNoZWNrYm94PFQgPSBzdHJpbmc+KFxyXG4gICAgICAgIG1lc3NhZ2U6IHN0cmluZyxcclxuICAgICAgICBjaG9pY2VzOiBBcnJheTx7IG5hbWU6IHN0cmluZzsgdmFsdWU6IFQ7IGNoZWNrZWQ/OiBib29sZWFuIH0+XHJcbiAgICApOiBQcm9taXNlPFRbXT4ge1xyXG4gICAgICAgIGNvbnN0IHsgc2VsZWN0ZWQgfSA9IGF3YWl0IGlucXVpcmVyLnByb21wdChbXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHR5cGU6ICdjaGVja2JveCcsXHJcbiAgICAgICAgICAgICAgICBuYW1lOiAnc2VsZWN0ZWQnLFxyXG4gICAgICAgICAgICAgICAgbWVzc2FnZTogY2hhbGsuY3lhbihtZXNzYWdlKSxcclxuICAgICAgICAgICAgICAgIGNob2ljZXM6IGNob2ljZXMubWFwKGNob2ljZSA9PiAoe1xyXG4gICAgICAgICAgICAgICAgICAgIC4uLmNob2ljZSxcclxuICAgICAgICAgICAgICAgICAgICBuYW1lOiBjaG9pY2UuY2hlY2tlZCA/IGNoYWxrLmdyZWVuKGDinJMgJHtjaG9pY2UubmFtZX1gKSA6IGNob2ljZS5uYW1lXHJcbiAgICAgICAgICAgICAgICB9KSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIF0pO1xyXG4gICAgICAgIHJldHVybiBzZWxlY3RlZDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOaYvuekuuWvhueggei+k+WFpeahhlxyXG4gICAgICovXHJcbiAgICBhc3luYyBwYXNzd29yZChtZXNzYWdlOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xyXG4gICAgICAgIGNvbnN0IHsgdmFsdWUgfSA9IGF3YWl0IGlucXVpcmVyLnByb21wdChbXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHR5cGU6ICdwYXNzd29yZCcsXHJcbiAgICAgICAgICAgICAgICBuYW1lOiAndmFsdWUnLFxyXG4gICAgICAgICAgICAgICAgbWVzc2FnZTogY2hhbGsuY3lhbihtZXNzYWdlKSxcclxuICAgICAgICAgICAgICAgIG1hc2s6ICcqJ1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgXSk7XHJcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5pi+56S65oiQ5Yqf5raI5oGvXHJcbiAgICAgKi9cclxuICAgIHN1Y2Nlc3MobWVzc2FnZTogc3RyaW5nKTogdm9pZCB7XHJcbiAgICAgICAgY29uc29sZS5sb2coY2hhbGsuZ3JlZW4oYOKchSAke21lc3NhZ2V9YCkpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5pi+56S66ZSZ6K+v5raI5oGvXHJcbiAgICAgKi9cclxuICAgIGVycm9yKG1lc3NhZ2U6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGNoYWxrLnJlZChg4p2MICR7bWVzc2FnZX1gKSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmmL7npLrorablkYrmtojmga9cclxuICAgICAqL1xyXG4gICAgd2FybmluZyhtZXNzYWdlOiBzdHJpbmcpOiB2b2lkIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhjaGFsay55ZWxsb3coYOKaoO+4jyAgJHttZXNzYWdlfWApKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOaYvuekuuS/oeaBr+a2iOaBr1xyXG4gICAgICovXHJcbiAgICBpbmZvKG1lc3NhZ2U6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGNoYWxrLmN5YW4oYOKEue+4jyAgJHttZXNzYWdlfWApKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOaYvuekuuWIhumalOe6v1xyXG4gICAgICovXHJcbiAgICBzZXBhcmF0b3IoY2hhcjogc3RyaW5nID0gJ+KUgCcsIGxlbmd0aDogbnVtYmVyID0gNjApOiB2b2lkIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhjaGFsay5ncmF5KGNoYXIucmVwZWF0KGxlbmd0aCkpKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOaYvuekuuihqOagvFxyXG4gICAgICovXHJcbiAgICB0YWJsZShoZWFkZXJzOiBzdHJpbmdbXSwgcm93czogc3RyaW5nW11bXSk6IHZvaWQge1xyXG4gICAgICAgIC8vIOeugOWNleeahOihqOagvOWunueOsFxyXG4gICAgICAgIGNvbnN0IG1heFdpZHRocyA9IGhlYWRlcnMubWFwKChoZWFkZXIsIGkpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgbWF4V2lkdGggPSBNYXRoLm1heChcclxuICAgICAgICAgICAgICAgIGhlYWRlci5sZW5ndGgsXHJcbiAgICAgICAgICAgICAgICAuLi5yb3dzLm1hcChyb3cgPT4gcm93W2ldPy5sZW5ndGggfHwgMClcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgcmV0dXJuIE1hdGgubWluKG1heFdpZHRoLCAzMCk7IC8vIOmZkOWItuacgOWkp+WuveW6plxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyDmiZPljbDooajlpLRcclxuICAgICAgICBjb25zdCBoZWFkZXJSb3cgPSBoZWFkZXJzLm1hcCgoaGVhZGVyLCBpKSA9PlxyXG4gICAgICAgICAgICBoZWFkZXIucGFkRW5kKG1heFdpZHRoc1tpXSlcclxuICAgICAgICApLmpvaW4oJyB8ICcpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGNoYWxrLmJvbGQoaGVhZGVyUm93KSk7XHJcblxyXG4gICAgICAgIC8vIOaJk+WNsOWIhumalOe6v1xyXG4gICAgICAgIGNvbnN0IHNlcGFyYXRvclJvdyA9IG1heFdpZHRocy5tYXAod2lkdGggPT5cclxuICAgICAgICAgICAgJ+KUgCcucmVwZWF0KHdpZHRoKVxyXG4gICAgICAgICkuam9pbign4pSA4pS84pSAJyk7XHJcbiAgICAgICAgY29uc29sZS5sb2coY2hhbGsuZ3JheShzZXBhcmF0b3JSb3cpKTtcclxuXHJcbiAgICAgICAgLy8g5omT5Y2w5pWw5o2u6KGMXHJcbiAgICAgICAgcm93cy5mb3JFYWNoKHJvdyA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IGRhdGFSb3cgPSByb3cubWFwKChjZWxsLCBpKSA9PlxyXG4gICAgICAgICAgICAgICAgKGNlbGwgfHwgJycpLnBhZEVuZChtYXhXaWR0aHNbaV0pXHJcbiAgICAgICAgICAgICkuam9pbignIHwgJyk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGRhdGFSb3cpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59XHJcblxyXG4vLyDliJvlu7rlhajlsYDlrp7kvotcclxuZXhwb3J0IGNvbnN0IGludGVyYWN0aXZlID0gbmV3IEludGVyYWN0aXZlQ0xJKCk7XHJcbiJdfQ==