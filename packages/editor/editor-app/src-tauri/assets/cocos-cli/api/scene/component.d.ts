import { TAddComponentInfo, TSetPropertyOptions, TComponentResult, TQueryAllComponentResult, TRemoveComponentOptions, TQueryComponentOptions } from './component-schema';
import { CommonResultType } from '../base/schema-base';
export declare class ComponentApi {
    /**
     * Add component // 添加组件
     */
    addComponent(addComponentInfo: TAddComponentInfo): Promise<CommonResultType<TComponentResult>>;
    /**
     * Remove component // 移除组件
     */
    removeComponent(component: TRemoveComponentOptions): Promise<CommonResultType<boolean>>;
    /**
     * Query component // 查询组件
     */
    queryComponent(component: TQueryComponentOptions): Promise<CommonResultType<TComponentResult | null>>;
    /**
     * Set component property // 设置组件属性
     */
    setProperty(setPropertyOptions?: TSetPropertyOptions): Promise<CommonResultType<boolean>>;
    /**
     * Query all components // 查询所有组件
     */
    queryAllComponent(): Promise<CommonResultType<TQueryAllComponentResult>>;
}
