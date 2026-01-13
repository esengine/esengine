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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MissingClass = exports.MissingClassReporter = void 0;
const _ = __importStar(require("lodash"));
const ps = __importStar(require("path"));
const ObjectWalker = __importStar(require("./object-walker"));
const assetdb = __importStar(require("@cocos/asset-db"));
const missing_reporter_1 = require("./missing-reporter");
const utils_1 = __importDefault(require("../../../base/utils"));
function report(parsingOwner, classId, asset, url) {
    const assetType = missing_reporter_1.MissingReporter.getObjectType(asset);
    const assetName = url && ps.basename(url);
    if (asset instanceof cc.SceneAsset || asset instanceof cc.Prefab) {
        let info;
        let component;
        let node;
        if (parsingOwner instanceof cc.Component) {
            component = parsingOwner;
            node = component.node;
        }
        else if (cc.Node.isNode(parsingOwner)) {
            node = parsingOwner;
        }
        const IN_LOCATION = assetName ? ` in ${assetType} "${assetName}"` : '';
        let detailedClassId = classId;
        let isScript = false;
        if (component) {
            let compName = cc.js.getClassName(component);
            // missing property type
            if (component instanceof cc._MissingScript) {
                isScript = true;
                detailedClassId = compName = component._$erialized.__type__;
            }
            info = `Class "${classId}" used by component "${compName}"${IN_LOCATION} is missing or invalid.`;
        }
        else if (node) {
            // missing component
            isScript = true;
            info = `Script "${classId}" attached to "${node.name}"${IN_LOCATION} is missing or invalid.`;
        }
        else {
            return;
        }
        info += missing_reporter_1.MissingReporter.INFO_DETAILED;
        try {
            let child = node;
            let path = child.name;
            while (child.parent && !(child.parent instanceof cc.Scene)) {
                child = child.parent;
                path = `${child.name}/${path}`;
            }
            info += `Node path: "${path}"\n`;
        }
        catch (error) { }
        if (url) {
            info += `Asset url: "${url}"\n`;
        }
        if (isScript && utils_1.default.UUID.isUUID(detailedClassId)) {
            const scriptUuid = utils_1.default.UUID.decompressUUID(detailedClassId);
            try {
                const scriptInfo = assetdb.queryMissingInfo(scriptUuid.match(/[^@]*/)[0]);
                if (scriptInfo) {
                    info += `Script file: "${scriptInfo.path}"\n`;
                    info += `Script deleted time: "${new Date(scriptInfo.removeTime).toLocaleString()}"\n`;
                }
            }
            catch (error) { }
            info += `Script UUID: "${scriptUuid}"\n`;
            info += `Class ID: "${detailedClassId}"\n`;
        }
        info.slice(0, -1); // remove last '\n'
        console.error(info);
    }
    else {
        // missing CustomAsset ? not yet implemented
    }
}
async function reportByWalker(value, obj, parsedObjects, asset, url, classId) {
    classId = classId || (value._$erialized && value._$erialized.__type__);
    let parsingOwner;
    if (obj instanceof cc.Component || cc.Node.isNode(obj)) {
        parsingOwner = obj;
    }
    else {
        parsingOwner = _.findLast(parsedObjects, (x) => (x instanceof cc.Component || cc.Node.isNode(x)));
    }
    await report(parsingOwner, classId, asset, url);
}
// MISSING CLASS REPORTER
class MissingClassReporter extends missing_reporter_1.MissingReporter {
    report() {
        ObjectWalker.walk(this.root, (obj, key, value, parsedObjects) => {
            if (this.missingObjects.has(value)) {
                reportByWalker(value, obj, parsedObjects, this.root);
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
                // @ts-ignore
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
        ObjectWalker.walkProperties(this.root, (obj, key, value, parsedObjects) => {
            const props = this.missingOwners.get(obj);
            if (props && (key in props)) {
                const typeId = props[key];
                reportByWalker(value, obj, parsedObjects, this.root, rootUrl, typeId);
            }
        }, {
            dontSkipNull: true,
        });
    }
}
exports.MissingClassReporter = MissingClassReporter;
// 用这个模块来标记找不到脚本的对象
exports.MissingClass = {
    reporter: new MissingClassReporter(),
    classFinder(id, owner, propName) {
        const cls = cc.js.getClassById(id);
        if (cls) {
            return cls;
        }
        else if (id) {
            console.warn(`Missing class: ${id}`);
            exports.MissingClass.hasMissingClass = true;
            exports.MissingClass.reporter.stashByOwner(owner, propName, id);
        }
        return null;
    },
    hasMissingClass: false,
    reportMissingClass(asset) {
        if (!asset._uuid) {
            return;
        }
        if (exports.MissingClass.hasMissingClass) {
            exports.MissingClass.reporter.root = asset;
            exports.MissingClass.reporter.reportByOwner();
            exports.MissingClass.hasMissingClass = false;
        }
    },
    reset() {
        exports.MissingClass.reporter.reset();
    },
};
// @ts-ignore
exports.MissingClass.classFinder.onDereferenced = function (curOwner, curPropName, newOwner, newPropName) {
    const id = exports.MissingClass.reporter.removeStashedByOwner(curOwner, curPropName);
    if (id) {
        exports.MissingClass.reporter.stashByOwner(newOwner, newPropName, id);
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWlzc2luZy1jbGFzcy1yZXBvcnRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9jb3JlL2VuZ2luZS9lZGl0b3ItZXh0ZW5kcy9taXNzaW5nLXJlcG9ydGVyL21pc3NpbmctY2xhc3MtcmVwb3J0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFYiwwQ0FBNEI7QUFDNUIseUNBQTJCO0FBQzNCLDhEQUFnRDtBQUNoRCx5REFBMkM7QUFFM0MseURBQXFEO0FBQ3JELGdFQUF3QztBQUV4QyxTQUFTLE1BQU0sQ0FBQyxZQUFpQixFQUFFLE9BQVksRUFBRSxLQUFVLEVBQUUsR0FBUTtJQUNqRSxNQUFNLFNBQVMsR0FBRyxrQ0FBZSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUN2RCxNQUFNLFNBQVMsR0FBRyxHQUFHLElBQUksRUFBRSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUUxQyxJQUFJLEtBQUssWUFBWSxFQUFFLENBQUMsVUFBVSxJQUFJLEtBQUssWUFBWSxFQUFFLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDL0QsSUFBSSxJQUFJLENBQUM7UUFDVCxJQUFJLFNBQVMsQ0FBQztRQUNkLElBQUksSUFBSSxDQUFDO1FBQ1QsSUFBSSxZQUFZLFlBQVksRUFBRSxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQ3ZDLFNBQVMsR0FBRyxZQUFZLENBQUM7WUFDekIsSUFBSSxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUM7UUFDMUIsQ0FBQzthQUFNLElBQUksRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQztZQUN0QyxJQUFJLEdBQUcsWUFBWSxDQUFDO1FBQ3hCLENBQUM7UUFFRCxNQUFNLFdBQVcsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLE9BQU8sU0FB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RUYsYUFBYTtBQUNiLG9CQUFZLENBQUMsV0FBVyxDQUFDLGNBQWMsR0FBRyxVQUFVLFFBQWEsRUFBRSxXQUFnQixFQUFFLFFBQWEsRUFBRSxXQUFnQjtJQUNoSCxNQUFNLEVBQUUsR0FBRyxvQkFBWSxDQUFDLFFBQVEsQ0FBQyxvQkFBb0IsQ0FBQyxRQUFRLEVBQUUsV0FBVyxDQUFDLENBQUM7SUFDN0UsSUFBSSxFQUFFLEVBQUUsQ0FBQztRQUNMLG9CQUFZLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUsV0FBVyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQ2xFLENBQUM7QUFDTCxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XHJcblxyXG5pbXBvcnQgKiBhcyBfIGZyb20gJ2xvZGFzaCc7XHJcbmltcG9ydCAqIGFzIHBzIGZyb20gJ3BhdGgnO1xyXG5pbXBvcnQgKiBhcyBPYmplY3RXYWxrZXIgZnJvbSAnLi9vYmplY3Qtd2Fsa2VyJztcclxuaW1wb3J0ICogYXMgYXNzZXRkYiBmcm9tICdAY29jb3MvYXNzZXQtZGInO1xyXG5cclxuaW1wb3J0IHsgTWlzc2luZ1JlcG9ydGVyIH0gZnJvbSAnLi9taXNzaW5nLXJlcG9ydGVyJztcclxuaW1wb3J0IFV0aWxzIGZyb20gJy4uLy4uLy4uL2Jhc2UvdXRpbHMnO1xyXG5cclxuZnVuY3Rpb24gcmVwb3J0KHBhcnNpbmdPd25lcjogYW55LCBjbGFzc0lkOiBhbnksIGFzc2V0OiBhbnksIHVybDogYW55KSB7XHJcbiAgICBjb25zdCBhc3NldFR5cGUgPSBNaXNzaW5nUmVwb3J0ZXIuZ2V0T2JqZWN0VHlwZShhc3NldCk7XHJcbiAgICBjb25zdCBhc3NldE5hbWUgPSB1cmwgJiYgcHMuYmFzZW5hbWUodXJsKTtcclxuXHJcbiAgICBpZiAoYXNzZXQgaW5zdGFuY2VvZiBjYy5TY2VuZUFzc2V0IHx8IGFzc2V0IGluc3RhbmNlb2YgY2MuUHJlZmFiKSB7XHJcbiAgICAgICAgbGV0IGluZm87XHJcbiAgICAgICAgbGV0IGNvbXBvbmVudDtcclxuICAgICAgICBsZXQgbm9kZTtcclxuICAgICAgICBpZiAocGFyc2luZ093bmVyIGluc3RhbmNlb2YgY2MuQ29tcG9uZW50KSB7XHJcbiAgICAgICAgICAgIGNvbXBvbmVudCA9IHBhcnNpbmdPd25lcjtcclxuICAgICAgICAgICAgbm9kZSA9IGNvbXBvbmVudC5ub2RlO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoY2MuTm9kZS5pc05vZGUocGFyc2luZ093bmVyKSkge1xyXG4gICAgICAgICAgICBub2RlID0gcGFyc2luZ093bmVyO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgSU5fTE9DQVRJT04gPSBhc3NldE5hbWUgPyBgIGluICR7YXNzZXRUeXBlfSBcIiR7YXNzZXROYW1lfVwiYCA6ICcnO1xyXG4gICAgICAgIGxldCBkZXRhaWxlZENsYXNzSWQgPSBjbGFzc0lkO1xyXG4gICAgICAgIGxldCBpc1NjcmlwdCA9IGZhbHNlO1xyXG5cclxuICAgICAgICBpZiAoY29tcG9uZW50KSB7XHJcbiAgICAgICAgICAgIGxldCBjb21wTmFtZSA9IGNjLmpzLmdldENsYXNzTmFtZShjb21wb25lbnQpO1xyXG4gICAgICAgICAgICAvLyBtaXNzaW5nIHByb3BlcnR5IHR5cGVcclxuICAgICAgICAgICAgaWYgKGNvbXBvbmVudCBpbnN0YW5jZW9mIGNjLl9NaXNzaW5nU2NyaXB0KSB7XHJcbiAgICAgICAgICAgICAgICBpc1NjcmlwdCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBkZXRhaWxlZENsYXNzSWQgPSBjb21wTmFtZSA9IGNvbXBvbmVudC5fJGVyaWFsaXplZC5fX3R5cGVfXztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpbmZvID0gYENsYXNzIFwiJHtjbGFzc0lkfVwiIHVzZWQgYnkgY29tcG9uZW50IFwiJHtjb21wTmFtZX1cIiR7SU5fTE9DQVRJT059IGlzIG1pc3Npbmcgb3IgaW52YWxpZC5gO1xyXG4gICAgICAgIH0gZWxzZSBpZiAobm9kZSkge1xyXG4gICAgICAgICAgICAvLyBtaXNzaW5nIGNvbXBvbmVudFxyXG4gICAgICAgICAgICBpc1NjcmlwdCA9IHRydWU7XHJcbiAgICAgICAgICAgIGluZm8gPSBgU2NyaXB0IFwiJHtjbGFzc0lkfVwiIGF0dGFjaGVkIHRvIFwiJHtub2RlLm5hbWV9XCIke0lOX0xPQ0FUSU9OfSBpcyBtaXNzaW5nIG9yIGludmFsaWQuYDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpbmZvICs9IE1pc3NpbmdSZXBvcnRlci5JTkZPX0RFVEFJTEVEO1xyXG5cclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBsZXQgY2hpbGQgPSBub2RlO1xyXG4gICAgICAgICAgICBsZXQgcGF0aCA9IGNoaWxkLm5hbWU7XHJcbiAgICAgICAgICAgIHdoaWxlIChjaGlsZC5wYXJlbnQgJiYgIShjaGlsZC5wYXJlbnQgaW5zdGFuY2VvZiBjYy5TY2VuZSkpIHtcclxuICAgICAgICAgICAgICAgIGNoaWxkID0gY2hpbGQucGFyZW50O1xyXG4gICAgICAgICAgICAgICAgcGF0aCA9IGAke2NoaWxkLm5hbWV9LyR7cGF0aH1gO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGluZm8gKz0gYE5vZGUgcGF0aDogXCIke3BhdGh9XCJcXG5gO1xyXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7IH1cclxuXHJcbiAgICAgICAgaWYgKHVybCkge1xyXG4gICAgICAgICAgICBpbmZvICs9IGBBc3NldCB1cmw6IFwiJHt1cmx9XCJcXG5gO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGlzU2NyaXB0ICYmIFV0aWxzLlVVSUQuaXNVVUlEKGRldGFpbGVkQ2xhc3NJZCkpIHtcclxuICAgICAgICAgICAgY29uc3Qgc2NyaXB0VXVpZCA9IFV0aWxzLlVVSUQuZGVjb21wcmVzc1VVSUQoZGV0YWlsZWRDbGFzc0lkKTtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHNjcmlwdEluZm8gPSBhc3NldGRiLnF1ZXJ5TWlzc2luZ0luZm8oc2NyaXB0VXVpZC5tYXRjaCgvW15AXSovKSFbMF0pO1xyXG4gICAgICAgICAgICAgICAgaWYgKHNjcmlwdEluZm8pIHtcclxuICAgICAgICAgICAgICAgICAgICBpbmZvICs9IGBTY3JpcHQgZmlsZTogXCIke3NjcmlwdEluZm8ucGF0aH1cIlxcbmA7XHJcbiAgICAgICAgICAgICAgICAgICAgaW5mbyArPSBgU2NyaXB0IGRlbGV0ZWQgdGltZTogXCIke25ldyBEYXRlKHNjcmlwdEluZm8ucmVtb3ZlVGltZSkudG9Mb2NhbGVTdHJpbmcoKX1cIlxcbmA7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7IH1cclxuICAgICAgICAgICAgaW5mbyArPSBgU2NyaXB0IFVVSUQ6IFwiJHtzY3JpcHRVdWlkfVwiXFxuYDtcclxuICAgICAgICAgICAgaW5mbyArPSBgQ2xhc3MgSUQ6IFwiJHtkZXRhaWxlZENsYXNzSWR9XCJcXG5gO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpbmZvLnNsaWNlKDAsIC0xKTsgLy8gcmVtb3ZlIGxhc3QgJ1xcbidcclxuICAgICAgICBjb25zb2xlLmVycm9yKGluZm8pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICAvLyBtaXNzaW5nIEN1c3RvbUFzc2V0ID8gbm90IHlldCBpbXBsZW1lbnRlZFxyXG4gICAgfVxyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiByZXBvcnRCeVdhbGtlcih2YWx1ZTogYW55LCBvYmo6IGFueSwgcGFyc2VkT2JqZWN0czogYW55LCBhc3NldDogYW55LCB1cmw/OiBhbnksIGNsYXNzSWQ/OiBhbnkpIHtcclxuICAgIGNsYXNzSWQgPSBjbGFzc0lkIHx8ICh2YWx1ZS5fJGVyaWFsaXplZCAmJiB2YWx1ZS5fJGVyaWFsaXplZC5fX3R5cGVfXyk7XHJcbiAgICBsZXQgcGFyc2luZ093bmVyO1xyXG4gICAgaWYgKG9iaiBpbnN0YW5jZW9mIGNjLkNvbXBvbmVudCB8fCBjYy5Ob2RlLmlzTm9kZShvYmopKSB7XHJcbiAgICAgICAgcGFyc2luZ093bmVyID0gb2JqO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBwYXJzaW5nT3duZXIgPSBfLmZpbmRMYXN0KHBhcnNlZE9iamVjdHMsICh4OiBhbnkpID0+ICh4IGluc3RhbmNlb2YgY2MuQ29tcG9uZW50IHx8IGNjLk5vZGUuaXNOb2RlKHgpKSk7XHJcbiAgICB9XHJcbiAgICBhd2FpdCByZXBvcnQocGFyc2luZ093bmVyLCBjbGFzc0lkLCBhc3NldCwgdXJsKTtcclxufVxyXG5cclxuLy8gTUlTU0lORyBDTEFTUyBSRVBPUlRFUlxyXG5cclxuZXhwb3J0IGNsYXNzIE1pc3NpbmdDbGFzc1JlcG9ydGVyIGV4dGVuZHMgTWlzc2luZ1JlcG9ydGVyIHtcclxuXHJcbiAgICByZXBvcnQoKSB7XHJcbiAgICAgICAgT2JqZWN0V2Fsa2VyLndhbGsodGhpcy5yb290LCAob2JqOiBhbnksIGtleTogYW55LCB2YWx1ZTogYW55LCBwYXJzZWRPYmplY3RzOiBhbnkpID0+IHtcclxuICAgICAgICAgICAgaWYgKHRoaXMubWlzc2luZ09iamVjdHMuaGFzKHZhbHVlKSkge1xyXG4gICAgICAgICAgICAgICAgcmVwb3J0QnlXYWxrZXIodmFsdWUsIG9iaiwgcGFyc2VkT2JqZWN0cywgdGhpcy5yb290KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHJlcG9ydEJ5T3duZXIoKSB7XHJcbiAgICAgICAgbGV0IHJvb3RVcmw6IGFueTtcclxuICAgICAgICBsZXQgaW5mbzogYW55O1xyXG4gICAgICAgIGlmICh0aGlzLnJvb3QgaW5zdGFuY2VvZiBjYy5Bc3NldCkge1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxyXG4gICAgICAgICAgICAgICAgY29uc3QgTWFuYWdlcjogSUFzc2V0V29ya2VyTWFuYWdlciA9IGdsb2JhbFRoaXMuTWFuYWdlcjtcclxuICAgICAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcclxuICAgICAgICAgICAgICAgIGlmIChNYW5hZ2VyICYmIE1hbmFnZXIuYXNzZXRNYW5hZ2VyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaW5mbyA9IE1hbmFnZXIuYXNzZXRNYW5hZ2VyLnF1ZXJ5QXNzZXRJbmZvKHRoaXMucm9vdC5fdXVpZCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIGluZm8gPSBwa2cuZXhlY1N5bmMoJ2Fzc2V0LWRiJywgJ3F1ZXJ5QXNzZXRJbmZvJywgdGhpcy5yb290Ll91dWlkKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xyXG4gICAgICAgICAgICAgICAgaW5mbyA9IG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcm9vdFVybCA9IGluZm8gPyBpbmZvLnBhdGggOiBudWxsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgT2JqZWN0V2Fsa2VyLndhbGtQcm9wZXJ0aWVzKHRoaXMucm9vdCwgKG9iajogYW55LCBrZXk6IGFueSwgdmFsdWU6IGFueSwgcGFyc2VkT2JqZWN0czogYW55KSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IHByb3BzID0gdGhpcy5taXNzaW5nT3duZXJzLmdldChvYmopO1xyXG4gICAgICAgICAgICBpZiAocHJvcHMgJiYgKGtleSBpbiBwcm9wcykpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHR5cGVJZCA9IHByb3BzW2tleV07XHJcbiAgICAgICAgICAgICAgICByZXBvcnRCeVdhbGtlcih2YWx1ZSwgb2JqLCBwYXJzZWRPYmplY3RzLCB0aGlzLnJvb3QsIHJvb3RVcmwsIHR5cGVJZCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgIGRvbnRTa2lwTnVsbDogdHJ1ZSxcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufVxyXG5cclxuLy8g55So6L+Z5Liq5qih5Z2X5p2l5qCH6K6w5om+5LiN5Yiw6ISa5pys55qE5a+56LGhXHJcbmV4cG9ydCBjb25zdCBNaXNzaW5nQ2xhc3MgPSB7XHJcbiAgICByZXBvcnRlcjogbmV3IE1pc3NpbmdDbGFzc1JlcG9ydGVyKCksXHJcbiAgICBjbGFzc0ZpbmRlcihpZDogYW55LCBvd25lcj86IGFueSwgcHJvcE5hbWU/OiBhbnkpIHtcclxuICAgICAgICBjb25zdCBjbHMgPSBjYy5qcy5nZXRDbGFzc0J5SWQoaWQpO1xyXG4gICAgICAgIGlmIChjbHMpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGNscztcclxuICAgICAgICB9IGVsc2UgaWYgKGlkKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgTWlzc2luZyBjbGFzczogJHtpZH1gKTtcclxuICAgICAgICAgICAgTWlzc2luZ0NsYXNzLmhhc01pc3NpbmdDbGFzcyA9IHRydWU7XHJcbiAgICAgICAgICAgIE1pc3NpbmdDbGFzcy5yZXBvcnRlci5zdGFzaEJ5T3duZXIob3duZXIsIHByb3BOYW1lLCBpZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfSxcclxuICAgIGhhc01pc3NpbmdDbGFzczogZmFsc2UsXHJcbiAgICByZXBvcnRNaXNzaW5nQ2xhc3MoYXNzZXQ6IGFueSkge1xyXG4gICAgICAgIGlmICghYXNzZXQuX3V1aWQpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoTWlzc2luZ0NsYXNzLmhhc01pc3NpbmdDbGFzcykge1xyXG4gICAgICAgICAgICBNaXNzaW5nQ2xhc3MucmVwb3J0ZXIucm9vdCA9IGFzc2V0O1xyXG4gICAgICAgICAgICBNaXNzaW5nQ2xhc3MucmVwb3J0ZXIucmVwb3J0QnlPd25lcigpO1xyXG4gICAgICAgICAgICBNaXNzaW5nQ2xhc3MuaGFzTWlzc2luZ0NsYXNzID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIHJlc2V0KCkge1xyXG4gICAgICAgIE1pc3NpbmdDbGFzcy5yZXBvcnRlci5yZXNldCgpO1xyXG4gICAgfSxcclxufTtcclxuXHJcbi8vIEB0cy1pZ25vcmVcclxuTWlzc2luZ0NsYXNzLmNsYXNzRmluZGVyLm9uRGVyZWZlcmVuY2VkID0gZnVuY3Rpb24gKGN1ck93bmVyOiBhbnksIGN1clByb3BOYW1lOiBhbnksIG5ld093bmVyOiBhbnksIG5ld1Byb3BOYW1lOiBhbnkpIHtcclxuICAgIGNvbnN0IGlkID0gTWlzc2luZ0NsYXNzLnJlcG9ydGVyLnJlbW92ZVN0YXNoZWRCeU93bmVyKGN1ck93bmVyLCBjdXJQcm9wTmFtZSk7XHJcbiAgICBpZiAoaWQpIHtcclxuICAgICAgICBNaXNzaW5nQ2xhc3MucmVwb3J0ZXIuc3Rhc2hCeU93bmVyKG5ld093bmVyLCBuZXdQcm9wTmFtZSwgaWQpO1xyXG4gICAgfVxyXG59O1xyXG4iXX0=