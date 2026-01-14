"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateGlTf = validateGlTf;
const fs_1 = __importDefault(require("fs"));
const gltf_validator_1 = require("gltf-validator");
async function validateGlTf(gltfFilePath, assetPath) {
    const validationOptions = {
        uri: gltfFilePath,
        ignoredIssues: [],
        severityOverrides: {
            NON_RELATIVE_URI: 2 /* Severity.Information */,
            UNDECLARED_EXTENSION: 1 /* Severity.Warning */,
            ACCESSOR_TOTAL_OFFSET_ALIGNMENT: 2 /* Severity.Information */,
        },
    };
    const isGlb = gltfFilePath.endsWith('.glb');
    // For some gltf(fbx2glTf exported), the gltf-validator may emit `invalid JSON` error.
    // We should read the string by self.
    const report = await (isGlb
        ? (0, gltf_validator_1.validateBytes)(Uint8Array.from(fs_1.default.readFileSync(gltfFilePath)), validationOptions)
        : (0, gltf_validator_1.validateString)(fs_1.default.readFileSync(gltfFilePath).toString()));
    // Remove specified errors.
    const ignoredMessages = report.issues.messages.filter((message) => {
        if (message.code === 'VALUE_NOT_IN_RANGE' &&
            /\/accessors\/\d+\/count/.test(message.pointer) &&
            message.message === 'Value 0 is out of range.') {
            // Babylon exporter
            return true;
        }
        if (message.code === 'ROTATION_NON_UNIT' && /\/nodes\/\d+\/rotation/.test(message.pointer)) {
            // Babylon exporter
            return true;
        }
        return false;
    });
    for (const message of ignoredMessages) {
        switch (message.severity) {
            case 0 /* Severity.Error */:
                --report.issues.numErrors;
                break;
            case 1 /* Severity.Warning */:
                --report.issues.numInfos;
                break;
        }
        console.debug(`glTf-validator issue(from ${assetPath}) ${JSON.stringify(message)} is ignored.`);
        report.issues.messages.splice(report.issues.messages.indexOf(message), 1);
    }
    const strintfyMessages = (severity) => {
        return JSON.stringify(report.issues.messages.filter((message) => message.severity === severity), undefined, 2);
    };
    if (report.issues.numErrors !== 0) {
        console.debug(`File ${assetPath} contains errors, ` +
            'this may cause problem unexpectly, ' +
            'please fix them: ' +
            '\n' +
            `${strintfyMessages(0 /* Severity.Error */)}\n`);
        // throw new Error(`Bad glTf format ${assetPath}.`);
    }
    else if (report.issues.numWarnings !== 0) {
        console.debug(`File ${assetPath} contains warnings, ` +
            'the result may be not what you want, ' +
            'please fix them if possible: ' +
            '\n' +
            `${strintfyMessages(1 /* Severity.Warning */)}\n`);
    }
    else if (report.issues.numHints !== 0 || report.issues.numInfos !== 0) {
        console.debug(`Logs from ${assetPath}:` + '\n' + `${strintfyMessages(2 /* Severity.Information */)}\n`);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jb3JlL2Fzc2V0cy9hc3NldC1oYW5kbGVyL2Fzc2V0cy9nbHRmL3ZhbGlkYXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFHQSxvQ0F5RUM7QUE1RUQsNENBQW9CO0FBQ3BCLG1EQUE0RjtBQUVyRixLQUFLLFVBQVUsWUFBWSxDQUFDLFlBQW9CLEVBQUUsU0FBaUI7SUFDdEUsTUFBTSxpQkFBaUIsR0FBc0I7UUFDekMsR0FBRyxFQUFFLFlBQVk7UUFDakIsYUFBYSxFQUFFLEVBQUU7UUFDakIsaUJBQWlCLEVBQUU7WUFDZixnQkFBZ0IsOEJBQXNCO1lBQ3RDLG9CQUFvQiwwQkFBa0I7WUFDdEMsK0JBQStCLDhCQUFzQjtTQUN4RDtLQUNKLENBQUM7SUFDRixNQUFNLEtBQUssR0FBRyxZQUFZLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQzVDLHNGQUFzRjtJQUN0RixxQ0FBcUM7SUFDckMsTUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLEtBQUs7UUFDdkIsQ0FBQyxDQUFDLElBQUEsOEJBQWEsRUFBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFlBQUUsQ0FBQyxZQUFZLENBQUMsWUFBWSxDQUFDLENBQUMsRUFBRSxpQkFBaUIsQ0FBQztRQUNsRixDQUFDLENBQUMsSUFBQSwrQkFBYyxFQUFDLFlBQUUsQ0FBQyxZQUFZLENBQUMsWUFBWSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBRWhFLDJCQUEyQjtJQUMzQixNQUFNLGVBQWUsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRTtRQUM5RCxJQUNJLE9BQU8sQ0FBQyxJQUFJLEtBQUssb0JBQW9CO1lBQ3JDLHlCQUF5QixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDO1lBQy9DLE9BQU8sQ0FBQyxPQUFPLEtBQUssMEJBQTBCLEVBQ2hELENBQUM7WUFDQyxtQkFBbUI7WUFDbkIsT0FBTyxJQUFJLENBQUM7UUFDaEIsQ0FBQztRQUNELElBQUksT0FBTyxDQUFDLElBQUksS0FBSyxtQkFBbUIsSUFBSSx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7WUFDekYsbUJBQW1CO1lBQ25CLE9BQU8sSUFBSSxDQUFDO1FBQ2hCLENBQUM7UUFDRCxPQUFPLEtBQUssQ0FBQztJQUNqQixDQUFDLENBQUMsQ0FBQztJQUNILEtBQUssTUFBTSxPQUFPLElBQUksZUFBZSxFQUFFLENBQUM7UUFDcEMsUUFBUSxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDdkI7Z0JBQ0ksRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQztnQkFDMUIsTUFBTTtZQUNWO2dCQUNJLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUM7Z0JBQ3pCLE1BQU07UUFDZCxDQUFDO1FBQ0QsT0FBTyxDQUFDLEtBQUssQ0FBQyw2QkFBNkIsU0FBUyxLQUFLLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQ2hHLE1BQU0sQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDOUUsQ0FBQztJQUVELE1BQU0sZ0JBQWdCLEdBQUcsQ0FBQyxRQUFnQixFQUFFLEVBQUU7UUFDMUMsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUNqQixNQUFNLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEtBQUssUUFBUSxDQUFDLEVBQ3pFLFNBQVMsRUFDVCxDQUFDLENBQ0osQ0FBQztJQUNOLENBQUMsQ0FBQztJQUNGLElBQUksTUFBTSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEtBQUssQ0FBQyxFQUFFLENBQUM7UUFDaEMsT0FBTyxDQUFDLEtBQUssQ0FDVCxRQUFRLFNBQVMsb0JBQW9CO1lBQ2pDLHFDQUFxQztZQUNyQyxtQkFBbUI7WUFDbkIsSUFBSTtZQUNKLEdBQUcsZ0JBQWdCLHdCQUFnQixJQUFJLENBQzlDLENBQUM7UUFDRixvREFBb0Q7SUFDeEQsQ0FBQztTQUFNLElBQUksTUFBTSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEtBQUssQ0FBQyxFQUFFLENBQUM7UUFDekMsT0FBTyxDQUFDLEtBQUssQ0FDVCxRQUFRLFNBQVMsc0JBQXNCO1lBQ25DLHVDQUF1QztZQUN2QywrQkFBK0I7WUFDL0IsSUFBSTtZQUNKLEdBQUcsZ0JBQWdCLDBCQUFrQixJQUFJLENBQ2hELENBQUM7SUFDTixDQUFDO1NBQU0sSUFBSSxNQUFNLENBQUMsTUFBTSxDQUFDLFFBQVEsS0FBSyxDQUFDLElBQUksTUFBTSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEtBQUssQ0FBQyxFQUFFLENBQUM7UUFDdEUsT0FBTyxDQUFDLEtBQUssQ0FBQyxhQUFhLFNBQVMsR0FBRyxHQUFHLElBQUksR0FBRyxHQUFHLGdCQUFnQiw4QkFBc0IsSUFBSSxDQUFDLENBQUM7SUFDcEcsQ0FBQztBQUNMLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgZnMgZnJvbSAnZnMnO1xyXG5pbXBvcnQgeyBTZXZlcml0eSwgdmFsaWRhdGVCeXRlcywgdmFsaWRhdGVTdHJpbmcsIFZhbGlkYXRpb25PcHRpb25zIH0gZnJvbSAnZ2x0Zi12YWxpZGF0b3InO1xyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHZhbGlkYXRlR2xUZihnbHRmRmlsZVBhdGg6IHN0cmluZywgYXNzZXRQYXRoOiBzdHJpbmcpIHtcclxuICAgIGNvbnN0IHZhbGlkYXRpb25PcHRpb25zOiBWYWxpZGF0aW9uT3B0aW9ucyA9IHtcclxuICAgICAgICB1cmk6IGdsdGZGaWxlUGF0aCxcclxuICAgICAgICBpZ25vcmVkSXNzdWVzOiBbXSxcclxuICAgICAgICBzZXZlcml0eU92ZXJyaWRlczoge1xyXG4gICAgICAgICAgICBOT05fUkVMQVRJVkVfVVJJOiBTZXZlcml0eS5JbmZvcm1hdGlvbixcclxuICAgICAgICAgICAgVU5ERUNMQVJFRF9FWFRFTlNJT046IFNldmVyaXR5Lldhcm5pbmcsXHJcbiAgICAgICAgICAgIEFDQ0VTU09SX1RPVEFMX09GRlNFVF9BTElHTk1FTlQ6IFNldmVyaXR5LkluZm9ybWF0aW9uLFxyXG4gICAgICAgIH0sXHJcbiAgICB9O1xyXG4gICAgY29uc3QgaXNHbGIgPSBnbHRmRmlsZVBhdGguZW5kc1dpdGgoJy5nbGInKTtcclxuICAgIC8vIEZvciBzb21lIGdsdGYoZmJ4MmdsVGYgZXhwb3J0ZWQpLCB0aGUgZ2x0Zi12YWxpZGF0b3IgbWF5IGVtaXQgYGludmFsaWQgSlNPTmAgZXJyb3IuXHJcbiAgICAvLyBXZSBzaG91bGQgcmVhZCB0aGUgc3RyaW5nIGJ5IHNlbGYuXHJcbiAgICBjb25zdCByZXBvcnQgPSBhd2FpdCAoaXNHbGJcclxuICAgICAgICA/IHZhbGlkYXRlQnl0ZXMoVWludDhBcnJheS5mcm9tKGZzLnJlYWRGaWxlU3luYyhnbHRmRmlsZVBhdGgpKSwgdmFsaWRhdGlvbk9wdGlvbnMpXHJcbiAgICAgICAgOiB2YWxpZGF0ZVN0cmluZyhmcy5yZWFkRmlsZVN5bmMoZ2x0ZkZpbGVQYXRoKS50b1N0cmluZygpKSk7XHJcblxyXG4gICAgLy8gUmVtb3ZlIHNwZWNpZmllZCBlcnJvcnMuXHJcbiAgICBjb25zdCBpZ25vcmVkTWVzc2FnZXMgPSByZXBvcnQuaXNzdWVzLm1lc3NhZ2VzLmZpbHRlcigobWVzc2FnZSkgPT4ge1xyXG4gICAgICAgIGlmIChcclxuICAgICAgICAgICAgbWVzc2FnZS5jb2RlID09PSAnVkFMVUVfTk9UX0lOX1JBTkdFJyAmJlxyXG4gICAgICAgICAgICAvXFwvYWNjZXNzb3JzXFwvXFxkK1xcL2NvdW50Ly50ZXN0KG1lc3NhZ2UucG9pbnRlcikgJiZcclxuICAgICAgICAgICAgbWVzc2FnZS5tZXNzYWdlID09PSAnVmFsdWUgMCBpcyBvdXQgb2YgcmFuZ2UuJ1xyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgICAvLyBCYWJ5bG9uIGV4cG9ydGVyXHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAobWVzc2FnZS5jb2RlID09PSAnUk9UQVRJT05fTk9OX1VOSVQnICYmIC9cXC9ub2Rlc1xcL1xcZCtcXC9yb3RhdGlvbi8udGVzdChtZXNzYWdlLnBvaW50ZXIpKSB7XHJcbiAgICAgICAgICAgIC8vIEJhYnlsb24gZXhwb3J0ZXJcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH0pO1xyXG4gICAgZm9yIChjb25zdCBtZXNzYWdlIG9mIGlnbm9yZWRNZXNzYWdlcykge1xyXG4gICAgICAgIHN3aXRjaCAobWVzc2FnZS5zZXZlcml0eSkge1xyXG4gICAgICAgICAgICBjYXNlIFNldmVyaXR5LkVycm9yOlxyXG4gICAgICAgICAgICAgICAgLS1yZXBvcnQuaXNzdWVzLm51bUVycm9ycztcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIFNldmVyaXR5Lldhcm5pbmc6XHJcbiAgICAgICAgICAgICAgICAtLXJlcG9ydC5pc3N1ZXMubnVtSW5mb3M7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc29sZS5kZWJ1ZyhgZ2xUZi12YWxpZGF0b3IgaXNzdWUoZnJvbSAke2Fzc2V0UGF0aH0pICR7SlNPTi5zdHJpbmdpZnkobWVzc2FnZSl9IGlzIGlnbm9yZWQuYCk7XHJcbiAgICAgICAgcmVwb3J0Lmlzc3Vlcy5tZXNzYWdlcy5zcGxpY2UocmVwb3J0Lmlzc3Vlcy5tZXNzYWdlcy5pbmRleE9mKG1lc3NhZ2UpLCAxKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBzdHJpbnRmeU1lc3NhZ2VzID0gKHNldmVyaXR5OiBudW1iZXIpID0+IHtcclxuICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoXHJcbiAgICAgICAgICAgIHJlcG9ydC5pc3N1ZXMubWVzc2FnZXMuZmlsdGVyKChtZXNzYWdlKSA9PiBtZXNzYWdlLnNldmVyaXR5ID09PSBzZXZlcml0eSksXHJcbiAgICAgICAgICAgIHVuZGVmaW5lZCxcclxuICAgICAgICAgICAgMixcclxuICAgICAgICApO1xyXG4gICAgfTtcclxuICAgIGlmIChyZXBvcnQuaXNzdWVzLm51bUVycm9ycyAhPT0gMCkge1xyXG4gICAgICAgIGNvbnNvbGUuZGVidWcoXHJcbiAgICAgICAgICAgIGBGaWxlICR7YXNzZXRQYXRofSBjb250YWlucyBlcnJvcnMsIGAgK1xyXG4gICAgICAgICAgICAgICAgJ3RoaXMgbWF5IGNhdXNlIHByb2JsZW0gdW5leHBlY3RseSwgJyArXHJcbiAgICAgICAgICAgICAgICAncGxlYXNlIGZpeCB0aGVtOiAnICtcclxuICAgICAgICAgICAgICAgICdcXG4nICtcclxuICAgICAgICAgICAgICAgIGAke3N0cmludGZ5TWVzc2FnZXMoU2V2ZXJpdHkuRXJyb3IpfVxcbmAsXHJcbiAgICAgICAgKTtcclxuICAgICAgICAvLyB0aHJvdyBuZXcgRXJyb3IoYEJhZCBnbFRmIGZvcm1hdCAke2Fzc2V0UGF0aH0uYCk7XHJcbiAgICB9IGVsc2UgaWYgKHJlcG9ydC5pc3N1ZXMubnVtV2FybmluZ3MgIT09IDApIHtcclxuICAgICAgICBjb25zb2xlLmRlYnVnKFxyXG4gICAgICAgICAgICBgRmlsZSAke2Fzc2V0UGF0aH0gY29udGFpbnMgd2FybmluZ3MsIGAgK1xyXG4gICAgICAgICAgICAgICAgJ3RoZSByZXN1bHQgbWF5IGJlIG5vdCB3aGF0IHlvdSB3YW50LCAnICtcclxuICAgICAgICAgICAgICAgICdwbGVhc2UgZml4IHRoZW0gaWYgcG9zc2libGU6ICcgK1xyXG4gICAgICAgICAgICAgICAgJ1xcbicgK1xyXG4gICAgICAgICAgICAgICAgYCR7c3RyaW50ZnlNZXNzYWdlcyhTZXZlcml0eS5XYXJuaW5nKX1cXG5gLFxyXG4gICAgICAgICk7XHJcbiAgICB9IGVsc2UgaWYgKHJlcG9ydC5pc3N1ZXMubnVtSGludHMgIT09IDAgfHwgcmVwb3J0Lmlzc3Vlcy5udW1JbmZvcyAhPT0gMCkge1xyXG4gICAgICAgIGNvbnNvbGUuZGVidWcoYExvZ3MgZnJvbSAke2Fzc2V0UGF0aH06YCArICdcXG4nICsgYCR7c3RyaW50ZnlNZXNzYWdlcyhTZXZlcml0eS5JbmZvcm1hdGlvbil9XFxuYCk7XHJcbiAgICB9XHJcbn1cclxuIl19