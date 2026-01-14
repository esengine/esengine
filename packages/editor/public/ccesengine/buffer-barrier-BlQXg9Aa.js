import { _ as _inheritsLoose, a as _createClass, ag as GCObject } from './gc-object-CShF5lzx.js';

var deepCopy = function deepCopy(target, source, Ctor) {
  for (var i = 0; i < source.length; ++i) {
    if (target.length <= i) target.push(new Ctor());
    target[i].copy(source[i]);
  }
  target.length = source.length;
};
var ObjectType;
(function (ObjectType) {
  ObjectType[ObjectType["UNKNOWN"] = 0] = "UNKNOWN";
  ObjectType[ObjectType["SWAPCHAIN"] = 1] = "SWAPCHAIN";
  ObjectType[ObjectType["BUFFER"] = 2] = "BUFFER";
  ObjectType[ObjectType["TEXTURE"] = 3] = "TEXTURE";
  ObjectType[ObjectType["RENDER_PASS"] = 4] = "RENDER_PASS";
  ObjectType[ObjectType["FRAMEBUFFER"] = 5] = "FRAMEBUFFER";
  ObjectType[ObjectType["SAMPLER"] = 6] = "SAMPLER";
  ObjectType[ObjectType["SHADER"] = 7] = "SHADER";
  ObjectType[ObjectType["DESCRIPTOR_SET_LAYOUT"] = 8] = "DESCRIPTOR_SET_LAYOUT";
  ObjectType[ObjectType["PIPELINE_LAYOUT"] = 9] = "PIPELINE_LAYOUT";
  ObjectType[ObjectType["PIPELINE_STATE"] = 10] = "PIPELINE_STATE";
  ObjectType[ObjectType["DESCRIPTOR_SET"] = 11] = "DESCRIPTOR_SET";
  ObjectType[ObjectType["INPUT_ASSEMBLER"] = 12] = "INPUT_ASSEMBLER";
  ObjectType[ObjectType["COMMAND_BUFFER"] = 13] = "COMMAND_BUFFER";
  ObjectType[ObjectType["QUEUE"] = 14] = "QUEUE";
  ObjectType[ObjectType["QUERY_POOL"] = 15] = "QUERY_POOL";
  ObjectType[ObjectType["GLOBAL_BARRIER"] = 16] = "GLOBAL_BARRIER";
  ObjectType[ObjectType["TEXTURE_BARRIER"] = 17] = "TEXTURE_BARRIER";
  ObjectType[ObjectType["BUFFER_BARRIER"] = 18] = "BUFFER_BARRIER";
  ObjectType[ObjectType["COUNT"] = 19] = "COUNT";
})(ObjectType || (ObjectType = {}));
var Status;
(function (Status) {
  Status[Status["UNREADY"] = 0] = "UNREADY";
  Status[Status["FAILED"] = 1] = "FAILED";
  Status[Status["SUCCESS"] = 2] = "SUCCESS";
})(Status || (Status = {}));
var API;
(function (API) {
  API[API["UNKNOWN"] = 0] = "UNKNOWN";
  API[API["GLES2"] = 1] = "GLES2";
  API[API["GLES3"] = 2] = "GLES3";
  API[API["METAL"] = 3] = "METAL";
  API[API["VULKAN"] = 4] = "VULKAN";
  API[API["NVN"] = 5] = "NVN";
  API[API["WEBGL"] = 6] = "WEBGL";
  API[API["WEBGL2"] = 7] = "WEBGL2";
  API[API["WEBGPU"] = 8] = "WEBGPU";
})(API || (API = {}));
var SurfaceTransform;
(function (SurfaceTransform) {
  SurfaceTransform[SurfaceTransform["IDENTITY"] = 0] = "IDENTITY";
  SurfaceTransform[SurfaceTransform["ROTATE_90"] = 1] = "ROTATE_90";
  SurfaceTransform[SurfaceTransform["ROTATE_180"] = 2] = "ROTATE_180";
  SurfaceTransform[SurfaceTransform["ROTATE_270"] = 3] = "ROTATE_270";
})(SurfaceTransform || (SurfaceTransform = {}));
var Feature;
(function (Feature) {
  Feature[Feature["ELEMENT_INDEX_UINT"] = 0] = "ELEMENT_INDEX_UINT";
  Feature[Feature["INSTANCED_ARRAYS"] = 1] = "INSTANCED_ARRAYS";
  Feature[Feature["MULTIPLE_RENDER_TARGETS"] = 2] = "MULTIPLE_RENDER_TARGETS";
  Feature[Feature["BLEND_MINMAX"] = 3] = "BLEND_MINMAX";
  Feature[Feature["COMPUTE_SHADER"] = 4] = "COMPUTE_SHADER";
  Feature[Feature["INPUT_ATTACHMENT_BENEFIT"] = 5] = "INPUT_ATTACHMENT_BENEFIT";
  Feature[Feature["SUBPASS_COLOR_INPUT"] = 6] = "SUBPASS_COLOR_INPUT";
  Feature[Feature["SUBPASS_DEPTH_STENCIL_INPUT"] = 7] = "SUBPASS_DEPTH_STENCIL_INPUT";
  Feature[Feature["RASTERIZATION_ORDER_NOCOHERENT"] = 8] = "RASTERIZATION_ORDER_NOCOHERENT";
  Feature[Feature["MULTI_SAMPLE_RESOLVE_DEPTH_STENCIL"] = 9] = "MULTI_SAMPLE_RESOLVE_DEPTH_STENCIL";
  Feature[Feature["COUNT"] = 10] = "COUNT";
})(Feature || (Feature = {}));
var Format;
(function (Format) {
  Format[Format["UNKNOWN"] = 0] = "UNKNOWN";
  Format[Format["A8"] = 1] = "A8";
  Format[Format["L8"] = 2] = "L8";
  Format[Format["LA8"] = 3] = "LA8";
  Format[Format["R8"] = 4] = "R8";
  Format[Format["R8SN"] = 5] = "R8SN";
  Format[Format["R8UI"] = 6] = "R8UI";
  Format[Format["R8I"] = 7] = "R8I";
  Format[Format["R16F"] = 8] = "R16F";
  Format[Format["R16UI"] = 9] = "R16UI";
  Format[Format["R16I"] = 10] = "R16I";
  Format[Format["R32F"] = 11] = "R32F";
  Format[Format["R32UI"] = 12] = "R32UI";
  Format[Format["R32I"] = 13] = "R32I";
  Format[Format["RG8"] = 14] = "RG8";
  Format[Format["RG8SN"] = 15] = "RG8SN";
  Format[Format["RG8UI"] = 16] = "RG8UI";
  Format[Format["RG8I"] = 17] = "RG8I";
  Format[Format["RG16F"] = 18] = "RG16F";
  Format[Format["RG16UI"] = 19] = "RG16UI";
  Format[Format["RG16I"] = 20] = "RG16I";
  Format[Format["RG32F"] = 21] = "RG32F";
  Format[Format["RG32UI"] = 22] = "RG32UI";
  Format[Format["RG32I"] = 23] = "RG32I";
  Format[Format["RGB8"] = 24] = "RGB8";
  Format[Format["SRGB8"] = 25] = "SRGB8";
  Format[Format["RGB8SN"] = 26] = "RGB8SN";
  Format[Format["RGB8UI"] = 27] = "RGB8UI";
  Format[Format["RGB8I"] = 28] = "RGB8I";
  Format[Format["RGB16F"] = 29] = "RGB16F";
  Format[Format["RGB16UI"] = 30] = "RGB16UI";
  Format[Format["RGB16I"] = 31] = "RGB16I";
  Format[Format["RGB32F"] = 32] = "RGB32F";
  Format[Format["RGB32UI"] = 33] = "RGB32UI";
  Format[Format["RGB32I"] = 34] = "RGB32I";
  Format[Format["RGBA8"] = 35] = "RGBA8";
  Format[Format["BGRA8"] = 36] = "BGRA8";
  Format[Format["SRGB8_A8"] = 37] = "SRGB8_A8";
  Format[Format["RGBA8SN"] = 38] = "RGBA8SN";
  Format[Format["RGBA8UI"] = 39] = "RGBA8UI";
  Format[Format["RGBA8I"] = 40] = "RGBA8I";
  Format[Format["RGBA16F"] = 41] = "RGBA16F";
  Format[Format["RGBA16UI"] = 42] = "RGBA16UI";
  Format[Format["RGBA16I"] = 43] = "RGBA16I";
  Format[Format["RGBA32F"] = 44] = "RGBA32F";
  Format[Format["RGBA32UI"] = 45] = "RGBA32UI";
  Format[Format["RGBA32I"] = 46] = "RGBA32I";
  Format[Format["R5G6B5"] = 47] = "R5G6B5";
  Format[Format["R11G11B10F"] = 48] = "R11G11B10F";
  Format[Format["RGB5A1"] = 49] = "RGB5A1";
  Format[Format["RGBA4"] = 50] = "RGBA4";
  Format[Format["RGB10A2"] = 51] = "RGB10A2";
  Format[Format["RGB10A2UI"] = 52] = "RGB10A2UI";
  Format[Format["RGB9E5"] = 53] = "RGB9E5";
  Format[Format["DEPTH"] = 54] = "DEPTH";
  Format[Format["DEPTH_STENCIL"] = 55] = "DEPTH_STENCIL";
  Format[Format["BC1"] = 56] = "BC1";
  Format[Format["BC1_ALPHA"] = 57] = "BC1_ALPHA";
  Format[Format["BC1_SRGB"] = 58] = "BC1_SRGB";
  Format[Format["BC1_SRGB_ALPHA"] = 59] = "BC1_SRGB_ALPHA";
  Format[Format["BC2"] = 60] = "BC2";
  Format[Format["BC2_SRGB"] = 61] = "BC2_SRGB";
  Format[Format["BC3"] = 62] = "BC3";
  Format[Format["BC3_SRGB"] = 63] = "BC3_SRGB";
  Format[Format["BC4"] = 64] = "BC4";
  Format[Format["BC4_SNORM"] = 65] = "BC4_SNORM";
  Format[Format["BC5"] = 66] = "BC5";
  Format[Format["BC5_SNORM"] = 67] = "BC5_SNORM";
  Format[Format["BC6H_UF16"] = 68] = "BC6H_UF16";
  Format[Format["BC6H_SF16"] = 69] = "BC6H_SF16";
  Format[Format["BC7"] = 70] = "BC7";
  Format[Format["BC7_SRGB"] = 71] = "BC7_SRGB";
  Format[Format["ETC_RGB8"] = 72] = "ETC_RGB8";
  Format[Format["ETC2_RGB8"] = 73] = "ETC2_RGB8";
  Format[Format["ETC2_SRGB8"] = 74] = "ETC2_SRGB8";
  Format[Format["ETC2_RGB8_A1"] = 75] = "ETC2_RGB8_A1";
  Format[Format["ETC2_SRGB8_A1"] = 76] = "ETC2_SRGB8_A1";
  Format[Format["ETC2_RGBA8"] = 77] = "ETC2_RGBA8";
  Format[Format["ETC2_SRGB8_A8"] = 78] = "ETC2_SRGB8_A8";
  Format[Format["EAC_R11"] = 79] = "EAC_R11";
  Format[Format["EAC_R11SN"] = 80] = "EAC_R11SN";
  Format[Format["EAC_RG11"] = 81] = "EAC_RG11";
  Format[Format["EAC_RG11SN"] = 82] = "EAC_RG11SN";
  Format[Format["PVRTC_RGB2"] = 83] = "PVRTC_RGB2";
  Format[Format["PVRTC_RGBA2"] = 84] = "PVRTC_RGBA2";
  Format[Format["PVRTC_RGB4"] = 85] = "PVRTC_RGB4";
  Format[Format["PVRTC_RGBA4"] = 86] = "PVRTC_RGBA4";
  Format[Format["PVRTC2_2BPP"] = 87] = "PVRTC2_2BPP";
  Format[Format["PVRTC2_4BPP"] = 88] = "PVRTC2_4BPP";
  Format[Format["ASTC_RGBA_4X4"] = 89] = "ASTC_RGBA_4X4";
  Format[Format["ASTC_RGBA_5X4"] = 90] = "ASTC_RGBA_5X4";
  Format[Format["ASTC_RGBA_5X5"] = 91] = "ASTC_RGBA_5X5";
  Format[Format["ASTC_RGBA_6X5"] = 92] = "ASTC_RGBA_6X5";
  Format[Format["ASTC_RGBA_6X6"] = 93] = "ASTC_RGBA_6X6";
  Format[Format["ASTC_RGBA_8X5"] = 94] = "ASTC_RGBA_8X5";
  Format[Format["ASTC_RGBA_8X6"] = 95] = "ASTC_RGBA_8X6";
  Format[Format["ASTC_RGBA_8X8"] = 96] = "ASTC_RGBA_8X8";
  Format[Format["ASTC_RGBA_10X5"] = 97] = "ASTC_RGBA_10X5";
  Format[Format["ASTC_RGBA_10X6"] = 98] = "ASTC_RGBA_10X6";
  Format[Format["ASTC_RGBA_10X8"] = 99] = "ASTC_RGBA_10X8";
  Format[Format["ASTC_RGBA_10X10"] = 100] = "ASTC_RGBA_10X10";
  Format[Format["ASTC_RGBA_12X10"] = 101] = "ASTC_RGBA_12X10";
  Format[Format["ASTC_RGBA_12X12"] = 102] = "ASTC_RGBA_12X12";
  Format[Format["ASTC_SRGBA_4X4"] = 103] = "ASTC_SRGBA_4X4";
  Format[Format["ASTC_SRGBA_5X4"] = 104] = "ASTC_SRGBA_5X4";
  Format[Format["ASTC_SRGBA_5X5"] = 105] = "ASTC_SRGBA_5X5";
  Format[Format["ASTC_SRGBA_6X5"] = 106] = "ASTC_SRGBA_6X5";
  Format[Format["ASTC_SRGBA_6X6"] = 107] = "ASTC_SRGBA_6X6";
  Format[Format["ASTC_SRGBA_8X5"] = 108] = "ASTC_SRGBA_8X5";
  Format[Format["ASTC_SRGBA_8X6"] = 109] = "ASTC_SRGBA_8X6";
  Format[Format["ASTC_SRGBA_8X8"] = 110] = "ASTC_SRGBA_8X8";
  Format[Format["ASTC_SRGBA_10X5"] = 111] = "ASTC_SRGBA_10X5";
  Format[Format["ASTC_SRGBA_10X6"] = 112] = "ASTC_SRGBA_10X6";
  Format[Format["ASTC_SRGBA_10X8"] = 113] = "ASTC_SRGBA_10X8";
  Format[Format["ASTC_SRGBA_10X10"] = 114] = "ASTC_SRGBA_10X10";
  Format[Format["ASTC_SRGBA_12X10"] = 115] = "ASTC_SRGBA_12X10";
  Format[Format["ASTC_SRGBA_12X12"] = 116] = "ASTC_SRGBA_12X12";
  Format[Format["COUNT"] = 117] = "COUNT";
})(Format || (Format = {}));
var FormatType;
(function (FormatType) {
  FormatType[FormatType["NONE"] = 0] = "NONE";
  FormatType[FormatType["UNORM"] = 1] = "UNORM";
  FormatType[FormatType["SNORM"] = 2] = "SNORM";
  FormatType[FormatType["UINT"] = 3] = "UINT";
  FormatType[FormatType["INT"] = 4] = "INT";
  FormatType[FormatType["UFLOAT"] = 5] = "UFLOAT";
  FormatType[FormatType["FLOAT"] = 6] = "FLOAT";
})(FormatType || (FormatType = {}));
var SampleType;
(function (SampleType) {
  SampleType[SampleType["FLOAT"] = 0] = "FLOAT";
  SampleType[SampleType["UNFILTERABLE_FLOAT"] = 1] = "UNFILTERABLE_FLOAT";
  SampleType[SampleType["SINT"] = 2] = "SINT";
  SampleType[SampleType["UINT"] = 3] = "UINT";
})(SampleType || (SampleType = {}));
var Type;
(function (Type) {
  Type[Type["UNKNOWN"] = 0] = "UNKNOWN";
  Type[Type["BOOL"] = 1] = "BOOL";
  Type[Type["BOOL2"] = 2] = "BOOL2";
  Type[Type["BOOL3"] = 3] = "BOOL3";
  Type[Type["BOOL4"] = 4] = "BOOL4";
  Type[Type["INT"] = 5] = "INT";
  Type[Type["INT2"] = 6] = "INT2";
  Type[Type["INT3"] = 7] = "INT3";
  Type[Type["INT4"] = 8] = "INT4";
  Type[Type["UINT"] = 9] = "UINT";
  Type[Type["UINT2"] = 10] = "UINT2";
  Type[Type["UINT3"] = 11] = "UINT3";
  Type[Type["UINT4"] = 12] = "UINT4";
  Type[Type["FLOAT"] = 13] = "FLOAT";
  Type[Type["FLOAT2"] = 14] = "FLOAT2";
  Type[Type["FLOAT3"] = 15] = "FLOAT3";
  Type[Type["FLOAT4"] = 16] = "FLOAT4";
  Type[Type["MAT2"] = 17] = "MAT2";
  Type[Type["MAT2X3"] = 18] = "MAT2X3";
  Type[Type["MAT2X4"] = 19] = "MAT2X4";
  Type[Type["MAT3X2"] = 20] = "MAT3X2";
  Type[Type["MAT3"] = 21] = "MAT3";
  Type[Type["MAT3X4"] = 22] = "MAT3X4";
  Type[Type["MAT4X2"] = 23] = "MAT4X2";
  Type[Type["MAT4X3"] = 24] = "MAT4X3";
  Type[Type["MAT4"] = 25] = "MAT4";
  Type[Type["SAMPLER1D"] = 26] = "SAMPLER1D";
  Type[Type["SAMPLER1D_ARRAY"] = 27] = "SAMPLER1D_ARRAY";
  Type[Type["SAMPLER2D"] = 28] = "SAMPLER2D";
  Type[Type["SAMPLER2D_ARRAY"] = 29] = "SAMPLER2D_ARRAY";
  Type[Type["SAMPLER3D"] = 30] = "SAMPLER3D";
  Type[Type["SAMPLER_CUBE"] = 31] = "SAMPLER_CUBE";
  Type[Type["SAMPLER"] = 32] = "SAMPLER";
  Type[Type["TEXTURE1D"] = 33] = "TEXTURE1D";
  Type[Type["TEXTURE1D_ARRAY"] = 34] = "TEXTURE1D_ARRAY";
  Type[Type["TEXTURE2D"] = 35] = "TEXTURE2D";
  Type[Type["TEXTURE2D_ARRAY"] = 36] = "TEXTURE2D_ARRAY";
  Type[Type["TEXTURE3D"] = 37] = "TEXTURE3D";
  Type[Type["TEXTURE_CUBE"] = 38] = "TEXTURE_CUBE";
  Type[Type["IMAGE1D"] = 39] = "IMAGE1D";
  Type[Type["IMAGE1D_ARRAY"] = 40] = "IMAGE1D_ARRAY";
  Type[Type["IMAGE2D"] = 41] = "IMAGE2D";
  Type[Type["IMAGE2D_ARRAY"] = 42] = "IMAGE2D_ARRAY";
  Type[Type["IMAGE3D"] = 43] = "IMAGE3D";
  Type[Type["IMAGE_CUBE"] = 44] = "IMAGE_CUBE";
  Type[Type["SUBPASS_INPUT"] = 45] = "SUBPASS_INPUT";
  Type[Type["COUNT"] = 46] = "COUNT";
})(Type || (Type = {}));
var BufferUsageBit;
(function (BufferUsageBit) {
  BufferUsageBit[BufferUsageBit["NONE"] = 0] = "NONE";
  BufferUsageBit[BufferUsageBit["TRANSFER_SRC"] = 1] = "TRANSFER_SRC";
  BufferUsageBit[BufferUsageBit["TRANSFER_DST"] = 2] = "TRANSFER_DST";
  BufferUsageBit[BufferUsageBit["INDEX"] = 4] = "INDEX";
  BufferUsageBit[BufferUsageBit["VERTEX"] = 8] = "VERTEX";
  BufferUsageBit[BufferUsageBit["UNIFORM"] = 16] = "UNIFORM";
  BufferUsageBit[BufferUsageBit["STORAGE"] = 32] = "STORAGE";
  BufferUsageBit[BufferUsageBit["INDIRECT"] = 64] = "INDIRECT";
})(BufferUsageBit || (BufferUsageBit = {}));
var BufferFlagBit;
(function (BufferFlagBit) {
  BufferFlagBit[BufferFlagBit["NONE"] = 0] = "NONE";
  BufferFlagBit[BufferFlagBit["ENABLE_STAGING_WRITE"] = 1] = "ENABLE_STAGING_WRITE";
})(BufferFlagBit || (BufferFlagBit = {}));
var MemoryAccessBit;
(function (MemoryAccessBit) {
  MemoryAccessBit[MemoryAccessBit["NONE"] = 0] = "NONE";
  MemoryAccessBit[MemoryAccessBit["READ_ONLY"] = 1] = "READ_ONLY";
  MemoryAccessBit[MemoryAccessBit["WRITE_ONLY"] = 2] = "WRITE_ONLY";
  MemoryAccessBit[MemoryAccessBit["READ_WRITE"] = 3] = "READ_WRITE";
})(MemoryAccessBit || (MemoryAccessBit = {}));
var MemoryUsageBit;
(function (MemoryUsageBit) {
  MemoryUsageBit[MemoryUsageBit["NONE"] = 0] = "NONE";
  MemoryUsageBit[MemoryUsageBit["DEVICE"] = 1] = "DEVICE";
  MemoryUsageBit[MemoryUsageBit["HOST"] = 2] = "HOST";
})(MemoryUsageBit || (MemoryUsageBit = {}));
var TextureType;
(function (TextureType) {
  TextureType[TextureType["TEX1D"] = 0] = "TEX1D";
  TextureType[TextureType["TEX2D"] = 1] = "TEX2D";
  TextureType[TextureType["TEX3D"] = 2] = "TEX3D";
  TextureType[TextureType["CUBE"] = 3] = "CUBE";
  TextureType[TextureType["TEX1D_ARRAY"] = 4] = "TEX1D_ARRAY";
  TextureType[TextureType["TEX2D_ARRAY"] = 5] = "TEX2D_ARRAY";
})(TextureType || (TextureType = {}));
var ViewDimension;
(function (ViewDimension) {
  ViewDimension[ViewDimension["UNKNOWN"] = 0] = "UNKNOWN";
  ViewDimension[ViewDimension["BUFFER"] = 1] = "BUFFER";
  ViewDimension[ViewDimension["TEX1D"] = 2] = "TEX1D";
  ViewDimension[ViewDimension["TEX1D_ARRAY"] = 3] = "TEX1D_ARRAY";
  ViewDimension[ViewDimension["TEX2D"] = 4] = "TEX2D";
  ViewDimension[ViewDimension["TEX2D_ARRAY"] = 5] = "TEX2D_ARRAY";
  ViewDimension[ViewDimension["TEX2DMS"] = 6] = "TEX2DMS";
  ViewDimension[ViewDimension["TEX2DMS_ARRAY"] = 7] = "TEX2DMS_ARRAY";
  ViewDimension[ViewDimension["TEX3D"] = 8] = "TEX3D";
  ViewDimension[ViewDimension["TEXCUBE"] = 9] = "TEXCUBE";
  ViewDimension[ViewDimension["TEXCUBE_ARRAY"] = 10] = "TEXCUBE_ARRAY";
  ViewDimension[ViewDimension["RAYTRACING_ACCELERATION_STRUCTURE"] = 11] = "RAYTRACING_ACCELERATION_STRUCTURE";
})(ViewDimension || (ViewDimension = {}));
var TextureUsageBit;
(function (TextureUsageBit) {
  TextureUsageBit[TextureUsageBit["NONE"] = 0] = "NONE";
  TextureUsageBit[TextureUsageBit["TRANSFER_SRC"] = 1] = "TRANSFER_SRC";
  TextureUsageBit[TextureUsageBit["TRANSFER_DST"] = 2] = "TRANSFER_DST";
  TextureUsageBit[TextureUsageBit["SAMPLED"] = 4] = "SAMPLED";
  TextureUsageBit[TextureUsageBit["STORAGE"] = 8] = "STORAGE";
  TextureUsageBit[TextureUsageBit["COLOR_ATTACHMENT"] = 16] = "COLOR_ATTACHMENT";
  TextureUsageBit[TextureUsageBit["DEPTH_STENCIL_ATTACHMENT"] = 32] = "DEPTH_STENCIL_ATTACHMENT";
  TextureUsageBit[TextureUsageBit["INPUT_ATTACHMENT"] = 64] = "INPUT_ATTACHMENT";
  TextureUsageBit[TextureUsageBit["SHADING_RATE"] = 128] = "SHADING_RATE";
})(TextureUsageBit || (TextureUsageBit = {}));
var TextureFlagBit;
(function (TextureFlagBit) {
  TextureFlagBit[TextureFlagBit["NONE"] = 0] = "NONE";
  TextureFlagBit[TextureFlagBit["GEN_MIPMAP"] = 1] = "GEN_MIPMAP";
  TextureFlagBit[TextureFlagBit["GENERAL_LAYOUT"] = 2] = "GENERAL_LAYOUT";
  TextureFlagBit[TextureFlagBit["EXTERNAL_OES"] = 4] = "EXTERNAL_OES";
  TextureFlagBit[TextureFlagBit["EXTERNAL_NORMAL"] = 8] = "EXTERNAL_NORMAL";
  TextureFlagBit[TextureFlagBit["LAZILY_ALLOCATED"] = 16] = "LAZILY_ALLOCATED";
  TextureFlagBit[TextureFlagBit["MUTABLE_VIEW_FORMAT"] = 64] = "MUTABLE_VIEW_FORMAT";
  TextureFlagBit[TextureFlagBit["MUTABLE_STORAGE"] = 128] = "MUTABLE_STORAGE";
})(TextureFlagBit || (TextureFlagBit = {}));
var FormatFeatureBit;
(function (FormatFeatureBit) {
  FormatFeatureBit[FormatFeatureBit["NONE"] = 0] = "NONE";
  FormatFeatureBit[FormatFeatureBit["RENDER_TARGET"] = 1] = "RENDER_TARGET";
  FormatFeatureBit[FormatFeatureBit["SAMPLED_TEXTURE"] = 2] = "SAMPLED_TEXTURE";
  FormatFeatureBit[FormatFeatureBit["LINEAR_FILTER"] = 4] = "LINEAR_FILTER";
  FormatFeatureBit[FormatFeatureBit["STORAGE_TEXTURE"] = 8] = "STORAGE_TEXTURE";
  FormatFeatureBit[FormatFeatureBit["VERTEX_ATTRIBUTE"] = 16] = "VERTEX_ATTRIBUTE";
  FormatFeatureBit[FormatFeatureBit["SHADING_RATE"] = 32] = "SHADING_RATE";
})(FormatFeatureBit || (FormatFeatureBit = {}));
var SampleCount;
(function (SampleCount) {
  SampleCount[SampleCount["X1"] = 1] = "X1";
  SampleCount[SampleCount["X2"] = 2] = "X2";
  SampleCount[SampleCount["X4"] = 4] = "X4";
  SampleCount[SampleCount["X8"] = 8] = "X8";
  SampleCount[SampleCount["X16"] = 16] = "X16";
  SampleCount[SampleCount["X32"] = 32] = "X32";
  SampleCount[SampleCount["X64"] = 64] = "X64";
})(SampleCount || (SampleCount = {}));
var VsyncMode;
(function (VsyncMode) {
  VsyncMode[VsyncMode["OFF"] = 0] = "OFF";
  VsyncMode[VsyncMode["ON"] = 1] = "ON";
  VsyncMode[VsyncMode["RELAXED"] = 2] = "RELAXED";
  VsyncMode[VsyncMode["MAILBOX"] = 3] = "MAILBOX";
  VsyncMode[VsyncMode["HALF"] = 4] = "HALF";
})(VsyncMode || (VsyncMode = {}));
var Filter;
(function (Filter) {
  Filter[Filter["NONE"] = 0] = "NONE";
  Filter[Filter["POINT"] = 1] = "POINT";
  Filter[Filter["LINEAR"] = 2] = "LINEAR";
  Filter[Filter["ANISOTROPIC"] = 3] = "ANISOTROPIC";
})(Filter || (Filter = {}));
var Address;
(function (Address) {
  Address[Address["WRAP"] = 0] = "WRAP";
  Address[Address["MIRROR"] = 1] = "MIRROR";
  Address[Address["CLAMP"] = 2] = "CLAMP";
  Address[Address["BORDER"] = 3] = "BORDER";
})(Address || (Address = {}));
var ComparisonFunc;
(function (ComparisonFunc) {
  ComparisonFunc[ComparisonFunc["NEVER"] = 0] = "NEVER";
  ComparisonFunc[ComparisonFunc["LESS"] = 1] = "LESS";
  ComparisonFunc[ComparisonFunc["EQUAL"] = 2] = "EQUAL";
  ComparisonFunc[ComparisonFunc["LESS_EQUAL"] = 3] = "LESS_EQUAL";
  ComparisonFunc[ComparisonFunc["GREATER"] = 4] = "GREATER";
  ComparisonFunc[ComparisonFunc["NOT_EQUAL"] = 5] = "NOT_EQUAL";
  ComparisonFunc[ComparisonFunc["GREATER_EQUAL"] = 6] = "GREATER_EQUAL";
  ComparisonFunc[ComparisonFunc["ALWAYS"] = 7] = "ALWAYS";
})(ComparisonFunc || (ComparisonFunc = {}));
var StencilOp;
(function (StencilOp) {
  StencilOp[StencilOp["ZERO"] = 0] = "ZERO";
  StencilOp[StencilOp["KEEP"] = 1] = "KEEP";
  StencilOp[StencilOp["REPLACE"] = 2] = "REPLACE";
  StencilOp[StencilOp["INCR"] = 3] = "INCR";
  StencilOp[StencilOp["DECR"] = 4] = "DECR";
  StencilOp[StencilOp["INVERT"] = 5] = "INVERT";
  StencilOp[StencilOp["INCR_WRAP"] = 6] = "INCR_WRAP";
  StencilOp[StencilOp["DECR_WRAP"] = 7] = "DECR_WRAP";
})(StencilOp || (StencilOp = {}));
var BlendFactor;
(function (BlendFactor) {
  BlendFactor[BlendFactor["ZERO"] = 0] = "ZERO";
  BlendFactor[BlendFactor["ONE"] = 1] = "ONE";
  BlendFactor[BlendFactor["SRC_ALPHA"] = 2] = "SRC_ALPHA";
  BlendFactor[BlendFactor["DST_ALPHA"] = 3] = "DST_ALPHA";
  BlendFactor[BlendFactor["ONE_MINUS_SRC_ALPHA"] = 4] = "ONE_MINUS_SRC_ALPHA";
  BlendFactor[BlendFactor["ONE_MINUS_DST_ALPHA"] = 5] = "ONE_MINUS_DST_ALPHA";
  BlendFactor[BlendFactor["SRC_COLOR"] = 6] = "SRC_COLOR";
  BlendFactor[BlendFactor["DST_COLOR"] = 7] = "DST_COLOR";
  BlendFactor[BlendFactor["ONE_MINUS_SRC_COLOR"] = 8] = "ONE_MINUS_SRC_COLOR";
  BlendFactor[BlendFactor["ONE_MINUS_DST_COLOR"] = 9] = "ONE_MINUS_DST_COLOR";
  BlendFactor[BlendFactor["SRC_ALPHA_SATURATE"] = 10] = "SRC_ALPHA_SATURATE";
  BlendFactor[BlendFactor["CONSTANT_COLOR"] = 11] = "CONSTANT_COLOR";
  BlendFactor[BlendFactor["ONE_MINUS_CONSTANT_COLOR"] = 12] = "ONE_MINUS_CONSTANT_COLOR";
  BlendFactor[BlendFactor["CONSTANT_ALPHA"] = 13] = "CONSTANT_ALPHA";
  BlendFactor[BlendFactor["ONE_MINUS_CONSTANT_ALPHA"] = 14] = "ONE_MINUS_CONSTANT_ALPHA";
})(BlendFactor || (BlendFactor = {}));
var BlendOp;
(function (BlendOp) {
  BlendOp[BlendOp["ADD"] = 0] = "ADD";
  BlendOp[BlendOp["SUB"] = 1] = "SUB";
  BlendOp[BlendOp["REV_SUB"] = 2] = "REV_SUB";
  BlendOp[BlendOp["MIN"] = 3] = "MIN";
  BlendOp[BlendOp["MAX"] = 4] = "MAX";
})(BlendOp || (BlendOp = {}));
var ColorMask;
(function (ColorMask) {
  ColorMask[ColorMask["NONE"] = 0] = "NONE";
  ColorMask[ColorMask["R"] = 1] = "R";
  ColorMask[ColorMask["G"] = 2] = "G";
  ColorMask[ColorMask["B"] = 4] = "B";
  ColorMask[ColorMask["A"] = 8] = "A";
  ColorMask[ColorMask["ALL"] = 15] = "ALL";
})(ColorMask || (ColorMask = {}));
var ShaderStageFlagBit;
(function (ShaderStageFlagBit) {
  ShaderStageFlagBit[ShaderStageFlagBit["NONE"] = 0] = "NONE";
  ShaderStageFlagBit[ShaderStageFlagBit["VERTEX"] = 1] = "VERTEX";
  ShaderStageFlagBit[ShaderStageFlagBit["CONTROL"] = 2] = "CONTROL";
  ShaderStageFlagBit[ShaderStageFlagBit["EVALUATION"] = 4] = "EVALUATION";
  ShaderStageFlagBit[ShaderStageFlagBit["GEOMETRY"] = 8] = "GEOMETRY";
  ShaderStageFlagBit[ShaderStageFlagBit["FRAGMENT"] = 16] = "FRAGMENT";
  ShaderStageFlagBit[ShaderStageFlagBit["COMPUTE"] = 32] = "COMPUTE";
  ShaderStageFlagBit[ShaderStageFlagBit["ALL"] = 63] = "ALL";
})(ShaderStageFlagBit || (ShaderStageFlagBit = {}));
var LoadOp;
(function (LoadOp) {
  LoadOp[LoadOp["LOAD"] = 0] = "LOAD";
  LoadOp[LoadOp["CLEAR"] = 1] = "CLEAR";
  LoadOp[LoadOp["DISCARD"] = 2] = "DISCARD";
})(LoadOp || (LoadOp = {}));
var StoreOp;
(function (StoreOp) {
  StoreOp[StoreOp["STORE"] = 0] = "STORE";
  StoreOp[StoreOp["DISCARD"] = 1] = "DISCARD";
})(StoreOp || (StoreOp = {}));
var AccessFlagBit;
(function (AccessFlagBit) {
  AccessFlagBit[AccessFlagBit["NONE"] = 0] = "NONE";
  AccessFlagBit[AccessFlagBit["INDIRECT_BUFFER"] = 1] = "INDIRECT_BUFFER";
  AccessFlagBit[AccessFlagBit["INDEX_BUFFER"] = 2] = "INDEX_BUFFER";
  AccessFlagBit[AccessFlagBit["VERTEX_BUFFER"] = 4] = "VERTEX_BUFFER";
  AccessFlagBit[AccessFlagBit["VERTEX_SHADER_READ_UNIFORM_BUFFER"] = 8] = "VERTEX_SHADER_READ_UNIFORM_BUFFER";
  AccessFlagBit[AccessFlagBit["VERTEX_SHADER_READ_TEXTURE"] = 16] = "VERTEX_SHADER_READ_TEXTURE";
  AccessFlagBit[AccessFlagBit["VERTEX_SHADER_READ_OTHER"] = 32] = "VERTEX_SHADER_READ_OTHER";
  AccessFlagBit[AccessFlagBit["FRAGMENT_SHADER_READ_UNIFORM_BUFFER"] = 64] = "FRAGMENT_SHADER_READ_UNIFORM_BUFFER";
  AccessFlagBit[AccessFlagBit["FRAGMENT_SHADER_READ_TEXTURE"] = 128] = "FRAGMENT_SHADER_READ_TEXTURE";
  AccessFlagBit[AccessFlagBit["FRAGMENT_SHADER_READ_COLOR_INPUT_ATTACHMENT"] = 256] = "FRAGMENT_SHADER_READ_COLOR_INPUT_ATTACHMENT";
  AccessFlagBit[AccessFlagBit["FRAGMENT_SHADER_READ_DEPTH_STENCIL_INPUT_ATTACHMENT"] = 512] = "FRAGMENT_SHADER_READ_DEPTH_STENCIL_INPUT_ATTACHMENT";
  AccessFlagBit[AccessFlagBit["FRAGMENT_SHADER_READ_OTHER"] = 1024] = "FRAGMENT_SHADER_READ_OTHER";
  AccessFlagBit[AccessFlagBit["COLOR_ATTACHMENT_READ"] = 2048] = "COLOR_ATTACHMENT_READ";
  AccessFlagBit[AccessFlagBit["DEPTH_STENCIL_ATTACHMENT_READ"] = 4096] = "DEPTH_STENCIL_ATTACHMENT_READ";
  AccessFlagBit[AccessFlagBit["COMPUTE_SHADER_READ_UNIFORM_BUFFER"] = 8192] = "COMPUTE_SHADER_READ_UNIFORM_BUFFER";
  AccessFlagBit[AccessFlagBit["COMPUTE_SHADER_READ_TEXTURE"] = 16384] = "COMPUTE_SHADER_READ_TEXTURE";
  AccessFlagBit[AccessFlagBit["COMPUTE_SHADER_READ_OTHER"] = 32768] = "COMPUTE_SHADER_READ_OTHER";
  AccessFlagBit[AccessFlagBit["TRANSFER_READ"] = 65536] = "TRANSFER_READ";
  AccessFlagBit[AccessFlagBit["HOST_READ"] = 131072] = "HOST_READ";
  AccessFlagBit[AccessFlagBit["PRESENT"] = 262144] = "PRESENT";
  AccessFlagBit[AccessFlagBit["VERTEX_SHADER_WRITE"] = 524288] = "VERTEX_SHADER_WRITE";
  AccessFlagBit[AccessFlagBit["FRAGMENT_SHADER_WRITE"] = 1048576] = "FRAGMENT_SHADER_WRITE";
  AccessFlagBit[AccessFlagBit["COLOR_ATTACHMENT_WRITE"] = 2097152] = "COLOR_ATTACHMENT_WRITE";
  AccessFlagBit[AccessFlagBit["DEPTH_STENCIL_ATTACHMENT_WRITE"] = 4194304] = "DEPTH_STENCIL_ATTACHMENT_WRITE";
  AccessFlagBit[AccessFlagBit["COMPUTE_SHADER_WRITE"] = 8388608] = "COMPUTE_SHADER_WRITE";
  AccessFlagBit[AccessFlagBit["TRANSFER_WRITE"] = 16777216] = "TRANSFER_WRITE";
  AccessFlagBit[AccessFlagBit["HOST_PREINITIALIZED"] = 33554432] = "HOST_PREINITIALIZED";
  AccessFlagBit[AccessFlagBit["HOST_WRITE"] = 67108864] = "HOST_WRITE";
  AccessFlagBit[AccessFlagBit["SHADING_RATE"] = 134217728] = "SHADING_RATE";
})(AccessFlagBit || (AccessFlagBit = {}));
var ResolveMode;
(function (ResolveMode) {
  ResolveMode[ResolveMode["NONE"] = 0] = "NONE";
  ResolveMode[ResolveMode["SAMPLE_ZERO"] = 1] = "SAMPLE_ZERO";
  ResolveMode[ResolveMode["AVERAGE"] = 2] = "AVERAGE";
  ResolveMode[ResolveMode["MIN"] = 3] = "MIN";
  ResolveMode[ResolveMode["MAX"] = 4] = "MAX";
})(ResolveMode || (ResolveMode = {}));
var PipelineBindPoint;
(function (PipelineBindPoint) {
  PipelineBindPoint[PipelineBindPoint["GRAPHICS"] = 0] = "GRAPHICS";
  PipelineBindPoint[PipelineBindPoint["COMPUTE"] = 1] = "COMPUTE";
  PipelineBindPoint[PipelineBindPoint["RAY_TRACING"] = 2] = "RAY_TRACING";
})(PipelineBindPoint || (PipelineBindPoint = {}));
var PrimitiveMode;
(function (PrimitiveMode) {
  PrimitiveMode[PrimitiveMode["POINT_LIST"] = 0] = "POINT_LIST";
  PrimitiveMode[PrimitiveMode["LINE_LIST"] = 1] = "LINE_LIST";
  PrimitiveMode[PrimitiveMode["LINE_STRIP"] = 2] = "LINE_STRIP";
  PrimitiveMode[PrimitiveMode["LINE_LOOP"] = 3] = "LINE_LOOP";
  PrimitiveMode[PrimitiveMode["LINE_LIST_ADJACENCY"] = 4] = "LINE_LIST_ADJACENCY";
  PrimitiveMode[PrimitiveMode["LINE_STRIP_ADJACENCY"] = 5] = "LINE_STRIP_ADJACENCY";
  PrimitiveMode[PrimitiveMode["ISO_LINE_LIST"] = 6] = "ISO_LINE_LIST";
  PrimitiveMode[PrimitiveMode["TRIANGLE_LIST"] = 7] = "TRIANGLE_LIST";
  PrimitiveMode[PrimitiveMode["TRIANGLE_STRIP"] = 8] = "TRIANGLE_STRIP";
  PrimitiveMode[PrimitiveMode["TRIANGLE_FAN"] = 9] = "TRIANGLE_FAN";
  PrimitiveMode[PrimitiveMode["TRIANGLE_LIST_ADJACENCY"] = 10] = "TRIANGLE_LIST_ADJACENCY";
  PrimitiveMode[PrimitiveMode["TRIANGLE_STRIP_ADJACENCY"] = 11] = "TRIANGLE_STRIP_ADJACENCY";
  PrimitiveMode[PrimitiveMode["TRIANGLE_PATCH_ADJACENCY"] = 12] = "TRIANGLE_PATCH_ADJACENCY";
  PrimitiveMode[PrimitiveMode["QUAD_PATCH_LIST"] = 13] = "QUAD_PATCH_LIST";
})(PrimitiveMode || (PrimitiveMode = {}));
var PolygonMode;
(function (PolygonMode) {
  PolygonMode[PolygonMode["FILL"] = 0] = "FILL";
  PolygonMode[PolygonMode["POINT"] = 1] = "POINT";
  PolygonMode[PolygonMode["LINE"] = 2] = "LINE";
})(PolygonMode || (PolygonMode = {}));
var ShadeModel;
(function (ShadeModel) {
  ShadeModel[ShadeModel["GOURAND"] = 0] = "GOURAND";
  ShadeModel[ShadeModel["FLAT"] = 1] = "FLAT";
})(ShadeModel || (ShadeModel = {}));
var CullMode;
(function (CullMode) {
  CullMode[CullMode["NONE"] = 0] = "NONE";
  CullMode[CullMode["FRONT"] = 1] = "FRONT";
  CullMode[CullMode["BACK"] = 2] = "BACK";
})(CullMode || (CullMode = {}));
var DynamicStateFlagBit;
(function (DynamicStateFlagBit) {
  DynamicStateFlagBit[DynamicStateFlagBit["NONE"] = 0] = "NONE";
  DynamicStateFlagBit[DynamicStateFlagBit["LINE_WIDTH"] = 1] = "LINE_WIDTH";
  DynamicStateFlagBit[DynamicStateFlagBit["DEPTH_BIAS"] = 2] = "DEPTH_BIAS";
  DynamicStateFlagBit[DynamicStateFlagBit["BLEND_CONSTANTS"] = 4] = "BLEND_CONSTANTS";
  DynamicStateFlagBit[DynamicStateFlagBit["DEPTH_BOUNDS"] = 8] = "DEPTH_BOUNDS";
  DynamicStateFlagBit[DynamicStateFlagBit["STENCIL_WRITE_MASK"] = 16] = "STENCIL_WRITE_MASK";
  DynamicStateFlagBit[DynamicStateFlagBit["STENCIL_COMPARE_MASK"] = 32] = "STENCIL_COMPARE_MASK";
})(DynamicStateFlagBit || (DynamicStateFlagBit = {}));
var StencilFace;
(function (StencilFace) {
  StencilFace[StencilFace["FRONT"] = 1] = "FRONT";
  StencilFace[StencilFace["BACK"] = 2] = "BACK";
  StencilFace[StencilFace["ALL"] = 3] = "ALL";
})(StencilFace || (StencilFace = {}));
var DescriptorType;
(function (DescriptorType) {
  DescriptorType[DescriptorType["UNKNOWN"] = 0] = "UNKNOWN";
  DescriptorType[DescriptorType["UNIFORM_BUFFER"] = 1] = "UNIFORM_BUFFER";
  DescriptorType[DescriptorType["DYNAMIC_UNIFORM_BUFFER"] = 2] = "DYNAMIC_UNIFORM_BUFFER";
  DescriptorType[DescriptorType["STORAGE_BUFFER"] = 4] = "STORAGE_BUFFER";
  DescriptorType[DescriptorType["DYNAMIC_STORAGE_BUFFER"] = 8] = "DYNAMIC_STORAGE_BUFFER";
  DescriptorType[DescriptorType["SAMPLER_TEXTURE"] = 16] = "SAMPLER_TEXTURE";
  DescriptorType[DescriptorType["SAMPLER"] = 32] = "SAMPLER";
  DescriptorType[DescriptorType["TEXTURE"] = 64] = "TEXTURE";
  DescriptorType[DescriptorType["STORAGE_IMAGE"] = 128] = "STORAGE_IMAGE";
  DescriptorType[DescriptorType["INPUT_ATTACHMENT"] = 256] = "INPUT_ATTACHMENT";
})(DescriptorType || (DescriptorType = {}));
var QueueType;
(function (QueueType) {
  QueueType[QueueType["GRAPHICS"] = 0] = "GRAPHICS";
  QueueType[QueueType["COMPUTE"] = 1] = "COMPUTE";
  QueueType[QueueType["TRANSFER"] = 2] = "TRANSFER";
})(QueueType || (QueueType = {}));
var QueryType;
(function (QueryType) {
  QueryType[QueryType["OCCLUSION"] = 0] = "OCCLUSION";
  QueryType[QueryType["PIPELINE_STATISTICS"] = 1] = "PIPELINE_STATISTICS";
  QueryType[QueryType["TIMESTAMP"] = 2] = "TIMESTAMP";
})(QueryType || (QueryType = {}));
var CommandBufferType;
(function (CommandBufferType) {
  CommandBufferType[CommandBufferType["PRIMARY"] = 0] = "PRIMARY";
  CommandBufferType[CommandBufferType["SECONDARY"] = 1] = "SECONDARY";
})(CommandBufferType || (CommandBufferType = {}));
var ClearFlagBit;
(function (ClearFlagBit) {
  ClearFlagBit[ClearFlagBit["NONE"] = 0] = "NONE";
  ClearFlagBit[ClearFlagBit["COLOR"] = 1] = "COLOR";
  ClearFlagBit[ClearFlagBit["DEPTH"] = 2] = "DEPTH";
  ClearFlagBit[ClearFlagBit["STENCIL"] = 4] = "STENCIL";
  ClearFlagBit[ClearFlagBit["DEPTH_STENCIL"] = 6] = "DEPTH_STENCIL";
  ClearFlagBit[ClearFlagBit["ALL"] = 7] = "ALL";
})(ClearFlagBit || (ClearFlagBit = {}));
var BarrierType;
(function (BarrierType) {
  BarrierType[BarrierType["FULL"] = 0] = "FULL";
  BarrierType[BarrierType["SPLIT_BEGIN"] = 1] = "SPLIT_BEGIN";
  BarrierType[BarrierType["SPLIT_END"] = 2] = "SPLIT_END";
})(BarrierType || (BarrierType = {}));
var PassType;
(function (PassType) {
  PassType[PassType["RASTER"] = 0] = "RASTER";
  PassType[PassType["COMPUTE"] = 1] = "COMPUTE";
  PassType[PassType["COPY"] = 2] = "COPY";
  PassType[PassType["MOVE"] = 3] = "MOVE";
  PassType[PassType["RAYTRACE"] = 4] = "RAYTRACE";
  PassType[PassType["PRESENT"] = 5] = "PRESENT";
})(PassType || (PassType = {}));
var Size = function () {
  function Size(x, y, z) {
    if (x === void 0) {
      x = 0;
    }
    if (y === void 0) {
      y = 0;
    }
    if (z === void 0) {
      z = 0;
    }
    this.x = x;
    this.y = y;
    this.z = z;
  }
  var _proto = Size.prototype;
  _proto.copy = function copy(info) {
    this.x = info.x;
    this.y = info.y;
    this.z = info.z;
    return this;
  };
  return Size;
}();
var DeviceCaps = function () {
  function DeviceCaps(maxVertexAttributes, maxVertexUniformVectors, maxFragmentUniformVectors, maxTextureUnits, maxImageUnits, maxVertexTextureUnits, maxColorRenderTargets, maxShaderStorageBufferBindings, maxShaderStorageBlockSize, maxUniformBufferBindings, maxUniformBlockSize, maxTextureSize, maxCubeMapTextureSize, maxArrayTextureLayers, max3DTextureSize, uboOffsetAlignment, maxComputeSharedMemorySize, maxComputeWorkGroupInvocations, maxComputeWorkGroupSize, maxComputeWorkGroupCount, supportQuery, supportVariableRateShading, supportSubPassShading, clipSpaceMinZ, screenSpaceSignY, clipSpaceSignY) {
    if (maxVertexAttributes === void 0) {
      maxVertexAttributes = 0;
    }
    if (maxVertexUniformVectors === void 0) {
      maxVertexUniformVectors = 0;
    }
    if (maxFragmentUniformVectors === void 0) {
      maxFragmentUniformVectors = 0;
    }
    if (maxTextureUnits === void 0) {
      maxTextureUnits = 0;
    }
    if (maxImageUnits === void 0) {
      maxImageUnits = 0;
    }
    if (maxVertexTextureUnits === void 0) {
      maxVertexTextureUnits = 0;
    }
    if (maxColorRenderTargets === void 0) {
      maxColorRenderTargets = 0;
    }
    if (maxShaderStorageBufferBindings === void 0) {
      maxShaderStorageBufferBindings = 0;
    }
    if (maxShaderStorageBlockSize === void 0) {
      maxShaderStorageBlockSize = 0;
    }
    if (maxUniformBufferBindings === void 0) {
      maxUniformBufferBindings = 0;
    }
    if (maxUniformBlockSize === void 0) {
      maxUniformBlockSize = 0;
    }
    if (maxTextureSize === void 0) {
      maxTextureSize = 0;
    }
    if (maxCubeMapTextureSize === void 0) {
      maxCubeMapTextureSize = 0;
    }
    if (maxArrayTextureLayers === void 0) {
      maxArrayTextureLayers = 0;
    }
    if (max3DTextureSize === void 0) {
      max3DTextureSize = 0;
    }
    if (uboOffsetAlignment === void 0) {
      uboOffsetAlignment = 1;
    }
    if (maxComputeSharedMemorySize === void 0) {
      maxComputeSharedMemorySize = 0;
    }
    if (maxComputeWorkGroupInvocations === void 0) {
      maxComputeWorkGroupInvocations = 0;
    }
    if (maxComputeWorkGroupSize === void 0) {
      maxComputeWorkGroupSize = new Size();
    }
    if (maxComputeWorkGroupCount === void 0) {
      maxComputeWorkGroupCount = new Size();
    }
    if (supportQuery === void 0) {
      supportQuery = false;
    }
    if (supportVariableRateShading === void 0) {
      supportVariableRateShading = false;
    }
    if (supportSubPassShading === void 0) {
      supportSubPassShading = false;
    }
    if (clipSpaceMinZ === void 0) {
      clipSpaceMinZ = -1;
    }
    if (screenSpaceSignY === void 0) {
      screenSpaceSignY = 1;
    }
    if (clipSpaceSignY === void 0) {
      clipSpaceSignY = 1;
    }
    this.maxVertexAttributes = maxVertexAttributes;
    this.maxVertexUniformVectors = maxVertexUniformVectors;
    this.maxFragmentUniformVectors = maxFragmentUniformVectors;
    this.maxTextureUnits = maxTextureUnits;
    this.maxImageUnits = maxImageUnits;
    this.maxVertexTextureUnits = maxVertexTextureUnits;
    this.maxColorRenderTargets = maxColorRenderTargets;
    this.maxShaderStorageBufferBindings = maxShaderStorageBufferBindings;
    this.maxShaderStorageBlockSize = maxShaderStorageBlockSize;
    this.maxUniformBufferBindings = maxUniformBufferBindings;
    this.maxUniformBlockSize = maxUniformBlockSize;
    this.maxTextureSize = maxTextureSize;
    this.maxCubeMapTextureSize = maxCubeMapTextureSize;
    this.maxArrayTextureLayers = maxArrayTextureLayers;
    this.max3DTextureSize = max3DTextureSize;
    this.uboOffsetAlignment = uboOffsetAlignment;
    this.maxComputeSharedMemorySize = maxComputeSharedMemorySize;
    this.maxComputeWorkGroupInvocations = maxComputeWorkGroupInvocations;
    this.maxComputeWorkGroupSize = maxComputeWorkGroupSize;
    this.maxComputeWorkGroupCount = maxComputeWorkGroupCount;
    this.supportQuery = supportQuery;
    this.supportVariableRateShading = supportVariableRateShading;
    this.supportSubPassShading = supportSubPassShading;
    this.clipSpaceMinZ = clipSpaceMinZ;
    this.screenSpaceSignY = screenSpaceSignY;
    this.clipSpaceSignY = clipSpaceSignY;
  }
  var _proto2 = DeviceCaps.prototype;
  _proto2.copy = function copy(info) {
    this.maxVertexAttributes = info.maxVertexAttributes;
    this.maxVertexUniformVectors = info.maxVertexUniformVectors;
    this.maxFragmentUniformVectors = info.maxFragmentUniformVectors;
    this.maxTextureUnits = info.maxTextureUnits;
    this.maxImageUnits = info.maxImageUnits;
    this.maxVertexTextureUnits = info.maxVertexTextureUnits;
    this.maxColorRenderTargets = info.maxColorRenderTargets;
    this.maxShaderStorageBufferBindings = info.maxShaderStorageBufferBindings;
    this.maxShaderStorageBlockSize = info.maxShaderStorageBlockSize;
    this.maxUniformBufferBindings = info.maxUniformBufferBindings;
    this.maxUniformBlockSize = info.maxUniformBlockSize;
    this.maxTextureSize = info.maxTextureSize;
    this.maxCubeMapTextureSize = info.maxCubeMapTextureSize;
    this.maxArrayTextureLayers = info.maxArrayTextureLayers;
    this.max3DTextureSize = info.max3DTextureSize;
    this.uboOffsetAlignment = info.uboOffsetAlignment;
    this.maxComputeSharedMemorySize = info.maxComputeSharedMemorySize;
    this.maxComputeWorkGroupInvocations = info.maxComputeWorkGroupInvocations;
    this.maxComputeWorkGroupSize.copy(info.maxComputeWorkGroupSize);
    this.maxComputeWorkGroupCount.copy(info.maxComputeWorkGroupCount);
    this.supportQuery = info.supportQuery;
    this.supportVariableRateShading = info.supportVariableRateShading;
    this.supportSubPassShading = info.supportSubPassShading;
    this.clipSpaceMinZ = info.clipSpaceMinZ;
    this.screenSpaceSignY = info.screenSpaceSignY;
    this.clipSpaceSignY = info.clipSpaceSignY;
    return this;
  };
  return DeviceCaps;
}();
var DeviceOptions = function () {
  function DeviceOptions(enableBarrierDeduce) {
    if (enableBarrierDeduce === void 0) {
      enableBarrierDeduce = true;
    }
    this.enableBarrierDeduce = enableBarrierDeduce;
  }
  var _proto3 = DeviceOptions.prototype;
  _proto3.copy = function copy(info) {
    this.enableBarrierDeduce = info.enableBarrierDeduce;
    return this;
  };
  return DeviceOptions;
}();
var Offset = function () {
  function Offset(x, y, z) {
    if (x === void 0) {
      x = 0;
    }
    if (y === void 0) {
      y = 0;
    }
    if (z === void 0) {
      z = 0;
    }
    this.x = x;
    this.y = y;
    this.z = z;
  }
  var _proto4 = Offset.prototype;
  _proto4.copy = function copy(info) {
    this.x = info.x;
    this.y = info.y;
    this.z = info.z;
    return this;
  };
  return Offset;
}();
var Rect = function () {
  function Rect(x, y, width, height) {
    if (x === void 0) {
      x = 0;
    }
    if (y === void 0) {
      y = 0;
    }
    if (width === void 0) {
      width = 0;
    }
    if (height === void 0) {
      height = 0;
    }
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
  var _proto5 = Rect.prototype;
  _proto5.copy = function copy(info) {
    this.x = info.x;
    this.y = info.y;
    this.width = info.width;
    this.height = info.height;
    return this;
  };
  return Rect;
}();
var Extent = function () {
  function Extent(width, height, depth) {
    if (width === void 0) {
      width = 0;
    }
    if (height === void 0) {
      height = 0;
    }
    if (depth === void 0) {
      depth = 1;
    }
    this.width = width;
    this.height = height;
    this.depth = depth;
  }
  var _proto6 = Extent.prototype;
  _proto6.copy = function copy(info) {
    this.width = info.width;
    this.height = info.height;
    this.depth = info.depth;
    return this;
  };
  return Extent;
}();
var TextureSubresLayers = function () {
  function TextureSubresLayers(mipLevel, baseArrayLayer, layerCount) {
    if (mipLevel === void 0) {
      mipLevel = 0;
    }
    if (baseArrayLayer === void 0) {
      baseArrayLayer = 0;
    }
    if (layerCount === void 0) {
      layerCount = 1;
    }
    this.mipLevel = mipLevel;
    this.baseArrayLayer = baseArrayLayer;
    this.layerCount = layerCount;
  }
  var _proto7 = TextureSubresLayers.prototype;
  _proto7.copy = function copy(info) {
    this.mipLevel = info.mipLevel;
    this.baseArrayLayer = info.baseArrayLayer;
    this.layerCount = info.layerCount;
    return this;
  };
  return TextureSubresLayers;
}();
var TextureSubresRange = function () {
  function TextureSubresRange(baseMipLevel, levelCount, baseArrayLayer, layerCount) {
    if (baseMipLevel === void 0) {
      baseMipLevel = 0;
    }
    if (levelCount === void 0) {
      levelCount = 1;
    }
    if (baseArrayLayer === void 0) {
      baseArrayLayer = 0;
    }
    if (layerCount === void 0) {
      layerCount = 1;
    }
    this.baseMipLevel = baseMipLevel;
    this.levelCount = levelCount;
    this.baseArrayLayer = baseArrayLayer;
    this.layerCount = layerCount;
  }
  var _proto8 = TextureSubresRange.prototype;
  _proto8.copy = function copy(info) {
    this.baseMipLevel = info.baseMipLevel;
    this.levelCount = info.levelCount;
    this.baseArrayLayer = info.baseArrayLayer;
    this.layerCount = info.layerCount;
    return this;
  };
  return TextureSubresRange;
}();
var TextureCopy = function () {
  function TextureCopy(srcSubres, srcOffset, dstSubres, dstOffset, extent) {
    if (srcSubres === void 0) {
      srcSubres = new TextureSubresLayers();
    }
    if (srcOffset === void 0) {
      srcOffset = new Offset();
    }
    if (dstSubres === void 0) {
      dstSubres = new TextureSubresLayers();
    }
    if (dstOffset === void 0) {
      dstOffset = new Offset();
    }
    if (extent === void 0) {
      extent = new Extent();
    }
    this.srcSubres = srcSubres;
    this.srcOffset = srcOffset;
    this.dstSubres = dstSubres;
    this.dstOffset = dstOffset;
    this.extent = extent;
  }
  var _proto9 = TextureCopy.prototype;
  _proto9.copy = function copy(info) {
    this.srcSubres.copy(info.srcSubres);
    this.srcOffset.copy(info.srcOffset);
    this.dstSubres.copy(info.dstSubres);
    this.dstOffset.copy(info.dstOffset);
    this.extent.copy(info.extent);
    return this;
  };
  return TextureCopy;
}();
var TextureBlit = function () {
  function TextureBlit(srcSubres, srcOffset, srcExtent, dstSubres, dstOffset, dstExtent) {
    if (srcSubres === void 0) {
      srcSubres = new TextureSubresLayers();
    }
    if (srcOffset === void 0) {
      srcOffset = new Offset();
    }
    if (srcExtent === void 0) {
      srcExtent = new Extent();
    }
    if (dstSubres === void 0) {
      dstSubres = new TextureSubresLayers();
    }
    if (dstOffset === void 0) {
      dstOffset = new Offset();
    }
    if (dstExtent === void 0) {
      dstExtent = new Extent();
    }
    this.srcSubres = srcSubres;
    this.srcOffset = srcOffset;
    this.srcExtent = srcExtent;
    this.dstSubres = dstSubres;
    this.dstOffset = dstOffset;
    this.dstExtent = dstExtent;
  }
  var _proto0 = TextureBlit.prototype;
  _proto0.copy = function copy(info) {
    this.srcSubres.copy(info.srcSubres);
    this.srcOffset.copy(info.srcOffset);
    this.srcExtent.copy(info.srcExtent);
    this.dstSubres.copy(info.dstSubres);
    this.dstOffset.copy(info.dstOffset);
    this.dstExtent.copy(info.dstExtent);
    return this;
  };
  return TextureBlit;
}();
var BufferTextureCopy = function () {
  function BufferTextureCopy(buffOffset, buffStride, buffTexHeight, texOffset, texExtent, texSubres) {
    if (buffOffset === void 0) {
      buffOffset = 0;
    }
    if (buffStride === void 0) {
      buffStride = 0;
    }
    if (buffTexHeight === void 0) {
      buffTexHeight = 0;
    }
    if (texOffset === void 0) {
      texOffset = new Offset();
    }
    if (texExtent === void 0) {
      texExtent = new Extent();
    }
    if (texSubres === void 0) {
      texSubres = new TextureSubresLayers();
    }
    this.buffOffset = buffOffset;
    this.buffStride = buffStride;
    this.buffTexHeight = buffTexHeight;
    this.texOffset = texOffset;
    this.texExtent = texExtent;
    this.texSubres = texSubres;
  }
  var _proto1 = BufferTextureCopy.prototype;
  _proto1.copy = function copy(info) {
    this.buffOffset = info.buffOffset;
    this.buffStride = info.buffStride;
    this.buffTexHeight = info.buffTexHeight;
    this.texOffset.copy(info.texOffset);
    this.texExtent.copy(info.texExtent);
    this.texSubres.copy(info.texSubres);
    return this;
  };
  return BufferTextureCopy;
}();
var Viewport = function () {
  function Viewport(left, top, width, height, minDepth, maxDepth) {
    if (left === void 0) {
      left = 0;
    }
    if (top === void 0) {
      top = 0;
    }
    if (width === void 0) {
      width = 0;
    }
    if (height === void 0) {
      height = 0;
    }
    if (minDepth === void 0) {
      minDepth = 0;
    }
    if (maxDepth === void 0) {
      maxDepth = 1;
    }
    this.left = left;
    this.top = top;
    this.width = width;
    this.height = height;
    this.minDepth = minDepth;
    this.maxDepth = maxDepth;
  }
  var _proto10 = Viewport.prototype;
  _proto10.copy = function copy(info) {
    this.left = info.left;
    this.top = info.top;
    this.width = info.width;
    this.height = info.height;
    this.minDepth = info.minDepth;
    this.maxDepth = info.maxDepth;
    return this;
  };
  _proto10.reset = function reset() {
    this.left = 0;
    this.top = 0;
    this.width = 0;
    this.height = 0;
    this.minDepth = 0;
    this.maxDepth = 1;
  };
  return Viewport;
}();
var Color = function () {
  function Color(x, y, z, w) {
    if (x === void 0) {
      x = 0;
    }
    if (y === void 0) {
      y = 0;
    }
    if (z === void 0) {
      z = 0;
    }
    if (w === void 0) {
      w = 0;
    }
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
  }
  var _proto11 = Color.prototype;
  _proto11.copy = function copy(info) {
    this.x = info.x;
    this.y = info.y;
    this.z = info.z;
    this.w = info.w;
    return this;
  };
  _proto11.set = function set(x, y, z, w) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
    return this;
  };
  _proto11.reset = function reset() {
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.w = 0;
  };
  return Color;
}();
var MarkerInfo = function () {
  function MarkerInfo(name, color) {
    if (name === void 0) {
      name = '';
    }
    if (color === void 0) {
      color = new Color();
    }
    this.name = name;
    this.color = color;
  }
  var _proto12 = MarkerInfo.prototype;
  _proto12.copy = function copy(info) {
    this.name = info.name;
    this.color.copy(info.color);
    return this;
  };
  return MarkerInfo;
}();
var BindingMappingInfo = function () {
  function BindingMappingInfo(maxBlockCounts, maxSamplerTextureCounts, maxSamplerCounts, maxTextureCounts, maxBufferCounts, maxImageCounts, maxSubpassInputCounts, setIndices) {
    if (maxBlockCounts === void 0) {
      maxBlockCounts = [0];
    }
    if (maxSamplerTextureCounts === void 0) {
      maxSamplerTextureCounts = [0];
    }
    if (maxSamplerCounts === void 0) {
      maxSamplerCounts = [0];
    }
    if (maxTextureCounts === void 0) {
      maxTextureCounts = [0];
    }
    if (maxBufferCounts === void 0) {
      maxBufferCounts = [0];
    }
    if (maxImageCounts === void 0) {
      maxImageCounts = [0];
    }
    if (maxSubpassInputCounts === void 0) {
      maxSubpassInputCounts = [0];
    }
    if (setIndices === void 0) {
      setIndices = [0];
    }
    this.maxBlockCounts = maxBlockCounts;
    this.maxSamplerTextureCounts = maxSamplerTextureCounts;
    this.maxSamplerCounts = maxSamplerCounts;
    this.maxTextureCounts = maxTextureCounts;
    this.maxBufferCounts = maxBufferCounts;
    this.maxImageCounts = maxImageCounts;
    this.maxSubpassInputCounts = maxSubpassInputCounts;
    this.setIndices = setIndices;
  }
  var _proto13 = BindingMappingInfo.prototype;
  _proto13.copy = function copy(info) {
    this.maxBlockCounts = info.maxBlockCounts.slice();
    this.maxSamplerTextureCounts = info.maxSamplerTextureCounts.slice();
    this.maxSamplerCounts = info.maxSamplerCounts.slice();
    this.maxTextureCounts = info.maxTextureCounts.slice();
    this.maxBufferCounts = info.maxBufferCounts.slice();
    this.maxImageCounts = info.maxImageCounts.slice();
    this.maxSubpassInputCounts = info.maxSubpassInputCounts.slice();
    this.setIndices = info.setIndices.slice();
    return this;
  };
  return BindingMappingInfo;
}();
var SwapchainInfo = function () {
  function SwapchainInfo(windowId, windowHandle, vsyncMode, width, height) {
    if (windowId === void 0) {
      windowId = 0;
    }
    if (windowHandle === void 0) {
      windowHandle = null;
    }
    if (vsyncMode === void 0) {
      vsyncMode = VsyncMode.ON;
    }
    if (width === void 0) {
      width = 0;
    }
    if (height === void 0) {
      height = 0;
    }
    this.windowId = windowId;
    this.windowHandle = windowHandle;
    this.vsyncMode = vsyncMode;
    this.width = width;
    this.height = height;
  }
  var _proto14 = SwapchainInfo.prototype;
  _proto14.copy = function copy(info) {
    this.windowId = info.windowId;
    this.windowHandle = info.windowHandle;
    this.vsyncMode = info.vsyncMode;
    this.width = info.width;
    this.height = info.height;
    return this;
  };
  return SwapchainInfo;
}();
var DeviceInfo = function () {
  function DeviceInfo(bindingMappingInfo) {
    if (bindingMappingInfo === void 0) {
      bindingMappingInfo = new BindingMappingInfo();
    }
    this.bindingMappingInfo = bindingMappingInfo;
  }
  var _proto15 = DeviceInfo.prototype;
  _proto15.copy = function copy(info) {
    this.bindingMappingInfo.copy(info.bindingMappingInfo);
    return this;
  };
  return DeviceInfo;
}();
var BufferInfo = function () {
  function BufferInfo(usage, memUsage, size, stride, flags) {
    if (usage === void 0) {
      usage = BufferUsageBit.NONE;
    }
    if (memUsage === void 0) {
      memUsage = MemoryUsageBit.NONE;
    }
    if (size === void 0) {
      size = 0;
    }
    if (stride === void 0) {
      stride = 1;
    }
    if (flags === void 0) {
      flags = BufferFlagBit.NONE;
    }
    this.usage = usage;
    this.memUsage = memUsage;
    this.size = size;
    this.stride = stride;
    this.flags = flags;
  }
  var _proto16 = BufferInfo.prototype;
  _proto16.copy = function copy(info) {
    this.usage = info.usage;
    this.memUsage = info.memUsage;
    this.size = info.size;
    this.stride = info.stride;
    this.flags = info.flags;
    return this;
  };
  return BufferInfo;
}();
var BufferViewInfo = function () {
  function BufferViewInfo(buffer, offset, range) {
    if (buffer === void 0) {
      buffer = null;
    }
    if (offset === void 0) {
      offset = 0;
    }
    if (range === void 0) {
      range = 0;
    }
    this.buffer = buffer;
    this.offset = offset;
    this.range = range;
  }
  var _proto17 = BufferViewInfo.prototype;
  _proto17.copy = function copy(info) {
    this.buffer = info.buffer;
    this.offset = info.offset;
    this.range = info.range;
    return this;
  };
  return BufferViewInfo;
}();
var DrawInfo = function () {
  function DrawInfo(vertexCount, firstVertex, indexCount, firstIndex, vertexOffset, instanceCount, firstInstance) {
    if (vertexCount === void 0) {
      vertexCount = 0;
    }
    if (firstVertex === void 0) {
      firstVertex = 0;
    }
    if (indexCount === void 0) {
      indexCount = 0;
    }
    if (firstIndex === void 0) {
      firstIndex = 0;
    }
    if (vertexOffset === void 0) {
      vertexOffset = 0;
    }
    if (instanceCount === void 0) {
      instanceCount = 0;
    }
    if (firstInstance === void 0) {
      firstInstance = 0;
    }
    this.vertexCount = vertexCount;
    this.firstVertex = firstVertex;
    this.indexCount = indexCount;
    this.firstIndex = firstIndex;
    this.vertexOffset = vertexOffset;
    this.instanceCount = instanceCount;
    this.firstInstance = firstInstance;
  }
  var _proto18 = DrawInfo.prototype;
  _proto18.copy = function copy(info) {
    this.vertexCount = info.vertexCount;
    this.firstVertex = info.firstVertex;
    this.indexCount = info.indexCount;
    this.firstIndex = info.firstIndex;
    this.vertexOffset = info.vertexOffset;
    this.instanceCount = info.instanceCount;
    this.firstInstance = info.firstInstance;
    return this;
  };
  return DrawInfo;
}();
var DispatchInfo = function () {
  function DispatchInfo(groupCountX, groupCountY, groupCountZ, indirectBuffer, indirectOffset) {
    if (groupCountX === void 0) {
      groupCountX = 0;
    }
    if (groupCountY === void 0) {
      groupCountY = 0;
    }
    if (groupCountZ === void 0) {
      groupCountZ = 0;
    }
    if (indirectBuffer === void 0) {
      indirectBuffer = null;
    }
    if (indirectOffset === void 0) {
      indirectOffset = 0;
    }
    this.groupCountX = groupCountX;
    this.groupCountY = groupCountY;
    this.groupCountZ = groupCountZ;
    this.indirectBuffer = indirectBuffer;
    this.indirectOffset = indirectOffset;
  }
  var _proto19 = DispatchInfo.prototype;
  _proto19.copy = function copy(info) {
    this.groupCountX = info.groupCountX;
    this.groupCountY = info.groupCountY;
    this.groupCountZ = info.groupCountZ;
    this.indirectBuffer = info.indirectBuffer;
    this.indirectOffset = info.indirectOffset;
    return this;
  };
  return DispatchInfo;
}();
var IndirectBuffer = function () {
  function IndirectBuffer(drawInfos) {
    if (drawInfos === void 0) {
      drawInfos = [];
    }
    this.drawInfos = drawInfos;
  }
  var _proto20 = IndirectBuffer.prototype;
  _proto20.copy = function copy(info) {
    deepCopy(this.drawInfos, info.drawInfos, DrawInfo);
    return this;
  };
  return IndirectBuffer;
}();
var TextureInfo = function () {
  function TextureInfo(type, usage, format, width, height, flags, layerCount, levelCount, samples, depth, externalRes) {
    if (type === void 0) {
      type = TextureType.TEX2D;
    }
    if (usage === void 0) {
      usage = TextureUsageBit.NONE;
    }
    if (format === void 0) {
      format = Format.UNKNOWN;
    }
    if (width === void 0) {
      width = 0;
    }
    if (height === void 0) {
      height = 0;
    }
    if (flags === void 0) {
      flags = TextureFlagBit.NONE;
    }
    if (layerCount === void 0) {
      layerCount = 1;
    }
    if (levelCount === void 0) {
      levelCount = 1;
    }
    if (samples === void 0) {
      samples = SampleCount.X1;
    }
    if (depth === void 0) {
      depth = 1;
    }
    if (externalRes === void 0) {
      externalRes = 0;
    }
    this.type = type;
    this.usage = usage;
    this.format = format;
    this.width = width;
    this.height = height;
    this.flags = flags;
    this.layerCount = layerCount;
    this.levelCount = levelCount;
    this.samples = samples;
    this.depth = depth;
    this.externalRes = externalRes;
  }
  var _proto21 = TextureInfo.prototype;
  _proto21.copy = function copy(info) {
    this.type = info.type;
    this.usage = info.usage;
    this.format = info.format;
    this.width = info.width;
    this.height = info.height;
    this.flags = info.flags;
    this.layerCount = info.layerCount;
    this.levelCount = info.levelCount;
    this.samples = info.samples;
    this.depth = info.depth;
    this.externalRes = info.externalRes;
    return this;
  };
  return TextureInfo;
}();
var TextureViewInfo = function () {
  function TextureViewInfo(texture, type, format, baseLevel, levelCount, baseLayer, layerCount, basePlane, planeCount) {
    if (texture === void 0) {
      texture = null;
    }
    if (type === void 0) {
      type = TextureType.TEX2D;
    }
    if (format === void 0) {
      format = Format.UNKNOWN;
    }
    if (baseLevel === void 0) {
      baseLevel = 0;
    }
    if (levelCount === void 0) {
      levelCount = 1;
    }
    if (baseLayer === void 0) {
      baseLayer = 0;
    }
    if (layerCount === void 0) {
      layerCount = 1;
    }
    if (basePlane === void 0) {
      basePlane = 0;
    }
    if (planeCount === void 0) {
      planeCount = 1;
    }
    this.texture = texture;
    this.type = type;
    this.format = format;
    this.baseLevel = baseLevel;
    this.levelCount = levelCount;
    this.baseLayer = baseLayer;
    this.layerCount = layerCount;
    this.basePlane = basePlane;
    this.planeCount = planeCount;
  }
  var _proto22 = TextureViewInfo.prototype;
  _proto22.copy = function copy(info) {
    this.texture = info.texture;
    this.type = info.type;
    this.format = info.format;
    this.baseLevel = info.baseLevel;
    this.levelCount = info.levelCount;
    this.baseLayer = info.baseLayer;
    this.layerCount = info.layerCount;
    this.basePlane = info.basePlane;
    this.planeCount = info.planeCount;
    return this;
  };
  return TextureViewInfo;
}();
var SamplerInfo = function () {
  function SamplerInfo(minFilter, magFilter, mipFilter, addressU, addressV, addressW, maxAnisotropy, cmpFunc) {
    if (minFilter === void 0) {
      minFilter = Filter.LINEAR;
    }
    if (magFilter === void 0) {
      magFilter = Filter.LINEAR;
    }
    if (mipFilter === void 0) {
      mipFilter = Filter.NONE;
    }
    if (addressU === void 0) {
      addressU = Address.WRAP;
    }
    if (addressV === void 0) {
      addressV = Address.WRAP;
    }
    if (addressW === void 0) {
      addressW = Address.WRAP;
    }
    if (maxAnisotropy === void 0) {
      maxAnisotropy = 0;
    }
    if (cmpFunc === void 0) {
      cmpFunc = ComparisonFunc.ALWAYS;
    }
    this.minFilter = minFilter;
    this.magFilter = magFilter;
    this.mipFilter = mipFilter;
    this.addressU = addressU;
    this.addressV = addressV;
    this.addressW = addressW;
    this.maxAnisotropy = maxAnisotropy;
    this.cmpFunc = cmpFunc;
  }
  var _proto23 = SamplerInfo.prototype;
  _proto23.copy = function copy(info) {
    this.minFilter = info.minFilter;
    this.magFilter = info.magFilter;
    this.mipFilter = info.mipFilter;
    this.addressU = info.addressU;
    this.addressV = info.addressV;
    this.addressW = info.addressW;
    this.maxAnisotropy = info.maxAnisotropy;
    this.cmpFunc = info.cmpFunc;
    return this;
  };
  return SamplerInfo;
}();
var Uniform = function () {
  function Uniform(name, type, count) {
    if (name === void 0) {
      name = '';
    }
    if (type === void 0) {
      type = Type.UNKNOWN;
    }
    if (count === void 0) {
      count = 0;
    }
    this.name = name;
    this.type = type;
    this.count = count;
  }
  var _proto24 = Uniform.prototype;
  _proto24.copy = function copy(info) {
    this.name = info.name;
    this.type = info.type;
    this.count = info.count;
    return this;
  };
  return Uniform;
}();
var UniformBlock = function () {
  function UniformBlock(set, binding, name, members, count, flattened) {
    if (set === void 0) {
      set = 0;
    }
    if (binding === void 0) {
      binding = 0;
    }
    if (name === void 0) {
      name = '';
    }
    if (members === void 0) {
      members = [];
    }
    if (count === void 0) {
      count = 0;
    }
    if (flattened === void 0) {
      flattened = 0;
    }
    this.set = set;
    this.binding = binding;
    this.name = name;
    this.members = members;
    this.count = count;
    this.flattened = flattened;
  }
  var _proto25 = UniformBlock.prototype;
  _proto25.copy = function copy(info) {
    this.set = info.set;
    this.binding = info.binding;
    this.name = info.name;
    deepCopy(this.members, info.members, Uniform);
    this.count = info.count;
    this.flattened = info.flattened;
    return this;
  };
  return UniformBlock;
}();
var UniformSamplerTexture = function () {
  function UniformSamplerTexture(set, binding, name, type, count, flattened) {
    if (set === void 0) {
      set = 0;
    }
    if (binding === void 0) {
      binding = 0;
    }
    if (name === void 0) {
      name = '';
    }
    if (type === void 0) {
      type = Type.UNKNOWN;
    }
    if (count === void 0) {
      count = 0;
    }
    if (flattened === void 0) {
      flattened = 0;
    }
    this.set = set;
    this.binding = binding;
    this.name = name;
    this.type = type;
    this.count = count;
    this.flattened = flattened;
  }
  var _proto26 = UniformSamplerTexture.prototype;
  _proto26.copy = function copy(info) {
    this.set = info.set;
    this.binding = info.binding;
    this.name = info.name;
    this.type = info.type;
    this.count = info.count;
    this.flattened = info.flattened;
    return this;
  };
  return UniformSamplerTexture;
}();
var UniformSampler = function () {
  function UniformSampler(set, binding, name, count, flattened) {
    if (set === void 0) {
      set = 0;
    }
    if (binding === void 0) {
      binding = 0;
    }
    if (name === void 0) {
      name = '';
    }
    if (count === void 0) {
      count = 0;
    }
    if (flattened === void 0) {
      flattened = 0;
    }
    this.set = set;
    this.binding = binding;
    this.name = name;
    this.count = count;
    this.flattened = flattened;
  }
  var _proto27 = UniformSampler.prototype;
  _proto27.copy = function copy(info) {
    this.set = info.set;
    this.binding = info.binding;
    this.name = info.name;
    this.count = info.count;
    this.flattened = info.flattened;
    return this;
  };
  return UniformSampler;
}();
var UniformTexture = function () {
  function UniformTexture(set, binding, name, type, count, flattened) {
    if (set === void 0) {
      set = 0;
    }
    if (binding === void 0) {
      binding = 0;
    }
    if (name === void 0) {
      name = '';
    }
    if (type === void 0) {
      type = Type.UNKNOWN;
    }
    if (count === void 0) {
      count = 0;
    }
    if (flattened === void 0) {
      flattened = 0;
    }
    this.set = set;
    this.binding = binding;
    this.name = name;
    this.type = type;
    this.count = count;
    this.flattened = flattened;
  }
  var _proto28 = UniformTexture.prototype;
  _proto28.copy = function copy(info) {
    this.set = info.set;
    this.binding = info.binding;
    this.name = info.name;
    this.type = info.type;
    this.count = info.count;
    this.flattened = info.flattened;
    return this;
  };
  return UniformTexture;
}();
var UniformStorageImage = function () {
  function UniformStorageImage(set, binding, name, type, count, memoryAccess, flattened) {
    if (set === void 0) {
      set = 0;
    }
    if (binding === void 0) {
      binding = 0;
    }
    if (name === void 0) {
      name = '';
    }
    if (type === void 0) {
      type = Type.UNKNOWN;
    }
    if (count === void 0) {
      count = 0;
    }
    if (memoryAccess === void 0) {
      memoryAccess = MemoryAccessBit.READ_WRITE;
    }
    if (flattened === void 0) {
      flattened = 0;
    }
    this.set = set;
    this.binding = binding;
    this.name = name;
    this.type = type;
    this.count = count;
    this.memoryAccess = memoryAccess;
    this.flattened = flattened;
  }
  var _proto29 = UniformStorageImage.prototype;
  _proto29.copy = function copy(info) {
    this.set = info.set;
    this.binding = info.binding;
    this.name = info.name;
    this.type = info.type;
    this.count = info.count;
    this.memoryAccess = info.memoryAccess;
    this.flattened = info.flattened;
    return this;
  };
  return UniformStorageImage;
}();
var UniformStorageBuffer = function () {
  function UniformStorageBuffer(set, binding, name, count, memoryAccess, flattened) {
    if (set === void 0) {
      set = 0;
    }
    if (binding === void 0) {
      binding = 0;
    }
    if (name === void 0) {
      name = '';
    }
    if (count === void 0) {
      count = 0;
    }
    if (memoryAccess === void 0) {
      memoryAccess = MemoryAccessBit.READ_WRITE;
    }
    if (flattened === void 0) {
      flattened = 0;
    }
    this.set = set;
    this.binding = binding;
    this.name = name;
    this.count = count;
    this.memoryAccess = memoryAccess;
    this.flattened = flattened;
  }
  var _proto30 = UniformStorageBuffer.prototype;
  _proto30.copy = function copy(info) {
    this.set = info.set;
    this.binding = info.binding;
    this.name = info.name;
    this.count = info.count;
    this.memoryAccess = info.memoryAccess;
    this.flattened = info.flattened;
    return this;
  };
  return UniformStorageBuffer;
}();
var UniformInputAttachment = function () {
  function UniformInputAttachment(set, binding, name, count, flattened) {
    if (set === void 0) {
      set = 0;
    }
    if (binding === void 0) {
      binding = 0;
    }
    if (name === void 0) {
      name = '';
    }
    if (count === void 0) {
      count = 0;
    }
    if (flattened === void 0) {
      flattened = 0;
    }
    this.set = set;
    this.binding = binding;
    this.name = name;
    this.count = count;
    this.flattened = flattened;
  }
  var _proto31 = UniformInputAttachment.prototype;
  _proto31.copy = function copy(info) {
    this.set = info.set;
    this.binding = info.binding;
    this.name = info.name;
    this.count = info.count;
    this.flattened = info.flattened;
    return this;
  };
  return UniformInputAttachment;
}();
var ShaderStage = function () {
  function ShaderStage(stage, source) {
    if (stage === void 0) {
      stage = ShaderStageFlagBit.NONE;
    }
    if (source === void 0) {
      source = '';
    }
    this.stage = stage;
    this.source = source;
  }
  var _proto32 = ShaderStage.prototype;
  _proto32.copy = function copy(info) {
    this.stage = info.stage;
    this.source = info.source;
    return this;
  };
  return ShaderStage;
}();
var Attribute = function () {
  function Attribute(name, format, isNormalized, stream, isInstanced, location) {
    if (name === void 0) {
      name = '';
    }
    if (format === void 0) {
      format = Format.UNKNOWN;
    }
    if (isNormalized === void 0) {
      isNormalized = false;
    }
    if (stream === void 0) {
      stream = 0;
    }
    if (isInstanced === void 0) {
      isInstanced = false;
    }
    if (location === void 0) {
      location = 0;
    }
    this.name = name;
    this.format = format;
    this.isNormalized = isNormalized;
    this.stream = stream;
    this.isInstanced = isInstanced;
    this.location = location;
  }
  var _proto33 = Attribute.prototype;
  _proto33.copy = function copy(info) {
    this.name = info.name;
    this.format = info.format;
    this.isNormalized = info.isNormalized;
    this.stream = info.stream;
    this.isInstanced = info.isInstanced;
    this.location = info.location;
    return this;
  };
  return Attribute;
}();
var ShaderInfo = function () {
  function ShaderInfo(name, stages, attributes, blocks, buffers, samplerTextures, samplers, textures, images, subpassInputs, hash) {
    if (name === void 0) {
      name = '';
    }
    if (stages === void 0) {
      stages = [];
    }
    if (attributes === void 0) {
      attributes = [];
    }
    if (blocks === void 0) {
      blocks = [];
    }
    if (buffers === void 0) {
      buffers = [];
    }
    if (samplerTextures === void 0) {
      samplerTextures = [];
    }
    if (samplers === void 0) {
      samplers = [];
    }
    if (textures === void 0) {
      textures = [];
    }
    if (images === void 0) {
      images = [];
    }
    if (subpassInputs === void 0) {
      subpassInputs = [];
    }
    if (hash === void 0) {
      hash = 0xFFFFFFFF;
    }
    this.name = name;
    this.stages = stages;
    this.attributes = attributes;
    this.blocks = blocks;
    this.buffers = buffers;
    this.samplerTextures = samplerTextures;
    this.samplers = samplers;
    this.textures = textures;
    this.images = images;
    this.subpassInputs = subpassInputs;
    this.hash = hash;
  }
  var _proto34 = ShaderInfo.prototype;
  _proto34.copy = function copy(info) {
    this.name = info.name;
    deepCopy(this.stages, info.stages, ShaderStage);
    deepCopy(this.attributes, info.attributes, Attribute);
    deepCopy(this.blocks, info.blocks, UniformBlock);
    deepCopy(this.buffers, info.buffers, UniformStorageBuffer);
    deepCopy(this.samplerTextures, info.samplerTextures, UniformSamplerTexture);
    deepCopy(this.samplers, info.samplers, UniformSampler);
    deepCopy(this.textures, info.textures, UniformTexture);
    deepCopy(this.images, info.images, UniformStorageImage);
    deepCopy(this.subpassInputs, info.subpassInputs, UniformInputAttachment);
    this.hash = info.hash;
    return this;
  };
  return ShaderInfo;
}();
var InputAssemblerInfo = function () {
  function InputAssemblerInfo(attributes, vertexBuffers, indexBuffer, indirectBuffer) {
    if (attributes === void 0) {
      attributes = [];
    }
    if (vertexBuffers === void 0) {
      vertexBuffers = [];
    }
    if (indexBuffer === void 0) {
      indexBuffer = null;
    }
    if (indirectBuffer === void 0) {
      indirectBuffer = null;
    }
    this.attributes = attributes;
    this.vertexBuffers = vertexBuffers;
    this.indexBuffer = indexBuffer;
    this.indirectBuffer = indirectBuffer;
  }
  var _proto35 = InputAssemblerInfo.prototype;
  _proto35.copy = function copy(info) {
    deepCopy(this.attributes, info.attributes, Attribute);
    this.vertexBuffers = info.vertexBuffers.slice();
    this.indexBuffer = info.indexBuffer;
    this.indirectBuffer = info.indirectBuffer;
    return this;
  };
  return InputAssemblerInfo;
}();
var ColorAttachment = function () {
  function ColorAttachment(format, sampleCount, loadOp, storeOp, barrier) {
    if (format === void 0) {
      format = Format.UNKNOWN;
    }
    if (sampleCount === void 0) {
      sampleCount = SampleCount.X1;
    }
    if (loadOp === void 0) {
      loadOp = LoadOp.CLEAR;
    }
    if (storeOp === void 0) {
      storeOp = StoreOp.STORE;
    }
    if (barrier === void 0) {
      barrier = null;
    }
    this.format = format;
    this.sampleCount = sampleCount;
    this.loadOp = loadOp;
    this.storeOp = storeOp;
    this.barrier = barrier;
  }
  var _proto36 = ColorAttachment.prototype;
  _proto36.copy = function copy(info) {
    this.format = info.format;
    this.sampleCount = info.sampleCount;
    this.loadOp = info.loadOp;
    this.storeOp = info.storeOp;
    this.barrier = info.barrier;
    return this;
  };
  return ColorAttachment;
}();
var DepthStencilAttachment = function () {
  function DepthStencilAttachment(format, sampleCount, depthLoadOp, depthStoreOp, stencilLoadOp, stencilStoreOp, barrier) {
    if (format === void 0) {
      format = Format.UNKNOWN;
    }
    if (sampleCount === void 0) {
      sampleCount = SampleCount.X1;
    }
    if (depthLoadOp === void 0) {
      depthLoadOp = LoadOp.CLEAR;
    }
    if (depthStoreOp === void 0) {
      depthStoreOp = StoreOp.STORE;
    }
    if (stencilLoadOp === void 0) {
      stencilLoadOp = LoadOp.CLEAR;
    }
    if (stencilStoreOp === void 0) {
      stencilStoreOp = StoreOp.STORE;
    }
    if (barrier === void 0) {
      barrier = null;
    }
    this.format = format;
    this.sampleCount = sampleCount;
    this.depthLoadOp = depthLoadOp;
    this.depthStoreOp = depthStoreOp;
    this.stencilLoadOp = stencilLoadOp;
    this.stencilStoreOp = stencilStoreOp;
    this.barrier = barrier;
  }
  var _proto37 = DepthStencilAttachment.prototype;
  _proto37.copy = function copy(info) {
    this.format = info.format;
    this.sampleCount = info.sampleCount;
    this.depthLoadOp = info.depthLoadOp;
    this.depthStoreOp = info.depthStoreOp;
    this.stencilLoadOp = info.stencilLoadOp;
    this.stencilStoreOp = info.stencilStoreOp;
    this.barrier = info.barrier;
    return this;
  };
  return DepthStencilAttachment;
}();
var SubpassInfo = function () {
  function SubpassInfo(inputs, colors, resolves, preserves, depthStencil, depthStencilResolve, shadingRate, depthResolveMode, stencilResolveMode) {
    if (inputs === void 0) {
      inputs = [];
    }
    if (colors === void 0) {
      colors = [];
    }
    if (resolves === void 0) {
      resolves = [];
    }
    if (preserves === void 0) {
      preserves = [];
    }
    if (depthStencil === void 0) {
      depthStencil = -1;
    }
    if (depthStencilResolve === void 0) {
      depthStencilResolve = -1;
    }
    if (shadingRate === void 0) {
      shadingRate = -1;
    }
    if (depthResolveMode === void 0) {
      depthResolveMode = ResolveMode.NONE;
    }
    if (stencilResolveMode === void 0) {
      stencilResolveMode = ResolveMode.NONE;
    }
    this.inputs = inputs;
    this.colors = colors;
    this.resolves = resolves;
    this.preserves = preserves;
    this.depthStencil = depthStencil;
    this.depthStencilResolve = depthStencilResolve;
    this.shadingRate = shadingRate;
    this.depthResolveMode = depthResolveMode;
    this.stencilResolveMode = stencilResolveMode;
  }
  var _proto38 = SubpassInfo.prototype;
  _proto38.copy = function copy(info) {
    this.inputs = info.inputs.slice();
    this.colors = info.colors.slice();
    this.resolves = info.resolves.slice();
    this.preserves = info.preserves.slice();
    this.depthStencil = info.depthStencil;
    this.depthStencilResolve = info.depthStencilResolve;
    this.shadingRate = info.shadingRate;
    this.depthResolveMode = info.depthResolveMode;
    this.stencilResolveMode = info.stencilResolveMode;
    return this;
  };
  return SubpassInfo;
}();
var SubpassDependency = function () {
  function SubpassDependency(srcSubpass, dstSubpass, generalBarrier, prevAccesses, nextAccesses) {
    if (srcSubpass === void 0) {
      srcSubpass = 0;
    }
    if (dstSubpass === void 0) {
      dstSubpass = 0;
    }
    if (generalBarrier === void 0) {
      generalBarrier = null;
    }
    if (prevAccesses === void 0) {
      prevAccesses = AccessFlagBit.NONE;
    }
    if (nextAccesses === void 0) {
      nextAccesses = AccessFlagBit.NONE;
    }
    this.srcSubpass = srcSubpass;
    this.dstSubpass = dstSubpass;
    this.generalBarrier = generalBarrier;
    this.prevAccesses = prevAccesses;
    this.nextAccesses = nextAccesses;
  }
  var _proto39 = SubpassDependency.prototype;
  _proto39.copy = function copy(info) {
    this.srcSubpass = info.srcSubpass;
    this.dstSubpass = info.dstSubpass;
    this.generalBarrier = info.generalBarrier;
    this.prevAccesses = info.prevAccesses;
    this.nextAccesses = info.nextAccesses;
    return this;
  };
  return SubpassDependency;
}();
var RenderPassInfo = function () {
  function RenderPassInfo(colorAttachments, depthStencilAttachment, depthStencilResolveAttachment, subpasses, dependencies) {
    if (colorAttachments === void 0) {
      colorAttachments = [];
    }
    if (depthStencilAttachment === void 0) {
      depthStencilAttachment = new DepthStencilAttachment();
    }
    if (depthStencilResolveAttachment === void 0) {
      depthStencilResolveAttachment = new DepthStencilAttachment();
    }
    if (subpasses === void 0) {
      subpasses = [];
    }
    if (dependencies === void 0) {
      dependencies = [];
    }
    this.colorAttachments = colorAttachments;
    this.depthStencilAttachment = depthStencilAttachment;
    this.depthStencilResolveAttachment = depthStencilResolveAttachment;
    this.subpasses = subpasses;
    this.dependencies = dependencies;
  }
  var _proto40 = RenderPassInfo.prototype;
  _proto40.copy = function copy(info) {
    deepCopy(this.colorAttachments, info.colorAttachments, ColorAttachment);
    this.depthStencilAttachment.copy(info.depthStencilAttachment);
    this.depthStencilResolveAttachment.copy(info.depthStencilResolveAttachment);
    deepCopy(this.subpasses, info.subpasses, SubpassInfo);
    deepCopy(this.dependencies, info.dependencies, SubpassDependency);
    return this;
  };
  return RenderPassInfo;
}();
var ResourceRange = function () {
  function ResourceRange(width, height, depthOrArraySize, firstSlice, numSlices, mipLevel, levelCount, basePlane, planeCount) {
    if (width === void 0) {
      width = 0;
    }
    if (height === void 0) {
      height = 0;
    }
    if (depthOrArraySize === void 0) {
      depthOrArraySize = 0;
    }
    if (firstSlice === void 0) {
      firstSlice = 0;
    }
    if (numSlices === void 0) {
      numSlices = 0;
    }
    if (mipLevel === void 0) {
      mipLevel = 0;
    }
    if (levelCount === void 0) {
      levelCount = 0;
    }
    if (basePlane === void 0) {
      basePlane = 0;
    }
    if (planeCount === void 0) {
      planeCount = 0;
    }
    this.width = width;
    this.height = height;
    this.depthOrArraySize = depthOrArraySize;
    this.firstSlice = firstSlice;
    this.numSlices = numSlices;
    this.mipLevel = mipLevel;
    this.levelCount = levelCount;
    this.basePlane = basePlane;
    this.planeCount = planeCount;
  }
  var _proto41 = ResourceRange.prototype;
  _proto41.copy = function copy(info) {
    this.width = info.width;
    this.height = info.height;
    this.depthOrArraySize = info.depthOrArraySize;
    this.firstSlice = info.firstSlice;
    this.numSlices = info.numSlices;
    this.mipLevel = info.mipLevel;
    this.levelCount = info.levelCount;
    this.basePlane = info.basePlane;
    this.planeCount = info.planeCount;
    return this;
  };
  return ResourceRange;
}();
var GeneralBarrierInfo = function () {
  function GeneralBarrierInfo(prevAccesses, nextAccesses, type) {
    if (prevAccesses === void 0) {
      prevAccesses = AccessFlagBit.NONE;
    }
    if (nextAccesses === void 0) {
      nextAccesses = AccessFlagBit.NONE;
    }
    if (type === void 0) {
      type = BarrierType.FULL;
    }
    this.prevAccesses = prevAccesses;
    this.nextAccesses = nextAccesses;
    this.type = type;
  }
  var _proto42 = GeneralBarrierInfo.prototype;
  _proto42.copy = function copy(info) {
    this.prevAccesses = info.prevAccesses;
    this.nextAccesses = info.nextAccesses;
    this.type = info.type;
    return this;
  };
  return GeneralBarrierInfo;
}();
var TextureBarrierInfo = function () {
  function TextureBarrierInfo(prevAccesses, nextAccesses, type, range, discardContents, srcQueue, dstQueue) {
    if (prevAccesses === void 0) {
      prevAccesses = AccessFlagBit.NONE;
    }
    if (nextAccesses === void 0) {
      nextAccesses = AccessFlagBit.NONE;
    }
    if (type === void 0) {
      type = BarrierType.FULL;
    }
    if (range === void 0) {
      range = new ResourceRange();
    }
    if (discardContents === void 0) {
      discardContents = false;
    }
    if (srcQueue === void 0) {
      srcQueue = null;
    }
    if (dstQueue === void 0) {
      dstQueue = null;
    }
    this.prevAccesses = prevAccesses;
    this.nextAccesses = nextAccesses;
    this.type = type;
    this.range = range;
    this.discardContents = discardContents;
    this.srcQueue = srcQueue;
    this.dstQueue = dstQueue;
  }
  var _proto43 = TextureBarrierInfo.prototype;
  _proto43.copy = function copy(info) {
    this.prevAccesses = info.prevAccesses;
    this.nextAccesses = info.nextAccesses;
    this.type = info.type;
    this.range.copy(info.range);
    this.discardContents = info.discardContents;
    this.srcQueue = info.srcQueue;
    this.dstQueue = info.dstQueue;
    return this;
  };
  return TextureBarrierInfo;
}();
var BufferBarrierInfo = function () {
  function BufferBarrierInfo(prevAccesses, nextAccesses, type, offset, size, discardContents, srcQueue, dstQueue) {
    if (prevAccesses === void 0) {
      prevAccesses = AccessFlagBit.NONE;
    }
    if (nextAccesses === void 0) {
      nextAccesses = AccessFlagBit.NONE;
    }
    if (type === void 0) {
      type = BarrierType.FULL;
    }
    if (offset === void 0) {
      offset = 0;
    }
    if (size === void 0) {
      size = 0;
    }
    if (discardContents === void 0) {
      discardContents = false;
    }
    if (srcQueue === void 0) {
      srcQueue = null;
    }
    if (dstQueue === void 0) {
      dstQueue = null;
    }
    this.prevAccesses = prevAccesses;
    this.nextAccesses = nextAccesses;
    this.type = type;
    this.offset = offset;
    this.size = size;
    this.discardContents = discardContents;
    this.srcQueue = srcQueue;
    this.dstQueue = dstQueue;
  }
  var _proto44 = BufferBarrierInfo.prototype;
  _proto44.copy = function copy(info) {
    this.prevAccesses = info.prevAccesses;
    this.nextAccesses = info.nextAccesses;
    this.type = info.type;
    this.offset = info.offset;
    this.size = info.size;
    this.discardContents = info.discardContents;
    this.srcQueue = info.srcQueue;
    this.dstQueue = info.dstQueue;
    return this;
  };
  return BufferBarrierInfo;
}();
var FramebufferInfo = function () {
  function FramebufferInfo(renderPass, colorTextures, depthStencilTexture, depthStencilResolveTexture) {
    if (renderPass === void 0) {
      renderPass = null;
    }
    if (colorTextures === void 0) {
      colorTextures = [];
    }
    if (depthStencilTexture === void 0) {
      depthStencilTexture = null;
    }
    if (depthStencilResolveTexture === void 0) {
      depthStencilResolveTexture = null;
    }
    this.renderPass = renderPass;
    this.colorTextures = colorTextures;
    this.depthStencilTexture = depthStencilTexture;
    this.depthStencilResolveTexture = depthStencilResolveTexture;
  }
  var _proto45 = FramebufferInfo.prototype;
  _proto45.copy = function copy(info) {
    this.renderPass = info.renderPass;
    this.colorTextures = info.colorTextures.slice();
    this.depthStencilTexture = info.depthStencilTexture;
    this.depthStencilResolveTexture = info.depthStencilResolveTexture;
    return this;
  };
  return FramebufferInfo;
}();
var DescriptorSetLayoutBinding = function () {
  function DescriptorSetLayoutBinding(binding, descriptorType, count, stageFlags, access, viewDimension, sampleType, format, immutableSamplers) {
    if (binding === void 0) {
      binding = -1;
    }
    if (descriptorType === void 0) {
      descriptorType = DescriptorType.UNKNOWN;
    }
    if (count === void 0) {
      count = 0;
    }
    if (stageFlags === void 0) {
      stageFlags = ShaderStageFlagBit.NONE;
    }
    if (access === void 0) {
      access = MemoryAccessBit.READ_ONLY;
    }
    if (viewDimension === void 0) {
      viewDimension = ViewDimension.UNKNOWN;
    }
    if (sampleType === void 0) {
      sampleType = SampleType.FLOAT;
    }
    if (format === void 0) {
      format = Format.UNKNOWN;
    }
    if (immutableSamplers === void 0) {
      immutableSamplers = [];
    }
    this.binding = binding;
    this.descriptorType = descriptorType;
    this.count = count;
    this.stageFlags = stageFlags;
    this.access = access;
    this.viewDimension = viewDimension;
    this.sampleType = sampleType;
    this.format = format;
    this.immutableSamplers = immutableSamplers;
  }
  var _proto46 = DescriptorSetLayoutBinding.prototype;
  _proto46.copy = function copy(info) {
    this.binding = info.binding;
    this.descriptorType = info.descriptorType;
    this.count = info.count;
    this.stageFlags = info.stageFlags;
    this.access = info.access;
    this.viewDimension = info.viewDimension;
    this.sampleType = info.sampleType;
    this.format = info.format;
    this.immutableSamplers = info.immutableSamplers.slice();
    return this;
  };
  return DescriptorSetLayoutBinding;
}();
var DescriptorSetLayoutInfo = function () {
  function DescriptorSetLayoutInfo(bindings) {
    if (bindings === void 0) {
      bindings = [];
    }
    this.bindings = bindings;
  }
  var _proto47 = DescriptorSetLayoutInfo.prototype;
  _proto47.copy = function copy(info) {
    deepCopy(this.bindings, info.bindings, DescriptorSetLayoutBinding);
    return this;
  };
  return DescriptorSetLayoutInfo;
}();
var DescriptorSetInfo = function () {
  function DescriptorSetInfo(layout) {
    if (layout === void 0) {
      layout = null;
    }
    this.layout = layout;
  }
  var _proto48 = DescriptorSetInfo.prototype;
  _proto48.copy = function copy(info) {
    this.layout = info.layout;
    return this;
  };
  return DescriptorSetInfo;
}();
var PipelineLayoutInfo = function () {
  function PipelineLayoutInfo(setLayouts) {
    if (setLayouts === void 0) {
      setLayouts = [];
    }
    this.setLayouts = setLayouts;
  }
  var _proto49 = PipelineLayoutInfo.prototype;
  _proto49.copy = function copy(info) {
    this.setLayouts = info.setLayouts.slice();
    return this;
  };
  return PipelineLayoutInfo;
}();
var InputState = function () {
  function InputState(attributes) {
    if (attributes === void 0) {
      attributes = [];
    }
    this.attributes = attributes;
  }
  var _proto50 = InputState.prototype;
  _proto50.copy = function copy(info) {
    deepCopy(this.attributes, info.attributes, Attribute);
    return this;
  };
  return InputState;
}();
var CommandBufferInfo = function () {
  function CommandBufferInfo(queue, type) {
    if (queue === void 0) {
      queue = null;
    }
    if (type === void 0) {
      type = CommandBufferType.PRIMARY;
    }
    this.queue = queue;
    this.type = type;
  }
  var _proto51 = CommandBufferInfo.prototype;
  _proto51.copy = function copy(info) {
    this.queue = info.queue;
    this.type = info.type;
    return this;
  };
  return CommandBufferInfo;
}();
var QueueInfo = function () {
  function QueueInfo(type) {
    if (type === void 0) {
      type = QueueType.GRAPHICS;
    }
    this.type = type;
  }
  var _proto52 = QueueInfo.prototype;
  _proto52.copy = function copy(info) {
    this.type = info.type;
    return this;
  };
  return QueueInfo;
}();
var QueryPoolInfo = function () {
  function QueryPoolInfo(type, maxQueryObjects, forceWait) {
    if (type === void 0) {
      type = QueryType.OCCLUSION;
    }
    if (maxQueryObjects === void 0) {
      maxQueryObjects = 32767;
    }
    if (forceWait === void 0) {
      forceWait = true;
    }
    this.type = type;
    this.maxQueryObjects = maxQueryObjects;
    this.forceWait = forceWait;
  }
  var _proto53 = QueryPoolInfo.prototype;
  _proto53.copy = function copy(info) {
    this.type = info.type;
    this.maxQueryObjects = info.maxQueryObjects;
    this.forceWait = info.forceWait;
    return this;
  };
  return QueryPoolInfo;
}();
var FormatInfo = function () {
  function FormatInfo(name, size, count, type, hasAlpha, hasDepth, hasStencil, isCompressed) {
    if (name === void 0) {
      name = '';
    }
    if (size === void 0) {
      size = 0;
    }
    if (count === void 0) {
      count = 0;
    }
    if (type === void 0) {
      type = FormatType.NONE;
    }
    if (hasAlpha === void 0) {
      hasAlpha = false;
    }
    if (hasDepth === void 0) {
      hasDepth = false;
    }
    if (hasStencil === void 0) {
      hasStencil = false;
    }
    if (isCompressed === void 0) {
      isCompressed = false;
    }
    this.name = name;
    this.size = size;
    this.count = count;
    this.type = type;
    this.hasAlpha = hasAlpha;
    this.hasDepth = hasDepth;
    this.hasStencil = hasStencil;
    this.isCompressed = isCompressed;
  }
  var _proto54 = FormatInfo.prototype;
  _proto54.copy = function copy(info) {
    this.name = info.name;
    this.size = info.size;
    this.count = info.count;
    this.type = info.type;
    this.hasAlpha = info.hasAlpha;
    this.hasDepth = info.hasDepth;
    this.hasStencil = info.hasStencil;
    this.isCompressed = info.isCompressed;
    return this;
  };
  return FormatInfo;
}();
var MemoryStatus = function () {
  function MemoryStatus(bufferSize, textureSize) {
    if (bufferSize === void 0) {
      bufferSize = 0;
    }
    if (textureSize === void 0) {
      textureSize = 0;
    }
    this.bufferSize = bufferSize;
    this.textureSize = textureSize;
  }
  var _proto55 = MemoryStatus.prototype;
  _proto55.copy = function copy(info) {
    this.bufferSize = info.bufferSize;
    this.textureSize = info.textureSize;
    return this;
  };
  return MemoryStatus;
}();
var DynamicStencilStates = function () {
  function DynamicStencilStates(writeMask, compareMask, reference) {
    if (writeMask === void 0) {
      writeMask = 0;
    }
    if (compareMask === void 0) {
      compareMask = 0;
    }
    if (reference === void 0) {
      reference = 0;
    }
    this.writeMask = writeMask;
    this.compareMask = compareMask;
    this.reference = reference;
  }
  var _proto56 = DynamicStencilStates.prototype;
  _proto56.copy = function copy(info) {
    this.writeMask = info.writeMask;
    this.compareMask = info.compareMask;
    this.reference = info.reference;
    return this;
  };
  return DynamicStencilStates;
}();
var DynamicStates = function () {
  function DynamicStates(viewport, scissor, blendConstant, lineWidth, depthBiasConstant, depthBiasClamp, depthBiasSlope, depthMinBounds, depthMaxBounds, stencilStatesFront, stencilStatesBack) {
    if (viewport === void 0) {
      viewport = new Viewport();
    }
    if (scissor === void 0) {
      scissor = new Rect();
    }
    if (blendConstant === void 0) {
      blendConstant = new Color();
    }
    if (lineWidth === void 0) {
      lineWidth = 1;
    }
    if (depthBiasConstant === void 0) {
      depthBiasConstant = 0;
    }
    if (depthBiasClamp === void 0) {
      depthBiasClamp = 0;
    }
    if (depthBiasSlope === void 0) {
      depthBiasSlope = 0;
    }
    if (depthMinBounds === void 0) {
      depthMinBounds = 0;
    }
    if (depthMaxBounds === void 0) {
      depthMaxBounds = 0;
    }
    if (stencilStatesFront === void 0) {
      stencilStatesFront = new DynamicStencilStates();
    }
    if (stencilStatesBack === void 0) {
      stencilStatesBack = new DynamicStencilStates();
    }
    this.viewport = viewport;
    this.scissor = scissor;
    this.blendConstant = blendConstant;
    this.lineWidth = lineWidth;
    this.depthBiasConstant = depthBiasConstant;
    this.depthBiasClamp = depthBiasClamp;
    this.depthBiasSlope = depthBiasSlope;
    this.depthMinBounds = depthMinBounds;
    this.depthMaxBounds = depthMaxBounds;
    this.stencilStatesFront = stencilStatesFront;
    this.stencilStatesBack = stencilStatesBack;
  }
  var _proto57 = DynamicStates.prototype;
  _proto57.copy = function copy(info) {
    this.viewport.copy(info.viewport);
    this.scissor.copy(info.scissor);
    this.blendConstant.copy(info.blendConstant);
    this.lineWidth = info.lineWidth;
    this.depthBiasConstant = info.depthBiasConstant;
    this.depthBiasClamp = info.depthBiasClamp;
    this.depthBiasSlope = info.depthBiasSlope;
    this.depthMinBounds = info.depthMinBounds;
    this.depthMaxBounds = info.depthMaxBounds;
    this.stencilStatesFront.copy(info.stencilStatesFront);
    this.stencilStatesBack.copy(info.stencilStatesBack);
    return this;
  };
  return DynamicStates;
}();
var GFXObject = function (_GCObject) {
  function GFXObject(objectType) {
    var _this;
    _this = _GCObject.call(this) || this;
    _this._objectType = ObjectType.UNKNOWN;
    _this._objectID = 0;
    _this._typedID = 0;
    _this._objectType = objectType;
    _this._objectID = GFXObject._idTable[ObjectType.UNKNOWN]++;
    _this._typedID = GFXObject._idTable[objectType]++;
    return _this;
  }
  _inheritsLoose(GFXObject, _GCObject);
  return _createClass(GFXObject, [{
    key: "objectType",
    get: function get() {
      return this._objectType;
    }
  }, {
    key: "objectID",
    get: function get() {
      return this._objectID;
    }
  }, {
    key: "typedID",
    get: function get() {
      return this._typedID;
    }
  }]);
}(GCObject);
GFXObject._idTable = Array(ObjectType.COUNT).fill(1 << 16);
var AttributeName;
(function (AttributeName) {
  AttributeName["ATTR_POSITION"] = "a_position";
  AttributeName["ATTR_NORMAL"] = "a_normal";
  AttributeName["ATTR_TANGENT"] = "a_tangent";
  AttributeName["ATTR_BITANGENT"] = "a_bitangent";
  AttributeName["ATTR_WEIGHTS"] = "a_weights";
  AttributeName["ATTR_JOINTS"] = "a_joints";
  AttributeName["ATTR_COLOR"] = "a_color";
  AttributeName["ATTR_COLOR1"] = "a_color1";
  AttributeName["ATTR_COLOR2"] = "a_color2";
  AttributeName["ATTR_TEX_COORD"] = "a_texCoord";
  AttributeName["ATTR_TEX_COORD1"] = "a_texCoord1";
  AttributeName["ATTR_TEX_COORD2"] = "a_texCoord2";
  AttributeName["ATTR_TEX_COORD3"] = "a_texCoord3";
  AttributeName["ATTR_TEX_COORD4"] = "a_texCoord4";
  AttributeName["ATTR_TEX_COORD5"] = "a_texCoord5";
  AttributeName["ATTR_TEX_COORD6"] = "a_texCoord6";
  AttributeName["ATTR_TEX_COORD7"] = "a_texCoord7";
  AttributeName["ATTR_TEX_COORD8"] = "a_texCoord8";
  AttributeName["ATTR_BATCH_ID"] = "a_batch_id";
  AttributeName["ATTR_BATCH_UV"] = "a_batch_uv";
})(AttributeName || (AttributeName = {}));
function createFormatInfo(name, size, count, type, hasAlpha, hasDepth, hasStencil, isCompressed) {
  return new FormatInfo(name, size, count, type, hasAlpha, hasDepth, hasStencil, isCompressed);
}
function createFormatInfo_ASTC_SRGBA(nameSuffix) {
  return new FormatInfo("ASTC_SRGBA_" + nameSuffix, 1, 4, FormatType.UNORM, true, false, false, true);
}
function createFormatInfo_ASTC_RGBA(nameSuffix) {
  return new FormatInfo("ASTC_RGBA_" + nameSuffix, 1, 4, FormatType.UNORM, true, false, false, true);
}
var FormatInfos = Object.freeze([createFormatInfo('UNKNOWN'), createFormatInfo('A8', 1, 1, FormatType.UNORM, true), createFormatInfo('L8', 1, 1, FormatType.UNORM), createFormatInfo('LA8', 1, 2, FormatType.UNORM, true), createFormatInfo('R8', 1, 1, FormatType.UNORM), createFormatInfo('R8SN', 1, 1, FormatType.SNORM), createFormatInfo('R8UI', 1, 1, FormatType.UINT), createFormatInfo('R8I', 1, 1, FormatType.INT), createFormatInfo('R16F', 2, 1, FormatType.FLOAT), createFormatInfo('R16UI', 2, 1, FormatType.UINT), createFormatInfo('R16I', 2, 1, FormatType.INT), createFormatInfo('R32F', 4, 1, FormatType.FLOAT), createFormatInfo('R32UI', 4, 1, FormatType.UINT), createFormatInfo('R32I', 4, 1, FormatType.INT), createFormatInfo('RG8', 2, 2, FormatType.UNORM), createFormatInfo('RG8SN', 2, 2, FormatType.SNORM), createFormatInfo('RG8UI', 2, 2, FormatType.UINT), createFormatInfo('RG8I', 2, 2, FormatType.INT), createFormatInfo('RG16F', 4, 2, FormatType.FLOAT), createFormatInfo('RG16UI', 4, 2, FormatType.UINT), createFormatInfo('RG16I', 4, 2, FormatType.INT), createFormatInfo('RG32F', 8, 2, FormatType.FLOAT), createFormatInfo('RG32UI', 8, 2, FormatType.UINT), createFormatInfo('RG32I', 8, 2, FormatType.INT), createFormatInfo('RGB8', 3, 3, FormatType.UNORM), createFormatInfo('SRGB8', 3, 3, FormatType.UNORM), createFormatInfo('RGB8SN', 3, 3, FormatType.SNORM), createFormatInfo('RGB8UI', 3, 3, FormatType.UINT), createFormatInfo('RGB8I', 3, 3, FormatType.INT), createFormatInfo('RGB16F', 6, 3, FormatType.FLOAT), createFormatInfo('RGB16UI', 6, 3, FormatType.UINT), createFormatInfo('RGB16I', 6, 3, FormatType.INT), createFormatInfo('RGB32F', 12, 3, FormatType.FLOAT), createFormatInfo('RGB32UI', 12, 3, FormatType.UINT), createFormatInfo('RGB32I', 12, 3, FormatType.INT), createFormatInfo('RGBA8', 4, 4, FormatType.UNORM, true), createFormatInfo('BGRA8', 4, 4, FormatType.UNORM, true), createFormatInfo('SRGB8_A8', 4, 4, FormatType.UNORM, true), createFormatInfo('RGBA8SN', 4, 4, FormatType.SNORM, true), createFormatInfo('RGBA8UI', 4, 4, FormatType.UINT, true), createFormatInfo('RGBA8I', 4, 4, FormatType.INT, true), createFormatInfo('RGBA16F', 8, 4, FormatType.FLOAT, true), createFormatInfo('RGBA16UI', 8, 4, FormatType.UINT, true), createFormatInfo('RGBA16I', 8, 4, FormatType.INT, true), createFormatInfo('RGBA32F', 16, 4, FormatType.FLOAT, true), createFormatInfo('RGBA32UI', 16, 4, FormatType.UINT, true), createFormatInfo('RGBA32I', 16, 4, FormatType.INT, true), createFormatInfo('R5G6B5', 2, 3, FormatType.UNORM), createFormatInfo('R11G11B10F', 4, 3, FormatType.FLOAT), createFormatInfo('RGB5A1', 2, 4, FormatType.UNORM, true), createFormatInfo('RGBA4', 2, 4, FormatType.UNORM, true), createFormatInfo('RGB10A2', 2, 4, FormatType.UNORM, true), createFormatInfo('RGB10A2UI', 2, 4, FormatType.UINT, true), createFormatInfo('RGB9E5', 2, 4, FormatType.FLOAT, true), createFormatInfo('DEPTH', 4, 1, FormatType.FLOAT, false, true), createFormatInfo('DEPTH_STENCIL', 5, 2, FormatType.FLOAT, false, true, true), createFormatInfo('BC1', 1, 3, FormatType.UNORM, false, false, false, true), createFormatInfo('BC1_ALPHA', 1, 4, FormatType.UNORM, true, false, false, true), createFormatInfo('BC1_SRGB', 1, 3, FormatType.UNORM, false, false, false, true), createFormatInfo('BC1_SRGB_ALPHA', 1, 4, FormatType.UNORM, true, false, false, true), createFormatInfo('BC2', 1, 4, FormatType.UNORM, true, false, false, true), createFormatInfo('BC2_SRGB', 1, 4, FormatType.UNORM, true, false, false, true), createFormatInfo('BC3', 1, 4, FormatType.UNORM, true, false, false, true), createFormatInfo('BC3_SRGB', 1, 4, FormatType.UNORM, true, false, false, true), createFormatInfo('BC4', 1, 1, FormatType.UNORM, false, false, false, true), createFormatInfo('BC4_SNORM', 1, 1, FormatType.SNORM, false, false, false, true), createFormatInfo('BC5', 1, 2, FormatType.UNORM, false, false, false, true), createFormatInfo('BC5_SNORM', 1, 2, FormatType.SNORM, false, false, false, true), createFormatInfo('BC6H_UF16', 1, 3, FormatType.UFLOAT, false, false, false, true), createFormatInfo('BC6H_SF16', 1, 3, FormatType.FLOAT, false, false, false, true), createFormatInfo('BC7', 1, 4, FormatType.UNORM, true, false, false, true), createFormatInfo('BC7_SRGB', 1, 4, FormatType.UNORM, true, false, false, true), createFormatInfo('ETC_RGB8', 1, 3, FormatType.UNORM, false, false, false, true), createFormatInfo('ETC2_RGB8', 1, 3, FormatType.UNORM, false, false, false, true), createFormatInfo('ETC2_SRGB8', 1, 3, FormatType.UNORM, false, false, false, true), createFormatInfo('ETC2_RGB8_A1', 1, 4, FormatType.UNORM, true, false, false, true), createFormatInfo('ETC2_SRGB8_A1', 1, 4, FormatType.UNORM, true, false, false, true), createFormatInfo('ETC2_RGBA8', 2, 4, FormatType.UNORM, true, false, false, true), createFormatInfo('ETC2_SRGB8_A8', 2, 4, FormatType.UNORM, true, false, false, true), createFormatInfo('EAC_R11', 1, 1, FormatType.UNORM, false, false, false, true), createFormatInfo('EAC_R11SN', 1, 1, FormatType.SNORM, false, false, false, true), createFormatInfo('EAC_RG11', 2, 2, FormatType.UNORM, false, false, false, true), createFormatInfo('EAC_RG11SN', 2, 2, FormatType.SNORM, false, false, false, true), createFormatInfo('PVRTC_RGB2', 2, 3, FormatType.UNORM, false, false, false, true), createFormatInfo('PVRTC_RGBA2', 2, 4, FormatType.UNORM, true, false, false, true), createFormatInfo('PVRTC_RGB4', 2, 3, FormatType.UNORM, false, false, false, true), createFormatInfo('PVRTC_RGBA4', 2, 4, FormatType.UNORM, true, false, false, true), createFormatInfo('PVRTC2_2BPP', 2, 4, FormatType.UNORM, true, false, false, true), createFormatInfo('PVRTC2_4BPP', 2, 4, FormatType.UNORM, true, false, false, true), createFormatInfo_ASTC_RGBA('4x4'), createFormatInfo_ASTC_RGBA('5x4'), createFormatInfo_ASTC_RGBA('5x5'), createFormatInfo_ASTC_RGBA('6x5'), createFormatInfo_ASTC_RGBA('6x6'), createFormatInfo_ASTC_RGBA('8x5'), createFormatInfo_ASTC_RGBA('8x6'), createFormatInfo_ASTC_RGBA('8x8'), createFormatInfo_ASTC_RGBA('10x5'), createFormatInfo_ASTC_RGBA('10x6'), createFormatInfo_ASTC_RGBA('10x8'), createFormatInfo_ASTC_RGBA('10x10'), createFormatInfo_ASTC_RGBA('12x10'), createFormatInfo_ASTC_RGBA('12x12'), createFormatInfo_ASTC_SRGBA('4x4'), createFormatInfo_ASTC_SRGBA('5x4'), createFormatInfo_ASTC_SRGBA('5x5'), createFormatInfo_ASTC_SRGBA('6x5'), createFormatInfo_ASTC_SRGBA('6x6'), createFormatInfo_ASTC_SRGBA('8x5'), createFormatInfo_ASTC_SRGBA('8x6'), createFormatInfo_ASTC_SRGBA('8x8'), createFormatInfo_ASTC_SRGBA('10x5'), createFormatInfo_ASTC_SRGBA('10x6'), createFormatInfo_ASTC_SRGBA('10x8'), createFormatInfo_ASTC_SRGBA('10x10'), createFormatInfo_ASTC_SRGBA('12x10'), createFormatInfo_ASTC_SRGBA('12x12')]);
var DESCRIPTOR_BUFFER_TYPE = DescriptorType.UNIFORM_BUFFER | DescriptorType.DYNAMIC_UNIFORM_BUFFER | DescriptorType.STORAGE_BUFFER | DescriptorType.DYNAMIC_STORAGE_BUFFER;
var DESCRIPTOR_SAMPLER_TYPE = DescriptorType.SAMPLER_TEXTURE | DescriptorType.SAMPLER | DescriptorType.TEXTURE | DescriptorType.STORAGE_IMAGE | DescriptorType.INPUT_ATTACHMENT;
var DESCRIPTOR_DYNAMIC_TYPE = DescriptorType.DYNAMIC_STORAGE_BUFFER | DescriptorType.DYNAMIC_UNIFORM_BUFFER;
var DESCRIPTOR_STORAGE_BUFFER_TYPE = DescriptorType.STORAGE_BUFFER | DescriptorType.DYNAMIC_STORAGE_BUFFER;
var DRAW_INFO_SIZE = 28;
function IsPowerOf2(x) {
  return x > 0 && (x & x - 1) === 0;
}
var ceil = Math.ceil;
function FormatSize(format, width, height, depth) {
  if (!FormatInfos[format].isCompressed) {
    return width * height * depth * FormatInfos[format].size;
  } else {
    switch (format) {
      case Format.BC1:
      case Format.BC1_ALPHA:
      case Format.BC1_SRGB:
      case Format.BC1_SRGB_ALPHA:
        return ceil(width / 4) * ceil(height / 4) * 8 * depth;
      case Format.BC2:
      case Format.BC2_SRGB:
      case Format.BC3:
      case Format.BC3_SRGB:
      case Format.BC4:
      case Format.BC4_SNORM:
      case Format.BC6H_SF16:
      case Format.BC6H_UF16:
      case Format.BC7:
      case Format.BC7_SRGB:
        return ceil(width / 4) * ceil(height / 4) * 16 * depth;
      case Format.BC5:
      case Format.BC5_SNORM:
        return ceil(width / 4) * ceil(height / 4) * 32 * depth;
      case Format.ETC_RGB8:
      case Format.ETC2_RGB8:
      case Format.ETC2_SRGB8:
      case Format.ETC2_RGB8_A1:
      case Format.EAC_R11:
      case Format.EAC_R11SN:
        return ceil(width / 4) * ceil(height / 4) * 8 * depth;
      case Format.ETC2_RGBA8:
      case Format.ETC2_SRGB8_A1:
      case Format.EAC_RG11:
      case Format.EAC_RG11SN:
        return ceil(width / 4) * ceil(height / 4) * 16 * depth;
      case Format.PVRTC_RGB2:
      case Format.PVRTC_RGBA2:
      case Format.PVRTC2_2BPP:
        return ceil(width / 8) * ceil(height / 4) * 8 * depth;
      case Format.PVRTC_RGB4:
      case Format.PVRTC_RGBA4:
      case Format.PVRTC2_4BPP:
        return ceil(width / 4) * ceil(height / 4) * 8 * depth;
      case Format.ASTC_RGBA_4X4:
      case Format.ASTC_SRGBA_4X4:
        return ceil(width / 4) * ceil(height / 4) * 16 * depth;
      case Format.ASTC_RGBA_5X4:
      case Format.ASTC_SRGBA_5X4:
        return ceil(width / 5) * ceil(height / 4) * 16 * depth;
      case Format.ASTC_RGBA_5X5:
      case Format.ASTC_SRGBA_5X5:
        return ceil(width / 5) * ceil(height / 5) * 16 * depth;
      case Format.ASTC_RGBA_6X5:
      case Format.ASTC_SRGBA_6X5:
        return ceil(width / 6) * ceil(height / 5) * 16 * depth;
      case Format.ASTC_RGBA_6X6:
      case Format.ASTC_SRGBA_6X6:
        return ceil(width / 6) * ceil(height / 6) * 16 * depth;
      case Format.ASTC_RGBA_8X5:
      case Format.ASTC_SRGBA_8X5:
        return ceil(width / 8) * ceil(height / 5) * 16 * depth;
      case Format.ASTC_RGBA_8X6:
      case Format.ASTC_SRGBA_8X6:
        return ceil(width / 8) * ceil(height / 6) * 16 * depth;
      case Format.ASTC_RGBA_8X8:
      case Format.ASTC_SRGBA_8X8:
        return ceil(width / 8) * ceil(height / 8) * 16 * depth;
      case Format.ASTC_RGBA_10X5:
      case Format.ASTC_SRGBA_10X5:
        return ceil(width / 10) * ceil(height / 5) * 16 * depth;
      case Format.ASTC_RGBA_10X6:
      case Format.ASTC_SRGBA_10X6:
        return ceil(width / 10) * ceil(height / 6) * 16 * depth;
      case Format.ASTC_RGBA_10X8:
      case Format.ASTC_SRGBA_10X8:
        return ceil(width / 10) * ceil(height / 8) * 16 * depth;
      case Format.ASTC_RGBA_10X10:
      case Format.ASTC_SRGBA_10X10:
        return ceil(width / 10) * ceil(height / 10) * 16 * depth;
      case Format.ASTC_RGBA_12X10:
      case Format.ASTC_SRGBA_12X10:
        return ceil(width / 12) * ceil(height / 10) * 16 * depth;
      case Format.ASTC_RGBA_12X12:
      case Format.ASTC_SRGBA_12X12:
        return ceil(width / 12) * ceil(height / 12) * 16 * depth;
      default:
        {
          return 0;
        }
    }
  }
}
function FormatSurfaceSize(format, width, height, depth, mips) {
  var size = 0;
  for (var i = 0; i < mips; ++i) {
    size += FormatSize(format, width, height, depth);
    width = Math.max(width >> 1, 1);
    height = Math.max(height >> 1, 1);
  }
  return size;
}
var _type2size = [0, 4, 8, 12, 16, 4, 8, 12, 16, 4, 8, 12, 16, 4, 8, 12, 16, 16, 24, 32, 24, 36, 48, 32, 48, 64, 4, 4, 4, 4, 4, 4];
function GetTypeSize(type) {
  return _type2size[type] || 0;
}
function getTypedArrayConstructor(info) {
  if (info.isCompressed) {
    return Uint8Array;
  }
  var stride = info.size / info.count;
  switch (info.type) {
    case FormatType.UNORM:
    case FormatType.UINT:
      {
        switch (stride) {
          case 1:
            return Uint8Array;
          case 2:
            return Uint16Array;
          case 4:
            return Uint32Array;
          default:
            return Uint8Array;
        }
      }
    case FormatType.SNORM:
    case FormatType.INT:
      {
        switch (stride) {
          case 1:
            return Int8Array;
          case 2:
            return Int16Array;
          case 4:
            return Int32Array;
          default:
            return Int8Array;
        }
      }
    case FormatType.FLOAT:
      {
        switch (stride) {
          case 2:
            return Uint16Array;
          case 4:
            return Float32Array;
          default:
            return Float32Array;
        }
      }
  }
  return Float32Array;
}
function formatAlignment(format) {
  switch (format) {
    case Format.BC1:
    case Format.BC1_ALPHA:
    case Format.BC1_SRGB:
    case Format.BC1_SRGB_ALPHA:
    case Format.BC2:
    case Format.BC2_SRGB:
    case Format.BC3:
    case Format.BC3_SRGB:
    case Format.BC4:
    case Format.BC4_SNORM:
    case Format.BC6H_SF16:
    case Format.BC6H_UF16:
    case Format.BC7:
    case Format.BC7_SRGB:
    case Format.BC5:
    case Format.BC5_SNORM:
    case Format.ETC_RGB8:
    case Format.ETC2_RGB8:
    case Format.ETC2_SRGB8:
    case Format.ETC2_RGB8_A1:
    case Format.EAC_R11:
    case Format.EAC_R11SN:
    case Format.ETC2_RGBA8:
    case Format.ETC2_SRGB8_A1:
    case Format.EAC_RG11:
    case Format.EAC_RG11SN:
      return {
        width: 4,
        height: 4
      };
    case Format.PVRTC_RGB2:
    case Format.PVRTC_RGBA2:
    case Format.PVRTC2_2BPP:
      return {
        width: 8,
        height: 4
      };
    case Format.PVRTC_RGB4:
    case Format.PVRTC_RGBA4:
    case Format.PVRTC2_4BPP:
      return {
        width: 4,
        height: 4
      };
    case Format.ASTC_RGBA_4X4:
    case Format.ASTC_SRGBA_4X4:
      return {
        width: 4,
        height: 4
      };
    case Format.ASTC_RGBA_5X4:
    case Format.ASTC_SRGBA_5X4:
      return {
        width: 5,
        height: 4
      };
    case Format.ASTC_RGBA_5X5:
    case Format.ASTC_SRGBA_5X5:
      return {
        width: 5,
        height: 5
      };
    case Format.ASTC_RGBA_6X5:
    case Format.ASTC_SRGBA_6X5:
      return {
        width: 6,
        height: 5
      };
    case Format.ASTC_RGBA_6X6:
    case Format.ASTC_SRGBA_6X6:
      return {
        width: 6,
        height: 6
      };
    case Format.ASTC_RGBA_8X5:
    case Format.ASTC_SRGBA_8X5:
      return {
        width: 8,
        height: 5
      };
    case Format.ASTC_RGBA_8X6:
    case Format.ASTC_SRGBA_8X6:
      return {
        width: 8,
        height: 6
      };
    case Format.ASTC_RGBA_8X8:
    case Format.ASTC_SRGBA_8X8:
      return {
        width: 8,
        height: 8
      };
    case Format.ASTC_RGBA_10X5:
    case Format.ASTC_SRGBA_10X5:
      return {
        width: 10,
        height: 5
      };
    case Format.ASTC_RGBA_10X6:
    case Format.ASTC_SRGBA_10X6:
      return {
        width: 10,
        height: 6
      };
    case Format.ASTC_RGBA_10X8:
    case Format.ASTC_SRGBA_10X8:
      return {
        width: 10,
        height: 8
      };
    case Format.ASTC_RGBA_10X10:
    case Format.ASTC_SRGBA_10X10:
      return {
        width: 10,
        height: 10
      };
    case Format.ASTC_RGBA_12X10:
    case Format.ASTC_SRGBA_12X10:
      return {
        width: 12,
        height: 10
      };
    case Format.ASTC_RGBA_12X12:
    case Format.ASTC_SRGBA_12X12:
      return {
        width: 12,
        height: 12
      };
    default:
      return {
        width: 1,
        height: 1
      };
  }
}
function alignTo(size, alignment) {
  return ceil(size / alignment) * alignment;
}

