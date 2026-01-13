import { EventEmitter } from 'events';
export default class ScriptManager extends EventEmitter {
    allow: boolean;
    _map: {
        [index: string]: Function[];
    };
    /**
     * 将一个 ctor 放到一个脚本注册 class 的数组里
     * @param uuid
     * @param ctor
     */
    add(uuid: string, ctor: Function): void;
    /**
     * 在 uuid 指向的脚本 ctor 数组里删除对应的 ctor
     * @param uuid
     * @param ctor
     */
    remove(uuid: string, ctor: Function): void;
    /**
     * 获取指定模块内注册的 class 列表
     * @param uuid
     */
    getCtors(uuid: string): Function[];
}
