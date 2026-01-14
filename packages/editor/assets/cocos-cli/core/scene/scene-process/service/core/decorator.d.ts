import 'reflect-metadata';
import type { IServiceManager } from '../interfaces';
/**
 * 范例
 * @register('Scene')
 * class SceneManager {
 *   loadScene(name: string) {
 *     console.log(`loading scene: ${name}`);
 *   }
 *
 *   unloadScene(name: string) {
 *     console.log(`unloading scene: ${name}`);
 *   }
 *
 *   private internal() {
 *     console.log('private logic');
 *   }
 * }
 *
 * // 使用
 * import { Service } from './service';
 * Service.Editor.loadScene('Main');
 */
export type ServiceName = keyof IServiceManager;
/** 类装饰器：注册 Service 类，自动收集所有公有方法 */
export declare function register(name?: string): ClassDecorator;
/**
 * 全局代理：通过 Service.Editor.xxx() 访问
 */
export declare const Service: IServiceManager;
/**
 * 获取全部 Service
 */
export declare function getServiceAll(): any[];
