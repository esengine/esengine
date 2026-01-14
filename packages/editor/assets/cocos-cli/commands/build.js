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
exports.BuildCommand = void 0;
const chalk_1 = __importDefault(require("chalk"));
const base_1 = require("./base");
const fs_extra_1 = require("fs-extra");
/**
 * Build 命令类
 */
class BuildCommand extends base_1.BaseCommand {
    register() {
        this.program
            .command('build')
            .description('Build a Cocos project')
            .requiredOption('-j, --project <path>', 'Path to the Cocos project (required)')
            .requiredOption('-p, --platform <platform>', 'Target platform (web-desktop, web-mobile, android, ios, etc.)')
            .option('-c,--build-config <path>', 'Specify build config file path')
            .option('--ndkPath <path>', 'Android NDK path (for Android platform)')
            .option('--sdkPath <path>', 'Android SDK path (for Android platform)')
            .action(async (options) => {
            try {
                const resolvedPath = this.validateProjectPath(options.project);
                if (options.buildConfig) {
                    if (!(0, fs_extra_1.existsSync)(options.buildConfig)) {
                        console.error(`config: ${options.buildConfig} is not exist!`);
                        process.exit(34 /* BuildExitCode.BUILD_FAILED */);
                    }
                    console.debug(`Read config from path ${options.buildConfig}...`);
                    let data = (0, fs_extra_1.readJSONSync)(options.buildConfig);
                    // 功能点：options 传递的值，允许覆盖配置文件内的同属性值
                    data = Object.assign(data, options);
                    // 避免修改原始 options
                    Object.assign(options, data);
                    // 移除旧的 key 方便和 configPath 未读取的情况做区分
                    delete options.buildConfig;
                }
                // 处理 Android 平台特定的命令行参数
                if (options.platform === 'android') {
                    if (options.ndkPath || options.sdkPath) {
                        if (!options.packages) {
                            options.packages = {};
                        }
                        if (!options.packages.android) {
                            options.packages.android = {};
                        }
                        // 命令行指定的 ndkPath 覆盖配置文件中的值
                        if (options.ndkPath) {
                            options.packages.android.ndkPath = options.ndkPath;
                            delete options.ndkPath; // 清理，避免传递到其他地方
                        }
                        // 命令行指定的 sdkPath 覆盖配置文件中的值
                        if (options.sdkPath) {
                            options.packages.android.sdkPath = options.sdkPath;
                            delete options.sdkPath; // 清理，避免传递到其他地方
                        }
                    }
                }
                const { CocosAPI } = await Promise.resolve().then(() => __importStar(require('../api/index')));
                const result = await CocosAPI.buildProject(resolvedPath, options.platform, options);
                if (result.code === 0 /* BuildExitCode.BUILD_SUCCESS */) {
                    console.log(chalk_1.default.green('✓ Build completed successfully! Build Dest: ' + result.dest));
                }
                else {
                    console.error(chalk_1.default.red('✗ Build failed!'));
                }
                process.exit(result.code);
            }
            catch (error) {
                console.error(chalk_1.default.red('Failed to build project:'), error);
                process.exit(1);
            }
        });
    }
}
exports.BuildCommand = BuildCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVpbGQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29tbWFuZHMvYnVpbGQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsa0RBQTBCO0FBQzFCLGlDQUFtRDtBQUVuRCx1Q0FBb0Q7QUFFcEQ7O0dBRUc7QUFDSCxNQUFhLFlBQWEsU0FBUSxrQkFBVztJQUN6QyxRQUFRO1FBQ0osSUFBSSxDQUFDLE9BQU87YUFDUCxPQUFPLENBQUMsT0FBTyxDQUFDO2FBQ2hCLFdBQVcsQ0FBQyx1QkFBdUIsQ0FBQzthQUNwQyxjQUFjLENBQUMsc0JBQXNCLEVBQUUsc0NBQXNDLENBQUM7YUFDOUUsY0FBYyxDQUFDLDJCQUEyQixFQUFFLCtEQUErRCxDQUFDO2FBQzVHLE1BQU0sQ0FBQywwQkFBMEIsRUFBRSxnQ0FBZ0MsQ0FBQzthQUNwRSxNQUFNLENBQUMsa0JBQWtCLEVBQUUseUNBQXlDLENBQUM7YUFDckUsTUFBTSxDQUFDLGtCQUFrQixFQUFFLHlDQUF5QyxDQUFDO2FBQ3JFLE1BQU0sQ0FBQyxLQUFLLEVBQUUsT0FBWSxFQUFFLEVBQUU7WUFDM0IsSUFBSSxDQUFDO2dCQUNELE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBRS9ELElBQUksT0FBTyxDQUFDLFdBQVcsRUFBRSxDQUFDO29CQUN0QixJQUFJLENBQUMsSUFBQSxxQkFBVSxFQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDO3dCQUNuQyxPQUFPLENBQUMsS0FBSyxDQUFDLFdBQVcsT0FBTyxDQUFDLFdBQVcsZ0JBQWdCLENBQUMsQ0FBQzt3QkFDOUQsT0FBTyxDQUFDLElBQUkscUNBQTRCLENBQUM7b0JBQzdDLENBQUM7b0JBQ0QsT0FBTyxDQUFDLEtBQUssQ0FBQyx5QkFBeUIsT0FBTyxDQUFDLFdBQVcsS0FBSyxDQUFDLENBQUM7b0JBQ2pFLElBQUksSUFBSSxHQUFHLElBQUEsdUJBQVksRUFBQyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7b0JBQzdDLGtDQUFrQztvQkFDbEMsSUFBSSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO29CQUNwQyxpQkFBaUI7b0JBQ2pCLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO29CQUM3QixvQ0FBb0M7b0JBQ3BDLE9BQU8sT0FBTyxDQUFDLFdBQVcsQ0FBQztnQkFDL0IsQ0FBQztnQkFFRCx3QkFBd0I7Z0JBQ3hCLElBQUksT0FBTyxDQUFDLFFBQVEsS0FBSyxTQUFTLEVBQUUsQ0FBQztvQkFDakMsSUFBSSxPQUFPLENBQUMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQzt3QkFDckMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQzs0QkFDcEIsT0FBTyxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUM7d0JBQzFCLENBQUM7d0JBQ0QsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLENBQUM7NEJBQzVCLE9BQU8sQ0FBQyxRQUFRLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQzt3QkFDbEMsQ0FBQzt3QkFDRCwyQkFBMkI7d0JBQzNCLElBQUksT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDOzRCQUNsQixPQUFPLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQzs0QkFDbkQsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsZUFBZTt3QkFDM0MsQ0FBQzt3QkFDRCwyQkFBMkI7d0JBQzNCLElBQUksT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDOzRCQUNsQixPQUFPLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQzs0QkFDbkQsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsZUFBZTt3QkFDM0MsQ0FBQztvQkFDTCxDQUFDO2dCQUNMLENBQUM7Z0JBRUQsTUFBTSxFQUFFLFFBQVEsRUFBRSxHQUFHLHdEQUFhLGNBQWMsR0FBQyxDQUFDO2dCQUNsRCxNQUFNLE1BQU0sR0FBRyxNQUFNLFFBQVEsQ0FBQyxZQUFZLENBQUMsWUFBWSxFQUFFLE9BQU8sQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUM7Z0JBQ3BGLElBQUksTUFBTSxDQUFDLElBQUksd0NBQWdDLEVBQUUsQ0FBQztvQkFDOUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxlQUFLLENBQUMsS0FBSyxDQUFDLDhDQUE4QyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUMzRixDQUFDO3FCQUFNLENBQUM7b0JBQ0osT0FBTyxDQUFDLEtBQUssQ0FBQyxlQUFLLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQztnQkFDaEQsQ0FBQztnQkFDRCxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUM5QixDQUFDO1lBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztnQkFDYixPQUFPLENBQUMsS0FBSyxDQUFDLGVBQUssQ0FBQyxHQUFHLENBQUMsMEJBQTBCLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDNUQsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNwQixDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDWCxDQUFDO0NBQ0o7QUFqRUQsb0NBaUVDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGNoYWxrIGZyb20gJ2NoYWxrJztcclxuaW1wb3J0IHsgQmFzZUNvbW1hbmQsIENvbW1hbmRVdGlscyB9IGZyb20gJy4vYmFzZSc7XHJcbmltcG9ydCB7IElCdWlsZENvbW1hbmRPcHRpb24sIEJ1aWxkRXhpdENvZGUgfSBmcm9tICcuLi9jb3JlL2J1aWxkZXIvQHR5cGVzL3Byb3RlY3RlZCc7XHJcbmltcG9ydCB7IGV4aXN0c1N5bmMsIHJlYWRKU09OU3luYyB9IGZyb20gJ2ZzLWV4dHJhJztcclxuXHJcbi8qKlxyXG4gKiBCdWlsZCDlkb3ku6TnsbtcclxuICovXHJcbmV4cG9ydCBjbGFzcyBCdWlsZENvbW1hbmQgZXh0ZW5kcyBCYXNlQ29tbWFuZCB7XHJcbiAgICByZWdpc3RlcigpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLnByb2dyYW1cclxuICAgICAgICAgICAgLmNvbW1hbmQoJ2J1aWxkJylcclxuICAgICAgICAgICAgLmRlc2NyaXB0aW9uKCdCdWlsZCBhIENvY29zIHByb2plY3QnKVxyXG4gICAgICAgICAgICAucmVxdWlyZWRPcHRpb24oJy1qLCAtLXByb2plY3QgPHBhdGg+JywgJ1BhdGggdG8gdGhlIENvY29zIHByb2plY3QgKHJlcXVpcmVkKScpXHJcbiAgICAgICAgICAgIC5yZXF1aXJlZE9wdGlvbignLXAsIC0tcGxhdGZvcm0gPHBsYXRmb3JtPicsICdUYXJnZXQgcGxhdGZvcm0gKHdlYi1kZXNrdG9wLCB3ZWItbW9iaWxlLCBhbmRyb2lkLCBpb3MsIGV0Yy4pJylcclxuICAgICAgICAgICAgLm9wdGlvbignLWMsLS1idWlsZC1jb25maWcgPHBhdGg+JywgJ1NwZWNpZnkgYnVpbGQgY29uZmlnIGZpbGUgcGF0aCcpXHJcbiAgICAgICAgICAgIC5vcHRpb24oJy0tbmRrUGF0aCA8cGF0aD4nLCAnQW5kcm9pZCBOREsgcGF0aCAoZm9yIEFuZHJvaWQgcGxhdGZvcm0pJylcclxuICAgICAgICAgICAgLm9wdGlvbignLS1zZGtQYXRoIDxwYXRoPicsICdBbmRyb2lkIFNESyBwYXRoIChmb3IgQW5kcm9pZCBwbGF0Zm9ybSknKVxyXG4gICAgICAgICAgICAuYWN0aW9uKGFzeW5jIChvcHRpb25zOiBhbnkpID0+IHtcclxuICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVzb2x2ZWRQYXRoID0gdGhpcy52YWxpZGF0ZVByb2plY3RQYXRoKG9wdGlvbnMucHJvamVjdCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLmJ1aWxkQ29uZmlnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghZXhpc3RzU3luYyhvcHRpb25zLmJ1aWxkQ29uZmlnKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgY29uZmlnOiAke29wdGlvbnMuYnVpbGRDb25maWd9IGlzIG5vdCBleGlzdCFgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb2Nlc3MuZXhpdChCdWlsZEV4aXRDb2RlLkJVSUxEX0ZBSUxFRCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5kZWJ1ZyhgUmVhZCBjb25maWcgZnJvbSBwYXRoICR7b3B0aW9ucy5idWlsZENvbmZpZ30uLi5gKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGRhdGEgPSByZWFkSlNPTlN5bmMob3B0aW9ucy5idWlsZENvbmZpZyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIOWKn+iDveeCue+8mm9wdGlvbnMg5Lyg6YCS55qE5YC877yM5YWB6K646KaG55uW6YWN572u5paH5Lu25YaF55qE5ZCM5bGe5oCn5YC8XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEgPSBPYmplY3QuYXNzaWduKGRhdGEsIG9wdGlvbnMpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyDpgb/lhY3kv67mlLnljp/lp4sgb3B0aW9uc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBPYmplY3QuYXNzaWduKG9wdGlvbnMsIGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyDnp7vpmaTml6fnmoQga2V5IOaWueS+v+WSjCBjb25maWdQYXRoIOacquivu+WPlueahOaDheWGteWBmuWMuuWIhlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgb3B0aW9ucy5idWlsZENvbmZpZztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIOWkhOeQhiBBbmRyb2lkIOW5s+WPsOeJueWumueahOWRveS7pOihjOWPguaVsFxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLnBsYXRmb3JtID09PSAnYW5kcm9pZCcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMubmRrUGF0aCB8fCBvcHRpb25zLnNka1BhdGgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghb3B0aW9ucy5wYWNrYWdlcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnMucGFja2FnZXMgPSB7fTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghb3B0aW9ucy5wYWNrYWdlcy5hbmRyb2lkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5wYWNrYWdlcy5hbmRyb2lkID0ge307XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyDlkb3ku6TooYzmjIflrprnmoQgbmRrUGF0aCDopobnm5bphY3nva7mlofku7bkuK3nmoTlgLxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLm5ka1BhdGgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zLnBhY2thZ2VzLmFuZHJvaWQubmRrUGF0aCA9IG9wdGlvbnMubmRrUGF0aDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgb3B0aW9ucy5uZGtQYXRoOyAvLyDmuIXnkIbvvIzpgb/lhY3kvKDpgJLliLDlhbbku5blnLDmlrlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIOWRveS7pOihjOaMh+WumueahCBzZGtQYXRoIOimhueblumFjee9ruaWh+S7tuS4reeahOWAvFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMuc2RrUGF0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnMucGFja2FnZXMuYW5kcm9pZC5zZGtQYXRoID0gb3B0aW9ucy5zZGtQYXRoO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBvcHRpb25zLnNka1BhdGg7IC8vIOa4heeQhu+8jOmBv+WFjeS8oOmAkuWIsOWFtuS7luWcsOaWuVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHsgQ29jb3NBUEkgfSA9IGF3YWl0IGltcG9ydCgnLi4vYXBpL2luZGV4Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgQ29jb3NBUEkuYnVpbGRQcm9qZWN0KHJlc29sdmVkUGF0aCwgb3B0aW9ucy5wbGF0Zm9ybSwgb3B0aW9ucyk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdC5jb2RlID09PSBCdWlsZEV4aXRDb2RlLkJVSUxEX1NVQ0NFU1MpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coY2hhbGsuZ3JlZW4oJ+KckyBCdWlsZCBjb21wbGV0ZWQgc3VjY2Vzc2Z1bGx5ISBCdWlsZCBEZXN0OiAnICsgcmVzdWx0LmRlc3QpKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGNoYWxrLnJlZCgn4pyXIEJ1aWxkIGZhaWxlZCEnKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHByb2Nlc3MuZXhpdChyZXN1bHQuY29kZSk7XHJcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoY2hhbGsucmVkKCdGYWlsZWQgdG8gYnVpbGQgcHJvamVjdDonKSwgZXJyb3IpO1xyXG4gICAgICAgICAgICAgICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICB9XHJcbn1cclxuIl19