"use strict";
/**
 * Copyright (c) 2014-present, Facebook, Inc.
 * All rights reserved.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convert = convert;
const child_process_1 = __importDefault(require("child_process"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const rimraf_1 = __importDefault(require("rimraf"));
const utils_1 = require("../../utils");
/**
 * Converts an FBX to a GTLF or GLB file.
 * @param string srcFile path to the source file.
 * @param string destFile path to the destination file.
 * This must end in `.glb` or `.gltf` (case matters).
 * @param string[] [opts] options to pass to the converter tool.
 * @return Promise<string> a promise that yields the full path to the converted
 * file, an error on conversion failure.
 */
function convert(srcFile, destFile, opts = []) {
    return new Promise((resolve, reject) => {
        try {
            const fbx2gltfRoot = path_1.default.dirname(require.resolve('@cocos/fbx2gltf'));
            const binExt = os_1.default.type() === 'Windows_NT' ? '.exe' : '';
            let tool = path_1.default.join(fbx2gltfRoot, 'bin', os_1.default.type(), 'FBX2glTF' + binExt);
            const temp = tool.replace('app.asar', 'app.asar.unpacked');
            if (fs_extra_1.default.existsSync(temp)) {
                tool = temp;
            }
            if (!fs_extra_1.default.existsSync(tool)) {
                throw new Error(`Unsupported OS: ${os_1.default.type()}`);
            }
            let destExt = '';
            if (destFile.endsWith('.glb')) {
                destExt = '.glb';
                opts.includes('--binary') || opts.push('--binary');
            }
            else if (destFile.endsWith('.gltf')) {
                destExt = '.gltf';
            }
            else {
                throw new Error(`Unsupported file extension: ${destFile}`);
            }
            if (destExt.length !== 0) {
                fs_extra_1.default.ensureDirSync(path_1.default.dirname(destFile));
            }
            const srcPath = fs_extra_1.default.realpathSync(srcFile);
            const srcDir = path_1.default.dirname(srcPath);
            const destPath = destFile;
            const srcName = path_1.default.basename(srcPath);
            const args = opts.slice(0);
            args.push('--input', srcName, '--output', destPath);
            const child = child_process_1.default.spawn(tool, args, {
                cwd: srcDir,
            });
            let output = '';
            if (child.stdout) {
                child.stdout.on('data', (data) => (output += data));
            }
            if (child.stderr) {
                child.stderr.on('data', (data) => (output += data));
            }
            child.on('error', reject);
            child.on('close', (code) => {
                // the FBX SDK may create an .fbm dir during conversion; delete!
                const fbmCruft = srcPath.replace(/.fbx$/i, '.fbm');
                // don't stick a fork in things if this fails, just log a warning
                const onError = (error) => error && console.warn(`Failed to delete ${fbmCruft}: ${error}`);
                try {
                    fs_extra_1.default.existsSync(fbmCruft) && (0, rimraf_1.default)(fbmCruft, {}, onError);
                }
                catch (error) {
                    onError(error);
                }
                // non-zero exit code is failure
                if (code !== 0) {
                    // If code is 3, the output may not be flushed.
                    // See https://docs.microsoft.com/en-us/previous-versions/k089yyh0(v%3Dvs.140)
                    reject(new Error((0, utils_1.i18nTranslate)('importer.fbx.fbx2gltf_exists_with_non_zero_code', {
                        code,
                        output: output.length ? output : '<none>',
                    })));
                }
                else {
                    resolve(destPath);
                }
            });
        }
        catch (error) {
            reject(error);
        }
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmJ4MmdsVGYuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY29yZS9hc3NldHMvYXNzZXQtaGFuZGxlci9hc3NldHMvdXRpbHMvZmJ4MmdsVGYudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7R0FHRzs7Ozs7QUFrQkgsMEJBaUZDO0FBakdELGtFQUF5QztBQUN6Qyx3REFBMEI7QUFDMUIsNENBQW9CO0FBQ3BCLGdEQUF3QjtBQUN4QixvREFBNEI7QUFDNUIsdUNBQTRDO0FBRTVDOzs7Ozs7OztHQVFHO0FBQ0gsU0FBZ0IsT0FBTyxDQUFDLE9BQWUsRUFBRSxRQUFnQixFQUFFLE9BQWlCLEVBQUU7SUFDMUUsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtRQUNuQyxJQUFJLENBQUM7WUFDRCxNQUFNLFlBQVksR0FBRyxjQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDO1lBRXRFLE1BQU0sTUFBTSxHQUFHLFlBQUUsQ0FBQyxJQUFJLEVBQUUsS0FBSyxZQUFZLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1lBQ3hELElBQUksSUFBSSxHQUFHLGNBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLEtBQUssRUFBRSxZQUFFLENBQUMsSUFBSSxFQUFFLEVBQUUsVUFBVSxHQUFHLE1BQU0sQ0FBQyxDQUFDO1lBRTFFLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLG1CQUFtQixDQUFDLENBQUM7WUFDM0QsSUFBSSxrQkFBRSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO2dCQUN0QixJQUFJLEdBQUcsSUFBSSxDQUFDO1lBQ2hCLENBQUM7WUFFRCxJQUFJLENBQUMsa0JBQUUsQ0FBQyxVQUFVLENBQUMsSUFBSSxD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O29CQUNiLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDbkIsQ0FBQztnQkFFRCxnQ0FBZ0M7Z0JBQ2hDLElBQUksSUFBSSxLQUFLLENBQUMsRUFBRSxDQUFDO29CQUNiLCtDQUErQztvQkFDL0MsOEVBQThFO29CQUM5RSxNQUFNLENBQ0YsSUFBSSxLQUFLLENBQ0wsSUFBQSxxQkFBYSxFQUFDLGlEQUFpRCxFQUFFO3dCQUM3RCxJQUFJO3dCQUNKLE1BQU0sRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLFFBQVE7cUJBQzVDLENBQUMsQ0FDTCxDQUNKLENBQUM7Z0JBQ04sQ0FBQztxQkFBTSxDQUFDO29CQUNKLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDdEIsQ0FBQztZQUNMLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQztRQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7WUFDYixNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDbEIsQ0FBQztJQUNMLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTQtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cclxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cclxuICovXHJcblxyXG5pbXBvcnQgY2hpbGRQcm9jZXNzIGZyb20gJ2NoaWxkX3Byb2Nlc3MnO1xyXG5pbXBvcnQgZnMgZnJvbSAnZnMtZXh0cmEnO1xyXG5pbXBvcnQgb3MgZnJvbSAnb3MnO1xyXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcclxuaW1wb3J0IHJpbXJhZiBmcm9tICdyaW1yYWYnO1xyXG5pbXBvcnQgeyBpMThuVHJhbnNsYXRlIH0gZnJvbSAnLi4vLi4vdXRpbHMnO1xyXG5cclxuLyoqXHJcbiAqIENvbnZlcnRzIGFuIEZCWCB0byBhIEdUTEYgb3IgR0xCIGZpbGUuXHJcbiAqIEBwYXJhbSBzdHJpbmcgc3JjRmlsZSBwYXRoIHRvIHRoZSBzb3VyY2UgZmlsZS5cclxuICogQHBhcmFtIHN0cmluZyBkZXN0RmlsZSBwYXRoIHRvIHRoZSBkZXN0aW5hdGlvbiBmaWxlLlxyXG4gKiBUaGlzIG11c3QgZW5kIGluIGAuZ2xiYCBvciBgLmdsdGZgIChjYXNlIG1hdHRlcnMpLlxyXG4gKiBAcGFyYW0gc3RyaW5nW10gW29wdHNdIG9wdGlvbnMgdG8gcGFzcyB0byB0aGUgY29udmVydGVyIHRvb2wuXHJcbiAqIEByZXR1cm4gUHJvbWlzZTxzdHJpbmc+IGEgcHJvbWlzZSB0aGF0IHlpZWxkcyB0aGUgZnVsbCBwYXRoIHRvIHRoZSBjb252ZXJ0ZWRcclxuICogZmlsZSwgYW4gZXJyb3Igb24gY29udmVyc2lvbiBmYWlsdXJlLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGNvbnZlcnQoc3JjRmlsZTogc3RyaW5nLCBkZXN0RmlsZTogc3RyaW5nLCBvcHRzOiBzdHJpbmdbXSA9IFtdKSB7XHJcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGZieDJnbHRmUm9vdCA9IHBhdGguZGlybmFtZShyZXF1aXJlLnJlc29sdmUoJ0Bjb2Nvcy9mYngyZ2x0ZicpKTtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IGJpbkV4dCA9IG9zLnR5cGUoKSA9PT0gJ1dpbmRvd3NfTlQnID8gJy5leGUnIDogJyc7XHJcbiAgICAgICAgICAgIGxldCB0b29sID0gcGF0aC5qb2luKGZieDJnbHRmUm9vdCwgJ2JpbicsIG9zLnR5cGUoKSwgJ0ZCWDJnbFRGJyArIGJpbkV4dCk7XHJcblxyXG4gICAgICAgICAgICBjb25zdCB0ZW1wID0gdG9vbC5yZXBsYWNlKCdhcHAuYXNhcicsICdhcHAuYXNhci51bnBhY2tlZCcpO1xyXG4gICAgICAgICAgICBpZiAoZnMuZXhpc3RzU3luYyh0ZW1wKSkge1xyXG4gICAgICAgICAgICAgICAgdG9vbCA9IHRlbXA7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICghZnMuZXhpc3RzU3luYyh0b29sKSkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbnN1cHBvcnRlZCBPUzogJHtvcy50eXBlKCl9YCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCBkZXN0RXh0ID0gJyc7XHJcbiAgICAgICAgICAgIGlmIChkZXN0RmlsZS5lbmRzV2l0aCgnLmdsYicpKSB7XHJcbiAgICAgICAgICAgICAgICBkZXN0RXh0ID0gJy5nbGInO1xyXG4gICAgICAgICAgICAgICAgb3B0cy5pbmNsdWRlcygnLS1iaW5hcnknKSB8fCBvcHRzLnB1c2goJy0tYmluYXJ5Jyk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZGVzdEZpbGUuZW5kc1dpdGgoJy5nbHRmJykpIHtcclxuICAgICAgICAgICAgICAgIGRlc3RFeHQgPSAnLmdsdGYnO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbnN1cHBvcnRlZCBmaWxlIGV4dGVuc2lvbjogJHtkZXN0RmlsZX1gKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoZGVzdEV4dC5sZW5ndGggIT09IDApIHtcclxuICAgICAgICAgICAgICAgIGZzLmVuc3VyZURpclN5bmMocGF0aC5kaXJuYW1lKGRlc3RGaWxlKSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNvbnN0IHNyY1BhdGggPSBmcy5yZWFscGF0aFN5bmMoc3JjRmlsZSk7XHJcbiAgICAgICAgICAgIGNvbnN0IHNyY0RpciA9IHBhdGguZGlybmFtZShzcmNQYXRoKTtcclxuICAgICAgICAgICAgY29uc3QgZGVzdFBhdGggPSBkZXN0RmlsZTtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IHNyY05hbWUgPSBwYXRoLmJhc2VuYW1lKHNyY1BhdGgpO1xyXG5cclxuICAgICAgICAgICAgY29uc3QgYXJncyA9IG9wdHMuc2xpY2UoMCk7XHJcbiAgICAgICAgICAgIGFyZ3MucHVzaCgnLS1pbnB1dCcsIHNyY05hbWUsICctLW91dHB1dCcsIGRlc3RQYXRoKTtcclxuICAgICAgICAgICAgY29uc3QgY2hpbGQgPSBjaGlsZFByb2Nlc3Muc3Bhd24odG9vbCwgYXJncywge1xyXG4gICAgICAgICAgICAgICAgY3dkOiBzcmNEaXIsXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgbGV0IG91dHB1dCA9ICcnO1xyXG4gICAgICAgICAgICBpZiAoY2hpbGQuc3Rkb3V0KSB7XHJcbiAgICAgICAgICAgICAgICBjaGlsZC5zdGRvdXQub24oJ2RhdGEnLCAoZGF0YSkgPT4gKG91dHB1dCArPSBkYXRhKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGNoaWxkLnN0ZGVycikge1xyXG4gICAgICAgICAgICAgICAgY2hpbGQuc3RkZXJyLm9uKCdkYXRhJywgKGRhdGEpID0+IChvdXRwdXQgKz0gZGF0YSkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNoaWxkLm9uKCdlcnJvcicsIHJlamVjdCk7XHJcbiAgICAgICAgICAgIGNoaWxkLm9uKCdjbG9zZScsIChjb2RlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvLyB0aGUgRkJYIFNESyBtYXkgY3JlYXRlIGFuIC5mYm0gZGlyIGR1cmluZyBjb252ZXJzaW9uOyBkZWxldGUhXHJcbiAgICAgICAgICAgICAgICBjb25zdCBmYm1DcnVmdCA9IHNyY1BhdGgucmVwbGFjZSgvLmZieCQvaSwgJy5mYm0nKTtcclxuICAgICAgICAgICAgICAgIC8vIGRvbid0IHN0aWNrIGEgZm9yayBpbiB0aGluZ3MgaWYgdGhpcyBmYWlscywganVzdCBsb2cgYSB3YXJuaW5nXHJcbiAgICAgICAgICAgICAgICBjb25zdCBvbkVycm9yID0gKGVycm9yOiBhbnkpID0+IGVycm9yICYmIGNvbnNvbGUud2FybihgRmFpbGVkIHRvIGRlbGV0ZSAke2ZibUNydWZ0fTogJHtlcnJvcn1gKTtcclxuICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZnMuZXhpc3RzU3luYyhmYm1DcnVmdCkgJiYgcmltcmFmKGZibUNydWZ0LCB7fSwgb25FcnJvcik7XHJcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgICAgIG9uRXJyb3IoZXJyb3IpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vIG5vbi16ZXJvIGV4aXQgY29kZSBpcyBmYWlsdXJlXHJcbiAgICAgICAgICAgICAgICBpZiAoY29kZSAhPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIElmIGNvZGUgaXMgMywgdGhlIG91dHB1dCBtYXkgbm90IGJlIGZsdXNoZWQuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gU2VlIGh0dHBzOi8vZG9jcy5taWNyb3NvZnQuY29tL2VuLXVzL3ByZXZpb3VzLXZlcnNpb25zL2swODl5eWgwKHYlM0R2cy4xNDApXHJcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXcgRXJyb3IoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpMThuVHJhbnNsYXRlKCdpbXBvcnRlci5mYnguZmJ4MmdsdGZfZXhpc3RzX3dpdGhfbm9uX3plcm9fY29kZScsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2RlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dDogb3V0cHV0Lmxlbmd0aCA/IG91dHB1dCA6ICc8bm9uZT4nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICksXHJcbiAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShkZXN0UGF0aCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgIHJlamVjdChlcnJvcik7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbn1cclxuIl19