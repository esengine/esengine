"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuildTemplate = void 0;
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const i18n_1 = __importDefault(require("../../../../base/i18n"));
const utils_1 = __importDefault(require("../../../../base/utils"));
const builder_config_1 = __importDefault(require("../../../share/builder-config"));
class BuildTemplate {
    _buildTemplateDirs = [];
    map = {};
    _versionUser = '';
    config;
    get isEnable() {
        return !!this._buildTemplateDirs.length;
    }
    constructor(platform, taskName, config) {
        this.config = config;
        const buildTemplateDir = builder_config_1.default.buildTemplateDir;
        // 初始化不同层级的构建模板地址，按照使用优先级从大到小排布
        const commonDir = (0, path_1.join)(buildTemplateDir, 'common');
        const platformDir = (0, path_1.join)(buildTemplateDir, this.config?.dirname || platform);
        const taskDir = (0, path_1.join)(buildTemplateDir, taskName);
        if ((0, fs_extra_1.existsSync)(taskDir)) {
            this._buildTemplateDirs.push(taskDir);
        }
        if ((0, fs_extra_1.existsSync)(platformDir)) {
            this._buildTemplateDirs.push(platformDir);
        }
        if ((0, fs_extra_1.existsSync)(commonDir)) {
            this._buildTemplateDirs.push(commonDir);
        }
        const internalTemplate = {
            application: 'application.ejs',
        };
        Object.keys(internalTemplate).forEach((name) => {
            this.initUrl(internalTemplate[name], name);
        });
        // 初始化缓存版本号
        this._initVersion(platform);
    }
    query(name) {
        return this.map[name]?.path;
    }
    async _initVersion(platform) {
        if (!this.config) {
            return;
        }
        try {
            // 默认构建模板需要有版本号
            const templateVersionJson = (0, path_1.join)(builder_config_1.default.buildTemplateDir, 'templates-version.json');
            // 用户模板版本号
            if ((0, fs_extra_1.existsSync)(templateVersionJson)) {
                this._versionUser = (await (0, fs_extra_1.readJSON)(templateVersionJson))[platform];
            }
            this._versionUser = this._versionUser || '1.0.0';
            // 用户构建模板版本小于默认构建模板版本，警告建议更新
            if (utils_1.default.Parse.compareVersion(this.config.version, this._versionUser)) {
                console.warn(i18n_1.default.t('builder.tips.template_version_warning', {
                    version: this._versionUser,
                    internalConfig: this.config.version,
                    platform,
                }));
            }
        }
        catch (error) {
            console.debug(error);
        }
    }
    findFile(relativeUrl) {
        for (let i = 0; i < this._buildTemplateDirs.length; i++) {
            const dir = this._buildTemplateDirs[i];
            const path = (0, path_1.join)(dir, relativeUrl);
            if ((0, fs_extra_1.existsSync)(path)) {
                return path;
            }
        }
        return '';
    }
    initUrl(relativeUrl, name) {
        const path = this.findFile(relativeUrl);
        name = name || (0, path_1.basename)(relativeUrl);
        if (path) {
            this.map[name] = {
                path,
                url: relativeUrl,
            };
            return path;
        }
    }
    async copyTo(dest) {
        // 按照优先级拷贝构建模板
        for (let index = (this._buildTemplateDirs.length - 1); index >= 0; index--) {
            const dir = this._buildTemplateDirs[index];
            await (0, fs_extra_1.copy)(dir, dest);
        }
        // 移除已经被处理的一些特殊的文件夹
        await Promise.all(Object.values(this.map).map((info) => {
            return (0, fs_extra_1.remove)((0, path_1.join)(dest, info.url));
        }));
    }
}
exports.BuildTemplate = BuildTemplate;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVpbGQtdGVtcGxhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY29yZS9idWlsZGVyL3dvcmtlci9idWlsZGVyL21hbmFnZXIvYnVpbGQtdGVtcGxhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsdUNBQThEO0FBQzlELCtCQUFzQztBQUN0QyxpRUFBeUM7QUFHekMsbUVBQTJDO0FBQzNDLG1GQUEwRDtBQUUxRCxNQUFhLGFBQWE7SUFDdEIsa0JBQWtCLEdBQWEsRUFBRSxDQUFDO0lBQ2xDLEdBQUcsR0FHRSxFQUFFLENBQUM7SUFDUixZQUFZLEdBQUcsRUFBRSxDQUFDO0lBQ2xCLE1BQU0sQ0FBdUI7SUFDN0IsSUFBSSxRQUFRO1FBQ1IsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQztJQUM1QyxDQUFDO0lBRUQsWUFBWSxRQUEyQixFQUFFLFFBQWdCLEVBQUUsTUFBNEI7UUFDbkYsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFDckIsTUFBTSxnQkFBZ0IsR0FBSSx3QkFBYSxDQUFDLGdCQUFnQixDQUFDO1FBQ3pELCtCQUErQjtRQUMvQixNQUFNLFNBQVMsR0FBRyxJQUFBLFdBQUksRUFBQyxnQkFBZ0IsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUNuRCxNQUFNLFdBQVcsR0FBRyxJQUFBLFdBQUksRUFBQyxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLE9BQU8sSUFBSSxRQUFRLENBQUMsQ0FBQztRQUM3RSxNQUFNLE9BQU8sR0FBRyxJQUFBLFdBQUksRUFBQyxnQkFBZ0IsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUNqRCxJQUFJLElBQUEscUJBQVUsRUFBQyxPQUFPLENBQUMsRUFBRSxDQUFDO1lBQ3RCLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDMUMsQ0FBQztRQUNELElB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QUMsV0FBVyxDQUFDLENBQUM7UUFDeEMsSUFBSSxHQUFHLElBQUksSUFBSSxJQUFBLGVBQVEsRUFBQyxXQUFXLENBQUMsQ0FBQztRQUNyQyxJQUFJLElBQUksRUFBRSxDQUFDO1lBQ1AsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRztnQkFDYixJQUFJO2dCQUNKLEdBQUcsRUFBRSxXQUFXO2FBQ25CLENBQUM7WUFDRixPQUFPLElBQUksQ0FBQztRQUNoQixDQUFDO0lBQ0wsQ0FBQztJQUVELEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBWTtRQUNyQixjQUFjO1FBQ2QsS0FBSyxJQUFJLEtBQUssR0FBRyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEVBQUUsS0FBSyxJQUFJLENBQUMsRUFBRSxLQUFLLEVBQUUsRUFBRSxDQUFDO1lBQ3pFLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUMzQyxNQUFNLElBQUEsZUFBSSxFQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUMxQixDQUFDO1FBQ0QsbUJBQW1CO1FBQ25CLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRTtZQUNuRCxPQUFPLElBQUEsaUJBQU0sRUFBQyxJQUFBLFdBQUksRUFBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDeEMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNSLENBQUM7Q0FDSjtBQXRHRCxzQ0FzR0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBleGlzdHNTeW5jLCBjb3B5LCByZW1vdmUsIHJlYWRKU09OIH0gZnJvbSAnZnMtZXh0cmEnO1xyXG5pbXBvcnQgeyBiYXNlbmFtZSwgam9pbiB9IGZyb20gJ3BhdGgnO1xyXG5pbXBvcnQgaTE4biBmcm9tICcuLi8uLi8uLi8uLi9iYXNlL2kxOG4nO1xyXG5pbXBvcnQgeyBQbGF0Zm9ybSB9IGZyb20gJy4uLy4uLy4uL0B0eXBlcyc7XHJcbmltcG9ydCB7IElCdWlsZFRlbXBsYXRlLCBCdWlsZFRlbXBsYXRlQ29uZmlnIH0gZnJvbSAnLi4vLi4vLi4vQHR5cGVzL3Byb3RlY3RlZCc7XHJcbmltcG9ydCB1dGlscyBmcm9tICcuLi8uLi8uLi8uLi9iYXNlL3V0aWxzJztcclxuaW1wb3J0IGJ1aWxkZXJDb25maWcgZnJvbSAnLi4vLi4vLi4vc2hhcmUvYnVpbGRlci1jb25maWcnO1xyXG5cclxuZXhwb3J0IGNsYXNzIEJ1aWxkVGVtcGxhdGUgaW1wbGVtZW50cyBJQnVpbGRUZW1wbGF0ZSB7XHJcbiAgICBfYnVpbGRUZW1wbGF0ZURpcnM6IHN0cmluZ1tdID0gW107XHJcbiAgICBtYXA6IFJlY29yZDxzdHJpbmcsIHtcclxuICAgICAgICB1cmw6IHN0cmluZztcclxuICAgICAgICBwYXRoOiBzdHJpbmc7XHJcbiAgICB9PiA9IHt9O1xyXG4gICAgX3ZlcnNpb25Vc2VyID0gJyc7XHJcbiAgICBjb25maWc/OiBCdWlsZFRlbXBsYXRlQ29uZmlnO1xyXG4gICAgZ2V0IGlzRW5hYmxlKCkge1xyXG4gICAgICAgIHJldHVybiAhIXRoaXMuX2J1aWxkVGVtcGxhdGVEaXJzLmxlbmd0aDtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdHJ1Y3RvcihwbGF0Zm9ybTogUGxhdGZvcm0gfCBzdHJpbmcsIHRhc2tOYW1lOiBzdHJpbmcsIGNvbmZpZz86IEJ1aWxkVGVtcGxhdGVDb25maWcpIHtcclxuICAgICAgICB0aGlzLmNvbmZpZyA9IGNvbmZpZztcclxuICAgICAgICBjb25zdCBidWlsZFRlbXBsYXRlRGlyICA9IGJ1aWxkZXJDb25maWcuYnVpbGRUZW1wbGF0ZURpcjtcclxuICAgICAgICAvLyDliJ3lp4vljJbkuI3lkIzlsYLnuqfnmoTmnoTlu7rmqKHmnb/lnLDlnYDvvIzmjInnhafkvb/nlKjkvJjlhYjnuqfku47lpKfliLDlsI/mjpLluINcclxuICAgICAgICBjb25zdCBjb21tb25EaXIgPSBqb2luKGJ1aWxkVGVtcGxhdGVEaXIsICdjb21tb24nKTtcclxuICAgICAgICBjb25zdCBwbGF0Zm9ybURpciA9IGpvaW4oYnVpbGRUZW1wbGF0ZURpciwgdGhpcy5jb25maWc/LmRpcm5hbWUgfHwgcGxhdGZvcm0pO1xyXG4gICAgICAgIGNvbnN0IHRhc2tEaXIgPSBqb2luKGJ1aWxkVGVtcGxhdGVEaXIsIHRhc2tOYW1lKTtcclxuICAgICAgICBpZiAoZXhpc3RzU3luYyh0YXNrRGlyKSkge1xyXG4gICAgICAgICAgICB0aGlzLl9idWlsZFRlbXBsYXRlRGlycy5wdXNoKHRhc2tEaXIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZXhpc3RzU3luYyhwbGF0Zm9ybURpcikpIHtcclxuICAgICAgICAgICAgdGhpcy5fYnVpbGRUZW1wbGF0ZURpcnMucHVzaChwbGF0Zm9ybURpcik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChleGlzdHNTeW5jKGNvbW1vbkRpcikpIHtcclxuICAgICAgICAgICAgdGhpcy5fYnVpbGRUZW1wbGF0ZURpcnMucHVzaChjb21tb25EaXIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBpbnRlcm5hbFRlbXBsYXRlOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xyXG4gICAgICAgICAgICBhcHBsaWNhdGlvbjogJ2FwcGxpY2F0aW9uLmVqcycsXHJcbiAgICAgICAgfTtcclxuICAgICAgICBPYmplY3Qua2V5cyhpbnRlcm5hbFRlbXBsYXRlKS5mb3JFYWNoKChuYW1lKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuaW5pdFVybChpbnRlcm5hbFRlbXBsYXRlW25hbWVdLCBuYW1lKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8g5Yid5aeL5YyW57yT5a2Y54mI5pys5Y+3XHJcbiAgICAgICAgdGhpcy5faW5pdFZlcnNpb24ocGxhdGZvcm0pO1xyXG4gICAgfVxyXG5cclxuICAgIHF1ZXJ5KG5hbWU6IHN0cmluZykge1xyXG4gICAgICAgIHJldHVybiB0aGlzLm1hcFtuYW1lXT8ucGF0aDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFzeW5jIF9pbml0VmVyc2lvbihwbGF0Zm9ybTogc3RyaW5nKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLmNvbmZpZykge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIC8vIOm7mOiupOaehOW7uuaooeadv+mcgOimgeacieeJiOacrOWPt1xyXG4gICAgICAgICAgICBjb25zdCB0ZW1wbGF0ZVZlcnNpb25Kc29uID0gam9pbihidWlsZGVyQ29uZmlnLmJ1aWxkVGVtcGxhdGVEaXIsICd0ZW1wbGF0ZXMtdmVyc2lvbi5qc29uJyk7XHJcbiAgICAgICAgICAgIC8vIOeUqOaIt+aooeadv+eJiOacrOWPt1xyXG4gICAgICAgICAgICBpZiAoZXhpc3RzU3luYyh0ZW1wbGF0ZVZlcnNpb25Kc29uKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fdmVyc2lvblVzZXIgPSAoYXdhaXQgcmVhZEpTT04odGVtcGxhdGVWZXJzaW9uSnNvbikpW3BsYXRmb3JtXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLl92ZXJzaW9uVXNlciA9IHRoaXMuX3ZlcnNpb25Vc2VyIHx8ICcxLjAuMCc7XHJcbiAgICAgICAgICAgIC8vIOeUqOaIt+aehOW7uuaooeadv+eJiOacrOWwj+S6jum7mOiupOaehOW7uuaooeadv+eJiOacrO+8jOitpuWRiuW7uuiuruabtOaWsFxyXG4gICAgICAgICAgICBpZiAodXRpbHMuUGFyc2UuY29tcGFyZVZlcnNpb24odGhpcy5jb25maWcudmVyc2lvbiwgdGhpcy5fdmVyc2lvblVzZXIpKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oaTE4bi50KCdidWlsZGVyLnRpcHMudGVtcGxhdGVfdmVyc2lvbl93YXJuaW5nJywge1xyXG4gICAgICAgICAgICAgICAgICAgIHZlcnNpb246IHRoaXMuX3ZlcnNpb25Vc2VyLFxyXG4gICAgICAgICAgICAgICAgICAgIGludGVybmFsQ29uZmlnOiB0aGlzLmNvbmZpZy52ZXJzaW9uLFxyXG4gICAgICAgICAgICAgICAgICAgIHBsYXRmb3JtLFxyXG4gICAgICAgICAgICAgICAgfSkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgY29uc29sZS5kZWJ1ZyhlcnJvcik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZpbmRGaWxlKHJlbGF0aXZlVXJsOiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5fYnVpbGRUZW1wbGF0ZURpcnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgY29uc3QgZGlyID0gdGhpcy5fYnVpbGRUZW1wbGF0ZURpcnNbaV07XHJcbiAgICAgICAgICAgIGNvbnN0IHBhdGggPSBqb2luKGRpciwgcmVsYXRpdmVVcmwpO1xyXG4gICAgICAgICAgICBpZiAoZXhpc3RzU3luYyhwYXRoKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHBhdGg7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuICcnO1xyXG4gICAgfVxyXG5cclxuICAgIGluaXRVcmwocmVsYXRpdmVVcmw6IHN0cmluZywgbmFtZT86IHN0cmluZykge1xyXG4gICAgICAgIGNvbnN0IHBhdGggPSB0aGlzLmZpbmRGaWxlKHJlbGF0aXZlVXJsKTtcclxuICAgICAgICBuYW1lID0gbmFtZSB8fCBiYXNlbmFtZShyZWxhdGl2ZVVybCk7XHJcbiAgICAgICAgaWYgKHBhdGgpIHtcclxuICAgICAgICAgICAgdGhpcy5tYXBbbmFtZV0gPSB7XHJcbiAgICAgICAgICAgICAgICBwYXRoLFxyXG4gICAgICAgICAgICAgICAgdXJsOiByZWxhdGl2ZVVybCxcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgcmV0dXJuIHBhdGg7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIGNvcHlUbyhkZXN0OiBzdHJpbmcpIHtcclxuICAgICAgICAvLyDmjInnhafkvJjlhYjnuqfmi7fotJ3mnoTlu7rmqKHmnb9cclxuICAgICAgICBmb3IgKGxldCBpbmRleCA9ICh0aGlzLl9idWlsZFRlbXBsYXRlRGlycy5sZW5ndGggLSAxKTsgaW5kZXggPj0gMDsgaW5kZXgtLSkge1xyXG4gICAgICAgICAgICBjb25zdCBkaXIgPSB0aGlzLl9idWlsZFRlbXBsYXRlRGlyc1tpbmRleF07XHJcbiAgICAgICAgICAgIGF3YWl0IGNvcHkoZGlyLCBkZXN0KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8g56e76Zmk5bey57uP6KKr5aSE55CG55qE5LiA5Lqb54m55q6K55qE5paH5Lu25aS5XHJcbiAgICAgICAgYXdhaXQgUHJvbWlzZS5hbGwoT2JqZWN0LnZhbHVlcyh0aGlzLm1hcCkubWFwKChpbmZvKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiByZW1vdmUoam9pbihkZXN0LCBpbmZvLnVybCkpO1xyXG4gICAgICAgIH0pKTtcclxuICAgIH1cclxufVxyXG4iXX0=