var defines = /*#__PURE__*/Object.freeze({
  __proto__: null,
  get API () { return API; },
  get AccessFlagBit () { return AccessFlagBit; },
  get Address () { return Address; },
  Attribute: Attribute,
  get AttributeName () { return AttributeName; },
  get BarrierType () { return BarrierType; },
  BindingMappingInfo: BindingMappingInfo,
  get BlendFactor () { return BlendFactor; },
  get BlendOp () { return BlendOp; },
  BufferBarrierInfo: BufferBarrierInfo,
  get BufferFlagBit () { return BufferFlagBit; },
  BufferInfo: BufferInfo,
  BufferTextureCopy: BufferTextureCopy,
  get BufferUsageBit () { return BufferUsageBit; },
  BufferViewInfo: BufferViewInfo,
  get ClearFlagBit () { return ClearFlagBit; },
  Color: Color,
  ColorAttachment: ColorAttachment,
  get ColorMask () { return ColorMask; },
  CommandBufferInfo: CommandBufferInfo,
  get CommandBufferType () { return CommandBufferType; },
  get ComparisonFunc () { return ComparisonFunc; },
  get CullMode () { return CullMode; },
  DESCRIPTOR_BUFFER_TYPE: DESCRIPTOR_BUFFER_TYPE,
  DESCRIPTOR_DYNAMIC_TYPE: DESCRIPTOR_DYNAMIC_TYPE,
  DESCRIPTOR_SAMPLER_TYPE: DESCRIPTOR_SAMPLER_TYPE,
  DESCRIPTOR_STORAGE_BUFFER_TYPE: DESCRIPTOR_STORAGE_BUFFER_TYPE,
  DRAW_INFO_SIZE: DRAW_INFO_SIZE,
  DepthStencilAttachment: DepthStencilAttachment,
  DescriptorSetInfo: DescriptorSetInfo,
  DescriptorSetLayoutBinding: DescriptorSetLayoutBinding,
  DescriptorSetLayoutInfo: DescriptorSetLayoutInfo,
  get DescriptorType () { return DescriptorType; },
  DeviceCaps: DeviceCaps,
  DeviceInfo: DeviceInfo,
  DeviceOptions: DeviceOptions,
  DispatchInfo: DispatchInfo,
  DrawInfo: DrawInfo,
  get DynamicStateFlagBit () { return DynamicStateFlagBit; },
  DynamicStates: DynamicStates,
  DynamicStencilStates: DynamicStencilStates,
  Extent: Extent,
  get Feature () { return Feature; },
  get Filter () { return Filter; },
  get Format () { return Format; },
  get FormatFeatureBit () { return FormatFeatureBit; },
  FormatInfo: FormatInfo,
  FormatInfos: FormatInfos,
  FormatSize: FormatSize,
  FormatSurfaceSize: FormatSurfaceSize,
  get FormatType () { return FormatType; },
  FramebufferInfo: FramebufferInfo,
  GFXObject: GFXObject,
  GeneralBarrierInfo: GeneralBarrierInfo,
  GetTypeSize: GetTypeSize,
  IndirectBuffer: IndirectBuffer,
  InputAssemblerInfo: InputAssemblerInfo,
  InputState: InputState,
  IsPowerOf2: IsPowerOf2,
  get LoadOp () { return LoadOp; },
  MarkerInfo: MarkerInfo,
  get MemoryAccessBit () { return MemoryAccessBit; },
  MemoryStatus: MemoryStatus,
  get MemoryUsageBit () { return MemoryUsageBit; },
  get ObjectType () { return ObjectType; },
  Offset: Offset,
  get PassType () { return PassType; },
  get PipelineBindPoint () { return PipelineBindPoint; },
  PipelineLayoutInfo: PipelineLayoutInfo,
  get PolygonMode () { return PolygonMode; },
  get PrimitiveMode () { return PrimitiveMode; },
  QueryPoolInfo: QueryPoolInfo,
  get QueryType () { return QueryType; },
  QueueInfo: QueueInfo,
  get QueueType () { return QueueType; },
  Rect: Rect,
  RenderPassInfo: RenderPassInfo,
  get ResolveMode () { return ResolveMode; },
  ResourceRange: ResourceRange,
  get SampleCount () { return SampleCount; },
  get SampleType () { return SampleType; },
  SamplerInfo: SamplerInfo,
  get ShadeModel () { return ShadeModel; },
  ShaderInfo: ShaderInfo,
  ShaderStage: ShaderStage,
  get ShaderStageFlagBit () { return ShaderStageFlagBit; },
  Size: Size,
  get Status () { return Status; },
  get StencilFace () { return StencilFace; },
  get StencilOp () { return StencilOp; },
  get StoreOp () { return StoreOp; },
  SubpassDependency: SubpassDependency,
  SubpassInfo: SubpassInfo,
  get SurfaceTransform () { return SurfaceTransform; },
  SwapchainInfo: SwapchainInfo,
  TextureBarrierInfo: TextureBarrierInfo,
  TextureBlit: TextureBlit,
  TextureCopy: TextureCopy,
  get TextureFlagBit () { return TextureFlagBit; },
  TextureInfo: TextureInfo,
  TextureSubresLayers: TextureSubresLayers,
  TextureSubresRange: TextureSubresRange,
  get TextureType () { return TextureType; },
  get TextureUsageBit () { return TextureUsageBit; },
  TextureViewInfo: TextureViewInfo,
  get Type () { return Type; },
  Uniform: Uniform,
  UniformBlock: UniformBlock,
  UniformInputAttachment: UniformInputAttachment,
  UniformSampler: UniformSampler,
  UniformSamplerTexture: UniformSamplerTexture,
  UniformStorageBuffer: UniformStorageBuffer,
  UniformStorageImage: UniformStorageImage,
  UniformTexture: UniformTexture,
  get ViewDimension () { return ViewDimension; },
  Viewport: Viewport,
  get VsyncMode () { return VsyncMode; },
  alignTo: alignTo,
  formatAlignment: formatAlignment,
  getTypedArrayConstructor: getTypedArrayConstructor
});

