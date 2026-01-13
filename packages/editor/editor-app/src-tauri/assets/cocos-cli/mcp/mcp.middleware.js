"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.McpMiddleware = void 0;
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const streamableHttp_js_1 = require("@modelcontextprotocol/sdk/server/streamableHttp.js");
const decorator_1 = require("../api/decorator/decorator");
const zod_1 = require("zod");
const pkgJson = __importStar(require("../../package.json"));
const path_1 = require("path");
const resources_1 = require("./resources");
const schema_base_1 = require("../api/base/schema-base");
const builder_hook_1 = require("./hooks/builder.hook");
const strip_ansi_1 = __importDefault(require("strip-ansi"));
const zod_to_json_schema_1 = require("zod-to-json-schema");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
class McpMiddleware {
    server;
    resourceManager;
    builderHook;
    constructor() {
        this.builderHook = new builder_hook_1.BuilderHook();
        // 创建 MCP server
        this.server = new mcp_js_1.McpServer({
            name: 'cocos-cli-mcp-server',
            version: pkgJson.version || '0.0.0',
        }, {
            capabilities: {
                resources: {
                    subscribe: true,
                    listChanged: true,
                    templates: false
                },
                tools: {},
                // 日志能力（调试用）
                logging: {},
            }
        });
        // 初始化资源管理器
        const docsPath = (0, path_1.join)(__dirname, '../../docs');
        this.resourceManager = new resources_1.ResourceManager(docsPath);
        // 注册资源和工具
        this.registerDecoratorTools();
        this.registerResourcesList();
    }
    registerResourcesList() {
        // 使用资源管理器加载所有资源
        const resources = this.resourceManager.loadAllResources();
        // 批量注册资源
        resources.forEach((resource) => {
            this.server.resource(resource.name, resource.uri, {
                title: resource.title,
                mimeType: resource.mimeType
            }, async (_uri, extra) => {
                // 根据客户端地区选择语言
                const preferredLanguage = this.resourceManager.detectClientLanguage(extra);
                // 动态读取文件内容
                const textContent = this.resourceManager.readFileContent(resource, preferredLanguage);
                return {
                    contents: [{
                            uri: resource.uri,
                            text: textContent,
                            mimeType: resource.mimeType
                        }]
                };
            });
        });
    }
    /**
     * 注册 mcp tools
     */
    registerDecoratorTools() {
        Array.from(decorator_1.toolRegistry.entries()).forEach(([toolName, { target, meta }]) => {
            try {
                // --- 步骤 A: 构建 Zod Shape ---
                const inputSchemaFields = {};
                meta.paramSchemas
                    .sort((a, b) => a.index - b.index)
                    .forEach(param => {
                    if (param.name) {
                        this.builderHook.onRegisterParam(toolName, param, inputSchemaFields);
                        if (!inputSchemaFields[param.name]) {
                            inputSchemaFields[param.name] = param.schema;
                        }
                    }
                });
                // --- 步骤 B: 注册工具 ---
                // 使用 this.server.tool 注册，传入 Zod Shape 以便 SDK 进行验证
                this.server.tool(toolName, meta.description || `Tool: ${toolName}`, inputSchemaFields, async (args) => {
                    // args 已经是验证过的参数对象 (对于 builder-build.options 是 any)
                    this.builderHook.onBeforeExecute(toolName, args);
                    try {
                        // 这里的 prepareMethodArguments 主要是为了按顺序排列参数给 apply 使用
                        // 注意：args 是对象，prepareMethodArguments 需要处理对象
                        const methodArgs = this.prepareMethodArguments(meta, args, toolName);
                        const result = await this.callToolMethod(target, meta, methodArgs);
                        const formattedResult = this.formatToolResult(meta, result);
                        let structuredContent;
                        if (meta.returnSchema) {
                            try {
                                const validatedResult = meta.returnSchema.parse(result);
                                structuredContent = { result: validatedResult };
                            }
                            catch {
                                structuredContent = { result: result };
                            }
                        }
                        else {
                            structuredContent = { result: result };
                        }
                        console.debug(`call ${toolName} with args:${methodArgs.toString()} result: ${formattedResult}`);
                        return {
                            content: [{ type: 'text', text: formattedResult }],
                            structuredContent: structuredContent,
                            isError: result.code == 500
                        };
                    }
                    catch (error) {
                        const errorMessage = error instanceof Error ? error.message : String(error);
                        const errorStack = error instanceof Error ? error.stack : undefined;
                        let detailedReason = `Tool execution failed (${toolName}): ${errorMessage}`;
                        if (errorStack && process.env.NODE_ENV === 'development') {
                            detailedReason += `\n\nStack trace:\n${errorStack}`;
                        }
                        detailedReason += `\n\nParameters passed:\n${JSON.stringify(args, null, 2)}`;
                        console.error(`[MCP] ${detailedReason}`);
                        const errorResult = {
                            code: schema_base_1.HTTP_STATUS.INTERNAL_SERVER_ERROR,
                            data: undefined,
                            reason: detailedReason,
                        };
                        const formattedResult = JSON.stringify({ result: errorResult }, null, 2);
                        return {
                            content: [{ type: 'text', text: formattedResult }],
                            structuredContent: { result: errorResult },
                            isError: true
                        };
                    }
                });
            }
            catch (error) {
                console.error(`Failed to register tool ${toolName}:`, error);
            }
        });
        // --- 步骤 C: 覆盖 tools/list 处理程序 ---
        // 为了支持 Gemini (不支持 $ref)，我们需要手动生成并返回 Gemini 兼容的 JSON Schema
        this.server.server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => {
            const tools = Array.from(decorator_1.toolRegistry.entries()).map(([toolName, { meta }]) => {
                const inputSchemaFields = {};
                meta.paramSchemas
                    .sort((a, b) => a.index - b.index)
                    .forEach(param => {
                    if (param.name) {
                        inputSchemaFields[param.name] = param.schema;
                    }
                });
                const fullInputZodSchema = zod_1.z.object(inputSchemaFields);
                const geminiInputSchema = this.zodToJSONSchema7(fullInputZodSchema);
                // 构建输出 schema
                const outputSchemaFields = meta.returnSchema ? { result: meta.returnSchema } : { result: zod_1.z.any() };
                const fullOutputZodSchema = zod_1.z.object(outputSchemaFields);
                const geminiOutputSchema = this.zodToJSONSchema7(fullOutputZodSchema);
                return {
                    name: toolName,
                    title: meta.title || toolName,
                    description: meta.description || `Tool: ${toolName}`,
                    inputSchema: geminiInputSchema,
                    outputSchema: geminiOutputSchema
                };
            });
            return { tools };
        });
    }
    /**
     * 准备方法参数
     */
    prepareMethodArguments(meta, args, toolName) {
        if (!meta.paramSchemas || meta.paramSchemas.length === 0) {
            return [];
        }
        const methodArgs = [];
        const sortedParams = meta.paramSchemas.sort((a, b) => a.index - b.index);
        for (const param of sortedParams) {
            const paramName = param.name || `param${param.index}`;
            const value = args[paramName];
            try {
                // 使用 Zod schema 验证和转换参数
                const validatedValue = param.schema.parse(value);
                methodArgs[param.index] = validatedValue;
            }
            catch (error) {
                // 尝试处理 Gemini 传回的 string 类型数字 (针对 numeric enum)
                if (typeof value === 'string' && !isNaN(Number(value))) {
                    try {
                        const numValue = Number(value);
                        const validatedValue = param.schema.parse(numValue);
                        methodArgs[param.index] = validatedValue;
                        continue;
                    }
                    catch (innerError) {
                        // 忽略内部错误，继续抛出原始错误
                    }
                }
                console.error(`Parameter validation failed for ${paramName}:`, error);
                this.builderHook.onValidationFailed(toolName, paramName, error);
                // 使用原始值
                methodArgs[param.index] = value;
            }
        }
        return methodArgs;
    }
    /**
     * 调用工具方法
     */
    async callToolMethod(target, meta, args) {
        // 获取或创建实例
        const instance = await this.getToolInstance(target);
        // 获取方法
        const method = instance[meta.methodName];
        if (typeof method !== 'function') {
            throw new Error(`Method ${String(meta.methodName)} not found on instance`);
        }
        // 调用方法
        return await method.apply(instance, args);
    }
    /**
     * 获取工具实例
     */
    async getToolInstance(target) {
        // 如果 target 已经是实例，直接返回
        if (typeof target === 'object' && target !== null) {
            return target;
        }
        throw new Error('Unable to create tool instance');
    }
    /**
     * 格式化工具结果
     */
    formatToolResult(meta, result) {
        // 构建符合 schema 的结果结构，用 result 字段包装
        if (meta.returnSchema) {
            // 验证结果是否符合预期的 schema
            try {
                if (result.reason) {
                    result.reason = (0, strip_ansi_1.default)(result.reason);
                }
                const validatedResult = meta.returnSchema.parse(result);
                return JSON.stringify({ result: validatedResult }, null, 2);
            }
            catch (error) {
                throw new Error(`Tool result validation failed: ${error instanceof Error ? error.message : String(error)}`);
            }
        }
        return JSON.stringify({ result: result }, null, 2);
    }
    async handleMcpRequest(req, res) {
        try {
            // 为每个请求创建新的传输层以防止请求 ID 冲突
            const transport = new streamableHttp_js_1.StreamableHTTPServerTransport({
                sessionIdGenerator: undefined,
                enableJsonResponse: true
            });
            res.on('close', () => {
                transport.close();
            });
            await this.server.connect(transport);
            await transport.handleRequest(req, res, req.body);
        }
        catch (error) {
            console.error('MCP request handling error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    async handleSseRequest(req, res) {
        try {
            // 设置 SSE 响应头
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Headers', 'Cache-Control');
            // 为 SSE 连接创建传输层
            const transport = new streamableHttp_js_1.StreamableHTTPServerTransport({
                sessionIdGenerator: undefined,
                enableJsonResponse: false // SSE 不需要 JSON 响应
            });
            // 处理连接关闭
            res.on('close', () => {
                transport.close();
            });
            req.on('close', () => {
                transport.close();
            });
            // 连接到 MCP 服务器
            await this.server.connect(transport);
            // 处理 SSE 请求
            await transport.handleRequest(req, res, req.body);
        }
        catch (error) {
            console.error('MCP SSE request handling error:', error);
            if (!res.headersSent) {
                res.status(500).json({ error: 'Internal server error' });
            }
        }
    }
    getMiddlewareContribution() {
        return {
            get: [
                {
                    url: '/mcp',
                    handler: this.handleSseRequest.bind(this)
                }
            ],
            post: [
                {
                    url: '/mcp',
                    handler: this.handleMcpRequest.bind(this)
                }
            ]
        };
    }
    /**
     * 将 Zod Schema 转换为兼容性高的 jsonSchema7 格式
     */
    zodToJSONSchema7(zodObj) {
        return (0, zod_to_json_schema_1.zodToJsonSchema)(zodObj, {
            target: 'jsonSchema7',
            $refStrategy: 'none',
        });
    }
}
exports.McpMiddleware = McpMiddleware;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWNwLm1pZGRsZXdhcmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbWNwL21jcC5taWRkbGV3YXJlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVBLG9FQUFvRTtBQUNwRSwwRkFBbUc7QUFDbkcsMERBQTBEO0FBQzFELDZCQUF3QjtBQUN4Qiw0REFBOEM7QUFDOUMsK0JBQTRCO0FBQzVCLDJDQUE4QztBQUM5Qyx5REFBc0Q7QUFDdEQsdURBQW1EO0FBRW5ELDREQUFtQztBQUNuQywyREFBcUQ7QUFDckQsaUVBQTRFO0FBQzVFLE1BQWEsYUFBYTtJQUNkLE1BQU0sQ0FBWTtJQUNsQixlQUFlLENBQWtCO0lBQ2pDLFdBQVcsQ0FBYztJQUVqQztRQUNJLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSwwQkFBVyxFQUFFLENBQUM7UUFDckMsZ0JBQWdCO1FBQ2hCLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxrQkFBUyxDQUFDO1lBQ3hCLElBQUksRUFBRSxzQkFBc0I7WUFDNUIsT0FBTyxFQUFFLE9BQU8sQ0FBQyxPQUFPLElBQUksT0FBTztTQUN0QyxFQUFFO1lBQ0MsWUFBWSxFQUFFO2dCQUNWLFNBQVMsRUFBRTtvQkFDUCxTQUFTLEVBQUUsSUFBSTtvQkFDZixXQUFXLEVBQUUsSUFBSTtvQkFDakIsU0FBUyxFQUFFLEtBQUs7aUJBQ25CO2dCQUNELEtBQUssRUFBRSxFQUFFO2dCQUNULFlBQVk7Z0JBQ1osT0FBTyxFQUFFLEVBQUU7YUFDZDtTQUNKLENBQUMsQ0FBQztRQUVILFdBQVc7UUFDWCxNQUFNLFFBQVEsR0FBRyxJQUFBLFdBQUksRUFBQyxTQUFTLEVBQUUsWUFBWSxDQUFDLENBQUM7UUFDL0MsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLDJCQUFlLENBQUMsUUFBUSxDQUFDLENBQUM7UUFFckQsVUFBVTtRQUNWLElBQUksQ0FBQyxzQkFBc0Is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SUFDTCxDQUFDO0lBRU0seUJBQXlCO1FBQzVCLE9BQU87WUFDSCxHQUFHLEVBQUU7Z0JBQ0Q7b0JBQ0ksR0FBRyxFQUFFLE1BQU07b0JBQ1gsT0FBTyxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO2lCQUM1QzthQUNKO1lBQ0QsSUFBSSxFQUFFO2dCQUNGO29CQUNJLEdBQUcsRUFBRSxNQUFNO29CQUNYLE9BQU8sRUFBRSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztpQkFDNUM7YUFDSjtTQUNKLENBQUM7SUFDTixDQUFDO0lBQ0Q7O09BRUc7SUFDSyxnQkFBZ0IsQ0FBQyxNQUFvQjtRQUN6QyxPQUFPLElBQUEsb0NBQWUsRUFBQyxNQUFNLEVBQUU7WUFDM0IsTUFBTSxFQUFFLGFBQWE7WUFDckIsWUFBWSxFQUFFLE1BQU07U0FDdkIsQ0FBUSxDQUFDO0lBQ2QsQ0FBQztDQUNKO0FBcFdELHNDQW9XQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHsgSU1pZGRsZXdhcmVDb250cmlidXRpb24gfSBmcm9tICcuLi9zZXJ2ZXIvaW50ZXJmYWNlcyc7XHJcbmltcG9ydCB7IFJlcXVlc3QsIFJlc3BvbnNlIH0gZnJvbSAnZXhwcmVzcyc7XHJcbmltcG9ydCB7IE1jcFNlcnZlciB9IGZyb20gJ0Btb2RlbGNvbnRleHRwcm90b2NvbC9zZGsvc2VydmVyL21jcC5qcyc7XHJcbmltcG9ydCB7IFN0cmVhbWFibGVIVFRQU2VydmVyVHJhbnNwb3J0IH0gZnJvbSAnQG1vZGVsY29udGV4dHByb3RvY29sL3Nkay9zZXJ2ZXIvc3RyZWFtYWJsZUh0dHAuanMnO1xyXG5pbXBvcnQgeyB0b29sUmVnaXN0cnkgfSBmcm9tICcuLi9hcGkvZGVjb3JhdG9yL2RlY29yYXRvcic7XHJcbmltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xyXG5pbXBvcnQgKiBhcyBwa2dKc29uIGZyb20gJy4uLy4uL3BhY2thZ2UuanNvbic7XHJcbmltcG9ydCB7IGpvaW4gfSBmcm9tICdwYXRoJztcclxuaW1wb3J0IHsgUmVzb3VyY2VNYW5hZ2VyIH0gZnJvbSAnLi9yZXNvdXJjZXMnO1xyXG5pbXBvcnQgeyBIVFRQX1NUQVRVUyB9IGZyb20gJy4uL2FwaS9iYXNlL3NjaGVtYS1iYXNlJztcclxuaW1wb3J0IHsgQnVpbGRlckhvb2sgfSBmcm9tICcuL2hvb2tzL2J1aWxkZXIuaG9vayc7XHJcbmltcG9ydCB0eXBlIHsgSHR0cFN0YXR1c0NvZGUgfSBmcm9tICcuLi9hcGkvYmFzZS9zY2hlbWEtYmFzZSc7XHJcbmltcG9ydCBzdHJpcEFuc2kgZnJvbSAnc3RyaXAtYW5zaSc7XHJcbmltcG9ydCB7IHpvZFRvSnNvblNjaGVtYSB9IGZyb20gJ3pvZC10by1qc29uLXNjaGVtYSc7XHJcbmltcG9ydCB7IExpc3RUb29sc1JlcXVlc3RTY2hlbWEgfSBmcm9tICdAbW9kZWxjb250ZXh0cHJvdG9jb2wvc2RrL3R5cGVzLmpzJztcclxuZXhwb3J0IGNsYXNzIE1jcE1pZGRsZXdhcmUge1xyXG4gICAgcHJpdmF0ZSBzZXJ2ZXI6IE1jcFNlcnZlcjtcclxuICAgIHByaXZhdGUgcmVzb3VyY2VNYW5hZ2VyOiBSZXNvdXJjZU1hbmFnZXI7XHJcbiAgICBwcml2YXRlIGJ1aWxkZXJIb29rOiBCdWlsZGVySG9vaztcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLmJ1aWxkZXJIb29rID0gbmV3IEJ1aWxkZXJIb29rKCk7XHJcbiAgICAgICAgLy8g5Yib5bu6IE1DUCBzZXJ2ZXJcclxuICAgICAgICB0aGlzLnNlcnZlciA9IG5ldyBNY3BTZXJ2ZXIoe1xyXG4gICAgICAgICAgICBuYW1lOiAnY29jb3MtY2xpLW1jcC1zZXJ2ZXInLFxyXG4gICAgICAgICAgICB2ZXJzaW9uOiBwa2dKc29uLnZlcnNpb24gfHwgJzAuMC4wJyxcclxuICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgIGNhcGFiaWxpdGllczoge1xyXG4gICAgICAgICAgICAgICAgcmVzb3VyY2VzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3Vic2NyaWJlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIGxpc3RDaGFuZ2VkOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlczogZmFsc2VcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB0b29sczoge30sXHJcbiAgICAgICAgICAgICAgICAvLyDml6Xlv5fog73lipvvvIjosIPor5XnlKjvvIlcclxuICAgICAgICAgICAgICAgIGxvZ2dpbmc6IHt9LFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIOWIneWni+WMlui1hOa6kOeuoeeQhuWZqFxyXG4gICAgICAgIGNvbnN0IGRvY3NQYXRoID0gam9pbihfX2Rpcm5hbWUsICcuLi8uLi9kb2NzJyk7XHJcbiAgICAgICAgdGhpcy5yZXNvdXJjZU1hbmFnZXIgPSBuZXcgUmVzb3VyY2VNYW5hZ2VyKGRvY3NQYXRoKTtcclxuXHJcbiAgICAgICAgLy8g5rOo5YaM6LWE5rqQ5ZKM5bel5YW3XHJcbiAgICAgICAgdGhpcy5yZWdpc3RlckRlY29yYXRvclRvb2xzKCk7XHJcbiAgICAgICAgdGhpcy5yZWdpc3RlclJlc291cmNlc0xpc3QoKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHJlZ2lzdGVyUmVzb3VyY2VzTGlzdCgpIHtcclxuICAgICAgICAvLyDkvb/nlKjotYTmupDnrqHnkIblmajliqDovb3miYDmnInotYTmupBcclxuICAgICAgICBjb25zdCByZXNvdXJjZXMgPSB0aGlzLnJlc291cmNlTWFuYWdlci5sb2FkQWxsUmVzb3VyY2VzKCk7XHJcblxyXG4gICAgICAgIC8vIOaJuemHj+azqOWGjOi1hOa6kFxyXG4gICAgICAgIHJlc291cmNlcy5mb3JFYWNoKChyZXNvdXJjZSkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnNlcnZlci5yZXNvdXJjZShyZXNvdXJjZS5uYW1lLCByZXNvdXJjZS51cmksIHtcclxuICAgICAgICAgICAgICAgIHRpdGxlOiByZXNvdXJjZS50aXRsZSxcclxuICAgICAgICAgICAgICAgIG1pbWVUeXBlOiByZXNvdXJjZS5taW1lVHlwZVxyXG4gICAgICAgICAgICB9LCBhc3luYyAoX3VyaTogVVJMLCBleHRyYSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy8g5qC55o2u5a6i5oi356uv5Zyw5Yy66YCJ5oup6K+t6KiAXHJcbiAgICAgICAgICAgICAgICBjb25zdCBwcmVmZXJyZWRMYW5ndWFnZSA9IHRoaXMucmVzb3VyY2VNYW5hZ2VyLmRldGVjdENsaWVudExhbmd1YWdlKGV4dHJhKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyDliqjmgIHor7vlj5bmlofku7blhoXlrrlcclxuICAgICAgICAgICAgICAgIGNvbnN0IHRleHRDb250ZW50ID0gdGhpcy5yZXNvdXJjZU1hbmFnZXIucmVhZEZpbGVDb250ZW50KHJlc291cmNlLCBwcmVmZXJyZWRMYW5ndWFnZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICBjb250ZW50czogW3tcclxuICAgICAgICAgICAgICAgICAgICAgICAgdXJpOiByZXNvdXJjZS51cmksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6IHRleHRDb250ZW50LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtaW1lVHlwZTogcmVzb3VyY2UubWltZVR5cGVcclxuICAgICAgICAgICAgICAgICAgICB9XVxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDms6jlhowgbWNwIHRvb2xzXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgcmVnaXN0ZXJEZWNvcmF0b3JUb29scygpIHtcclxuICAgICAgICBBcnJheS5mcm9tKHRvb2xSZWdpc3RyeS5lbnRyaWVzKCkpLmZvckVhY2goKFt0b29sTmFtZSwgeyB0YXJnZXQsIG1ldGEgfV0pID0+IHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIC8vIC0tLSDmraXpqqQgQTog5p6E5bu6IFpvZCBTaGFwZSAtLS1cclxuICAgICAgICAgICAgICAgIGNvbnN0IGlucHV0U2NoZW1hRmllbGRzOiBSZWNvcmQ8c3RyaW5nLCB6LlpvZFR5cGVBbnk+ID0ge307XHJcbiAgICAgICAgICAgICAgICBtZXRhLnBhcmFtU2NoZW1hc1xyXG4gICAgICAgICAgICAgICAgICAgIC5zb3J0KChhLCBiKSA9PiBhLmluZGV4IC0gYi5pbmRleClcclxuICAgICAgICAgICAgICAgICAgICAuZm9yRWFjaChwYXJhbSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwYXJhbS5uYW1lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmJ1aWxkZXJIb29rLm9uUmVnaXN0ZXJQYXJhbSh0b29sTmFtZSwgcGFyYW0sIGlucHV0U2NoZW1hRmllbGRzKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghaW5wdXRTY2hlbWFGaWVsZHNbcGFyYW0ubmFtZV0pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnB1dFNjaGVtYUZpZWxkc1twYXJhbS5uYW1lXSA9IHBhcmFtLnNjaGVtYTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAvLyAtLS0g5q2l6aqkIEI6IOazqOWGjOW3peWFtyAtLS1cclxuICAgICAgICAgICAgICAgIC8vIOS9v+eUqCB0aGlzLnNlcnZlci50b29sIOazqOWGjO+8jOS8oOWFpSBab2QgU2hhcGUg5Lul5L6/IFNESyDov5vooYzpqozor4FcclxuICAgICAgICAgICAgICAgIHRoaXMuc2VydmVyLnRvb2woXHJcbiAgICAgICAgICAgICAgICAgICAgdG9vbE5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgbWV0YS5kZXNjcmlwdGlvbiB8fCBgVG9vbDogJHt0b29sTmFtZX1gLFxyXG4gICAgICAgICAgICAgICAgICAgIGlucHV0U2NoZW1hRmllbGRzLFxyXG4gICAgICAgICAgICAgICAgICAgIGFzeW5jIChhcmdzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGFyZ3Mg5bey57uP5piv6aqM6K+B6L+H55qE5Y+C5pWw5a+56LGhICjlr7nkuo4gYnVpbGRlci1idWlsZC5vcHRpb25zIOaYryBhbnkpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYnVpbGRlckhvb2sub25CZWZvcmVFeGVjdXRlKHRvb2xOYW1lLCBhcmdzKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIOi/memHjOeahCBwcmVwYXJlTWV0aG9kQXJndW1lbnRzIOS4u+imgeaYr+S4uuS6huaMiemhuuW6j+aOkuWIl+WPguaVsOe7mSBhcHBseSDkvb/nlKhcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIOazqOaEj++8mmFyZ3Mg5piv5a+56LGh77yMcHJlcGFyZU1ldGhvZEFyZ3VtZW50cyDpnIDopoHlpITnkIblr7nosaFcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG1ldGhvZEFyZ3MgPSB0aGlzLnByZXBhcmVNZXRob2RBcmd1bWVudHMobWV0YSwgYXJncywgdG9vbE5hbWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5jYWxsVG9vbE1ldGhvZCh0YXJnZXQsIG1ldGEsIG1ldGhvZEFyZ3MpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBmb3JtYXR0ZWRSZXN1bHQgPSB0aGlzLmZvcm1hdFRvb2xSZXN1bHQobWV0YSwgcmVzdWx0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHN0cnVjdHVyZWRDb250ZW50OiBhbnk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobWV0YS5yZXR1cm5TY2hlbWEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB2YWxpZGF0ZWRSZXN1bHQgPSBtZXRhLnJldHVyblNjaGVtYS5wYXJzZShyZXN1bHQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHJ1Y3R1cmVkQ29udGVudCA9IHsgcmVzdWx0OiB2YWxpZGF0ZWRSZXN1bHQgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RydWN0dXJlZENvbnRlbnQgPSB7IHJlc3VsdDogcmVzdWx0IH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHJ1Y3R1cmVkQ29udGVudCA9IHsgcmVzdWx0OiByZXN1bHQgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmRlYnVnKGBjYWxsICR7dG9vbE5hbWV9IHdpdGggYXJnczoke21ldGhvZEFyZ3MudG9TdHJpbmcoKX0gcmVzdWx0OiAke2Zvcm1hdHRlZFJlc3VsdH1gKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6IFt7IHR5cGU6ICd0ZXh0JyBhcyBjb25zdCwgdGV4dDogZm9ybWF0dGVkUmVzdWx0IH1dLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0cnVjdHVyZWRDb250ZW50OiBzdHJ1Y3R1cmVkQ29udGVudCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc0Vycm9yOiByZXN1bHQuY29kZSA9PSA1MDBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JTdGFjayA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5zdGFjayA6IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgZGV0YWlsZWRSZWFzb24gPSBgVG9vbCBleGVjdXRpb24gZmFpbGVkICgke3Rvb2xOYW1lfSk6ICR7ZXJyb3JNZXNzYWdlfWA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVycm9yU3RhY2sgJiYgcHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICdkZXZlbG9wbWVudCcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGV0YWlsZWRSZWFzb24gKz0gYFxcblxcblN0YWNrIHRyYWNlOlxcbiR7ZXJyb3JTdGFja31gO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXRhaWxlZFJlYXNvbiArPSBgXFxuXFxuUGFyYW1ldGVycyBwYXNzZWQ6XFxuJHtKU09OLnN0cmluZ2lmeShhcmdzLCBudWxsLCAyKX1gO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFtNQ1BdICR7ZGV0YWlsZWRSZWFzb259YCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JSZXN1bHQ6IHsgY29kZTogSHR0cFN0YXR1c0NvZGU7IGRhdGE/OiBhbnk7IHJlYXNvbj86IHN0cmluZyB9ID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBIVFRQX1NUQVRVUy5JTlRFUk5BTF9TRVJWRVJfRVJST1IsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHVuZGVmaW5lZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVhc29uOiBkZXRhaWxlZFJlYXNvbixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGZvcm1hdHRlZFJlc3VsdCA9IEpTT04uc3RyaW5naWZ5KHsgcmVzdWx0OiBlcnJvclJlc3VsdCB9LCBudWxsLCAyKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50OiBbeyB0eXBlOiAndGV4dCcgYXMgY29uc3QsIHRleHQ6IGZvcm1hdHRlZFJlc3VsdCB9XSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RydWN0dXJlZENvbnRlbnQ6IHsgcmVzdWx0OiBlcnJvclJlc3VsdCB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc0Vycm9yOiB0cnVlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGBGYWlsZWQgdG8gcmVnaXN0ZXIgdG9vbCAke3Rvb2xOYW1lfTpgLCBlcnJvcik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gLS0tIOatpemqpCBDOiDopobnm5YgdG9vbHMvbGlzdCDlpITnkIbnqIvluo8gLS0tXHJcbiAgICAgICAgLy8g5Li65LqG5pSv5oyBIEdlbWluaSAo5LiN5pSv5oyBICRyZWYp77yM5oiR5Lus6ZyA6KaB5omL5Yqo55Sf5oiQ5bm26L+U5ZueIEdlbWluaSDlhbzlrrnnmoQgSlNPTiBTY2hlbWFcclxuICAgICAgICB0aGlzLnNlcnZlci5zZXJ2ZXIuc2V0UmVxdWVzdEhhbmRsZXIoTGlzdFRvb2xzUmVxdWVzdFNjaGVtYSwgYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCB0b29scyA9IEFycmF5LmZyb20odG9vbFJlZ2lzdHJ5LmVudHJpZXMoKSkubWFwKChbdG9vbE5hbWUsIHsgbWV0YSB9XSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgaW5wdXRTY2hlbWFGaWVsZHM6IFJlY29yZDxzdHJpbmcsIHouWm9kVHlwZUFueT4gPSB7fTtcclxuICAgICAgICAgICAgICAgIG1ldGEucGFyYW1TY2hlbWFzXHJcbiAgICAgICAgICAgICAgICAgICAgLnNvcnQoKGEsIGIpID0+IGEuaW5kZXggLSBiLmluZGV4KVxyXG4gICAgICAgICAgICAgICAgICAgIC5mb3JFYWNoKHBhcmFtID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBhcmFtLm5hbWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0U2NoZW1hRmllbGRzW3BhcmFtLm5hbWVdID0gcGFyYW0uc2NoZW1hO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIGNvbnN0IGZ1bGxJbnB1dFpvZFNjaGVtYSA9IHoub2JqZWN0KGlucHV0U2NoZW1hRmllbGRzKTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGdlbWluaUlucHV0U2NoZW1hID0gdGhpcy56b2RUb0pTT05TY2hlbWE3KGZ1bGxJbnB1dFpvZFNjaGVtYSk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8g5p6E5bu66L6T5Ye6IHNjaGVtYVxyXG4gICAgICAgICAgICAgICAgY29uc3Qgb3V0cHV0U2NoZW1hRmllbGRzID0gbWV0YS5yZXR1cm5TY2hlbWEgPyB7IHJlc3VsdDogbWV0YS5yZXR1cm5TY2hlbWEgfSA6IHsgcmVzdWx0OiB6LmFueSgpIH07XHJcbiAgICAgICAgICAgICAgICBjb25zdCBmdWxsT3V0cHV0Wm9kU2NoZW1hID0gei5vYmplY3Qob3V0cHV0U2NoZW1hRmllbGRzKTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGdlbWluaU91dHB1dFNjaGVtYSA9IHRoaXMuem9kVG9KU09OU2NoZW1hNyhmdWxsT3V0cHV0Wm9kU2NoZW1hKTtcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IHRvb2xOYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgIHRpdGxlOiBtZXRhLnRpdGxlIHx8IHRvb2xOYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBtZXRhLmRlc2NyaXB0aW9uIHx8IGBUb29sOiAke3Rvb2xOYW1lfWAsXHJcbiAgICAgICAgICAgICAgICAgICAgaW5wdXRTY2hlbWE6IGdlbWluaUlucHV0U2NoZW1hLFxyXG4gICAgICAgICAgICAgICAgICAgIG91dHB1dFNjaGVtYTogZ2VtaW5pT3V0cHV0U2NoZW1hXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiB7IHRvb2xzIH07XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDlh4blpIfmlrnms5Xlj4LmlbBcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBwcmVwYXJlTWV0aG9kQXJndW1lbnRzKG1ldGE6IGFueSwgYXJnczogYW55LCB0b29sTmFtZTogc3RyaW5nKTogYW55W10ge1xyXG4gICAgICAgIGlmICghbWV0YS5wYXJhbVNjaGVtYXMgfHwgbWV0YS5wYXJhbVNjaGVtYXMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBbXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IG1ldGhvZEFyZ3M6IGFueVtdID0gW107XHJcbiAgICAgICAgY29uc3Qgc29ydGVkUGFyYW1zID0gbWV0YS5wYXJhbVNjaGVtYXMuc29ydCgoYTogYW55LCBiOiBhbnkpID0+IGEuaW5kZXggLSBiLmluZGV4KTtcclxuXHJcbiAgICAgICAgZm9yIChjb25zdCBwYXJhbSBvZiBzb3J0ZWRQYXJhbXMpIHtcclxuICAgICAgICAgICAgY29uc3QgcGFyYW1OYW1lID0gcGFyYW0ubmFtZSB8fCBgcGFyYW0ke3BhcmFtLmluZGV4fWA7XHJcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gYXJnc1twYXJhbU5hbWVdO1xyXG5cclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIC8vIOS9v+eUqCBab2Qgc2NoZW1hIOmqjOivgeWSjOi9rOaNouWPguaVsFxyXG4gICAgICAgICAgICAgICAgY29uc3QgdmFsaWRhdGVkVmFsdWUgPSBwYXJhbS5zY2hlbWEucGFyc2UodmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgbWV0aG9kQXJnc1twYXJhbS5pbmRleF0gPSB2YWxpZGF0ZWRWYWx1ZTtcclxuICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgIC8vIOWwneivleWkhOeQhiBHZW1pbmkg5Lyg5Zue55qEIHN0cmluZyDnsbvlnovmlbDlrZcgKOmSiOWvuSBudW1lcmljIGVudW0pXHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiAhaXNOYU4oTnVtYmVyKHZhbHVlKSkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBudW1WYWx1ZSA9IE51bWJlcih2YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHZhbGlkYXRlZFZhbHVlID0gcGFyYW0uc2NoZW1hLnBhcnNlKG51bVZhbHVlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWV0aG9kQXJnc1twYXJhbS5pbmRleF0gPSB2YWxpZGF0ZWRWYWx1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoaW5uZXJFcnJvcikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyDlv73nlaXlhoXpg6jplJnor6/vvIznu6fnu63mipvlh7rljp/lp4vplJnor69cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFBhcmFtZXRlciB2YWxpZGF0aW9uIGZhaWxlZCBmb3IgJHtwYXJhbU5hbWV9OmAsIGVycm9yKTtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgdGhpcy5idWlsZGVySG9vay5vblZhbGlkYXRpb25GYWlsZWQodG9vbE5hbWUsIHBhcmFtTmFtZSwgZXJyb3IpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIOS9v+eUqOWOn+Wni+WAvFxyXG4gICAgICAgICAgICAgICAgbWV0aG9kQXJnc1twYXJhbS5pbmRleF0gPSB2YWx1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIG1ldGhvZEFyZ3M7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDosIPnlKjlt6Xlhbfmlrnms5VcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBhc3luYyBjYWxsVG9vbE1ldGhvZCh0YXJnZXQ6IGFueSwgbWV0YTogYW55LCBhcmdzOiBhbnlbXSk6IFByb21pc2U8YW55PiB7XHJcbiAgICAgICAgLy8g6I635Y+W5oiW5Yib5bu65a6e5L6LXHJcbiAgICAgICAgY29uc3QgaW5zdGFuY2UgPSBhd2FpdCB0aGlzLmdldFRvb2xJbnN0YW5jZSh0YXJnZXQpO1xyXG5cclxuICAgICAgICAvLyDojrflj5bmlrnms5VcclxuICAgICAgICBjb25zdCBtZXRob2QgPSBpbnN0YW5jZVttZXRhLm1ldGhvZE5hbWVdO1xyXG4gICAgICAgIGlmICh0eXBlb2YgbWV0aG9kICE9PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgTWV0aG9kICR7U3RyaW5nKG1ldGEubWV0aG9kTmFtZSl9IG5vdCBmb3VuZCBvbiBpbnN0YW5jZWApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8g6LCD55So5pa55rOVXHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IG1ldGhvZC5hcHBseShpbnN0YW5jZSwgYXJncyk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDojrflj5blt6Xlhbflrp7kvotcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBhc3luYyBnZXRUb29sSW5zdGFuY2UodGFyZ2V0OiBhbnkpOiBQcm9taXNlPGFueT4ge1xyXG4gICAgICAgIC8vIOWmguaenCB0YXJnZXQg5bey57uP5piv5a6e5L6L77yM55u05o6l6L+U5ZueXHJcbiAgICAgICAgaWYgKHR5cGVvZiB0YXJnZXQgPT09ICdvYmplY3QnICYmIHRhcmdldCAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGFyZ2V0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmFibGUgdG8gY3JlYXRlIHRvb2wgaW5zdGFuY2UnKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOagvOW8j+WMluW3peWFt+e7k+aenFxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGZvcm1hdFRvb2xSZXN1bHQobWV0YTogYW55LCByZXN1bHQ6IGFueSk6IHN0cmluZyB7XHJcbiAgICAgICAgLy8g5p6E5bu656ym5ZCIIHNjaGVtYSDnmoTnu5Pmnpznu5PmnoTvvIznlKggcmVzdWx0IOWtl+auteWMheijhVxyXG4gICAgICAgIGlmIChtZXRhLnJldHVyblNjaGVtYSkge1xyXG4gICAgICAgICAgICAvLyDpqozor4Hnu5PmnpzmmK/lkKbnrKblkIjpooTmnJ/nmoQgc2NoZW1hXHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0LnJlYXNvbikge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdC5yZWFzb24gPSBzdHJpcEFuc2kocmVzdWx0LnJlYXNvbik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjb25zdCB2YWxpZGF0ZWRSZXN1bHQgPSBtZXRhLnJldHVyblNjaGVtYS5wYXJzZShyZXN1bHQpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHsgcmVzdWx0OiB2YWxpZGF0ZWRSZXN1bHQgfSwgbnVsbCwgMik7XHJcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFRvb2wgcmVzdWx0IHZhbGlkYXRpb24gZmFpbGVkOiAke2Vycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKX1gKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHsgcmVzdWx0OiByZXN1bHQgfSwgbnVsbCwgMik7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhc3luYyBoYW5kbGVNY3BSZXF1ZXN0KHJlcTogUmVxdWVzdCwgcmVzOiBSZXNwb25zZSk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIC8vIOS4uuavj+S4quivt+axguWIm+W7uuaWsOeahOS8oOi+k+WxguS7pemYsuatouivt+axgiBJRCDlhrLnqoFcclxuICAgICAgICAgICAgY29uc3QgdHJhbnNwb3J0ID0gbmV3IFN0cmVhbWFibGVIVFRQU2VydmVyVHJhbnNwb3J0KHtcclxuICAgICAgICAgICAgICAgIHNlc3Npb25JZEdlbmVyYXRvcjogdW5kZWZpbmVkLFxyXG4gICAgICAgICAgICAgICAgZW5hYmxlSnNvblJlc3BvbnNlOiB0cnVlXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgcmVzLm9uKCdjbG9zZScsICgpID0+IHtcclxuICAgICAgICAgICAgICAgIHRyYW5zcG9ydC5jbG9zZSgpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuc2VydmVyLmNvbm5lY3QodHJhbnNwb3J0KTtcclxuICAgICAgICAgICAgYXdhaXQgdHJhbnNwb3J0LmhhbmRsZVJlcXVlc3QocmVxLCByZXMsIHJlcS5ib2R5KTtcclxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdNQ1AgcmVxdWVzdCBoYW5kbGluZyBlcnJvcjonLCBlcnJvcik7XHJcbiAgICAgICAgICAgIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdJbnRlcm5hbCBzZXJ2ZXIgZXJyb3InIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFzeW5jIGhhbmRsZVNzZVJlcXVlc3QocmVxOiBSZXF1ZXN0LCByZXM6IFJlc3BvbnNlKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgLy8g6K6+572uIFNTRSDlk43lupTlpLRcclxuICAgICAgICAgICAgcmVzLnNldEhlYWRlcignQ29udGVudC1UeXBlJywgJ3RleHQvZXZlbnQtc3RyZWFtJyk7XHJcbiAgICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ0NhY2hlLUNvbnRyb2wnLCAnbm8tY2FjaGUnKTtcclxuICAgICAgICAgICAgcmVzLnNldEhlYWRlcignQ29ubmVjdGlvbicsICdrZWVwLWFsaXZlJyk7XHJcbiAgICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbicsICcqJyk7XHJcbiAgICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnMnLCAnQ2FjaGUtQ29udHJvbCcpO1xyXG5cclxuICAgICAgICAgICAgLy8g5Li6IFNTRSDov57mjqXliJvlu7rkvKDovpPlsYJcclxuICAgICAgICAgICAgY29uc3QgdHJhbnNwb3J0ID0gbmV3IFN0cmVhbWFibGVIVFRQU2VydmVyVHJhbnNwb3J0KHtcclxuICAgICAgICAgICAgICAgIHNlc3Npb25JZEdlbmVyYXRvcjogdW5kZWZpbmVkLFxyXG4gICAgICAgICAgICAgICAgZW5hYmxlSnNvblJlc3BvbnNlOiBmYWxzZSAvLyBTU0Ug5LiN6ZyA6KaBIEpTT04g5ZON5bqUXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgLy8g5aSE55CG6L+e5o6l5YWz6ZetXHJcbiAgICAgICAgICAgIHJlcy5vbignY2xvc2UnLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0cmFuc3BvcnQuY2xvc2UoKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICByZXEub24oJ2Nsb3NlJywgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdHJhbnNwb3J0LmNsb3NlKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgLy8g6L+e5o6l5YiwIE1DUCDmnI3liqHlmahcclxuICAgICAgICAgICAgYXdhaXQgdGhpcy5zZXJ2ZXIuY29ubmVjdCh0cmFuc3BvcnQpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgLy8g5aSE55CGIFNTRSDor7fmsYJcclxuICAgICAgICAgICAgYXdhaXQgdHJhbnNwb3J0LmhhbmRsZVJlcXVlc3QocmVxLCByZXMsIHJlcS5ib2R5KTtcclxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdNQ1AgU1NFIHJlcXVlc3QgaGFuZGxpbmcgZXJyb3I6JywgZXJyb3IpO1xyXG4gICAgICAgICAgICBpZiAoIXJlcy5oZWFkZXJzU2VudCkge1xyXG4gICAgICAgICAgICAgICAgcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0ludGVybmFsIHNlcnZlciBlcnJvcicgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldE1pZGRsZXdhcmVDb250cmlidXRpb24oKTogSU1pZGRsZXdhcmVDb250cmlidXRpb24ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGdldDogW1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHVybDogJy9tY3AnLFxyXG4gICAgICAgICAgICAgICAgICAgIGhhbmRsZXI6IHRoaXMuaGFuZGxlU3NlUmVxdWVzdC5iaW5kKHRoaXMpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgIHBvc3Q6IFtcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB1cmw6ICcvbWNwJyxcclxuICAgICAgICAgICAgICAgICAgICBoYW5kbGVyOiB0aGlzLmhhbmRsZU1jcFJlcXVlc3QuYmluZCh0aGlzKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5bCGIFpvZCBTY2hlbWEg6L2s5o2i5Li65YW85a655oCn6auY55qEIGpzb25TY2hlbWE3IOagvOW8j1xyXG4gICAgICovXHJcbiAgICBwcml2YXRlIHpvZFRvSlNPTlNjaGVtYTcoem9kT2JqOiB6LlpvZFR5cGVBbnkpOiBhbnkge1xyXG4gICAgICAgIHJldHVybiB6b2RUb0pzb25TY2hlbWEoem9kT2JqLCB7XHJcbiAgICAgICAgICAgIHRhcmdldDogJ2pzb25TY2hlbWE3JyxcclxuICAgICAgICAgICAgJHJlZlN0cmF0ZWd5OiAnbm9uZScsXHJcbiAgICAgICAgfSkgYXMgYW55O1xyXG4gICAgfVxyXG59XHJcbiJdfQ==