import { EventEmitter } from 'events';
interface MenuItem {
    component: Function;
    menuPath: string;
    priority: number;
}
export default class ComponentManager extends EventEmitter {
    allow: boolean;
    _menus: MenuItem[];
    _pathToUuid: Map<string, string>;
    _uuidToPath: Map<string, string>;
    /**
     * 添加一个组件的菜单项
     * @param component
     * @param path
     * @param priority
     */
    addMenu(component: Function, path: string, priority?: number): void;
    /**
     * 删除一个组件的菜单项
     * @param component
     */
    removeMenu(component: Function): void;
    /**
     * 查询已经注册的组件菜单项
     */
    getMenus(): MenuItem[];
    _map: {
        [index: string]: any;
    };
    /**
     * 新增一个组件
     * 1. 调用Node的addComponent时会调用此方法
     * 2. Node添加到场景树时，会遍历身上的组件调用此方法
     * @param uuid
     * @param component
     */
    add(uuid: string, component: any): void;
    _mapComponentToPath(component: any): void;
    _generateUniquePath(component: any): string;
    /**
     * 删除一个组件
     * 1. 调用Node的_removeComponent时会调用此方法,removeComponent会在下一帧调用_removeComponent,
     * removeComponent会调用一些Component的生命周期函数，而_removeComponent不会。
     * 2. Node添加到场景树时，会遍历身上的组件调用此方法
     * @param uuid
     */
    remove(uuid: string): void;
    /**
     * 清空全部数据
     */
    clear(): void;
    /**
     * 获取一个指定的组件
     * @param uuid
     */
    getComponent(uuid: string): any;
    getComponentFromPath(path: string): any;
    getPathFromUuid(uuid: string): string;
    /**
     * 获取所有的组件数据
     */
    getComponents(): {
        [index: string]: any;
    };
    changeUUID(oldUUID: string, newUUID: string): void;
}
export {};