var Buffer = function (_GFXObject) {
  function Buffer() {
    var _this;
    _this = _GFXObject.call(this, ObjectType.BUFFER) || this;
    _this._usage = BufferUsageBit.NONE;
    _this._memUsage = MemoryUsageBit.NONE;
    _this._size = 0;
    _this._stride = 1;
    _this._count = 0;
    _this._flags = BufferFlagBit.NONE;
    _this._isBufferView = false;
    return _this;
  }
  _inheritsLoose(Buffer, _GFXObject);
  return _createClass(Buffer, [{
    key: "usage",
    get: function get() {
      return this._usage;
    }
  }, {
    key: "memUsage",
    get: function get() {
      return this._memUsage;
    }
  }, {
    key: "size",
    get: function get() {
      return this._size;
    }
  }, {
    key: "stride",
    get: function get() {
      return this._stride;
    }
  }, {
    key: "count",
    get: function get() {
      return this._count;
    }
  }, {
    key: "flags",
    get: function get() {
      return this._flags;
    }
  }]);
}(GFXObject);

var CommandBuffer = function (_GFXObject) {
  function CommandBuffer() {
    var _this;
    _this = _GFXObject.call(this, ObjectType.COMMAND_BUFFER) || this;
    _this._queue = null;
    _this._type = CommandBufferType.PRIMARY;
    _this._numDrawCalls = 0;
    _this._numInstances = 0;
    _this._numTris = 0;
    return _this;
  }
  _inheritsLoose(CommandBuffer, _GFXObject);
  return _createClass(CommandBuffer, [{
    key: "type",
    get: function get() {
      return this._type;
    }
  }, {
    key: "queue",
    get: function get() {
      return this._queue;
    }
  }, {
    key: "numDrawCalls",
    get: function get() {
      return this._numDrawCalls;
    }
  }, {
    key: "numInstances",
    get: function get() {
      return this._numInstances;
    }
  }, {
    key: "numTris",
    get: function get() {
      return this._numTris;
    }
  }]);
}(GFXObject);

