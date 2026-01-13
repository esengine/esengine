import { IPublicEditorService, IPublicNodeService, IPublicComponentService, IPublicScriptService, IEditorService, INodeService, IComponentService, IScriptService, IPublicAssetService, IAssetService, IEngineService, IPublicEngineService, IPublicPrefabService, IPrefabService } from '../../common';
/**
 * 场景进程开放出去的模块与接口
 */
export interface IPublicServiceManager {
    Editor: IPublicEditorService;
    Node: IPublicNodeService;
    Component: IPublicComponentService;
    Script: IPublicScriptService;
    Asset: IPublicAssetService;
    Engine: IPublicEngineService;
    Prefab: IPublicPrefabService;
}
export interface IServiceManager {
    Editor: IEditorService;
    Node: INodeService;
    Component: IComponentService;
    Script: IScriptService;
    Asset: IAssetService;
    Engine: IEngineService;
    Prefab: IPrefabService;
}
