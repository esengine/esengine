'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const i18n_1 = __importDefault(require("../../i18n"));
class I18n {
    _lang;
    constructor() {
        this._lang = 'en';
    }
    /**
     * 设置当前语言
     * @param {string} language 语言代码
     */
    setLanguage(language) {
        this._lang = language;
        i18n_1.default.changeLanguage(language);
    }
    /**
     * 翻译一个 key
     * 允许翻译变量 {a}，传入的第二个参数 obj 内定义 a
     *
     * @param key 翻译内容对应的 key
     * @param obj 翻译参数
     */
    t(key, obj) {
        // 直接使用 i18next 进行翻译
        return i18n_1.default.t(key, obj);
    }
    /**
     * 翻译 title
     * @param title 原始 title 或者带有 i18n 开头的 title
     */
    transI18nName(name) {
        if (typeof name !== 'string') {
            return '';
        }
        if (name.startsWith('i18n:')) {
            name = name.replace('i18n:', '');
            if (!i18n_1.default.t(name)) {
                console.debug(`${name} is not defined in i18n`);
            }
            return i18n_1.default.t(name) || name;
        }
        return name;
    }
    /**
     * 动态注册语言包的补丁内容
     * @param language 语言代码，例如 zh、en
     * @param patchPath 需要覆盖的 i18n 路径（会作为 key 前缀，使用 “.” 分隔）
     * @param languageData 需要注入的语言数据对象
     */
    registerLanguagePatch(language, patchPath, languageData) {
        if (!language || typeof language !== 'string') {
            console.warn('[i18n] registerLanguagePatch: invalid language', language);
            return;
        }
        if (typeof patchPath !== 'string') {
            console.warn('[i18n] registerLanguagePatch: invalid patch path', patchPath);
            return;
        }
        if (!languageData || typeof languageData !== 'object') {
            console.warn('[i18n] registerLanguagePatch: invalid language data', languageData);
            return;
        }
        const normalizedPrefix = patchPath.replace(/^\.+/, '').trim();
        const entries = {};
        function flatten(obj, prefix) {
            Object.keys(obj).forEach((key) => {
                const value = obj[key];
                const currentKey = prefix ? `${prefix}.${key}` : key;
                if (value && typeof value === 'object' && !Array.isArray(value)) {
                    flatten(value, currentKey);
                }
                else {
                    entries[currentKey] = value;
                }
            });
        }
        flatten(languageData, normalizedPrefix);
        if (Object.keys(entries).length === 0) {
            return;
        }
        i18n_1.default.addResources(language, 'translation', entries);
    }
}
exports.default = new I18n();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaTE4bi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlL2Jhc2UvaTE4bi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7Ozs7O0FBRWIsc0RBQXlDO0FBR3pDLE1BQU0sSUFBSTtJQUNOLEtBQUssQ0FBUztJQUVkO1FBQ0ksSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7SUFDdEIsQ0FBQztJQUVEOzs7T0FHRztJQUNILFdBQVcsQ0FBQyxRQUFnQjtRQUN4QixJQUFJLENBQUMsS0FBSyxHQUFHLFFBQVEsQ0FBQztRQUN0QixjQUFlLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQzdDLENBQUM7SUFFRDs7Ozs7O09BTUc7SUFDSCxDQUFDLENBQUMsR0FBYSxFQUFFLEdBRWhCO1FBQ0csb0JBQW9CO1FBQ3BCLE9BQU8sY0FBZSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDdkMsQ0FBQztJQUNEOzs7T0FHRztJQUNILGFBQWEsQ0FBQyxJQUFZO1FBQ3RCLElBQUksT0FBTyxJQUFJLEtBQUssUUFBUSxFQUFFLENBQUM7WUFDM0IsT0FBTyxFQUFFLENBQUM7UUFDZCxDQUFDO1FBQ0QsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7WUFDM0IsSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBYSxDQUFDO1lBQzdDLElBQUksQ0FBQyxjQUFlLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7Z0JBQzNCLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxJQUFJLHlCQUF5QixDQUFDLENBQUM7WUFDcEQsQ0FBQztZQUNELE9BQU8sY0FBZSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUM7UUFDM0MsQ0FBQztRQUNELE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNILHFCQUFxQixDQUFDLFFBQWdCLEVBQUUsU0FBaUIsRUFBRSxZQUFpQztRQUN4RixJQUFJLENBQUMsUUFBUSxJQUFJLE9BQU8sUUFBUSxLQUFLLFFBQVEsRUFBRSxDQUFDO1lBQzVDLE9BQU8sQ0FBQyxJQUFJLENBQUMsZ0RBQWdELEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDekUsT0FBTztRQUNYLENBQUM7UUFDRCxJQUFJLE9BQU8sU0FBUyxLQUFLLFFBQVEsRUFBRSxDQUFDO1lBQ2hDLE9BQU8sQ0FBQyxJQUFJLENBQUMsa0RBQWtELEVBQUUsU0FBUyxDQUFDLENBQUM7WUFDNUUsT0FBTztRQUNYLENBQUM7UUFDRCxJQUFJLENBQUMsWUFBWSxJQUFJLE9BQU8sWUFBWSxLQUFLLFFBQVEsRUFBRSxDQUFDO1lBQ3BELE9BQU8sQ0FBQyxJQUFJLENBQUMscURBQXFELEVBQUUsWUFBWSxDQUFDLENBQUM7WUFDbEYsT0FBTztRQUNYLENBQUM7UUFFRCxNQUFNLGdCQUFnQixHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQzlELE1BQU0sT0FBTyxHQUF3QixFQUFFLENBQUM7UUFFeEMsU0FBUyxPQUFPLENBQUMsR0FBd0IsRUFBRSxNQUFjO1lBQ3JELE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUU7Z0JBQzdCLE1BQU0sS0FBSyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDdkIsTUFBTSxVQUFVLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLE1BQU0sSUFBSSxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDO2dCQUNyRCxJQUFJLEtBQUssSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUM7b0JBQzlELE9BQU8sQ0FBQyxLQUFLLEVBQUUsVUFBVSxDQUFDLENBQUM7Z0JBQy9CLENBQUM7cUJBQU0sQ0FBQztvQkFDSixPQUFPLENBQUMsVUFBVSxDQUFDLEdBQUcsS0FBSyxDQUFDO2dCQUNoQyxDQUFDO1lBQ0wsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDO1FBRUQsT0FBTyxDQUFDLFlBQVksRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO1FBRXhDLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFLENBQUM7WUFDcEMsT0FBTztRQUNYLENBQUM7UUFFRCxjQUFlLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRSxhQUFhLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDbkUsQ0FBQztDQUNKO0FBRUQsa0JBQWUsSUFBSSxJQUFJLEVBQUUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcclxuXHJcbmltcG9ydCBpMThuZXh0SW5zdGFuY2UgZnJvbSAnLi4vLi4vaTE4bic7XHJcbmltcG9ydCB0eXBlIHsgSTE4bktleXMgfSBmcm9tICcuLi8uLi9pMThuL3R5cGVzL2dlbmVyYXRlZCc7XHJcblxyXG5jbGFzcyBJMThuIHtcclxuICAgIF9sYW5nOiBzdHJpbmc7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5fbGFuZyA9ICdlbic7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDorr7nva7lvZPliY3or63oqIBcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBsYW5ndWFnZSDor63oqIDku6PnoIFcclxuICAgICAqL1xyXG4gICAgc2V0TGFuZ3VhZ2UobGFuZ3VhZ2U6IHN0cmluZykge1xyXG4gICAgICAgIHRoaXMuX2xhbmcgPSBsYW5ndWFnZTtcclxuICAgICAgICBpMThuZXh0SW5zdGFuY2UuY2hhbmdlTGFuZ3VhZ2UobGFuZ3VhZ2UpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog57+76K+R5LiA5LiqIGtleVxyXG4gICAgICog5YWB6K6457+76K+R5Y+Y6YePIHthfe+8jOS8oOWFpeeahOesrOS6jOS4quWPguaVsCBvYmog5YaF5a6a5LmJIGFcclxuICAgICAqIFxyXG4gICAgICogQHBhcmFtIGtleSDnv7vor5HlhoXlrrnlr7nlupTnmoQga2V5XHJcbiAgICAgKiBAcGFyYW0gb2JqIOe/u+ivkeWPguaVsFxyXG4gICAgICovXHJcbiAgICB0KGtleTogSTE4bktleXMsIG9iaj86IHtcclxuICAgICAgICBba2V5OiBzdHJpbmddOiBzdHJpbmc7XHJcbiAgICB9KSB7XHJcbiAgICAgICAgLy8g55u05o6l5L2/55SoIGkxOG5leHQg6L+b6KGM57+76K+RXHJcbiAgICAgICAgcmV0dXJuIGkxOG5leHRJbnN0YW5jZS50KGtleSwgb2JqKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog57+76K+RIHRpdGxlXHJcbiAgICAgKiBAcGFyYW0gdGl0bGUg5Y6f5aeLIHRpdGxlIOaIluiAheW4puaciSBpMThuIOW8gOWktOeahCB0aXRsZVxyXG4gICAgICovXHJcbiAgICB0cmFuc0kxOG5OYW1lKG5hbWU6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBuYW1lICE9PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICByZXR1cm4gJyc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChuYW1lLnN0YXJ0c1dpdGgoJ2kxOG46JykpIHtcclxuICAgICAgICAgICAgbmFtZSA9IG5hbWUucmVwbGFjZSgnaTE4bjonLCAnJykgYXMgSTE4bktleXM7XHJcbiAgICAgICAgICAgIGlmICghaTE4bmV4dEluc3RhbmNlLnQobmFtZSkpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZGVidWcoYCR7bmFtZX0gaXMgbm90IGRlZmluZWQgaW4gaTE4bmApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBpMThuZXh0SW5zdGFuY2UudChuYW1lKSB8fCBuYW1lO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbmFtZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOWKqOaAgeazqOWGjOivreiogOWMheeahOihpeS4geWGheWuuVxyXG4gICAgICogQHBhcmFtIGxhbmd1YWdlIOivreiogOS7o+egge+8jOS+i+WmgiB6aOOAgWVuXHJcbiAgICAgKiBAcGFyYW0gcGF0Y2hQYXRoIOmcgOimgeimhueblueahCBpMThuIOi3r+W+hO+8iOS8muS9nOS4uiBrZXkg5YmN57yA77yM5L2/55SoIOKAnC7igJ0g5YiG6ZqU77yJXHJcbiAgICAgKiBAcGFyYW0gbGFuZ3VhZ2VEYXRhIOmcgOimgeazqOWFpeeahOivreiogOaVsOaNruWvueixoVxyXG4gICAgICovXHJcbiAgICByZWdpc3Rlckxhbmd1YWdlUGF0Y2gobGFuZ3VhZ2U6IHN0cmluZywgcGF0Y2hQYXRoOiBzdHJpbmcsIGxhbmd1YWdlRGF0YTogUmVjb3JkPHN0cmluZywgYW55Pikge1xyXG4gICAgICAgIGlmICghbGFuZ3VhZ2UgfHwgdHlwZW9mIGxhbmd1YWdlICE9PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ1tpMThuXSByZWdpc3Rlckxhbmd1YWdlUGF0Y2g6IGludmFsaWQgbGFuZ3VhZ2UnLCBsYW5ndWFnZSk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHR5cGVvZiBwYXRjaFBhdGggIT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignW2kxOG5dIHJlZ2lzdGVyTGFuZ3VhZ2VQYXRjaDogaW52YWxpZCBwYXRjaCBwYXRoJywgcGF0Y2hQYXRoKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIWxhbmd1YWdlRGF0YSB8fCB0eXBlb2YgbGFuZ3VhZ2VEYXRhICE9PSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ1tpMThuXSByZWdpc3Rlckxhbmd1YWdlUGF0Y2g6IGludmFsaWQgbGFuZ3VhZ2UgZGF0YScsIGxhbmd1YWdlRGF0YSk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IG5vcm1hbGl6ZWRQcmVmaXggPSBwYXRjaFBhdGgucmVwbGFjZSgvXlxcLisvLCAnJykudHJpbSgpO1xyXG4gICAgICAgIGNvbnN0IGVudHJpZXM6IFJlY29yZDxzdHJpbmcsIGFueT4gPSB7fTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZmxhdHRlbihvYmo6IFJlY29yZDxzdHJpbmcsIGFueT4sIHByZWZpeDogc3RyaW5nKSB7XHJcbiAgICAgICAgICAgIE9iamVjdC5rZXlzKG9iaikuZm9yRWFjaCgoa2V5KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZSA9IG9ialtrZXldO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgY3VycmVudEtleSA9IHByZWZpeCA/IGAke3ByZWZpeH0uJHtrZXl9YCA6IGtleTtcclxuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmICFBcnJheS5pc0FycmF5KHZhbHVlKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGZsYXR0ZW4odmFsdWUsIGN1cnJlbnRLZXkpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBlbnRyaWVzW2N1cnJlbnRLZXldID0gdmFsdWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZmxhdHRlbihsYW5ndWFnZURhdGEsIG5vcm1hbGl6ZWRQcmVmaXgpO1xyXG5cclxuICAgICAgICBpZiAoT2JqZWN0LmtleXMoZW50cmllcykubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGkxOG5leHRJbnN0YW5jZS5hZGRSZXNvdXJjZXMobGFuZ3VhZ2UsICd0cmFuc2xhdGlvbicsIGVudHJpZXMpO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBuZXcgSTE4bigpOyJdfQ==