import '@cocos/fbx-gltf-conv/dist/esm/core/types';
import { FbxDouble, FbxDouble3, FbxMaterialProperty, TextureReference } from '@cocos/fbx-gltf-conv/types/FBX-glTF-conv-extras';
export interface MayaMaterialInterface {
    typeId?: number;
}
export interface MayaStandardSurface extends MayaMaterialInterface {
    base: FbxMaterialProperty<FbxDouble>;
    baseColor: FbxMaterialProperty<FbxDouble3>;
    metalness: FbxMaterialProperty<FbxDouble>;
    diffuseRoughness: FbxMaterialProperty<FbxDouble>;
    specularRoughness: FbxMaterialProperty<FbxDouble>;
    specularColor: FbxMaterialProperty<FbxDouble3>;
    normalCamera: FbxMaterialProperty<FbxDouble3>;
    transmission: FbxMaterialProperty<FbxDouble>;
    transmissionColor: FbxMaterialProperty<FbxDouble3>;
    opacity: FbxMaterialProperty<FbxDouble3>;
    emission: FbxMaterialProperty<FbxDouble>;
    emissionColor: FbxMaterialProperty<FbxDouble3>;
}
export type PhysicalMaterialMap = {
    value: TextureReference;
};
export type PhysicalMaterialConstant = {
    value: FbxDouble;
};
export type PhysicalMaterialColor = {
    value: FbxDouble3;
};
export interface MaxPhysicalMaterial {
    base_color: PhysicalMaterialColor;
    base_color_map?: PhysicalMaterialMap;
    base_weight: PhysicalMaterialConstant;
    base_weight_map?: PhysicalMaterialMap;
    cutout_map?: PhysicalMaterialMap;
    emission: PhysicalMaterialConstant;
    emission_map?: PhysicalMaterialMap;
    emit_color: PhysicalMaterialColor;
    emit_color_map?: PhysicalMaterialMap;
    metalness: PhysicalMaterialConstant;
    metalness_map?: PhysicalMaterialMap;
    roughness: PhysicalMaterialConstant;
    roughness_map?: PhysicalMaterialMap;
    bump_map?: PhysicalMaterialMap;
    transparency: PhysicalMaterialConstant;
    transparency_map?: PhysicalMaterialMap;
    trans_color: PhysicalMaterialColor;
    trans_color_map?: PhysicalMaterialMap;
}
