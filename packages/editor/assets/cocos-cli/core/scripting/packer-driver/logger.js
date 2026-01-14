"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PackerDriverLogger = void 0;
const winston_1 = __importDefault(require("winston"));
const packerDriverLogTag = '::PackerDriver::';
const packerDriverLogTagRegex = new RegExp(packerDriverLogTag);
const packerDriverLogTagHidden = `{hidden(${packerDriverLogTag})}`;
class PackerDriverLogger {
    constructor(debugLogFile) {
        const fileLogger = winston_1.default.createLogger({
            transports: [
                new winston_1.default.transports.File({
                    level: 'debug',
                    filename: debugLogFile,
                    format: winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'HH:mm:ss.SSS' }), winston_1.default.format.printf(({ level, message, timestamp }) => {
                        return `${timestamp} ${level}: ${message}`;
                    })),
                }),
            ],
        });
        this._fileLogger = fileLogger;
    }
    debug(message) {
        this._fileLogger.debug(message);
    }
    info(message) {
        this._fileLogger.info(message);
        console.info(packerDriverLogTagHidden, message);
        return this;
    }
    warn(message) {
        this._fileLogger.warn(message);
        console.warn(packerDriverLogTagHidden, message);
        return this;
    }
    error(message) {
        this._fileLogger.error(message);
        console.error(packerDriverLogTagHidden, message);
        return this;
    }
    clear() {
        console.debug('Clear logs...');
    }
    _fileLogger;
}
exports.PackerDriverLogger = PackerDriverLogger;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvcmUvc2NyaXB0aW5nL3BhY2tlci1kcml2ZXIvbG9nZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLHNEQUE4QjtBQUc5QixNQUFNLGtCQUFrQixHQUFHLGtCQUFrQixDQUFDO0FBQzlDLE1BQU0sdUJBQXVCLEdBQUcsSUFBSSxNQUFNLENBQUMsa0JBQWtCLENBQUMsQ0FBQztBQUMvRCxNQUFNLHdCQUF3QixHQUFHLFdBQVcsa0JBQWtCLElBQUksQ0FBQztBQUVuRSxNQUFhLGtCQUFrQjtJQUMzQixZQUFZLFlBQW9CO1FBQzVCLE1BQU0sVUFBVSxHQUFHLGlCQUFPLENBQUMsWUFBWSxDQUFDO1lBQ3BDLFVBQVUsRUFBRTtnQkFDUixJQUFJLGlCQUFPLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQztvQkFDeEIsS0FBSyxFQUFFLE9BQU87b0JBQ2QsUUFBUSxFQUFFLFlBQVk7b0JBQ3RCLE1BQU0sRUFBRSxpQkFBTyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQzFCLGlCQUFPLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxFQUFFLE1BQU0sRUFBRSxjQUFjLEVBQUUsQ0FBQyxFQUNwRCxpQkFBTyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLEVBQUUsRUFBRTt3QkFDcEQsT0FBTyxHQUFHLFNBQVMsSUFBSSxLQUFLLEtBQUssT0FBTyxFQUFFLENBQUM7b0JBQy9DLENBQUMsQ0FBQyxDQUNMO2lCQUNKLENBQUM7YUFDTDtTQUNKLENBQUMsQ0FBQztRQUNILElBQUksQ0FBQyxXQUFXLEdBQUcsVUFBVSxDQUFDO0lBQ2xDLENBQUM7SUFFRCxLQUFLLENBQUMsT0FBZTtRQUNqQixJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNwQyxDQUFDO0lBRUQsSUFBSSxDQUFDLE9BQWU7UUFDaEIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDL0IsT0FBTyxDQUFDLElBQUksQ0FBQyx3QkFBd0IsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNoRCxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRUQsSUFBSSxDQUFDLE9BQWU7UUFDaEIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDL0IsT0FBTyxDQUFDLElBQUksQ0FBQyx3QkFBd0IsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNoRCxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRUQsS0FBSyxDQUFDLE9BQWU7UUFDakIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDaEMsT0FBTyxDQUFDLEtBQUssQ0FBQyx3QkFBd0IsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNqRCxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRUQsS0FBSztRQUNELE9BQU8sQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLENBQUM7SUFDbkMsQ0FBQztJQUVPLFdBQVcsQ0FBaUI7Q0FDdkM7QUE5Q0QsZ0RBOENDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHdpbnN0b24gZnJvbSAnd2luc3Rvbic7XHJcbmltcG9ydCB7IExvZ2dlciB9IGZyb20gJ0Bjb2Nvcy9jcmVhdG9yLXByb2dyYW1taW5nLWNvbW1vbi9saWIvbG9nZ2VyJztcclxuXHJcbmNvbnN0IHBhY2tlckRyaXZlckxvZ1RhZyA9ICc6OlBhY2tlckRyaXZlcjo6JztcclxuY29uc3QgcGFja2VyRHJpdmVyTG9nVGFnUmVnZXggPSBuZXcgUmVnRXhwKHBhY2tlckRyaXZlckxvZ1RhZyk7XHJcbmNvbnN0IHBhY2tlckRyaXZlckxvZ1RhZ0hpZGRlbiA9IGB7aGlkZGVuKCR7cGFja2VyRHJpdmVyTG9nVGFnfSl9YDtcclxuXHJcbmV4cG9ydCBjbGFzcyBQYWNrZXJEcml2ZXJMb2dnZXIgaW1wbGVtZW50cyBMb2dnZXIge1xyXG4gICAgY29uc3RydWN0b3IoZGVidWdMb2dGaWxlOiBzdHJpbmcpIHtcclxuICAgICAgICBjb25zdCBmaWxlTG9nZ2VyID0gd2luc3Rvbi5jcmVhdGVMb2dnZXIoe1xyXG4gICAgICAgICAgICB0cmFuc3BvcnRzOiBbXHJcbiAgICAgICAgICAgICAgICBuZXcgd2luc3Rvbi50cmFuc3BvcnRzLkZpbGUoe1xyXG4gICAgICAgICAgICAgICAgICAgIGxldmVsOiAnZGVidWcnLFxyXG4gICAgICAgICAgICAgICAgICAgIGZpbGVuYW1lOiBkZWJ1Z0xvZ0ZpbGUsXHJcbiAgICAgICAgICAgICAgICAgICAgZm9ybWF0OiB3aW5zdG9uLmZvcm1hdC5jb21iaW5lKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB3aW5zdG9uLmZvcm1hdC50aW1lc3RhbXAoeyBmb3JtYXQ6ICdISDptbTpzcy5TU1MnIH0pLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB3aW5zdG9uLmZvcm1hdC5wcmludGYoKHsgbGV2ZWwsIG1lc3NhZ2UsIHRpbWVzdGFtcCB9KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYCR7dGltZXN0YW1wfSAke2xldmVsfTogJHttZXNzYWdlfWA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgKSxcclxuICAgICAgICAgICAgICAgIH0pLFxyXG4gICAgICAgICAgICBdLFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuX2ZpbGVMb2dnZXIgPSBmaWxlTG9nZ2VyO1xyXG4gICAgfVxyXG5cclxuICAgIGRlYnVnKG1lc3NhZ2U6IHN0cmluZykge1xyXG4gICAgICAgIHRoaXMuX2ZpbGVMb2dnZXIuZGVidWcobWVzc2FnZSk7XHJcbiAgICB9XHJcblxyXG4gICAgaW5mbyhtZXNzYWdlOiBzdHJpbmcpIHtcclxuICAgICAgICB0aGlzLl9maWxlTG9nZ2VyLmluZm8obWVzc2FnZSk7XHJcbiAgICAgICAgY29uc29sZS5pbmZvKHBhY2tlckRyaXZlckxvZ1RhZ0hpZGRlbiwgbWVzc2FnZSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgd2FybihtZXNzYWdlOiBzdHJpbmcpIHtcclxuICAgICAgICB0aGlzLl9maWxlTG9nZ2VyLndhcm4obWVzc2FnZSk7XHJcbiAgICAgICAgY29uc29sZS53YXJuKHBhY2tlckRyaXZlckxvZ1RhZ0hpZGRlbiwgbWVzc2FnZSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgZXJyb3IobWVzc2FnZTogc3RyaW5nKSB7XHJcbiAgICAgICAgdGhpcy5fZmlsZUxvZ2dlci5lcnJvcihtZXNzYWdlKTtcclxuICAgICAgICBjb25zb2xlLmVycm9yKHBhY2tlckRyaXZlckxvZ1RhZ0hpZGRlbiwgbWVzc2FnZSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgY2xlYXIoKSB7XHJcbiAgICAgICAgY29uc29sZS5kZWJ1ZygnQ2xlYXIgbG9ncy4uLicpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2ZpbGVMb2dnZXI6IHdpbnN0b24uTG9nZ2VyO1xyXG59XHJcbiJdfQ==