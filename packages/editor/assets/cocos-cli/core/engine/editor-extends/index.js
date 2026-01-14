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
exports.MissingReporter = exports.PrefabUtils = exports.GeometryUtils = exports.Component = exports.Node = exports.Script = exports.UuidUtils = exports.walkProperties = exports.deserializeFull = exports.serializeCompiled = exports.serialize = void 0;
exports.init = init;
exports.emit = emit;
exports.on = on;
exports.removeListener = removeListener;
// MissingReporter
const missing_class_reporter_1 = require("./missing-reporter/missing-class-reporter");
const missing_object_reporter_1 = require("./missing-reporter/missing-object-reporter");
var object_walker_1 = require("./missing-reporter/object-walker");
Object.defineProperty(exports, "walkProperties", { enumerable: true, get: function () { return object_walker_1.walkProperties; } });
const utils_1 = __importDefault(require("../../base/utils"));
const events_1 = __importDefault(require("events"));
const script_1 = __importDefault(require("./manager/script"));
const node_1 = __importDefault(require("./manager/node"));
const component_1 = __importDefault(require("./manager/component"));
exports.UuidUtils = utils_1.default.UUID;
exports.Script = new script_1.default();
exports.Node = new node_1.default();
exports.Component = new component_1.default();
exports.MissingReporter = {
    classInstance: missing_class_reporter_1.MissingClass,
    class: missing_class_reporter_1.MissingClassReporter,
    object: missing_object_reporter_1.MissingObjectReporter,
};
async function init() {
    const serializeUtils = await Promise.resolve().then(() => __importStar(require('./utils/serialize')));
    exports.serialize = serializeUtils.serialize;
    exports.serializeCompiled = serializeUtils.serializeCompiled;
    exports.deserializeFull = await Promise.resolve().then(() => __importStar(require('./utils/deserialize')));
    exports.GeometryUtils = await Promise.resolve().then(() => __importStar(require('./utils/geometry')));
    exports.PrefabUtils = await Promise.resolve().then(() => __importStar(require('./utils/prefab')));
    exports.Script.allow = true;
    exports.Node.allow = true;
    exports.Component.allow = true;
}
const event = new events_1.default();
function emit(name, ...args) {
    event.emit(name, ...args);
}
function on(name, handle) {
    event.on(name, handle);
}
function removeListener(name, handle) {
    event.removeListener(name, handle);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29yZS9lbmdpbmUvZWRpdG9yLWV4dGVuZHMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFnQ2Isb0JBV0M7QUFJRCxvQkFFQztBQUVELGdCQUVDO0FBRUQsd0NBRUM7QUFuREQsa0JBQWtCO0FBQ2xCLHNGQUErRjtBQUMvRix3RkFBbUY7QUFDbkYsa0VBQWtFO0FBQXpELCtHQUFBLGNBQWMsT0FBQTtBQUV2Qiw2REFBcUM7QUFDckMsb0RBQWtDO0FBQ2xDLDhEQUE2QztBQUM3QywwREFBeUM7QUFDekMsb0VBQW1EO0FBRXRDLFFBQUEsU0FBUyxHQUFHLGVBQUssQ0FBQyxJQUFJLENBQUM7QUFFdkIsUUFBQSxNQUFNLEdBQUcsSUFBSSxnQkFBYSxFQUFFLENBQUM7QUFDN0IsUUFBQSxJQUFJLEdBQUcsSUFBSSxjQUFXLEVBQUUsQ0FBQztBQUN6QixRQUFBLFNBQVMsR0FBRyxJQUFJLG1CQUFnQixFQUFFLENBQUM7QUFLbkMsUUFBQSxlQUFlLEdBQUc7SUFDM0IsYUFBYSxFQUFFLHFDQUFZO0lBQzNCLEtBQUssRUFBRSw2Q0FBb0I7SUFDM0IsTUFBTSxFQUFFLCtDQUFxQjtDQUNoQyxDQUFDO0FBRUssS0FBSyxVQUFVLElBQUk7SUFDdEIsTUFBTSxjQUFjLEdBQUcsd0RBQWEsbUJBQW1CLEdBQUMsQ0FBQztJQUN6RCxpQkFBUyxHQUFHLGNBQWMsQ0FBQyxTQUFTLENBQUM7SUFDckMseUJBQWlCLEdBQUcsY0FBYyxDQUFDLGlCQUFpQixDQUFDO0lBQ3JELHVCQUFlLEdBQUcsd0RBQWEscUJBQXFCLEdBQUMsQ0FBQztJQUN0RCxxQkFBYSxHQUFHLHdEQUFhLGtCQUFrQixHQUFDLENBQUM7SUFDakQsbUJBQVcsR0FBRyx3REFBYSxnQkFBZ0IsR0FBQyxDQUFDO0lBRTdDLGNBQU0sQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO0lBQ3BCLFlBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO0lBQ2xCLGlCQUFTLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztBQUMzQixDQUFDO0FBRUQsTUFBTSxLQUFLLEdBQUcsSUFBSSxnQkFBWSxFQUFFLENBQUM7QUFFakMsU0FBZ0IsSUFBSSxDQUFDLElBQXFCLEVBQUUsR0FBRyxJQUFjO0lBQ3pELEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7QUFDOUIsQ0FBQztBQUVELFNBQWdCLEVBQUUsQ0FBQyxJQUFxQixFQUFFLE1BQWdDO0lBQ3RFLEtBQUssQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQzNCLENBQUM7QUFFRCxTQUFnQixjQUFjLENBQUMsSUFBcUIsRUFBRSxNQUFnQztJQUNsRixLQUFLLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztBQUN2QyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xyXG5cclxuZXhwb3J0IGxldCBzZXJpYWxpemU6IGFueTtcclxuZXhwb3J0IGxldCBzZXJpYWxpemVDb21waWxlZDogYW55O1xyXG5leHBvcnQgbGV0IGRlc2VyaWFsaXplRnVsbDogYW55O1xyXG5cclxuLy8gTWlzc2luZ1JlcG9ydGVyXHJcbmltcG9ydCB7IE1pc3NpbmdDbGFzc1JlcG9ydGVyLCBNaXNzaW5nQ2xhc3MgfSBmcm9tICcuL21pc3NpbmctcmVwb3J0ZXIvbWlzc2luZy1jbGFzcy1yZXBvcnRlcic7XHJcbmltcG9ydCB7IE1pc3NpbmdPYmplY3RSZXBvcnRlciB9IGZyb20gJy4vbWlzc2luZy1yZXBvcnRlci9taXNzaW5nLW9iamVjdC1yZXBvcnRlcic7XHJcbmV4cG9ydCB7IHdhbGtQcm9wZXJ0aWVzIH0gZnJvbSAnLi9taXNzaW5nLXJlcG9ydGVyL29iamVjdC13YWxrZXInO1xyXG5cclxuaW1wb3J0IHV0aWxzIGZyb20gJy4uLy4uL2Jhc2UvdXRpbHMnO1xyXG5pbXBvcnQgRXZlbnRFbWl0dGVyIGZyb20gJ2V2ZW50cyc7XHJcbmltcG9ydCBTY3JpcHRNYW5hZ2VyIGZyb20gJy4vbWFuYWdlci9zY3JpcHQnO1xyXG5pbXBvcnQgTm9kZU1hbmFnZXIgZnJvbSAnLi9tYW5hZ2VyL25vZGUnO1xyXG5pbXBvcnQgQ29tcG9uZW50TWFuYWdlciBmcm9tICcuL21hbmFnZXIvY29tcG9uZW50JztcclxuXHJcbmV4cG9ydCBjb25zdCBVdWlkVXRpbHMgPSB1dGlscy5VVUlEO1xyXG5cclxuZXhwb3J0IGNvbnN0IFNjcmlwdCA9IG5ldyBTY3JpcHRNYW5hZ2VyKCk7XHJcbmV4cG9ydCBjb25zdCBOb2RlID0gbmV3IE5vZGVNYW5hZ2VyKCk7XHJcbmV4cG9ydCBjb25zdCBDb21wb25lbnQgPSBuZXcgQ29tcG9uZW50TWFuYWdlcigpO1xyXG5cclxuZXhwb3J0IGxldCBHZW9tZXRyeVV0aWxzOiBhbnk7XHJcbmV4cG9ydCBsZXQgUHJlZmFiVXRpbHM6IGFueTtcclxuXHJcbmV4cG9ydCBjb25zdCBNaXNzaW5nUmVwb3J0ZXIgPSB7XHJcbiAgICBjbGFzc0luc3RhbmNlOiBNaXNzaW5nQ2xhc3MsXHJcbiAgICBjbGFzczogTWlzc2luZ0NsYXNzUmVwb3J0ZXIsXHJcbiAgICBvYmplY3Q6IE1pc3NpbmdPYmplY3RSZXBvcnRlcixcclxufTtcclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBpbml0KCkge1xyXG4gICAgY29uc3Qgc2VyaWFsaXplVXRpbHMgPSBhd2FpdCBpbXBvcnQoJy4vdXRpbHMvc2VyaWFsaXplJyk7XHJcbiAgICBzZXJpYWxpemUgPSBzZXJpYWxpemVVdGlscy5zZXJpYWxpemU7XHJcbiAgICBzZXJpYWxpemVDb21waWxlZCA9IHNlcmlhbGl6ZVV0aWxzLnNlcmlhbGl6ZUNvbXBpbGVkO1xyXG4gICAgZGVzZXJpYWxpemVGdWxsID0gYXdhaXQgaW1wb3J0KCcuL3V0aWxzL2Rlc2VyaWFsaXplJyk7XHJcbiAgICBHZW9tZXRyeVV0aWxzID0gYXdhaXQgaW1wb3J0KCcuL3V0aWxzL2dlb21ldHJ5Jyk7XHJcbiAgICBQcmVmYWJVdGlscyA9IGF3YWl0IGltcG9ydCgnLi91dGlscy9wcmVmYWInKTtcclxuXHJcbiAgICBTY3JpcHQuYWxsb3cgPSB0cnVlO1xyXG4gICAgTm9kZS5hbGxvdyA9IHRydWU7XHJcbiAgICBDb21wb25lbnQuYWxsb3cgPSB0cnVlO1xyXG59XHJcblxyXG5jb25zdCBldmVudCA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBlbWl0KG5hbWU6IHN0cmluZyB8IHN5bWJvbCwgLi4uYXJnczogc3RyaW5nW10pIHtcclxuICAgIGV2ZW50LmVtaXQobmFtZSwgLi4uYXJncyk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBvbihuYW1lOiBzdHJpbmcgfCBzeW1ib2wsIGhhbmRsZTogKC4uLmFyZ3M6IGFueVtdKSA9PiB2b2lkKSB7XHJcbiAgICBldmVudC5vbihuYW1lLCBoYW5kbGUpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gcmVtb3ZlTGlzdGVuZXIobmFtZTogc3RyaW5nIHwgc3ltYm9sLCBoYW5kbGU6ICguLi5hcmdzOiBhbnlbXSkgPT4gdm9pZCkge1xyXG4gICAgZXZlbnQucmVtb3ZlTGlzdGVuZXIobmFtZSwgaGFuZGxlKTtcclxufVxyXG5cclxuZGVjbGFyZSBnbG9iYWwge1xyXG4gICAgZXhwb3J0IGNvbnN0IEVkaXRvckV4dGVuZHM6IHR5cGVvZiBpbXBvcnQoJy4nKTtcclxuICAgIGV4cG9ydCBuYW1lc3BhY2UgY2NlIHtcclxuICAgICAgICBleHBvcnQgbmFtZXNwYWNlIFV0aWxzIHtcclxuICAgICAgICAgICAgZXhwb3J0IGNvbnN0IHNlcmlhbGl6ZTogdHlwZW9mIGltcG9ydCgnLi91dGlscy9zZXJpYWxpemUvaW5kZXgnKVsnc2VyaWFsaXplJ107XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiJdfQ==