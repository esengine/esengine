"use strict";
var ViewportRpc = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
  var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

  // src/index.ts
  var src_exports = {};
  __export(src_exports, {
    ErrorCodes: () => ErrorCodes,
    Events: () => Events,
    Methods: () => Methods,
    ViewportRpcHandler: () => ViewportRpcHandler,
    createViewportRpc: () => createViewportRpc
  });

  // src/protocol.ts
  var Methods = {
    SET_VIEW_MODE: "viewport.setViewMode",
    RESIZE: "viewport.resize",
    SET_CAMERA: "viewport.setCamera",
    PLAY: "viewport.play",
    PAUSE: "viewport.pause",
    STOP: "viewport.stop",
    SET_EDIT_MODE: "viewport.setEditMode",
    GET_STATE: "viewport.getState",
    GET_SCENE_INFO: "viewport.getSceneInfo",
    CREATE_NODE: "viewport.createNode",
    SELECT_NODE: "viewport.selectNode",
    RESET_CAMERA: "viewport.resetCamera",
    FOCUS_SELECTED: "viewport.focusSelected"
  };
  var Events = {
    READY: "viewport.ready",
    ERROR: "viewport.error",
    LOG: "viewport.log",
    VIEW_MODE_CHANGED: "viewport.viewModeChanged",
    PLAY_STATE_CHANGED: "viewport.playStateChanged",
    NODE_SELECTED: "viewport.nodeSelected",
    SCENE_CHANGED: "viewport.sceneChanged"
  };
  var ErrorCodes = {
    /** @zh 解析错误 @en Parse error */
    PARSE_ERROR: -32700,
    /** @zh 无效请求 @en Invalid request */
    INVALID_REQUEST: -32600,
    /** @zh 方法不存在 @en Method not found */
    METHOD_NOT_FOUND: -32601,
    /** @zh 无效参数 @en Invalid params */
    INVALID_PARAMS: -32602,
    /** @zh 内部错误 @en Internal error */
    INTERNAL_ERROR: -32603,
    /** @zh 服务器错误 @en Server error */
    SERVER_ERROR: -32e3
  };

  // src/handler.ts
  var _ViewportRpcHandler = class _ViewportRpcHandler {
    constructor(config) {
      __publicField(this, "handlers", /* @__PURE__ */ new Map());
      __publicField(this, "send");
      this.send = config.send;
    }
    // ========================================================================
    // Method Registration
    // ========================================================================
    /**
     * @zh 注册方法处理器
     * @en Register a method handler
     *
     * @param name - @zh 方法名称 @en Method name
     * @param handler - @zh 处理函数 @en Handler function
     */
    registerMethod(name, handler) {
      this.handlers.set(name, handler);
    }
    /**
     * @zh 批量注册方法处理器
     * @en Register multiple method handlers
     *
     * @param methods - @zh 方法映射对象 @en Methods map object
     */
    registerMethods(methods) {
      for (const [name, handler] of Object.entries(methods)) {
        this.handlers.set(name, handler);
      }
    }
    // ========================================================================
    // Message Handling
    // ========================================================================
    /**
     * @zh 处理收到的 RPC 消息
     * @en Handle received RPC message
     *
     * @param data - @zh JSON 字符串消息 @en JSON string message
     */
    async handleMessage(data) {
      let parsed;
      try {
        parsed = JSON.parse(data);
      } catch {
        console.error("[ViewportRpc] Parse error:", data);
        return;
      }
      if (this.isRequest(parsed)) {
        await this.handleRequest(parsed);
      }
    }
    // ========================================================================
    // Notification Sending
    // ========================================================================
    /**
     * @zh 发送通知到编辑器
     * @en Send notification to editor
     *
     * @param method - @zh 通知方法名 @en Notification method name
     * @param params - @zh 通知参数 @en Notification parameters
     */
    notify(method, params) {
      const notification = {
        jsonrpc: "2.0",
        method,
        params
      };
      this.send(JSON.stringify(notification));
    }
    // ========================================================================
    // Event Emitters (便捷方法)
    // ========================================================================
    /**
     * @zh 通知编辑器 Viewport 已就绪
     * @en Notify editor that viewport is ready
     */
    emitReady(version) {
      this.notify(Events.READY, {
        version
      });
    }
    /**
     * @zh 通知编辑器发生错误
     * @en Notify editor of an error
     */
    emitError(message, stack) {
      this.notify(Events.ERROR, {
        message,
        stack
      });
    }
    /**
     * @zh 发送日志到编辑器
     * @en Send log to editor
     */
    emitLog(level, message) {
      this.notify(Events.LOG, {
        level,
        message
      });
    }
    /**
     * @zh 通知视图模式变化
     * @en Notify view mode change
     */
    emitViewModeChanged(mode) {
      this.notify(Events.VIEW_MODE_CHANGED, {
        mode
      });
    }
    /**
     * @zh 通知播放状态变化
     * @en Notify play state change
     */
    emitPlayStateChanged(state) {
      this.notify(Events.PLAY_STATE_CHANGED, {
        state
      });
    }
    /**
     * @zh 通知节点选择变化
     * @en Notify node selection change
     */
    emitNodeSelected(uuid) {
      this.notify(Events.NODE_SELECTED, {
        uuid
      });
    }
    /**
     * @zh 通知场景变化
     * @en Notify scene change
     */
    emitSceneChanged(sceneName) {
      this.notify(Events.SCENE_CHANGED, {
        sceneName
      });
    }
    // ========================================================================
    // Private Methods
    // ========================================================================
    isRequest(obj) {
      return typeof obj === "object" && obj !== null && "jsonrpc" in obj && "method" in obj && "id" in obj;
    }
    async handleRequest(request) {
      const handler = this.handlers.get(request.method);
      if (!handler) {
        this.sendResponse(request.id, void 0, {
          code: ErrorCodes.METHOD_NOT_FOUND,
          message: `Method not found: ${request.method}`
        });
        return;
      }
      try {
        const result = await handler(request.params);
        this.sendResponse(request.id, result);
      } catch (e) {
        this.sendResponse(request.id, void 0, {
          code: ErrorCodes.INTERNAL_ERROR,
          message: e instanceof Error ? e.message : String(e)
        });
      }
    }
    sendResponse(id, result, error) {
      const response = {
        jsonrpc: "2.0",
        id
      };
      if (error) {
        response.error = error;
      } else {
        response.result = result ?? null;
      }
      this.send(JSON.stringify(response));
    }
  };
  __name(_ViewportRpcHandler, "ViewportRpcHandler");
  var ViewportRpcHandler = _ViewportRpcHandler;
  function createViewportRpc(config) {
    return new ViewportRpcHandler(config);
  }
  __name(createViewportRpc, "createViewportRpc");
  return __toCommonJS(src_exports);
})();
//# sourceMappingURL=browser.js.map