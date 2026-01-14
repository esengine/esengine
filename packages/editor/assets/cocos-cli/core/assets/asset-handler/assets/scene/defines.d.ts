export interface IObjectRef {
    __id__: number;
}
export interface IType {
    __type__: string;
}
export interface IPrefabInfo extends IType {
    root: IObjectRef;
    asset: IObjectRef;
    fileId: string;
    instance?: IObjectRef;
    nestedPrefabInstanceRoots?: IObjectRef[];
}
export interface IBaseNode extends IType {
    _name: string;
    _objFlags: number;
    _parent: IObjectRef;
    _children: IObjectRef[];
    _active: boolean;
    _components: IObjectRef[];
    _prefab?: IObjectRef;
}
