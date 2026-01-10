import './device-manager-CBXP-ttm.js';
import { a as AttributeName, x as FormatInfos, F as Format, A as Attribute, y as PrimitiveMode } from './buffer-barrier-BlQXg9Aa.js';
import { r as readBuffer, w as writeBuffer } from './debug-view-BuNhRPv_.js';
import { l as _createForOfIteratorHelperLoose } from './gc-object-CShF5lzx.js';
import { B as BufferBlob, M as Mesh, d as decodeMesh, i as inflateMesh } from './mesh-XWfHgs1t.js';
import { f as Vec3 } from './index-uXI1_UMk.js';

var _keyMap;
(function (_keyMap) {
  _keyMap[_keyMap["positions"] = AttributeName.ATTR_POSITION] = "positions";
  _keyMap[_keyMap["normals"] = AttributeName.ATTR_NORMAL] = "normals";
  _keyMap[_keyMap["uvs"] = AttributeName.ATTR_TEX_COORD] = "uvs";
  _keyMap[_keyMap["colors"] = AttributeName.ATTR_COLOR] = "colors";
})(_keyMap || (_keyMap = {}));
function readMesh(mesh, iPrimitive) {
  if (iPrimitive === void 0) {
    iPrimitive = 0;
  }
  var out = {
    positions: []
  };
  var dataView = new DataView(mesh.data.buffer, mesh.data.byteOffset, mesh.data.byteLength);
  var struct = mesh.struct;
  var primitive = struct.primitives[iPrimitive];
  primitive.vertexBundelIndices.forEach(function (idx) {
    var bundle = struct.vertexBundles[idx];
    var offset = bundle.view.offset;
    var _bundle$view = bundle.view,
      length = _bundle$view.length,
      stride = _bundle$view.stride;
    bundle.attributes.forEach(function (attr) {
      var name = _keyMap[attr.name];
      if (name) {
        out[name] = (out[name] || []).concat(readBuffer(dataView, attr.format, offset, length, stride));
      }
      offset += FormatInfos[attr.format].size;
    });
  });
  var view = primitive.indexView;
  out.indices = readBuffer(dataView, Format["R" + view.stride * 8 + "UI"], view.offset, view.length);
  return out;
}

