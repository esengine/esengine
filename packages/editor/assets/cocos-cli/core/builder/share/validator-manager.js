"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatorManager = exports.validator = void 0;
const validator_1 = require("./validator");
/**
 * 数据校验类
 */
class ValidatorManager {
    validators = {};
    defaultValidator = new validator_1.Validator();
    /**
     * 添加校验规则
     * @param name
     * @param func
     * @param pkgName
     */
    addRule(name, rule, pkgName) {
        let validator = this.defaultValidator;
        if (pkgName) {
            this.validators[pkgName] = this.validators[pkgName] || new validator_1.Validator();
            validator = this.validators[pkgName];
        }
        validator.add(name, rule);
    }
    // TODO 后续可以设计走完所有校验的校验接口，可以在界面提示上优化，列出当前属性需要满足的条件里有哪些错误
    /**
     * 数据校验入口
     * @param value
     * @param rules
     * @param pkgName
     * @param options
     * @return 返回错误提示，数值正常则不报错
     */
    async check(value, rules, options, pkgName = '') {
        if (!Array.isArray(rules)) {
            return '';
        }
        try {
            // 非必选参数空值时不做校验
            if (['', undefined, null].includes(value) && !rules.includes('required')) {
                return '';
            }
            for (const rule of rules) {
                const validator = this.validators[pkgName] || this.defaultValidator;
                if (!validator.has(rule)) {
                    console.warn(`Rule ${rule} is not exist.(pkgName: ${pkgName})`);
                    return '';
                }
                const err = await validator.checkRuleWithMessage(rule, value, options);
                if (err) {
                    return err;
                }
            }
        }
        catch (error) {
            return error.message;
        }
        return '';
    }
}
exports.validator = new validator_1.Validator();
exports.validatorManager = new ValidatorManager();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdG9yLW1hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29yZS9idWlsZGVyL3NoYXJlL3ZhbGlkYXRvci1tYW5hZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLDJDQUF3QztBQUV4Qzs7R0FFRztBQUNILE1BQU0sZ0JBQWdCO0lBQ1YsVUFBVSxHQUE4QixFQUFFLENBQUM7SUFDM0MsZ0JBQWdCLEdBQUcsSUFBSSxxQkFBUyxFQUFFLENBQUM7SUFFM0M7Ozs7O09BS0c7SUFDSCxPQUFPLENBQUMsSUFBWSxFQUFFLElBQXVCLEVBQUUsT0FBZ0I7UUFDM0QsSUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDO1FBQ3RDLElBQUksT0FBTyxFQUFFLENBQUM7WUFDVixJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLElBQUksSUFBSSxxQkFBUyxFQUFFLENBQUM7WUFDdkUsU0FBUyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDekMsQ0FBQztRQUNELFNBQVMsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQzlCLENBQUM7SUFFRCx3REFBd0Q7SUFFeEQ7Ozs7Ozs7T0FPRztJQUNILEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBVSxFQUFFLEtBQWUsRUFBRSxPQUFhLEVBQUUsT0FBTyxHQUFHLEVBQUU7UUFDaEUsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQztZQUN4QixPQUFPLEVBQUUsQ0FBQztRQUNkLENBQUM7UUFFRCxJQUFJLENBQUM7WUFDRCxlQUFlO1lBQ2YsSUFBSSxDQUFDLEVBQUUsRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDO2dCQUN2RSxPQUFPLEVBQUUsQ0FBQztZQUNkLENBQUM7WUFDRCxLQUFLLE1BQU0sSUFBSSxJQUFJLEtBQUssRUFBRSxDQUFDO2dCQUN2QixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxJQUFJLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQztnQkFDcEUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztvQkFDdkIsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLElBQUksMkJBQTJCLE9BQU8sR0FBRyxDQUFDLENBQUM7b0JBQ2hFLE9BQU8sRUFBRSxDQUFDO2dCQUNkLENBQUM7Z0JBQ0QsTUFBTSxHQUFHLEdBQUcsTUFBTSxTQUFTLENBQUMsb0JBQW9CLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQztnQkFDdkUsSUFBSSxHQUFHLEVBQUUsQ0FBQztvQkFDTixPQUFPLEdBQUcsQ0FBQztnQkFDZixDQUFDO1lBQ0wsQ0FBQztRQUNMLENBQUM7UUFBQyxPQUFPLEtBQVUsRUFBRSxDQUFDO1lBQ2xCLE9BQU8sS0FBSyxDQUFDLE9BQU8sQ0FBQztRQUN6QixDQUFDO1FBQ0QsT0FBTyxFQUFFLENBQUM7SUFDZCxDQUFDO0NBQ0o7QUFFWSxRQUFBLFNBQVMsR0FBRyxJQUFJLHFCQUFTLEVBQUUsQ0FBQztBQUU1QixRQUFBLGdCQUFnQixHQUFHLElBQUksZ0JBQWdCLEVBQUUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IElWZXJpZmljYXRpb25SdWxlIH0gZnJvbSAnLi4vQHR5cGVzJztcclxuaW1wb3J0IHsgVmFsaWRhdG9yIH0gZnJvbSAnLi92YWxpZGF0b3InO1xyXG5cclxuLyoqXHJcbiAqIOaVsOaNruagoemqjOexu1xyXG4gKi9cclxuY2xhc3MgVmFsaWRhdG9yTWFuYWdlciB7XHJcbiAgICBwcml2YXRlIHZhbGlkYXRvcnM6IFJlY29yZDxzdHJpbmcsIFZhbGlkYXRvcj4gPSB7fTtcclxuICAgIHByaXZhdGUgZGVmYXVsdFZhbGlkYXRvciA9IG5ldyBWYWxpZGF0b3IoKTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIOa3u+WKoOagoemqjOinhOWImVxyXG4gICAgICogQHBhcmFtIG5hbWVcclxuICAgICAqIEBwYXJhbSBmdW5jXHJcbiAgICAgKiBAcGFyYW0gcGtnTmFtZVxyXG4gICAgICovXHJcbiAgICBhZGRSdWxlKG5hbWU6IHN0cmluZywgcnVsZTogSVZlcmlmaWNhdGlvblJ1bGUsIHBrZ05hbWU/OiBzdHJpbmcpIHtcclxuICAgICAgICBsZXQgdmFsaWRhdG9yID0gdGhpcy5kZWZhdWx0VmFsaWRhdG9yO1xyXG4gICAgICAgIGlmIChwa2dOYW1lKSB7XHJcbiAgICAgICAgICAgIHRoaXMudmFsaWRhdG9yc1twa2dOYW1lXSA9IHRoaXMudmFsaWRhdG9yc1twa2dOYW1lXSB8fCBuZXcgVmFsaWRhdG9yKCk7XHJcbiAgICAgICAgICAgIHZhbGlkYXRvciA9IHRoaXMudmFsaWRhdG9yc1twa2dOYW1lXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFsaWRhdG9yLmFkZChuYW1lLCBydWxlKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBUT0RPIOWQjue7reWPr+S7peiuvuiuoei1sOWujOaJgOacieagoemqjOeahOagoemqjOaOpeWPo++8jOWPr+S7peWcqOeVjOmdouaPkOekuuS4iuS8mOWMlu+8jOWIl+WHuuW9k+WJjeWxnuaAp+mcgOimgea7oei2s+eahOadoeS7tumHjOacieWTquS6m+mUmeivr1xyXG5cclxuICAgIC8qKlxyXG4gICAgICog5pWw5o2u5qCh6aqM5YWl5Y+jXHJcbiAgICAgKiBAcGFyYW0gdmFsdWVcclxuICAgICAqIEBwYXJhbSBydWxlc1xyXG4gICAgICogQHBhcmFtIHBrZ05hbWVcclxuICAgICAqIEBwYXJhbSBvcHRpb25zXHJcbiAgICAgKiBAcmV0dXJuIOi/lOWbnumUmeivr+aPkOekuu+8jOaVsOWAvOato+W4uOWImeS4jeaKpemUmVxyXG4gICAgICovXHJcbiAgICBhc3luYyBjaGVjayh2YWx1ZTogYW55LCBydWxlczogc3RyaW5nW10sIG9wdGlvbnM/OiBhbnksIHBrZ05hbWUgPSAnJyk6IFByb21pc2U8c3RyaW5nPiB7XHJcbiAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KHJ1bGVzKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gJyc7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAvLyDpnZ7lv4XpgInlj4LmlbDnqbrlgLzml7bkuI3lgZrmoKHpqoxcclxuICAgICAgICAgICAgaWYgKFsnJywgdW5kZWZpbmVkLCBudWxsXS5pbmNsdWRlcyh2YWx1ZSkgJiYgIXJ1bGVzLmluY2x1ZGVzKCdyZXF1aXJlZCcpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJyc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZm9yIChjb25zdCBydWxlIG9mIHJ1bGVzKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB2YWxpZGF0b3IgPSB0aGlzLnZhbGlkYXRvcnNbcGtnTmFtZV0gfHwgdGhpcy5kZWZhdWx0VmFsaWRhdG9yO1xyXG4gICAgICAgICAgICAgICAgaWYgKCF2YWxpZGF0b3IuaGFzKHJ1bGUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBSdWxlICR7cnVsZX0gaXMgbm90IGV4aXN0Lihwa2dOYW1lOiAke3BrZ05hbWV9KWApO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAnJztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNvbnN0IGVyciA9IGF3YWl0IHZhbGlkYXRvci5jaGVja1J1bGVXaXRoTWVzc2FnZShydWxlLCB2YWx1ZSwgb3B0aW9ucyk7XHJcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGVycjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGVycm9yLm1lc3NhZ2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiAnJztcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IHZhbGlkYXRvciA9IG5ldyBWYWxpZGF0b3IoKTtcclxuXHJcbmV4cG9ydCBjb25zdCB2YWxpZGF0b3JNYW5hZ2VyID0gbmV3IFZhbGlkYXRvck1hbmFnZXIoKTtcclxuIl19