var Device = function () {
  function Device() {
    this._gfxAPI = API.UNKNOWN;
    this._renderer = '';
    this._vendor = '';
    this._features = new Array(Feature.COUNT);
    this._formatFeatures = new Array(Format.COUNT);
    this._queue = null;
    this._cmdBuff = null;
    this._numDrawCalls = 0;
    this._numInstances = 0;
    this._numTris = 0;
    this._memoryStatus = new MemoryStatus();
    this._caps = new DeviceCaps();
    this._bindingMappingInfo = new BindingMappingInfo();
    this._samplers = new Map();
    this._generalBarrierss = new Map();
    this._textureBarriers = new Map();
    this._bufferBarriers = new Map();
    this._swapchainFormat = Format.RGBA8;
  }
  var _proto = Device.prototype;
  _proto.hasFeature = function hasFeature(feature) {
    return this._features[feature];
  };
  _proto.getFormatFeatures = function getFormatFeatures(format) {
    return this._formatFeatures[format];
  };
  _proto.enableAutoBarrier = function enableAutoBarrier(en) {};
  _proto.getMaxSampleCount = function getMaxSampleCount(format, usage, flags) {
    return SampleCount.X1;
  };
  return _createClass(Device, [{
    key: "gfxAPI",
    get: function get() {
      return this._gfxAPI;
    }
  }, {
    key: "queue",
    get: function get() {
      return this._queue;
    }
  }, {
    key: "commandBuffer",
    get: function get() {
      return this._cmdBuff;
    }
  }, {
    key: "swapchainFormat",
    get: function get() {
      return this._swapchainFormat;
    }
  }, {
    key: "renderer",
    get: function get() {
      return this._renderer;
    }
  }, {
    key: "vendor",
    get: function get() {
      return this._vendor;
    }
  }, {
    key: "numDrawCalls",
    get: function get() {
      return this._numDrawCalls;
    }
  }, {
    key: "numInstances",
    get: function get() {
      return this._numInstances;
    }
  }, {
    key: "numTris",
    get: function get() {
      return this._numTris;
    }
  }, {
    key: "memoryStatus",
    get: function get() {
      return this._memoryStatus;
    }
  }, {
    key: "capabilities",
    get: function get() {
      return this._caps;
    }
  }, {
    key: "bindingMappingInfo",
    get: function get() {
      return this._bindingMappingInfo;
    }
  }]);
}();
Device.canvas = void 0;
var DefaultResource = function () {
  function DefaultResource(device) {
    this._texture2D = null;
    this._texture3D = null;
    this._textureCube = null;
    this._texture2DArray = null;
    var capabilities = device.capabilities;
    var bufferSize = 64;
    var buffer = new Uint8Array(bufferSize);
    buffer.fill(255);
    if (capabilities.maxTextureSize >= 2) {
      this._texture2D = device.createTexture(new TextureInfo(TextureType.TEX2D, TextureUsageBit.STORAGE | TextureUsageBit.SAMPLED, Format.RGBA8, 2, 2, TextureFlagBit.NONE));
      var copyRegion = new BufferTextureCopy(0, 0, 0, new Offset(0, 0, 0), new Extent(2, 2, 1));
      device.copyBuffersToTexture([buffer], this._texture2D, [copyRegion]);
    }
    if (capabilities.maxTextureSize >= 2) {
      this._textureCube = device.createTexture(new TextureInfo(TextureType.CUBE, TextureUsageBit.STORAGE | TextureUsageBit.SAMPLED, Format.RGBA8, 2, 2, TextureFlagBit.NONE, 6));
      var _copyRegion = new BufferTextureCopy(0, 0, 0, new Offset(0, 0, 0), new Extent(2, 2, 1));
      device.copyBuffersToTexture([buffer], this._textureCube, [_copyRegion]);
      _copyRegion.texSubres.baseArrayLayer = 1;
      device.copyBuffersToTexture([buffer], this._textureCube, [_copyRegion]);
      _copyRegion.texSubres.baseArrayLayer = 2;
      device.copyBuffersToTexture([buffer], this._textureCube, [_copyRegion]);
      _copyRegion.texSubres.baseArrayLayer = 3;
      device.copyBuffersToTexture([buffer], this._textureCube, [_copyRegion]);
      _copyRegion.texSubres.baseArrayLayer = 4;
      device.copyBuffersToTexture([buffer], this._textureCube, [_copyRegion]);
      _copyRegion.texSubres.baseArrayLayer = 5;
      device.copyBuffersToTexture([buffer], this._textureCube, [_copyRegion]);
    }
    if (capabilities.max3DTextureSize >= 2) {
      this._texture3D = device.createTexture(new TextureInfo(TextureType.TEX3D, TextureUsageBit.STORAGE | TextureUsageBit.SAMPLED, Format.RGBA8, 2, 2, TextureFlagBit.NONE, 1, 1, SampleCount.X1, 2));
      var _copyRegion2 = new BufferTextureCopy(0, 0, 0, new Offset(0, 0, 0), new Extent(2, 2, 2), new TextureSubresLayers(0, 0, 1));
      device.copyBuffersToTexture([buffer], this._texture3D, [_copyRegion2]);
    }
    if (capabilities.maxArrayTextureLayers >= 2) {
      this._texture2DArray = device.createTexture(new TextureInfo(TextureType.TEX2D_ARRAY, TextureUsageBit.STORAGE | TextureUsageBit.SAMPLED, Format.RGBA8, 2, 2, TextureFlagBit.NONE, 2));
      var _copyRegion3 = new BufferTextureCopy(0, 0, 0, new Offset(0, 0, 0), new Extent(2, 2, 1), new TextureSubresLayers(0, 0, 1));
      device.copyBuffersToTexture([buffer], this._texture2DArray, [_copyRegion3]);
      _copyRegion3.texSubres.baseArrayLayer = 1;
      device.copyBuffersToTexture([buffer], this._texture2DArray, [_copyRegion3]);
    }
  }
  var _proto2 = DefaultResource.prototype;
  _proto2.getTexture = function getTexture(type) {
    switch (type) {
      case TextureType.TEX2D:
        return this._texture2D;
      case TextureType.TEX3D:
        return this._texture3D;
      case TextureType.CUBE:
        return this._textureCube;
      case TextureType.TEX2D_ARRAY:
        return this._texture2DArray;
      default:
        return null;
    }
  };
  return DefaultResource;
}();

var Swapchain = function (_GFXObject) {
  function Swapchain() {
    var _this;
    _this = _GFXObject.call(this, ObjectType.SWAPCHAIN) || this;
    _this._transform = SurfaceTransform.IDENTITY;
    _this._colorTexture = null;
    _this._depthStencilTexture = null;
    return _this;
  }
  _inheritsLoose(Swapchain, _GFXObject);
  return _createClass(Swapchain, [{
    key: "colorTexture",
    get: function get() {
      return this._colorTexture;
    }
  }, {
    key: "depthStencilTexture",
    get: function get() {
      return this._depthStencilTexture;
    }
  }, {
    key: "surfaceTransform",
    get: function get() {
      return this._transform;
    }
  }, {
    key: "width",
    get: function get() {
      return this._colorTexture.width;
    }
  }, {
    key: "height",
    get: function get() {
      return this._colorTexture.height;
    }
  }]);
}(GFXObject);

var Framebuffer = function (_GFXObject) {
  function Framebuffer() {
    var _this;
    _this = _GFXObject.call(this, ObjectType.FRAMEBUFFER) || this;
    _this._renderPass = null;
    _this._colorTextures = [];
    _this._depthStencilTexture = null;
    _this._width = 0;
    _this._height = 0;
    return _this;
  }
  _inheritsLoose(Framebuffer, _GFXObject);
  return _createClass(Framebuffer, [{
    key: "renderPass",
    get: function get() {
      return this._renderPass;
    }
  }, {
    key: "colorTextures",
    get: function get() {
      return this._colorTextures;
    }
  }, {
    key: "depthStencilTexture",
    get: function get() {
      return this._depthStencilTexture;
    }
  }, {
    key: "width",
    get: function get() {
      if (this.colorTextures.length > 0) {
        var _this$colorTextures$, _this$colorTextures$2;
        return (_this$colorTextures$ = (_this$colorTextures$2 = this.colorTextures[0]) == null ? void 0 : _this$colorTextures$2.width) !== null && _this$colorTextures$ !== void 0 ? _this$colorTextures$ : this._width;
      } else if (this.depthStencilTexture) {
        return this.depthStencilTexture.width;
      }
      return this._width;
    }
  }, {
    key: "height",
    get: function get() {
      if (this.colorTextures.length > 0) {
        var _this$colorTextures$3, _this$colorTextures$4;
        return (_this$colorTextures$3 = (_this$colorTextures$4 = this.colorTextures[0]) == null ? void 0 : _this$colorTextures$4.height) !== null && _this$colorTextures$3 !== void 0 ? _this$colorTextures$3 : this._height;
      } else if (this.depthStencilTexture) {
        return this.depthStencilTexture.height;
      }
      return this._height;
    }
  }, {
    key: "needRebuild",
    get: function get() {
      return false;
    }
  }]);
}(GFXObject);

var getUint8ForString = String.prototype.charCodeAt;
function getUint8ForArray(idx) {
  return this[idx];
}
function murmurhash2_32_gc(input, seed) {
  var l = input.length;
  var h = seed ^ l;
  var i = 0;
  var getUint8 = typeof input === 'string' ? getUint8ForString : getUint8ForArray;
  while (l >= 4) {
    var k = getUint8.call(input, i) & 0xff | (getUint8.call(input, ++i) & 0xff) << 8 | (getUint8.call(input, ++i) & 0xff) << 16 | (getUint8.call(input, ++i) & 0xff) << 24;
    k = (k & 0xffff) * 0x5bd1e995 + (((k >>> 16) * 0x5bd1e995 & 0xffff) << 16);
    k ^= k >>> 24;
    k = (k & 0xffff) * 0x5bd1e995 + (((k >>> 16) * 0x5bd1e995 & 0xffff) << 16);
    h = (h & 0xffff) * 0x5bd1e995 + (((h >>> 16) * 0x5bd1e995 & 0xffff) << 16) ^ k;
    l -= 4;
    ++i;
  }
  switch (l) {
    case 3:
      h ^= (getUint8.call(input, i + 2) & 0xff) << 16;
    case 2:
      h ^= (getUint8.call(input, i + 1) & 0xff) << 8;
    case 1:
      h ^= getUint8.call(input, i) & 0xff;
      h = (h & 0xffff) * 0x5bd1e995 + (((h >>> 16) * 0x5bd1e995 & 0xffff) << 16);
      break;
  }
  h ^= h >>> 13;
  h = (h & 0xffff) * 0x5bd1e995 + (((h >>> 16) * 0x5bd1e995 & 0xffff) << 16);
  h ^= h >>> 15;
  return h >>> 0;
}

var InputAssembler = function (_GFXObject) {
  function InputAssembler() {
    var _this;
    _this = _GFXObject.call(this, ObjectType.INPUT_ASSEMBLER) || this;
    _this._attributes = [];
    _this._attributesHash = 0;
    _this._vertexBuffers = [];
    _this._indexBuffer = null;
    _this._indirectBuffer = null;
    _this._drawInfo = new DrawInfo();
    return _this;
  }
  _inheritsLoose(InputAssembler, _GFXObject);
  var _proto = InputAssembler.prototype;
  _proto.getVertexBuffer = function getVertexBuffer(stream) {
    if (stream === void 0) {
      stream = 0;
    }
    if (stream < this._vertexBuffers.length) {
      return this._vertexBuffers[stream];
    } else {
      return null;
    }
  };
  _proto.computeAttributesHash = function computeAttributesHash() {
    var res = 'attrs';
    for (var i = 0; i < this.attributes.length; ++i) {
      var at = this.attributes[i];
      res += "," + at.name + "," + at.format + "," + at.isNormalized + "," + at.stream + "," + at.isInstanced + "," + at.location;
    }
    return murmurhash2_32_gc(res, 666);
  };
  return _createClass(InputAssembler, [{
    key: "attributes",
    get: function get() {
      return this._attributes;
    }
  }, {
    key: "vertexBuffers",
    get: function get() {
      return this._vertexBuffers;
    }
  }, {
    key: "indexBuffer",
    get: function get() {
      return this._indexBuffer;
    }
  }, {
    key: "indirectBuffer",
    get: function get() {
      return this._indirectBuffer;
    }
  }, {
    key: "attributesHash",
    get: function get() {
      return this._attributesHash;
    }
  }, {
    key: "vertexCount",
    get: function get() {
      return this._drawInfo.vertexCount;
    },
    set: function set(count) {
      this._drawInfo.vertexCount = count;
    }
  }, {
    key: "firstVertex",
    get: function get() {
      return this._drawInfo.firstVertex;
    },
    set: function set(first) {
      this._drawInfo.firstVertex = first;
    }
  }, {
    key: "indexCount",
    get: function get() {
      return this._drawInfo.indexCount;
    },
    set: function set(count) {
      this._drawInfo.indexCount = count;
    }
  }, {
    key: "firstIndex",
    get: function get() {
      return this._drawInfo.firstIndex;
    },
    set: function set(first) {
      this._drawInfo.firstIndex = first;
    }
  }, {
    key: "vertexOffset",
    get: function get() {
      return this._drawInfo.vertexOffset;
    },
    set: function set(offset) {
      this._drawInfo.vertexOffset = offset;
    }
  }, {
    key: "instanceCount",
    get: function get() {
      return this._drawInfo.instanceCount;
    },
    set: function set(count) {
      this._drawInfo.instanceCount = count;
    }
  }, {
    key: "firstInstance",
    get: function get() {
      return this._drawInfo.firstInstance;
    },
    set: function set(first) {
      this._drawInfo.firstInstance = first;
    }
  }, {
    key: "drawInfo",
    get: function get() {
      return this._drawInfo;
    },
    set: function set(info) {
      this._drawInfo = info;
    }
  }]);
}(GFXObject);

var DescriptorSet = function (_GFXObject) {
  function DescriptorSet() {
    var _this;
    _this = _GFXObject.call(this, ObjectType.DESCRIPTOR_SET) || this;
    _this._layout = null;
    _this._buffers = [];
    _this._textures = [];
    _this._samplers = [];
    _this._isDirty = false;
    return _this;
  }
  _inheritsLoose(DescriptorSet, _GFXObject);
  var _proto = DescriptorSet.prototype;
  _proto.bindBuffer = function bindBuffer(binding, buffer, index) {
    if (index === void 0) {
      index = 0;
    }
    var bindingIndex = this._layout.bindingIndices[binding];
    var info = this._layout.bindings[bindingIndex];
    if (!info) {
      return;
    }
    if (info.descriptorType & DESCRIPTOR_BUFFER_TYPE) {
      var descriptorIndex = this._layout.descriptorIndices[binding];
      if (this._buffers[descriptorIndex + index] !== buffer) {
        this._buffers[descriptorIndex + index] = buffer;
        this._isDirty = true;
      }
    }
  };
  _proto.bindSampler = function bindSampler(binding, sampler, index) {
    if (index === void 0) {
      index = 0;
    }
    var bindingIndex = this._layout.bindingIndices[binding];
    var info = this._layout.bindings[bindingIndex];
    if (!info) {
      return;
    }
    if (info.descriptorType & DESCRIPTOR_SAMPLER_TYPE) {
      var descriptorIndex = this._layout.descriptorIndices[binding];
      if (this._samplers[descriptorIndex + index] !== sampler) {
        this._samplers[descriptorIndex + index] = sampler;
        this._isDirty = true;
      }
    }
  };
  _proto.bindTexture = function bindTexture(binding, texture, index, flags) {
    if (index === void 0) {
      index = 0;
    }
    if (flags === void 0) {
      flags = AccessFlagBit.NONE;
    }
    var bindingIndex = this._layout.bindingIndices[binding];
    var info = this._layout.bindings[bindingIndex];
    if (!info) {
      return;
    }
    if (info.descriptorType & DESCRIPTOR_SAMPLER_TYPE) {
      var descriptorIndex = this._layout.descriptorIndices[binding];
      if (this._textures[descriptorIndex + index] !== texture) {
        this._textures[descriptorIndex + index] = texture;
        this._isDirty = true;
      }
    }
  };
  _proto.getBuffer = function getBuffer(binding, index) {
    if (index === void 0) {
      index = 0;
    }
    var descriptorIndex = this._layout.descriptorIndices[binding];
    return this._buffers[descriptorIndex + index];
  };
  _proto.getSampler = function getSampler(binding, index) {
    if (index === void 0) {
      index = 0;
    }
    var descriptorIndex = this._layout.descriptorIndices[binding];
    return this._samplers[descriptorIndex + index];
  };
  _proto.getTexture = function getTexture(binding, index) {
    if (index === void 0) {
      index = 0;
    }
    var descriptorIndex = this._layout.descriptorIndices[binding];
    return this._textures[descriptorIndex + index];
  };
  return _createClass(DescriptorSet, [{
    key: "layout",
    get: function get() {
      return this._layout;
    }
  }]);
}(GFXObject);

var DescriptorSetLayout = function (_GFXObject) {
  function DescriptorSetLayout() {
    var _this;
    _this = _GFXObject.call(this, ObjectType.DESCRIPTOR_SET_LAYOUT) || this;
    _this._bindings = [];
    _this._bindingIndices = [];
    _this._descriptorIndices = [];
    return _this;
  }
  _inheritsLoose(DescriptorSetLayout, _GFXObject);
  return _createClass(DescriptorSetLayout, [{
    key: "bindings",
    get: function get() {
      return this._bindings;
    }
  }, {
    key: "bindingIndices",
    get: function get() {
      return this._bindingIndices;
    }
  }, {
    key: "descriptorIndices",
    get: function get() {
      return this._descriptorIndices;
    }
  }]);
}(GFXObject);

var PipelineLayout = function (_GFXObject) {
  function PipelineLayout() {
    var _this;
    _this = _GFXObject.call(this, ObjectType.PIPELINE_LAYOUT) || this;
    _this._setLayouts = [];
    return _this;
  }
  _inheritsLoose(PipelineLayout, _GFXObject);
  return _createClass(PipelineLayout, [{
    key: "setLayouts",
    get: function get() {
      return this._setLayouts;
    }
  }]);
}(GFXObject);

