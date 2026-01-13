export declare enum GltfAccessorComponentType {
    BYTE = 5120,
    UNSIGNED_BYTE = 5121,
    SHORT = 5122,
    UNSIGNED_SHORT = 5123,
    UNSIGNED_INT = 5125,
    FLOAT = 5126
}
export declare enum GltfAccessorType {
    SCALAR = "SCALAR",
    VEC2 = "VEC2",
    VEC3 = "VEC3",
    VEC4 = "VEC4",
    MAT2 = "MAT2",
    MAT3 = "MAT3",
    MAT4 = "MAT4"
}
export declare function getGltfAccessorTypeComponents(type: string): 4 | 3 | 1 | 2 | 16 | 9;
export declare enum GltfPrimitiveMode {
    POINTS = 0,
    LINES = 1,
    LINE_LOOP = 2,
    LINE_STRIP = 3,
    TRIANGLES = 4,
    TRIANGLE_STRIP = 5,
    TRIANGLE_FAN = 6,
    __DEFAULT = 4
}
export declare enum GltfTextureMagFilter {
    NEAREST = 9728,
    LINEAR = 9729
}
export declare enum GltfTextureMinFilter {
    NEAREST = 9728,
    LINEAR = 9729,
    NEAREST_MIPMAP_NEAREST = 9984,
    LINEAR_MIPMAP_NEAREST = 9985,
    NEAREST_MIPMAP_LINEAR = 9986,
    LINEAR_MIPMAP_LINEAR = 9987
}
export declare enum GltfWrapMode {
    CLAMP_TO_EDGE = 33071,
    MIRRORED_REPEAT = 33648,
    REPEAT = 10497,
    __DEFAULT = 10497
}
export declare enum GltfAnimationChannelTargetPath {
    translation = "translation",
    rotation = "rotation",
    scale = "scale",
    weights = "weights"
}
export declare enum GlTfAnimationInterpolation {
    STEP = "STEP",
    LINEAR = "LINEAR",
    CUBIC_SPLINE = "CUBICSPLINE"
}
