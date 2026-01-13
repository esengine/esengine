"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeApi = void 0;
const node_schema_1 = require("./node-schema");
const decorator_js_1 = require("../decorator/decorator.js");
const schema_base_1 = require("../base/schema-base");
const scene_1 = require("../../core/scene");
class NodeApi {
    /**
     * Create Node // 创建节点
     */
    async createNodeByType(options) {
        const ret = {
            code: schema_base_1.COMMON_STATUS.SUCCESS,
            data: undefined,
        };
        try {
            const resultNode = await scene_1.Scene.createNodeByType(options);
            if (resultNode) {
                ret.data = resultNode;
            }
        }
        catch (e) {
            ret.code = schema_base_1.COMMON_STATUS.FAIL;
            console.error('Failed to create node:', e); // 创建节点失败:
            ret.reason = e instanceof Error ? e.message : String(e);
        }
        return ret;
    }
    /**
     * Create Node // 创建节点
     */
    async createNodeByAsset(options) {
        const ret = {
            code: schema_base_1.COMMON_STATUS.SUCCESS,
            data: undefined,
        };
        try {
            const resultNode = await scene_1.Scene.createNodeByAsset(options);
            if (resultNode) {
                ret.data = resultNode;
            }
        }
        catch (e) {
            ret.code = schema_base_1.COMMON_STATUS.FAIL;
            console.error('Failed to create node:', e); // 创建节点失败:
            ret.reason = e instanceof Error ? e.message : String(e);
        }
        return ret;
    }
    /**
     * Delete Node // 删除节点
     */
    async deleteNode(options) {
        const ret = {
            code: schema_base_1.COMMON_STATUS.SUCCESS,
            data: undefined,
        };
        try {
            const result = await scene_1.Scene.deleteNode(options);
            if (!result)
                throw new Error(`node not found at path: ${options.path}`);
            ret.data = {
                path: result.path,
            };
        }
        catch (e) {
            ret.code = schema_base_1.COMMON_STATUS.FAIL;
            console.error('Failed to delete node:', e); // 删除节点失败:
            ret.reason = e instanceof Error ? e.message : String(e);
            delete ret.data;
        }
        return ret;
    }
    /**
     * Update Node // 更新节点
     */
    async updateNode(options) {
        try {
            const data = await scene_1.Scene.updateNode(options);
            return {
                data: data,
                code: schema_base_1.COMMON_STATUS.SUCCESS,
            };
        }
        catch (e) {
            console.error('Failed to update node:', e); // 更新节点失败:
            return {
                code: schema_base_1.COMMON_STATUS.FAIL,
                reason: e instanceof Error ? e.message : String(e),
            };
        }
    }
    /**
    * Query Node // 查询节点
    */
    async queryNode(options) {
        const ret = {
            code: schema_base_1.COMMON_STATUS.SUCCESS,
            data: undefined,
        };
        try {
            const result = await scene_1.Scene.queryNode(options);
            if (!result)
                throw new Error(`node not found at path: ${options.path}`);
            ret.data = result;
        }
        catch (e) {
            ret.code = schema_base_1.COMMON_STATUS.FAIL;
            console.error('Failed to query node:', e); // 查询节点失败:
            ret.reason = e instanceof Error ? e.message : String(e);
        }
        return ret;
    }
}
exports.NodeApi = NodeApi;
__decorate([
    (0, decorator_js_1.tool)('scene-create-node-by-type'),
    (0, decorator_js_1.title)('Create Node By Type') // 根据类型创建节点
    ,
    (0, decorator_js_1.description)('Create a node named name with type nodeType under the path in the currently opened scene. The node path must be unique. If multi-level nodes are not created, empty nodes will be automatically completed.') // 在当前打开的场景中的 path 路径下创建一个名字为 name，类型为 nodeType 的节点，节点的路径必须是唯一的，如果有多级节点没创建，会自动补全空节点。
    ,
    (0, decorator_js_1.result)(node_schema_1.SchemaNodeQueryResult),
    __param(0, (0, decorator_js_1.param)(node_schema_1.SchemaNodeCreateByType)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NodeApi.prototype, "createNodeByType", null);
__decorate([
    (0, decorator_js_1.tool)('scene-create-node-by-asset'),
    (0, decorator_js_1.title)('Create Node By Asset') // 根据资源创建节点
    ,
    (0, decorator_js_1.description)('Create a node named name using dbURL asset under the path in the currently opened scene. The node path must be unique. If multi-level nodes are not created, empty nodes will be automatically completed. Example of resource dbURL format: db://assets/sample.prefab') // 在当前打开的场景中的 path 路径下使用 dbURL 资源，创建一个名字为 name 的节点，节点的路径必须是唯一的，如果有多级节点没创建，会自动补全空节点，资源的 dbURL 格式举例：db://assets/sample.prefab
    ,
    (0, decorator_js_1.result)(node_schema_1.SchemaNodeQueryResult),
    __param(0, (0, decorator_js_1.param)(node_schema_1.SchemaNodeCreateByAsset)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NodeApi.prototype, "createNodeByAsset", null);
__decorate([
    (0, decorator_js_1.tool)('scene-delete-node'),
    (0, decorator_js_1.title)('Delete Node') // 删除节点
    ,
    (0, decorator_js_1.description)('Delete a node in the currently opened scene. You need to pass in the path of the node, such as: Canvas/Node1') // 在当前打开的场景中删除节点，需要传入节点的路径，比如：Canvas/Node1
    ,
    (0, decorator_js_1.result)(node_schema_1.SchemaNodeDeleteResult),
    __param(0, (0, decorator_js_1.param)(node_schema_1.SchemaNodeDelete)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NodeApi.prototype, "deleteNode", null);
__decorate([
    (0, decorator_js_1.tool)('scene-update-node'),
    (0, decorator_js_1.title)('Update Node') // 更新节点
    ,
    (0, decorator_js_1.description)('Update a node in the currently opened scene. You need to pass in the path of the node, such as: Canvas/Node1') // 在当前打开的场景中更新节点，需要传入节点的路径，比如：Canvas/Node1
    ,
    (0, decorator_js_1.result)(node_schema_1.SchemaNodeUpdateResult),
    __param(0, (0, decorator_js_1.param)(node_schema_1.SchemaNodeUpdate)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NodeApi.prototype, "updateNode", null);
__decorate([
    (0, decorator_js_1.tool)('scene-query-node'),
    (0, decorator_js_1.title)('Query Node') // 查询节点
    ,
    (0, decorator_js_1.description)('Query a node in the currently opened scene. You need to pass in the path of the node, such as: Canvas/Node1') // 在当前打开的场景中查询节点，需要传入节点的路径，比如：Canvas/Node1
    ,
    (0, decorator_js_1.result)(node_schema_1.SchemaNodeQueryResult),
    __param(0, (0, decorator_js_1.param)(node_schema_1.SchemaNodeQuery)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NodeApi.prototype, "queryNode", null);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9kZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9hcGkvc2NlbmUvbm9kZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBQSwrQ0FpQnVCO0FBQ3ZCLDREQUFvRjtBQUNwRixxREFBc0U7QUFDdEUsNENBQWtFO0FBRWxFLE1BQWEsT0FBTztJQUVoQjs7T0FFRztJQUtHLEFBQU4sS0FBSyxDQUFDLGdCQUFnQixDQUFnQyxPQUFpQztRQUNuRixNQUFNLEdBQUcsR0FBa0M7WUFDdkMsSUFBSSxFQUFFLDJCQUFhLENBQUMsT0FBTztZQUMzQixJQUFJLEVBQUUsU0FBUztTQUNsQixDQUFDO1FBQ0YsSUFBSSxDQUFDO1lBQ0QsTUFBTSxVQUFVLEdBQUcsTUFBTSxhQUFLLENBQUMsZ0JBQWdCLENBQUMsT0FBa0MsQ0FBQyxDQUFDO1lBQ3BGLElBQUksVUFBVSxFQUFFLENBQUM7Z0JBQ2IsR0FBRyxDQUFDLElBQUksR0FBRyxVQUFVLENBQUM7WUFDMUIsQ0FBQztRQUNMLENBQUM7UUFBQyxPQUFPLENBQUMsRUFBRSxDQUFDO1lBQ1QsR0FBRyxDQUFDLElBQUksR0FBRywyQkFBYSxDQUFDLElBQUksQ0FBQztZQUM5QixPQUFPLENBQUMsS0FBSyxDQUFDLHdCQUF3QixFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVTtZQUN0RCxHQUFHLENBQUMsTUFBTSxHQUFHLENBQUMsWUFBWSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM1RCxDQUFDO1FBRUQsT0FBTyxHQUFHLENBQUM7SUFDZixDQUFDO0lBR0Q7O09BRUc7SUFLRyxBQUFOLEtBQUssQ0FBQyxpQkFBaUIsQ0FBaUMsT0FBa0M7UUFDdEYsTUFBTSxHQUFHLEdBQWtDO1lBQ3ZDLElBQUksRUFBRSwyQkFBYSxDQUFDLE9BQU87WUFDM0IsSUFBSSxFQUFF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QVVLO0lBSkwsSUFBQSxtQkFBSSxFQUFDLG1CQUFtQixDQUFDO0lBQ3pCLElBQUEsb0JBQUssRUFBQyxhQUFhLENBQUMsQ0FBQyxPQUFPOztJQUM1QixJQUFBLDBCQUFXLEVBQUMsOEdBQThHLENBQUMsQ0FBQywwQ0FBMEM7O0lBQ3RLLElBQUEscUJBQU0sRUFBQyxvQ0FBc0IsQ0FBQztJQUNiLFdBQUEsSUFBQSxvQkFBSyxFQUFDLDhCQUFnQixDQUFDLENBQUE7Ozs7eUNBb0J4QztBQVNLO0lBSkwsSUFBQSxtQkFBSSxFQUFDLG1CQUFtQixDQUFDO0lBQ3pCLElBQUEsb0JBQUssRUFBQyxhQUFhLENBQUMsQ0FBQyxPQUFPOztJQUM1QixJQUFBLDBCQUFXLEVBQUMsOEdBQThHLENBQUMsQ0FBQywwQ0FBMEM7O0lBQ3RLLElBQUEscUJBQU0sRUFBQyxvQ0FBc0IsQ0FBQztJQUNiLFdBQUEsSUFBQSxvQkFBSyxFQUFDLDhCQUFnQixDQUFDLENBQUE7Ozs7eUNBY3hDO0FBU0s7SUFKTCxJQUFBLG1CQUFJLEVBQUMsa0JBQWtCLENBQUM7SUFDeEIsSUFBQSxvQkFBSyxFQUFDLFlBQVksQ0FBQyxDQUFDLE9BQU87O0lBQzNCLElBQUEsMEJBQVcsRUFBQyw2R0FBNkcsQ0FBQyxDQUFDLDBDQUEwQzs7SUFDckssSUFBQSxxQkFBTSxFQUFDLG1DQUFxQixDQUFDO0lBQ2IsV0FBQSxJQUFBLG9CQUFLLEVBQUMsNkJBQWUsQ0FBQyxDQUFBOzs7O3dDQWlCdEMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xyXG4gICAgU2NoZW1hTm9kZUNyZWF0ZUJ5QXNzZXQsXHJcbiAgICBTY2hlbWFOb2RlQ3JlYXRlQnlUeXBlLFxyXG4gICAgU2NoZW1hTm9kZVVwZGF0ZSxcclxuICAgIFNjaGVtYU5vZGVEZWxldGUsXHJcbiAgICBTY2hlbWFOb2RlUXVlcnksXHJcbiAgICBUTm9kZURldGFpbCxcclxuICAgIFROb2RlVXBkYXRlUmVzdWx0LFxyXG4gICAgVE5vZGVEZWxldGVSZXN1bHQsXHJcbiAgICBUQ3JlYXRlTm9kZUJ5QXNzZXRPcHRpb25zLFxyXG4gICAgVENyZWF0ZU5vZGVCeVR5cGVPcHRpb25zLFxyXG4gICAgVFVwZGF0ZU5vZGVPcHRpb25zLFxyXG4gICAgVFF1ZXJ5Tm9kZU9wdGlvbnMsXHJcbiAgICBURGVsZXRlTm9kZU9wdGlvbnMsXHJcbiAgICBTY2hlbWFOb2RlUXVlcnlSZXN1bHQsXHJcbiAgICBTY2hlbWFOb2RlRGVsZXRlUmVzdWx0LFxyXG4gICAgU2NoZW1hTm9kZVVwZGF0ZVJlc3VsdCxcclxufSBmcm9tICcuL25vZGUtc2NoZW1hJztcclxuaW1wb3J0IHsgZGVzY3JpcHRpb24sIHBhcmFtLCByZXN1bHQsIHRpdGxlLCB0b29sIH0gZnJvbSAnLi4vZGVjb3JhdG9yL2RlY29yYXRvci5qcyc7XHJcbmltcG9ydCB7IENPTU1PTl9TVEFUVVMsIENvbW1vblJlc3VsdFR5cGUgfSBmcm9tICcuLi9iYXNlL3NjaGVtYS1iYXNlJztcclxuaW1wb3J0IHsgSUNyZWF0ZUJ5Tm9kZVR5cGVQYXJhbXMsIFNjZW5lIH0gZnJvbSAnLi4vLi4vY29yZS9zY2VuZSc7XHJcblxyXG5leHBvcnQgY2xhc3MgTm9kZUFwaSB7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDcmVhdGUgTm9kZSAvLyDliJvlu7roioLngrlcclxuICAgICAqL1xyXG4gICAgQHRvb2woJ3NjZW5lLWNyZWF0ZS1ub2RlLWJ5LXR5cGUnKVxyXG4gICAgQHRpdGxlKCdDcmVhdGUgTm9kZSBCeSBUeXBlJykgLy8g5qC55o2u57G75Z6L5Yib5bu66IqC54K5XHJcbiAgICBAZGVzY3JpcHRpb24oJ0NyZWF0ZSBhIG5vZGUgbmFtZWQgbmFtZSB3aXRoIHR5cGUgbm9kZVR5cGUgdW5kZXIgdGhlIHBhdGggaW4gdGhlIGN1cnJlbnRseSBvcGVuZWQgc2NlbmUuIFRoZSBub2RlIHBhdGggbXVzdCBiZSB1bmlxdWUuIElmIG11bHRpLWxldmVsIG5vZGVzIGFyZSBub3QgY3JlYXRlZCwgZW1wdHkgbm9kZXMgd2lsbCBiZSBhdXRvbWF0aWNhbGx5IGNvbXBsZXRlZC4nKSAvLyDlnKjlvZPliY3miZPlvIDnmoTlnLrmma/kuK3nmoQgcGF0aCDot6/lvoTkuIvliJvlu7rkuIDkuKrlkI3lrZfkuLogbmFtZe+8jOexu+Wei+S4uiBub2RlVHlwZSDnmoToioLngrnvvIzoioLngrnnmoTot6/lvoTlv4XpobvmmK/llK/kuIDnmoTvvIzlpoLmnpzmnInlpJrnuqfoioLngrnmsqHliJvlu7rvvIzkvJroh6rliqjooaXlhajnqbroioLngrnjgIJcclxuICAgIEByZXN1bHQoU2NoZW1hTm9kZVF1ZXJ5UmVzdWx0KVxyXG4gICAgYXN5bmMgY3JlYXRlTm9kZUJ5VHlwZShAcGFyYW0oU2NoZW1hTm9kZUNyZWF0ZUJ5VHlwZSkgb3B0aW9uczogVENyZWF0ZU5vZGVCeVR5cGVPcHRpb25zKTogUHJvbWlzZTxDb21tb25SZXN1bHRUeXBlPFROb2RlRGV0YWlsPj4ge1xyXG4gICAgICAgIGNvbnN0IHJldDogQ29tbW9uUmVzdWx0VHlwZTxUTm9kZURldGFpbD4gPSB7XHJcbiAgICAgICAgICAgIGNvZGU6IENPTU1PTl9TVEFUVVMuU1VDQ0VTUyxcclxuICAgICAgICAgICAgZGF0YTogdW5kZWZpbmVkLFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgY29uc3QgcmVzdWx0Tm9kZSA9IGF3YWl0IFNjZW5lLmNyZWF0ZU5vZGVCeVR5cGUob3B0aW9ucyBhcyBJQ3JlYXRlQnlOb2RlVHlwZVBhcmFtcyk7XHJcbiAgICAgICAgICAgIGlmIChyZXN1bHROb2RlKSB7XHJcbiAgICAgICAgICAgICAgICByZXQuZGF0YSA9IHJlc3VsdE5vZGU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIHJldC5jb2RlID0gQ09NTU9OX1NUQVRVUy5GQUlMO1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gY3JlYXRlIG5vZGU6JywgZSk7IC8vIOWIm+W7uuiKgueCueWksei0pTpcclxuICAgICAgICAgICAgcmV0LnJlYXNvbiA9IGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6IFN0cmluZyhlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiByZXQ7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ3JlYXRlIE5vZGUgLy8g5Yib5bu66IqC54K5XHJcbiAgICAgKi9cclxuICAgIEB0b29sKCdzY2VuZS1jcmVhdGUtbm9kZS1ieS1hc3NldCcpXHJcbiAgICBAdGl0bGUoJ0NyZWF0ZSBOb2RlIEJ5IEFzc2V0JykgLy8g5qC55o2u6LWE5rqQ5Yib5bu66IqC54K5XHJcbiAgICBAZGVzY3JpcHRpb24oJ0NyZWF0ZSBhIG5vZGUgbmFtZWQgbmFtZSB1c2luZyBkYlVSTCBhc3NldCB1bmRlciB0aGUgcGF0aCBpbiB0aGUgY3VycmVudGx5IG9wZW5lZCBzY2VuZS4gVGhlIG5vZGUgcGF0aCBtdXN0IGJlIHVuaXF1ZS4gSWYgbXVsdGktbGV2ZWwgbm9kZXMgYXJlIG5vdCBjcmVhdGVkLCBlbXB0eSBub2RlcyB3aWxsIGJlIGF1dG9tYXRpY2FsbHkgY29tcGxldGVkLiBFeGFtcGxlIG9mIHJlc291cmNlIGRiVVJMIGZvcm1hdDogZGI6Ly9hc3NldHMvc2FtcGxlLnByZWZhYicpIC8vIOWcqOW9k+WJjeaJk+W8gOeahOWcuuaZr+S4reeahCBwYXRoIOi3r+W+hOS4i+S9v+eUqCBkYlVSTCDotYTmupDvvIzliJvlu7rkuIDkuKrlkI3lrZfkuLogbmFtZSDnmoToioLngrnvvIzoioLngrnnmoTot6/lvoTlv4XpobvmmK/llK/kuIDnmoTvvIzlpoLmnpzmnInlpJrnuqfoioLngrnmsqHliJvlu7rvvIzkvJroh6rliqjooaXlhajnqbroioLngrnvvIzotYTmupDnmoQgZGJVUkwg5qC85byP5Li+5L6L77yaZGI6Ly9hc3NldHMvc2FtcGxlLnByZWZhYlxyXG4gICAgQHJlc3VsdChTY2hlbWFOb2RlUXVlcnlSZXN1bHQpXHJcbiAgICBhc3luYyBjcmVhdGVOb2RlQnlBc3NldChAcGFyYW0oU2NoZW1hTm9kZUNyZWF0ZUJ5QXNzZXQpIG9wdGlvbnM6IFRDcmVhdGVOb2RlQnlBc3NldE9wdGlvbnMpOiBQcm9taXNlPENvbW1vblJlc3VsdFR5cGU8VE5vZGVEZXRhaWw+PiB7XHJcbiAgICAgICAgY29uc3QgcmV0OiBDb21tb25SZXN1bHRUeXBlPFROb2RlRGV0YWlsPiA9IHtcclxuICAgICAgICAgICAgY29kZTogQ09NTU9OX1NUQVRVUy5TVUNDRVNTLFxyXG4gICAgICAgICAgICBkYXRhOiB1bmRlZmluZWQsXHJcbiAgICAgICAgfTtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBjb25zdCByZXN1bHROb2RlID0gYXdhaXQgU2NlbmUuY3JlYXRlTm9kZUJ5QXNzZXQob3B0aW9ucyk7XHJcbiAgICAgICAgICAgIGlmIChyZXN1bHROb2RlKSB7XHJcbiAgICAgICAgICAgICAgICByZXQuZGF0YSA9IHJlc3VsdE5vZGU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIHJldC5jb2RlID0gQ09NTU9OX1NUQVRVUy5GQUlMO1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gY3JlYXRlIG5vZGU6JywgZSk7IC8vIOWIm+W7uuiKgueCueWksei0pTpcclxuICAgICAgICAgICAgcmV0LnJlYXNvbiA9IGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6IFN0cmluZyhlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiByZXQ7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8qKlxyXG4gICAgICogRGVsZXRlIE5vZGUgLy8g5Yig6Zmk6IqC54K5XHJcbiAgICAgKi9cclxuICAgIEB0b29sKCdzY2VuZS1kZWxldGUtbm9kZScpXHJcbiAgICBAdGl0bGUoJ0RlbGV0ZSBOb2RlJykgLy8g5Yig6Zmk6IqC54K5XHJcbiAgICBAZGVzY3JpcHRpb24oJ0RlbGV0ZSBhIG5vZGUgaW4gdGhlIGN1cnJlbnRseSBvcGVuZWQgc2NlbmUuIFlvdSBuZWVkIHRvIHBhc3MgaW4gdGhlIHBhdGggb2YgdGhlIG5vZGUsIHN1Y2ggYXM6IENhbnZhcy9Ob2RlMScpIC8vIOWcqOW9k+WJjeaJk+W8gOeahOWcuuaZr+S4reWIoOmZpOiKgueCue+8jOmcgOimgeS8oOWFpeiKgueCueeahOi3r+W+hO+8jOavlOWmgu+8mkNhbnZhcy9Ob2RlMVxyXG4gICAgQHJlc3VsdChTY2hlbWFOb2RlRGVsZXRlUmVzdWx0KVxyXG4gICAgYXN5bmMgZGVsZXRlTm9kZShAcGFyYW0oU2NoZW1hTm9kZURlbGV0ZSkgb3B0aW9uczogVERlbGV0ZU5vZGVPcHRpb25zKTogUHJvbWlzZTxDb21tb25SZXN1bHRUeXBlPFROb2RlRGVsZXRlUmVzdWx0Pj4ge1xyXG4gICAgICAgIGNvbnN0IHJldDogQ29tbW9uUmVzdWx0VHlwZTxUTm9kZURlbGV0ZVJlc3VsdD4gPSB7XHJcbiAgICAgICAgICAgIGNvZGU6IENPTU1PTl9TVEFUVVMuU1VDQ0VTUyxcclxuICAgICAgICAgICAgZGF0YTogdW5kZWZpbmVkLFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IFNjZW5lLmRlbGV0ZU5vZGUob3B0aW9ucyk7XHJcbiAgICAgICAgICAgIGlmICghcmVzdWx0KSB0aHJvdyBuZXcgRXJyb3IoYG5vZGUgbm90IGZvdW5kIGF0IHBhdGg6ICR7b3B0aW9ucy5wYXRofWApO1xyXG4gICAgICAgICAgICByZXQuZGF0YSA9IHtcclxuICAgICAgICAgICAgICAgIHBhdGg6IHJlc3VsdC5wYXRoLFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgcmV0LmNvZGUgPSBDT01NT05fU1RBVFVTLkZBSUw7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBkZWxldGUgbm9kZTonLCBlKTsgLy8g5Yig6Zmk6IqC54K55aSx6LSlOlxyXG4gICAgICAgICAgICByZXQucmVhc29uID0gZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogU3RyaW5nKGUpO1xyXG4gICAgICAgICAgICBkZWxldGUgcmV0LmRhdGE7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gcmV0O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVXBkYXRlIE5vZGUgLy8g5pu05paw6IqC54K5XHJcbiAgICAgKi9cclxuICAgIEB0b29sKCdzY2VuZS11cGRhdGUtbm9kZScpXHJcbiAgICBAdGl0bGUoJ1VwZGF0ZSBOb2RlJykgLy8g5pu05paw6IqC54K5XHJcbiAgICBAZGVzY3JpcHRpb24oJ1VwZGF0ZSBhIG5vZGUgaW4gdGhlIGN1cnJlbnRseSBvcGVuZWQgc2NlbmUuIFlvdSBuZWVkIHRvIHBhc3MgaW4gdGhlIHBhdGggb2YgdGhlIG5vZGUsIHN1Y2ggYXM6IENhbnZhcy9Ob2RlMScpIC8vIOWcqOW9k+WJjeaJk+W8gOeahOWcuuaZr+S4reabtOaWsOiKgueCue+8jOmcgOimgeS8oOWFpeiKgueCueeahOi3r+W+hO+8jOavlOWmgu+8mkNhbnZhcy9Ob2RlMVxyXG4gICAgQHJlc3VsdChTY2hlbWFOb2RlVXBkYXRlUmVzdWx0KVxyXG4gICAgYXN5bmMgdXBkYXRlTm9kZShAcGFyYW0oU2NoZW1hTm9kZVVwZGF0ZSkgb3B0aW9uczogVFVwZGF0ZU5vZGVPcHRpb25zKTogUHJvbWlzZTxDb21tb25SZXN1bHRUeXBlPFROb2RlVXBkYXRlUmVzdWx0Pj4ge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCBTY2VuZS51cGRhdGVOb2RlKG9wdGlvbnMpO1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgZGF0YTogZGF0YSxcclxuICAgICAgICAgICAgICAgIGNvZGU6IENPTU1PTl9TVEFUVVMuU1VDQ0VTUyxcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byB1cGRhdGUgbm9kZTonLCBlKTsgLy8g5pu05paw6IqC54K55aSx6LSlOlxyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgY29kZTogQ09NTU9OX1NUQVRVUy5GQUlMLFxyXG4gICAgICAgICAgICAgICAgcmVhc29uOiBlIGluc3RhbmNlb2YgRXJyb3IgPyBlLm1lc3NhZ2UgOiBTdHJpbmcoZSksXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgKiBRdWVyeSBOb2RlIC8vIOafpeivouiKgueCuVxyXG4gICAgKi9cclxuICAgIEB0b29sKCdzY2VuZS1xdWVyeS1ub2RlJylcclxuICAgIEB0aXRsZSgnUXVlcnkgTm9kZScpIC8vIOafpeivouiKgueCuVxyXG4gICAgQGRlc2NyaXB0aW9uKCdRdWVyeSBhIG5vZGUgaW4gdGhlIGN1cnJlbnRseSBvcGVuZWQgc2NlbmUuIFlvdSBuZWVkIHRvIHBhc3MgaW4gdGhlIHBhdGggb2YgdGhlIG5vZGUsIHN1Y2ggYXM6IENhbnZhcy9Ob2RlMScpIC8vIOWcqOW9k+WJjeaJk+W8gOeahOWcuuaZr+S4reafpeivouiKgueCue+8jOmcgOimgeS8oOWFpeiKgueCueeahOi3r+W+hO+8jOavlOWmgu+8mkNhbnZhcy9Ob2RlMVxyXG4gICAgQHJlc3VsdChTY2hlbWFOb2RlUXVlcnlSZXN1bHQpXHJcbiAgICBhc3luYyBxdWVyeU5vZGUoQHBhcmFtKFNjaGVtYU5vZGVRdWVyeSkgb3B0aW9uczogVFF1ZXJ5Tm9kZU9wdGlvbnMpOiBQcm9taXNlPENvbW1vblJlc3VsdFR5cGU8VE5vZGVEZXRhaWw+PiB7XHJcbiAgICAgICAgY29uc3QgcmV0OiBDb21tb25SZXN1bHRUeXBlPFROb2RlRGV0YWlsPiA9IHtcclxuICAgICAgICAgICAgY29kZTogQ09NTU9OX1NUQVRVUy5TVUNDRVNTLFxyXG4gICAgICAgICAgICBkYXRhOiB1bmRlZmluZWQsXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgU2NlbmUucXVlcnlOb2RlKG9wdGlvbnMpO1xyXG4gICAgICAgICAgICBpZiAoIXJlc3VsdCkgdGhyb3cgbmV3IEVycm9yKGBub2RlIG5vdCBmb3VuZCBhdCBwYXRoOiAke29wdGlvbnMucGF0aH1gKTtcclxuICAgICAgICAgICAgcmV0LmRhdGEgPSByZXN1bHQ7XHJcbiAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICByZXQuY29kZSA9IENPTU1PTl9TVEFUVVMuRkFJTDtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIHF1ZXJ5IG5vZGU6JywgZSk7IC8vIOafpeivouiKgueCueWksei0pTpcclxuICAgICAgICAgICAgcmV0LnJlYXNvbiA9IGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6IFN0cmluZyhlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiByZXQ7XHJcbiAgICB9XHJcbn1cclxuIl19