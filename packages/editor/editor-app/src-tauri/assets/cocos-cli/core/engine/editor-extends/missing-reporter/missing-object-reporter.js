'use strict';
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.MissingObjectReporter = void 0;
const missing_reporter_1 = require("./missing-reporter");
const _ = __importStar(require("lodash"));
const ps = __importStar(require("path"));
const ObjectWalker = __importStar(require("./object-walker"));
const assetdb = __importStar(require("@cocos/asset-db"));
class MissingObjectReporter extends missing_reporter_1.MissingReporter {
    doReport(obj, value, parsedObjects, rootUrl, inRootBriefLocation) {
        let parsingOwner;
        if (obj instanceof cc.Component || obj instanceof cc.Asset) {
            parsingOwner = obj;
        }
        else {
            parsingOwner = _.findLast(parsedObjects, (x) => (x instanceof cc.Component || x instanceof cc.Asset));
        }
        let byOwner = '';
        if (parsingOwner instanceof cc.Component) {
            const ownerType = missing_reporter_1.MissingReporter.getObjectType(parsingOwner);
            byOwner = ` by ${ownerType} "${cc.js.getClassName(parsingOwner)}"`;
        }
        else {
            parsingOwner = _.findLast(parsedObjects, (x) => (x instanceof cc.Node));
            if (parsingOwner) {
                byOwner = ` by node "${parsingOwner.name}"`;
            }
        }
        let info;
        const valueIsUrl = typeof value === 'string';
        if (valueIsUrl) {
            info = `Asset "${value}" used${byOwner}${inRootBriefLocation} is missing.`;
        }
        else {
            let targetType = cc.js.getClassName(value);
            if (targetType.startsWith('cc.')) {
                targetType = targetType.slice(3);
            }
            if (value instanceof cc.Asset) {
                // missing asset
                info = `The ${targetType} used${byOwner}${inRootBriefLocation} is missing.`;
            }
            else {
                // missing object
                info = `The ${targetType} referenced${byOwner}${inRootBriefLocation} is invalid.`;
            }
        }
        info += missing_reporter_1.MissingReporter.INFO_DETAILED;
        if (parsingOwner instanceof cc.Component) {
            parsingOwner = parsingOwner.node;
        }
        try {
            if (parsingOwner instanceof cc.Node) {
                let node = parsingOwner;
                let path = node.name;
                while (node.parent && !(node.parent instanceof cc.Scene)) {
                    node = node.parent;
                    path = `${node.name}/${path}`;
                }
                info += `Node path: "${path}"\n`;
            }
        }
        catch (error) { }
        if (rootUrl) {
            info += `Asset url: "${rootUrl}"\n`;
        }
        if (value instanceof cc.Asset && value._uuid) {
            try {
                const assetInfo = assetdb.queryMissingInfo(value._uuid.match(/[^@]*/)[0]);
                if (assetInfo) {
                    info += `Asset file: "${assetInfo.path}"\n`;
                    info += `Asset deleted time: "${new Date(assetInfo.removeTime).toLocaleString()}"\n`;
                }
            }
            catch (error) { }
            // info = pkg.execSync('asset-db', 'queryAssetInfo', this.root._uuid);
            info += `Missing uuid: "${value._uuid}"\n`;
        }
        info.slice(0, -1); // remove last '\n'
        // 因为报错很多，用户会觉得是编辑器不稳定，所以暂时隐藏错误
        if (console[this.outputLevel]) {
            console[this.outputLevel](info);
        }
        else {
            console.warn(info);
        }
    }
    report() {
        let rootUrl;
        let info;
        if (this.root instanceof cc.Asset) {
            try {
                // @ts-ignore
                const Manager = globalThis.Manager;
                if (Manager && Manager.assetManager) {
                    info = Manager.assetManager.queryAssetInfo(this.root._uuid);
                }
                else {
                    // info = pkg.execSync('asset-db', 'queryAssetInfo', this.root._uuid);
                }
            }
            catch (error) {
                console.error(error);
                info = null;
            }
            rootUrl = info ? info.path : null;
        }
        const rootType = missing_reporter_1.MissingReporter.getObjectType(this.root);
        const inRootBriefLocation = rootUrl ? ` in ${rootType} "${ps.basename(rootUrl)}"` : '';
        ObjectWalker.walk(this.root, (obj, key, value, parsedObjects, parsedKeys) => {
            if (this.missingObjects.has(value)) {
                this.doReport(obj, value, parsedObjects, rootUrl, inRootBriefLocation);
            }
        });
    }
    reportByOwner() {
        let rootUrl;
        let info;
        if (this.root instanceof cc.Asset) {
            try {
                // @ts-ignore
                const Manager = globalThis.Manager;
                if (Manager && Manager.assetDBManager.ready) {
                    info = Manager.assetManager.queryAssetInfo(this.root._uuid);
                }
                else {
                    // info = pkg.execSync('asset-db', 'queryAssetInfo', this.root._uuid);
                }
            }
            catch (error) {
                console.error(error);
                info = null;
            }
            rootUrl = info ? info.path : null;
        }
        const rootType = missing_reporter_1.MissingReporter.getObjectType(this.root);
        const inRootBriefLocation = rootUrl ? ` in ${rootType} "${ps.basename(rootUrl)}"` : '';
        ObjectWalker.walkProperties(this.root, (obj, key, actualValue, parsedObjects) => {
            const props = this.missingOwners.get(obj);
            if (props && (key in props)) {
                const reportValue = props[key];
                this.doReport(obj, reportValue || actualValue, parsedObjects, rootUrl, inRootBriefLocation);
            }
        }, {
            dontSkipNull: true,
        });
    }
}
exports.MissingObjectReporter = MissingObjectReporter;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWlzc2luZy1vYmplY3QtcmVwb3J0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvY29yZS9lbmdpbmUvZWRpdG9yLWV4dGVuZHMvbWlzc2luZy1yZXBvcnRlci9taXNzaW5nLW9iamVjdC1yZXBvcnRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUViLHlEQUFxRDtBQUNyRCwwQ0FBNEI7QUFDNUIseUNBQTJCO0FBQzNCLDhEQUFnRDtBQUNoRCx5REFBMkM7QUFFM0MsTUFBYSxxQkFBc0IsU0FBUSxrQ0FBZTtJQUV0RCxRQUFRLENBQUMsR0FBUSxFQUFFLEtBQVUsRUFBRSxhQUFrQixFQUFFLE9BQVksRUFBRSxtQkFBd0I7UUFDckYsSUFBSSxZQUFZLENBQUM7UUFDakIsSUFBSSxHQUFHLFlBQVksRUFBRSxDQUFDLFNBQVMsSUFBSSxHQUFHLFlBQVksRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ3pELFlBQVksR0FBRyxHQUFHLENBQUM7UUFDdkIsQ0FBQzthQUFNLENBQUM7WUFDSixZQUFZLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFNLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxTQUFTLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQy9HLENBQUM7UUFFRCxJQUFJLE9BQU8sR0FBRyxFQUFFLENBQUM7UUFDakIsSUFBSSxZQUFZLFlBQVksRUFBRSxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQ3ZDLE1BQU0sU0FBUyxHQUFHLGtDQUFlLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQzlELE9BQU8sR0FBRyxPQUFPLFNBQVMsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDLFlBQVksQ0FBQyxZQUFZLENB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T0FBTyxLQUFLLEVBQUUsQ0FBQztnQkFDYixPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUNyQixJQUFJLEdBQUcsSUFBSSxDQUFDO1lBQ2hCLENBQUM7WUFDRCxPQUFPLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFDdEMsQ0FBQztRQUNELE1BQU0sUUFBUSxHQUFHLGtDQUFlLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMxRCxNQUFNLG1CQUFtQixHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsT0FBTyxRQUFRLEtBQUssRUFBRSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFFdkYsWUFBWSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsR0FBUSxFQUFFLEdBQVEsRUFBRSxXQUFnQixFQUFFLGFBQWtCLEVBQUUsRUFBRTtZQUNoRyxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUMxQyxJQUFJLEtBQUssSUFBSSxDQUFDLEdBQUcsSUFBSSxLQUFLLENBQUMsRUFBRSxDQUFDO2dCQUMxQixNQUFNLFdBQVcsR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQy9CLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLFdBQVcsSUFBSSxXQUFXLEVBQUUsYUFBYSxFQUFFLE9BQU8sRUFBRSxtQkFBbUIsQ0FBQyxDQUFDO1lBQ2hHLENBQUM7UUFDTCxDQUFDLEVBQUU7WUFDQyxZQUFZLEVBQUUsSUFBSTtTQUNyQixDQUFDLENBQUM7SUFDUCxDQUFDO0NBQ0o7QUEzSUQsc0RBMklDIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xyXG5cclxuaW1wb3J0IHsgTWlzc2luZ1JlcG9ydGVyIH0gZnJvbSAnLi9taXNzaW5nLXJlcG9ydGVyJztcclxuaW1wb3J0ICogYXMgXyBmcm9tICdsb2Rhc2gnO1xyXG5pbXBvcnQgKiBhcyBwcyBmcm9tICdwYXRoJztcclxuaW1wb3J0ICogYXMgT2JqZWN0V2Fsa2VyIGZyb20gJy4vb2JqZWN0LXdhbGtlcic7XHJcbmltcG9ydCAqIGFzIGFzc2V0ZGIgZnJvbSAnQGNvY29zL2Fzc2V0LWRiJztcclxuXHJcbmV4cG9ydCBjbGFzcyBNaXNzaW5nT2JqZWN0UmVwb3J0ZXIgZXh0ZW5kcyBNaXNzaW5nUmVwb3J0ZXIge1xyXG5cclxuICAgIGRvUmVwb3J0KG9iajogYW55LCB2YWx1ZTogYW55LCBwYXJzZWRPYmplY3RzOiBhbnksIHJvb3RVcmw6IGFueSwgaW5Sb290QnJpZWZMb2NhdGlvbjogYW55KSB7XHJcbiAgICAgICAgbGV0IHBhcnNpbmdPd25lcjtcclxuICAgICAgICBpZiAob2JqIGluc3RhbmNlb2YgY2MuQ29tcG9uZW50IHx8IG9iaiBpbnN0YW5jZW9mIGNjLkFzc2V0KSB7XHJcbiAgICAgICAgICAgIHBhcnNpbmdPd25lciA9IG9iajtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBwYXJzaW5nT3duZXIgPSBfLmZpbmRMYXN0KHBhcnNlZE9iamVjdHMsICh4OiBhbnkpID0+ICh4IGluc3RhbmNlb2YgY2MuQ29tcG9uZW50IHx8IHggaW5zdGFuY2VvZiBjYy5Bc3NldCkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IGJ5T3duZXIgPSAnJztcclxuICAgICAgICBpZiAocGFyc2luZ093bmVyIGluc3RhbmNlb2YgY2MuQ29tcG9uZW50KSB7XHJcbiAgICAgICAgICAgIGNvbnN0IG93bmVyVHlwZSA9IE1pc3NpbmdSZXBvcnRlci5nZXRPYmplY3RUeXBlKHBhcnNpbmdPd25lcik7XHJcbiAgICAgICAgICAgIGJ5T3duZXIgPSBgIGJ5ICR7b3duZXJUeXBlfSBcIiR7Y2MuanMuZ2V0Q2xhc3NOYW1lKHBhcnNpbmdPd25lcil9XCJgO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHBhcnNpbmdPd25lciA9IF8uZmluZExhc3QocGFyc2VkT2JqZWN0cywgKHg6IGFueSkgPT4gKHggaW5zdGFuY2VvZiBjYy5Ob2RlKSk7XHJcbiAgICAgICAgICAgIGlmIChwYXJzaW5nT3duZXIpIHtcclxuICAgICAgICAgICAgICAgIGJ5T3duZXIgPSBgIGJ5IG5vZGUgXCIke3BhcnNpbmdPd25lci5uYW1lfVwiYDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IGluZm87XHJcbiAgICAgICAgY29uc3QgdmFsdWVJc1VybCA9IHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZyc7XHJcbiAgICAgICAgaWYgKHZhbHVlSXNVcmwpIHtcclxuICAgICAgICAgICAgaW5mbyA9IGBBc3NldCBcIiR7dmFsdWV9XCIgdXNlZCR7YnlPd25lcn0ke2luUm9vdEJyaWVmTG9jYXRpb259IGlzIG1pc3NpbmcuYDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBsZXQgdGFyZ2V0VHlwZSA9IGNjLmpzLmdldENsYXNzTmFtZSh2YWx1ZSk7XHJcbiAgICAgICAgICAgIGlmICh0YXJnZXRUeXBlLnN0YXJ0c1dpdGgoJ2NjLicpKSB7XHJcbiAgICAgICAgICAgICAgICB0YXJnZXRUeXBlID0gdGFyZ2V0VHlwZS5zbGljZSgzKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBjYy5Bc3NldCkge1xyXG4gICAgICAgICAgICAgICAgLy8gbWlzc2luZyBhc3NldFxyXG4gICAgICAgICAgICAgICAgaW5mbyA9IGBUaGUgJHt0YXJnZXRUeXBlfSB1c2VkJHtieU93bmVyfSR7aW5Sb290QnJpZWZMb2NhdGlvbn0gaXMgbWlzc2luZy5gO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgLy8gbWlzc2luZyBvYmplY3RcclxuICAgICAgICAgICAgICAgIGluZm8gPSBgVGhlICR7dGFyZ2V0VHlwZX0gcmVmZXJlbmNlZCR7YnlPd25lcn0ke2luUm9vdEJyaWVmTG9jYXRpb259IGlzIGludmFsaWQuYDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaW5mbyArPSBNaXNzaW5nUmVwb3J0ZXIuSU5GT19ERVRBSUxFRDtcclxuICAgICAgICBpZiAocGFyc2luZ093bmVyIGluc3RhbmNlb2YgY2MuQ29tcG9uZW50KSB7XHJcbiAgICAgICAgICAgIHBhcnNpbmdPd25lciA9IHBhcnNpbmdPd25lci5ub2RlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgaWYgKHBhcnNpbmdPd25lciBpbnN0YW5jZW9mIGNjLk5vZGUpIHtcclxuICAgICAgICAgICAgICAgIGxldCBub2RlID0gcGFyc2luZ093bmVyO1xyXG4gICAgICAgICAgICAgICAgbGV0IHBhdGggPSBub2RlLm5hbWU7XHJcbiAgICAgICAgICAgICAgICB3aGlsZSAobm9kZS5wYXJlbnQgJiYgIShub2RlLnBhcmVudCBpbnN0YW5jZW9mIGNjLlNjZW5lKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIG5vZGUgPSBub2RlLnBhcmVudDtcclxuICAgICAgICAgICAgICAgICAgICBwYXRoID0gYCR7bm9kZS5uYW1lfS8ke3BhdGh9YDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGluZm8gKz0gYE5vZGUgcGF0aDogXCIke3BhdGh9XCJcXG5gO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHsgfVxyXG5cclxuICAgICAgICBpZiAocm9vdFVybCkge1xyXG4gICAgICAgICAgICBpbmZvICs9IGBBc3NldCB1cmw6IFwiJHtyb290VXJsfVwiXFxuYDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgY2MuQXNzZXQgJiYgdmFsdWUuX3V1aWQpIHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGFzc2V0SW5mbyA9IGFzc2V0ZGIucXVlcnlNaXNzaW5nSW5mbyh2YWx1ZS5fdXVpZC5tYXRjaCgvW15AXSovKVswXSk7XHJcbiAgICAgICAgICAgICAgICBpZiAoYXNzZXRJbmZvKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaW5mbyArPSBgQXNzZXQgZmlsZTogXCIke2Fzc2V0SW5mby5wYXRofVwiXFxuYDtcclxuICAgICAgICAgICAgICAgICAgICBpbmZvICs9IGBBc3NldCBkZWxldGVkIHRpbWU6IFwiJHtuZXcgRGF0ZShhc3NldEluZm8ucmVtb3ZlVGltZSkudG9Mb2NhbGVTdHJpbmcoKX1cIlxcbmA7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7IH1cclxuICAgICAgICAgICAgLy8gaW5mbyA9IHBrZy5leGVjU3luYygnYXNzZXQtZGInLCAncXVlcnlBc3NldEluZm8nLCB0aGlzLnJvb3QuX3V1aWQpO1xyXG4gICAgICAgICAgICBpbmZvICs9IGBNaXNzaW5nIHV1aWQ6IFwiJHt2YWx1ZS5fdXVpZH1cIlxcbmA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGluZm8uc2xpY2UoMCwgLTEpOyAvLyByZW1vdmUgbGFzdCAnXFxuJ1xyXG5cclxuICAgICAgICAvLyDlm6DkuLrmiqXplJnlvojlpJrvvIznlKjmiLfkvJrop4nlvpfmmK/nvJbovpHlmajkuI3nqLPlrprvvIzmiYDku6XmmoLml7bpmpDol4/plJnor69cclxuICAgICAgICBpZiAoY29uc29sZVt0aGlzLm91dHB1dExldmVsXSkge1xyXG4gICAgICAgICAgICBjb25zb2xlW3RoaXMub3V0cHV0TGV2ZWxdKGluZm8pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihpbmZvKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmVwb3J0KCkge1xyXG4gICAgICAgIGxldCByb290VXJsOiBhbnk7XHJcbiAgICAgICAgbGV0IGluZm86IGFueTtcclxuICAgICAgICBpZiAodGhpcy5yb290IGluc3RhbmNlb2YgY2MuQXNzZXQpIHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcclxuICAgICAgICAgICAgICAgIGNvbnN0IE1hbmFnZXI6IElBc3NldFdvcmtlck1hbmFnZXIgPSBnbG9iYWxUaGlzLk1hbmFnZXI7XHJcbiAgICAgICAgICAgICAgICBpZiAoTWFuYWdlciAmJiBNYW5hZ2VyLmFzc2V0TWFuYWdlcikge1xyXG4gICAgICAgICAgICAgICAgICAgIGluZm8gPSBNYW5hZ2VyLmFzc2V0TWFuYWdlci5xdWVyeUFzc2V0SW5mbyh0aGlzLnJvb3QuX3V1aWQpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBpbmZvID0gcGtnLmV4ZWNTeW5jKCdhc3NldC1kYicsICdxdWVyeUFzc2V0SW5mbycsIHRoaXMucm9vdC5fdXVpZCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcclxuICAgICAgICAgICAgICAgIGluZm8gPSBudWxsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJvb3RVcmwgPSBpbmZvID8gaW5mby5wYXRoIDogbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3Qgcm9vdFR5cGUgPSBNaXNzaW5nUmVwb3J0ZXIuZ2V0T2JqZWN0VHlwZSh0aGlzLnJvb3QpO1xyXG4gICAgICAgIGNvbnN0IGluUm9vdEJyaWVmTG9jYXRpb24gPSByb290VXJsID8gYCBpbiAke3Jvb3RUeXBlfSBcIiR7cHMuYmFzZW5hbWUocm9vdFVybCl9XCJgIDogJyc7XHJcblxyXG4gICAgICAgIE9iamVjdFdhbGtlci53YWxrKHRoaXMucm9vdCwgKG9iajogYW55LCBrZXk6IGFueSwgdmFsdWU6IGFueSwgcGFyc2VkT2JqZWN0czogYW55LCBwYXJzZWRLZXlzOiBhbnkpID0+IHtcclxuICAgICAgICAgICAgaWYgKHRoaXMubWlzc2luZ09iamVjdHMuaGFzKHZhbHVlKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kb1JlcG9ydChvYmosIHZhbHVlLCBwYXJzZWRPYmplY3RzLCByb290VXJsLCBpblJvb3RCcmllZkxvY2F0aW9uKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHJlcG9ydEJ5T3duZXIoKSB7XHJcbiAgICAgICAgbGV0IHJvb3RVcmw6IGFueTtcclxuICAgICAgICBsZXQgaW5mbzogYW55O1xyXG4gICAgICAgIGlmICh0aGlzLnJvb3QgaW5zdGFuY2VvZiBjYy5Bc3NldCkge1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxyXG4gICAgICAgICAgICAgICAgY29uc3QgTWFuYWdlcjogSUFzc2V0V29ya2VyTWFuYWdlciA9IGdsb2JhbFRoaXMuTWFuYWdlcjtcclxuICAgICAgICAgICAgICAgIGlmIChNYW5hZ2VyICYmIE1hbmFnZXIuYXNzZXREQk1hbmFnZXIucmVhZHkpIHtcclxuICAgICAgICAgICAgICAgICAgICBpbmZvID0gTWFuYWdlci5hc3NldE1hbmFnZXIucXVlcnlBc3NldEluZm8odGhpcy5yb290Ll91dWlkKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gaW5mbyA9IHBrZy5leGVjU3luYygnYXNzZXQtZGInLCAncXVlcnlBc3NldEluZm8nLCB0aGlzLnJvb3QuX3V1aWQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnJvcik7XHJcbiAgICAgICAgICAgICAgICBpbmZvID0gbnVsbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByb290VXJsID0gaW5mbyA/IGluZm8ucGF0aCA6IG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHJvb3RUeXBlID0gTWlzc2luZ1JlcG9ydGVyLmdldE9iamVjdFR5cGUodGhpcy5yb290KTtcclxuICAgICAgICBjb25zdCBpblJvb3RCcmllZkxvY2F0aW9uID0gcm9vdFVybCA/IGAgaW4gJHtyb290VHlwZX0gXCIke3BzLmJhc2VuYW1lKHJvb3RVcmwpfVwiYCA6ICcnO1xyXG5cclxuICAgICAgICBPYmplY3RXYWxrZXIud2Fsa1Byb3BlcnRpZXModGhpcy5yb290LCAob2JqOiBhbnksIGtleTogYW55LCBhY3R1YWxWYWx1ZTogYW55LCBwYXJzZWRPYmplY3RzOiBhbnkpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgcHJvcHMgPSB0aGlzLm1pc3NpbmdPd25lcnMuZ2V0KG9iaik7XHJcbiAgICAgICAgICAgIGlmIChwcm9wcyAmJiAoa2V5IGluIHByb3BzKSkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgcmVwb3J0VmFsdWUgPSBwcm9wc1trZXldO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kb1JlcG9ydChvYmosIHJlcG9ydFZhbHVlIHx8IGFjdHVhbFZhbHVlLCBwYXJzZWRPYmplY3RzLCByb290VXJsLCBpblJvb3RCcmllZkxvY2F0aW9uKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sIHtcclxuICAgICAgICAgICAgZG9udFNraXBOdWxsOiB0cnVlLFxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59XHJcbiJdfQ==