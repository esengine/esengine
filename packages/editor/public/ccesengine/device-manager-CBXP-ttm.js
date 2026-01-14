import { P as PipelineStateInfo, c as DepthStencilState, d as BlendTarget, e as BlendState, R as RasterizerState, f as BufferBarrier, T as TextureBarrier, G as GeneralBarrier, Q as Queue, g as CommandBuffer, h as PipelineState, i as PipelineLayout, j as DescriptorSetLayout, k as DescriptorSet, l as Framebuffer, n as RenderPass, o as InputAssembler, S as Shader, p as Sampler, q as Texture, r as Buffer, s as Swapchain, t as Device, u as defines, v as DeviceInfo, w as SwapchainInfo } from './buffer-barrier-BlQXg9Aa.js';
import { c as cclegacy } from './global-exports-DnCP_14L.js';
import { s as settings, r as Settings, B as BrowserType, k as errorID, g as getError, a as _createClass } from './gc-object-CShF5lzx.js';
import { E as EDITOR } from './_virtual_internal_constants-DWlew7Dp.js';
import { n as sys, o as screen } from './index-uXI1_UMk.js';

var polyfills = {
  Device: Device,
  Swapchain: Swapchain,
  Buffer: Buffer,
  Texture: Texture,
  Sampler: Sampler,
  Shader: Shader,
  InputAssembler: InputAssembler,
  RenderPass: RenderPass,
  Framebuffer: Framebuffer,
  DescriptorSet: DescriptorSet,
  DescriptorSetLayout: DescriptorSetLayout,
  PipelineLayout: PipelineLayout,
  PipelineState: PipelineState,
  CommandBuffer: CommandBuffer,
  Queue: Queue,
  GeneralBarrier: GeneralBarrier,
  TextureBarrier: TextureBarrier,
  BufferBarrier: BufferBarrier,
  RasterizerState: RasterizerState,
  BlendState: BlendState,
  BlendTarget: BlendTarget,
  DepthStencilState: DepthStencilState,
  PipelineStateInfo: PipelineStateInfo
};
Object.assign(polyfills, defines);
cclegacy.gfx = polyfills;

var LegacyRenderMode;
(function (LegacyRenderMode) {
  LegacyRenderMode[LegacyRenderMode["AUTO"] = 0] = "AUTO";
  LegacyRenderMode[LegacyRenderMode["CANVAS"] = 1] = "CANVAS";
  LegacyRenderMode[LegacyRenderMode["WEBGL"] = 2] = "WEBGL";
  LegacyRenderMode[LegacyRenderMode["HEADLESS"] = 3] = "HEADLESS";
  LegacyRenderMode[LegacyRenderMode["WEBGPU"] = 4] = "WEBGPU";
})(LegacyRenderMode || (LegacyRenderMode = {}));
var RenderType;
(function (RenderType) {
  RenderType[RenderType["UNKNOWN"] = -1] = "UNKNOWN";
  RenderType[RenderType["CANVAS"] = 0] = "CANVAS";
  RenderType[RenderType["WEBGL"] = 1] = "WEBGL";
  RenderType[RenderType["WEBGPU"] = 2] = "WEBGPU";
  RenderType[RenderType["OPENGL"] = 3] = "OPENGL";
  RenderType[RenderType["HEADLESS"] = 4] = "HEADLESS";
})(RenderType || (RenderType = {}));
var DeviceManager = function () {
  function DeviceManager() {
    this.initialized = false;
    this._gfxDevice = void 0;
    this._canvas = null;
    this._swapchain = void 0;
    this._renderType = RenderType.UNKNOWN;
    this._deviceInitialized = false;
  }
  var _proto = DeviceManager.prototype;
  _proto._tryInitializeWebGPUDevice = function _tryInitializeWebGPUDevice(DeviceConstructor, info) {
    var _this = this;
    if (this._deviceInitialized) {
      return Promise.resolve(true);
    }
    if (DeviceConstructor) {
      this._gfxDevice = new DeviceConstructor();
      return new Promise(function (resolve, reject) {
        _this._gfxDevice.initialize(info).then(function (val) {
          _this._deviceInitialized = val;
          resolve(val);
        })["catch"](function (err) {
          reject(err);
        });
      });
    }
    return Promise.resolve(false);
  };
  _proto._tryInitializeDeviceSync = function _tryInitializeDeviceSync(DeviceConstructor, info) {
    if (this._deviceInitialized) {
      return true;
    }
    if (DeviceConstructor) {
      this._gfxDevice = new DeviceConstructor();
      this._deviceInitialized = this._gfxDevice.initialize(info);
    }
    return this._deviceInitialized;
  };
  _proto.init = function init(canvas, bindingMappingInfo) {
    var _this2 = this;
    if (this.initialized) {
      return true;
    }
    var renderMode = settings.querySettings(Settings.Category.RENDERING, 'renderMode');
    this._canvas = canvas;
    if (this._canvas) {
      this._canvas.oncontextmenu = function () {
        return false;
      };
    }
    this._renderType = this._determineRenderType(renderMode);
    this._deviceInitialized = false;
    var deviceInfo = new DeviceInfo(bindingMappingInfo);
    if (this._renderType === RenderType.WEBGL || this._renderType === RenderType.WEBGPU) {
      {
        var useWebGL2 = !!globalThis.WebGL2RenderingContext;
        globalThis.navigator.userAgent.toLowerCase();
        if (sys.browserType === BrowserType.UC) {
          useWebGL2 = false;
        }
        Device.canvas = canvas;
        if (this._renderType === RenderType.WEBGPU && cclegacy.WebGPUDevice) {
          return new Promise(function (resolve, reject) {
            _this2._tryInitializeWebGPUDevice(cclegacy.WebGPUDevice, deviceInfo).then(function (val) {
              _this2._initSwapchain();
              resolve(val);
            })["catch"](function (err) {
              reject(err);
            });
          });
        }
        if (useWebGL2 && cclegacy.WebGL2Device) {
          this._tryInitializeDeviceSync(cclegacy.WebGL2Device, deviceInfo);
        }
        if (cclegacy.WebGLDevice) {
          this._tryInitializeDeviceSync(cclegacy.WebGLDevice, deviceInfo);
        }
        if (cclegacy.EmptyDevice) {
          this._tryInitializeDeviceSync(cclegacy.EmptyDevice, deviceInfo);
        }
        this._initSwapchain();
      }
    } else if (this._renderType === RenderType.HEADLESS && cclegacy.EmptyDevice) {
      this._tryInitializeDeviceSync(cclegacy.EmptyDevice, deviceInfo);
      this._initSwapchain();
    }
    if (!this._gfxDevice) {
      errorID(16337);
      this._renderType = RenderType.UNKNOWN;
      return false;
    }
    return true;
  };
  _proto._initSwapchain = function _initSwapchain() {
    var swapchainInfo = new SwapchainInfo(1, this._canvas);
    var windowSize = screen.windowSize;
    swapchainInfo.width = windowSize.width;
    swapchainInfo.height = windowSize.height;
    this._swapchain = this._gfxDevice.createSwapchain(swapchainInfo);
  };
  _proto._supportWebGPU = function _supportWebGPU() {
    return 'gpu' in globalThis.navigator;
  };
  _proto._determineRenderType = function _determineRenderType(renderMode) {
    if (typeof renderMode !== 'number' || renderMode > LegacyRenderMode.WEBGPU || renderMode < LegacyRenderMode.AUTO) {
      renderMode = LegacyRenderMode.AUTO;
    }
    var renderType = RenderType.CANVAS;
    var supportRender = false;
    if (renderMode === LegacyRenderMode.CANVAS) {
      renderType = RenderType.CANVAS;
      supportRender = true;
    } else if (renderMode === LegacyRenderMode.AUTO || renderMode === LegacyRenderMode.WEBGPU) {
      renderType = this._supportWebGPU() && !EDITOR ? RenderType.WEBGPU : RenderType.WEBGL;
      supportRender = true;
    } else if (renderMode === LegacyRenderMode.WEBGL) {
      renderType = RenderType.WEBGL;
      supportRender = true;
    } else if (renderMode === LegacyRenderMode.HEADLESS) {
      renderType = RenderType.HEADLESS;
      supportRender = true;
    }
    if (!supportRender) {
      throw new Error(getError(3820, renderMode));
    }
    return renderType;
  };
  return _createClass(DeviceManager, [{
    key: "gfxDevice",
    get: function get() {
      return this._gfxDevice;
    }
  }, {
    key: "swapchain",
    get: function get() {
      return this._swapchain;
    }
  }]);
}();
var deviceManager = new DeviceManager();

export { DeviceManager as D, LegacyRenderMode as L, RenderType as R, deviceManager as d };
//# sourceMappingURL=device-manager-CBXP-ttm.js.map
