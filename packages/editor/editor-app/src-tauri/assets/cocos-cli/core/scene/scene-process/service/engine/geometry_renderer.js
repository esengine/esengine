"use strict";
/**
 *  对引擎geometry_renderer的封装;
 *  添加接口和引擎一致
 *  由于每帧都需要渲染，所以这个类主要是一个数据收集，在每帧渲染时，flush数据给引擎
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeometryRenderer = exports.methods = void 0;
exports.methods = [
    'addDashedLine',
    'addTriangle',
    'addQuad',
    'addBoundingBox',
    'addCross',
    'addFrustum',
    'addCapsule',
    'addCylinder',
    'addCone',
    'addCircle',
    'addArc',
    'addPolygon',
    'addDisc',
    'addSector',
    'addSphere',
    'addTorus',
    'addOctahedron',
    'addBezier',
    'addMesh',
    'addIndexedMesh',
];
class GeometryRenderer {
    _renderer;
    _dataMap;
    constructor() {
        this._renderer = null;
        this._dataMap = new Map();
        // 初始化map,模拟接口
        exports.methods.forEach(method => {
            this._dataMap.set(method, []);
            Object.defineProperty(this, method, {
                value: (...args) => {
                    const params = this._dataMap.get(method);
                    // @ts-ignore
                    params?.push(args);
                },
            });
        });
        // this?.addTriangle(new Vec3(0, 0, 0), new Vec3(0, 1, 0), new Vec3(1, 0, 0), new Color(255, 255, 255));
    }
    get renderer() {
        return this._renderer;
    }
    set renderer(renderer) {
        this._renderer = renderer;
    }
    // 统一输出数据
    flush() {
        for (const method of this._dataMap.keys()) {
            const params = this._dataMap.get(method);
            params?.forEach(param => {
                // @ts-ignore
                // console.log('插入数据', method, ...param);
                if (this._renderer) {
                    // @ts-ignore
                    this._renderer[method](...param);
                }
            });
        }
    }
    // 移除method对于的数据
    removeData(method) {
        this._dataMap.set(method, []);
    }
    // 移除所有数据 
    removeDataAll() {
        exports.methods.forEach(method => {
            this._dataMap.set(method, []);
        });
    }
}
exports.GeometryRenderer = GeometryRenderer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VvbWV0cnlfcmVuZGVyZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY29yZS9zY2VuZS9zY2VuZS1wcm9jZXNzL3NlcnZpY2UvZW5naW5lL2dlb21ldHJ5X3JlbmRlcmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7OztHQUlHOzs7QUFFVSxRQUFBLE9BQU8sR0FBRztJQUNuQixlQUFlO0lBQ2YsYUFBYTtJQUNiLFNBQVM7SUFDVCxnQkFBZ0I7SUFDaEIsVUFBVTtJQUNWLFlBQVk7SUFDWixZQUFZO0lBQ1osYUFBYTtJQUNiLFNBQVM7SUFDVCxXQUFXO0lBQ1gsUUFBUTtJQUNSLFlBQVk7SUFDWixTQUFTO0lBQ1QsV0FBVztJQUNYLFdBQVc7SUFDWCxVQUFVO0lBQ1YsZUFBZTtJQUNmLFdBQVc7SUFDWCxTQUFTO0lBQ1QsZ0JBQWdCO0NBQ1YsQ0FBQztBQUVYLE1BQU0sZ0JBQWdCO0lBQ1YsU0FBUyxDQUFNO0lBQ2YsUUFBUSxDQUFrQjtJQUNsQztRQUNJLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO1FBQ3RCLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUMxQixjQUFjO1FBQ2QsZUFBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRTtZQUNyQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDOUIsTUFBTSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFO2dCQUNoQyxLQUFLLEVBQUUsQ0FBQyxHQUFHLElBQVcsRUFBRSxFQUFFO29CQUN0QixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztvQkFDekMsYUFBYTtvQkFDYixNQUFNLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUN2QixDQUFDO2FBRUosQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7UUFDSCx3R0FBd0c7SUFDNUcsQ0FBQztJQUVELElBQUksUUFBUTtRQUNSLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQztJQUMxQixDQUFDO0lBRUQsSUFBSSxRQUFRLENBQUMsUUFBYTtRQUN0QixJQUFJLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQztJQUM5QixDQUFDO0lBRUQsU0FBUztJQUNULEtBQUs7UUFDRCxLQUFLLE1BQU0sTUFBTSxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQztZQUN4QyxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUN6QyxNQUFNLEVBQUUsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFO2dCQUNwQixhQUFhO2dCQUNiLHlDQUF5QztnQkFDekMsSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7b0JBQ2pCLGFBQWE7b0JBQ2IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDO2dCQUNyQyxDQUFDO1lBQ0wsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDO0lBQ0wsQ0FBQztJQUVELGdCQUFnQjtJQUNoQixVQUFVLENBQUMsTUFBYztRQUNyQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDbEMsQ0FBQztJQUVELFVBQVU7SUFDVixhQUFhO1FBQ1QsZUFBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRTtZQUNyQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDbEMsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0NBRUo7QUFFUSw0Q0FBZ0IiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogIOWvueW8leaTjmdlb21ldHJ5X3JlbmRlcmVy55qE5bCB6KOFO1xyXG4gKiAg5re75Yqg5o6l5Y+j5ZKM5byV5pOO5LiA6Ie0XHJcbiAqICDnlLHkuo7mr4/luKfpg73pnIDopoHmuLLmn5PvvIzmiYDku6Xov5nkuKrnsbvkuLvopoHmmK/kuIDkuKrmlbDmja7mlLbpm4bvvIzlnKjmr4/luKfmuLLmn5Pml7bvvIxmbHVzaOaVsOaNrue7meW8leaTjlxyXG4gKi9cclxuXHJcbmV4cG9ydCBjb25zdCBtZXRob2RzID0gW1xyXG4gICAgJ2FkZERhc2hlZExpbmUnLFxyXG4gICAgJ2FkZFRyaWFuZ2xlJyxcclxuICAgICdhZGRRdWFkJyxcclxuICAgICdhZGRCb3VuZGluZ0JveCcsXHJcbiAgICAnYWRkQ3Jvc3MnLFxyXG4gICAgJ2FkZEZydXN0dW0nLFxyXG4gICAgJ2FkZENhcHN1bGUnLFxyXG4gICAgJ2FkZEN5bGluZGVyJyxcclxuICAgICdhZGRDb25lJyxcclxuICAgICdhZGRDaXJjbGUnLFxyXG4gICAgJ2FkZEFyYycsXHJcbiAgICAnYWRkUG9seWdvbicsXHJcbiAgICAnYWRkRGlzYycsXHJcbiAgICAnYWRkU2VjdG9yJyxcclxuICAgICdhZGRTcGhlcmUnLFxyXG4gICAgJ2FkZFRvcnVzJyxcclxuICAgICdhZGRPY3RhaGVkcm9uJyxcclxuICAgICdhZGRCZXppZXInLFxyXG4gICAgJ2FkZE1lc2gnLFxyXG4gICAgJ2FkZEluZGV4ZWRNZXNoJyxcclxuXSBhcyBjb25zdDtcclxuXHJcbmNsYXNzIEdlb21ldHJ5UmVuZGVyZXIge1xyXG4gICAgcHJpdmF0ZSBfcmVuZGVyZXI6IGFueTtcclxuICAgIHByaXZhdGUgX2RhdGFNYXA6IE1hcDxzdHJpbmcsIFtdPjtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuX3JlbmRlcmVyID0gbnVsbDtcclxuICAgICAgICB0aGlzLl9kYXRhTWFwID0gbmV3IE1hcCgpO1xyXG4gICAgICAgIC8vIOWIneWni+WMlm1hcCzmqKHmi5/mjqXlj6NcclxuICAgICAgICBtZXRob2RzLmZvckVhY2gobWV0aG9kID0+IHtcclxuICAgICAgICAgICAgdGhpcy5fZGF0YU1hcC5zZXQobWV0aG9kLCBbXSk7XHJcbiAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBtZXRob2QsIHtcclxuICAgICAgICAgICAgICAgIHZhbHVlOiAoLi4uYXJnczogYW55W10pID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBwYXJhbXMgPSB0aGlzLl9kYXRhTWFwLmdldChtZXRob2QpO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcclxuICAgICAgICAgICAgICAgICAgICBwYXJhbXM/LnB1c2goYXJncyk7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgLy8gdGhpcz8uYWRkVHJpYW5nbGUobmV3IFZlYzMoMCwgMCwgMCksIG5ldyBWZWMzKDAsIDEsIDApLCBuZXcgVmVjMygxLCAwLCAwKSwgbmV3IENvbG9yKDI1NSwgMjU1LCAyNTUpKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgcmVuZGVyZXIoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3JlbmRlcmVyO1xyXG4gICAgfVxyXG5cclxuICAgIHNldCByZW5kZXJlcihyZW5kZXJlcjogYW55KSB7XHJcbiAgICAgICAgdGhpcy5fcmVuZGVyZXIgPSByZW5kZXJlcjtcclxuICAgIH1cclxuXHJcbiAgICAvLyDnu5/kuIDovpPlh7rmlbDmja5cclxuICAgIGZsdXNoKCkge1xyXG4gICAgICAgIGZvciAoY29uc3QgbWV0aG9kIG9mIHRoaXMuX2RhdGFNYXAua2V5cygpKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHBhcmFtcyA9IHRoaXMuX2RhdGFNYXAuZ2V0KG1ldGhvZCk7XHJcbiAgICAgICAgICAgIHBhcmFtcz8uZm9yRWFjaChwYXJhbSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvLyBAdHMtaWdub3JlXHJcbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZygn5o+S5YWl5pWw5o2uJywgbWV0aG9kLCAuLi5wYXJhbSk7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fcmVuZGVyZXIpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBAdHMtaWdub3JlXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fcmVuZGVyZXJbbWV0aG9kXSguLi5wYXJhbSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyDnp7vpmaRtZXRob2Tlr7nkuo7nmoTmlbDmja5cclxuICAgIHJlbW92ZURhdGEobWV0aG9kOiBzdHJpbmcpIHtcclxuICAgICAgICB0aGlzLl9kYXRhTWFwLnNldChtZXRob2QsIFtdKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyDnp7vpmaTmiYDmnInmlbDmja4gXHJcbiAgICByZW1vdmVEYXRhQWxsKCkge1xyXG4gICAgICAgIG1ldGhvZHMuZm9yRWFjaChtZXRob2QgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLl9kYXRhTWFwLnNldChtZXRob2QsIFtdKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbn1cclxuXHJcbmV4cG9ydCB7IEdlb21ldHJ5UmVuZGVyZXIgfTtcclxuIl19