var _defAttrs = [new Attribute(AttributeName.ATTR_POSITION, Format.RGB32F), new Attribute(AttributeName.ATTR_NORMAL, Format.RGB32F), new Attribute(AttributeName.ATTR_TEX_COORD, Format.RG32F), new Attribute(AttributeName.ATTR_TANGENT, Format.RGBA32F), new Attribute(AttributeName.ATTR_COLOR, Format.RGBA32F)];
var v3_1 = new Vec3();
function _createMesh(geometry, out, options) {
  options = options || {};
  var attributes = [];
  var stride = 0;
  var channels = [];
  var vertCount = 0;
  var attr;
  var positions = geometry.positions.slice();
  if (positions.length > 0) {
    attr = null;
    if (geometry.attributes) {
      attr = geometry.attributes.find(function (att) {
        return att.name === AttributeName.ATTR_POSITION;
      }) || null;
    }
    if (!attr) {
      attr = _defAttrs[0];
    }
    attributes.push(attr);
    var info = FormatInfos[attr.format];
    vertCount = Math.max(vertCount, Math.floor(positions.length / info.count));
    channels.push({
      offset: stride,
      data: positions,
      attribute: attr
    });
    stride += info.size;
  }
  if (geometry.normals && geometry.normals.length > 0) {
    attr = null;
    if (geometry.attributes) {
      attr = geometry.attributes.find(function (att) {
        return att.name === AttributeName.ATTR_NORMAL;
      }) || null;
    }
    if (!attr) {
      attr = _defAttrs[1];
    }
    var _info = FormatInfos[attr.format];
    attributes.push(attr);
    vertCount = Math.max(vertCount, Math.floor(geometry.normals.length / _info.count));
    channels.push({
      offset: stride,
      data: geometry.normals,
      attribute: attr
    });
    stride += _info.size;
  }
  if (geometry.uvs && geometry.uvs.length > 0) {
    attr = null;
    if (geometry.attributes) {
      attr = geometry.attributes.find(function (att) {
        return att.name === AttributeName.ATTR_TEX_COORD;
      }) || null;
    }
    if (!attr) {
      attr = _defAttrs[2];
    }
    var _info2 = FormatInfos[attr.format];
    attributes.push(attr);
    vertCount = Math.max(vertCount, Math.floor(geometry.uvs.length / _info2.count));
    channels.push({
      offset: stride,
      data: geometry.uvs,
      attribute: attr
    });
    stride += _info2.size;
  }
  if (geometry.tangents && geometry.tangents.length > 0) {
    attr = null;
    if (geometry.attributes) {
      attr = geometry.attributes.find(function (att) {
        return att.name === AttributeName.ATTR_TANGENT;
      }) || null;
    }
    if (!attr) {
      attr = _defAttrs[3];
    }
    var _info3 = FormatInfos[attr.format];
    attributes.push(attr);
    vertCount = Math.max(vertCount, Math.floor(geometry.tangents.length / _info3.count));
    channels.push({
      offset: stride,
      data: geometry.tangents,
      attribute: attr
    });
    stride += _info3.size;
  }
  if (geometry.colors && geometry.colors.length > 0) {
    attr = null;
    if (geometry.attributes) {
      attr = geometry.attributes.find(function (att) {
        return att.name === AttributeName.ATTR_COLOR;
      }) || null;
    }
    if (!attr) {
      attr = _defAttrs[4];
    }
    var _info4 = FormatInfos[attr.format];
    attributes.push(attr);
    vertCount = Math.max(vertCount, Math.floor(geometry.colors.length / _info4.count));
    channels.push({
      offset: stride,
      data: geometry.colors,
      attribute: attr
    });
    stride += _info4.size;
  }
  if (geometry.customAttributes) {
    for (var k = 0; k < geometry.customAttributes.length; k++) {
      var ca = geometry.customAttributes[k];
      var _info5 = FormatInfos[ca.attr.format];
      attributes.push(ca.attr);
      vertCount = Math.max(vertCount, Math.floor(ca.values.length / _info5.count));
      channels.push({
        offset: stride,
        data: ca.values,
        attribute: ca.attr
      });
      stride += _info5.size;
    }
  }
  var bufferBlob = new BufferBlob();
  var vertexBuffer = new ArrayBuffer(vertCount * stride);
  var vertexBufferView = new DataView(vertexBuffer);
  channels.forEach(function (channel) {
    writeBuffer(vertexBufferView, channel.data, channel.attribute.format, channel.offset, stride);
  });
  bufferBlob.setNextAlignment(0);
  var vertexBundle = {
    attributes: attributes,
    view: {
      offset: bufferBlob.getLength(),
      length: vertexBuffer.byteLength,
      count: vertCount,
      stride: stride
    }
  };
  bufferBlob.addBuffer(vertexBuffer);
  var indexBuffer = null;
  var idxCount = 0;
  var idxStride = 2;
  if (geometry.indices) {
    var indices = geometry.indices;
    idxCount = indices.length;
    indexBuffer = new ArrayBuffer(idxStride * idxCount);
    var indexBufferView = new DataView(indexBuffer);
    writeBuffer(indexBufferView, indices, Format.R16UI);
  }
  var primitive = {
    primitiveMode: geometry.primitiveMode || PrimitiveMode.TRIANGLE_LIST,
    vertexBundelIndices: [0]
  };
  if (indexBuffer) {
    bufferBlob.setNextAlignment(idxStride);
    primitive.indexView = {
      offset: bufferBlob.getLength(),
      length: indexBuffer.byteLength,
      count: idxCount,
      stride: idxStride
    };
    bufferBlob.addBuffer(indexBuffer);
  }
  var minPosition = geometry.minPos;
  if (!minPosition && options.calculateBounds) {
    minPosition = Vec3.set(new Vec3(), Infinity, Infinity, Infinity);
    for (var iVertex = 0; iVertex < vertCount; ++iVertex) {
      Vec3.set(v3_1, positions[iVertex * 3 + 0], positions[iVertex * 3 + 1], positions[iVertex * 3 + 2]);
      Vec3.min(minPosition, minPosition, v3_1);
    }
  }
  var maxPosition = geometry.maxPos;
  if (!maxPosition && options.calculateBounds) {
    maxPosition = Vec3.set(new Vec3(), -Infinity, -Infinity, -Infinity);
    for (var _iVertex = 0; _iVertex < vertCount; ++_iVertex) {
      Vec3.set(v3_1, positions[_iVertex * 3 + 0], positions[_iVertex * 3 + 1], positions[_iVertex * 3 + 2]);
      Vec3.max(maxPosition, maxPosition, v3_1);
    }
  }
  var meshStruct = {
    vertexBundles: [vertexBundle],
    primitives: [primitive]
  };
  if (minPosition) {
    meshStruct.minPosition = new Vec3(minPosition.x, minPosition.y, minPosition.z);
  }
  if (maxPosition) {
    meshStruct.maxPosition = new Vec3(maxPosition.x, maxPosition.y, maxPosition.z);
  }
  if (!out) {
    out = new Mesh();
  }
  out.reset({
    struct: meshStruct,
    data: new Uint8Array(bufferBlob.getCombined())
  });
  return out;
}
function getPadding(length, align) {
  if (align > 0) {
    var remainder = length % align;
    if (remainder !== 0) {
      var padding = align - remainder;
      return padding;
    }
  }
  return 0;
}
function _createDynamicMesh(primitiveIndex, geometry, out, options) {
  options = options || {
    maxSubMeshes: 1,
    maxSubMeshVertices: 1024,
    maxSubMeshIndices: 1024
  };
  var attributes = [];
  var stream = 0;
  if (geometry.positions.length > 0) {
    attributes.push(new Attribute(AttributeName.ATTR_POSITION, Format.RGB32F, false, stream++, false, 0));
  }
  if (geometry.normals && geometry.normals.length > 0) {
    attributes.push(new Attribute(AttributeName.ATTR_NORMAL, Format.RGB32F, false, stream++, false, 0));
  }
  if (geometry.uvs && geometry.uvs.length > 0) {
    attributes.push(new Attribute(AttributeName.ATTR_TEX_COORD, Format.RG32F, false, stream++, false, 0));
  }
  if (geometry.tangents && geometry.tangents.length > 0) {
    attributes.push(new Attribute(AttributeName.ATTR_TANGENT, Format.RGBA32F, false, stream++, false, 0));
  }
  if (geometry.colors && geometry.colors.length > 0) {
    attributes.push(new Attribute(AttributeName.ATTR_COLOR, Format.RGBA32F, false, stream++, false, 0));
  }
  if (geometry.customAttributes) {
    for (var k = 0; k < geometry.customAttributes.length; k++) {
      var ca = geometry.customAttributes[k];
      var attr = new Attribute();
      attr.copy(ca.attr);
      attr.stream = stream++;
      attributes.push(attr);
    }
  }
  var vertexBundles = [];
  var primitives = [];
  var dataSize = 0;
  for (var i = 0; i < options.maxSubMeshes; i++) {
    var primitive = {
      vertexBundelIndices: [],
      primitiveMode: geometry.primitiveMode || PrimitiveMode.TRIANGLE_LIST
    };
    for (var _iterator = _createForOfIteratorHelperLoose(attributes), _step; !(_step = _iterator()).done;) {
      var _attr = _step.value;
      var formatInfo = FormatInfos[_attr.format];
      var vertexBufferSize = options.maxSubMeshVertices * formatInfo.size;
      var vertexView = {
        offset: dataSize,
        length: vertexBufferSize,
        count: 0,
        stride: formatInfo.size
      };
      var vertexBundle = {
        view: vertexView,
        attributes: [_attr]
      };
      var vertexBundleIndex = vertexBundles.length;
      primitive.vertexBundelIndices.push(vertexBundleIndex);
      vertexBundles.push(vertexBundle);
      dataSize += vertexBufferSize;
    }
    var stride = 0;
    if (geometry.indices16 && geometry.indices16.length > 0) {
      stride = 2;
    } else if (geometry.indices32 && geometry.indices32.length > 0) {
      stride = 4;
    }
    if (stride > 0) {
      dataSize += getPadding(dataSize, stride);
      var indexBufferSize = options.maxSubMeshIndices * stride;
      var indexView = {
        offset: dataSize,
        length: indexBufferSize,
        count: 0,
        stride: stride
      };
      primitive.indexView = indexView;
      dataSize += indexBufferSize;
    }
    primitives.push(primitive);
  }
  var dynamicInfo = {
    maxSubMeshes: options.maxSubMeshes,
    maxSubMeshVertices: options.maxSubMeshVertices,
    maxSubMeshIndices: options.maxSubMeshIndices
  };
  var dynamicStruct = {
    info: dynamicInfo,
    bounds: []
  };
  dynamicStruct.bounds.length = options.maxSubMeshes;
  var meshStruct = {
    vertexBundles: vertexBundles,
    primitives: primitives,
    dynamic: dynamicStruct
  };
  var createInfo = {
    struct: meshStruct,
    data: new Uint8Array(dataSize)
  };
  if (!out) {
    out = new Mesh();
  }
  out.reset(createInfo);
  out.initialize();
  out.updateSubMesh(primitiveIndex, geometry);
  return out;
}
var MeshUtils = function () {
  function MeshUtils() {}
  MeshUtils.createMesh = function createMesh(geometry, out, options) {
    return _createMesh(geometry, out, options);
  };
  MeshUtils.createDynamicMesh = function createDynamicMesh(primitiveIndex, geometry, out, options) {
    return _createDynamicMesh(primitiveIndex, geometry, out, options);
  };
  MeshUtils.decodeMesh = function decodeMesh$1(mesh) {
    return decodeMesh(mesh);
  };
  MeshUtils.inflateMesh = function inflateMesh$1(mesh) {
    return inflateMesh(mesh);
  };
  return MeshUtils;
}();

export { MeshUtils as M, _createMesh as _, readMesh as r };
//# sourceMappingURL=create-mesh-CfKC5EQd.js.map
