"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Validator = void 0;
const fs_1 = require("fs");
const utils_1 = __importDefault(require("../../base/utils"));
class Validator {
    static internalVerifyRules = {
        pathExist: {
            func: (path) => {
                if (typeof path !== 'string') {
                    return false;
                }
                path = utils_1.default.Path.resolveToRaw(path);
                return (0, fs_1.existsSync)(path);
            },
            message: 'i18n:builder.warn.path_not_exist',
        },
        valid: {
            func: (value) => {
                return value !== null && value !== undefined;
            },
            message: 'i18n:builder.verify_rule_message.valid',
        },
        required: {
            func: (value) => {
                return value !== null && value !== undefined && value !== '';
            },
            message: 'i18n:builder.verify_rule_message.required',
        },
        normalName: {
            func: (value) => {
                return /^[a-zA-Z0-9_-]*$/.test(value);
            },
            message: 'i18n:builder.verify_rule_message.normalName',
        },
        noChinese: {
            func: (value) => {
                return !/.*[\u4e00-\u9fa5]+.*$/.test(value);
            },
            message: 'i18n:builder.verify_rule_message.no_chinese',
        },
        array: {
            func: (value) => {
                return Array.isArray(value);
            },
            message: 'i18n:builder.verify_rule_message.array',
        },
        string: {
            func: (value) => {
                return typeof value === 'string';
            },
            message: 'i18n:builder.verify_rule_message.string',
        },
        number: {
            func: (value) => {
                return typeof value === 'number';
            },
            message: 'i18n:builder.verify_rule_message.number',
        },
        http: {
            func: (value) => {
                if (typeof value !== 'string') {
                    return false;
                }
                return value.startsWith('http');
            },
            message: 'i18n:builder.verify_rule_message.http',
        },
        // 不允许任何非法字符的路径
        strictPath: {
            func: () => {
                return false;
            },
            message: 'i18n:builder.verify_rule_message.strict_path',
        },
        normalPath: {
            func: (value) => {
                if (typeof value !== 'string') {
                    return false;
                }
                return /^[a-zA-Z]:[\\]((?! )(?![^\\/]*\s+[\\/])[\w -]+[\\/])*(?! )(?![^.]*\s+\.)[\w -]+$/.test(value);
            },
            message: 'i18n:builder.verify_rule_message.normal_path',
        },
    };
    static addRule(ruleName, rule) {
        if (Validator.internalVerifyRules[ruleName]) {
            return;
        }
        Validator.internalVerifyRules[ruleName] = rule;
    }
    customVerifyRules = {};
    has(ruleName) {
        const checkValitor = this.customVerifyRules[ruleName] || Validator.internalVerifyRules[ruleName];
        if (!checkValitor || !checkValitor.func) {
            return false;
        }
        return true;
    }
    queryRuleMessage(ruleName) {
        const checkValitor = this.customVerifyRules[ruleName] || Validator.internalVerifyRules[ruleName];
        return checkValitor && checkValitor.message;
    }
    checkWithInternalRule(ruleName, value, ...arg) {
        const checkValitor = Validator.internalVerifyRules[ruleName];
        if (!checkValitor || !checkValitor.func) {
            console.warn(`Invalid check with ${value}: Rule ${ruleName} is not exist.`);
            return false;
        }
        return checkValitor.func(value, ...arg);
    }
    async check(ruleName, value, ...arg) {
        return !(await this.checkRuleWithMessage(ruleName, value, ...arg));
    }
    async checkRuleWithMessage(ruleName, value, ...arg) {
        const checkValitor = this.customVerifyRules[ruleName] || Validator.internalVerifyRules[ruleName];
        if (!checkValitor || !checkValitor.func) {
            return `Invalid check with ${value}: Rule ${ruleName} is not exist.`;
        }
        if (!await checkValitor.func(value, ...arg)) {
            // 添加规则时有判空处理，所以校验失败结果肯定不会是空字符串
            return checkValitor.message;
        }
        return '';
    }
    add(ruleName, rule) {
        if (!rule || !rule.func || !rule.message) {
            // TODO 详细报错
            console.warn(`Add rule ${ruleName} failed!`);
            return;
        }
        this.customVerifyRules[ruleName] = rule;
    }
}
exports.Validator = Validator;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvcmUvYnVpbGRlci9zaGFyZS92YWxpZGF0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsMkJBQWdDO0FBRWhDLDZEQUFxQztBQUVyQyxNQUFhLFNBQVM7SUFDVixNQUFNLENBQUMsbUJBQW1CLEdBQThDO1FBQzVFLFNBQVMsRUFBRTtZQUNQLElBQUksRUFBRSxDQUFDLElBQVksRUFBRSxFQUFFO2dCQUNuQixJQUFJLE9BQU8sSUFBSSxLQUFLLFFBQVEsRUFBRSxDQUFDO29CQUMzQixPQUFPLEtBQUssQ0FBQztnQkFDakIsQ0FBQztnQkFDRCxJQUFJLEdBQUcsZUFBSyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3JDLE9BQU8sSUFBQSxlQUFVLEVBQUMsSUFBSSxDQUFDLENBQUM7WUFDNUIsQ0FBQztZQUNELE9BQU8sRUFBRSxrQ0FBa0M7U0FDOUM7UUFDRCxLQUFLLEVBQUU7WUFDSCxJQUFJLEVBQUUsQ0FBQyxLQUFVLEVBQUUsRUFBRTtnQkFDakIsT0FBTyxLQUFLLEtBQUssSUFBSSxJQUFJLEtBQUssS0FBSyxTQUFTLENBQUM7WUFDakQsQ0FBQztZQUNELE9BQU8sRUFBRSx3Q0FBd0M7U0FDcEQ7UUFDRCxRQUFRLEVBQUU7WUFDTixJQUFJLEVBQUUsQ0FBQyxLQUFVLEVBQUUsRUFBRTtnQkFDakIsT0FBTyxLQUFLLEtBQUssSUFBSSxJQUFJLEtBQUssS0FBSyxTQUFTLElBQUksS0FBSyxLQUFLLEVBQUUsQ0FBQztZQUNqRSxDQUFDO1lBQ0QsT0FBTyxFQUFFLDJDQUEyQztTQUN2RDtRQUNELFVBQVUsRUFBRTtZQUNSLElBQUksRUFBRSxDQUFDLEtBQVUsRUFBRSxFQUFFO2dCQUNqQixPQUFPLGtCQUFrQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUMxQyxDQUFDO1lBQ0QsT0FB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LElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDdkMsWUFBWTtZQUNaLE9BQU8sQ0FBQyxJQUFJLENBQUMsWUFBWSxRQUFRLFVBQVUsQ0FBQyxDQUFDO1lBQzdDLE9BQU87UUFDWCxDQUFDO1FBQ0QsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxHQUFHLElBQUksQ0FBQztJQUM1QyxDQUFDOztBQXhJTCw4QkF5SUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBleGlzdHNTeW5jIH0gZnJvbSAnZnMnO1xyXG5pbXBvcnQgeyBJSW50ZXJuYWxWZXJpZmljYXRpb25SdWxlLCBJVmVyaWZpY2F0aW9uUnVsZU1hcCwgSVZlcmlmaWNhdGlvblJ1bGUgfSBmcm9tICcuLi9AdHlwZXMnO1xyXG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vYmFzZS91dGlscyc7XHJcblxyXG5leHBvcnQgY2xhc3MgVmFsaWRhdG9yIHtcclxuICAgIHByaXZhdGUgc3RhdGljIGludGVybmFsVmVyaWZ5UnVsZXM6IFJlY29yZDxzdHJpbmcsIElJbnRlcm5hbFZlcmlmaWNhdGlvblJ1bGU+ID0ge1xyXG4gICAgICAgIHBhdGhFeGlzdDoge1xyXG4gICAgICAgICAgICBmdW5jOiAocGF0aDogc3RyaW5nKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHBhdGggIT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcGF0aCA9IFV0aWxzLlBhdGgucmVzb2x2ZVRvUmF3KHBhdGgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGV4aXN0c1N5bmMocGF0aCk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG1lc3NhZ2U6ICdpMThuOmJ1aWxkZXIud2Fybi5wYXRoX25vdF9leGlzdCcsXHJcbiAgICAgICAgfSxcclxuICAgICAgICB2YWxpZDoge1xyXG4gICAgICAgICAgICBmdW5jOiAodmFsdWU6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlICE9PSBudWxsICYmIHZhbHVlICE9PSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG1lc3NhZ2U6ICdpMThuOmJ1aWxkZXIudmVyaWZ5X3J1bGVfbWVzc2FnZS52YWxpZCcsXHJcbiAgICAgICAgfSxcclxuICAgICAgICByZXF1aXJlZDoge1xyXG4gICAgICAgICAgICBmdW5jOiAodmFsdWU6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlICE9PSBudWxsICYmIHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09ICcnO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBtZXNzYWdlOiAnaTE4bjpidWlsZGVyLnZlcmlmeV9ydWxlX21lc3NhZ2UucmVxdWlyZWQnLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbm9ybWFsTmFtZToge1xyXG4gICAgICAgICAgICBmdW5jOiAodmFsdWU6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIC9eW2EtekEtWjAtOV8tXSokLy50ZXN0KHZhbHVlKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgbWVzc2FnZTogJ2kxOG46YnVpbGRlci52ZXJpZnlfcnVsZV9tZXNzYWdlLm5vcm1hbE5hbWUnLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbm9DaGluZXNlOiB7XHJcbiAgICAgICAgICAgIGZ1bmM6ICh2YWx1ZTogYW55KSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gIS8uKltcXHU0ZTAwLVxcdTlmYTVdKy4qJC8udGVzdCh2YWx1ZSk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG1lc3NhZ2U6ICdpMThuOmJ1aWxkZXIudmVyaWZ5X3J1bGVfbWVzc2FnZS5ub19jaGluZXNlJyxcclxuICAgICAgICB9LFxyXG4gICAgICAgIGFycmF5OiB7XHJcbiAgICAgICAgICAgIGZ1bmM6ICh2YWx1ZTogYW55KSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gQXJyYXkuaXNBcnJheSh2YWx1ZSk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG1lc3NhZ2U6ICdpMThuOmJ1aWxkZXIudmVyaWZ5X3J1bGVfbWVzc2FnZS5hcnJheScsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBzdHJpbmc6IHtcclxuICAgICAgICAgICAgZnVuYzogKHZhbHVlOiBhbnkpID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBtZXNzYWdlOiAnaTE4bjpidWlsZGVyLnZlcmlmeV9ydWxlX21lc3NhZ2Uuc3RyaW5nJyxcclxuICAgICAgICB9LFxyXG4gICAgICAgIG51bWJlcjoge1xyXG4gICAgICAgICAgICBmdW5jOiAodmFsdWU6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcic7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG1lc3NhZ2U6ICdpMThuOmJ1aWxkZXIudmVyaWZ5X3J1bGVfbWVzc2FnZS5udW1iZXInLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgaHR0cDoge1xyXG4gICAgICAgICAgICBmdW5jOiAodmFsdWU6IHN0cmluZykgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWUuc3RhcnRzV2l0aCgnaHR0cCcpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBtZXNzYWdlOiAnaTE4bjpidWlsZGVyLnZlcmlmeV9ydWxlX21lc3NhZ2UuaHR0cCcsXHJcbiAgICAgICAgfSxcclxuICAgICAgICAvLyDkuI3lhYHorrjku7vkvZXpnZ7ms5XlrZfnrKbnmoTot6/lvoRcclxuICAgICAgICBzdHJpY3RQYXRoOiB7XHJcbiAgICAgICAgICAgIGZ1bmM6ICgpID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgbWVzc2FnZTogJ2kxOG46YnVpbGRlci52ZXJpZnlfcnVsZV9tZXNzYWdlLnN0cmljdF9wYXRoJyxcclxuICAgICAgICB9LFxyXG4gICAgICAgIG5vcm1hbFBhdGg6IHtcclxuICAgICAgICAgICAgZnVuYzogKHZhbHVlPzogc3RyaW5nKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlICE9PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiAvXlthLXpBLVpdOltcXFxcXSgoPyEgKSg/IVteXFxcXC9dKlxccytbXFxcXC9dKVtcXHcgLV0rW1xcXFwvXSkqKD8hICkoPyFbXi5dKlxccytcXC4pW1xcdyAtXSskLy50ZXN0KHZhbHVlKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgbWVzc2FnZTogJ2kxOG46YnVpbGRlci52ZXJpZnlfcnVsZV9tZXNzYWdlLm5vcm1hbF9wYXRoJyxcclxuICAgICAgICB9LFxyXG4gICAgfTtcclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIGFkZFJ1bGUocnVsZU5hbWU6IHN0cmluZywgcnVsZTogSUludGVybmFsVmVyaWZpY2F0aW9uUnVsZSkge1xyXG4gICAgICAgIGlmIChWYWxpZGF0b3IuaW50ZXJuYWxWZXJpZnlSdWxlc1tydWxlTmFtZV0pIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBWYWxpZGF0b3IuaW50ZXJuYWxWZXJpZnlSdWxlc1tydWxlTmFtZV0gPSBydWxlO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgY3VzdG9tVmVyaWZ5UnVsZXM6IElWZXJpZmljYXRpb25SdWxlTWFwID0ge307XHJcblxyXG4gICAgcHVibGljIGhhcyhydWxlTmFtZTogc3RyaW5nKSB7XHJcbiAgICAgICAgY29uc3QgY2hlY2tWYWxpdG9yID0gdGhpcy5jdXN0b21WZXJpZnlSdWxlc1tydWxlTmFtZV0gfHwgVmFsaWRhdG9yLmludGVybmFsVmVyaWZ5UnVsZXNbcnVsZU5hbWVdO1xyXG4gICAgICAgIGlmICghY2hlY2tWYWxpdG9yIHx8ICFjaGVja1ZhbGl0b3IuZnVuYykge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBxdWVyeVJ1bGVNZXNzYWdlKHJ1bGVOYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gICAgICAgIGNvbnN0IGNoZWNrVmFsaXRvciA9IHRoaXMuY3VzdG9tVmVyaWZ5UnVsZXNbcnVsZU5hbWVdIHx8IFZhbGlkYXRvci5pbnRlcm5hbFZlcmlmeVJ1bGVzW3J1bGVOYW1lXTtcclxuICAgICAgICByZXR1cm4gY2hlY2tWYWxpdG9yICYmIGNoZWNrVmFsaXRvci5tZXNzYWdlO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBjaGVja1dpdGhJbnRlcm5hbFJ1bGUocnVsZU5hbWU6IHN0cmluZywgdmFsdWU6IGFueSwgLi4uYXJnOiBhbnlbXSkge1xyXG4gICAgICAgIGNvbnN0IGNoZWNrVmFsaXRvciA9IFZhbGlkYXRvci5pbnRlcm5hbFZlcmlmeVJ1bGVzW3J1bGVOYW1lXTtcclxuICAgICAgICBpZiAoIWNoZWNrVmFsaXRvciB8fCAhY2hlY2tWYWxpdG9yLmZ1bmMpIHtcclxuICAgICAgICAgICAgY29uc29sZS53YXJuKGBJbnZhbGlkIGNoZWNrIHdpdGggJHt2YWx1ZX06IFJ1bGUgJHtydWxlTmFtZX0gaXMgbm90IGV4aXN0LmApO1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBjaGVja1ZhbGl0b3IuZnVuYyh2YWx1ZSwgLi4uYXJnKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgYXN5bmMgY2hlY2socnVsZU5hbWU6IHN0cmluZywgdmFsdWU6IGFueSwgLi4uYXJnOiBhbnlbXSk6IFByb21pc2U8Ym9vbGVhbj4ge1xyXG4gICAgICAgIHJldHVybiAhKGF3YWl0IHRoaXMuY2hlY2tSdWxlV2l0aE1lc3NhZ2UocnVsZU5hbWUsIHZhbHVlLCAuLi5hcmcpKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgYXN5bmMgY2hlY2tSdWxlV2l0aE1lc3NhZ2UocnVsZU5hbWU6IHN0cmluZywgdmFsdWU6IGFueSwgLi4uYXJnOiBhbnlbXSk6IFByb21pc2U8c3RyaW5nPiB7XHJcbiAgICAgICAgY29uc3QgY2hlY2tWYWxpdG9yID0gdGhpcy5jdXN0b21WZXJpZnlSdWxlc1tydWxlTmFtZV0gfHwgVmFsaWRhdG9yLmludGVybmFsVmVyaWZ5UnVsZXNbcnVsZU5hbWVdO1xyXG4gICAgICAgIGlmICghY2hlY2tWYWxpdG9yIHx8ICFjaGVja1ZhbGl0b3IuZnVuYykge1xyXG4gICAgICAgICAgICByZXR1cm4gYEludmFsaWQgY2hlY2sgd2l0aCAke3ZhbHVlfTogUnVsZSAke3J1bGVOYW1lfSBpcyBub3QgZXhpc3QuYDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghYXdhaXQgY2hlY2tWYWxpdG9yLmZ1bmModmFsdWUsIC4uLmFyZykpIHtcclxuICAgICAgICAgICAgLy8g5re75Yqg6KeE5YiZ5pe25pyJ5Yik56m65aSE55CG77yM5omA5Lul5qCh6aqM5aSx6LSl57uT5p6c6IKv5a6a5LiN5Lya5piv56m65a2X56ym5LiyXHJcbiAgICAgICAgICAgIHJldHVybiBjaGVja1ZhbGl0b3IubWVzc2FnZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuICcnO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBhZGQocnVsZU5hbWU6IHN0cmluZywgcnVsZTogSVZlcmlmaWNhdGlvblJ1bGUpIHtcclxuICAgICAgICBpZiAoIXJ1bGUgfHwgIXJ1bGUuZnVuYyB8fCAhcnVsZS5tZXNzYWdlKSB7XHJcbiAgICAgICAgICAgIC8vIFRPRE8g6K+m57uG5oql6ZSZXHJcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgQWRkIHJ1bGUgJHtydWxlTmFtZX0gZmFpbGVkIWApO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuY3VzdG9tVmVyaWZ5UnVsZXNbcnVsZU5hbWVdID0gcnVsZTtcclxuICAgIH1cclxufVxyXG4iXX0=