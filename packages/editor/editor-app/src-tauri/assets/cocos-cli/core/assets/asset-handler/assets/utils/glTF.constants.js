"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlTfAnimationInterpolation = exports.GltfAnimationChannelTargetPath = exports.GltfWrapMode = exports.GltfTextureMinFilter = exports.GltfTextureMagFilter = exports.GltfPrimitiveMode = exports.GltfAccessorType = exports.GltfAccessorComponentType = void 0;
exports.getGltfAccessorTypeComponents = getGltfAccessorTypeComponents;
var GltfAccessorComponentType;
(function (GltfAccessorComponentType) {
    GltfAccessorComponentType[GltfAccessorComponentType["BYTE"] = 5120] = "BYTE";
    GltfAccessorComponentType[GltfAccessorComponentType["UNSIGNED_BYTE"] = 5121] = "UNSIGNED_BYTE";
    GltfAccessorComponentType[GltfAccessorComponentType["SHORT"] = 5122] = "SHORT";
    GltfAccessorComponentType[GltfAccessorComponentType["UNSIGNED_SHORT"] = 5123] = "UNSIGNED_SHORT";
    GltfAccessorComponentType[GltfAccessorComponentType["UNSIGNED_INT"] = 5125] = "UNSIGNED_INT";
    GltfAccessorComponentType[GltfAccessorComponentType["FLOAT"] = 5126] = "FLOAT";
})(GltfAccessorComponentType || (exports.GltfAccessorComponentType = GltfAccessorComponentType = {}));
var GltfAccessorType;
(function (GltfAccessorType) {
    GltfAccessorType["SCALAR"] = "SCALAR";
    GltfAccessorType["VEC2"] = "VEC2";
    GltfAccessorType["VEC3"] = "VEC3";
    GltfAccessorType["VEC4"] = "VEC4";
    GltfAccessorType["MAT2"] = "MAT2";
    GltfAccessorType["MAT3"] = "MAT3";
    GltfAccessorType["MAT4"] = "MAT4";
})(GltfAccessorType || (exports.GltfAccessorType = GltfAccessorType = {}));
function getGltfAccessorTypeComponents(type) {
    switch (type) {
        case GltfAccessorType.SCALAR:
            return 1;
        case GltfAccessorType.VEC2:
            return 2;
        case GltfAccessorType.VEC3:
            return 3;
        case GltfAccessorType.VEC4:
        case GltfAccessorType.MAT2:
            return 4;
        case GltfAccessorType.MAT3:
            return 9;
        case GltfAccessorType.MAT4:
            return 16;
        default:
            throw new Error(`Unrecognized attribute type: ${type}.`);
    }
}
var GltfPrimitiveMode;
(function (GltfPrimitiveMode) {
    GltfPrimitiveMode[GltfPrimitiveMode["POINTS"] = 0] = "POINTS";
    GltfPrimitiveMode[GltfPrimitiveMode["LINES"] = 1] = "LINES";
    GltfPrimitiveMode[GltfPrimitiveMode["LINE_LOOP"] = 2] = "LINE_LOOP";
    GltfPrimitiveMode[GltfPrimitiveMode["LINE_STRIP"] = 3] = "LINE_STRIP";
    GltfPrimitiveMode[GltfPrimitiveMode["TRIANGLES"] = 4] = "TRIANGLES";
    GltfPrimitiveMode[GltfPrimitiveMode["TRIANGLE_STRIP"] = 5] = "TRIANGLE_STRIP";
    GltfPrimitiveMode[GltfPrimitiveMode["TRIANGLE_FAN"] = 6] = "TRIANGLE_FAN";
    GltfPrimitiveMode[GltfPrimitiveMode["__DEFAULT"] = 4] = "__DEFAULT";
})(GltfPrimitiveMode || (exports.GltfPrimitiveMode = GltfPrimitiveMode = {}));
var GltfTextureMagFilter;
(function (GltfTextureMagFilter) {
    GltfTextureMagFilter[GltfTextureMagFilter["NEAREST"] = 9728] = "NEAREST";
    GltfTextureMagFilter[GltfTextureMagFilter["LINEAR"] = 9729] = "LINEAR";
})(GltfTextureMagFilter || (exports.GltfTextureMagFilter = GltfTextureMagFilter = {}));
var GltfTextureMinFilter;
(function (GltfTextureMinFilter) {
    GltfTextureMinFilter[GltfTextureMinFilter["NEAREST"] = 9728] = "NEAREST";
    GltfTextureMinFilter[GltfTextureMinFilter["LINEAR"] = 9729] = "LINEAR";
    GltfTextureMinFilter[GltfTextureMinFilter["NEAREST_MIPMAP_NEAREST"] = 9984] = "NEAREST_MIPMAP_NEAREST";
    GltfTextureMinFilter[GltfTextureMinFilter["LINEAR_MIPMAP_NEAREST"] = 9985] = "LINEAR_MIPMAP_NEAREST";
    GltfTextureMinFilter[GltfTextureMinFilter["NEAREST_MIPMAP_LINEAR"] = 9986] = "NEAREST_MIPMAP_LINEAR";
    GltfTextureMinFilter[GltfTextureMinFilter["LINEAR_MIPMAP_LINEAR"] = 9987] = "LINEAR_MIPMAP_LINEAR";
})(GltfTextureMinFilter || (exports.GltfTextureMinFilter = GltfTextureMinFilter = {}));
var GltfWrapMode;
(function (GltfWrapMode) {
    GltfWrapMode[GltfWrapMode["CLAMP_TO_EDGE"] = 33071] = "CLAMP_TO_EDGE";
    GltfWrapMode[GltfWrapMode["MIRRORED_REPEAT"] = 33648] = "MIRRORED_REPEAT";
    GltfWrapMode[GltfWrapMode["REPEAT"] = 10497] = "REPEAT";
    GltfWrapMode[GltfWrapMode["__DEFAULT"] = 10497] = "__DEFAULT";
})(GltfWrapMode || (exports.GltfWrapMode = GltfWrapMode = {}));
var GltfAnimationChannelTargetPath;
(function (GltfAnimationChannelTargetPath) {
    GltfAnimationChannelTargetPath["translation"] = "translation";
    GltfAnimationChannelTargetPath["rotation"] = "rotation";
    GltfAnimationChannelTargetPath["scale"] = "scale";
    GltfAnimationChannelTargetPath["weights"] = "weights";
})(GltfAnimationChannelTargetPath || (exports.GltfAnimationChannelTargetPath = GltfAnimationChannelTargetPath = {}));
var GlTfAnimationInterpolation;
(function (GlTfAnimationInterpolation) {
    GlTfAnimationInterpolation["STEP"] = "STEP";
    GlTfAnimationInterpolation["LINEAR"] = "LINEAR";
    GlTfAnimationInterpolation["CUBIC_SPLINE"] = "CUBICSPLINE";
})(GlTfAnimationInterpolation || (exports.GlTfAnimationInterpolation = GlTfAnimationInterpolation = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2xURi5jb25zdGFudHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY29yZS9hc3NldHMvYXNzZXQtaGFuZGxlci9hc3NldHMvdXRpbHMvZ2xURi5jb25zdGFudHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBbUJBLHNFQWtCQztBQXJDRCxJQUFZLHlCQU9YO0FBUEQsV0FBWSx5QkFBeUI7SUFDakMsNEVBQVcsQ0FBQTtJQUNYLDhGQUFvQixDQUFBO0lBQ3BCLDhFQUFZLENBQUE7SUFDWixnR0FBcUIsQ0FBQTtJQUNyQiw0RkFBbUIsQ0FBQTtJQUNuQiw4RUFBWSxDQUFBO0FBQ2hCLENBQUMsRUFQVyx5QkFBeUIseUNBQXpCLHlCQUF5QixRQU9wQztBQUVELElBQVksZ0JBUVg7QUFSRCxXQUFZLGdCQUFnQjtJQUN4QixxQ0FBaUIsQ0FBQTtJQUNqQixpQ0FBYSxDQUFBO0lBQ2IsaUNBQWEsQ0FBQTtJQUNiLGlDQUFhLENBQUE7SUFDYixpQ0FBYSxDQUFBO0lBQ2IsaUNBQWEsQ0FBQTtJQUNiLGlDQUFhLENBQUE7QUFDakIsQ0FBQyxFQVJXLGdCQUFnQixnQ0FBaEIsZ0JBQWdCLFFBUTNCO0FBRUQsU0FBZ0IsNkJBQTZCLENBQUMsSUFBWTtJQUN0RCxRQUFRLElBQUksRUFBRSxDQUFDO1FBQ1gsS0FBSyxnQkFBZ0IsQ0FBQyxNQUFNO1lBQ3hCLE9BQU8sQ0FBQyxDQUFDO1FBQ2IsS0FBSyxnQkFBZ0IsQ0FBQyxJQUFJO1lBQ3RCLE9BQU8sQ0FBQyxDQUFDO1FBQ2IsS0FBSyxnQkFBZ0IsQ0FBQyxJQUFJO1lBQ3RCLE9BQU8sQ0FBQyxDQUFDO1FBQ2IsS0FBSyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUM7UUFDM0IsS0FBSyxnQkFBZ0IsQ0FBQyxJQUFJO1lBQ3RCLE9BQU8sQ0FBQyxDQUFDO1FBQ2IsS0FBSyxnQkFBZ0IsQ0FBQyxJQUFJO1lBQ3RCLE9BQU8sQ0FBQyxDQUFDO1FBQ2IsS0FBSyxnQkFBZ0IsQ0FBQyxJQUFJO1lBQ3RCLE9BQU8sRUFBRSxDQUFDO1FBQ2Q7WUFDSSxNQUFNLElBQUksS0FBSyxDQUFDLGdDQUFnQyxJQUFJLEdBQUcsQ0FBQyxDQUFDO0lBQ2pFLENBQUM7QUFDTCxDQUFDO0FBRUQsSUFBWSxpQkFTWDtBQVRELFdBQVksaUJBQWlCO0lBQ3pCLDZEQUFVLENBQUE7SUFDViwyREFBUyxDQUFBO0lBQ1QsbUVBQWEsQ0FBQTtJQUNiLHFFQUFjLENBQUE7SUFDZCxtRUFBYSxDQUFBO0lBQ2IsNkVBQWtCLENBQUE7SUFDbEIseUVBQWdCLENBQUE7SUFDaEIsbUVBQWEsQ0FBQTtBQUNqQixDQUFDLEVBVFcsaUJBQWlCLGlDQUFqQixpQkFBaUIsUUFTNUI7QUFFRCxJQUFZLG9CQUdYO0FBSEQsV0FBWSxvQkFBb0I7SUFDNUIsd0VBQWMsQ0FBQTtJQUNkLHNFQUFhLENBQUE7QUFDakIsQ0FBQyxFQUhXLG9CQUFvQixvQ0FBcEIsb0JBQW9CLFFBRy9CO0FBRUQsSUFBWSxvQkFPWDtBQVBELFdBQVksb0JBQW9CO0lBQzVCLHdFQUFjLENBQUE7SUFDZCxzRUFBYSxDQUFBO0lBQ2Isc0dBQTZCLENBQUE7SUFDN0Isb0dBQTRCLENBQUE7SUFDNUIsb0dBQTRCLENBQUE7SUFDNUIsa0dBQTJCLENBQUE7QUFDL0IsQ0FBQyxFQVBXLG9CQUFvQixvQ0FBcEIsb0JBQW9CLFFBTy9CO0FBRUQsSUFBWSxZQUtYO0FBTEQsV0FBWSxZQUFZO0lBQ3BCLHFFQUFxQixDQUFBO0lBQ3JCLHlFQUF1QixDQUFBO0lBQ3ZCLHVEQUFjLENBQUE7SUFDZCw2REFBaUIsQ0FBQTtBQUNyQixDQUFDLEVBTFcsWUFBWSw0QkFBWixZQUFZLFFBS3ZCO0FBRUQsSUFBWSw4QkFLWDtBQUxELFdBQVksOEJBQThCO0lBQ3RDLDZEQUEyQixDQUFBO0lBQzNCLHVEQUFxQixDQUFBO0lBQ3JCLGlEQUFlLENBQUE7SUFDZixxREFBbUIsQ0FBQTtBQUN2QixDQUFDLEVBTFcsOEJBQThCLDhDQUE5Qiw4QkFBOEIsUUFLekM7QUFFRCxJQUFZLDBCQUlYO0FBSkQsV0FBWSwwQkFBMEI7SUFDbEMsMkNBQWEsQ0FBQTtJQUNiLCtDQUFpQixDQUFBO0lBQ2pCLDBEQUE0QixDQUFBO0FBQ2hDLENBQUMsRUFKVywwQkFBMEIsMENBQTFCLDBCQUEwQixRQUlyQyIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBlbnVtIEdsdGZBY2Nlc3NvckNvbXBvbmVudFR5cGUge1xyXG4gICAgQllURSA9IDUxMjAsXHJcbiAgICBVTlNJR05FRF9CWVRFID0gNTEyMSxcclxuICAgIFNIT1JUID0gNTEyMixcclxuICAgIFVOU0lHTkVEX1NIT1JUID0gNTEyMyxcclxuICAgIFVOU0lHTkVEX0lOVCA9IDUxMjUsXHJcbiAgICBGTE9BVCA9IDUxMjYsXHJcbn1cclxuXHJcbmV4cG9ydCBlbnVtIEdsdGZBY2Nlc3NvclR5cGUge1xyXG4gICAgU0NBTEFSID0gJ1NDQUxBUicsXHJcbiAgICBWRUMyID0gJ1ZFQzInLFxyXG4gICAgVkVDMyA9ICdWRUMzJyxcclxuICAgIFZFQzQgPSAnVkVDNCcsXHJcbiAgICBNQVQyID0gJ01BVDInLFxyXG4gICAgTUFUMyA9ICdNQVQzJyxcclxuICAgIE1BVDQgPSAnTUFUNCcsXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRHbHRmQWNjZXNzb3JUeXBlQ29tcG9uZW50cyh0eXBlOiBzdHJpbmcpIHtcclxuICAgIHN3aXRjaCAodHlwZSkge1xyXG4gICAgICAgIGNhc2UgR2x0ZkFjY2Vzc29yVHlwZS5TQ0FMQVI6XHJcbiAgICAgICAgICAgIHJldHVybiAxO1xyXG4gICAgICAgIGNhc2UgR2x0ZkFjY2Vzc29yVHlwZS5WRUMyOlxyXG4gICAgICAgICAgICByZXR1cm4gMjtcclxuICAgICAgICBjYXNlIEdsdGZBY2Nlc3NvclR5cGUuVkVDMzpcclxuICAgICAgICAgICAgcmV0dXJuIDM7XHJcbiAgICAgICAgY2FzZSBHbHRmQWNjZXNzb3JUeXBlLlZFQzQ6XHJcbiAgICAgICAgY2FzZSBHbHRmQWNjZXNzb3JUeXBlLk1BVDI6XHJcbiAgICAgICAgICAgIHJldHVybiA0O1xyXG4gICAgICAgIGNhc2UgR2x0ZkFjY2Vzc29yVHlwZS5NQVQzOlxyXG4gICAgICAgICAgICByZXR1cm4gOTtcclxuICAgICAgICBjYXNlIEdsdGZBY2Nlc3NvclR5cGUuTUFUNDpcclxuICAgICAgICAgICAgcmV0dXJuIDE2O1xyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5yZWNvZ25pemVkIGF0dHJpYnV0ZSB0eXBlOiAke3R5cGV9LmApO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZW51bSBHbHRmUHJpbWl0aXZlTW9kZSB7XHJcbiAgICBQT0lOVFMgPSAwLFxyXG4gICAgTElORVMgPSAxLFxyXG4gICAgTElORV9MT09QID0gMixcclxuICAgIExJTkVfU1RSSVAgPSAzLFxyXG4gICAgVFJJQU5HTEVTID0gNCxcclxuICAgIFRSSUFOR0xFX1NUUklQID0gNSxcclxuICAgIFRSSUFOR0xFX0ZBTiA9IDYsXHJcbiAgICBfX0RFRkFVTFQgPSA0LFxyXG59XHJcblxyXG5leHBvcnQgZW51bSBHbHRmVGV4dHVyZU1hZ0ZpbHRlciB7XHJcbiAgICBORUFSRVNUID0gOTcyOCxcclxuICAgIExJTkVBUiA9IDk3MjksXHJcbn1cclxuXHJcbmV4cG9ydCBlbnVtIEdsdGZUZXh0dXJlTWluRmlsdGVyIHtcclxuICAgIE5FQVJFU1QgPSA5NzI4LFxyXG4gICAgTElORUFSID0gOTcyOSxcclxuICAgIE5FQVJFU1RfTUlQTUFQX05FQVJFU1QgPSA5OTg0LFxyXG4gICAgTElORUFSX01JUE1BUF9ORUFSRVNUID0gOTk4NSxcclxuICAgIE5FQVJFU1RfTUlQTUFQX0xJTkVBUiA9IDk5ODYsXHJcbiAgICBMSU5FQVJfTUlQTUFQX0xJTkVBUiA9IDk5ODcsXHJcbn1cclxuXHJcbmV4cG9ydCBlbnVtIEdsdGZXcmFwTW9kZSB7XHJcbiAgICBDTEFNUF9UT19FREdFID0gMzMwNzEsXHJcbiAgICBNSVJST1JFRF9SRVBFQVQgPSAzMzY0OCxcclxuICAgIFJFUEVBVCA9IDEwNDk3LFxyXG4gICAgX19ERUZBVUxUID0gMTA0OTcsXHJcbn1cclxuXHJcbmV4cG9ydCBlbnVtIEdsdGZBbmltYXRpb25DaGFubmVsVGFyZ2V0UGF0aCB7XHJcbiAgICB0cmFuc2xhdGlvbiA9ICd0cmFuc2xhdGlvbicsXHJcbiAgICByb3RhdGlvbiA9ICdyb3RhdGlvbicsXHJcbiAgICBzY2FsZSA9ICdzY2FsZScsXHJcbiAgICB3ZWlnaHRzID0gJ3dlaWdodHMnLFxyXG59XHJcblxyXG5leHBvcnQgZW51bSBHbFRmQW5pbWF0aW9uSW50ZXJwb2xhdGlvbiB7XHJcbiAgICBTVEVQID0gJ1NURVAnLFxyXG4gICAgTElORUFSID0gJ0xJTkVBUicsXHJcbiAgICBDVUJJQ19TUExJTkUgPSAnQ1VCSUNTUExJTkUnLFxyXG59XHJcbiJdfQ==