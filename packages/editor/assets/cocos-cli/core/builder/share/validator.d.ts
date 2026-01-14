import { IInternalVerificationRule, IVerificationRule } from '../@types';
export declare class Validator {
    private static internalVerifyRules;
    static addRule(ruleName: string, rule: IInternalVerificationRule): void;
    private customVerifyRules;
    has(ruleName: string): boolean;
    queryRuleMessage(ruleName: string): string;
    checkWithInternalRule(ruleName: string, value: any, ...arg: any[]): boolean;
    check(ruleName: string, value: any, ...arg: any[]): Promise<boolean>;
    checkRuleWithMessage(ruleName: string, value: any, ...arg: any[]): Promise<string>;
    add(ruleName: string, rule: IVerificationRule): void;
}
