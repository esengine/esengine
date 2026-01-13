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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CocosAPI = void 0;
const schema_1 = require("./schema");
const decorator_1 = require("./decorator/decorator");
const schema_2 = require("./builder/schema");
class CocosAPI {
    scene;
    engine;
    project;
    assets;
    builder;
    configuration;
    system;
    scripting;
    static async create() {
        const api = new CocosAPI();
        await api._init();
        return api;
    }
    constructor() {
    }
    /**
     * 初始化 API 实例，主要是为了实现按需加载
     */
    async _init() {
        const { SceneApi } = await Promise.resolve().then(() => __importStar(require('../api/scene/scene')));
        this.scene = new SceneApi();
        const { EngineApi } = await Promise.resolve().then(() => __importStar(require('../api/engine/engine')));
        this.engine = new EngineApi();
        const { ProjectApi } = await Promise.resolve().then(() => __importStar(require('../api/project/project')));
        this.project = new ProjectApi();
        const { AssetsApi } = await Promise.resolve().then(() => __importStar(require('../api/assets/assets')));
        this.assets = new AssetsApi();
        const { BuilderApi } = await Promise.resolve().then(() => __importStar(require('../api/builder/builder')));
        this.builder = new BuilderApi();
        const { ConfigurationApi } = await Promise.resolve().then(() => __importStar(require('../api/configuration/configuration')));
        this.configuration = new ConfigurationApi();
        const { SystemApi } = await Promise.resolve().then(() => __importStar(require('../api/system/system')));
        this.system = new SystemApi();
        const { ScriptingApi } = await Promise.resolve().then(() => __importStar(require('../api/scripting/scripting')));
        this.scripting = new ScriptingApi();
    }
    /**
     * 启动 MCP 服务器
     * @param projectPath
     * @param port
     */
    startupMcpServer(projectPath, port) {
        this.startup(projectPath, port);
    }
    /**
     * 启动工程
     */
    async startup(projectPath, port) {
        const { default: Launcher } = await Promise.resolve().then(() => __importStar(require('../core/launcher')));
        const launcher = new Launcher(projectPath);
        await launcher.startup(port);
    }
    /**
     * 命令行创建入口
     * 创建一个项目
     * @param projectPath
     * @param type
     */
    static async createProject(projectPath, type) {
        const { projectManager } = await Promise.resolve().then(() => __importStar(require('../core/project-manager')));
        return await projectManager.create(projectPath, type);
    }
    /**
     * 命令行构建入口
     * @param platform
     * @param options
     */
    static async buildProject(projectPath, platform, options) {
        const { default: Launcher } = await Promise.resolve().then(() => __importStar(require('../core/launcher')));
        const launcher = new Launcher(projectPath);
        return await launcher.build(platform, options);
    }
    /**
     * 命令行打包入口
     * @param platform
     * @param dest
     */
    static async makeProject(platform, dest) {
        const { default: Launcher } = await Promise.resolve().then(() => __importStar(require('../core/launcher')));
        return await Launcher.make(platform, dest);
    }
    /**
     * 命令行运行入口
     * @param platform
     * @param dest
     */
    static async runProject(platform, dest) {
        const { default: Launcher } = await Promise.resolve().then(() => __importStar(require('../core/launcher')));
        return await Launcher.run(platform, dest);
    }
}
exports.CocosAPI = CocosAPI;
__decorate([
    __param(0, (0, decorator_1.param)(schema_1.SchemaProjectPath)),
    __param(1, (0, decorator_1.param)(schema_1.SchemaPort)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CocosAPI.prototype, "startupMcpServer", null);
__decorate([
    __param(0, (0, decorator_1.param)(schema_1.SchemaProjectPath)),
    __param(1, (0, decorator_1.param)(schema_1.SchemaPort)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CocosAPI.prototype, "startup", null);
__decorate([
    __param(0, (0, decorator_1.param)(schema_1.SchemaProjectPath)),
    __param(1, (0, decorator_1.param)(schema_1.SchemaProjectType)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CocosAPI, "createProject", null);
__decorate([
    __param(1, (0, decorator_1.param)(schema_2.SchemaPlatform)),
    __param(2, (0, decorator_1.param)(schema_2.SchemaBuildOption)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], CocosAPI, "buildProject", null);
__decorate([
    __param(0, (0, decorator_1.param)(schema_2.SchemaPlatformCanMake)),
    __param(1, (0, decorator_1.param)(schema_2.SchemaBuildDest)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CocosAPI, "makeProject", null);
__decorate([
    __param(0, (0, decorator_1.param)(schema_2.SchemaPlatform)),
    __param(1, (0, decorator_1.param)(schema_2.SchemaBuildDest)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CocosAPI, "runProject", null);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvYXBpL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQVFBLHFDQUErRztBQUMvRyxxREFBOEM7QUFDOUMsNkNBQW9LO0FBRXBLLE1BQWEsUUFBUTtJQUNWLEtBQUssQ0FBWTtJQUNqQixNQUFNLENBQWE7SUFDbkIsT0FBTyxDQUFjO0lBQ3JCLE1BQU0sQ0FBYTtJQUNuQixPQUFPLENBQWM7SUFDckIsYUFBYSxDQUFvQjtJQUNqQyxNQUFNLENBQWE7SUFDbkIsU0FBUyxDQUFnQjtJQUVoQyxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU07UUFDZixNQUFNLEdBQUcsR0FBRyxJQUFJLFFBQVEsRUFBRSxDQUFDO1FBQzNCLE1BQU0sR0FBRyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ2xCLE9BQU8sR0FBRyxDQUFDO0lBQ2YsQ0FBQztJQUVEO0lBRUEsQ0FBQztJQUVEOztPQUVHO0lBQ0ssS0FBSyxDQUFDLEtBQUs7UUFDZixNQUFNLEVBQUUsUUFBUSxFQUFFLEdBQUcsd0RBQWEsb0JBQW9CLEdBQUMsQ0FBQztRQUN4RCxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksUUFBUSxFQUFFLENBQUM7UUFDNUIsTUFBTSxFQUFFLFNBQVMsRUFBRSxHQUFHLHdEQUFhLHNCQUFzQixHQUFDLENBQUM7UUFDM0QsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLFNBQVMsRUFBRSxDQUFDO1FBQzlCLE1BQU0sRUFBRSxVQUFVLEVBQUUsR0FBRyx3REFBYSx3QkFBd0IsR0FBQyxDQUFDO1FBQzlELElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxVQUFVLEVBQUUsQ0FBQztRQUNoQyxNQUFNLEVBQUUsU0FBUyxFQUFFLEdBQUcsd0RBQWEsc0JBQXNCLEdBQUMsQ0FBQztRQUMzRCxJQUFJLENBQUMsTUFBTSxHQUFH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QSxJQUFBLGlCQUFLLEVBQUMsMEJBQWlCLENBQUMsQ0FBQTtJQUE2QixXQUFBLElBQUEsaUJBQUssRUFBQyxtQkFBVSxDQUFDLENBQUE7Ozs7dUNBSTNGO0FBUW1CO0lBQWUsV0FBQSxJQUFBLGlCQUFLLEVBQUMsMEJBQWlCLENBQUMsQ0FBQTtJQUE2QixXQUFBLElBQUEsaUJBQUssRUFBQywwQkFBaUIsQ0FBQyxDQUFBOzs7O21DQUcvRztBQU9tQjtJQUFtQyxXQUFBLElBQUEsaUJBQUssRUFBQyx1QkFBYyxDQUFDLENBQUE7SUFBdUIsV0FBQSxJQUFBLGlCQUFLLEVBQUMsMEJBQWlCLENBQUMsQ0FBQTs7OztrQ0FJMUg7QUFPbUI7SUFBYSxXQUFBLElBQUEsaUJBQUssRUFBQyw4QkFBcUIsQ0FBQyxDQUFBO0lBQThCLFdBQUEsSUFBQSxpQkFBSyxFQUFDLHdCQUFlLENBQUMsQ0FBQTs7OztpQ0FHaEg7QUFPbUI7SUFBWSxXQUFBLElBQUEsaUJBQUssRUFBQyx1QkFBYyxDQUFDLENBQUE7SUFBdUIsV0FBQSxJQUFBLGlCQUFLLEVBQUMsd0JBQWUsQ0FBQyxDQUFBOzs7O2dDQUdqRyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHsgRW5naW5lQXBpIH0gZnJvbSAnLi4vYXBpL2VuZ2luZS9lbmdpbmUnO1xyXG5pbXBvcnQgdHlwZSB7IFByb2plY3RBcGkgfSBmcm9tICcuLi9hcGkvcHJvamVjdC9wcm9qZWN0JztcclxuaW1wb3J0IHR5cGUgeyBBc3NldHNBcGkgfSBmcm9tICcuLi9hcGkvYXNzZXRzL2Fzc2V0cyc7XHJcbmltcG9ydCB0eXBlIHsgQnVpbGRlckFwaSB9IGZyb20gJy4uL2FwaS9idWlsZGVyL2J1aWxkZXInO1xyXG5pbXBvcnQgdHlwZSB7IENvbmZpZ3VyYXRpb25BcGkgfSBmcm9tICcuLi9hcGkvY29uZmlndXJhdGlvbi9jb25maWd1cmF0aW9uJztcclxuaW1wb3J0IHR5cGUgeyBTY2VuZUFwaSB9IGZyb20gJy4uL2FwaS9zY2VuZS9zY2VuZSc7XHJcbmltcG9ydCB0eXBlIHsgU3lzdGVtQXBpIH0gZnJvbSAnLi4vYXBpL3N5c3RlbS9zeXN0ZW0nO1xyXG5pbXBvcnQgdHlwZSB7IFNjcmlwdGluZ0FwaSB9IGZyb20gJy4uL2FwaS9zY3JpcHRpbmcvc2NyaXB0aW5nJztcclxuaW1wb3J0IHsgU2NoZW1hUHJvamVjdFBhdGgsIFNjaGVtYVBvcnQsIFNjaGVtYVByb2plY3RUeXBlLCBUUHJvamVjdFBhdGgsIFRQb3J0LCBUUHJvamVjdFR5cGUgfSBmcm9tICcuL3NjaGVtYSc7XHJcbmltcG9ydCB7IHBhcmFtIH0gZnJvbSAnLi9kZWNvcmF0b3IvZGVjb3JhdG9yJztcclxuaW1wb3J0IHsgU2NoZW1hUGxhdGZvcm0sIFRQbGF0Zm9ybSwgU2NoZW1hQnVpbGRPcHRpb24sIFRCdWlsZE9wdGlvbiwgU2NoZW1hUGxhdGZvcm1DYW5NYWtlLCBUUGxhdGZvcm1DYW5NYWtlLCBTY2hlbWFCdWlsZERlc3QsIFRCdWlsZERlc3QgfSBmcm9tICcuL2J1aWxkZXIvc2NoZW1hJztcclxuXHJcbmV4cG9ydCBjbGFzcyBDb2Nvc0FQSSB7XHJcbiAgICBwdWJsaWMgc2NlbmUhOiBTY2VuZUFwaTtcclxuICAgIHB1YmxpYyBlbmdpbmUhOiBFbmdpbmVBcGk7XHJcbiAgICBwdWJsaWMgcHJvamVjdCE6IFByb2plY3RBcGk7XHJcbiAgICBwdWJsaWMgYXNzZXRzITogQXNzZXRzQXBpO1xyXG4gICAgcHVibGljIGJ1aWxkZXIhOiBCdWlsZGVyQXBpO1xyXG4gICAgcHVibGljIGNvbmZpZ3VyYXRpb24hOiBDb25maWd1cmF0aW9uQXBpO1xyXG4gICAgcHVibGljIHN5c3RlbSE6IFN5c3RlbUFwaTtcclxuICAgIHB1YmxpYyBzY3JpcHRpbmchOiBTY3JpcHRpbmdBcGk7XHJcblxyXG4gICAgc3RhdGljIGFzeW5jIGNyZWF0ZSgpIHtcclxuICAgICAgICBjb25zdCBhcGkgPSBuZXcgQ29jb3NBUEkoKTtcclxuICAgICAgICBhd2FpdCBhcGkuX2luaXQoKTtcclxuICAgICAgICByZXR1cm4gYXBpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgY29uc3RydWN0b3IoKSB7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5Yid5aeL5YyWIEFQSSDlrp7kvovvvIzkuLvopoHmmK/kuLrkuoblrp7njrDmjInpnIDliqDovb1cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpIHtcclxuICAgICAgICBjb25zdCB7IFNjZW5lQXBpIH0gPSBhd2FpdCBpbXBvcnQoJy4uL2FwaS9zY2VuZS9zY2VuZScpO1xyXG4gICAgICAgIHRoaXMuc2NlbmUgPSBuZXcgU2NlbmVBcGkoKTtcclxuICAgICAgICBjb25zdCB7IEVuZ2luZUFwaSB9ID0gYXdhaXQgaW1wb3J0KCcuLi9hcGkvZW5naW5lL2VuZ2luZScpO1xyXG4gICAgICAgIHRoaXMuZW5naW5lID0gbmV3IEVuZ2luZUFwaSgpO1xyXG4gICAgICAgIGNvbnN0IHsgUHJvamVjdEFwaSB9ID0gYXdhaXQgaW1wb3J0KCcuLi9hcGkvcHJvamVjdC9wcm9qZWN0Jyk7XHJcbiAgICAgICAgdGhpcy5wcm9qZWN0ID0gbmV3IFByb2plY3RBcGkoKTtcclxuICAgICAgICBjb25zdCB7IEFzc2V0c0FwaSB9ID0gYXdhaXQgaW1wb3J0KCcuLi9hcGkvYXNzZXRzL2Fzc2V0cycpO1xyXG4gICAgICAgIHRoaXMuYXNzZXRzID0gbmV3IEFzc2V0c0FwaSgpO1xyXG4gICAgICAgIGNvbnN0IHsgQnVpbGRlckFwaSB9ID0gYXdhaXQgaW1wb3J0KCcuLi9hcGkvYnVpbGRlci9idWlsZGVyJyk7XHJcbiAgICAgICAgdGhpcy5idWlsZGVyID0gbmV3IEJ1aWxkZXJBcGkoKTtcclxuICAgICAgICBjb25zdCB7IENvbmZpZ3VyYXRpb25BcGkgfSA9IGF3YWl0IGltcG9ydCgnLi4vYXBpL2NvbmZpZ3VyYXRpb24vY29uZmlndXJhdGlvbicpO1xyXG4gICAgICAgIHRoaXMuY29uZmlndXJhdGlvbiA9IG5ldyBDb25maWd1cmF0aW9uQXBpKCk7XHJcbiAgICAgICAgY29uc3QgeyBTeXN0ZW1BcGkgfSA9IGF3YWl0IGltcG9ydCgnLi4vYXBpL3N5c3RlbS9zeXN0ZW0nKTtcclxuICAgICAgICB0aGlzLnN5c3RlbSA9IG5ldyBTeXN0ZW1BcGkoKTtcclxuICAgICAgICBjb25zdCB7IFNjcmlwdGluZ0FwaSB9ID0gYXdhaXQgaW1wb3J0KCcuLi9hcGkvc2NyaXB0aW5nL3NjcmlwdGluZycpO1xyXG4gICAgICAgIHRoaXMuc2NyaXB0aW5nID0gbmV3IFNjcmlwdGluZ0FwaSgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5ZCv5YqoIE1DUCDmnI3liqHlmahcclxuICAgICAqIEBwYXJhbSBwcm9qZWN0UGF0aCBcclxuICAgICAqIEBwYXJhbSBwb3J0IFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhcnR1cE1jcFNlcnZlcihAcGFyYW0oU2NoZW1hUHJvamVjdFBhdGgpIHByb2plY3RQYXRoOiBUUHJvamVjdFBhdGgsIEBwYXJhbShTY2hlbWFQb3J0KSBwb3J0PzogVFBvcnQpIHtcclxuICAgICAgICB0aGlzLnN0YXJ0dXAocHJvamVjdFBhdGgsIHBvcnQpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5ZCv5Yqo5bel56iLXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBhc3luYyBzdGFydHVwKEBwYXJhbShTY2hlbWFQcm9qZWN0UGF0aCkgcHJvamVjdFBhdGg6IFRQcm9qZWN0UGF0aCwgQHBhcmFtKFNjaGVtYVBvcnQpIHBvcnQ/OiBUUG9ydCkge1xyXG4gICAgICAgIGNvbnN0IHsgZGVmYXVsdDogTGF1bmNoZXIgfSA9IGF3YWl0IGltcG9ydCgnLi4vY29yZS9sYXVuY2hlcicpO1xyXG4gICAgICAgIGNvbnN0IGxhdW5jaGVyID0gbmV3IExhdW5jaGVyKHByb2plY3RQYXRoKTtcclxuICAgICAgICBhd2FpdCBsYXVuY2hlci5zdGFydHVwKHBvcnQpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5ZG95Luk6KGM5Yib5bu65YWl5Y+jXHJcbiAgICAgKiDliJvlu7rkuIDkuKrpobnnm65cclxuICAgICAqIEBwYXJhbSBwcm9qZWN0UGF0aCBcclxuICAgICAqIEBwYXJhbSB0eXBlIFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIGFzeW5jIGNyZWF0ZVByb2plY3QoQHBhcmFtKFNjaGVtYVByb2plY3RQYXRoKSBwcm9qZWN0UGF0aDogVFByb2plY3RQYXRoLCBAcGFyYW0oU2NoZW1hUHJvamVjdFR5cGUpIHR5cGU6IFRQcm9qZWN0VHlwZSkge1xyXG4gICAgICAgIGNvbnN0IHsgcHJvamVjdE1hbmFnZXIgfSA9IGF3YWl0IGltcG9ydCgnLi4vY29yZS9wcm9qZWN0LW1hbmFnZXInKTtcclxuICAgICAgICByZXR1cm4gYXdhaXQgcHJvamVjdE1hbmFnZXIuY3JlYXRlKHByb2plY3RQYXRoLCB0eXBlKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOWRveS7pOihjOaehOW7uuWFpeWPo1xyXG4gICAgICogQHBhcmFtIHBsYXRmb3JtIFxyXG4gICAgICogQHBhcmFtIG9wdGlvbnMgXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgYXN5bmMgYnVpbGRQcm9qZWN0KHByb2plY3RQYXRoOiBzdHJpbmcsIEBwYXJhbShTY2hlbWFQbGF0Zm9ybSkgcGxhdGZvcm06IFRQbGF0Zm9ybSwgQHBhcmFtKFNjaGVtYUJ1aWxkT3B0aW9uKSBvcHRpb25zOiBUQnVpbGRPcHRpb24pIHtcclxuICAgICAgICBjb25zdCB7IGRlZmF1bHQ6IExhdW5jaGVyIH0gPSBhd2FpdCBpbXBvcnQoJy4uL2NvcmUvbGF1bmNoZXInKTtcclxuICAgICAgICBjb25zdCBsYXVuY2hlciA9IG5ldyBMYXVuY2hlcihwcm9qZWN0UGF0aCk7XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IGxhdW5jaGVyLmJ1aWxkKHBsYXRmb3JtLCBvcHRpb25zIGFzIGFueSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDlkb3ku6TooYzmiZPljIXlhaXlj6NcclxuICAgICAqIEBwYXJhbSBwbGF0Zm9ybSBcclxuICAgICAqIEBwYXJhbSBkZXN0IFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIGFzeW5jIG1ha2VQcm9qZWN0KEBwYXJhbShTY2hlbWFQbGF0Zm9ybUNhbk1ha2UpIHBsYXRmb3JtOiBUUGxhdGZvcm1DYW5NYWtlLCBAcGFyYW0oU2NoZW1hQnVpbGREZXN0KSBkZXN0OiBUQnVpbGREZXN0KSB7XHJcbiAgICAgICAgY29uc3QgeyBkZWZhdWx0OiBMYXVuY2hlciB9ID0gYXdhaXQgaW1wb3J0KCcuLi9jb3JlL2xhdW5jaGVyJyk7XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IExhdW5jaGVyLm1ha2UocGxhdGZvcm0sIGRlc3QpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5ZG95Luk6KGM6L+Q6KGM5YWl5Y+jXHJcbiAgICAgKiBAcGFyYW0gcGxhdGZvcm0gXHJcbiAgICAgKiBAcGFyYW0gZGVzdCBcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBhc3luYyBydW5Qcm9qZWN0KEBwYXJhbShTY2hlbWFQbGF0Zm9ybSkgcGxhdGZvcm06IFRQbGF0Zm9ybSwgQHBhcmFtKFNjaGVtYUJ1aWxkRGVzdCkgZGVzdDogVEJ1aWxkRGVzdCkge1xyXG4gICAgICAgIGNvbnN0IHsgZGVmYXVsdDogTGF1bmNoZXIgfSA9IGF3YWl0IGltcG9ydCgnLi4vY29yZS9sYXVuY2hlcicpO1xyXG4gICAgICAgIHJldHVybiBhd2FpdCBMYXVuY2hlci5ydW4ocGxhdGZvcm0sIGRlc3QpO1xyXG4gICAgfVxyXG59XHJcbiJdfQ==