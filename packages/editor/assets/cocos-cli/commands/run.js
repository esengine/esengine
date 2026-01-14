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
exports.RunCommand = void 0;
const chalk_1 = __importDefault(require("chalk"));
const base_1 = require("./base");
/**
 * Run 命令类
 */
class RunCommand extends base_1.BaseCommand {
    register() {
        this.program
            .command('run')
            .description('Run a Cocos project')
            .requiredOption('-p, --platform <platform>', 'Target platform (web-desktop, web-mobile, android, ios, etc.)')
            .requiredOption('-d, --dest <path>', 'Destination path of the built project')
            .action(async (options) => {
            try {
                const { CocosAPI } = await Promise.resolve().then(() => __importStar(require('../api/index')));
                const result = await CocosAPI.runProject(options.platform, options.dest);
                if (result.code === 0 /* BuildExitCode.BUILD_SUCCESS */) {
                    console.log(chalk_1.default.green('✓ Project is running!'));
                }
                else {
                    console.error(chalk_1.default.red('✗ Failed to run project!'));
                    process.exit(result.code);
                }
                // Run command might be long-running, so we might not want to exit immediately if it's a server or watcher.
                // However, based on the API signature returning a promise, it might be a fire-and-forget or wait-until-done.
                // If it's a server, we probably shouldn't exit.
                // But for now, let's assume it returns when done or if it's just launching something.
                // If it returns a process or similar, we might need to handle it.
                // For now, I'll follow the pattern but be aware it might need to stay alive.
                // If runProject returns a boolean indicating success of *launch*, then exit(0) is fine.
            }
            catch (error) {
                console.error(chalk_1.default.red('Failed to run project:'), error);
                process.exit(1);
            }
        });
    }
}
exports.RunCommand = RunCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnVuLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbW1hbmRzL3J1bi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxrREFBMEI7QUFDMUIsaUNBQXFDO0FBR3JDOztHQUVHO0FBQ0gsTUFBYSxVQUFXLFNBQVEsa0JBQVc7SUFDdkMsUUFBUTtRQUNKLElBQUksQ0FBQyxPQUFPO2FBQ1AsT0FBTyxDQUFDLEtBQUssQ0FBQzthQUNkLFdBQVcsQ0FBQyxxQkFBcUIsQ0FBQzthQUNsQyxjQUFjLENBQUMsMkJBQTJCLEVBQUUsK0RBQStELENBQUM7YUFDNUcsY0FBYyxDQUFDLG1CQUFtQixFQUFFLHVDQUF1QyxDQUFDO2FBQzVFLE1BQU0sQ0FBQyxLQUFLLEVBQUUsT0FBWSxFQUFFLEVBQUU7WUFDM0IsSUFBSSxDQUFDO2dCQUVELE1BQU0sRUFBRSxRQUFRLEVBQUUsR0FBRyx3REFBYSxjQUFjLEdBQUMsQ0FBQztnQkFDbEQsTUFBTSxNQUFNLEdBQUcsTUFBTSxRQUFRLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUN6RSxJQUFJLE1BQU0sQ0FBQyxJQUFJLHdDQUFnQyxFQUFFLENBQUM7b0JBQzlDLE9BQU8sQ0FBQyxHQUFHLENBQUMsZUFBSyxDQUFDLEtBQUssQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLENBQUM7Z0JBQ3RELENBQUM7cUJBQU0sQ0FBQztvQkFDSixPQUFPLENBQUMsS0FBSyxDQUFDLGVBQUssQ0FBQyxHQUFHLENBQUMsMEJBQTBCLENBQUMsQ0FBQyxDQUFDO29CQUNyRCxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDOUIsQ0FBQztnQkFDRCwyR0FBMkc7Z0JBQzNHLDZHQUE2RztnQkFDN0csZ0RBQWdEO2dCQUNoRCxzRkFBc0Y7Z0JBQ3RGLGtFQUFrRTtnQkFDbEUsNkVBQTZFO2dCQUM3RSx3RkFBd0Y7WUFDNUYsQ0FBQztZQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7Z0JBQ2IsT0FBTyxDQUFDLEtBQUssQ0FBQyxlQUFLLENBQUMsR0FBRyxDQUFDLHdCQUF3QixDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQzFELE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDcEIsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ1gsQ0FBQztDQUNKO0FBL0JELGdDQStCQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBjaGFsayBmcm9tICdjaGFsayc7XHJcbmltcG9ydCB7IEJhc2VDb21tYW5kIH0gZnJvbSAnLi9iYXNlJztcclxuaW1wb3J0IHsgQnVpbGRFeGl0Q29kZSB9IGZyb20gJy4uL2NvcmUvYnVpbGRlci9AdHlwZXMvcHJvdGVjdGVkJztcclxuXHJcbi8qKlxyXG4gKiBSdW4g5ZG95Luk57G7XHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgUnVuQ29tbWFuZCBleHRlbmRzIEJhc2VDb21tYW5kIHtcclxuICAgIHJlZ2lzdGVyKCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMucHJvZ3JhbVxyXG4gICAgICAgICAgICAuY29tbWFuZCgncnVuJylcclxuICAgICAgICAgICAgLmRlc2NyaXB0aW9uKCdSdW4gYSBDb2NvcyBwcm9qZWN0JylcclxuICAgICAgICAgICAgLnJlcXVpcmVkT3B0aW9uKCctcCwgLS1wbGF0Zm9ybSA8cGxhdGZvcm0+JywgJ1RhcmdldCBwbGF0Zm9ybSAod2ViLWRlc2t0b3AsIHdlYi1tb2JpbGUsIGFuZHJvaWQsIGlvcywgZXRjLiknKVxyXG4gICAgICAgICAgICAucmVxdWlyZWRPcHRpb24oJy1kLCAtLWRlc3QgPHBhdGg+JywgJ0Rlc3RpbmF0aW9uIHBhdGggb2YgdGhlIGJ1aWx0IHByb2plY3QnKVxyXG4gICAgICAgICAgICAuYWN0aW9uKGFzeW5jIChvcHRpb25zOiBhbnkpID0+IHtcclxuICAgICAgICAgICAgICAgIHRyeSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHsgQ29jb3NBUEkgfSA9IGF3YWl0IGltcG9ydCgnLi4vYXBpL2luZGV4Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgQ29jb3NBUEkucnVuUHJvamVjdChvcHRpb25zLnBsYXRmb3JtLCBvcHRpb25zLmRlc3QpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHQuY29kZSA9PT0gQnVpbGRFeGl0Q29kZS5CVUlMRF9TVUNDRVNTKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGNoYWxrLmdyZWVuKCfinJMgUHJvamVjdCBpcyBydW5uaW5nIScpKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGNoYWxrLnJlZCgn4pyXIEZhaWxlZCB0byBydW4gcHJvamVjdCEnKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb2Nlc3MuZXhpdChyZXN1bHQuY29kZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIC8vIFJ1biBjb21tYW5kIG1pZ2h0IGJlIGxvbmctcnVubmluZywgc28gd2UgbWlnaHQgbm90IHdhbnQgdG8gZXhpdCBpbW1lZGlhdGVseSBpZiBpdCdzIGEgc2VydmVyIG9yIHdhdGNoZXIuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gSG93ZXZlciwgYmFzZWQgb24gdGhlIEFQSSBzaWduYXR1cmUgcmV0dXJuaW5nIGEgcHJvbWlzZSwgaXQgbWlnaHQgYmUgYSBmaXJlLWFuZC1mb3JnZXQgb3Igd2FpdC11bnRpbC1kb25lLlxyXG4gICAgICAgICAgICAgICAgICAgIC8vIElmIGl0J3MgYSBzZXJ2ZXIsIHdlIHByb2JhYmx5IHNob3VsZG4ndCBleGl0LlxyXG4gICAgICAgICAgICAgICAgICAgIC8vIEJ1dCBmb3Igbm93LCBsZXQncyBhc3N1bWUgaXQgcmV0dXJucyB3aGVuIGRvbmUgb3IgaWYgaXQncyBqdXN0IGxhdW5jaGluZyBzb21ldGhpbmcuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gSWYgaXQgcmV0dXJucyBhIHByb2Nlc3Mgb3Igc2ltaWxhciwgd2UgbWlnaHQgbmVlZCB0byBoYW5kbGUgaXQuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gRm9yIG5vdywgSSdsbCBmb2xsb3cgdGhlIHBhdHRlcm4gYnV0IGJlIGF3YXJlIGl0IG1pZ2h0IG5lZWQgdG8gc3RheSBhbGl2ZS5cclxuICAgICAgICAgICAgICAgICAgICAvLyBJZiBydW5Qcm9qZWN0IHJldHVybnMgYSBib29sZWFuIGluZGljYXRpbmcgc3VjY2VzcyBvZiAqbGF1bmNoKiwgdGhlbiBleGl0KDApIGlzIGZpbmUuXHJcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoY2hhbGsucmVkKCdGYWlsZWQgdG8gcnVuIHByb2plY3Q6JyksIGVycm9yKTtcclxuICAgICAgICAgICAgICAgICAgICBwcm9jZXNzLmV4aXQoMSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgfVxyXG59XHJcbiJdfQ==