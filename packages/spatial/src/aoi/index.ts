/**
 * @zh AOI (Area of Interest) 兴趣区域模块
 * @en AOI (Area of Interest) Module
 */

export type {
    AOIEventType,
    IAOIEvent,
    AOIEventListener,
    IAOIObserverConfig,
    IAOIManager
} from './IAOI';

export type { GridAOIConfig } from './GridAOI';
export { GridAOI, createGridAOI } from './GridAOI';
