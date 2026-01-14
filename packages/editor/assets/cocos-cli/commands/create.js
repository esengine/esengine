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
exports.CreateCommand = void 0;
const chalk_1 = __importDefault(require("chalk"));
const path_1 = require("path");
const fs_1 = require("fs");
const base_1 = require("./base");
/**
 * Create 命令类
 */
class CreateCommand extends base_1.BaseCommand {
    register() {
        this.program
            .command('create')
            .description('Create a new Cocos project')
            .requiredOption('-j, --project <path>', 'Target directory to create the project (required)')
            .option('-t, --type <type>', 'Project type (2d or 3d)', '3d')
            .action(async (options) => {
            try {
                const targetPath = (0, path_1.resolve)(options.project);
                const type = (options.type === '2d' ? '2d' : '3d');
                console.log(chalk_1.default.blue('Creating project...'));
                console.log(chalk_1.default.gray(`Path: ${targetPath}`));
                console.log(chalk_1.default.gray(`Type: ${type}`));
                // 如果目标路径已存在，仅提示，不强制失败（交由底层处理器决定）
                if ((0, fs_1.existsSync)(targetPath)) {
                    console.log(chalk_1.default.yellow('Warning: target path already exists, will try to create inside it.'));
                }
                const { CocosAPI } = await Promise.resolve().then(() => __importStar(require('../api/index')));
                const ok = await CocosAPI.createProject(targetPath, type);
                if (ok) {
                    console.log(chalk_1.default.green('✓ Project created successfully!'));
                    console.log(chalk_1.default.gray('Next steps:'));
                    console.log(`  cd ${targetPath}`);
                    console.log('  cocos create --project .');
                }
                else {
                    console.error(chalk_1.default.red('✗ Failed to create project.'));
                    process.exit(1);
                }
            }
            catch (error) {
                console.error(chalk_1.default.red('Failed to create project:'), error);
                process.exit(1);
            }
        });
    }
}
exports.CreateCommand = CreateCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbW1hbmRzL2NyZWF0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxrREFBMEI7QUFDMUIsK0JBQStCO0FBQy9CLDJCQUFnQztBQUNoQyxpQ0FBcUM7QUFHckM7O0dBRUc7QUFDSCxNQUFhLGFBQWMsU0FBUSxrQkFBVztJQUMxQyxRQUFRO1FBQ0osSUFBSSxDQUFDLE9BQU87YUFDUCxPQUFPLENBQUMsUUFBUSxDQUFDO2FBQ2pCLFdBQVcsQ0FBQyw0QkFBNEIsQ0FBQzthQUN6QyxjQUFjLENBQUMsc0JBQXNCLEVBQUUsbURBQW1ELENBQUM7YUFDM0YsTUFBTSxDQUFDLG1CQUFtQixFQUFFLHlCQUF5QixFQUFFLElBQUksQ0FBQzthQUM1RCxNQUFNLENBQUMsS0FBSyxFQUFFLE9BQVksRUFBRSxFQUFFO1lBQzNCLElBQUksQ0FBQztnQkFDRCxNQUFNLFVBQVUsR0FBRyxJQUFBLGNBQU8sRUFBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQzVDLE1BQU0sSUFBSSxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBRW5ELE9BQU8sQ0FBQyxHQUFHLENBQUMsZUFBSyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLENBQUM7Z0JBQy9DLE9BQU8sQ0FBQyxHQUFHLENBQUMsZUFBSyxDQUFDLElBQUksQ0FBQyxTQUFTLFVBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDL0MsT0FBTyxDQUFDLEdBQUcsQ0FBQyxlQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUV6QyxpQ0FBaUM7Z0JBQ2pDLElBQUksSUFBQSxlQUFVLEVBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQztvQkFDekIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxlQUFLLENBQUMsTUFBTSxDQUFDLG9FQUFvRSxDQUFDLENBQUMsQ0FBQztnQkFDcEcsQ0FBQztnQkFFRCxNQUFNLEVBQUUsUUFBUSxFQUFFLEdBQUcsd0RBQWEsY0FBYyxHQUFDLENBQUM7Z0JBQ2xELE1BQU0sRUFBRSxHQUFHLE1BQU0sUUFBUSxDQUFDLGFBQWEsQ0FBQyxVQUFVLEVBQUUsSUFBbUIsQ0FBQyxDQUFDO2dCQUN6RSxJQUFJLEVBQUUsRUFBRSxDQUFDO29CQUNMLE9BQU8sQ0FBQyxHQUFHLENBQUMsZUFBSyxDQUFDLEtBQUssQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDLENBQUM7b0JBQzVELE9BQU8sQ0FBQyxHQUFHLENBQUMsZUFBSyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO29CQUN2QyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsVUFBVSxFQUFFLENBQUMsQ0FBQztvQkFDbEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO2dCQUM5QyxDQUFDO3FCQUFNLENBQUM7b0JBQ0osT0FBTyxDQUFDLEtBQUssQ0FBQyxlQUFLLENBQUMsR0FBRyxDQUFDLDZCQUE2QixDQUFDLENBQUMsQ0FBQztvQkFDeEQsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDcEIsQ0FBQztZQUNMLENBQUM7WUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO2dCQUNiLE9BQU8sQ0FBQyxLQUFLLENBQUMsZUFBSyxDQUFDLEdBQUcsQ0FBQywyQkFBMkIsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUM3RCxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3BCLENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNYLENBQUM7Q0FDSjtBQXRDRCxzQ0FzQ0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgY2hhbGsgZnJvbSAnY2hhbGsnO1xyXG5pbXBvcnQgeyByZXNvbHZlIH0gZnJvbSAncGF0aCc7XHJcbmltcG9ydCB7IGV4aXN0c1N5bmMgfSBmcm9tICdmcyc7XHJcbmltcG9ydCB7IEJhc2VDb21tYW5kIH0gZnJvbSAnLi9iYXNlJztcclxuaW1wb3J0IHsgUHJvamVjdFR5cGUgfSBmcm9tICcuLi9jb3JlL3Byb2plY3QvQHR5cGVzL3B1YmxpYyc7XHJcblxyXG4vKipcclxuICogQ3JlYXRlIOWRveS7pOexu1xyXG4gKi9cclxuZXhwb3J0IGNsYXNzIENyZWF0ZUNvbW1hbmQgZXh0ZW5kcyBCYXNlQ29tbWFuZCB7XHJcbiAgICByZWdpc3RlcigpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLnByb2dyYW1cclxuICAgICAgICAgICAgLmNvbW1hbmQoJ2NyZWF0ZScpXHJcbiAgICAgICAgICAgIC5kZXNjcmlwdGlvbignQ3JlYXRlIGEgbmV3IENvY29zIHByb2plY3QnKVxyXG4gICAgICAgICAgICAucmVxdWlyZWRPcHRpb24oJy1qLCAtLXByb2plY3QgPHBhdGg+JywgJ1RhcmdldCBkaXJlY3RvcnkgdG8gY3JlYXRlIHRoZSBwcm9qZWN0IChyZXF1aXJlZCknKVxyXG4gICAgICAgICAgICAub3B0aW9uKCctdCwgLS10eXBlIDx0eXBlPicsICdQcm9qZWN0IHR5cGUgKDJkIG9yIDNkKScsICczZCcpXHJcbiAgICAgICAgICAgIC5hY3Rpb24oYXN5bmMgKG9wdGlvbnM6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCB0YXJnZXRQYXRoID0gcmVzb2x2ZShvcHRpb25zLnByb2plY3QpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHR5cGUgPSAob3B0aW9ucy50eXBlID09PSAnMmQnID8gJzJkJyA6ICczZCcpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhjaGFsay5ibHVlKCdDcmVhdGluZyBwcm9qZWN0Li4uJykpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGNoYWxrLmdyYXkoYFBhdGg6ICR7dGFyZ2V0UGF0aH1gKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coY2hhbGsuZ3JheShgVHlwZTogJHt0eXBlfWApKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8g5aaC5p6c55uu5qCH6Lev5b6E5bey5a2Y5Zyo77yM5LuF5o+Q56S677yM5LiN5by65Yi25aSx6LSl77yI5Lqk55Sx5bqV5bGC5aSE55CG5Zmo5Yaz5a6a77yJXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGV4aXN0c1N5bmModGFyZ2V0UGF0aCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coY2hhbGsueWVsbG93KCdXYXJuaW5nOiB0YXJnZXQgcGF0aCBhbHJlYWR5IGV4aXN0cywgd2lsbCB0cnkgdG8gY3JlYXRlIGluc2lkZSBpdC4nKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBjb25zdCB7IENvY29zQVBJIH0gPSBhd2FpdCBpbXBvcnQoJy4uL2FwaS9pbmRleCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG9rID0gYXdhaXQgQ29jb3NBUEkuY3JlYXRlUHJvamVjdCh0YXJnZXRQYXRoLCB0eXBlIGFzIFByb2plY3RUeXBlKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAob2spIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coY2hhbGsuZ3JlZW4oJ+KckyBQcm9qZWN0IGNyZWF0ZWQgc3VjY2Vzc2Z1bGx5IScpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coY2hhbGsuZ3JheSgnTmV4dCBzdGVwczonKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGAgIGNkICR7dGFyZ2V0UGF0aH1gKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJyAgY29jb3MgY3JlYXRlIC0tcHJvamVjdCAuJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihjaGFsay5yZWQoJ+KclyBGYWlsZWQgdG8gY3JlYXRlIHByb2plY3QuJykpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9jZXNzLmV4aXQoMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGNoYWxrLnJlZCgnRmFpbGVkIHRvIGNyZWF0ZSBwcm9qZWN0OicpLCBlcnJvcik7XHJcbiAgICAgICAgICAgICAgICAgICAgcHJvY2Vzcy5leGl0KDEpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgIH1cclxufVxyXG5cclxuXHJcbiJdfQ==