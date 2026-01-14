"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComponentService = void 0;
const cc_1 = require("cc");
const rpc_1 = require("../rpc");
const core_1 = require("./core");
const common_1 = require("../../common");
const dump_1 = __importDefault(require("./dump"));
const index_1 = __importDefault(require("./component/index"));
const utils_1 = __importDefault(require("./component/utils"));
const node_utils_1 = require("./node/node-utils");
const NodeMgr = EditorExtends.Node;
/**
 * 子进程节点处理器
 * 在子进程中处理所有节点相关操作
 */
let ComponentService = class ComponentService extends core_1.BaseService {
    async addComponentImpl(path, componentNameOrUUIDOrURL) {
        const node = NodeMgr.getNodeByPath(path);
        if (!node) {
            throw new Error(`add component failed: ${path} does not exist`);
        }
        if (!componentNameOrUUIDOrURL || componentNameOrUUIDOrURL.length <= 0) {
            throw new Error(`add component failed: ${componentNameOrUUIDOrURL} does not exist`);
        }
        // 需要单独处理 missing script
        if (componentNameOrUUIDOrURL === 'MissingScript' || componentNameOrUUIDOrURL === 'cc.MissingScript') {
            throw new Error('Reset Component failed: MissingScript does not exist');
        }
        // 处理 URL 与 Uuid
        const isURL = componentNameOrUUIDOrURL.startsWith('db://');
        const isUuid = utils_1.default.isUUID(componentNameOrUUIDOrURL);
        let uuid;
        if (isUuid) {
            uuid = componentNameOrUUIDOrURL;
        }
        else if (isURL) {
            uuid = await rpc_1.Rpc.getInstance().request('assetManager', 'queryUUID', [componentNameOrUUIDOrURL]);
        }
        if (uuid) {
            const cid = await core_1.Service.Script.queryScriptCid(uuid);
            if (cid && cid !== 'MissingScript' && cid !== 'cc.MissingScript') {
                componentNameOrUUIDOrURL = cid;
            }
        }
        let comp = null;
        let ctor = cc.js.getClassById(componentNameOrUUIDOrURL);
        if (!ctor) {
            ctor = cc.js.getClassByName(componentNameOrUUIDOrURL);
        }
        if (cc.js.isChildClassOf(ctor, cc_1.Component)) {
            comp = node.addComponent(ctor); // 触发引擎上节点添加组件
        }
        else {
            console.error(`ctor with name ${componentNameOrUUIDOrURL} is not child class of Component `);
            throw new Error(`ctor with name ${componentNameOrUUIDOrURL} is not child class of Component `);
        }
        this.emit('component:add', comp);
        return dump_1.default.dumpComponent(comp);
    }
    async addComponent(params) {
        return await this.addComponentImpl(params.nodePath, params.component);
    }
    async removeComponent(params) {
        const comp = index_1.default.queryFromPath(params.path);
        if (!comp) {
            throw new Error(`Remove component failed: ${params.path} does not exist`);
        }
        this.emit('component:before-remove', comp);
        const result = index_1.default.removeComponent(comp);
        // 需要立刻执行removeComponent操作，否则会延迟到下一帧
        cc.Object._deferredDestroy();
        this.emit('component:remove', comp);
        return result;
    }
    async queryComponent(params) {
        const comp = index_1.default.queryFromPath(params.path);
        if (!comp) {
            console.warn(`Query component failed: ${params.path} does not exist`);
            return null;
        }
        return (dump_1.default.dumpComponent(comp));
    }
    async setProperty(options) {
        return this.setPropertyImp(options);
    }
    async setPropertyImp(options) {
        const component = index_1.default.queryFromPath(options.componentPath);
        if (!component) {
            throw new Error(`Failed to set property: Target component(${options.componentPath}) not found`);
        }
        const compProperties = (dump_1.default.dumpComponent(component));
        const properties = Object.entries(options.properties);
        const idx = component.node.components.findIndex(comp => comp === component);
        for (const [key, value] of properties) {
            if (!compProperties.properties[key]) {
                throw new Error(`Failed to set property: Target property(${key}) not found`);
                // continue;
            }
            const compProperty = compProperties.properties[key];
            compProperty.value = value;
            // 恢复数据
            await dump_1.default.restoreProperty(component, key, compProperty);
            this.emit('component:set-property', component, {
                type: common_1.NodeEventType.SET_PROPERTY,
                propPath: `__comps__.${idx}.${key}`,
            });
        }
        return true;
    }
    async queryAllComponent() {
        const keys = Object.keys(cc.js._registeredClassNames);
        const components = [];
        keys.forEach((key) => {
            try {
                const cclass = new cc.js._registeredClassNames[key];
                if (cclass instanceof cc.Component) {
                    components.push(cc.js.getClassName(cclass));
                }
            }
            catch (e) { }
        });
        return components;
    }
    init() {
        this.registerCompMgrEvents();
    }
    CompMgrEventHandlers = {
        ['add']: 'add',
        ['remove']: 'remove',
    };
    compMgrEventHandlers = new Map();
    /**
     * 注册引擎 Node 管理相关事件的监听
     */
    registerCompMgrEvents() {
        this.unregisterCompMgrEvents();
        Object.entries(this.CompMgrEventHandlers).forEach(([eventType, handlerName]) => {
            const handler = this[handlerName].bind(this);
            EditorExtends.Component.on(eventType, handler);
            this.compMgrEventHandlers.set(eventType, handler);
        });
    }
    unregisterCompMgrEvents() {
        Object.keys(this.CompMgrEventHandlers).forEach(eventType => {
            const handler = this.compMgrEventHandlers.get(eventType);
            if (handler) {
                EditorExtends.Component.off(eventType, handler);
                this.compMgrEventHandlers.delete(eventType);
            }
        });
    }
    /**
     * 添加到组件缓存
     * @param {String} uuid
     * @param {cc.Component} component
     */
    add(uuid, component) {
        if ((0, node_utils_1.isEditorNode)(component.node)) {
            return;
        }
        this.emit('component:added', component);
    }
    /**
     * 移除组件缓存
     * @param {String} uuid
     * @param {cc.Component} component
     */
    remove(uuid, component) {
        if ((0, node_utils_1.isEditorNode)(component.node)) {
            return;
        }
        this.emit('component:removed', component);
    }
};
exports.ComponentService = ComponentService;
exports.ComponentService = ComponentService = __decorate([
    (0, core_1.register)('Component')
], ComponentService);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2NvcmUvc2NlbmUvc2NlbmUtcHJvY2Vzcy9zZXJ2aWNlL2NvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSwyQkFBNEM7QUFDNUMsZ0NBQTZCO0FBQzdCLGlDQUF3RDtBQUN4RCx5Q0FRc0I7QUFDdEIsa0RBQThCO0FBQzlCLDhEQUF3QztBQUN4Qyw4REFBK0M7QUFDL0Msa0RBQWlEO0FBRWpELE1BQU0sT0FBTyxHQUFHLGFBQWEsQ0FBQyxJQUFJLENBQUM7QUFFbkM7OztHQUdHO0FBRUksSUFBTSxnQkFBZ0IsR0FBdEIsTUFBTSxnQkFBaUIsU0FBUSxrQkFBNkI7SUFDdkQsS0FBSyxDQUFDLGdCQUFnQixDQUFDLElBQVksRUFBRSx3QkFBZ0M7UUFDekUsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN6QyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDUixNQUFNLElBQUksS0FBSyxDQUFDLHlCQUF5QixJQUFJLGlCQUFpQixDQUFDLENBQUM7UUFDcEUsQ0FBQztRQUNELElBQUksQ0FBQyx3QkFBd0IsSUFBSSx3QkFBd0IsQ0FBQyxNQUFNLElBQUksQ0FBQyxFQUFFLENBQUM7WUFDcEUsTUFBTSxJQUFJLEtBQUssQ0FBQyx5QkFBeUIsd0JBQXdCLGlCQUFpQixDQUFDLENBQUM7UUFDeEYsQ0FBQztRQUNELHdCQUF3QjtRQUN4QixJQUFJLHdCQUF3QixLQUFLLGVBQWUsSUFBSSx3QkFBd0IsS0FBSyxrQkFBa0IsRUFBRSxDQUFDO1lBQ2xHLE1BQU0sSUFBSSxLQUFLLENBQUMsc0RBQXNELENBQUMsQ0FBQztRQUM1RSxDQUFDO1FBRUQsZ0JBQWdCO1FBQ2hCLE1BQU0sS0FBSyxHQUFHLHdCQUF3QixDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUMz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QUksQ0FBQyxFQUFFLENBQUM7WUFDL0IsT0FBTztRQUNYLENBQUM7UUFDRCxJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQzVDLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsTUFBTSxDQUFDLElBQVksRUFBRSxTQUFvQjtRQUNyQyxJQUFJLElBQUEseUJBQVksRUFBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztZQUMvQixPQUFPO1FBQ1gsQ0FBQztRQUNELElBQUksQ0FBQyxJQUFJLENBQUMsbUJBQW1CLEVBQUUsU0FBUyxDQUFDLENBQUM7SUFDOUMsQ0FBQztDQUNKLENBQUE7QUE5S1ksNENBQWdCOzJCQUFoQixnQkFBZ0I7SUFENUIsSUFBQSxlQUFRLEVBQUMsV0FBVyxDQUFDO0dBQ1QsZ0JBQWdCLENBOEs1QiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgQ29uc3RydWN0b3IgfSBmcm9tICdjYyc7XHJcbmltcG9ydCB7IFJwYyB9IGZyb20gJy4uL3JwYyc7XHJcbmltcG9ydCB7IHJlZ2lzdGVyLCBTZXJ2aWNlLCBCYXNlU2VydmljZSB9IGZyb20gJy4vY29yZSc7XHJcbmltcG9ydCB7XHJcbiAgICBJQ29tcG9uZW50RXZlbnRzLFxyXG4gICAgSUFkZENvbXBvbmVudE9wdGlvbnMsXHJcbiAgICBJQ29tcG9uZW50LFxyXG4gICAgSUNvbXBvbmVudFNlcnZpY2UsXHJcbiAgICBJUXVlcnlDb21wb25lbnRPcHRpb25zLFxyXG4gICAgSVJlbW92ZUNvbXBvbmVudE9wdGlvbnMsXHJcbiAgICBJU2V0UHJvcGVydHlPcHRpb25zLCBOb2RlRXZlbnRUeXBlXHJcbn0gZnJvbSAnLi4vLi4vY29tbW9uJztcclxuaW1wb3J0IGR1bXBVdGlsIGZyb20gJy4vZHVtcCc7XHJcbmltcG9ydCBjb21wTWdyIGZyb20gJy4vY29tcG9uZW50L2luZGV4JztcclxuaW1wb3J0IGNvbXBvbmVudFV0aWxzIGZyb20gJy4vY29tcG9uZW50L3V0aWxzJztcclxuaW1wb3J0IHsgaXNFZGl0b3JOb2RlIH0gZnJvbSAnLi9ub2RlL25vZGUtdXRpbHMnO1xyXG5cclxuY29uc3QgTm9kZU1nciA9IEVkaXRvckV4dGVuZHMuTm9kZTtcclxuXHJcbi8qKlxyXG4gKiDlrZDov5vnqIvoioLngrnlpITnkIblmahcclxuICog5Zyo5a2Q6L+b56iL5Lit5aSE55CG5omA5pyJ6IqC54K555u45YWz5pON5L2cXHJcbiAqL1xyXG5AcmVnaXN0ZXIoJ0NvbXBvbmVudCcpXHJcbmV4cG9ydCBjbGFzcyBDb21wb25lbnRTZXJ2aWNlIGV4dGVuZHMgQmFzZVNlcnZpY2U8SUNvbXBvbmVudEV2ZW50cz4gaW1wbGVtZW50cyBJQ29tcG9uZW50U2VydmljZSB7XHJcbiAgICBwcml2YXRlIGFzeW5jIGFkZENvbXBvbmVudEltcGwocGF0aDogc3RyaW5nLCBjb21wb25lbnROYW1lT3JVVUlET3JVUkw6IHN0cmluZyk6IFByb21pc2U8SUNvbXBvbmVudD4ge1xyXG4gICAgICAgIGNvbnN0IG5vZGUgPSBOb2RlTWdyLmdldE5vZGVCeVBhdGgocGF0aCk7XHJcbiAgICAgICAgaWYgKCFub2RlKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgYWRkIGNvbXBvbmVudCBmYWlsZWQ6ICR7cGF0aH0gZG9lcyBub3QgZXhpc3RgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFjb21wb25lbnROYW1lT3JVVUlET3JVUkwgfHwgY29tcG9uZW50TmFtZU9yVVVJRE9yVVJMLmxlbmd0aCA8PSAwKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgYWRkIGNvbXBvbmVudCBmYWlsZWQ6ICR7Y29tcG9uZW50TmFtZU9yVVVJRE9yVVJMfSBkb2VzIG5vdCBleGlzdGApO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyDpnIDopoHljZXni6zlpITnkIYgbWlzc2luZyBzY3JpcHRcclxuICAgICAgICBpZiAoY29tcG9uZW50TmFtZU9yVVVJRE9yVVJMID09PSAnTWlzc2luZ1NjcmlwdCcgfHwgY29tcG9uZW50TmFtZU9yVVVJRE9yVVJMID09PSAnY2MuTWlzc2luZ1NjcmlwdCcpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdSZXNldCBDb21wb25lbnQgZmFpbGVkOiBNaXNzaW5nU2NyaXB0IGRvZXMgbm90IGV4aXN0Jyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyDlpITnkIYgVVJMIOS4jiBVdWlkXHJcbiAgICAgICAgY29uc3QgaXNVUkwgPSBjb21wb25lbnROYW1lT3JVVUlET3JVUkwuc3RhcnRzV2l0aCgnZGI6Ly8nKTtcclxuICAgICAgICBjb25zdCBpc1V1aWQgPSBjb21wb25lbnRVdGlscy5pc1VVSUQoY29tcG9uZW50TmFtZU9yVVVJRE9yVVJMKTtcclxuICAgICAgICBsZXQgdXVpZDtcclxuICAgICAgICBpZiAoaXNVdWlkKSB7XHJcbiAgICAgICAgICAgIHV1aWQgPSBjb21wb25lbnROYW1lT3JVVUlET3JVUkw7XHJcbiAgICAgICAgfSBlbHNlIGlmIChpc1VSTCkge1xyXG4gICAgICAgICAgICB1dWlkID0gYXdhaXQgUnBjLmdldEluc3RhbmNlKCkucmVxdWVzdCgnYXNzZXRNYW5hZ2VyJywgJ3F1ZXJ5VVVJRCcsIFtjb21wb25lbnROYW1lT3JVVUlET3JVUkxdKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHV1aWQpIHtcclxuICAgICAgICAgICAgY29uc3QgY2lkID0gYXdhaXQgU2VydmljZS5TY3JpcHQucXVlcnlTY3JpcHRDaWQodXVpZCk7XHJcbiAgICAgICAgICAgIGlmIChjaWQgJiYgY2lkICE9PSAnTWlzc2luZ1NjcmlwdCcgJiYgY2lkICE9PSAnY2MuTWlzc2luZ1NjcmlwdCcpIHtcclxuICAgICAgICAgICAgICAgIGNvbXBvbmVudE5hbWVPclVVSURPclVSTCA9IGNpZDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IGNvbXAgPSBudWxsO1xyXG4gICAgICAgIGxldCBjdG9yID0gY2MuanMuZ2V0Q2xhc3NCeUlkKGNvbXBvbmVudE5hbWVPclVVSURPclVSTCk7XHJcbiAgICAgICAgaWYgKCFjdG9yKSB7XHJcbiAgICAgICAgICAgIGN0b3IgPSBjYy5qcy5nZXRDbGFzc0J5TmFtZShjb21wb25lbnROYW1lT3JVVUlET3JVUkwpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoY2MuanMuaXNDaGlsZENsYXNzT2YoY3RvciwgQ29tcG9uZW50KSkge1xyXG4gICAgICAgICAgICBjb21wID0gbm9kZS5hZGRDb21wb25lbnQoY3RvciBhcyBDb25zdHJ1Y3RvcjxDb21wb25lbnQ+KTsgLy8g6Kem5Y+R5byV5pOO5LiK6IqC54K55re75Yqg57uE5Lu2XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgY3RvciB3aXRoIG5hbWUgJHtjb21wb25lbnROYW1lT3JVVUlET3JVUkx9IGlzIG5vdCBjaGlsZCBjbGFzcyBvZiBDb21wb25lbnQgYCk7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgY3RvciB3aXRoIG5hbWUgJHtjb21wb25lbnROYW1lT3JVVUlET3JVUkx9IGlzIG5vdCBjaGlsZCBjbGFzcyBvZiBDb21wb25lbnQgYCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmVtaXQoJ2NvbXBvbmVudDphZGQnLCBjb21wKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGR1bXBVdGlsLmR1bXBDb21wb25lbnQoY29tcCBhcyBDb21wb25lbnQpO1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIGFkZENvbXBvbmVudChwYXJhbXM6IElBZGRDb21wb25lbnRPcHRpb25zKTogUHJvbWlzZTxJQ29tcG9uZW50PiB7XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuYWRkQ29tcG9uZW50SW1wbChwYXJhbXMubm9kZVBhdGgsIHBhcmFtcy5jb21wb25lbnQpO1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIHJlbW92ZUNvbXBvbmVudChwYXJhbXM6IElSZW1vdmVDb21wb25lbnRPcHRpb25zKTogUHJvbWlzZTxib29sZWFuPiB7XHJcbiAgICAgICAgY29uc3QgY29tcCA9IGNvbXBNZ3IucXVlcnlGcm9tUGF0aChwYXJhbXMucGF0aCk7XHJcbiAgICAgICAgaWYgKCFjb21wKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgUmVtb3ZlIGNvbXBvbmVudCBmYWlsZWQ6ICR7cGFyYW1zLnBhdGh9IGRvZXMgbm90IGV4aXN0YCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmVtaXQoJ2NvbXBvbmVudDpiZWZvcmUtcmVtb3ZlJywgY29tcCk7XHJcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gY29tcE1nci5yZW1vdmVDb21wb25lbnQoY29tcCk7XHJcbiAgICAgICAgLy8g6ZyA6KaB56uL5Yi75omn6KGMcmVtb3ZlQ29tcG9uZW505pON5L2c77yM5ZCm5YiZ5Lya5bu26L+f5Yiw5LiL5LiA5binXHJcbiAgICAgICAgY2MuT2JqZWN0Ll9kZWZlcnJlZERlc3Ryb3koKTtcclxuICAgICAgICB0aGlzLmVtaXQoJ2NvbXBvbmVudDpyZW1vdmUnLCBjb21wKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBxdWVyeUNvbXBvbmVudChwYXJhbXM6IElRdWVyeUNvbXBvbmVudE9wdGlvbnMpOiBQcm9taXNlPElDb21wb25lbnQgfCBudWxsPiB7XHJcbiAgICAgICAgY29uc3QgY29tcCA9IGNvbXBNZ3IucXVlcnlGcm9tUGF0aChwYXJhbXMucGF0aCk7XHJcbiAgICAgICAgaWYgKCFjb21wKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgUXVlcnkgY29tcG9uZW50IGZhaWxlZDogJHtwYXJhbXMucGF0aH0gZG9lcyBub3QgZXhpc3RgKTtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiAoZHVtcFV0aWwuZHVtcENvbXBvbmVudChjb21wIGFzIENvbXBvbmVudCkpO1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIHNldFByb3BlcnR5KG9wdGlvbnM6IElTZXRQcm9wZXJ0eU9wdGlvbnMpOiBQcm9taXNlPGJvb2xlYW4+IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5zZXRQcm9wZXJ0eUltcChvcHRpb25zKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFzeW5jIHNldFByb3BlcnR5SW1wKG9wdGlvbnM6IElTZXRQcm9wZXJ0eU9wdGlvbnMpOiBQcm9taXNlPGJvb2xlYW4+IHtcclxuICAgICAgICBjb25zdCBjb21wb25lbnQgPSBjb21wTWdyLnF1ZXJ5RnJvbVBhdGgob3B0aW9ucy5jb21wb25lbnRQYXRoKTtcclxuICAgICAgICBpZiAoIWNvbXBvbmVudCkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEZhaWxlZCB0byBzZXQgcHJvcGVydHk6IFRhcmdldCBjb21wb25lbnQoJHtvcHRpb25zLmNvbXBvbmVudFBhdGh9KSBub3QgZm91bmRgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgY29tcFByb3BlcnRpZXMgPSAoZHVtcFV0aWwuZHVtcENvbXBvbmVudChjb21wb25lbnQgYXMgQ29tcG9uZW50KSk7XHJcbiAgICAgICAgY29uc3QgcHJvcGVydGllcyA9IE9iamVjdC5lbnRyaWVzKG9wdGlvbnMucHJvcGVydGllcyk7XHJcblxyXG4gICAgICAgIGNvbnN0IGlkeCA9IGNvbXBvbmVudC5ub2RlLmNvbXBvbmVudHMuZmluZEluZGV4KGNvbXAgPT4gY29tcCA9PT0gY29tcG9uZW50KTtcclxuICAgICAgICBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBwcm9wZXJ0aWVzKSB7XHJcbiAgICAgICAgICAgIGlmICghY29tcFByb3BlcnRpZXMucHJvcGVydGllc1trZXldKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEZhaWxlZCB0byBzZXQgcHJvcGVydHk6IFRhcmdldCBwcm9wZXJ0eSgke2tleX0pIG5vdCBmb3VuZGApO1xyXG4gICAgICAgICAgICAgICAgLy8gY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3QgY29tcFByb3BlcnR5ID0gY29tcFByb3BlcnRpZXMucHJvcGVydGllc1trZXldO1xyXG4gICAgICAgICAgICBjb21wUHJvcGVydHkudmFsdWUgPSB2YWx1ZTtcclxuICAgICAgICAgICAgLy8g5oGi5aSN5pWw5o2uXHJcbiAgICAgICAgICAgIGF3YWl0IGR1bXBVdGlsLnJlc3RvcmVQcm9wZXJ0eShjb21wb25lbnQsIGtleSwgY29tcFByb3BlcnR5KTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuZW1pdCgnY29tcG9uZW50OnNldC1wcm9wZXJ0eScsIGNvbXBvbmVudCwge1xyXG4gICAgICAgICAgICAgICAgdHlwZTogTm9kZUV2ZW50VHlwZS5TRVRfUFJPUEVSVFksXHJcbiAgICAgICAgICAgICAgICBwcm9wUGF0aDogYF9fY29tcHNfXy4ke2lkeH0uJHtrZXl9YCxcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIHF1ZXJ5QWxsQ29tcG9uZW50KCkge1xyXG4gICAgICAgIGNvbnN0IGtleXMgPSBPYmplY3Qua2V5cyhjYy5qcy5fcmVnaXN0ZXJlZENsYXNzTmFtZXMpO1xyXG4gICAgICAgIGNvbnN0IGNvbXBvbmVudHM6IHN0cmluZ1tdID0gW107XHJcbiAgICAgICAga2V5cy5mb3JFYWNoKChrZXkpID0+IHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGNjbGFzcyA9IG5ldyBjYy5qcy5fcmVnaXN0ZXJlZENsYXNzTmFtZXNba2V5XTtcclxuICAgICAgICAgICAgICAgIGlmIChjY2xhc3MgaW5zdGFuY2VvZiBjYy5Db21wb25lbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnRzLnB1c2goY2MuanMuZ2V0Q2xhc3NOYW1lKGNjbGFzcykpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7IH1cclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gY29tcG9uZW50cztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgaW5pdCgpIHtcclxuICAgICAgICB0aGlzLnJlZ2lzdGVyQ29tcE1nckV2ZW50cygpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgcmVhZG9ubHkgQ29tcE1nckV2ZW50SGFuZGxlcnMgPSB7XHJcbiAgICAgICAgWydhZGQnXTogJ2FkZCcsXHJcbiAgICAgICAgWydyZW1vdmUnXTogJ3JlbW92ZScsXHJcbiAgICB9IGFzIGNvbnN0O1xyXG4gICAgcHJpdmF0ZSBjb21wTWdyRXZlbnRIYW5kbGVycyA9IG5ldyBNYXA8c3RyaW5nLCAoLi4uYXJnczogW10pID0+IHZvaWQ+KCk7XHJcbiAgICAvKipcclxuICAgICAqIOazqOWGjOW8leaTjiBOb2RlIOeuoeeQhuebuOWFs+S6i+S7tueahOebkeWQrFxyXG4gICAgICovXHJcbiAgICByZWdpc3RlckNvbXBNZ3JFdmVudHMoKSB7XHJcbiAgICAgICAgdGhpcy51bnJlZ2lzdGVyQ29tcE1nckV2ZW50cygpO1xyXG4gICAgICAgIE9iamVjdC5lbnRyaWVzKHRoaXMuQ29tcE1nckV2ZW50SGFuZGxlcnMpLmZvckVhY2goKFtldmVudFR5cGUsIGhhbmRsZXJOYW1lXSkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBoYW5kbGVyID0gKHRoaXMgYXMgYW55KVtoYW5kbGVyTmFtZV0uYmluZCh0aGlzKTtcclxuICAgICAgICAgICAgRWRpdG9yRXh0ZW5kcy5Db21wb25lbnQub24oZXZlbnRUeXBlLCBoYW5kbGVyKTtcclxuICAgICAgICAgICAgdGhpcy5jb21wTWdyRXZlbnRIYW5kbGVycy5zZXQoZXZlbnRUeXBlLCBoYW5kbGVyKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICB1bnJlZ2lzdGVyQ29tcE1nckV2ZW50cygpIHtcclxuICAgICAgICBPYmplY3Qua2V5cyh0aGlzLkNvbXBNZ3JFdmVudEhhbmRsZXJzKS5mb3JFYWNoKGV2ZW50VHlwZSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IGhhbmRsZXIgPSB0aGlzLmNvbXBNZ3JFdmVudEhhbmRsZXJzLmdldChldmVudFR5cGUpO1xyXG4gICAgICAgICAgICBpZiAoaGFuZGxlcikge1xyXG4gICAgICAgICAgICAgICAgRWRpdG9yRXh0ZW5kcy5Db21wb25lbnQub2ZmKGV2ZW50VHlwZSwgaGFuZGxlcik7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbXBNZ3JFdmVudEhhbmRsZXJzLmRlbGV0ZShldmVudFR5cGUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmt7vliqDliLDnu4Tku7bnvJPlrZhcclxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSB1dWlkXHJcbiAgICAgKiBAcGFyYW0ge2NjLkNvbXBvbmVudH0gY29tcG9uZW50XHJcbiAgICAgKi9cclxuICAgIGFkZCh1dWlkOiBzdHJpbmcsIGNvbXBvbmVudDogQ29tcG9uZW50KSB7XHJcbiAgICAgICAgaWYgKGlzRWRpdG9yTm9kZShjb21wb25lbnQubm9kZSkpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmVtaXQoJ2NvbXBvbmVudDphZGRlZCcsIGNvbXBvbmVudCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDnp7vpmaTnu4Tku7bnvJPlrZhcclxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSB1dWlkXHJcbiAgICAgKiBAcGFyYW0ge2NjLkNvbXBvbmVudH0gY29tcG9uZW50XHJcbiAgICAgKi9cclxuICAgIHJlbW92ZSh1dWlkOiBzdHJpbmcsIGNvbXBvbmVudDogQ29tcG9uZW50KSB7XHJcbiAgICAgICAgaWYgKGlzRWRpdG9yTm9kZShjb21wb25lbnQubm9kZSkpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmVtaXQoJ2NvbXBvbmVudDpyZW1vdmVkJywgY29tcG9uZW50KTtcclxuICAgIH1cclxufVxyXG4iXX0=