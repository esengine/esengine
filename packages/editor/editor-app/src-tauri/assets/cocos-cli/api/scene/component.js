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
exports.ComponentApi = void 0;
const component_schema_1 = require("./component-schema");
const decorator_js_1 = require("../decorator/decorator.js");
const schema_base_1 = require("../base/schema-base");
const scene_1 = require("../../core/scene");
class ComponentApi {
    /**
     * Add component // 添加组件
     */
    async addComponent(addComponentInfo) {
        try {
            const component = await scene_1.Scene.addComponent({ nodePath: addComponentInfo.nodePath, component: addComponentInfo.component });
            return {
                code: schema_base_1.COMMON_STATUS.SUCCESS,
                data: component
            };
        }
        catch (e) {
            return {
                code: schema_base_1.COMMON_STATUS.FAIL,
                reason: e instanceof Error ? e.message : String(e)
            };
        }
    }
    /**
     * Remove component // 移除组件
     */
    async removeComponent(component) {
        try {
            const result = await scene_1.Scene.removeComponent(component);
            return {
                code: schema_base_1.COMMON_STATUS.SUCCESS,
                data: result
            };
        }
        catch (e) {
            return {
                code: schema_base_1.COMMON_STATUS.FAIL,
                reason: e instanceof Error ? e.message : String(e)
            };
        }
    }
    /**
     * Query component // 查询组件
     */
    async queryComponent(component) {
        try {
            const componentInfo = await scene_1.Scene.queryComponent(component);
            if (!componentInfo) {
                throw new Error(`component not fount at path ${component.path}`);
            }
            return {
                code: schema_base_1.COMMON_STATUS.SUCCESS,
                data: componentInfo
            };
        }
        catch (e) {
            return {
                code: schema_base_1.COMMON_STATUS.FAIL,
                reason: e instanceof Error ? e.message : String(e)
            };
        }
    }
    /**
     * Set component property // 设置组件属性
     */
    async setProperty(setPropertyOptions) {
        try {
            const result = await scene_1.Scene.setProperty(setPropertyOptions);
            return {
                code: schema_base_1.COMMON_STATUS.SUCCESS,
                data: result
            };
        }
        catch (e) {
            return {
                code: schema_base_1.COMMON_STATUS.FAIL,
                reason: e instanceof Error ? e.message : String(e)
            };
        }
    }
    /**
     * Query all components // 查询所有组件
     */
    async queryAllComponent() {
        try {
            const components = await scene_1.Scene.queryAllComponent();
            return {
                code: schema_base_1.COMMON_STATUS.SUCCESS,
                data: components,
            };
        }
        catch (e) {
            return {
                code: schema_base_1.COMMON_STATUS.FAIL,
                reason: e instanceof Error ? e.message : String(e)
            };
        }
    }
}
exports.ComponentApi = ComponentApi;
__decorate([
    (0, decorator_js_1.tool)('scene-add-component'),
    (0, decorator_js_1.title)('Add component') // 添加组件
    ,
    (0, decorator_js_1.description)('Add component to node, input node name, component type, built-in or custom component. Returns all component details on success. Can query all component names via scene-query-all-component') // 添加组件到节点中，输入节点名，组件类型，内置组件或自定义组件, 成功返回所有的组件详细信息，可以通过 scene-query-all-component 查询到所有组件的名称
    ,
    (0, decorator_js_1.result)(component_schema_1.SchemaComponentResult),
    __param(0, (0, decorator_js_1.param)(component_schema_1.SchemaAddComponentInfo)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ComponentApi.prototype, "addComponent", null);
__decorate([
    (0, decorator_js_1.tool)('scene-delete-component'),
    (0, decorator_js_1.title)('Remove component') // 删除组件
    ,
    (0, decorator_js_1.description)('Remove node component, returns true on success, false on failure') // 删除节点组件，移除成功返回 true， 移除失败返回 false
    ,
    (0, decorator_js_1.result)(component_schema_1.SchemaBooleanResult),
    __param(0, (0, decorator_js_1.param)(component_schema_1.SchemaRemoveComponent)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ComponentApi.prototype, "removeComponent", null);
__decorate([
    (0, decorator_js_1.tool)('scene-query-component'),
    (0, decorator_js_1.title)('Query component') // 查询组件
    ,
    (0, decorator_js_1.description)('Query component info, returns all properties of the component') // 查询组件信息，返回组件的所有属性
    ,
    (0, decorator_js_1.result)(component_schema_1.SchemaComponentResult),
    __param(0, (0, decorator_js_1.param)(component_schema_1.SchemaQueryComponent)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ComponentApi.prototype, "queryComponent", null);
__decorate([
    (0, decorator_js_1.tool)('scene-set-component-property'),
    (0, decorator_js_1.title)('Set component property') // 设置组件属性
    ,
    (0, decorator_js_1.description)('Set component property. Input component path (unique index of component), property name, property value to modify corresponding property info. Property types can be queried via scene-query-component') // 设置组件属性，输入组件path（唯一索引的组件）、属性名称、属性值，修改对应属性的信息，属性的类型可以通过 scene-query-component 查询到
    ,
    (0, decorator_js_1.result)(component_schema_1.SchemaBooleanResult),
    __param(0, (0, decorator_js_1.param)(component_schema_1.SchemaSetPropertyOptions)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ComponentApi.prototype, "setProperty", null);
__decorate([
    (0, decorator_js_1.tool)('scene-query-all-component'),
    (0, decorator_js_1.title)('Query all components') // 查询所有组件
    ,
    (0, decorator_js_1.description)('Query all components, can query component names of all component info') // 查询所有组件，可以查询到所有组件的信息的组件名称
    ,
    (0, decorator_js_1.result)(component_schema_1.SchemaQueryAllComponentResult),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ComponentApi.prototype, "queryAllComponent", null);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2FwaS9zY2VuZS9jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQUEseURBZTRCO0FBRTVCLDREQUFvRjtBQUNwRixxREFBc0U7QUFDdEUsNENBQThEO0FBRTlELE1BQWEsWUFBWTtJQUVyQjs7T0FFRztJQUtHLEFBQU4sS0FBSyxDQUFDLFlBQVksQ0FBZ0MsZ0JBQW1DO1FBQ2pGLElBQUksQ0FBQztZQUNELE1BQU0sU0FBUyxHQUFHLE1BQU0sYUFBSyxDQUFDLFlBQVksQ0FBQyxFQUFFLFFBQVEsRUFBRSxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUUsU0FBUyxFQUFFLGdCQUFnQixDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUM7WUFDM0gsT0FBTztnQkFDSCxJQUFJLEVBQUUsMkJBQWEsQ0FBQyxPQUFPO2dCQUMzQixJQUFJLEVBQUUsU0FBUzthQUNsQixDQUFDO1FBQ04sQ0FBQztRQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7WUFDVCxPQUFPO2dCQUNILElBQUksRUFBRSwyQkFBYSxDQUFDLElBQUk7Z0JBQ3hCLE1BQU0sRUFBRSxDQUFDLFlBQVksS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO2FBQ3JELENBQUM7UUFDTixDQUFDO0lBQ0wsQ0FBQztJQUVEOztPQUVHO0lBS0csQUFBTixLQUFLLENBQUMsZUFBZSxDQUErQixTQUFrQztRQUNsRixJQUFJLENBQUM7WUFDRCxNQUFNLE1BQU0sR0FBRyxNQUFNLGFBQUssQ0FBQyxlQUFlLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDdEQsT0FBTztnQkFDSCxJQUFJLEVBQUUsMkJBQWEsQ0FBQyxPQUFPO2dCQUMzQixJQUFJLEVBQUUsTUFBTTthQUNmLENBQUM7UUFDTixDQUFDO1FBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztZQUNULE9BQU87Z0JBQ0gsSUFBSSxFQUFFLDJCQUFhLENBQUMsSUFBSTtnQkFDeEIsTUFBTSxFQUFFLENBQUMsWUFBWSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7YUFDckQsQ0FBQztRQUNOLENBQUM7SUFDTCxDQUFDO0lBRUQ7O09BRUc7SUFLRyxBQUFOLEtBQUssQ0FBQyxjQUFjLENBQThCLFNBQWlDO1FBQy9FLElBQUksQ0FBQztZQUNELE1BQU0sYUFBYSxHQUFHLE1BQU0sYUFBSyxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUM1RCxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7Z0JBQ2pCLE1BQU0sSUFBSSxLQUFLLENBQUMsK0JBQStCLFNBQVMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1lBQ3JFLENBQUM7WUFDRCxPQUFPO2dCQUNILElBQUksRUFBRSwyQkFBYSxDQUFDLE9BQU87Z0JBQzNCLElBQUksRUFBRSxhQUFhO2FBQ3RCLENBQUM7UUFDTixDQUFDO1FBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztZQUNULE9BQU87Z0JBQ0gsSUFBSSxFQUFFLDJCQUFhLENBQUMsSUFBSTtnQkFDeEIsTUFBTSxFQUFFLENBQUMsWUFBWSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7YUFDckQsQ0FBQztRQUNOLENBQUM7SUFDTCxDQUFDO0lBRUQ7O09BRUc7SUFLRyxBQUFOLEtBQUssQ0FBQyxXQUFXLENBQWtDLGtCQUF3QztRQUN2RixJQUFJLENBQUM7WUFDRCxNQUFNLE1BQU0sR0FBRyxNQUFNLGFBQUssQ0FBQyxXQUFXLENBQUMsa0JBQXlDLENBQUMsQ0FBQztZQUNsRixPQUFPO2dCQUNILElBQUksRUFBRSwyQkFBYSxDQUFDLE9BQU87Z0JBQzNCLElBQUksRUFBRSxNQUFNO2FBQ2YsQ0FBQztRQUNOLENBQUM7UUFBQyxPQUFPLENBQUMsRUFBRSxDQUFDO1lBQ1QsT0FBTztnQkFDSCxJQUFJLEVBQUUsMkJBQWEsQ0FBQyxJQUFJO2dCQUN4QixNQUFNLEVBQUUsQ0FBQyxZQUFZLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQzthQUNyRCxDQUFDO1FBQ04sQ0FBQztJQUNMLENBQUM7SUFFRDs7T0FFRztJQUtHLEFBQU4sS0FBSyxDQUFDLGlCQUFpQjtRQUNuQixJQUFJLENBQUM7WUFDRCxNQUFNLFVBQVUsR0FBRyxNQUFNLGFBQUssQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1lBQ25ELE9BQU87Z0JBQ0gsSUFBSSxFQUFFLDJCQUFhLENBQUMsT0FBTztnQkFDM0IsSUFBSSxFQUFFLFVBQVU7YUFDbkIsQ0FBQztRQUNOLENBQUM7UUFBQyxPQUFPLENBQUMsRUFBRSxDQUFDO1lBQ1QsT0FBTztnQkFDSCxJQUFJLEVBQUUsMkJBQWEsQ0FBQyxJQUFJO2dCQUN4QixNQUFNLEVBQUUsQ0FBQyxZQUFZLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQzthQUNyRCxDQUFDO1FBQ04sQ0FBQztJQUNMLENBQUM7Q0FDSjtBQWxIRCxvQ0FrSEM7QUF6R1M7SUFKTCxJQUFBLG1CQUFJLEVBQUMscUJBQXFCLENBQUM7SUFDM0IsSUFBQSxvQkFBSyxFQUFDLGVBQWUsQ0FBQyxDQUFDLE9BQU87O0lBQzlCLElBQUEsMEJBQVcsRUFBQyw2TEFBNkwsQ0FBQyxDQUFDLDBGQUEwRjs7SUFDclMsSUFBQSxxQkFBTSxFQUFDLHdDQUFxQixDQUFDO0lBQ1YsV0FBQSxJQUFBLG9CQUFLLEVBQUMseUNBQXNCLENBQUMsQ0FBQTs7OztnREFhaEQ7QUFTSztJQUpMLElBQUEsbUJBQUksRUFBQyx3QkFBd0IsQ0FBQztJQUM5QixJQUFBLG9CQUFLLEVBQUMsa0JBQWtCLENBQUMsQ0FBQyxPQUFPOztJQUNqQyxJQUFBLDBCQUFXLEVBQUMsa0VBQWtFLENBQUMsQ0FBQyxtQ0FBbUM7O0lBQ25ILElBQUEscUJBQU0sRUFBQyxzQ0FBbUIsQ0FBQztJQUNMLFdBQUEsSUFBQSxvQkFBSyxFQUFDLHdDQUFxQixDQUFDLENBQUE7Ozs7bURBYWxEO0FBU0s7SUFKTCxJQUFBLG1CQUFJLEVBQUMsdUJBQXVCLENBQUM7SUFDN0IsSUFBQSxvQkFBSyxFQUFDLGlCQUFpQixDQUFDLENBQUMsT0FBTzs7SUFDaEMsSUFBQSwwQkFBVyxFQUFDLCtEQUErRCxDQUFDLENBQUMsbUJBQW1COztJQUNoRyxJQUFBLHFCQUFNLEVBQUMsd0NBQXFCLENBQUM7SUFDUixXQUFBLElBQUEsb0JBQUssRUFBQyx1Q0FBb0IsQ0FBQyxDQUFBOzs7O2tEQWdCaEQ7QUFTSztJQUpMLElBQUEsbUJBQUksRUFBQyw4QkFBOEIsQ0FBQztJQUNwQyxJQUFBLG9CQUFLLEVBQUMsd0JBQXdCLENBQUMsQ0FBQyxTQUFTOztJQUN6QyxJQUFBLDBCQUFXLEVBQUMsd01BQXdNLENBQUMsQ0FBQyxrRkFBa0Y7O0lBQ3hTLElBQUEscUJBQU0sRUFBQyxzQ0FBbUIsQ0FBQztJQUNULFdBQUEsSUFBQSxvQkFBSyxFQUFDLDJDQUF3QixDQUFDLENBQUE7Ozs7K0NBYWpEO0FBU0s7SUFKTCxJQUFBLG1CQUFJLEVBQUMsMkJBQTJCLENBQUM7SUFDakMsSUFBQSxvQkFBSyxFQUFDLHNCQUFzQixDQUFDLENBQUMsU0FBUzs7SUFDdkMsSUFBQSwwQkFBVyxFQUFDLHVFQUF1RSxDQUFDLENBQUMsMkJBQTJCOztJQUNoSCxJQUFBLHFCQUFNLEVBQUMsZ0RBQTZCLENBQUM7Ozs7cURBY3JDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcclxuICAgIFNjaGVtYUFkZENvbXBvbmVudEluZm8sXHJcbiAgICBTY2hlbWFTZXRQcm9wZXJ0eU9wdGlvbnMsXHJcbiAgICBTY2hlbWFDb21wb25lbnRSZXN1bHQsXHJcbiAgICBTY2hlbWFCb29sZWFuUmVzdWx0LFxyXG4gICAgU2NoZW1hUXVlcnlBbGxDb21wb25lbnRSZXN1bHQsXHJcbiAgICBTY2hlbWFRdWVyeUNvbXBvbmVudCxcclxuICAgIFNjaGVtYVJlbW92ZUNvbXBvbmVudCxcclxuXHJcbiAgICBUQWRkQ29tcG9uZW50SW5mbyxcclxuICAgIFRTZXRQcm9wZXJ0eU9wdGlvbnMsXHJcbiAgICBUQ29tcG9uZW50UmVzdWx0LFxyXG4gICAgVFF1ZXJ5QWxsQ29tcG9uZW50UmVzdWx0LFxyXG4gICAgVFJlbW92ZUNvbXBvbmVudE9wdGlvbnMsXHJcbiAgICBUUXVlcnlDb21wb25lbnRPcHRpb25zLFxyXG59IGZyb20gJy4vY29tcG9uZW50LXNjaGVtYSc7XHJcblxyXG5pbXBvcnQgeyBkZXNjcmlwdGlvbiwgcGFyYW0sIHJlc3VsdCwgdGl0bGUsIHRvb2wgfSBmcm9tICcuLi9kZWNvcmF0b3IvZGVjb3JhdG9yLmpzJztcclxuaW1wb3J0IHsgQ09NTU9OX1NUQVRVUywgQ29tbW9uUmVzdWx0VHlwZSB9IGZyb20gJy4uL2Jhc2Uvc2NoZW1hLWJhc2UnO1xyXG5pbXBvcnQgeyBTY2VuZSwgSVNldFByb3BlcnR5T3B0aW9ucyB9IGZyb20gJy4uLy4uL2NvcmUvc2NlbmUnO1xyXG5cclxuZXhwb3J0IGNsYXNzIENvbXBvbmVudEFwaSB7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBZGQgY29tcG9uZW50IC8vIOa3u+WKoOe7hOS7tlxyXG4gICAgICovXHJcbiAgICBAdG9vbCgnc2NlbmUtYWRkLWNvbXBvbmVudCcpXHJcbiAgICBAdGl0bGUoJ0FkZCBjb21wb25lbnQnKSAvLyDmt7vliqDnu4Tku7ZcclxuICAgIEBkZXNjcmlwdGlvbignQWRkIGNvbXBvbmVudCB0byBub2RlLCBpbnB1dCBub2RlIG5hbWUsIGNvbXBvbmVudCB0eXBlLCBidWlsdC1pbiBvciBjdXN0b20gY29tcG9uZW50LiBSZXR1cm5zIGFsbCBjb21wb25lbnQgZGV0YWlscyBvbiBzdWNjZXNzLiBDYW4gcXVlcnkgYWxsIGNvbXBvbmVudCBuYW1lcyB2aWEgc2NlbmUtcXVlcnktYWxsLWNvbXBvbmVudCcpIC8vIOa3u+WKoOe7hOS7tuWIsOiKgueCueS4re+8jOi+k+WFpeiKgueCueWQje+8jOe7hOS7tuexu+Wei++8jOWGhee9rue7hOS7tuaIluiHquWumuS5iee7hOS7tiwg5oiQ5Yqf6L+U5Zue5omA5pyJ55qE57uE5Lu26K+m57uG5L+h5oGv77yM5Y+v5Lul6YCa6L+HIHNjZW5lLXF1ZXJ5LWFsbC1jb21wb25lbnQg5p+l6K+i5Yiw5omA5pyJ57uE5Lu255qE5ZCN56ewXHJcbiAgICBAcmVzdWx0KFNjaGVtYUNvbXBvbmVudFJlc3VsdClcclxuICAgIGFzeW5jIGFkZENvbXBvbmVudChAcGFyYW0oU2NoZW1hQWRkQ29tcG9uZW50SW5mbykgYWRkQ29tcG9uZW50SW5mbzogVEFkZENvbXBvbmVudEluZm8pOiBQcm9taXNlPENvbW1vblJlc3VsdFR5cGU8VENvbXBvbmVudFJlc3VsdD4+IHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBjb25zdCBjb21wb25lbnQgPSBhd2FpdCBTY2VuZS5hZGRDb21wb25lbnQoeyBub2RlUGF0aDogYWRkQ29tcG9uZW50SW5mby5ub2RlUGF0aCwgY29tcG9uZW50OiBhZGRDb21wb25lbnRJbmZvLmNvbXBvbmVudCB9KTtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIGNvZGU6IENPTU1PTl9TVEFUVVMuU1VDQ0VTUyxcclxuICAgICAgICAgICAgICAgIGRhdGE6IGNvbXBvbmVudFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIGNvZGU6IENPTU1PTl9TVEFUVVMuRkFJTCxcclxuICAgICAgICAgICAgICAgIHJlYXNvbjogZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogU3RyaW5nKGUpXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVtb3ZlIGNvbXBvbmVudCAvLyDnp7vpmaTnu4Tku7ZcclxuICAgICAqL1xyXG4gICAgQHRvb2woJ3NjZW5lLWRlbGV0ZS1jb21wb25lbnQnKVxyXG4gICAgQHRpdGxlKCdSZW1vdmUgY29tcG9uZW50JykgLy8g5Yig6Zmk57uE5Lu2XHJcbiAgICBAZGVzY3JpcHRpb24oJ1JlbW92ZSBub2RlIGNvbXBvbmVudCwgcmV0dXJucyB0cnVlIG9uIHN1Y2Nlc3MsIGZhbHNlIG9uIGZhaWx1cmUnKSAvLyDliKDpmaToioLngrnnu4Tku7bvvIznp7vpmaTmiJDlip/ov5Tlm54gdHJ1Ze+8jCDnp7vpmaTlpLHotKXov5Tlm54gZmFsc2VcclxuICAgIEByZXN1bHQoU2NoZW1hQm9vbGVhblJlc3VsdClcclxuICAgIGFzeW5jIHJlbW92ZUNvbXBvbmVudChAcGFyYW0oU2NoZW1hUmVtb3ZlQ29tcG9uZW50KSBjb21wb25lbnQ6IFRSZW1vdmVDb21wb25lbnRPcHRpb25zKTogUHJvbWlzZTxDb21tb25SZXN1bHRUeXBlPGJvb2xlYW4+PiB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgU2NlbmUucmVtb3ZlQ29tcG9uZW50KGNvbXBvbmVudCk7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBjb2RlOiBDT01NT05fU1RBVFVTLlNVQ0NFU1MsXHJcbiAgICAgICAgICAgICAgICBkYXRhOiByZXN1bHRcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBjb2RlOiBDT01NT05fU1RBVFVTLkZBSUwsXHJcbiAgICAgICAgICAgICAgICByZWFzb246IGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6IFN0cmluZyhlKVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFF1ZXJ5IGNvbXBvbmVudCAvLyDmn6Xor6Lnu4Tku7ZcclxuICAgICAqL1xyXG4gICAgQHRvb2woJ3NjZW5lLXF1ZXJ5LWNvbXBvbmVudCcpXHJcbiAgICBAdGl0bGUoJ1F1ZXJ5IGNvbXBvbmVudCcpIC8vIOafpeivoue7hOS7tlxyXG4gICAgQGRlc2NyaXB0aW9uKCdRdWVyeSBjb21wb25lbnQgaW5mbywgcmV0dXJucyBhbGwgcHJvcGVydGllcyBvZiB0aGUgY29tcG9uZW50JykgLy8g5p+l6K+i57uE5Lu25L+h5oGv77yM6L+U5Zue57uE5Lu255qE5omA5pyJ5bGe5oCnXHJcbiAgICBAcmVzdWx0KFNjaGVtYUNvbXBvbmVudFJlc3VsdClcclxuICAgIGFzeW5jIHF1ZXJ5Q29tcG9uZW50KEBwYXJhbShTY2hlbWFRdWVyeUNvbXBvbmVudCkgY29tcG9uZW50OiBUUXVlcnlDb21wb25lbnRPcHRpb25zKTogUHJvbWlzZTxDb21tb25SZXN1bHRUeXBlPFRDb21wb25lbnRSZXN1bHQgfCBudWxsPj4ge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGNvbXBvbmVudEluZm8gPSBhd2FpdCBTY2VuZS5xdWVyeUNvbXBvbmVudChjb21wb25lbnQpO1xyXG4gICAgICAgICAgICBpZiAoIWNvbXBvbmVudEluZm8pIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgY29tcG9uZW50IG5vdCBmb3VudCBhdCBwYXRoICR7Y29tcG9uZW50LnBhdGh9YCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIGNvZGU6IENPTU1PTl9TVEFUVVMuU1VDQ0VTUyxcclxuICAgICAgICAgICAgICAgIGRhdGE6IGNvbXBvbmVudEluZm9cclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBjb2RlOiBDT01NT05fU1RBVFVTLkZBSUwsXHJcbiAgICAgICAgICAgICAgICByZWFzb246IGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6IFN0cmluZyhlKVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldCBjb21wb25lbnQgcHJvcGVydHkgLy8g6K6+572u57uE5Lu25bGe5oCnXHJcbiAgICAgKi9cclxuICAgIEB0b29sKCdzY2VuZS1zZXQtY29tcG9uZW50LXByb3BlcnR5JylcclxuICAgIEB0aXRsZSgnU2V0IGNvbXBvbmVudCBwcm9wZXJ0eScpIC8vIOiuvue9rue7hOS7tuWxnuaAp1xyXG4gICAgQGRlc2NyaXB0aW9uKCdTZXQgY29tcG9uZW50IHByb3BlcnR5LiBJbnB1dCBjb21wb25lbnQgcGF0aCAodW5pcXVlIGluZGV4IG9mIGNvbXBvbmVudCksIHByb3BlcnR5IG5hbWUsIHByb3BlcnR5IHZhbHVlIHRvIG1vZGlmeSBjb3JyZXNwb25kaW5nIHByb3BlcnR5IGluZm8uIFByb3BlcnR5IHR5cGVzIGNhbiBiZSBxdWVyaWVkIHZpYSBzY2VuZS1xdWVyeS1jb21wb25lbnQnKSAvLyDorr7nva7nu4Tku7blsZ7mgKfvvIzovpPlhaXnu4Tku7ZwYXRo77yI5ZSv5LiA57Si5byV55qE57uE5Lu277yJ44CB5bGe5oCn5ZCN56ew44CB5bGe5oCn5YC877yM5L+u5pS55a+55bqU5bGe5oCn55qE5L+h5oGv77yM5bGe5oCn55qE57G75Z6L5Y+v5Lul6YCa6L+HIHNjZW5lLXF1ZXJ5LWNvbXBvbmVudCDmn6Xor6LliLBcclxuICAgIEByZXN1bHQoU2NoZW1hQm9vbGVhblJlc3VsdClcclxuICAgIGFzeW5jIHNldFByb3BlcnR5KEBwYXJhbShTY2hlbWFTZXRQcm9wZXJ0eU9wdGlvbnMpIHNldFByb3BlcnR5T3B0aW9ucz86IFRTZXRQcm9wZXJ0eU9wdGlvbnMpOiBQcm9taXNlPENvbW1vblJlc3VsdFR5cGU8Ym9vbGVhbj4+IHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBTY2VuZS5zZXRQcm9wZXJ0eShzZXRQcm9wZXJ0eU9wdGlvbnMgYXMgSVNldFByb3BlcnR5T3B0aW9ucyk7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBjb2RlOiBDT01NT05fU1RBVFVTLlNVQ0NFU1MsXHJcbiAgICAgICAgICAgICAgICBkYXRhOiByZXN1bHRcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBjb2RlOiBDT01NT05fU1RBVFVTLkZBSUwsXHJcbiAgICAgICAgICAgICAgICByZWFzb246IGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6IFN0cmluZyhlKVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFF1ZXJ5IGFsbCBjb21wb25lbnRzIC8vIOafpeivouaJgOaciee7hOS7tlxyXG4gICAgICovXHJcbiAgICBAdG9vbCgnc2NlbmUtcXVlcnktYWxsLWNvbXBvbmVudCcpXHJcbiAgICBAdGl0bGUoJ1F1ZXJ5IGFsbCBjb21wb25lbnRzJykgLy8g5p+l6K+i5omA5pyJ57uE5Lu2XHJcbiAgICBAZGVzY3JpcHRpb24oJ1F1ZXJ5IGFsbCBjb21wb25lbnRzLCBjYW4gcXVlcnkgY29tcG9uZW50IG5hbWVzIG9mIGFsbCBjb21wb25lbnQgaW5mbycpIC8vIOafpeivouaJgOaciee7hOS7tu+8jOWPr+S7peafpeivouWIsOaJgOaciee7hOS7tueahOS/oeaBr+eahOe7hOS7tuWQjeensFxyXG4gICAgQHJlc3VsdChTY2hlbWFRdWVyeUFsbENvbXBvbmVudFJlc3VsdClcclxuICAgIGFzeW5jIHF1ZXJ5QWxsQ29tcG9uZW50KCk6IFByb21pc2U8Q29tbW9uUmVzdWx0VHlwZTxUUXVlcnlBbGxDb21wb25lbnRSZXN1bHQ+PiB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgY29uc3QgY29tcG9uZW50cyA9IGF3YWl0IFNjZW5lLnF1ZXJ5QWxsQ29tcG9uZW50KCk7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBjb2RlOiBDT01NT05fU1RBVFVTLlNVQ0NFU1MsXHJcbiAgICAgICAgICAgICAgICBkYXRhOiBjb21wb25lbnRzLFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIGNvZGU6IENPTU1PTl9TVEFUVVMuRkFJTCxcclxuICAgICAgICAgICAgICAgIHJlYXNvbjogZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogU3RyaW5nKGUpXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiJdfQ==