import { a as _createClass, o as assertIsTrue, U as assertIsNonNullable, w as warnID, A as log2, W as logID, Q as error, _ as _inheritsLoose, l as _createForOfIteratorHelperLoose, k as errorID } from './gc-object-CShF5lzx.js';
import { I as nextPow2, n as sys, f as Vec3, J as AABB, c as ccclass, u as v3, Q as Quat, b as applyDecoratedInitializer, s as serializable, K as halfToFloat } from './index-uXI1_UMk.js';
import { E as EDITOR } from './_virtual_internal_constants-DWlew7Dp.js';
import { c as cclegacy } from './global-exports-DnCP_14L.js';
import { A as Asset } from './node-event-Ccvtv8bJ.js';
import { g as RenderingSubMesh } from './debug-view-BuNhRPv_.js';
import { P as PixelFormat, I as ImageAsset, i as Texture2D, j as TextureFilter, W as WrapMode } from './scene-vWcxM1_c.js';
import { d as deviceManager } from './device-manager-CBXP-ttm.js';
import { a as AttributeName, B as BufferInfo, b as BufferUsageBit, M as MemoryUsageBit, F as Format, _ as FormatFeatureBit, A as Attribute, D as DrawInfo, aa as Feature, x as FormatInfos, a3 as getTypedArrayConstructor, m as murmurhash2_32_gc, ab as FormatType } from './buffer-barrier-BlQXg9Aa.js';
import { e as UBOMorphEnum, f as UBOMorph, g as UNIFORM_TANGENT_MORPH_TEXTURE_BINDING, h as UNIFORM_NORMAL_MORPH_TEXTURE_BINDING, j as UNIFORM_POSITION_MORPH_TEXTURE_BINDING } from './pipeline-state-manager-C5U4ouGL.js';
import { e as ensureWasmModuleReady, i as instantiateWasm } from './wasm-web-BpK36a26.js';
import { g as game } from './deprecated-Dswa7XeN.js';
import './director-F7e_Lqjg.js';
import { _ as _p } from './zlib.min-3VC1ush6.js';

var BufferBlob = function () {
  function BufferBlob() {
    this._arrayBufferOrPaddings = [];
    this._length = 0;
  }
  var _proto = BufferBlob.prototype;
  _proto.setNextAlignment = function setNextAlignment(align) {
    if (align !== 0) {
      var remainder = this._length % align;
      if (remainder !== 0) {
        var padding = align - remainder;
        this._arrayBufferOrPaddings.push(padding);
        this._length += padding;
      }
    }
  };
  _proto.addBuffer = function addBuffer(arrayBuffer) {
    var result = this._length;
    this._arrayBufferOrPaddings.push(arrayBuffer);
    this._length += arrayBuffer.byteLength;
    return result;
  };
  _proto.getLength = function getLength() {
    return this._length;
  };
  _proto.getCombined = function getCombined() {
    var result = new Uint8Array(this._length);
    var counter = 0;
    this._arrayBufferOrPaddings.forEach(function (arrayBufferOrPadding) {
      if (typeof arrayBufferOrPadding === 'number') {
        counter += arrayBufferOrPadding;
      } else {
        result.set(new Uint8Array(arrayBufferOrPadding), counter);
        counter += arrayBufferOrPadding.byteLength;
      }
    });
    return result.buffer;
  };
  return BufferBlob;
}();

function createMorphRendering(mesh, gfxDevice) {
  return new StdMorphRendering(mesh, gfxDevice);
}
var StdMorphRendering = function () {
  function StdMorphRendering(mesh, gfxDevice) {
    this._subMeshRenderings = [];
    this._mesh = mesh;
    if (!this._mesh.struct.morph) {
      return;
    }
    var nSubMeshes = this._mesh.struct.primitives.length;
    this._subMeshRenderings = new Array(nSubMeshes).fill(null);
    for (var iSubMesh = 0; iSubMesh < nSubMeshes; ++iSubMesh) {
      var subMeshMorph = this._mesh.struct.morph.subMeshMorphs[iSubMesh];
      if (!subMeshMorph) {
        continue;
      }
      if (subMeshMorph.targets.length > UBOMorphEnum.MAX_MORPH_TARGET_COUNT) {
        this._subMeshRenderings[iSubMesh] = new CpuComputing(this._mesh, iSubMesh, this._mesh.struct.morph, gfxDevice);
      } else {
        this._subMeshRenderings[iSubMesh] = new GpuComputing(this._mesh, iSubMesh, this._mesh.struct.morph, gfxDevice);
      }
    }
  }
  var _proto = StdMorphRendering.prototype;
  _proto.createInstance = function createInstance() {
    var _this = this;
    var nSubMeshes = this._mesh.struct.primitives.length;
    var subMeshInstances = new Array(nSubMeshes);
    for (var iSubMesh = 0; iSubMesh < nSubMeshes; ++iSubMesh) {
      var _this$_subMeshRenderi, _this$_subMeshRenderi2;
      subMeshInstances[iSubMesh] = (_this$_subMeshRenderi = (_this$_subMeshRenderi2 = this._subMeshRenderings[iSubMesh]) == null ? void 0 : _this$_subMeshRenderi2.createInstance()) !== null && _this$_subMeshRenderi !== void 0 ? _this$_subMeshRenderi : null;
    }
    return {
      setWeights: function setWeights(subMeshIndex, weights) {
        var _subMeshInstances$sub;
        (_subMeshInstances$sub = subMeshInstances[subMeshIndex]) == null ? void 0 : _subMeshInstances$sub.setWeights(weights);
      },
      requiredPatches: function requiredPatches(subMeshIndex) {
        assertIsNonNullable(_this._mesh.struct.morph);
        var subMeshMorph = _this._mesh.struct.morph.subMeshMorphs[subMeshIndex];
        var subMeshRenderingInstance = subMeshInstances[subMeshIndex];
        if (subMeshRenderingInstance === null) {
          return null;
        }
        assertIsNonNullable(subMeshMorph);
        var patches = [{
          name: 'CC_USE_MORPH',
          value: true
        }, {
          name: 'CC_MORPH_TARGET_COUNT',
          value: subMeshMorph.targets.length
        }];
        if (subMeshMorph.attributes.includes(AttributeName.ATTR_POSITION)) {
          patches.push({
            name: 'CC_MORPH_TARGET_HAS_POSITION',
            value: true
          });
        }
        if (subMeshMorph.attributes.includes(AttributeName.ATTR_NORMAL)) {
          patches.push({
            name: 'CC_MORPH_TARGET_HAS_NORMAL',
            value: true
          });
        }
        if (subMeshMorph.attributes.includes(AttributeName.ATTR_TANGENT)) {
          patches.push({
            name: 'CC_MORPH_TARGET_HAS_TANGENT',
            value: true
          });
        }
        patches.push.apply(patches, subMeshRenderingInstance.requiredPatches());
        return patches;
      },
      adaptPipelineState: function adaptPipelineState(subMeshIndex, descriptorSet) {
        var _subMeshInstances$sub2;
        (_subMeshInstances$sub2 = subMeshInstances[subMeshIndex]) == null ? void 0 : _subMeshInstances$sub2.adaptPipelineState(descriptorSet);
      },
      destroy: function destroy() {
        subMeshInstances.forEach(function (subMeshInstance) {
          if (subMeshInstance) subMeshInstance.destroy();
        });
      }
    };
  };
  return StdMorphRendering;
}();
var GpuComputing = function () {
  function GpuComputing(mesh, subMeshIndex, morph, gfxDevice) {
    this._gfxDevice = gfxDevice;
    var subMeshMorph = morph.subMeshMorphs[subMeshIndex];
    assertIsNonNullable(subMeshMorph);
    this._subMeshMorph = subMeshMorph;
    enableVertexId(mesh, subMeshIndex, gfxDevice);
    var nVertices = mesh.struct.vertexBundles[mesh.struct.primitives[subMeshIndex].vertexBundelIndices[0]].view.count;
    this._verticesCount = nVertices;
    var nTargets = subMeshMorph.targets.length;
    var vec4Required = nVertices * nTargets;
    var vec4TextureFactory = createVec4TextureFactory(gfxDevice, vec4Required);
    this._textureInfo = {
      width: vec4TextureFactory.width,
      height: vec4TextureFactory.height
    };
    this._attributes = subMeshMorph.attributes.map(function (attributeName, attributeIndex) {
      var vec4Tex = vec4TextureFactory.create();
      var valueView = vec4Tex.valueView;
      subMeshMorph.targets.forEach(function (morphTarget, morphTargetIndex) {
        var displacementsView = morphTarget.displacements[attributeIndex];
        var displacements = new Float32Array(mesh.data.buffer, mesh.data.byteOffset + displacementsView.offset, displacementsView.count);
        var displacementsOffset = nVertices * morphTargetIndex * 4;
        for (var iVertex = 0; iVertex < nVertices; ++iVertex) {
          valueView[displacementsOffset + 4 * iVertex + 0] = displacements[3 * iVertex + 0];
          valueView[displacementsOffset + 4 * iVertex + 1] = displacements[3 * iVertex + 1];
          valueView[displacementsOffset + 4 * iVertex + 2] = displacements[3 * iVertex + 2];
        }
      });
      vec4Tex.updatePixels();
      return {
        name: attributeName,
        morphTexture: vec4Tex
      };
    });
  }
  var _proto2 = GpuComputing.prototype;
  _proto2.destroy = function destroy() {
    this._attributes.forEach(function (attribute) {
      attribute.morphTexture.destroy();
    });
  };
  _proto2.createInstance = function createInstance() {
    var _this2 = this;
    var morphUniforms = new MorphUniforms(this._gfxDevice, this._subMeshMorph.targets.length);
    morphUniforms.setMorphTextureInfo(this._textureInfo.width, this._textureInfo.height);
    morphUniforms.setVerticesCount(this._verticesCount);
    morphUniforms.commit();
    return {
      setWeights: function setWeights(weights) {
        morphUniforms.setWeights(weights);
        morphUniforms.commit();
      },
      requiredPatches: function requiredPatches() {
        return [{
          name: 'CC_MORPH_TARGET_USE_TEXTURE',
          value: true
        }];
      },
      adaptPipelineState: function adaptPipelineState(descriptorSet) {
        for (var i = 0; i < _this2._attributes.length; ++i) {
          var attribute = _this2._attributes[i];
          var binding = void 0;
          switch (attribute.name) {
            case AttributeName.ATTR_POSITION:
              binding = UNIFORM_POSITION_MORPH_TEXTURE_BINDING;
              break;
            case AttributeName.ATTR_NORMAL:
              binding = UNIFORM_NORMAL_MORPH_TEXTURE_BINDING;
              break;
            case AttributeName.ATTR_TANGENT:
              binding = UNIFORM_TANGENT_MORPH_TEXTURE_BINDING;
              break;
            default:
              warnID(16374);
              break;
          }
          if (binding !== undefined) {
            descriptorSet.bindSampler(binding, attribute.morphTexture.sampler);
            descriptorSet.bindTexture(binding, attribute.morphTexture.texture);
          }
        }
        descriptorSet.bindBuffer(UBOMorph.BINDING, morphUniforms.buffer);
        descriptorSet.update();
      },
      destroy: function destroy() {}
    };
  };
  return GpuComputing;
}();
var CpuComputing = function () {
  function CpuComputing(mesh, subMeshIndex, morph, gfxDevice) {
    this._attributes = [];
    this._gfxDevice = gfxDevice;
    var subMeshMorph = morph.subMeshMorphs[subMeshIndex];
    assertIsNonNullable(subMeshMorph);
    enableVertexId(mesh, subMeshIndex, gfxDevice);
    this._attributes = subMeshMorph.attributes.map(function (attributeName, attributeIndex) {
      return {
        name: attributeName,
        targets: subMeshMorph.targets.map(function (attributeDisplacement) {
          return {
            displacements: new Float32Array(mesh.data.buffer, mesh.data.byteOffset + attributeDisplacement.displacements[attributeIndex].offset, attributeDisplacement.displacements[attributeIndex].count)
          };
        })
      };
    });
  }
  var _proto3 = CpuComputing.prototype;
  _proto3.createInstance = function createInstance() {
    return new CpuComputingRenderingInstance(this, this._attributes[0].targets[0].displacements.length / 3, this._gfxDevice);
  };
  return _createClass(CpuComputing, [{
    key: "data",
    get: function get() {
      return this._attributes;
    }
  }]);
}();
var CpuComputingRenderingInstance = function () {
  function CpuComputingRenderingInstance(owner, nVertices, gfxDevice) {
    this._owner = owner;
    this._morphUniforms = new MorphUniforms(gfxDevice, 0);
    var vec4TextureFactory = createVec4TextureFactory(gfxDevice, nVertices);
    this._morphUniforms.setMorphTextureInfo(vec4TextureFactory.width, vec4TextureFactory.height);
    this._morphUniforms.commit();
    this._attributes = this._owner.data.map(function (attributeMorph, attributeIndex) {
      var morphTexture = vec4TextureFactory.create();
      return {
        attributeName: attributeMorph.name,
        morphTexture: morphTexture
      };
    });
  }
  var _proto4 = CpuComputingRenderingInstance.prototype;
  _proto4.setWeights = function setWeights(weights) {
    for (var iAttribute = 0; iAttribute < this._attributes.length; ++iAttribute) {
      var myAttribute = this._attributes[iAttribute];
      var valueView = myAttribute.morphTexture.valueView;
      var attributeMorph = this._owner.data[iAttribute];
      assertIsTrue(weights.length === attributeMorph.targets.length);
      for (var iTarget = 0; iTarget < attributeMorph.targets.length; ++iTarget) {
        var targetDisplacements = attributeMorph.targets[iTarget].displacements;
        var weight = weights[iTarget];
        var nVertices = targetDisplacements.length / 3;
        if (iTarget === 0) {
          for (var iVertex = 0; iVertex < nVertices; ++iVertex) {
            valueView[4 * iVertex + 0] = targetDisplacements[3 * iVertex + 0] * weight;
            valueView[4 * iVertex + 1] = targetDisplacements[3 * iVertex + 1] * weight;
            valueView[4 * iVertex + 2] = targetDisplacements[3 * iVertex + 2] * weight;
          }
        } else if (weight !== 0.0) {
          for (var _iVertex = 0; _iVertex < nVertices; ++_iVertex) {
            valueView[4 * _iVertex + 0] += targetDisplacements[3 * _iVertex + 0] * weight;
            valueView[4 * _iVertex + 1] += targetDisplacements[3 * _iVertex + 1] * weight;
            valueView[4 * _iVertex + 2] += targetDisplacements[3 * _iVertex + 2] * weight;
          }
        }
      }
      myAttribute.morphTexture.updatePixels();
    }
  };
  _proto4.requiredPatches = function requiredPatches() {
    return [{
      name: 'CC_MORPH_TARGET_USE_TEXTURE',
      value: true
    }, {
      name: 'CC_MORPH_PRECOMPUTED',
      value: true
    }];
  };
  _proto4.adaptPipelineState = function adaptPipelineState(descriptorSet) {
    for (var i = 0; i < this._attributes.length; ++i) {
      var attribute = this._attributes[i];
      var attributeName = attribute.attributeName;
      var binding = void 0;
      switch (attributeName) {
        case AttributeName.ATTR_POSITION:
          binding = UNIFORM_POSITION_MORPH_TEXTURE_BINDING;
          break;
        case AttributeName.ATTR_NORMAL:
          binding = UNIFORM_NORMAL_MORPH_TEXTURE_BINDING;
          break;
        case AttributeName.ATTR_TANGENT:
          binding = UNIFORM_TANGENT_MORPH_TEXTURE_BINDING;
          break;
        default:
          warnID(16374);
          break;
      }
      if (binding !== undefined) {
        descriptorSet.bindSampler(binding, attribute.morphTexture.sampler);
        descriptorSet.bindTexture(binding, attribute.morphTexture.texture);
      }
    }
    descriptorSet.bindBuffer(UBOMorph.BINDING, this._morphUniforms.buffer);
    descriptorSet.update();
  };
  _proto4.destroy = function destroy() {
    this._morphUniforms.destroy();
    for (var iAttribute = 0; iAttribute < this._attributes.length; ++iAttribute) {
      var myAttribute = this._attributes[iAttribute];
      myAttribute.morphTexture.destroy();
    }
  };
  return CpuComputingRenderingInstance;
}();
var MorphUniforms = function () {
  function MorphUniforms(gfxDevice, targetCount) {
    this._targetCount = targetCount;
    this._localBuffer = new DataView(new ArrayBuffer(UBOMorphEnum.SIZE));
    this._remoteBuffer = gfxDevice.createBuffer(new BufferInfo(BufferUsageBit.UNIFORM | BufferUsageBit.TRANSFER_DST, MemoryUsageBit.HOST | MemoryUsageBit.DEVICE, UBOMorphEnum.SIZE, UBOMorphEnum.SIZE));
  }
  var _proto5 = MorphUniforms.prototype;
  _proto5.destroy = function destroy() {
    this._remoteBuffer.destroy();
  };
  _proto5.setWeights = function setWeights(weights) {
    assertIsTrue(weights.length === this._targetCount);
    var isLittleEndian = cclegacy.sys.isLittleEndian;
    for (var iWeight = 0; iWeight < weights.length; ++iWeight) {
      this._localBuffer.setFloat32(UBOMorphEnum.OFFSET_OF_WEIGHTS + 4 * iWeight, weights[iWeight], isLittleEndian);
    }
  };
  _proto5.setMorphTextureInfo = function setMorphTextureInfo(width, height) {
    var isLittleEndian = cclegacy.sys.isLittleEndian;
    this._localBuffer.setFloat32(UBOMorphEnum.OFFSET_OF_DISPLACEMENT_TEXTURE_WIDTH, width, isLittleEndian);
    this._localBuffer.setFloat32(UBOMorphEnum.OFFSET_OF_DISPLACEMENT_TEXTURE_HEIGHT, height, isLittleEndian);
  };
  _proto5.setVerticesCount = function setVerticesCount(count) {
    var isLittleEndian = cclegacy.sys.isLittleEndian;
    this._localBuffer.setFloat32(UBOMorphEnum.OFFSET_OF_VERTICES_COUNT, count, isLittleEndian);
  };
  _proto5.commit = function commit() {
    this._remoteBuffer.update(this._localBuffer.buffer);
  };
  return _createClass(MorphUniforms, [{
    key: "buffer",
    get: function get() {
      return this._remoteBuffer;
    }
  }]);
}();
function createVec4TextureFactory(gfxDevice, vec4Capacity) {
  var hasFeatureFloatTexture = gfxDevice.getFormatFeatures(Format.RGBA32F) & FormatFeatureBit.SAMPLED_TEXTURE;
  var pixelRequired;
  var pixelFormat;
  var pixelBytes;
  var UpdateViewConstructor;
  if (hasFeatureFloatTexture) {
    pixelRequired = vec4Capacity;
    pixelBytes = 16;
    pixelFormat = PixelFormat.RGBA32F;
    UpdateViewConstructor = Float32Array;
  } else {
    pixelRequired = 4 * vec4Capacity;
    pixelBytes = 4;
    pixelFormat = PixelFormat.RGBA8888;
    UpdateViewConstructor = Uint8Array;
  }
  var _bestSizeToHavePixels = bestSizeToHavePixels(pixelRequired),
    width = _bestSizeToHavePixels.width,
    height = _bestSizeToHavePixels.height;
  assertIsTrue(width * height >= pixelRequired);
  return {
    width: width,
    height: height,
    create: function create() {
      var arrayBuffer = new ArrayBuffer(width * height * pixelBytes);
      var valueView = new Float32Array(arrayBuffer);
      var updateView = UpdateViewConstructor === Float32Array ? valueView : new UpdateViewConstructor(arrayBuffer);
      var image = new ImageAsset({
        width: width,
        height: height,
        _data: updateView,
        _compressed: false,
        format: pixelFormat
      });
      var textureAsset = new Texture2D();
      textureAsset.setFilters(TextureFilter.NEAREST, TextureFilter.NEAREST);
      textureAsset.setMipFilter(TextureFilter.NONE);
      textureAsset.setWrapMode(WrapMode.CLAMP_TO_EDGE, WrapMode.CLAMP_TO_EDGE, WrapMode.CLAMP_TO_EDGE);
      textureAsset.image = image;
      if (!textureAsset.getGFXTexture()) {
        warnID(16375);
      }
      var sampler = gfxDevice.getSampler(textureAsset.getSamplerInfo());
      return {
        get texture() {
          return textureAsset.getGFXTexture();
        },
        get sampler() {
          return sampler;
        },
        get valueView() {
          return valueView;
        },
        destroy: function destroy() {
          textureAsset.destroy();
        },
        updatePixels: function updatePixels() {
          textureAsset.uploadData(updateView);
        }
      };
    }
  };
}
function enableVertexId(mesh, subMeshIndex, gfxDevice) {
  mesh.renderingSubMeshes[subMeshIndex].enableVertexIdChannel(gfxDevice);
}
function bestSizeToHavePixels(nPixels) {
  if (nPixels < 5) {
    nPixels = 5;
  }
  var aligned = nextPow2(nPixels);
  var epxSum = log2(aligned);
  var h = epxSum >> 1;
  var w = epxSum & 1 ? h + 1 : h;
  return {
    width: 1 << w,
    height: 1 << h
  };
}

var MeshoptDecoder = {};
function initDecoderASM(asm_factory) {
  return Promise.all([asm_factory.ready]).then(function () {
    MeshoptDecoder.supported = asm_factory.supported;
    MeshoptDecoder.ready = Promise.resolve();
    MeshoptDecoder.decodeVertexBuffer = asm_factory.decodeVertexBuffer;
    MeshoptDecoder.decodeIndexBuffer = asm_factory.decodeIndexBuffer;
    MeshoptDecoder.decodeIndexSequence = asm_factory.decodeIndexSequence;
    MeshoptDecoder.decodeGltfBuffer = asm_factory.decodeGltfBuffer;
    MeshoptDecoder.useWorkers = asm_factory.useWorkers;
    MeshoptDecoder.decodeGltfBufferAsync = asm_factory.decodeGltfBufferAsync;
    logID(14202);
  });
}
function initDecoderWASM(wasm_factory, wasm_url) {
  function instantiate(importObject) {
    return instantiateWasm(wasm_url, importObject);
  }
  return Promise.all([wasm_factory.ready(instantiate)]).then(function () {
    MeshoptDecoder.supported = wasm_factory.supported;
    MeshoptDecoder.ready = Promise.resolve();
    MeshoptDecoder.decodeVertexBuffer = wasm_factory.decodeVertexBuffer;
    MeshoptDecoder.decodeIndexBuffer = wasm_factory.decodeIndexBuffer;
    MeshoptDecoder.decodeIndexSequence = wasm_factory.decodeIndexSequence;
    MeshoptDecoder.decodeGltfBuffer = wasm_factory.decodeGltfBuffer;
    MeshoptDecoder.useWorkers = wasm_factory.useWorkers;
    MeshoptDecoder.decodeGltfBufferAsync = wasm_factory.decodeGltfBufferAsync;
    logID(14203);
  });
}
function shouldUseWasmModule() {
  {
    return sys.hasFeature(sys.Feature.WASM);
  }
}
function InitDecoder() {
  var errorReport = function errorReport(msg) {
    error(msg);
  };
  return ensureWasmModuleReady().then(function () {
    if (shouldUseWasmModule()) {
      return Promise.all([import('./meshopt_decoder.wasm-BYpG-a2y.js'), import('./meshopt_decoder.wasm-Cb_cEELb.js')]).then(function (_ref) {
        var meshopt_wasm_factory = _ref[0]["default"],
          meshopt_wasm_url = _ref[1]["default"];
        return initDecoderWASM(meshopt_wasm_factory, meshopt_wasm_url);
      });
    } else {
      return import('./meshopt_decoder.asm-JLPh_vof.js').then(function (n) { return n.m; }).then(function (_ref2) {
        var meshopt_asm_factory = _ref2["default"];
        return initDecoderASM(meshopt_asm_factory);
      });
    }
  })["catch"](errorReport);
}
{
  game.onPostInfrastructureInitDelegate.add(InitDecoder);
}

var _dec, _class, _class2, _initializer, _initializer2, _initializer3;
var vec3Add = Vec3.add;
var vec3MultiplyScalar = Vec3.multiplyScalar;
var vec3Subtract = Vec3.subtract;
var aabbTransform = AABB.transform;
var aabbFromPoints = AABB.fromPoints;
var vec3Max = Vec3.max;
var vec3Min = Vec3.min;
var vec3TransformQuat = Vec3.transformQuat;
var vec3TransformMat4 = Vec3.transformMat4;
function getIndexStrideCtor(stride) {
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
var v3_1 = new Vec3();
var v3_2 = new Vec3();
var globalEmptyMeshBuffer = new Uint8Array();
var Mesh = (_dec = ccclass('cc.Mesh'), _dec(_class = (_class2 = function (_Asset) {
  function Mesh(name) {
    var _this;
    _this = _Asset.call(this, name) || this;
    _this.morphRendering = null;
    _this._struct = _initializer && _initializer();
    _this._hash = _initializer2 && _initializer2();
    _this._data = globalEmptyMeshBuffer;
    _this._initialized = false;
    _this._allowDataAccess = _initializer3 && _initializer3();
    _this._isMeshDataUploaded = false;
    _this._renderingSubMeshes = null;
    _this._boneSpaceBounds = new Map();
    _this._jointBufferIndices = null;
    return _this;
  }
  _inheritsLoose(Mesh, _Asset);
  var _proto = Mesh.prototype;
  _proto.onLoaded = function onLoaded() {
    this.initialize();
  };
  _proto.initialize = function initialize() {
    if (this._initialized) {
      return;
    }
    this._initialized = true;
    var info = {
      struct: this.struct,
      data: this.data
    };
    if (info.struct.compressed) {
      info = inflateMesh(info);
    }
    if (this.struct.encoded) {
      info = decodeMesh(info);
    }
    if (this.struct.quantized && !(deviceManager.gfxDevice.getFormatFeatures(Format.RGB16F) & FormatFeatureBit.VERTEX_ATTRIBUTE)) {
      info = dequantizeMesh(info);
    }
    this._struct = info.struct;
    this._data = info.data;
    if (this._struct.dynamic) {
      var device = deviceManager.gfxDevice;
      var vertexBuffers = [];
      var subMeshes = [];
      for (var i = 0; i < this._struct.vertexBundles.length; i++) {
        var vertexBundle = this._struct.vertexBundles[i];
        var vertexBuffer = device.createBuffer(new BufferInfo(BufferUsageBit.VERTEX | BufferUsageBit.TRANSFER_DST, MemoryUsageBit.DEVICE, vertexBundle.view.length, vertexBundle.view.stride));
        vertexBuffers.push(vertexBuffer);
      }
      for (var _i = 0; _i < this._struct.primitives.length; _i++) {
        var primitive = this._struct.primitives[_i];
        var indexView = primitive.indexView;
        var indexBuffer = null;
        if (indexView) {
          indexBuffer = device.createBuffer(new BufferInfo(BufferUsageBit.INDEX | BufferUsageBit.TRANSFER_DST, MemoryUsageBit.DEVICE, indexView.length, indexView.stride));
        }
        var subVBs = [];
        for (var k = 0; k < primitive.vertexBundelIndices.length; k++) {
          var idx = primitive.vertexBundelIndices[k];
          subVBs.push(vertexBuffers[idx]);
        }
        var allAttributes = [];
        for (var _k = 0; _k < primitive.vertexBundelIndices.length; _k++) {
          var _idx = primitive.vertexBundelIndices[_k];
          var attributes = this._struct.vertexBundles[_idx].attributes;
          for (var j = 0; j < attributes.length; j++) {
            var attr = attributes[j];
            var attribute = new Attribute();
            attribute.copy(attr);
            allAttributes.push(attribute);
          }
        }
        var subMesh = new RenderingSubMesh(subVBs, allAttributes, primitive.primitiveMode, indexBuffer);
        subMesh.drawInfo = new DrawInfo();
        subMesh.mesh = this;
        subMesh.subMeshIdx = _i;
        subMeshes.push(subMesh);
      }
      this._renderingSubMeshes = subMeshes;
    } else {
      var buffer = this._data.buffer;
      var gfxDevice = deviceManager.gfxDevice;
      var _vertexBuffers = this._createVertexBuffers(gfxDevice, buffer);
      var indexBuffers = [];
      var _subMeshes = [];
      for (var _i2 = 0; _i2 < this._struct.primitives.length; _i2++) {
        var prim = this._struct.primitives[_i2];
        if (prim.vertexBundelIndices.length === 0) {
          continue;
        }
        var _indexBuffer = null;
        var ib = void 0;
        if (prim.indexView) {
          var idxView = prim.indexView;
          var dstStride = idxView.stride;
          var dstSize = idxView.length;
          if (dstStride === 4 && !gfxDevice.hasFeature(Feature.ELEMENT_INDEX_UINT)) {
            var vertexCount = this._struct.vertexBundles[prim.vertexBundelIndices[0]].view.count;
            if (vertexCount >= 65536) {
              warnID(10001, vertexCount, 65536);
              continue;
            } else {
              dstStride >>= 1;
              dstSize >>= 1;
            }
          }
          _indexBuffer = gfxDevice.createBuffer(new BufferInfo(BufferUsageBit.INDEX, MemoryUsageBit.DEVICE, dstSize, dstStride));
          indexBuffers.push(_indexBuffer);
          ib = new (getIndexStrideCtor(idxView.stride))(buffer, idxView.offset, idxView.count);
          if (idxView.stride !== dstStride) {
            ib = getIndexStrideCtor(dstStride).from(ib);
          }
          _indexBuffer.update(ib);
        }
        var vbReference = prim.vertexBundelIndices.map(function (idx) {
          return _vertexBuffers[idx];
        });
        var gfxAttributes = [];
        if (prim.vertexBundelIndices.length > 0) {
          var _idx2 = prim.vertexBundelIndices[0];
          var _vertexBundle = this._struct.vertexBundles[_idx2];
          var attrs = _vertexBundle.attributes;
          for (var _j = 0; _j < attrs.length; ++_j) {
            var _attr = attrs[_j];
            gfxAttributes[_j] = new Attribute(_attr.name, _attr.format, _attr.isNormalized, _attr.stream, _attr.isInstanced, _attr.location);
          }
        }
        var _subMesh = new RenderingSubMesh(vbReference, gfxAttributes, prim.primitiveMode, _indexBuffer);
        _subMesh.mesh = this;
        _subMesh.subMeshIdx = _i2;
        _subMeshes.push(_subMesh);
      }
      this._renderingSubMeshes = _subMeshes;
      if (this._struct.morph) {
        this.morphRendering = createMorphRendering(this, gfxDevice);
      }
      this._isMeshDataUploaded = true;
      if (!this._allowDataAccess && !EDITOR) {
        this.releaseData();
      }
    }
  };
  _proto.updateSubMesh = function updateSubMesh(primitiveIndex, dynamicGeometry) {
    if (!this._struct.dynamic) {
      warnID(14200);
      return;
    }
    if (primitiveIndex >= this._struct.primitives.length) {
      warnID(14201);
      return;
    }
    var buffers = [];
    if (dynamicGeometry.positions.length > 0) {
      buffers.push(dynamicGeometry.positions);
    }
    if (dynamicGeometry.normals && dynamicGeometry.normals.length > 0) {
      buffers.push(dynamicGeometry.normals);
    }
    if (dynamicGeometry.uvs && dynamicGeometry.uvs.length > 0) {
      buffers.push(dynamicGeometry.uvs);
    }
    if (dynamicGeometry.tangents && dynamicGeometry.tangents.length > 0) {
      buffers.push(dynamicGeometry.tangents);
    }
    if (dynamicGeometry.colors && dynamicGeometry.colors.length > 0) {
      buffers.push(dynamicGeometry.colors);
    }
    if (dynamicGeometry.customAttributes) {
      for (var k = 0; k < dynamicGeometry.customAttributes.length; k++) {
        buffers.push(dynamicGeometry.customAttributes[k].values);
      }
    }
    var dynamic = this._struct.dynamic;
    var info = dynamic.info;
    var primitive = this._struct.primitives[primitiveIndex];
    var subMesh = this._renderingSubMeshes[primitiveIndex];
    var drawInfo = subMesh.drawInfo;
    for (var index = 0; index < buffers.length; index++) {
      var vertices = buffers[index];
      var bundle = this._struct.vertexBundles[primitive.vertexBundelIndices[index]];
      var stride = bundle.view.stride;
      var vertexCount = vertices.byteLength / stride;
      var updateSize = vertices.byteLength;
      var dstBuffer = new Uint8Array(this._data.buffer, bundle.view.offset, updateSize);
      var srcBuffer = new Uint8Array(vertices.buffer, vertices.byteOffset, updateSize);
      var vertexBuffer = subMesh.vertexBuffers[index];
      assertIsTrue(vertexCount <= info.maxSubMeshVertices, 'Too many vertices.');
      if (updateSize > 0) {
        dstBuffer.set(srcBuffer);
        vertexBuffer.update(srcBuffer, updateSize);
      }
      bundle.view.count = vertexCount;
      drawInfo.vertexCount = vertexCount;
    }
    if (primitive.indexView) {
      var indexView = primitive.indexView;
      var _stride = indexView.stride;
      var indexCount = _stride === 2 ? dynamicGeometry.indices16.length : dynamicGeometry.indices32.length;
      var _updateSize = indexCount * _stride;
      var _dstBuffer = new Uint8Array(this._data.buffer, indexView.offset, _updateSize);
      var _srcBuffer = _stride === 2 ? new Uint8Array(dynamicGeometry.indices16.buffer, dynamicGeometry.indices16.byteOffset, _updateSize) : new Uint8Array(dynamicGeometry.indices32.buffer, dynamicGeometry.indices32.byteOffset, _updateSize);
      var indexBuffer = subMesh.indexBuffer;
      assertIsTrue(indexCount <= info.maxSubMeshIndices, 'Too many indices.');
      if (_updateSize > 0) {
        _dstBuffer.set(_srcBuffer);
        indexBuffer.update(_srcBuffer, _updateSize);
      }
      indexView.count = indexCount;
      drawInfo.indexCount = indexCount;
    }
    if (dynamicGeometry.minPos && dynamicGeometry.maxPos) {
      var minPos = v3(dynamicGeometry.minPos.x, dynamicGeometry.minPos.y, dynamicGeometry.minPos.z);
      var maxPos = v3(dynamicGeometry.maxPos.x, dynamicGeometry.maxPos.y, dynamicGeometry.maxPos.z);
      if (!dynamic.bounds[primitiveIndex]) {
        dynamic.bounds[primitiveIndex] = new AABB();
      }
      aabbFromPoints(dynamic.bounds[primitiveIndex], minPos, maxPos);
      var subMin = v3();
      var subMax = v3();
      dynamic.bounds.forEach(function (bound) {
        if (bound) {
          bound.getBoundary(subMin, subMax);
          vec3Min(minPos, subMin, minPos);
          vec3Max(maxPos, subMax, maxPos);
        }
      });
      this._struct.minPosition = v3(minPos.x, minPos.y, minPos.z);
      this._struct.maxPosition = v3(maxPos.x, maxPos.y, maxPos.z);
    }
    subMesh.invalidateGeometricInfo();
  };
  _proto.destroy = function destroy() {
    this.destroyRenderingMesh();
    return _Asset.prototype.destroy.call(this);
  };
  _proto.destroyRenderingMesh = function destroyRenderingMesh() {
    if (this._renderingSubMeshes) {
      for (var i = 0; i < this._renderingSubMeshes.length; i++) {
        this._renderingSubMeshes[i].destroy();
      }
      this._renderingSubMeshes = null;
      this._initialized = false;
      this._isMeshDataUploaded = false;
    }
  };
  _proto.assign = function assign(struct, data) {
    this.reset({
      struct: struct,
      data: data
    });
  };
  _proto.reset = function reset(info) {
    this.destroyRenderingMesh();
    this._struct = info.struct;
    this._data = info.data;
    this._hash = 0;
  };
  _proto.getBoneSpaceBounds = function getBoneSpaceBounds(skeleton) {
    if (this._boneSpaceBounds.has(skeleton.hash)) {
      return this._boneSpaceBounds.get(skeleton.hash);
    }
    var bounds = [];
    this._boneSpaceBounds.set(skeleton.hash, bounds);
    var valid = [];
    var bindposes = skeleton.bindposes;
    for (var i = 0; i < bindposes.length; i++) {
      bounds.push(new AABB(Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity));
      valid.push(false);
    }
    var primitives = this._struct.primitives;
    for (var p = 0; p < primitives.length; p++) {
      var joints = this.readAttribute(p, AttributeName.ATTR_JOINTS);
      var weights = this.readAttribute(p, AttributeName.ATTR_WEIGHTS);
      var positions = this.readAttribute(p, AttributeName.ATTR_POSITION);
      if (!joints || !weights || !positions) {
        continue;
      }
      var vertCount = Math.min(joints.length / 4, weights.length / 4, positions.length / 3);
      for (var _i3 = 0; _i3 < vertCount; _i3++) {
        Vec3.set(v3_1, positions[3 * _i3 + 0], positions[3 * _i3 + 1], positions[3 * _i3 + 2]);
        for (var j = 0; j < 4; ++j) {
          var idx = 4 * _i3 + j;
          var joint = joints[idx];
          if (weights[idx] === 0 || joint >= bindposes.length) {
            continue;
          }
          vec3TransformMat4(v3_2, v3_1, bindposes[joint]);
          valid[joint] = true;
          var b = bounds[joint];
          vec3Min(b.center, b.center, v3_2);
          vec3Max(b.halfExtents, b.halfExtents, v3_2);
        }
      }
    }
    for (var _i4 = 0; _i4 < bindposes.length; _i4++) {
      var _b = bounds[_i4];
      if (!valid[_i4]) {
        bounds[_i4] = null;
      } else {
        aabbFromPoints(_b, _b.center, _b.halfExtents);
      }
    }
    return bounds;
  };
  _proto.merge = function merge(mesh, worldMatrix, validate) {
    if (validate) {
      if (!this.validateMergingMesh(mesh)) {
        return false;
      }
    }
    var vec3_temp = new Vec3();
    var rotate = worldMatrix && new Quat();
    var boundingBox = worldMatrix && new AABB();
    if (rotate) {
      worldMatrix.getRotation(rotate);
    }
    if (!this._initialized) {
      var struct = JSON.parse(JSON.stringify(mesh._struct));
      var data = mesh._data.slice();
      if (worldMatrix) {
        if (struct.maxPosition && struct.minPosition) {
          vec3Add(boundingBox.center, struct.maxPosition, struct.minPosition);
          vec3MultiplyScalar(boundingBox.center, boundingBox.center, 0.5);
          vec3Subtract(boundingBox.halfExtents, struct.maxPosition, struct.minPosition);
          vec3MultiplyScalar(boundingBox.halfExtents, boundingBox.halfExtents, 0.5);
          aabbTransform(boundingBox, boundingBox, worldMatrix);
          vec3Add(struct.maxPosition, boundingBox.center, boundingBox.halfExtents);
          vec3Subtract(struct.minPosition, boundingBox.center, boundingBox.halfExtents);
        }
        for (var i = 0; i < struct.vertexBundles.length; i++) {
          var vtxBdl = struct.vertexBundles[i];
          for (var j = 0; j < vtxBdl.attributes.length; j++) {
            if (vtxBdl.attributes[j].name === AttributeName.ATTR_POSITION || vtxBdl.attributes[j].name === AttributeName.ATTR_NORMAL) {
              var format = vtxBdl.attributes[j].format;
              var inputView = new DataView(data.buffer, vtxBdl.view.offset + getOffset(vtxBdl.attributes, j));
              var reader = getReader(inputView, format);
              var writer = getWriter(inputView, format);
              if (!reader || !writer) {
                continue;
              }
              var vertexCount = vtxBdl.view.count;
              var vertexStride = vtxBdl.view.stride;
              var attrComponentByteLength = getComponentByteLength(format);
              for (var vtxIdx = 0; vtxIdx < vertexCount; vtxIdx++) {
                var xOffset = vtxIdx * vertexStride;
                var yOffset = xOffset + attrComponentByteLength;
                var zOffset = yOffset + attrComponentByteLength;
                vec3_temp.set(reader(xOffset), reader(yOffset), reader(zOffset));
                switch (vtxBdl.attributes[j].name) {
                  case AttributeName.ATTR_POSITION:
                    vec3_temp.transformMat4(worldMatrix);
                    break;
                  case AttributeName.ATTR_NORMAL:
                    vec3TransformQuat(vec3_temp, vec3_temp, rotate);
                    break;
                }
                writer(xOffset, vec3_temp.x);
                writer(yOffset, vec3_temp.y);
                writer(zOffset, vec3_temp.z);
              }
            }
          }
        }
      }
      this.reset({
        struct: struct,
        data: data
      });
      this.initialize();
      return true;
    }
    var bufferBlob = new BufferBlob();
    var vertCount = 0;
    var vertStride = 0;
    var srcOffset = 0;
    var dstOffset = 0;
    var vb;
    var vbView;
    var srcVBView;
    var dstVBView;
    var srcAttrOffset = 0;
    var srcVBOffset = 0;
    var dstVBOffset = 0;
    var attrSize = 0;
    var dstAttrView;
    var hasAttr = false;
    var vertexBundles = new Array(this._struct.vertexBundles.length);
    for (var _i5 = 0; _i5 < this._struct.vertexBundles.length; ++_i5) {
      var bundle = this._struct.vertexBundles[_i5];
      var dstBundle = mesh._struct.vertexBundles[_i5];
      srcOffset = bundle.view.offset;
      dstOffset = dstBundle.view.offset;
      vertStride = bundle.view.stride;
      vertCount = bundle.view.count + dstBundle.view.count;
      vb = new ArrayBuffer(vertCount * vertStride);
      vbView = new Uint8Array(vb);
      srcVBView = this._data.subarray(srcOffset, srcOffset + bundle.view.length);
      srcOffset += srcVBView.length;
      dstVBView = mesh._data.subarray(dstOffset, dstOffset + dstBundle.view.length);
      dstOffset += dstVBView.length;
      vbView.set(srcVBView);
      srcAttrOffset = 0;
      for (var _iterator = _createForOfIteratorHelperLoose(bundle.attributes), _step; !(_step = _iterator()).done;) {
        var attr = _step.value;
        dstVBOffset = 0;
        hasAttr = false;
        for (var _iterator2 = _createForOfIteratorHelperLoose(dstBundle.attributes), _step2; !(_step2 = _iterator2()).done;) {
          var dstAttr = _step2.value;
          if (attr.name === dstAttr.name && attr.format === dstAttr.format) {
            hasAttr = true;
            break;
          }
          dstVBOffset += FormatInfos[dstAttr.format].size;
        }
        if (hasAttr) {
          attrSize = FormatInfos[attr.format].size;
          srcVBOffset = bundle.view.length + srcAttrOffset;
          for (var v = 0; v < dstBundle.view.count; ++v) {
            dstAttrView = dstVBView.subarray(dstVBOffset, dstVBOffset + attrSize);
            vbView.set(dstAttrView, srcVBOffset);
            if ((attr.name === AttributeName.ATTR_POSITION || attr.name === AttributeName.ATTR_NORMAL) && worldMatrix) {
              var f32_temp = new Float32Array(vbView.buffer, srcVBOffset, 3);
              vec3_temp.set(f32_temp[0], f32_temp[1], f32_temp[2]);
              switch (attr.name) {
                case AttributeName.ATTR_POSITION:
                  vec3_temp.transformMat4(worldMatrix);
                  break;
                case AttributeName.ATTR_NORMAL:
                  vec3TransformQuat(vec3_temp, vec3_temp, rotate);
                  break;
              }
              f32_temp[0] = vec3_temp.x;
              f32_temp[1] = vec3_temp.y;
              f32_temp[2] = vec3_temp.z;
            }
            srcVBOffset += bundle.view.stride;
            dstVBOffset += dstBundle.view.stride;
          }
        }
        srcAttrOffset += FormatInfos[attr.format].size;
      }
      vertexBundles[_i5] = {
        attributes: bundle.attributes,
        view: {
          offset: bufferBlob.getLength(),
          length: vb.byteLength,
          count: vertCount,
          stride: vertStride
        }
      };
      bufferBlob.addBuffer(vb);
    }
    var idxCount = 0;
    var idxStride = 2;
    var ibView;
    var srcIBView;
    var dstIBView;
    var primitives = new Array(this._struct.primitives.length);
    for (var _i6 = 0; _i6 < this._struct.primitives.length; ++_i6) {
      var prim = this._struct.primitives[_i6];
      var dstPrim = mesh._struct.primitives[_i6];
      primitives[_i6] = {
        primitiveMode: prim.primitiveMode,
        vertexBundelIndices: prim.vertexBundelIndices
      };
      var vertBatchCount = 0;
      for (var _iterator3 = _createForOfIteratorHelperLoose(prim.vertexBundelIndices), _step3; !(_step3 = _iterator3()).done;) {
        var bundleIdx = _step3.value;
        vertBatchCount = Math.max(vertBatchCount, this._struct.vertexBundles[bundleIdx].view.count);
      }
      if (prim.indexView && dstPrim.indexView) {
        idxCount = prim.indexView.count;
        idxCount += dstPrim.indexView.count;
        srcOffset = prim.indexView.offset;
        dstOffset = dstPrim.indexView.offset;
        if (idxCount < 256) {
          idxStride = 1;
        } else if (idxCount < 65536) {
          idxStride = 2;
        } else {
          idxStride = 4;
        }
        var ib = new ArrayBuffer(idxCount * idxStride);
        if (idxStride === 2) {
          ibView = new Uint16Array(ib);
        } else if (idxStride === 1) {
          ibView = new Uint8Array(ib);
        } else {
          ibView = new Uint32Array(ib);
        }
        if (prim.indexView.stride === 2) {
          srcIBView = new Uint16Array(this._data.buffer, srcOffset, prim.indexView.count);
        } else if (prim.indexView.stride === 1) {
          srcIBView = new Uint8Array(this._data.buffer, srcOffset, prim.indexView.count);
        } else {
          srcIBView = new Uint32Array(this._data.buffer, srcOffset, prim.indexView.count);
        }
        if (idxStride === prim.indexView.stride) {
          ibView.set(srcIBView);
        } else {
          for (var n = 0; n < prim.indexView.count; ++n) {
            ibView[n] = srcIBView[n];
          }
        }
        srcOffset += prim.indexView.length;
        if (dstPrim.indexView.stride === 2) {
          dstIBView = new Uint16Array(mesh._data.buffer, dstOffset, dstPrim.indexView.count);
        } else if (dstPrim.indexView.stride === 1) {
          dstIBView = new Uint8Array(mesh._data.buffer, dstOffset, dstPrim.indexView.count);
        } else {
          dstIBView = new Uint32Array(mesh._data.buffer, dstOffset, dstPrim.indexView.count);
        }
        for (var _n = 0; _n < dstPrim.indexView.count; ++_n) {
          ibView[prim.indexView.count + _n] = vertBatchCount + dstIBView[_n];
        }
        dstOffset += dstPrim.indexView.length;
        primitives[_i6].indexView = {
          offset: bufferBlob.getLength(),
          length: ib.byteLength,
          count: idxCount,
          stride: idxStride
        };
        bufferBlob.setNextAlignment(idxStride);
        bufferBlob.addBuffer(ib);
      }
    }
    var meshStruct = {
      vertexBundles: vertexBundles,
      primitives: primitives,
      minPosition: this._struct.minPosition,
      maxPosition: this._struct.maxPosition
    };
    if (meshStruct.minPosition && mesh._struct.minPosition && meshStruct.maxPosition && mesh._struct.maxPosition) {
      if (worldMatrix) {
        vec3Add(boundingBox.center, mesh._struct.maxPosition, mesh._struct.minPosition);
        vec3MultiplyScalar(boundingBox.center, boundingBox.center, 0.5);
        vec3Subtract(boundingBox.halfExtents, mesh._struct.maxPosition, mesh._struct.minPosition);
        vec3MultiplyScalar(boundingBox.halfExtents, boundingBox.halfExtents, 0.5);
        aabbTransform(boundingBox, boundingBox, worldMatrix);
        vec3Add(vec3_temp, boundingBox.center, boundingBox.halfExtents);
        vec3Max(meshStruct.maxPosition, meshStruct.maxPosition, vec3_temp);
        vec3Subtract(vec3_temp, boundingBox.center, boundingBox.halfExtents);
        vec3Min(meshStruct.minPosition, meshStruct.minPosition, vec3_temp);
      } else {
        vec3Min(meshStruct.minPosition, meshStruct.minPosition, mesh._struct.minPosition);
        vec3Max(meshStruct.maxPosition, meshStruct.maxPosition, mesh._struct.maxPosition);
      }
    }
    this.reset({
      struct: meshStruct,
      data: new Uint8Array(bufferBlob.getCombined())
    });
    this.initialize();
    return true;
  };
  _proto.validateMergingMesh = function validateMergingMesh(mesh) {
    if (this._struct.dynamic || mesh._struct.dynamic) {
      return false;
    }
    if (this._struct.vertexBundles.length !== mesh._struct.vertexBundles.length) {
      return false;
    }
    for (var i = 0; i < this._struct.vertexBundles.length; ++i) {
      var bundle = this._struct.vertexBundles[i];
      var dstBundle = mesh._struct.vertexBundles[i];
      if (bundle.attributes.length !== dstBundle.attributes.length) {
        return false;
      }
      for (var j = 0; j < bundle.attributes.length; ++j) {
        if (bundle.attributes[j].format !== dstBundle.attributes[j].format) {
          return false;
        }
      }
    }
    if (this._struct.primitives.length !== mesh._struct.primitives.length) {
      return false;
    }
    for (var _i7 = 0; _i7 < this._struct.primitives.length; ++_i7) {
      var prim = this._struct.primitives[_i7];
      var dstPrim = mesh._struct.primitives[_i7];
      if (prim.vertexBundelIndices.length !== dstPrim.vertexBundelIndices.length) {
        return false;
      }
      for (var _j2 = 0; _j2 < prim.vertexBundelIndices.length; ++_j2) {
        if (prim.vertexBundelIndices[_j2] !== dstPrim.vertexBundelIndices[_j2]) {
          return false;
        }
      }
      if (prim.primitiveMode !== dstPrim.primitiveMode) {
        return false;
      }
      if (prim.indexView) {
        if (dstPrim.indexView === undefined) {
          return false;
        }
      } else if (dstPrim.indexView) {
        return false;
      }
    }
    return true;
  };
  _proto.readAttribute = function readAttribute(primitiveIndex, attributeName) {
    var _this2 = this;
    var result = null;
    this._accessAttribute(primitiveIndex, attributeName, function (vertexBundle, iAttribute) {
      var vertexCount = vertexBundle.view.count;
      var format = vertexBundle.attributes[iAttribute].format;
      var StorageConstructor = getTypedArrayConstructor(FormatInfos[format]);
      if (vertexCount === 0) {
        return;
      }
      var inputView = new DataView(_this2._data.buffer, vertexBundle.view.offset + getOffset(vertexBundle.attributes, iAttribute));
      var formatInfo = FormatInfos[format];
      var reader = getReader(inputView, format);
      if (!StorageConstructor || !reader) {
        return;
      }
      var componentCount = formatInfo.count;
      var storage = new StorageConstructor(vertexCount * componentCount);
      var inputStride = vertexBundle.view.stride;
      for (var iVertex = 0; iVertex < vertexCount; ++iVertex) {
        for (var iComponent = 0; iComponent < componentCount; ++iComponent) {
          storage[componentCount * iVertex + iComponent] = reader(inputStride * iVertex + storage.BYTES_PER_ELEMENT * iComponent);
        }
      }
      result = storage;
    });
    return result;
  };
  _proto.copyAttribute = function copyAttribute(primitiveIndex, attributeName, buffer, stride, offset) {
    var _this3 = this;
    var written = false;
    this._accessAttribute(primitiveIndex, attributeName, function (vertexBundle, iAttribute) {
      var vertexCount = vertexBundle.view.count;
      if (vertexCount === 0) {
        written = true;
        return;
      }
      var format = vertexBundle.attributes[iAttribute].format;
      var inputView = new DataView(_this3._data.buffer, vertexBundle.view.offset + getOffset(vertexBundle.attributes, iAttribute));
      var outputView = new DataView(buffer, offset);
      var formatInfo = FormatInfos[format];
      var reader = getReader(inputView, format);
      var writer = getWriter(outputView, format);
      if (!reader || !writer) {
        return;
      }
      var componentCount = formatInfo.count;
      var inputStride = vertexBundle.view.stride;
      var inputComponentByteLength = getComponentByteLength(format);
      var outputStride = stride;
      var outputComponentByteLength = inputComponentByteLength;
      for (var iVertex = 0; iVertex < vertexCount; ++iVertex) {
        for (var iComponent = 0; iComponent < componentCount; ++iComponent) {
          var inputOffset = inputStride * iVertex + inputComponentByteLength * iComponent;
          var outputOffset = outputStride * iVertex + outputComponentByteLength * iComponent;
          writer(outputOffset, reader(inputOffset));
        }
      }
      written = true;
    });
    return written;
  };
  _proto.readIndices = function readIndices(primitiveIndex) {
    if (primitiveIndex >= this._struct.primitives.length) {
      return null;
    }
    var primitive = this._struct.primitives[primitiveIndex];
    if (!primitive.indexView) {
      return null;
    }
    var stride = primitive.indexView.stride;
    var Ctor = stride === 1 ? Uint8Array : stride === 2 ? Uint16Array : Uint32Array;
    return new Ctor(this._data.buffer, primitive.indexView.offset, primitive.indexView.count);
  };
  _proto.copyIndices = function copyIndices(primitiveIndex, outputArray) {
    if (primitiveIndex >= this._struct.primitives.length) {
      return false;
    }
    var primitive = this._struct.primitives[primitiveIndex];
    if (!primitive.indexView) {
      return false;
    }
    var indexCount = primitive.indexView.count;
    var indexFormat = primitive.indexView.stride === 1 ? Format.R8UI : primitive.indexView.stride === 2 ? Format.R16UI : Format.R32UI;
    var reader = getReader(new DataView(this._data.buffer), indexFormat);
    for (var i = 0; i < indexCount; ++i) {
      outputArray[i] = reader(primitive.indexView.offset + FormatInfos[indexFormat].size * i);
    }
    return true;
  };
  _proto.readAttributeFormat = function readAttributeFormat(primitiveIndex, attributeName) {
    var result = null;
    this._accessAttribute(primitiveIndex, attributeName, function (vertexBundle, iAttribute) {
      var format = vertexBundle.attributes[iAttribute].format;
      result = FormatInfos[format];
    });
    return result;
  };
  _proto._accessAttribute = function _accessAttribute(primitiveIndex, attributeName, accessor) {
    if (primitiveIndex >= this._struct.primitives.length) {
      return;
    }
    var vertexBundelIndices = this._struct.primitives[primitiveIndex].vertexBundelIndices;
    for (var i = 0; i < vertexBundelIndices.length; i++) {
      var vertexBundleIndex = vertexBundelIndices[i];
      var vertexBundle = this._struct.vertexBundles[vertexBundleIndex];
      var iAttribute = vertexBundle.attributes.findIndex(function (a) {
        return a.name === attributeName;
      });
      if (iAttribute < 0) {
        continue;
      }
      accessor(vertexBundle, iAttribute);
      break;
    }
  };
  _proto._createVertexBuffers = function _createVertexBuffers(gfxDevice, data) {
    return this._struct.vertexBundles.map(function (vertexBundle) {
      var vertexBuffer = gfxDevice.createBuffer(new BufferInfo(BufferUsageBit.VERTEX, MemoryUsageBit.DEVICE, vertexBundle.view.length, vertexBundle.view.stride));
      var view = new Uint8Array(data, vertexBundle.view.offset, vertexBundle.view.length);
      vertexBuffer.update(view);
      return vertexBuffer;
    });
  };
  _proto.initDefault = function initDefault(uuid) {
    _Asset.prototype.initDefault.call(this, uuid);
    this.reset({
      struct: {
        vertexBundles: [],
        primitives: []
      },
      data: globalEmptyMeshBuffer
    });
  };
  _proto.releaseData = function releaseData() {
    this._data = globalEmptyMeshBuffer;
  };
  return _createClass(Mesh, [{
    key: "_nativeAsset",
    get: function get() {
      return this._data.buffer;
    },
    set: function set(value) {
      this._data = new Uint8Array(value);
    }
  }, {
    key: "subMeshCount",
    get: function get() {
      var renderingMesh = this.renderingSubMeshes;
      return renderingMesh ? renderingMesh.length : 0;
    }
  }, {
    key: "minPosition",
    get: function get() {
      return this.struct.minPosition;
    }
  }, {
    key: "maxPosition",
    get: function get() {
      return this.struct.maxPosition;
    }
  }, {
    key: "struct",
    get: function get() {
      return this._struct;
    }
  }, {
    key: "data",
    get: function get() {
      return this._data;
    }
  }, {
    key: "hash",
    get: function get() {
      if (!this._hash) {
        this._hash = murmurhash2_32_gc(this._data, 666);
      }
      return this._hash;
    }
  }, {
    key: "jointBufferIndices",
    get: function get() {
      if (this._jointBufferIndices) {
        return this._jointBufferIndices;
      }
      return this._jointBufferIndices = this._struct.primitives.map(function (p) {
        return p.jointMapIndex || 0;
      });
    }
  }, {
    key: "renderingSubMeshes",
    get: function get() {
      this.initialize();
      return this._renderingSubMeshes;
    }
  }, {
    key: "allowDataAccess",
    get: function get() {
      return this._allowDataAccess;
    },
    set: function set(allowDataAccess) {
      this._allowDataAccess = allowDataAccess;
      if (this._isMeshDataUploaded && !this._allowDataAccess && !EDITOR) {
        this.releaseData();
      }
    }
  }]);
}(Asset), _initializer = applyDecoratedInitializer(_class2.prototype, "_struct", [serializable], function () {
  return {
    vertexBundles: [],
    primitives: []
  };
}), _initializer2 = applyDecoratedInitializer(_class2.prototype, "_hash", [serializable], function () {
  return 0;
}), _initializer3 = applyDecoratedInitializer(_class2.prototype, "_allowDataAccess", [serializable], function () {
  return true;
}), _class2)) || _class);
cclegacy.Mesh = Mesh;
function getOffset(attributes, attributeIndex) {
  var result = 0;
  for (var i = 0; i < attributeIndex; ++i) {
    var attribute = attributes[i];
    result += FormatInfos[attribute.format].size;
  }
  return result;
}
var isLittleEndian = sys.isLittleEndian;
function getComponentByteLength(format) {
  var info = FormatInfos[format];
  return info.size / info.count;
}
function getReader(dataView, format) {
  var info = FormatInfos[format];
  var stride = info.size / info.count;
  switch (info.type) {
    case FormatType.UNORM:
      {
        switch (stride) {
          case 1:
            return function (offset) {
              return dataView.getUint8(offset);
            };
          case 2:
            return function (offset) {
              return dataView.getUint16(offset, isLittleEndian);
            };
          case 4:
            return function (offset) {
              return dataView.getUint32(offset, isLittleEndian);
            };
        }
        break;
      }
    case FormatType.SNORM:
      {
        switch (stride) {
          case 1:
            return function (offset) {
              return dataView.getInt8(offset);
            };
          case 2:
            return function (offset) {
              return dataView.getInt16(offset, isLittleEndian);
            };
          case 4:
            return function (offset) {
              return dataView.getInt32(offset, isLittleEndian);
            };
        }
        break;
      }
    case FormatType.INT:
      {
        switch (stride) {
          case 1:
            return function (offset) {
              return dataView.getInt8(offset);
            };
          case 2:
            return function (offset) {
              return dataView.getInt16(offset, isLittleEndian);
            };
          case 4:
            return function (offset) {
              return dataView.getInt32(offset, isLittleEndian);
            };
        }
        break;
      }
    case FormatType.UINT:
      {
        switch (stride) {
          case 1:
            return function (offset) {
              return dataView.getUint8(offset);
            };
          case 2:
            return function (offset) {
              return dataView.getUint16(offset, isLittleEndian);
            };
          case 4:
            return function (offset) {
              return dataView.getUint32(offset, isLittleEndian);
            };
        }
        break;
      }
    case FormatType.FLOAT:
      {
        switch (stride) {
          case 2:
            return function (offset) {
              return dataView.getUint16(offset, isLittleEndian);
            };
          case 4:
            return function (offset) {
              return dataView.getFloat32(offset, isLittleEndian);
            };
        }
        break;
      }
  }
  return null;
}
function getWriter(dataView, format) {
  var info = FormatInfos[format];
  var stride = info.size / info.count;
  switch (info.type) {
    case FormatType.UNORM:
      {
        switch (stride) {
          case 1:
            return function (offset, value) {
              return dataView.setUint8(offset, value);
            };
          case 2:
            return function (offset, value) {
              return dataView.setUint16(offset, value, isLittleEndian);
            };
          case 4:
            return function (offset, value) {
              return dataView.setUint32(offset, value, isLittleEndian);
            };
        }
        break;
      }
    case FormatType.SNORM:
      {
        switch (stride) {
          case 1:
            return function (offset, value) {
              return dataView.setInt8(offset, value);
            };
          case 2:
            return function (offset, value) {
              return dataView.setInt16(offset, value, isLittleEndian);
            };
          case 4:
            return function (offset, value) {
              return dataView.setInt32(offset, value, isLittleEndian);
            };
        }
        break;
      }
    case FormatType.INT:
      {
        switch (stride) {
          case 1:
            return function (offset, value) {
              return dataView.setInt8(offset, value);
            };
          case 2:
            return function (offset, value) {
              return dataView.setInt16(offset, value, isLittleEndian);
            };
          case 4:
            return function (offset, value) {
              return dataView.setInt32(offset, value, isLittleEndian);
            };
        }
        break;
      }
    case FormatType.UINT:
      {
        switch (stride) {
          case 1:
            return function (offset, value) {
              return dataView.setUint8(offset, value);
            };
          case 2:
            return function (offset, value) {
              return dataView.setUint16(offset, value, isLittleEndian);
            };
          case 4:
            return function (offset, value) {
              return dataView.setUint32(offset, value, isLittleEndian);
            };
        }
        break;
      }
    case FormatType.FLOAT:
      {
        switch (stride) {
          case 2:
            return function (offset, value) {
              return dataView.setUint16(offset, value, isLittleEndian);
            };
          case 4:
            return function (offset, value) {
              return dataView.setFloat32(offset, value, isLittleEndian);
            };
        }
        break;
      }
  }
  return null;
}
function decodeMesh(mesh) {
  if (!mesh.struct.encoded) {
    return mesh;
  }
  var res_checker = function res_checker(res) {
    if (res < 0) {
      errorID(14204, res);
    }
  };
  var struct = JSON.parse(JSON.stringify(mesh.struct));
  var bufferBlob = new BufferBlob();
  bufferBlob.setNextAlignment(0);
  for (var _iterator4 = _createForOfIteratorHelperLoose(struct.vertexBundles), _step4; !(_step4 = _iterator4()).done;) {
    var bundle = _step4.value;
    var view = bundle.view;
    var bound = view.count * view.stride;
    var buffer = new Uint8Array(bound);
    var vertex = new Uint8Array(mesh.data.buffer, view.offset, view.length);
    var res = MeshoptDecoder.decodeVertexBuffer(buffer, view.count, view.stride, vertex);
    res_checker(res);
    bufferBlob.setNextAlignment(view.stride);
    var newView = {
      offset: bufferBlob.getLength(),
      length: buffer.byteLength,
      count: view.count,
      stride: view.stride
    };
    bundle.view = newView;
    bufferBlob.addBuffer(buffer);
  }
  for (var _iterator5 = _createForOfIteratorHelperLoose(struct.primitives), _step5; !(_step5 = _iterator5()).done;) {
    var primitive = _step5.value;
    if (primitive.indexView === undefined) {
      continue;
    }
    var _view = primitive.indexView;
    var _bound = _view.count * _view.stride;
    var _buffer = new Uint8Array(_bound);
    var index = new Uint8Array(mesh.data.buffer, _view.offset, _view.length);
    var _res = MeshoptDecoder.decodeIndexBuffer(_buffer, _view.count, _view.stride, index);
    res_checker(_res);
    bufferBlob.setNextAlignment(_view.stride);
    var _newView = {
      offset: bufferBlob.getLength(),
      length: _buffer.byteLength,
      count: _view.count,
      stride: _view.stride
    };
    primitive.indexView = _newView;
    bufferBlob.addBuffer(_buffer);
  }
  var data = new Uint8Array(bufferBlob.getCombined());
  return {
    struct: struct,
    data: data
  };
}
function inflateMesh(mesh) {
  var inflator = new _p.Inflate(mesh.data);
  var decompressed = inflator.decompress();
  mesh.data = decompressed;
  mesh.struct.compressed = false;
  return mesh;
}
function dequantizeMesh(mesh) {
  var struct = JSON.parse(JSON.stringify(mesh.struct));
  var bufferBlob = new BufferBlob();
  bufferBlob.setNextAlignment(0);
  function transformVertex(reader, writer, count, components, componentSize, readerStride, writerStride) {
    for (var i = 0; i < count; i++) {
      for (var j = 0; j < components; j++) {
        var inputOffset = readerStride * i + componentSize * j;
        var outputOffset = writerStride * i + componentSize * j;
        writer(outputOffset, reader(inputOffset));
      }
    }
  }
  function dequantizeHalf(reader, writer, count, components, readerStride, writerStride) {
    for (var i = 0; i < count; i++) {
      for (var j = 0; j < components; j++) {
        var inputOffset = readerStride * i + 2 * j;
        var outputOffset = writerStride * i + 4 * j;
        var value = halfToFloat(reader(inputOffset));
        writer(outputOffset, value);
      }
    }
  }
  for (var i = 0; i < struct.vertexBundles.length; ++i) {
    var bundle = struct.vertexBundles[i];
    var view = bundle.view;
    var attributes = bundle.attributes;
    var oldAttributes = mesh.struct.vertexBundles[i].attributes;
    var strides = [];
    var dequantizes = [];
    var readers = [];
    for (var j = 0; j < attributes.length; ++j) {
      var attr = attributes[j];
      var inputView = new DataView(mesh.data.buffer, view.offset + getOffset(oldAttributes, j));
      var reader = getReader(inputView, attr.format);
      var dequantize = true;
      switch (attr.format) {
        case Format.R16F:
          attr.format = Format.R32F;
          break;
        case Format.RG16F:
          attr.format = Format.RG32F;
          break;
        case Format.RGB16F:
          attr.format = Format.RGB32F;
          break;
        case Format.RGBA16F:
          attr.format = Format.RGBA32F;
          break;
        default:
          dequantize = false;
          break;
      }
      strides.push(FormatInfos[attr.format].size);
      dequantizes.push(dequantize);
      readers.push(reader);
    }
    var netStride = strides.reduce(function (acc, cur) {
      return acc + cur;
    }, 0);
    var newBuffer = new Uint8Array(netStride * view.count);
    for (var _j3 = 0; _j3 < attributes.length; ++_j3) {
      var attribute = attributes[_j3];
      var _reader = readers[_j3];
      var outputView = new DataView(newBuffer.buffer, getOffset(attributes, _j3));
      var writer = getWriter(outputView, attribute.format);
      var _dequantize = dequantizes[_j3];
      var formatInfo = FormatInfos[attribute.format];
      if (_dequantize) {
        dequantizeHalf(_reader, writer, view.count, formatInfo.count, view.stride, netStride);
      } else {
        transformVertex(_reader, writer, view.count, formatInfo.count, formatInfo.size / formatInfo.count, view.stride, netStride);
      }
    }
    bufferBlob.setNextAlignment(netStride);
    var newView = {
      offset: bufferBlob.getLength(),
      length: newBuffer.byteLength,
      count: view.count,
      stride: netStride
    };
    bundle.view = newView;
    bufferBlob.addBuffer(newBuffer);
  }
  for (var _iterator6 = _createForOfIteratorHelperLoose(struct.primitives), _step6; !(_step6 = _iterator6()).done;) {
    var primitive = _step6.value;
    if (primitive.indexView === undefined) {
      continue;
    }
    var _view2 = primitive.indexView;
    var buffer = new Uint8Array(mesh.data.buffer, _view2.offset, _view2.length);
    bufferBlob.setNextAlignment(_view2.stride);
    var _newView2 = {
      offset: bufferBlob.getLength(),
      length: buffer.byteLength,
      count: _view2.count,
      stride: _view2.stride
    };
    primitive.indexView = _newView2;
    bufferBlob.addBuffer(buffer);
  }
  var data = new Uint8Array(bufferBlob.getCombined());
  struct.quantized = false;
  return {
    struct: struct,
    data: data
  };
}

export { BufferBlob as B, Mesh as M, decodeMesh as d, inflateMesh as i };
//# sourceMappingURL=mesh-XWfHgs1t.js.map
