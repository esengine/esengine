import { IVerificationRule } from '../@types';
import { Validator } from './validator';
/**
 * 数据校验类
 */
declare class ValidatorManager {
    private validators;
    private defaultValidator;
    /**
     * 添加校验规则
     * @param name
     * @param func
     * @param pkgName
     */
    addRule(name: string, rule: IVerificationRule, pkgName?: string): void;
    /**
     * 数据校验入口
     * @param value
     * @param rules
     * @param pkgName
     * @param options
     * @return 返回错误提示，数值正常则不报错
     */
    check(value: any, rules: string[], options?: any, pkgName?: string): Promise<string>;
}
export declare const validator: Validator;
export declare const validatorManager: ValidatorManager;
export {};
