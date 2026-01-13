'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cc_1 = require("cc");
const utils_1 = require("./utils");
const asset_1 = __importDefault(require("./asset"));
const decode_1 = require("./decode");
const encode_1 = require("./encode");
// import * as dumpDecode from './decode';
const { get } = require('lodash');
// dump接口,统一下全局引用
class DumpUtil {
    // 获取节点的某个属性
    dumpProperty(node, path) {
        if (path === '') {
            //return this.dumpNode(node);
        }
        // 通过路径找到对象，然后dump这个对象
        const info = (0, utils_1.parsingPath)(path, node);
        // 获取需要修改的数据
        const data = info.search ? get(node, info.search) : node;
        const attr = cc_1.CCClass.Attr.getClassAttrs(data.constructor);
        const ret = (0, encode_1.encodeObject)(data, attr);
        return ret;
    }
    dumpComponent(comp) {
        if (!comp) {
            return null;
        }
        return (0, encode_1.encodeComponent)(comp);
    }
    /**
     * 恢复一个 dump 数据到 property
     * @param node
     * @param path
     * @param dump
     */
    async restoreProperty(node, path, dump) {
        // 还原整个 component
        if (/^__comps__\.\d+$/.test(path)) {
            if (typeof dump.value === 'object') {
                for (const key in dump.value) {
                    // @ts-ignore
                    await (0, decode_1.decodePatch)(`${path}.${key}`, dump.value[key], node);
                }
            }
        }
        else {
            // 还原单个属性
            return (0, decode_1.decodePatch)(path, dump, node);
        }
    }
    /**
     * 恢复某个属性的默认数据
     * @param node
     * @param path
     */
    resetProperty(node, path) {
        return (0, decode_1.resetProperty)(node, path);
    }
    /**
     * 将一个属性其现存值与定义类型值不匹配，或者为 null 默认值，改为一个可编辑的值
     * @param node
     * @param path
     */
    updatePropertyFromNull(node, path) {
        return (0, decode_1.updatePropertyFromNull)(node, path);
    }
    /**
     * 解析节点的访问路径
     * @param path
     * @returns
     */
    parsingPath(path, data) {
        return (0, utils_1.parsingPath)(path, data);
    }
    /**
     * encodeObject
     */
    encodeObject(object, attributes, owner = null, objectKey) {
        return (0, encode_1.encodeObject)(object, attributes, owner, objectKey);
    }
    /**
     * 获取类型的默认dump数据
     * @param type
     * @returns
     */
    getDefaultValue(type) {
        if (!type) {
            return null;
        }
        let value = asset_1.default.getDefaultValue(type, null);
        if (!value) {
            const ccType = cc_1.js.getClassByName(type);
            value = ccType ? new ccType() : null;
        }
        return value;
    }
}
exports.default = new DumpUtil();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY29yZS9zY2VuZS9zY2VuZS1wcm9jZXNzL3NlcnZpY2UvZHVtcC9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7Ozs7O0FBQ2IsMkJBQWtEO0FBQ2xELG1DQUFzQztBQUN0QyxvREFBZ0M7QUFDaEMscUNBQThFO0FBQzlFLHFDQUF5RDtBQUd6RCwwQ0FBMEM7QUFDMUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUVsQyxpQkFBaUI7QUFDakIsTUFBTSxRQUFRO0lBQ1YsWUFBWTtJQUNaLFlBQVksQ0FBQyxJQUFVLEVBQUUsSUFBWTtRQUNqQyxJQUFJLElBQUksS0FBSyxFQUFFLEVBQUUsQ0FBQztZQUNkLDZCQUE2QjtRQUNqQyxDQUFDO1FBQ0Qsc0JBQXNCO1FBQ3RCLE1BQU0sSUFBSSxHQUFHLElBQUEsbUJBQVcsRUFBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDckMsWUFBWTtRQUNaLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFDekQsTUFBTSxJQUFJLEdBQUcsWUFBTyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQzFELE1BQU0sR0FBRyxHQUFHLElBQUEscUJBQVksRUFBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDckMsT0FBTyxHQUFHLENBQUM7SUFDZixDQUFDO0lBS0QsYUFBYSxDQUFDLElBQWtDO1FBQzVDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNSLE9BQU8sSUFBSSxDQUFDO1FBQ2hCLENBQUM7UUFDRCxPQUFPLElBQUEsd0JBQWUsRUFBQyxJQUFJLENBQUMsQ0FBQztJQUNqQyxDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSCxLQUFLLENBQUMsZUFBZSxDQUFDLElBQXNCLEVBQUUsSUFBWSxFQUFFLElBQVM7UUFDakUsaUJBQWlCO1FBQ2pCLElBQUksa0JBQWtCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7WUFDaEMsSUFBSSxPQUFPLElBQUksQ0FBQyxLQUFLLEtBQUssUUFBUSxFQUFFLENBQUM7Z0JBQ2pDLEtBQUssTUFBTSxHQUFHLElBQUksSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO29CQUMzQixhQUFhO29CQUNiLE1BQU0sSUFBQSxvQkFBVyxFQUFDLEdBQUcsSUFBSSxJQUFJLEdBQUcsRUFBRSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQy9ELENBQUM7WUFDTCxDQUFDO1FBQ0wsQ0FBQzthQUFNLENBQUM7WUFDSixTQUFTO1lBQ1QsT0FBTyxJQUFBLG9CQUFXLEVBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztRQUN6QyxDQUFDO0lBQ0wsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxhQUFhLENBQUMsSUFBc0IsRUFBRSxJQUFZO1FBQzlDLE9BQU8sSUFBQSxzQkFBYSxFQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNyQyxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILHNCQUFzQixDQUFDLElBQXNCLEVBQUUsSUFBWTtRQUN2RCxPQUFPLElBQUEsK0JBQXNCLEVBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQzlDLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsV0FBVyxDQUFDLElBQVksRUFBRSxJQUFTO1FBQy9CLE9BQU8sSUFBQSxtQkFBVyxFQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNuQyxDQUFDO0lBRUQ7O09BRUc7SUFDSCxZQUFZLENBQUMsTUFBVyxFQUFFLFVBQWUsRUFBRSxRQUFhLElBQUksRUFBRSxTQUFrQjtRQUM1RSxPQUFPLElBQUEscUJBQVksRUFBQyxNQUFNLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxTQUFTLENBQUMsQ0FBQztJQUM5RCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILGVBQWUsQ0FBQyxJQUF3QjtRQUNwQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDUixPQUFPLElBQUksQ0FBQztRQUNoQixDQUFDO1FBQ0QsSUFBSSxLQUFLLEdBQUcsZUFBUyxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDbEQsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ1QsTUFBTSxNQUFNLEdBQUcsT0FBRSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN2QyxLQUFLLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFDekMsQ0FBQztRQUNELE9BQU8sS0FBSyxDQUFDO0lBQ2pCLENBQUM7Q0FFSjtBQUVELGtCQUFlLElBQUksUUFBUSxFQUFFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XHJcbmltcG9ydCB7IE5vZGUsIENvbXBvbmVudCwganMsIENDQ2xhc3MgfSBmcm9tICdjYyc7XHJcbmltcG9ydCB7IHBhcnNpbmdQYXRoIH0gZnJvbSAnLi91dGlscyc7XHJcbmltcG9ydCBBc3NldFV0aWwgZnJvbSAnLi9hc3NldCc7XHJcbmltcG9ydCB7IGRlY29kZVBhdGNoLCByZXNldFByb3BlcnR5LCB1cGRhdGVQcm9wZXJ0eUZyb21OdWxsIH0gZnJvbSAnLi9kZWNvZGUnO1xyXG5pbXBvcnQgeyBlbmNvZGVPYmplY3QsIGVuY29kZUNvbXBvbmVudCB9IGZyb20gJy4vZW5jb2RlJztcclxuaW1wb3J0IHsgSUNvbXBvbmVudCB9IGZyb20gJy4uLy4uLy4uL2NvbW1vbic7XHJcblxyXG4vLyBpbXBvcnQgKiBhcyBkdW1wRGVjb2RlIGZyb20gJy4vZGVjb2RlJztcclxuY29uc3QgeyBnZXQgfSA9IHJlcXVpcmUoJ2xvZGFzaCcpO1xyXG5cclxuLy8gZHVtcOaOpeWPoyznu5/kuIDkuIvlhajlsYDlvJXnlKhcclxuY2xhc3MgRHVtcFV0aWwge1xyXG4gICAgLy8g6I635Y+W6IqC54K555qE5p+Q5Liq5bGe5oCnXHJcbiAgICBkdW1wUHJvcGVydHkobm9kZTogTm9kZSwgcGF0aDogc3RyaW5nKSB7XHJcbiAgICAgICAgaWYgKHBhdGggPT09ICcnKSB7XHJcbiAgICAgICAgICAgIC8vcmV0dXJuIHRoaXMuZHVtcE5vZGUobm9kZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIOmAmui/h+i3r+W+hOaJvuWIsOWvueixoe+8jOeEtuWQjmR1bXDov5nkuKrlr7nosaFcclxuICAgICAgICBjb25zdCBpbmZvID0gcGFyc2luZ1BhdGgocGF0aCwgbm9kZSk7XHJcbiAgICAgICAgLy8g6I635Y+W6ZyA6KaB5L+u5pS555qE5pWw5o2uXHJcbiAgICAgICAgY29uc3QgZGF0YSA9IGluZm8uc2VhcmNoID8gZ2V0KG5vZGUsIGluZm8uc2VhcmNoKSA6IG5vZGU7XHJcbiAgICAgICAgY29uc3QgYXR0ciA9IENDQ2xhc3MuQXR0ci5nZXRDbGFzc0F0dHJzKGRhdGEuY29uc3RydWN0b3IpO1xyXG4gICAgICAgIGNvbnN0IHJldCA9IGVuY29kZU9iamVjdChkYXRhLCBhdHRyKTtcclxuICAgICAgICByZXR1cm4gcmV0O1xyXG4gICAgfVxyXG5cclxuICAgIC8vIOeUn+aIkOS4gOS4qmNvbXBvbmVudOeahGR1bXDmlbDmja5cclxuICAgIGR1bXBDb21wb25lbnQoY29tcDogQ29tcG9uZW50KTogSUNvbXBvbmVudDtcclxuICAgIGR1bXBDb21wb25lbnQoY29tcDogbnVsbCB8IHVuZGVmaW5lZCk6IG51bGw7XHJcbiAgICBkdW1wQ29tcG9uZW50KGNvbXA6IENvbXBvbmVudCB8IG51bGwgfCB1bmRlZmluZWQpIHtcclxuICAgICAgICBpZiAoIWNvbXApIHtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBlbmNvZGVDb21wb25lbnQoY29tcCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmgaLlpI3kuIDkuKogZHVtcCDmlbDmja7liLAgcHJvcGVydHlcclxuICAgICAqIEBwYXJhbSBub2RlXHJcbiAgICAgKiBAcGFyYW0gcGF0aFxyXG4gICAgICogQHBhcmFtIGR1bXBcclxuICAgICAqL1xyXG4gICAgYXN5bmMgcmVzdG9yZVByb3BlcnR5KG5vZGU6IE5vZGUgfCBDb21wb25lbnQsIHBhdGg6IHN0cmluZywgZHVtcDogYW55KSB7XHJcbiAgICAgICAgLy8g6L+Y5Y6f5pW05LiqIGNvbXBvbmVudFxyXG4gICAgICAgIGlmICgvXl9fY29tcHNfX1xcLlxcZCskLy50ZXN0KHBhdGgpKSB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgZHVtcC52YWx1ZSA9PT0gJ29iamVjdCcpIHtcclxuICAgICAgICAgICAgICAgIGZvciAoY29uc3Qga2V5IGluIGR1bXAudmFsdWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBAdHMtaWdub3JlXHJcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgZGVjb2RlUGF0Y2goYCR7cGF0aH0uJHtrZXl9YCwgZHVtcC52YWx1ZVtrZXldLCBub2RlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIOi/mOWOn+WNleS4quWxnuaAp1xyXG4gICAgICAgICAgICByZXR1cm4gZGVjb2RlUGF0Y2gocGF0aCwgZHVtcCwgbm9kZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5oGi5aSN5p+Q5Liq5bGe5oCn55qE6buY6K6k5pWw5o2uXHJcbiAgICAgKiBAcGFyYW0gbm9kZVxyXG4gICAgICogQHBhcmFtIHBhdGhcclxuICAgICAqL1xyXG4gICAgcmVzZXRQcm9wZXJ0eShub2RlOiBOb2RlIHwgQ29tcG9uZW50LCBwYXRoOiBzdHJpbmcpIHtcclxuICAgICAgICByZXR1cm4gcmVzZXRQcm9wZXJ0eShub2RlLCBwYXRoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOWwhuS4gOS4quWxnuaAp+WFtueOsOWtmOWAvOS4juWumuS5ieexu+Wei+WAvOS4jeWMuemFje+8jOaIluiAheS4uiBudWxsIOm7mOiupOWAvO+8jOaUueS4uuS4gOS4quWPr+e8lui+keeahOWAvFxyXG4gICAgICogQHBhcmFtIG5vZGVcclxuICAgICAqIEBwYXJhbSBwYXRoXHJcbiAgICAgKi9cclxuICAgIHVwZGF0ZVByb3BlcnR5RnJvbU51bGwobm9kZTogTm9kZSB8IENvbXBvbmVudCwgcGF0aDogc3RyaW5nKSB7XHJcbiAgICAgICAgcmV0dXJuIHVwZGF0ZVByb3BlcnR5RnJvbU51bGwobm9kZSwgcGF0aCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDop6PmnpDoioLngrnnmoTorr/pl67ot6/lvoRcclxuICAgICAqIEBwYXJhbSBwYXRoIFxyXG4gICAgICogQHJldHVybnMgXHJcbiAgICAgKi9cclxuICAgIHBhcnNpbmdQYXRoKHBhdGg6IHN0cmluZywgZGF0YTogYW55KSB7XHJcbiAgICAgICAgcmV0dXJuIHBhcnNpbmdQYXRoKHBhdGgsIGRhdGEpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogZW5jb2RlT2JqZWN0XHJcbiAgICAgKi9cclxuICAgIGVuY29kZU9iamVjdChvYmplY3Q6IGFueSwgYXR0cmlidXRlczogYW55LCBvd25lcjogYW55ID0gbnVsbCwgb2JqZWN0S2V5Pzogc3RyaW5nKSB7XHJcbiAgICAgICAgcmV0dXJuIGVuY29kZU9iamVjdChvYmplY3QsIGF0dHJpYnV0ZXMsIG93bmVyLCBvYmplY3RLZXkpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog6I635Y+W57G75Z6L55qE6buY6K6kZHVtcOaVsOaNrlxyXG4gICAgICogQHBhcmFtIHR5cGUgXHJcbiAgICAgKiBAcmV0dXJucyBcclxuICAgICAqL1xyXG4gICAgZ2V0RGVmYXVsdFZhbHVlKHR5cGU6IHN0cmluZyB8IHVuZGVmaW5lZCk6IGFueSB7XHJcbiAgICAgICAgaWYgKCF0eXBlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgdmFsdWUgPSBBc3NldFV0aWwuZ2V0RGVmYXVsdFZhbHVlKHR5cGUsIG51bGwpO1xyXG4gICAgICAgIGlmICghdmFsdWUpIHtcclxuICAgICAgICAgICAgY29uc3QgY2NUeXBlID0ganMuZ2V0Q2xhc3NCeU5hbWUodHlwZSk7XHJcbiAgICAgICAgICAgIHZhbHVlID0gY2NUeXBlID8gbmV3IGNjVHlwZSgpIDogbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xyXG4gICAgfVxyXG5cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgbmV3IER1bXBVdGlsKCk7XHJcbiJdfQ==