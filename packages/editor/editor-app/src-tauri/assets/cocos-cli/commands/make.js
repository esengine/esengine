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
exports.MakeCommand = void 0;
const chalk_1 = __importDefault(require("chalk"));
const base_1 = require("./base");
/**
 * Make 命令类
 */
class MakeCommand extends base_1.BaseCommand {
    register() {
        this.program
            .command('make')
            .description('Make a Cocos native project')
            .requiredOption('-p, --platform <platform>', 'Target platform (windows, android, ios, etc.)')
            .requiredOption('-d, --dest <path>', 'Destination path for the made project')
            .action(async (options) => {
            try {
                const { CocosAPI } = await Promise.resolve().then(() => __importStar(require('../api/index')));
                const result = await CocosAPI.makeProject(options.platform, options.dest);
                if (result.code === 0 /* BuildExitCode.BUILD_SUCCESS */) {
                    console.log(chalk_1.default.green('✓ Make completed successfully!'));
                }
                else {
                    console.error(chalk_1.default.red('✗ Make failed!'));
                    process.exit(result.code);
                }
                process.exit(0);
            }
            catch (error) {
                console.error(chalk_1.default.red('Failed to make project:'), error);
                process.exit(1);
            }
        });
    }
}
exports.MakeCommand = MakeCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFrZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21tYW5kcy9tYWtlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLGtEQUEwQjtBQUMxQixpQ0FBcUM7QUFHckM7O0dBRUc7QUFDSCxNQUFhLFdBQVksU0FBUSxrQkFBVztJQUN4QyxRQUFRO1FBQ0osSUFBSSxDQUFDLE9BQU87YUFDUCxPQUFPLENBQUMsTUFBTSxDQUFDO2FBQ2YsV0FBVyxDQUFDLDZCQUE2QixDQUFDO2FBQzFDLGNBQWMsQ0FBQywyQkFBMkIsRUFBRSwrQ0FBK0MsQ0FBQzthQUM1RixjQUFjLENBQUMsbUJBQW1CLEVBQUUsdUNBQXVDLENBQUM7YUFDNUUsTUFBTSxDQUFDLEtBQUssRUFBRSxPQUFZLEVBQUUsRUFBRTtZQUMzQixJQUFJLENBQUM7Z0JBQ0QsTUFBTSxFQUFFLFFBQVEsRUFBRSxHQUFHLHdEQUFhLGNBQWMsR0FBQyxDQUFDO2dCQUNsRCxNQUFNLE1BQU0sR0FBRyxNQUFNLFFBQVEsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQzFFLElBQUksTUFBTSxDQUFDLElBQUksd0NBQWdDLEVBQUUsQ0FBQztvQkFDOUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxlQUFLLENBQUMsS0FBSyxDQUFDLGdDQUFnQyxDQUFDLENBQUMsQ0FBQztnQkFDL0QsQ0FBQztxQkFBTSxDQUFDO29CQUNKLE9BQU8sQ0FBQyxLQUFLLENBQUMsZUFBSyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUM7b0JBQzNDLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUM5QixDQUFDO2dCQUNELE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDcEIsQ0FBQztZQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7Z0JBQ2IsT0FBTyxDQUFDLEtBQUssQ0FBQyxlQUFLLENBQUMsR0FBRyxDQUFDLHlCQUF5QixDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQzNELE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDcEIsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ1gsQ0FBQztDQUNKO0FBeEJELGtDQXdCQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBjaGFsayBmcm9tICdjaGFsayc7XHJcbmltcG9ydCB7IEJhc2VDb21tYW5kIH0gZnJvbSAnLi9iYXNlJztcclxuaW1wb3J0IHsgQnVpbGRFeGl0Q29kZSB9IGZyb20gJy4uL2NvcmUvYnVpbGRlci9AdHlwZXMvcHJvdGVjdGVkJztcclxuXHJcbi8qKlxyXG4gKiBNYWtlIOWRveS7pOexu1xyXG4gKi9cclxuZXhwb3J0IGNsYXNzIE1ha2VDb21tYW5kIGV4dGVuZHMgQmFzZUNvbW1hbmQge1xyXG4gICAgcmVnaXN0ZXIoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5wcm9ncmFtXHJcbiAgICAgICAgICAgIC5jb21tYW5kKCdtYWtlJylcclxuICAgICAgICAgICAgLmRlc2NyaXB0aW9uKCdNYWtlIGEgQ29jb3MgbmF0aXZlIHByb2plY3QnKVxyXG4gICAgICAgICAgICAucmVxdWlyZWRPcHRpb24oJy1wLCAtLXBsYXRmb3JtIDxwbGF0Zm9ybT4nLCAnVGFyZ2V0IHBsYXRmb3JtICh3aW5kb3dzLCBhbmRyb2lkLCBpb3MsIGV0Yy4pJylcclxuICAgICAgICAgICAgLnJlcXVpcmVkT3B0aW9uKCctZCwgLS1kZXN0IDxwYXRoPicsICdEZXN0aW5hdGlvbiBwYXRoIGZvciB0aGUgbWFkZSBwcm9qZWN0JylcclxuICAgICAgICAgICAgLmFjdGlvbihhc3luYyAob3B0aW9uczogYW55KSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHsgQ29jb3NBUEkgfSA9IGF3YWl0IGltcG9ydCgnLi4vYXBpL2luZGV4Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgQ29jb3NBUEkubWFrZVByb2plY3Qob3B0aW9ucy5wbGF0Zm9ybSwgb3B0aW9ucy5kZXN0KTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0LmNvZGUgPT09IEJ1aWxkRXhpdENvZGUuQlVJTERfU1VDQ0VTUykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhjaGFsay5ncmVlbign4pyTIE1ha2UgY29tcGxldGVkIHN1Y2Nlc3NmdWxseSEnKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihjaGFsay5yZWQoJ+KclyBNYWtlIGZhaWxlZCEnKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb2Nlc3MuZXhpdChyZXN1bHQuY29kZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHByb2Nlc3MuZXhpdCgwKTtcclxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihjaGFsay5yZWQoJ0ZhaWxlZCB0byBtYWtlIHByb2plY3Q6JyksIGVycm9yKTtcclxuICAgICAgICAgICAgICAgICAgICBwcm9jZXNzLmV4aXQoMSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgfVxyXG59XHJcbiJdfQ==