import { _ as _inheritsLoose, D as debug } from './gc-object-CShF5lzx.js';
import { k as DescriptorSet, r as Buffer, g as CommandBuffer, l as Framebuffer, o as InputAssembler, j as DescriptorSetLayout, i as PipelineLayout, h as PipelineState, Q as Queue, n as RenderPass, S as Shader, aP as IsPowerOf2, aJ as FormatSurfaceSize, q as Texture, F as Format, s as Swapchain, $ as API, a$ as QueueInfo, b0 as QueueType, aq as CommandBufferInfo, p as Sampler, G as GeneralBarrier, T as TextureBarrier, f as BufferBarrier, t as Device } from './buffer-barrier-BlQXg9Aa.js';
import './index-uXI1_UMk.js';
import { c as cclegacy, l as legacyCC } from './global-exports-DnCP_14L.js';
import './_virtual_internal_constants-DWlew7Dp.js';

var EmptyDescriptorSet = function (_DescriptorSet) {
  function EmptyDescriptorSet() {
    return _DescriptorSet.apply(this, arguments) || this;
  }
  _inheritsLoose(EmptyDescriptorSet, _DescriptorSet);
  var _proto = EmptyDescriptorSet.prototype;
  _proto.initialize = function initialize(info) {
    this._layout = info.layout;
  };
  _proto.destroy = function destroy() {};
  _proto.update = function update() {};
  return EmptyDescriptorSet;
}(DescriptorSet);

var EmptyBuffer = function (_Buffer) {
  function EmptyBuffer() {
    return _Buffer.apply(this, arguments) || this;
  }
  _inheritsLoose(EmptyBuffer, _Buffer);
  var _proto = EmptyBuffer.prototype;
  _proto.initialize = function initialize(info) {
    if ('buffer' in info) {
      this._isBufferView = true;
      var buffer = info.buffer;
      this._usage = buffer.usage;
      this._memUsage = buffer.memUsage;
      this._size = this._stride = info.range;
      this._count = 1;
      this._flags = buffer.flags;
    } else {
      this._usage = info.usage;
      this._memUsage = info.memUsage;
      this._size = info.size;
      this._stride = Math.max(info.stride || this._size, 1);
      this._count = this._size / this._stride;
      this._flags = info.flags;
    }
  };
  _proto.destroy = function destroy() {};
  _proto.resize = function resize(size) {};
  _proto.update = function update(buffer, size) {};
  return EmptyBuffer;
}(Buffer);

var EmptyCommandBuffer = function (_CommandBuffer) {
  function EmptyCommandBuffer() {
    return _CommandBuffer.apply(this, arguments) || this;
  }
  _inheritsLoose(EmptyCommandBuffer, _CommandBuffer);
  var _proto = EmptyCommandBuffer.prototype;
  _proto.initialize = function initialize(info) {
    this._type = info.type;
    this._queue = info.queue;
  };
  _proto.destroy = function destroy() {};
  _proto.begin = function begin(renderPass, subpass, frameBuffer) {};
  _proto.end = function end() {};
  _proto.beginRenderPass = function beginRenderPass(renderPass, framebuffer, renderArea, clearColors, clearDepth, clearStencil) {};
  _proto.endRenderPass = function endRenderPass() {};
  _proto.bindPipelineState = function bindPipelineState(pipelineState) {};
  _proto.bindDescriptorSet = function bindDescriptorSet(set, descriptorSet, dynamicOffsets) {};
  _proto.bindInputAssembler = function bindInputAssembler(inputAssembler) {};
  _proto.setViewport = function setViewport(viewport) {};
  _proto.setScissor = function setScissor(scissor) {};
  _proto.setLineWidth = function setLineWidth(lineWidth) {};
  _proto.setDepthBias = function setDepthBias(depthBiasConstantFactor, depthBiasClamp, depthBiasSlopeFactor) {};
  _proto.setBlendConstants = function setBlendConstants(blendConstants) {};
  _proto.setDepthBound = function setDepthBound(minDepthBounds, maxDepthBounds) {};
  _proto.setStencilWriteMask = function setStencilWriteMask(face, writeMask) {};
  _proto.setStencilCompareMask = function setStencilCompareMask(face, reference, compareMask) {};
  _proto.draw = function draw(infoOrAssembler) {};
  _proto.updateBuffer = function updateBuffer(buffer, data, size) {};
  _proto.copyBuffersToTexture = function copyBuffersToTexture(buffers, texture, regions) {};
  _proto.execute = function execute(cmdBuffs, count) {};
  _proto.pipelineBarrier = function pipelineBarrier(GeneralBarrier, bufferBarriers, buffers, textureBarriers, textures) {};
  _proto.blitTexture = function blitTexture(srcTexture, dstTexture, regions, filter) {};
  return EmptyCommandBuffer;
}(CommandBuffer);

var EmptyFramebuffer = function (_Framebuffer) {
  function EmptyFramebuffer() {
    return _Framebuffer.apply(this, arguments) || this;
  }
  _inheritsLoose(EmptyFramebuffer, _Framebuffer);
  var _proto = EmptyFramebuffer.prototype;
  _proto.initialize = function initialize(info) {
    this._renderPass = info.renderPass;
    this._colorTextures = info.colorTextures || [];
    this._depthStencilTexture = info.depthStencilTexture || null;
  };
  _proto.destroy = function destroy() {};
  return EmptyFramebuffer;
}(Framebuffer);

var EmptyInputAssembler = function (_InputAssembler) {
  function EmptyInputAssembler() {
    return _InputAssembler.apply(this, arguments) || this;
  }
  _inheritsLoose(EmptyInputAssembler, _InputAssembler);
  var _proto = EmptyInputAssembler.prototype;
  _proto.initialize = function initialize(info) {
    this._attributes = info.attributes;
    this._attributesHash = this.computeAttributesHash();
    this._vertexBuffers = info.vertexBuffers;
    if (info.indexBuffer) {
      this._indexBuffer = info.indexBuffer;
      this._drawInfo.indexCount = this._indexBuffer.size / this._indexBuffer.stride;
      this._drawInfo.firstIndex = 0;
    } else {
      var vertBuff = this._vertexBuffers[0];
      this._drawInfo.vertexCount = vertBuff.size / vertBuff.stride;
      this._drawInfo.firstVertex = 0;
      this._drawInfo.vertexOffset = 0;
    }
  };
  _proto.destroy = function destroy() {};
  return EmptyInputAssembler;
}(InputAssembler);

var EmptyDescriptorSetLayout = function (_DescriptorSetLayout) {
  function EmptyDescriptorSetLayout() {
    return _DescriptorSetLayout.apply(this, arguments) || this;
  }
  _inheritsLoose(EmptyDescriptorSetLayout, _DescriptorSetLayout);
  var _proto = EmptyDescriptorSetLayout.prototype;
  _proto.initialize = function initialize(info) {
    Array.prototype.push.apply(this._bindings, info.bindings);
  };
  _proto.destroy = function destroy() {};
  return EmptyDescriptorSetLayout;
}(DescriptorSetLayout);

var EmptyPipelineLayout = function (_PipelineLayout) {
  function EmptyPipelineLayout() {
    return _PipelineLayout.apply(this, arguments) || this;
  }
  _inheritsLoose(EmptyPipelineLayout, _PipelineLayout);
  var _proto = EmptyPipelineLayout.prototype;
  _proto.initialize = function initialize(info) {
    Array.prototype.push.apply(this._setLayouts, info.setLayouts);
  };
  _proto.destroy = function destroy() {};
  return EmptyPipelineLayout;
}(PipelineLayout);

var EmptyPipelineState = function (_PipelineState) {
  function EmptyPipelineState() {
    return _PipelineState.apply(this, arguments) || this;
  }
  _inheritsLoose(EmptyPipelineState, _PipelineState);
  var _proto = EmptyPipelineState.prototype;
  _proto.initialize = function initialize(info) {
    this._primitive = info.primitive;
    this._shader = info.shader;
    this._pipelineLayout = info.pipelineLayout;
    var bs = this._bs;
    if (info.blendState) {
      var bsInfo = info.blendState;
      var targets = bsInfo.targets;
      if (targets) {
        targets.forEach(function (t, i) {
          bs.setTarget(i, t);
        });
      }
      if (bsInfo.isA2C !== undefined) {
        bs.isA2C = bsInfo.isA2C;
      }
      if (bsInfo.isIndepend !== undefined) {
        bs.isIndepend = bsInfo.isIndepend;
      }
      if (bsInfo.blendColor !== undefined) {
        bs.blendColor = bsInfo.blendColor;
      }
    }
    Object.assign(this._rs, info.rasterizerState);
    Object.assign(this._dss, info.depthStencilState);
    this._is = info.inputState;
    this._renderPass = info.renderPass;
    this._dynamicStates = info.dynamicStates;
  };
  _proto.destroy = function destroy() {};
  return EmptyPipelineState;
}(PipelineState);

var EmptyQueue = function (_Queue) {
  function EmptyQueue() {
    return _Queue.apply(this, arguments) || this;
  }
  _inheritsLoose(EmptyQueue, _Queue);
  var _proto = EmptyQueue.prototype;
  _proto.initialize = function initialize(info) {
    this._type = info.type;
  };
  _proto.destroy = function destroy() {};
  _proto.submit = function submit(cmdBuffs) {};
  return EmptyQueue;
}(Queue);

var EmptyRenderPass = function (_RenderPass) {
  function EmptyRenderPass() {
    return _RenderPass.apply(this, arguments) || this;
  }
  _inheritsLoose(EmptyRenderPass, _RenderPass);
  var _proto = EmptyRenderPass.prototype;
  _proto.initialize = function initialize(info) {
    this._colorInfos = info.colorAttachments;
    this._depthStencilInfo = info.depthStencilAttachment;
    this._subpasses = info.subpasses;
    this._hash = this.computeHash();
  };
  _proto.destroy = function destroy() {};
  return EmptyRenderPass;
}(RenderPass);

var EmptyShader = function (_Shader) {
  function EmptyShader() {
    return _Shader.apply(this, arguments) || this;
  }
  _inheritsLoose(EmptyShader, _Shader);
  var _proto = EmptyShader.prototype;
  _proto.initialize = function initialize(info) {
    debug("Shader '" + info.name + "' compilation succeeded.");
  };
  _proto.destroy = function destroy() {};
  return EmptyShader;
}(Shader);

var EmptyTexture = function (_Texture) {
  function EmptyTexture() {
    return _Texture.apply(this, arguments) || this;
  }
  _inheritsLoose(EmptyTexture, _Texture);
  var _proto = EmptyTexture.prototype;
  _proto.initialize = function initialize(info, isSwapchainTexture) {
    var texInfo = info;
    if ('texture' in info) {
      texInfo = info.texture.info;
      this._isTextureView = true;
      this._viewInfo.copy(info);
    } else {
      this._viewInfo.texture = this;
      this._viewInfo.type = info.type;
      this._viewInfo.format = info.format;
      this._viewInfo.baseLevel = 0;
      this._viewInfo.levelCount = 1;
      this._viewInfo.baseLayer = 0;
      this._viewInfo.layerCount = 1;
    }
    this._info.copy(texInfo);
    this._isPowerOf2 = IsPowerOf2(this._info.width) && IsPowerOf2(this._info.height);
    this._size = FormatSurfaceSize(this._info.format, this.width, this.height, this.depth, this._info.levelCount) * this._info.layerCount;
  };
  _proto.destroy = function destroy() {};
  _proto.getTextureHandle = function getTextureHandle() {
    return 0;
  };
  _proto.resize = function resize(width, height) {
    this._info.width = width;
    this._info.height = height;
  };
  _proto.initAsSwapchainTexture = function initAsSwapchainTexture(info) {};
  return EmptyTexture;
}(Texture);

var EmptySwapchain = function (_Swapchain) {
  function EmptySwapchain() {
    return _Swapchain.apply(this, arguments) || this;
  }
  _inheritsLoose(EmptySwapchain, _Swapchain);
  var _proto = EmptySwapchain.prototype;
  _proto.initialize = function initialize(info) {
    this._colorTexture = new EmptyTexture();
    this._colorTexture.initAsSwapchainTexture({
      swapchain: this,
      format: Format.RGBA8,
      width: info.width,
      height: info.height
    });
    this._depthStencilTexture = new EmptyTexture();
    this._depthStencilTexture.initAsSwapchainTexture({
      swapchain: this,
      format: Format.DEPTH_STENCIL,
      width: info.width,
      height: info.height
    });
  };
  _proto.destroy = function destroy() {};
  _proto.resize = function resize(width, height, surfaceTransform) {};
  return EmptySwapchain;
}(Swapchain);

var EmptyDevice = function (_Device) {
  function EmptyDevice() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _Device.call.apply(_Device, [this].concat(args)) || this;
    _this._swapchain = null;
    return _this;
  }
  _inheritsLoose(EmptyDevice, _Device);
  var _proto = EmptyDevice.prototype;
  _proto.initialize = function initialize(info) {
    this._gfxAPI = API.UNKNOWN;
    this._bindingMappingInfo = info.bindingMappingInfo;
    this._queue = this.createQueue(new QueueInfo(QueueType.GRAPHICS));
    this._cmdBuff = this.createCommandBuffer(new CommandBufferInfo(this._queue));
    debug('Empty device initialized.');
    return true;
  };
  _proto.destroy = function destroy() {
    if (this._queue) {
      this._queue.destroy();
      this._queue = null;
    }
    if (this._cmdBuff) {
      this._cmdBuff.destroy();
      this._cmdBuff = null;
    }
    this._swapchain = null;
  };
  _proto.flushCommands = function flushCommands(cmdBuffs) {};
  _proto.acquire = function acquire(swapchains) {};
  _proto.present = function present() {};
  _proto.createCommandBuffer = function createCommandBuffer(info) {
    var cmdBuff = new EmptyCommandBuffer();
    cmdBuff.initialize(info);
    return cmdBuff;
  };
  _proto.createSwapchain = function createSwapchain(info) {
    var swapchain = new EmptySwapchain();
    this._swapchain = swapchain;
    swapchain.initialize(info);
    return swapchain;
  };
  _proto.createBuffer = function createBuffer(info) {
    var buffer = new EmptyBuffer();
    buffer.initialize(info);
    return buffer;
  };
  _proto.createTexture = function createTexture(info) {
    var texture = new EmptyTexture();
    texture.initialize(info);
    return texture;
  };
  _proto.createDescriptorSet = function createDescriptorSet(info) {
    var descriptorSet = new EmptyDescriptorSet();
    descriptorSet.initialize(info);
    return descriptorSet;
  };
  _proto.createShader = function createShader(info) {
    var shader = new EmptyShader();
    shader.initialize(info);
    return shader;
  };
  _proto.createInputAssembler = function createInputAssembler(info) {
    var inputAssembler = new EmptyInputAssembler();
    inputAssembler.initialize(info);
    return inputAssembler;
  };
  _proto.createRenderPass = function createRenderPass(info) {
    var renderPass = new EmptyRenderPass();
    renderPass.initialize(info);
    return renderPass;
  };
  _proto.createFramebuffer = function createFramebuffer(info) {
    var framebuffer = new EmptyFramebuffer();
    framebuffer.initialize(info);
    return framebuffer;
  };
  _proto.createDescriptorSetLayout = function createDescriptorSetLayout(info) {
    var descriptorSetLayout = new EmptyDescriptorSetLayout();
    descriptorSetLayout.initialize(info);
    return descriptorSetLayout;
  };
  _proto.createPipelineLayout = function createPipelineLayout(info) {
    var pipelineLayout = new EmptyPipelineLayout();
    pipelineLayout.initialize(info);
    return pipelineLayout;
  };
  _proto.createPipelineState = function createPipelineState(info) {
    var pipelineState = new EmptyPipelineState();
    pipelineState.initialize(info);
    return pipelineState;
  };
  _proto.createQueue = function createQueue(info) {
    var queue = new EmptyQueue();
    queue.initialize(info);
    return queue;
  };
  _proto.getSampler = function getSampler(info) {
    var hash = Sampler.computeHash(info);
    if (!this._samplers.has(hash)) {
      this._samplers.set(hash, new Sampler(info, hash));
    }
    return this._samplers.get(hash);
  };
  _proto.getSwapchains = function getSwapchains() {
    return [this._swapchain];
  };
  _proto.getGeneralBarrier = function getGeneralBarrier(info) {
    var hash = GeneralBarrier.computeHash(info);
    if (!this._generalBarrierss.has(hash)) {
      this._generalBarrierss.set(hash, new GeneralBarrier(info, hash));
    }
    return this._generalBarrierss.get(hash);
  };
  _proto.getTextureBarrier = function getTextureBarrier(info) {
    var hash = TextureBarrier.computeHash(info);
    if (!this._textureBarriers.has(hash)) {
      this._textureBarriers.set(hash, new TextureBarrier(info, hash));
    }
    return this._textureBarriers.get(hash);
  };
  _proto.getBufferBarrier = function getBufferBarrier(info) {
    var hash = BufferBarrier.computeHash(info);
    if (!this._bufferBarriers.has(hash)) {
      this._bufferBarriers.set(hash, new BufferBarrier(info, hash));
    }
    return this._bufferBarriers.get(hash);
  };
  _proto.copyBuffersToTexture = function copyBuffersToTexture(buffers, texture, regions) {};
  _proto.copyTextureToBuffers = function copyTextureToBuffers(texture, buffers, regions) {};
  _proto.copyTexImagesToTexture = function copyTexImagesToTexture(texImages, texture, regions) {};
  return EmptyDevice;
}(Device);
cclegacy.EmptyDevice = EmptyDevice;

legacyCC.EmptyDevice = EmptyDevice;

export { EmptyDevice };
//# sourceMappingURL=gfx-empty.js.map
