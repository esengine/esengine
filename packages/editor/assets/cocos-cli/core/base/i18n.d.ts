import type { I18nKeys } from '../../i18n/types/generated';
declare class I18n {
    _lang: string;
    constructor();
    /**
     * 设置当前语言
     * @param {string} language 语言代码
     */
    setLanguage(language: string): void;
    /**
     * 翻译一个 key
     * 允许翻译变量 {a}，传入的第二个参数 obj 内定义 a
     *
     * @param key 翻译内容对应的 key
     * @param obj 翻译参数
     */
    t(key: I18nKeys, obj?: {
        [key: string]: string;
    }): string;
    /**
     * 翻译 title
     * @param title 原始 title 或者带有 i18n 开头的 title
     */
    transI18nName(name: string): string;
    /**
     * 动态注册语言包的补丁内容
     * @param language 语言代码，例如 zh、en
     * @param patchPath 需要覆盖的 i18n 路径（会作为 key 前缀，使用 “.” 分隔）
     * @param languageData 需要注入的语言数据对象
     */
    registerLanguagePatch(language: string, patchPath: string, languageData: Record<string, any>): void;
}
declare const _default: I18n;
export default _default;
