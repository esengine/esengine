"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultScriptFileNameCheckConfig = exports.ScriptNameCheckerManager = exports.ScriptNameChecker = void 0;
class ScriptNameChecker {
    classNameStringFormat; // 支持增加前缀或后缀
    requiredCamelCaseClassName;
    static camelFormatReg = /@ccclass([^<]*)(<%CamelCaseClassName%>)/;
    static classNameFormatReg = /@ccclass\(['"]([^'"]*)['"]\)/;
    static commentsReg = /(\n[^\n]*\/\*[\s\S]*?\*\/)|(\n[^\n]*\/\/(?:[^\r\n]|\r(?!\n))*)/g; // 注释区域连同连续的空行
    static invalidClassNameReg = /^[\p{L}\p{Nl}_$][\p{L}\p{Nl}\p{Nd}\p{Mn}\p{Mc}\p{Pc}\$_]*$/u;
    static getDefaultClassName() {
        return DefaultClassName;
    }
    constructor(requiredCamelCaseClassName, classNameStringFormat) {
        this.requiredCamelCaseClassName = requiredCamelCaseClassName;
        this.classNameStringFormat = classNameStringFormat;
    }
    async isValid(fileName) {
        let className = '';
        if (this.requiredCamelCaseClassName) {
            const validName = this.getValidCamelCaseClassName(fileName);
            className = this.classNameStringFormat.replace('<%CamelCaseClassName%>', validName).trim() || validName;
        }
        else {
            const validName = ScriptNameChecker.getValidClassName(fileName);
            className = this.classNameStringFormat.replace('<%UnderscoreCaseClassName%>', validName).trim() || validName;
        }
        if (!className) {
            return { state: 'i18n:assets.operate.errorScriptClassName' };
        }
        return { state: '' };
    }
    async getValidFileName(fileName) {
        fileName = fileName.trim().replace(/[^a-zA-Z0-9_-]/g, '');
        // 此接口被其他位置直接调用，可能传入纯数字如 001，需要处理，否则死循环
        // @ts-ignore
        if (!fileName || isFinite(fileName)) {
            fileName = 'NewComponent';
        }
        const baseName = fileName;
        let index = 0;
        while ((await this.isValid(fileName)).state) {
            // 容错，避免死循环
            if (index > 1000) {
                return fileName;
            }
            index++;
            const padString = `-${index.toString().padStart(3, '0')}`;
            fileName = `${baseName}${padString}`;
        }
        return fileName;
    }
    static getValidClassName(fileName) {
        /**
         * 尽量与文件名称一致
         * 头部不能有数字
         * 不含特殊字符
         * 其他情况包括 className 是某个 js 关键词，就报错出来。
         * 0my class_name-for#demo! 转后为 MyClassNameForDemo
         */
        fileName = fileName.trim().replace(/^[^a-zA-Z_]+/g, '');
        const parts = fileName.match(/[a-zA-Z0-9_]+/g);
        if (parts) {
            return parts.join('_');
        }
        return '';
    }
    getValidCamelCaseClassName(fileName) {
        /**
         * 类名转为大驼峰格式:
         * 头部不能有数字
         * 不含特殊字符
         * 符号和空格作为间隔，每个间隔后的首字母大写，如：
         * 0my class_name-for#demo! 转后为 MyClassNameForDemo
         */
        fileName = fileName.trim().replace(/^[^a-zA-Z]+/g, '');
        const parts = fileName.match(/[a-zA-Z0-9]+/g);
        if (parts) {
            return parts
                .filter(Boolean)
                .map((part) => part[0].toLocaleUpperCase() + part.substr(1))
                .join('');
        }
        return '';
    }
}
exports.ScriptNameChecker = ScriptNameChecker;
class ScriptNameCheckerManager {
    static async getScriptChecker(templateContent) {
        // 识别是否启用驼峰格式的类名
        const nameMatches = templateContent.match(ScriptNameChecker.classNameFormatReg);
        const classNameStringFormat = nameMatches && nameMatches[1] ? nameMatches[1] : '';
        return new ScriptNameChecker(ScriptNameChecker.camelFormatReg.test(templateContent), classNameStringFormat);
    }
}
exports.ScriptNameCheckerManager = ScriptNameCheckerManager;
const DefaultClassName = 'NewComponent';
exports.DefaultScriptFileNameCheckConfig = {
    regStr: ScriptNameChecker.invalidClassNameReg.toString(),
    failedType: 'info',
    failedInfo: 'i18n:engine-extends.importers.script.invalidClassName',
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHMtdXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY29yZS9hc3NldHMvYXNzZXQtaGFuZGxlci9hc3NldHMvdXRpbHMvdHMtdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBRUEsTUFBYSxpQkFBaUI7SUFDMUIscUJBQXFCLENBQVMsQ0FBQyxZQUFZO0lBQzNDLDBCQUEwQixDQUFVO0lBRXBDLE1BQU0sQ0FBQyxjQUFjLEdBQUcseUNBQXlDLENBQUM7SUFDbEUsTUFBTSxDQUFDLGtCQUFrQixHQUFHLDhCQUE4QixDQUFDO0lBQzNELE1BQU0sQ0FBQyxXQUFXLEdBQUcsaUVBQWlFLENBQUMsQ0FBQyxjQUFjO0lBRXRHLE1BQU0sQ0FBQyxtQkFBbUIsR0FBRyw2REFBNkQsQ0FBQztJQUUzRixNQUFNLENBQUMsbUJBQW1CO1FBQ3RCLE9BQU8sZ0JBQWdCLENBQUM7SUFDNUIsQ0FBQztJQUVELFlBQVksMEJBQW1DLEVBQUUscUJBQTZCO1FBQzFFLElBQUksQ0FBQywwQkFBMEIsR0FBRywwQkFBMEIsQ0FBQztRQUM3RCxJQUFJLENBQUMscUJBQXFCLEdBQUcscUJBQXFCLENBQUM7SUFDdkQsQ0FBQztJQUNELEtBQUssQ0FBQyxPQUFPLENBQUMsUUFBZ0I7UUFDMUIsSUFBSSxTQUFTLEdBQUcsRUFBRSxDQUFDO1FBRW5CLElBQUksSUFBSSxDQUFDLDBCQUEwQixFQUFFLENBQUM7WUFDbEMsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLDBCQUEwQixDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQzVELFNBQVMsR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsT0FBTyxDQUFDLHdCQUF3QixFQUFFLFNBQVMsQ0FBQyxDQUFDLElBQUksRUFBRSxJQUFJLFNBQVMsQ0FBQztRQUM1RyxDQUFDO2FBQU0sQ0FBQztZQUNKLE1BQU0sU0FBUyxHQUFHLGlCQUFpQixDQUFDLGlCQUFpQixDQUFDLFFBQVEsQ0FB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QUFJLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDbEYsT0FBTyxJQUFJLGlCQUFpQixDQUFDLGlCQUFpQixDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLEVBQUUscUJBQXFCLENBQUMsQ0FBQztJQUNoSCxDQUFDO0NBQ0o7QUFQRCw0REFPQztBQUNELE1BQU0sZ0JBQWdCLEdBQUcsY0FBYyxDQUFDO0FBRTNCLFFBQUEsZ0NBQWdDLEdBQXdCO0lBQ2pFLE1BQU0sRUFBRSxpQkFBaUIsQ0FBQyxtQkFBbUIsQ0FBQyxRQUFRLEVBQUU7SUFDeEQsVUFBVSxFQUFFLE1BQU07SUFDbEIsVUFBVSxFQUFFLHVEQUF1RDtDQUN0RSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRmlsZU5hbWVDaGVja0NvbmZpZyB9IGZyb20gXCIuLi8uLi8uLi9AdHlwZXMvcHJvdGVjdGVkXCI7XHJcblxyXG5leHBvcnQgY2xhc3MgU2NyaXB0TmFtZUNoZWNrZXIge1xyXG4gICAgY2xhc3NOYW1lU3RyaW5nRm9ybWF0OiBzdHJpbmc7IC8vIOaUr+aMgeWinuWKoOWJjee8gOaIluWQjue8gFxyXG4gICAgcmVxdWlyZWRDYW1lbENhc2VDbGFzc05hbWU6IGJvb2xlYW47XHJcblxyXG4gICAgc3RhdGljIGNhbWVsRm9ybWF0UmVnID0gL0BjY2NsYXNzKFtePF0qKSg8JUNhbWVsQ2FzZUNsYXNzTmFtZSU+KS87XHJcbiAgICBzdGF0aWMgY2xhc3NOYW1lRm9ybWF0UmVnID0gL0BjY2NsYXNzXFwoWydcIl0oW14nXCJdKilbJ1wiXVxcKS87XHJcbiAgICBzdGF0aWMgY29tbWVudHNSZWcgPSAvKFxcblteXFxuXSpcXC9cXCpbXFxzXFxTXSo/XFwqXFwvKXwoXFxuW15cXG5dKlxcL1xcLyg/OlteXFxyXFxuXXxcXHIoPyFcXG4pKSopL2c7IC8vIOazqOmHiuWMuuWfn+i/nuWQjOi/nue7reeahOepuuihjFxyXG5cclxuICAgIHN0YXRpYyBpbnZhbGlkQ2xhc3NOYW1lUmVnID0gL15bXFxwe0x9XFxwe05sfV8kXVtcXHB7TH1cXHB7Tmx9XFxwe05kfVxccHtNbn1cXHB7TWN9XFxwe1BjfVxcJF9dKiQvdTtcclxuXHJcbiAgICBzdGF0aWMgZ2V0RGVmYXVsdENsYXNzTmFtZSgpIHtcclxuICAgICAgICByZXR1cm4gRGVmYXVsdENsYXNzTmFtZTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdHJ1Y3RvcihyZXF1aXJlZENhbWVsQ2FzZUNsYXNzTmFtZTogYm9vbGVhbiwgY2xhc3NOYW1lU3RyaW5nRm9ybWF0OiBzdHJpbmcpIHtcclxuICAgICAgICB0aGlzLnJlcXVpcmVkQ2FtZWxDYXNlQ2xhc3NOYW1lID0gcmVxdWlyZWRDYW1lbENhc2VDbGFzc05hbWU7XHJcbiAgICAgICAgdGhpcy5jbGFzc05hbWVTdHJpbmdGb3JtYXQgPSBjbGFzc05hbWVTdHJpbmdGb3JtYXQ7XHJcbiAgICB9XHJcbiAgICBhc3luYyBpc1ZhbGlkKGZpbGVOYW1lOiBzdHJpbmcpIHtcclxuICAgICAgICBsZXQgY2xhc3NOYW1lID0gJyc7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLnJlcXVpcmVkQ2FtZWxDYXNlQ2xhc3NOYW1lKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHZhbGlkTmFtZSA9IHRoaXMuZ2V0VmFsaWRDYW1lbENhc2VDbGFzc05hbWUoZmlsZU5hbWUpO1xyXG4gICAgICAgICAgICBjbGFzc05hbWUgPSB0aGlzLmNsYXNzTmFtZVN0cmluZ0Zvcm1hdC5yZXBsYWNlKCc8JUNhbWVsQ2FzZUNsYXNzTmFtZSU+JywgdmFsaWROYW1lKS50cmltKCkgfHwgdmFsaWROYW1lO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHZhbGlkTmFtZSA9IFNjcmlwdE5hbWVDaGVja2VyLmdldFZhbGlkQ2xhc3NOYW1lKGZpbGVOYW1lKTtcclxuICAgICAgICAgICAgY2xhc3NOYW1lID0gdGhpcy5jbGFzc05hbWVTdHJpbmdGb3JtYXQucmVwbGFjZSgnPCVVbmRlcnNjb3JlQ2FzZUNsYXNzTmFtZSU+JywgdmFsaWROYW1lKS50cmltKCkgfHwgdmFsaWROYW1lO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCFjbGFzc05hbWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHsgc3RhdGU6ICdpMThuOmFzc2V0cy5vcGVyYXRlLmVycm9yU2NyaXB0Q2xhc3NOYW1lJyB9O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHsgc3RhdGU6ICcnIH07XHJcbiAgICB9XHJcbiAgICBhc3luYyBnZXRWYWxpZEZpbGVOYW1lKGZpbGVOYW1lOiBzdHJpbmcpIHtcclxuICAgICAgICBmaWxlTmFtZSA9IGZpbGVOYW1lLnRyaW0oKS5yZXBsYWNlKC9bXmEtekEtWjAtOV8tXS9nLCAnJyk7XHJcblxyXG4gICAgICAgIC8vIOatpOaOpeWPo+iiq+WFtuS7luS9jee9ruebtOaOpeiwg+eUqO+8jOWPr+iDveS8oOWFpee6r+aVsOWtl+WmgiAwMDHvvIzpnIDopoHlpITnkIbvvIzlkKbliJnmrbvlvqrnjq9cclxuICAgICAgICAvLyBAdHMtaWdub3JlXHJcbiAgICAgICAgaWYgKCFmaWxlTmFtZSB8fCBpc0Zpbml0ZShmaWxlTmFtZSkpIHtcclxuICAgICAgICAgICAgZmlsZU5hbWUgPSAnTmV3Q29tcG9uZW50JztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGJhc2VOYW1lID0gZmlsZU5hbWU7XHJcbiAgICAgICAgbGV0IGluZGV4ID0gMDtcclxuICAgICAgICB3aGlsZSAoKGF3YWl0IHRoaXMuaXNWYWxpZChmaWxlTmFtZSkpLnN0YXRlKSB7XHJcbiAgICAgICAgICAgIC8vIOWuuemUme+8jOmBv+WFjeatu+W+queOr1xyXG4gICAgICAgICAgICBpZiAoaW5kZXggPiAxMDAwKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmlsZU5hbWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaW5kZXgrKztcclxuICAgICAgICAgICAgY29uc3QgcGFkU3RyaW5nID0gYC0ke2luZGV4LnRvU3RyaW5nKCkucGFkU3RhcnQoMywgJzAnKX1gO1xyXG4gICAgICAgICAgICBmaWxlTmFtZSA9IGAke2Jhc2VOYW1lfSR7cGFkU3RyaW5nfWA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZmlsZU5hbWU7XHJcbiAgICB9XHJcbiAgICBzdGF0aWMgZ2V0VmFsaWRDbGFzc05hbWUoZmlsZU5hbWU6IHN0cmluZykge1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIOWwvemHj+S4juaWh+S7tuWQjeensOS4gOiHtFxyXG4gICAgICAgICAqIOWktOmDqOS4jeiDveacieaVsOWtl1xyXG4gICAgICAgICAqIOS4jeWQq+eJueauiuWtl+esplxyXG4gICAgICAgICAqIOWFtuS7luaDheWGteWMheaLrCBjbGFzc05hbWUg5piv5p+Q5LiqIGpzIOWFs+mUruivje+8jOWwseaKpemUmeWHuuadpeOAglxyXG4gICAgICAgICAqIDBteSBjbGFzc19uYW1lLWZvciNkZW1vISDovazlkI7kuLogTXlDbGFzc05hbWVGb3JEZW1vXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZmlsZU5hbWUgPSBmaWxlTmFtZS50cmltKCkucmVwbGFjZSgvXlteYS16QS1aX10rL2csICcnKTtcclxuICAgICAgICBjb25zdCBwYXJ0cyA9IGZpbGVOYW1lLm1hdGNoKC9bYS16QS1aMC05X10rL2cpO1xyXG4gICAgICAgIGlmIChwYXJ0cykge1xyXG4gICAgICAgICAgICByZXR1cm4gcGFydHMuam9pbignXycpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuICcnO1xyXG4gICAgfVxyXG5cclxuICAgIGdldFZhbGlkQ2FtZWxDYXNlQ2xhc3NOYW1lKGZpbGVOYW1lOiBzdHJpbmcpIHtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiDnsbvlkI3ovazkuLrlpKfpqbzls7DmoLzlvI86XHJcbiAgICAgICAgICog5aS06YOo5LiN6IO95pyJ5pWw5a2XXHJcbiAgICAgICAgICog5LiN5ZCr54m55q6K5a2X56ymXHJcbiAgICAgICAgICog56ym5Y+35ZKM56m65qC85L2c5Li66Ze06ZqU77yM5q+P5Liq6Ze06ZqU5ZCO55qE6aaW5a2X5q+N5aSn5YaZ77yM5aaC77yaXHJcbiAgICAgICAgICogMG15IGNsYXNzX25hbWUtZm9yI2RlbW8hIOi9rOWQjuS4uiBNeUNsYXNzTmFtZUZvckRlbW9cclxuICAgICAgICAgKi9cclxuICAgICAgICBmaWxlTmFtZSA9IGZpbGVOYW1lLnRyaW0oKS5yZXBsYWNlKC9eW15hLXpBLVpdKy9nLCAnJyk7XHJcbiAgICAgICAgY29uc3QgcGFydHMgPSBmaWxlTmFtZS5tYXRjaCgvW2EtekEtWjAtOV0rL2cpO1xyXG4gICAgICAgIGlmIChwYXJ0cykge1xyXG4gICAgICAgICAgICByZXR1cm4gcGFydHNcclxuICAgICAgICAgICAgICAgIC5maWx0ZXIoQm9vbGVhbilcclxuICAgICAgICAgICAgICAgIC5tYXAoKHBhcnQpID0+IHBhcnRbMF0udG9Mb2NhbGVVcHBlckNhc2UoKSArIHBhcnQuc3Vic3RyKDEpKVxyXG4gICAgICAgICAgICAgICAgLmpvaW4oJycpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuICcnO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgU2NyaXB0TmFtZUNoZWNrZXJNYW5hZ2VyIHtcclxuICAgIHN0YXRpYyBhc3luYyBnZXRTY3JpcHRDaGVja2VyKHRlbXBsYXRlQ29udGVudDogc3RyaW5nKSB7XHJcbiAgICAgICAgLy8g6K+G5Yir5piv5ZCm5ZCv55So6am85bOw5qC85byP55qE57G75ZCNXHJcbiAgICAgICAgY29uc3QgbmFtZU1hdGNoZXMgPSB0ZW1wbGF0ZUNvbnRlbnQubWF0Y2goU2NyaXB0TmFtZUNoZWNrZXIuY2xhc3NOYW1lRm9ybWF0UmVnKTtcclxuICAgICAgICBjb25zdCBjbGFzc05hbWVTdHJpbmdGb3JtYXQgPSBuYW1lTWF0Y2hlcyAmJiBuYW1lTWF0Y2hlc1sxXSA/IG5hbWVNYXRjaGVzWzFdIDogJyc7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBTY3JpcHROYW1lQ2hlY2tlcihTY3JpcHROYW1lQ2hlY2tlci5jYW1lbEZvcm1hdFJlZy50ZXN0KHRlbXBsYXRlQ29udGVudCksIGNsYXNzTmFtZVN0cmluZ0Zvcm1hdCk7XHJcbiAgICB9XHJcbn1cclxuY29uc3QgRGVmYXVsdENsYXNzTmFtZSA9ICdOZXdDb21wb25lbnQnO1xyXG5cclxuZXhwb3J0IGNvbnN0IERlZmF1bHRTY3JpcHRGaWxlTmFtZUNoZWNrQ29uZmlnOiBGaWxlTmFtZUNoZWNrQ29uZmlnID0ge1xyXG4gICAgcmVnU3RyOiBTY3JpcHROYW1lQ2hlY2tlci5pbnZhbGlkQ2xhc3NOYW1lUmVnLnRvU3RyaW5nKCksXHJcbiAgICBmYWlsZWRUeXBlOiAnaW5mbycsXHJcbiAgICBmYWlsZWRJbmZvOiAnaTE4bjplbmdpbmUtZXh0ZW5kcy5pbXBvcnRlcnMuc2NyaXB0LmludmFsaWRDbGFzc05hbWUnLFxyXG59O1xyXG4iXX0=