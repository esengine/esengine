import { IAbstractConverter } from './model-convert-routine';
export declare function createFbxConverter(options: {
    unitConversion?: 'geometry-level' | 'hierarchy-level' | 'disabled';
    animationBakeRate?: number;
    preferLocalTimeSpan?: boolean;
    smartMaterialEnabled?: boolean;
    matchMeshNames?: boolean;
}): IAbstractConverter<string>;