var RasterizerState = function () {
  function RasterizerState(isDiscard, polygonMode, shadeModel, cullMode, isFrontFaceCCW, depthBiasEnabled, depthBias, depthBiasClamp, depthBiasSlop, isDepthClip, isMultisample, lineWidth) {
    if (isDiscard === void 0) {
      isDiscard = false;
    }
    if (polygonMode === void 0) {
      polygonMode = PolygonMode.FILL;
    }
    if (shadeModel === void 0) {
      shadeModel = ShadeModel.GOURAND;
    }
    if (cullMode === void 0) {
      cullMode = CullMode.BACK;
    }
    if (isFrontFaceCCW === void 0) {
      isFrontFaceCCW = true;
    }
    if (depthBiasEnabled === void 0) {
      depthBiasEnabled = false;
    }
    if (depthBias === void 0) {
      depthBias = 0;
    }
    if (depthBiasClamp === void 0) {
      depthBiasClamp = 0.0;
    }
    if (depthBiasSlop === void 0) {
      depthBiasSlop = 0.0;
    }
    if (isDepthClip === void 0) {
      isDepthClip = true;
    }
    if (isMultisample === void 0) {
      isMultisample = false;
    }
    if (lineWidth === void 0) {
      lineWidth = 1.0;
    }
    this.isDiscard = isDiscard;
    this.polygonMode = polygonMode;
    this.shadeModel = shadeModel;
    this.cullMode = cullMode;
    this.isFrontFaceCCW = isFrontFaceCCW;
    this.depthBiasEnabled = depthBiasEnabled;
    this.depthBias = depthBias;
    this.depthBiasClamp = depthBiasClamp;
    this.depthBiasSlop = depthBiasSlop;
    this.isDepthClip = isDepthClip;
    this.isMultisample = isMultisample;
    this.lineWidth = lineWidth;
  }
  var _proto = RasterizerState.prototype;
  _proto.reset = function reset() {
    this.isDiscard = false;
    this.polygonMode = PolygonMode.FILL;
    this.shadeModel = ShadeModel.GOURAND;
    this.cullMode = CullMode.BACK;
    this.isFrontFaceCCW = true;
    this.depthBiasEnabled = false;
    this.depthBias = 0;
    this.depthBiasClamp = 0.0;
    this.depthBiasSlop = 0.0;
    this.isDepthClip = true;
    this.isMultisample = false;
    this.lineWidth = 1.0;
  };
  _proto.assign = function assign(rs) {
    Object.assign(this, rs);
  };
  _proto.destroy = function destroy() {};
  return _createClass(RasterizerState, [{
    key: "native",
    get: function get() {
      return this;
    }
  }]);
}();
var DepthStencilState = function () {
  function DepthStencilState(depthTest, depthWrite, depthFunc, stencilTestFront, stencilFuncFront, stencilReadMaskFront, stencilWriteMaskFront, stencilFailOpFront, stencilZFailOpFront, stencilPassOpFront, stencilRefFront, stencilTestBack, stencilFuncBack, stencilReadMaskBack, stencilWriteMaskBack, stencilFailOpBack, stencilZFailOpBack, stencilPassOpBack, stencilRefBack) {
    if (depthTest === void 0) {
      depthTest = true;
    }
    if (depthWrite === void 0) {
      depthWrite = true;
    }
    if (depthFunc === void 0) {
      depthFunc = ComparisonFunc.LESS;
    }
    if (stencilTestFront === void 0) {
      stencilTestFront = false;
    }
    if (stencilFuncFront === void 0) {
      stencilFuncFront = ComparisonFunc.ALWAYS;
    }
    if (stencilReadMaskFront === void 0) {
      stencilReadMaskFront = 0xffff;
    }
    if (stencilWriteMaskFront === void 0) {
      stencilWriteMaskFront = 0xffff;
    }
    if (stencilFailOpFront === void 0) {
      stencilFailOpFront = StencilOp.KEEP;
    }
    if (stencilZFailOpFront === void 0) {
      stencilZFailOpFront = StencilOp.KEEP;
    }
    if (stencilPassOpFront === void 0) {
      stencilPassOpFront = StencilOp.KEEP;
    }
    if (stencilRefFront === void 0) {
      stencilRefFront = 1;
    }
    if (stencilTestBack === void 0) {
      stencilTestBack = false;
    }
    if (stencilFuncBack === void 0) {
      stencilFuncBack = ComparisonFunc.ALWAYS;
    }
    if (stencilReadMaskBack === void 0) {
      stencilReadMaskBack = 0xffff;
    }
    if (stencilWriteMaskBack === void 0) {
      stencilWriteMaskBack = 0xffff;
    }
    if (stencilFailOpBack === void 0) {
      stencilFailOpBack = StencilOp.KEEP;
    }
    if (stencilZFailOpBack === void 0) {
      stencilZFailOpBack = StencilOp.KEEP;
    }
    if (stencilPassOpBack === void 0) {
      stencilPassOpBack = StencilOp.KEEP;
    }
    if (stencilRefBack === void 0) {
      stencilRefBack = 1;
    }
    this.depthTest = depthTest;
    this.depthWrite = depthWrite;
    this.depthFunc = depthFunc;
    this.stencilTestFront = stencilTestFront;
    this.stencilFuncFront = stencilFuncFront;
    this.stencilReadMaskFront = stencilReadMaskFront;
    this.stencilWriteMaskFront = stencilWriteMaskFront;
    this.stencilFailOpFront = stencilFailOpFront;
    this.stencilZFailOpFront = stencilZFailOpFront;
    this.stencilPassOpFront = stencilPassOpFront;
    this.stencilRefFront = stencilRefFront;
    this.stencilTestBack = stencilTestBack;
    this.stencilFuncBack = stencilFuncBack;
    this.stencilReadMaskBack = stencilReadMaskBack;
    this.stencilWriteMaskBack = stencilWriteMaskBack;
    this.stencilFailOpBack = stencilFailOpBack;
    this.stencilZFailOpBack = stencilZFailOpBack;
    this.stencilPassOpBack = stencilPassOpBack;
    this.stencilRefBack = stencilRefBack;
  }
  var _proto2 = DepthStencilState.prototype;
  _proto2.reset = function reset() {
    this.depthTest = true;
    this.depthWrite = true;
    this.depthFunc = ComparisonFunc.LESS;
    this.stencilTestFront = false;
    this.stencilFuncFront = ComparisonFunc.ALWAYS;
    this.stencilReadMaskFront = 0xffff;
    this.stencilWriteMaskFront = 0xffff;
    this.stencilFailOpFront = StencilOp.KEEP;
    this.stencilZFailOpFront = StencilOp.KEEP;
    this.stencilPassOpFront = StencilOp.KEEP;
    this.stencilRefFront = 1;
    this.stencilTestBack = false;
    this.stencilFuncBack = ComparisonFunc.ALWAYS;
    this.stencilReadMaskBack = 0xffff;
    this.stencilWriteMaskBack = 0xffff;
    this.stencilFailOpBack = StencilOp.KEEP;
    this.stencilZFailOpBack = StencilOp.KEEP;
    this.stencilPassOpBack = StencilOp.KEEP;
    this.stencilRefBack = 1;
  };
  _proto2.assign = function assign(dss) {
    Object.assign(this, dss);
  };
  _proto2.destroy = function destroy() {};
  return _createClass(DepthStencilState, [{
    key: "native",
    get: function get() {
      return this;
    }
  }]);
}();
var BlendTarget = function () {
  function BlendTarget(blend, blendSrc, blendDst, blendEq, blendSrcAlpha, blendDstAlpha, blendAlphaEq, blendColorMask) {
    if (blend === void 0) {
      blend = false;
    }
    if (blendSrc === void 0) {
      blendSrc = BlendFactor.ONE;
    }
    if (blendDst === void 0) {
      blendDst = BlendFactor.ZERO;
    }
    if (blendEq === void 0) {
      blendEq = BlendOp.ADD;
    }
    if (blendSrcAlpha === void 0) {
      blendSrcAlpha = BlendFactor.ONE;
    }
    if (blendDstAlpha === void 0) {
      blendDstAlpha = BlendFactor.ZERO;
    }
    if (blendAlphaEq === void 0) {
      blendAlphaEq = BlendOp.ADD;
    }
    if (blendColorMask === void 0) {
      blendColorMask = ColorMask.ALL;
    }
    this.blend = blend;
    this.blendSrc = blendSrc;
    this.blendDst = blendDst;
    this.blendEq = blendEq;
    this.blendSrcAlpha = blendSrcAlpha;
    this.blendDstAlpha = blendDstAlpha;
    this.blendAlphaEq = blendAlphaEq;
    this.blendColorMask = blendColorMask;
  }
  var _proto3 = BlendTarget.prototype;
  _proto3.reset = function reset() {
    this.blend = false;
    this.blendSrc = BlendFactor.ONE;
    this.blendDst = BlendFactor.ZERO;
    this.blendEq = BlendOp.ADD;
    this.blendSrcAlpha = BlendFactor.ONE;
    this.blendDstAlpha = BlendFactor.ZERO;
    this.blendAlphaEq = BlendOp.ADD;
    this.blendColorMask = ColorMask.ALL;
  };
  _proto3.assign = function assign(target) {
    Object.assign(this, target);
  };
  _proto3.destroy = function destroy() {};
  return BlendTarget;
}();
var BlendState = function () {
  function BlendState(isA2C, isIndepend, blendColor, targets) {
    if (isA2C === void 0) {
      isA2C = false;
    }
    if (isIndepend === void 0) {
      isIndepend = false;
    }
    if (blendColor === void 0) {
      blendColor = new Color();
    }
    if (targets === void 0) {
      targets = [new BlendTarget()];
    }
    this.isA2C = isA2C;
    this.isIndepend = isIndepend;
    this.blendColor = blendColor;
    this.targets = targets;
  }
  var _proto4 = BlendState.prototype;
  _proto4.setTarget = function setTarget(index, target) {
    var tg = this.targets[index];
    if (!tg) {
      tg = this.targets[index] = new BlendTarget();
    }
    Object.assign(tg, target);
  };
  _proto4.reset = function reset() {
    this.isA2C = false;
    this.isIndepend = false;
    this.blendColor.x = 0;
    this.blendColor.y = 0;
    this.blendColor.z = 0;
    this.blendColor.w = 0;
    this.targets.length = 1;
    this.targets[0].reset();
  };
  _proto4.destroy = function destroy() {};
  return _createClass(BlendState, [{
    key: "native",
    get: function get() {
      return this;
    }
  }]);
}();

var PipelineStateInfo = function PipelineStateInfo(shader, pipelineLayout, renderPass, inputState, rasterizerState, depthStencilState, blendState, primitive, dynamicStates, bindPoint) {
  if (shader === void 0) {
    shader = null;
  }
  if (pipelineLayout === void 0) {
    pipelineLayout = null;
  }
  if (renderPass === void 0) {
    renderPass = null;
  }
  if (inputState === void 0) {
    inputState = new InputState();
  }
  if (rasterizerState === void 0) {
    rasterizerState = new RasterizerState();
  }
  if (depthStencilState === void 0) {
    depthStencilState = new DepthStencilState();
  }
  if (blendState === void 0) {
    blendState = new BlendState();
  }
  if (primitive === void 0) {
    primitive = PrimitiveMode.TRIANGLE_LIST;
  }
  if (dynamicStates === void 0) {
    dynamicStates = DynamicStateFlagBit.NONE;
  }
  if (bindPoint === void 0) {
    bindPoint = PipelineBindPoint.GRAPHICS;
  }
  this.shader = shader;
  this.pipelineLayout = pipelineLayout;
  this.renderPass = renderPass;
  this.inputState = inputState;
  this.rasterizerState = rasterizerState;
  this.depthStencilState = depthStencilState;
  this.blendState = blendState;
  this.primitive = primitive;
  this.dynamicStates = dynamicStates;
  this.bindPoint = bindPoint;
};
var PipelineState = function (_GFXObject) {
  function PipelineState() {
    var _this;
    _this = _GFXObject.call(this, ObjectType.PIPELINE_STATE) || this;
    _this._shader = null;
    _this._pipelineLayout = null;
    _this._primitive = PrimitiveMode.TRIANGLE_LIST;
    _this._is = null;
    _this._rs = new RasterizerState();
    _this._dss = new DepthStencilState();
    _this._bs = new BlendState();
    _this._dynamicStates = DynamicStateFlagBit.NONE;
    _this._renderPass = null;
    return _this;
  }
  _inheritsLoose(PipelineState, _GFXObject);
  return _createClass(PipelineState, [{
    key: "shader",
    get: function get() {
      return this._shader;
    }
  }, {
    key: "pipelineLayout",
    get: function get() {
      return this._pipelineLayout;
    }
  }, {
    key: "primitive",
    get: function get() {
      return this._primitive;
    }
  }, {
    key: "rasterizerState",
    get: function get() {
      return this._rs;
    }
  }, {
    key: "depthStencilState",
    get: function get() {
      return this._dss;
    }
  }, {
    key: "blendState",
    get: function get() {
      return this._bs;
    }
  }, {
    key: "inputState",
    get: function get() {
      return this._is;
    }
  }, {
    key: "dynamicStates",
    get: function get() {
      return this._dynamicStates;
    }
  }, {
    key: "renderPass",
    get: function get() {
      return this._renderPass;
    }
  }]);
}(GFXObject);

var Queue = function (_GFXObject) {
  function Queue() {
    var _this;
    _this = _GFXObject.call(this, ObjectType.QUEUE) || this;
    _this._type = QueueType.GRAPHICS;
    return _this;
  }
  _inheritsLoose(Queue, _GFXObject);
  return _createClass(Queue, [{
    key: "type",
    get: function get() {
      return this._type;
    }
  }]);
}(GFXObject);

var RenderPass = function (_GFXObject) {
  function RenderPass() {
    var _this;
    _this = _GFXObject.call(this, ObjectType.RENDER_PASS) || this;
    _this._colorInfos = [];
    _this._depthStencilInfo = null;
    _this._subpasses = [];
    _this._hash = 0;
    return _this;
  }
  _inheritsLoose(RenderPass, _GFXObject);
  var _proto = RenderPass.prototype;
  _proto.computeHash = function computeHash() {
    var res = '';
    if (this._subpasses.length) {
      for (var i = 0; i < this._subpasses.length; ++i) {
        var subpass = this._subpasses[i];
        if (subpass.inputs.length) {
          res += 'ia';
          for (var j = 0; j < subpass.inputs.length; ++j) {
            var ia = this._colorInfos[subpass.inputs[j]];
            res += "," + ia.format + "," + ia.sampleCount;
          }
        }
        if (subpass.colors.length) {
          res += 'ca';
          for (var _j = 0; _j < subpass.colors.length; ++_j) {
            var ca = this._colorInfos[subpass.colors[_j]];
            res += "," + ca.format + "," + ca.sampleCount;
          }
        }
        if (subpass.depthStencil >= 0) {
          var ds = this._colorInfos[subpass.depthStencil];
          res += "ds," + ds.format + "," + ds.sampleCount;
        }
      }
    } else {
      res += 'ca';
      for (var _i = 0; _i < this._colorInfos.length; ++_i) {
        var _ca = this._colorInfos[_i];
        res += "," + _ca.format + "," + _ca.sampleCount;
      }
      var _ds = this._depthStencilInfo;
      if (_ds) {
        res += "ds," + _ds.format + "," + _ds.sampleCount;
      }
    }
    return murmurhash2_32_gc(res, 666);
  };
  return _createClass(RenderPass, [{
    key: "colorAttachments",
    get: function get() {
      return this._colorInfos;
    }
  }, {
    key: "depthStencilAttachment",
    get: function get() {
      return this._depthStencilInfo;
    }
  }, {
    key: "subPasses",
    get: function get() {
      return this._subpasses;
    }
  }, {
    key: "hash",
    get: function get() {
      return this._hash;
    }
  }]);
}(GFXObject);

var Sampler = function (_GFXObject) {
  function Sampler(info, hash) {
    var _this;
    _this = _GFXObject.call(this, ObjectType.SAMPLER) || this;
    _this._info = new SamplerInfo();
    _this._hash = 0;
    _this._info.copy(info);
    _this._hash = hash;
    return _this;
  }
  _inheritsLoose(Sampler, _GFXObject);
  Sampler.computeHash = function computeHash(info) {
    var hash = info.minFilter;
    hash |= info.magFilter << 2;
    hash |= info.mipFilter << 4;
    hash |= info.addressU << 6;
    hash |= info.addressV << 8;
    hash |= info.addressW << 10;
    hash |= Math.min(info.maxAnisotropy, 16) << 12;
    hash |= info.cmpFunc << 17;
    return hash;
  };
  Sampler.unpackFromHash = function unpackFromHash(hash) {
    var info = new SamplerInfo();
    info.minFilter = hash & 3;
    info.magFilter = hash >> 2 & 3;
    info.mipFilter = hash >> 4 & 3;
    info.addressU = hash >> 6 & 3;
    info.addressV = hash >> 8 & 3;
    info.addressW = hash >> 10 & 3;
    info.maxAnisotropy = hash >> 12 & 31;
    info.cmpFunc = hash >> 17 & 7;
    return info;
  };
  return _createClass(Sampler, [{
    key: "info",
    get: function get() {
      return this._info;
    }
  }, {
    key: "hash",
    get: function get() {
      return this._hash;
    }
  }]);
}(GFXObject);

var Shader = function (_GFXObject) {
  function Shader() {
    var _this;
    _this = _GFXObject.call(this, ObjectType.SHADER) || this;
    _this._name = '';
    _this._stages = [];
    _this._attributes = [];
    _this._blocks = [];
    _this._samplers = [];
    return _this;
  }
  _inheritsLoose(Shader, _GFXObject);
  return _createClass(Shader, [{
    key: "name",
    get: function get() {
      return this._name;
    }
  }, {
    key: "attributes",
    get: function get() {
      return this._attributes;
    }
  }, {
    key: "blocks",
    get: function get() {
      return this._blocks;
    }
  }, {
    key: "samplers",
    get: function get() {
      return this._samplers;
    }
  }, {
    key: "stages",
    get: function get() {
      return this._stages;
    }
  }]);
}(GFXObject);

var Texture = function (_GFXObject) {
  function Texture() {
    var _this;
    _this = _GFXObject.call(this, ObjectType.TEXTURE) || this;
    _this._info = new TextureInfo();
    _this._viewInfo = new TextureViewInfo();
    _this._isPowerOf2 = false;
    _this._isTextureView = false;
    _this._size = 0;
    return _this;
  }
  _inheritsLoose(Texture, _GFXObject);
  Texture.getLevelCount = function getLevelCount(width, height) {
    return Math.floor(Math.log2(Math.max(width, height)));
  };
  return _createClass(Texture, [{
    key: "type",
    get: function get() {
      return this._info.type;
    }
  }, {
    key: "usage",
    get: function get() {
      return this._info.usage;
    }
  }, {
    key: "format",
    get: function get() {
      return this._info.format;
    }
  }, {
    key: "width",
    get: function get() {
      return this._info.width;
    }
  }, {
    key: "height",
    get: function get() {
      return this._info.height;
    }
  }, {
    key: "depth",
    get: function get() {
      return this._info.depth;
    }
  }, {
    key: "layerCount",
    get: function get() {
      return this._info.layerCount;
    }
  }, {
    key: "levelCount",
    get: function get() {
      return this._info.levelCount;
    }
  }, {
    key: "samples",
    get: function get() {
      return this._info.samples;
    }
  }, {
    key: "flags",
    get: function get() {
      return this._info.flags;
    }
  }, {
    key: "size",
    get: function get() {
      return this._size;
    }
  }, {
    key: "info",
    get: function get() {
      return this._info;
    }
  }, {
    key: "viewInfo",
    get: function get() {
      return this._viewInfo;
    }
  }, {
    key: "isTextureView",
    get: function get() {
      return this._isTextureView;
    }
  }]);
}(GFXObject);

var GeneralBarrier = function (_GFXObject) {
  function GeneralBarrier(info, hash) {
    var _this;
    _this = _GFXObject.call(this, ObjectType.GLOBAL_BARRIER) || this;
    _this._info = new GeneralBarrierInfo();
    _this._hash = 0;
    _this._info.copy(info);
    _this._hash = hash;
    return _this;
  }
  _inheritsLoose(GeneralBarrier, _GFXObject);
  GeneralBarrier.computeHash = function computeHash(info) {
    return murmurhash2_32_gc(info.prevAccesses + " " + info.nextAccesses + " " + info.type, 666);
  };
  return _createClass(GeneralBarrier, [{
    key: "info",
    get: function get() {
      return this._info;
    }
  }, {
    key: "hash",
    get: function get() {
      return this._hash;
    }
  }]);
}(GFXObject);

var TextureBarrier = function (_GFXObject) {
  function TextureBarrier(info, hash) {
    var _this;
    _this = _GFXObject.call(this, ObjectType.TEXTURE_BARRIER) || this;
    _this._info = new TextureBarrierInfo();
    _this._hash = 0;
    _this._info.copy(info);
    _this._hash = hash;
    return _this;
  }
  _inheritsLoose(TextureBarrier, _GFXObject);
  TextureBarrier.computeHash = function computeHash(info) {
    var res = info.prevAccesses + " " + info.nextAccesses;
    res += info.type;
    res += info.range.mipLevel;
    res += info.range.levelCount;
    res += info.range.firstSlice;
    res += info.range.numSlices;
    res += info.range.basePlane;
    res += info.range.planeCount;
    res += info.discardContents;
    res += info.srcQueue ? info.srcQueue.type : 0;
    res += info.dstQueue ? info.dstQueue.type : 0;
    return murmurhash2_32_gc(res, 666);
  };
  return _createClass(TextureBarrier, [{
    key: "info",
    get: function get() {
      return this._info;
    }
  }, {
    key: "hash",
    get: function get() {
      return this._hash;
    }
  }]);
}(GFXObject);

var BufferBarrier = function (_GFXObject) {
  function BufferBarrier(info, hash) {
    var _this;
    _this = _GFXObject.call(this, ObjectType.BUFFER_BARRIER) || this;
    _this._info = new BufferBarrierInfo();
    _this._hash = 0;
    _this._info.copy(info);
    _this._hash = hash;
    return _this;
  }
  _inheritsLoose(BufferBarrier, _GFXObject);
  BufferBarrier.computeHash = function computeHash(info) {
    var res = info.prevAccesses + " " + info.nextAccesses;
    res += info.type;
    res += info.offset;
    res += info.size;
    res += info.discardContents;
    res += info.srcQueue ? info.srcQueue.type : 0;
    res += info.dstQueue ? info.dstQueue.type : 0;
    return murmurhash2_32_gc(res, 666);
  };
  return _createClass(BufferBarrier, [{
    key: "info",
    get: function get() {
      return this._info;
    }
  }, {
    key: "hash",
    get: function get() {
      return this._hash;
    }
  }]);
}(GFXObject);

export { API as $, Attribute as A, BufferInfo as B, ClearFlagBit as C, DrawInfo as D, TextureType as E, Format as F, GeneralBarrier as G, TextureUsageBit as H, InputAssemblerInfo as I, BufferTextureCopy as J, BindingMappingInfo as K, DescriptorSetLayoutBinding as L, MemoryUsageBit as M, DescriptorType as N, ShaderStageFlagBit as O, PipelineStateInfo as P, Queue as Q, RasterizerState as R, Shader as S, TextureBarrier as T, UniformBlock as U, Uniform as V, Type as W, UniformSamplerTexture as X, MemoryAccessBit as Y, ViewDimension as Z, FormatFeatureBit as _, AttributeName as a, QueueInfo as a$, TextureFlagBit as a0, SampleCount as a1, InputState as a2, getTypedArrayConstructor as a3, Filter as a4, DescriptorSetInfo as a5, ColorAttachment as a6, DepthStencilAttachment as a7, StoreOp as a8, RenderPassInfo as a9, DeviceCaps as aA, DeviceOptions as aB, DispatchInfo as aC, DynamicStateFlagBit as aD, DynamicStates as aE, DynamicStencilStates as aF, Extent as aG, FormatInfo as aH, FormatSize as aI, FormatSurfaceSize as aJ, FramebufferInfo as aK, GFXObject as aL, GeneralBarrierInfo as aM, GetTypeSize as aN, IndirectBuffer as aO, IsPowerOf2 as aP, LoadOp as aQ, MarkerInfo as aR, MemoryStatus as aS, ObjectType as aT, Offset as aU, PassType as aV, PipelineBindPoint as aW, PipelineLayoutInfo as aX, PolygonMode as aY, QueryPoolInfo as aZ, QueryType as a_, Feature as aa, FormatType as ab, Color as ac, Rect as ad, SamplerInfo as ae, Address as af, BlendFactor as ag, ComparisonFunc as ah, StencilOp as ai, BlendOp as aj, ColorMask as ak, AccessFlagBit as al, BarrierType as am, BufferBarrierInfo as an, BufferFlagBit as ao, BufferViewInfo as ap, CommandBufferInfo as aq, CommandBufferType as ar, CullMode as as, DESCRIPTOR_BUFFER_TYPE as at, DESCRIPTOR_DYNAMIC_TYPE as au, DESCRIPTOR_SAMPLER_TYPE as av, DESCRIPTOR_STORAGE_BUFFER_TYPE as aw, DRAW_INFO_SIZE as ax, DefaultResource as ay, DescriptorSetLayoutInfo as az, BufferUsageBit as b, QueueType as b0, ResolveMode as b1, ResourceRange as b2, SampleType as b3, ShadeModel as b4, ShaderInfo as b5, ShaderStage as b6, Size as b7, Status as b8, StencilFace as b9, SubpassDependency as ba, SubpassInfo as bb, SurfaceTransform as bc, TextureBarrierInfo as bd, TextureBlit as be, TextureCopy as bf, TextureSubresLayers as bg, TextureSubresRange as bh, TextureViewInfo as bi, UniformInputAttachment as bj, UniformSampler as bk, UniformStorageBuffer as bl, UniformStorageImage as bm, UniformTexture as bn, Viewport as bo, VsyncMode as bp, alignTo as bq, formatAlignment as br, DepthStencilState as c, BlendTarget as d, BlendState as e, BufferBarrier as f, CommandBuffer as g, PipelineState as h, PipelineLayout as i, DescriptorSetLayout as j, DescriptorSet as k, Framebuffer as l, murmurhash2_32_gc as m, RenderPass as n, InputAssembler as o, Sampler as p, Texture as q, Buffer as r, Swapchain as s, Device as t, defines as u, DeviceInfo as v, SwapchainInfo as w, FormatInfos as x, PrimitiveMode as y, TextureInfo as z };
//# sourceMappingURL=buffer-barrier-BlQXg9Aa.js.map
