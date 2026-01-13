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
exports.createFbxConverter = createFbxConverter;
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importStar(require("fs-extra"));
const child_process_1 = __importDefault(require("child_process"));
const utils_1 = require("../../utils");
function createFbxConverter(options) {
    const outFileName = 'out.gltf';
    let { tool: toolPath } = require('@cocos/fbx-gltf-conv');
    const temp = toolPath.replace('app.asar', 'app.asar.unpacked');
    if (fs_extra_1.default.existsSync(temp)) {
        toolPath = temp;
    }
    return {
        get options() {
            return options;
        },
        get(asset, outputDir) {
            return path_1.default.join(outputDir, outFileName);
        },
        async convert(asset, outputDir) {
            const cliArgs = [];
            // <input file>
            cliArgs.push(quotPathArg(asset.source));
            // --unit-conversion
            cliArgs.push('--unit-conversion', options.unitConversion ?? 'geometry-level');
            // --animation-bake-rate
            cliArgs.push('--animation-bake-rate', `${options.animationBakeRate ?? 0}`);
            // --prefer-local-time-span
            // Note for boolean parameters, `--o false` does not work.
            cliArgs.push(`--prefer-local-time-span=${options.preferLocalTimeSpan ?? true}`);
            cliArgs.push(`--match-mesh-names=${options.matchMeshNames ?? true}`);
            if (options.smartMaterialEnabled ?? false) {
                cliArgs.push('--export-fbx-file-header-info');
                cliArgs.push('--export-raw-materials');
            }
            // --out
            const outFile = path_1.default.join(outputDir, outFileName);
            await fs_extra_1.default.ensureDir(path_1.default.dirname(outFile));
            cliArgs.push('--out', quotPathArg(outFile));
            // --fbm-dir
            const fbmDir = path_1.default.join(outputDir, '.fbm');
            await fs_extra_1.default.ensureDir(fbmDir);
            cliArgs.push('--fbm-dir', quotPathArg(fbmDir));
            // --log-file
            const logFile = getLogFile(outputDir);
            await fs_extra_1.default.ensureDir(path_1.default.dirname(logFile));
            cliArgs.push('--log-file', quotPathArg(logFile));
            let callOk = await callFbxGLTFConv(toolPath, cliArgs, outputDir);
            if (callOk && !(await (0, fs_extra_1.pathExists)(outFile))) {
                callOk = false;
                console.error(`Tool FBX-glTF-conv ends abnormally(spawn ${toolPath} ${cliArgs.join(' ')}).`);
            }
            return callOk;
        },
        async printLogs(asset, outputDir) {
            const logFile = getLogFile(outputDir);
            if (await (0, fs_extra_1.pathExists)(logFile)) {
                let logs;
                try {
                    logs = await fs_extra_1.default.readJson(logFile);
                }
                catch {
                    console.debug('No logs are generated, it should not happen indeed.');
                }
                if (Array.isArray(logs)) {
                    // We are lazy here.
                    // If any exception happen due to log printing.
                    // We simply ignore.
                    try {
                        printConverterLogs(logs, asset);
                    }
                    catch (err) {
                        console.error(err);
                    }
                }
            }
        },
    };
    function quotPathArg(p) {
        return `"${p}"`;
    }
    function callFbxGLTFConv(tool, args, cwd) {
        return new Promise((resolve, reject) => {
            const child = child_process_1.default.spawn(quotPathArg(tool), args, {
                cwd,
                shell: true,
            });
            let output = '';
            if (child.stdout) {
                child.stdout.on('data', (data) => (output += data));
            }
            let errOutput = '';
            if (child.stderr) {
                child.stderr.on('data', (data) => (errOutput += data));
            }
            child.on('error', reject);
            child.on('close', (code) => {
                if (output) {
                    console.log(output);
                }
                if (errOutput) {
                    console.error(errOutput);
                }
                // non-zero exit code is failure
                if (code === 0) {
                    resolve(true);
                }
                else {
                    if (code === 1) {
                        // Defined by FBX-glTF-conv:
                        // Error happened, the convert result may not complete.
                        // But errors are logged.
                    }
                    else if (code === 3221225781) {
                        console.error((0, utils_1.i18nTranslate)('importer.fbx.fbx_gltf_conv.missing_dll'));
                    }
                    else if (code === 126 && process.platform === 'darwin') {
                        console.error((0, utils_1.i18nTranslate)('importer.fbx.fbx_gltf_conv.bad_cpu'));
                    }
                    else {
                        console.error(`FBX-glTF-conv existed with unexpected non-zero code ${code}`);
                    }
                    resolve(false);
                }
            });
        });
    }
    function getLogFile(outputDir) {
        return path_1.default.join(outputDir, 'log.json');
    }
    function printConverterLogs(logs, asset) {
        const getLogger = (level) => {
            let logger;
            switch (level) {
                case FbxGlTfConvLogLevel.verbose:
                    logger = console.debug;
                    break;
                case FbxGlTfConvLogLevel.info:
                    logger = console.log;
                    break;
                case FbxGlTfConvLogLevel.warning:
                    logger = console.warn;
                    break;
                case FbxGlTfConvLogLevel.error:
                case FbxGlTfConvLogLevel.fatal:
                default:
                    logger = console.error;
                    break;
            }
            return (text) => {
                logger.call(console, addAssetMark(text, asset));
            };
        };
        const inheritTypeMessageCode = 'unsupported_inherit_type';
        const mergedInheritTypeMessages = {};
        for (const { level, message } of logs) {
            const logger = getLogger(level);
            if (typeof message === 'string') {
                logger(message);
            }
            else {
                const code = message.code;
                if (code === inheritTypeMessageCode) {
                    const type = message.type;
                    const node = message.node;
                    if (!(type in mergedInheritTypeMessages)) {
                        mergedInheritTypeMessages[type] = [];
                    }
                    mergedInheritTypeMessages[type].push(node);
                }
                else if (typeof code === 'string') {
                    logger(getI18nMessage(code, message));
                }
                else {
                    logger(JSON.stringify(message, undefined, 2));
                }
            }
        }
        for (const [type, nodes] of Object.entries(mergedInheritTypeMessages)) {
            getLogger(FbxGlTfConvLogLevel.verbose)(getI18nMessage(inheritTypeMessageCode, {
                type,
                nodes,
            }));
        }
    }
    function getI18nMessage(code, message) {
        return (0, utils_1.i18nTranslate)(`importer.fbx.fbxGlTfConv.${code}`, message);
    }
    function addAssetMark(text, asset) {
        return `${text} [${(0, utils_1.linkToAssetTarget)(asset.uuid)}]`;
    }
}
var FbxGlTfConvLogLevel;
(function (FbxGlTfConvLogLevel) {
    FbxGlTfConvLogLevel[FbxGlTfConvLogLevel["verbose"] = 0] = "verbose";
    FbxGlTfConvLogLevel[FbxGlTfConvLogLevel["info"] = 1] = "info";
    FbxGlTfConvLogLevel[FbxGlTfConvLogLevel["warning"] = 2] = "warning";
    FbxGlTfConvLogLevel[FbxGlTfConvLogLevel["error"] = 3] = "error";
    FbxGlTfConvLogLevel[FbxGlTfConvLogLevel["fatal"] = 4] = "fatal";
})(FbxGlTfConvLogLevel || (FbxGlTfConvLogLevel = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmJ4LWNvbnZlcnRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jb3JlL2Fzc2V0cy9hc3NldC1oYW5kbGVyL2Fzc2V0cy91dGlscy9mYngtY29udmVydGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBUUEsZ0RBaU5DO0FBdk5ELGdEQUFzQjtBQUN0QixxREFBMEM7QUFDMUMsa0VBQStCO0FBQy9CLHVDQUErRDtBQUcvRCxTQUFnQixrQkFBa0IsQ0FBQyxPQU1sQztJQUNHLE1BQU0sV0FBVyxHQUFHLFVBQVUsQ0FBQztJQUMvQixJQUFJLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxHQUFHLE9BQU8sQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO0lBRXpELE1BQU0sSUFBSSxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLG1CQUFtQixDQUFDLENBQUM7SUFDL0QsSUFBSSxrQkFBRSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO1FBQ3RCLFFBQVEsR0FBRyxJQUFJLENBQUM7SUFDcEIsQ0FBQztJQUVELE9BQU87UUFDSCxJQUFJLE9BQU87WUFDUCxPQUFPLE9BQU8sQ0FBQztRQUNuQixDQUFDO1FBRUQsR0FBRyxDQUFDLEtBQVksRUFBRSxTQUFpQjtZQUMvQixPQUFPLGNBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBQzNDLENBQUM7UUFFRCxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQVksRUFBRSxTQUFpQjtZQUN6QyxNQUFNLE9BQU8sR0FBYSxFQUFFLENBQUM7WUFFN0IsZUFBZTtZQUNmLE9BQU8sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBRXhDLG9CQUFvQjtZQUNwQixPQUFPLENBQUMsSUFBSSxDQUFDLG1C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QztJQUVELFNBQVMsWUFBWSxDQUFDLElBQVksRUFBRSxLQUFZO1FBQzVDLE9BQU8sR0FBRyxJQUFJLEtBQUssSUFBQSx5QkFBaUIsRUFBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQztJQUN4RCxDQUFDO0FBQ0wsQ0FBQztBQU9ELElBQUssbUJBTUo7QUFORCxXQUFLLG1CQUFtQjtJQUNwQixtRUFBTyxDQUFBO0lBQ1AsNkRBQUksQ0FBQTtJQUNKLG1FQUFPLENBQUE7SUFDUCwrREFBSyxDQUFBO0lBQ0wsK0RBQUssQ0FBQTtBQUNULENBQUMsRUFOSSxtQkFBbUIsS0FBbkIsbUJBQW1CLFFBTXZCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQXNzZXQgfSBmcm9tICdAY29jb3MvYXNzZXQtZGInO1xyXG5pbXBvcnQgeyBJQWJzdHJhY3RDb252ZXJ0ZXIgfSBmcm9tICcuL21vZGVsLWNvbnZlcnQtcm91dGluZSc7XHJcbmltcG9ydCBwcyBmcm9tICdwYXRoJztcclxuaW1wb3J0IGZzLCB7IHBhdGhFeGlzdHMgfSBmcm9tICdmcy1leHRyYSc7XHJcbmltcG9ydCBjcCBmcm9tICdjaGlsZF9wcm9jZXNzJztcclxuaW1wb3J0IHsgaTE4blRyYW5zbGF0ZSwgbGlua1RvQXNzZXRUYXJnZXQgfSBmcm9tICcuLi8uLi91dGlscyc7XHJcbmltcG9ydCB7IEkxOG5LZXlzIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vaTE4bi90eXBlcy9nZW5lcmF0ZWQnO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUZieENvbnZlcnRlcihvcHRpb25zOiB7XHJcbiAgICB1bml0Q29udmVyc2lvbj86ICdnZW9tZXRyeS1sZXZlbCcgfCAnaGllcmFyY2h5LWxldmVsJyB8ICdkaXNhYmxlZCc7XHJcbiAgICBhbmltYXRpb25CYWtlUmF0ZT86IG51bWJlcjtcclxuICAgIHByZWZlckxvY2FsVGltZVNwYW4/OiBib29sZWFuO1xyXG4gICAgc21hcnRNYXRlcmlhbEVuYWJsZWQ/OiBib29sZWFuO1xyXG4gICAgbWF0Y2hNZXNoTmFtZXM/OiBib29sZWFuO1xyXG59KTogSUFic3RyYWN0Q29udmVydGVyPHN0cmluZz4ge1xyXG4gICAgY29uc3Qgb3V0RmlsZU5hbWUgPSAnb3V0LmdsdGYnO1xyXG4gICAgbGV0IHsgdG9vbDogdG9vbFBhdGggfSA9IHJlcXVpcmUoJ0Bjb2Nvcy9mYngtZ2x0Zi1jb252Jyk7XHJcblxyXG4gICAgY29uc3QgdGVtcCA9IHRvb2xQYXRoLnJlcGxhY2UoJ2FwcC5hc2FyJywgJ2FwcC5hc2FyLnVucGFja2VkJyk7XHJcbiAgICBpZiAoZnMuZXhpc3RzU3luYyh0ZW1wKSkge1xyXG4gICAgICAgIHRvb2xQYXRoID0gdGVtcDtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIGdldCBvcHRpb25zKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gb3B0aW9ucztcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBnZXQoYXNzZXQ6IEFzc2V0LCBvdXRwdXREaXI6IHN0cmluZykge1xyXG4gICAgICAgICAgICByZXR1cm4gcHMuam9pbihvdXRwdXREaXIsIG91dEZpbGVOYW1lKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBhc3luYyBjb252ZXJ0KGFzc2V0OiBBc3NldCwgb3V0cHV0RGlyOiBzdHJpbmcpIHtcclxuICAgICAgICAgICAgY29uc3QgY2xpQXJnczogc3RyaW5nW10gPSBbXTtcclxuXHJcbiAgICAgICAgICAgIC8vIDxpbnB1dCBmaWxlPlxyXG4gICAgICAgICAgICBjbGlBcmdzLnB1c2gocXVvdFBhdGhBcmcoYXNzZXQuc291cmNlKSk7XHJcblxyXG4gICAgICAgICAgICAvLyAtLXVuaXQtY29udmVyc2lvblxyXG4gICAgICAgICAgICBjbGlBcmdzLnB1c2goJy0tdW5pdC1jb252ZXJzaW9uJywgb3B0aW9ucy51bml0Q29udmVyc2lvbiA/PyAnZ2VvbWV0cnktbGV2ZWwnKTtcclxuXHJcbiAgICAgICAgICAgIC8vIC0tYW5pbWF0aW9uLWJha2UtcmF0ZVxyXG4gICAgICAgICAgICBjbGlBcmdzLnB1c2goJy0tYW5pbWF0aW9uLWJha2UtcmF0ZScsIGAke29wdGlvbnMuYW5pbWF0aW9uQmFrZVJhdGUgPz8gMH1gKTtcclxuXHJcbiAgICAgICAgICAgIC8vIC0tcHJlZmVyLWxvY2FsLXRpbWUtc3BhblxyXG4gICAgICAgICAgICAvLyBOb3RlIGZvciBib29sZWFuIHBhcmFtZXRlcnMsIGAtLW8gZmFsc2VgIGRvZXMgbm90IHdvcmsuXHJcbiAgICAgICAgICAgIGNsaUFyZ3MucHVzaChgLS1wcmVmZXItbG9jYWwtdGltZS1zcGFuPSR7b3B0aW9ucy5wcmVmZXJMb2NhbFRpbWVTcGFuID8/IHRydWV9YCk7XHJcblxyXG4gICAgICAgICAgICBjbGlBcmdzLnB1c2goYC0tbWF0Y2gtbWVzaC1uYW1lcz0ke29wdGlvbnMubWF0Y2hNZXNoTmFtZXMgPz8gdHJ1ZX1gKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChvcHRpb25zLnNtYXJ0TWF0ZXJpYWxFbmFibGVkID8/IGZhbHNlKSB7XHJcbiAgICAgICAgICAgICAgICBjbGlBcmdzLnB1c2goJy0tZXhwb3J0LWZieC1maWxlLWhlYWRlci1pbmZvJyk7XHJcbiAgICAgICAgICAgICAgICBjbGlBcmdzLnB1c2goJy0tZXhwb3J0LXJhdy1tYXRlcmlhbHMnKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gLS1vdXRcclxuICAgICAgICAgICAgY29uc3Qgb3V0RmlsZSA9IHBzLmpvaW4ob3V0cHV0RGlyLCBvdXRGaWxlTmFtZSk7XHJcbiAgICAgICAgICAgIGF3YWl0IGZzLmVuc3VyZURpcihwcy5kaXJuYW1lKG91dEZpbGUpKTtcclxuICAgICAgICAgICAgY2xpQXJncy5wdXNoKCctLW91dCcsIHF1b3RQYXRoQXJnKG91dEZpbGUpKTtcclxuXHJcbiAgICAgICAgICAgIC8vIC0tZmJtLWRpclxyXG4gICAgICAgICAgICBjb25zdCBmYm1EaXIgPSBwcy5qb2luKG91dHB1dERpciwgJy5mYm0nKTtcclxuICAgICAgICAgICAgYXdhaXQgZnMuZW5zdXJlRGlyKGZibURpcik7XHJcbiAgICAgICAgICAgIGNsaUFyZ3MucHVzaCgnLS1mYm0tZGlyJywgcXVvdFBhdGhBcmcoZmJtRGlyKSk7XHJcblxyXG4gICAgICAgICAgICAvLyAtLWxvZy1maWxlXHJcbiAgICAgICAgICAgIGNvbnN0IGxvZ0ZpbGUgPSBnZXRMb2dGaWxlKG91dHB1dERpcik7XHJcbiAgICAgICAgICAgIGF3YWl0IGZzLmVuc3VyZURpcihwcy5kaXJuYW1lKGxvZ0ZpbGUpKTtcclxuICAgICAgICAgICAgY2xpQXJncy5wdXNoKCctLWxvZy1maWxlJywgcXVvdFBhdGhBcmcobG9nRmlsZSkpO1xyXG5cclxuICAgICAgICAgICAgbGV0IGNhbGxPayA9IGF3YWl0IGNhbGxGYnhHTFRGQ29udih0b29sUGF0aCwgY2xpQXJncywgb3V0cHV0RGlyKTtcclxuICAgICAgICAgICAgaWYgKGNhbGxPayAmJiAhKGF3YWl0IHBhdGhFeGlzdHMob3V0RmlsZSkpKSB7XHJcbiAgICAgICAgICAgICAgICBjYWxsT2sgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFRvb2wgRkJYLWdsVEYtY29udiBlbmRzIGFibm9ybWFsbHkoc3Bhd24gJHt0b29sUGF0aH0gJHtjbGlBcmdzLmpvaW4oJyAnKX0pLmApO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gY2FsbE9rO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGFzeW5jIHByaW50TG9ncyhhc3NldCwgb3V0cHV0RGlyKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGxvZ0ZpbGUgPSBnZXRMb2dGaWxlKG91dHB1dERpcik7XHJcblxyXG4gICAgICAgICAgICBpZiAoYXdhaXQgcGF0aEV4aXN0cyhsb2dGaWxlKSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGxvZ3M6IElGYnhHbFRmQ29udkxvZyB8IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbG9ncyA9IGF3YWl0IGZzLnJlYWRKc29uKGxvZ0ZpbGUpO1xyXG4gICAgICAgICAgICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5kZWJ1ZygnTm8gbG9ncyBhcmUgZ2VuZXJhdGVkLCBpdCBzaG91bGQgbm90IGhhcHBlbiBpbmRlZWQuJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShsb2dzKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIFdlIGFyZSBsYXp5IGhlcmUuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gSWYgYW55IGV4Y2VwdGlvbiBoYXBwZW4gZHVlIHRvIGxvZyBwcmludGluZy5cclxuICAgICAgICAgICAgICAgICAgICAvLyBXZSBzaW1wbHkgaWdub3JlLlxyXG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHByaW50Q29udmVydGVyTG9ncyhsb2dzLCBhc3NldCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgfTtcclxuXHJcbiAgICBmdW5jdGlvbiBxdW90UGF0aEFyZyhwOiBzdHJpbmcpIHtcclxuICAgICAgICByZXR1cm4gYFwiJHtwfVwiYDtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBjYWxsRmJ4R0xURkNvbnYodG9vbDogc3RyaW5nLCBhcmdzOiBzdHJpbmdbXSwgY3dkOiBzdHJpbmcpIHtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2U8Ym9vbGVhbj4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBjaGlsZCA9IGNwLnNwYXduKHF1b3RQYXRoQXJnKHRvb2wpLCBhcmdzLCB7XHJcbiAgICAgICAgICAgICAgICBjd2QsXHJcbiAgICAgICAgICAgICAgICBzaGVsbDogdHJ1ZSxcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBsZXQgb3V0cHV0ID0gJyc7XHJcbiAgICAgICAgICAgIGlmIChjaGlsZC5zdGRvdXQpIHtcclxuICAgICAgICAgICAgICAgIGNoaWxkLnN0ZG91dC5vbignZGF0YScsIChkYXRhKSA9PiAob3V0cHV0ICs9IGRhdGEpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBsZXQgZXJyT3V0cHV0ID0gJyc7XHJcbiAgICAgICAgICAgIGlmIChjaGlsZC5zdGRlcnIpIHtcclxuICAgICAgICAgICAgICAgIGNoaWxkLnN0ZGVyci5vbignZGF0YScsIChkYXRhKSA9PiAoZXJyT3V0cHV0ICs9IGRhdGEpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjaGlsZC5vbignZXJyb3InLCByZWplY3QpO1xyXG4gICAgICAgICAgICBjaGlsZC5vbignY2xvc2UnLCAoY29kZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKG91dHB1dCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKG91dHB1dCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoZXJyT3V0cHV0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnJPdXRwdXQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy8gbm9uLXplcm8gZXhpdCBjb2RlIGlzIGZhaWx1cmVcclxuICAgICAgICAgICAgICAgIGlmIChjb2RlID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh0cnVlKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvZGUgPT09IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gRGVmaW5lZCBieSBGQlgtZ2xURi1jb252OlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBFcnJvciBoYXBwZW5lZCwgdGhlIGNvbnZlcnQgcmVzdWx0IG1heSBub3QgY29tcGxldGUuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEJ1dCBlcnJvcnMgYXJlIGxvZ2dlZC5cclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGNvZGUgPT09IDMyMjEyMjU3ODEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihpMThuVHJhbnNsYXRlKCdpbXBvcnRlci5mYnguZmJ4X2dsdGZfY29udi5taXNzaW5nX2RsbCcpKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGNvZGUgPT09IDEyNiAmJiBwcm9jZXNzLnBsYXRmb3JtID09PSAnZGFyd2luJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGkxOG5UcmFuc2xhdGUoJ2ltcG9ydGVyLmZieC5mYnhfZ2x0Zl9jb252LmJhZF9jcHUnKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgRkJYLWdsVEYtY29udiBleGlzdGVkIHdpdGggdW5leHBlY3RlZCBub24temVybyBjb2RlICR7Y29kZX1gKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGdldExvZ0ZpbGUob3V0cHV0RGlyOiBzdHJpbmcpIHtcclxuICAgICAgICByZXR1cm4gcHMuam9pbihvdXRwdXREaXIsICdsb2cuanNvbicpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHByaW50Q29udmVydGVyTG9ncyhsb2dzOiBJRmJ4R2xUZkNvbnZMb2csIGFzc2V0OiBBc3NldCkge1xyXG4gICAgICAgIGNvbnN0IGdldExvZ2dlciA9IChsZXZlbDogbnVtYmVyKSA9PiB7XHJcbiAgICAgICAgICAgIGxldCBsb2dnZXI6ICh0ZXh0OiBzdHJpbmcpID0+IHZvaWQ7XHJcbiAgICAgICAgICAgIHN3aXRjaCAobGV2ZWwpIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgRmJ4R2xUZkNvbnZMb2dMZXZlbC52ZXJib3NlOlxyXG4gICAgICAgICAgICAgICAgICAgIGxvZ2dlciA9IGNvbnNvbGUuZGVidWc7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIEZieEdsVGZDb252TG9nTGV2ZWwuaW5mbzpcclxuICAgICAgICAgICAgICAgICAgICBsb2dnZXIgPSBjb25zb2xlLmxvZztcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgRmJ4R2xUZkNvbnZMb2dMZXZlbC53YXJuaW5nOlxyXG4gICAgICAgICAgICAgICAgICAgIGxvZ2dlciA9IGNvbnNvbGUud2FybjtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgRmJ4R2xUZkNvbnZMb2dMZXZlbC5lcnJvcjpcclxuICAgICAgICAgICAgICAgIGNhc2UgRmJ4R2xUZkNvbnZMb2dMZXZlbC5mYXRhbDpcclxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgbG9nZ2VyID0gY29uc29sZS5lcnJvcjtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gKHRleHQ6IHN0cmluZykgPT4ge1xyXG4gICAgICAgICAgICAgICAgbG9nZ2VyLmNhbGwoY29uc29sZSwgYWRkQXNzZXRNYXJrKHRleHQsIGFzc2V0KSk7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfTtcclxuICAgICAgICBjb25zdCBpbmhlcml0VHlwZU1lc3NhZ2VDb2RlID0gJ3Vuc3VwcG9ydGVkX2luaGVyaXRfdHlwZSc7XHJcbiAgICAgICAgY29uc3QgbWVyZ2VkSW5oZXJpdFR5cGVNZXNzYWdlczogUmVjb3JkPHN0cmluZywgc3RyaW5nW10+ID0ge307XHJcbiAgICAgICAgZm9yIChjb25zdCB7IGxldmVsLCBtZXNzYWdlIH0gb2YgbG9ncykge1xyXG4gICAgICAgICAgICBjb25zdCBsb2dnZXIgPSBnZXRMb2dnZXIobGV2ZWwpO1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIG1lc3NhZ2UgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgICAgICBsb2dnZXIobWVzc2FnZSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBjb2RlID0gbWVzc2FnZS5jb2RlO1xyXG4gICAgICAgICAgICAgICAgaWYgKGNvZGUgPT09IGluaGVyaXRUeXBlTWVzc2FnZUNvZGUpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCB0eXBlID0gbWVzc2FnZS50eXBlO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG5vZGUgPSBtZXNzYWdlLm5vZGU7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCEodHlwZSBpbiBtZXJnZWRJbmhlcml0VHlwZU1lc3NhZ2VzKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXJnZWRJbmhlcml0VHlwZU1lc3NhZ2VzW3R5cGVdID0gW107XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIG1lcmdlZEluaGVyaXRUeXBlTWVzc2FnZXNbdHlwZV0ucHVzaChub2RlKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGNvZGUgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbG9nZ2VyKGdldEkxOG5NZXNzYWdlKGNvZGUsIG1lc3NhZ2UpKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbG9nZ2VyKEpTT04uc3RyaW5naWZ5KG1lc3NhZ2UsIHVuZGVmaW5lZCwgMikpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZvciAoY29uc3QgW3R5cGUsIG5vZGVzXSBvZiBPYmplY3QuZW50cmllcyhtZXJnZWRJbmhlcml0VHlwZU1lc3NhZ2VzKSkge1xyXG4gICAgICAgICAgICBnZXRMb2dnZXIoRmJ4R2xUZkNvbnZMb2dMZXZlbC52ZXJib3NlKShcclxuICAgICAgICAgICAgICAgIGdldEkxOG5NZXNzYWdlKGluaGVyaXRUeXBlTWVzc2FnZUNvZGUsIHtcclxuICAgICAgICAgICAgICAgICAgICB0eXBlLFxyXG4gICAgICAgICAgICAgICAgICAgIG5vZGVzLFxyXG4gICAgICAgICAgICAgICAgfSksXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGdldEkxOG5NZXNzYWdlKGNvZGU6IHN0cmluZywgbWVzc2FnZT86IGFueSkge1xyXG4gICAgICAgIHJldHVybiBpMThuVHJhbnNsYXRlKGBpbXBvcnRlci5mYnguZmJ4R2xUZkNvbnYuJHtjb2RlfWAgYXMgSTE4bktleXMsIG1lc3NhZ2UpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGFkZEFzc2V0TWFyayh0ZXh0OiBzdHJpbmcsIGFzc2V0OiBBc3NldCkge1xyXG4gICAgICAgIHJldHVybiBgJHt0ZXh0fSBbJHtsaW5rVG9Bc3NldFRhcmdldChhc3NldC51dWlkKX1dYDtcclxuICAgIH1cclxufVxyXG5cclxudHlwZSBJRmJ4R2xUZkNvbnZMb2cgPSBBcnJheTx7XHJcbiAgICBsZXZlbDogbnVtYmVyO1xyXG4gICAgbWVzc2FnZTogc3RyaW5nIHwgKFJlY29yZDxzdHJpbmcsIHN0cmluZz4gJiB7IGNvZGU/OiBzdHJpbmcgfSk7XHJcbn0+O1xyXG5cclxuZW51bSBGYnhHbFRmQ29udkxvZ0xldmVsIHtcclxuICAgIHZlcmJvc2UsXHJcbiAgICBpbmZvLFxyXG4gICAgd2FybmluZyxcclxuICAgIGVycm9yLFxyXG4gICAgZmF0YWwsXHJcbn1cclxuIl19