"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.safeOutputJSON = safeOutputJSON;
const fs_extra_1 = require("fs-extra");
/**
 * Safely writes data to a JSON file with comprehensive error handling and logging
 *
 * @param {string} file - The target file path for JSON output
 * @param {any} data - The data to be serialized as JSON
 * @param {WriteOptions} [options={ spaces: 4 }] - Formatting options for JSON output
 * @returns {Promise<boolean>} - Returns true if write succeeded, false if failed
 *
 * @example
 * // Basic usage
 * const success = await safeOutputJSON('config.json', { theme: 'dark' });
 *
 * @example
 * // With custom options
 * await safeOutputJSON('data.json', dataset, { spaces: 2 });
 */
async function safeOutputJSON(file, data, options = { spaces: 4 }) {
    try {
        await (0, fs_extra_1.outputJSON)(file, data, { spaces: 4 });
        return true;
    }
    catch (error) {
        console.error(`Failed to write JSON file: ${file}, data: ${data}, options: ${options} `, error);
        return false;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29yZS9wcm9qZWN0L3V0aWxzL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBa0JBLHdDQVFDO0FBMUJELHVDQUFvRDtBQUVwRDs7Ozs7Ozs7Ozs7Ozs7O0dBZUc7QUFDSSxLQUFLLFVBQVUsY0FBYyxDQUFDLElBQVksRUFBRSxJQUFTLEVBQUUsVUFBd0IsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFO0lBQy9GLElBQUksQ0FBQztRQUNELE1BQU0sSUFBQSxxQkFBVSxFQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUM1QyxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztRQUNiLE9BQU8sQ0FBQyxLQUFLLENBQUMsOEJBQThCLElBQUksV0FBVyxJQUFJLGNBQWMsT0FBTyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDaEcsT0FBTyxLQUFLLENBQUM7SUFDakIsQ0FBQztBQUNMLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBXcml0ZU9wdGlvbnMsIG91dHB1dEpTT04gfSBmcm9tICdmcy1leHRyYSc7XHJcblxyXG4vKipcclxuICogU2FmZWx5IHdyaXRlcyBkYXRhIHRvIGEgSlNPTiBmaWxlIHdpdGggY29tcHJlaGVuc2l2ZSBlcnJvciBoYW5kbGluZyBhbmQgbG9nZ2luZ1xyXG4gKlxyXG4gKiBAcGFyYW0ge3N0cmluZ30gZmlsZSAtIFRoZSB0YXJnZXQgZmlsZSBwYXRoIGZvciBKU09OIG91dHB1dFxyXG4gKiBAcGFyYW0ge2FueX0gZGF0YSAtIFRoZSBkYXRhIHRvIGJlIHNlcmlhbGl6ZWQgYXMgSlNPTlxyXG4gKiBAcGFyYW0ge1dyaXRlT3B0aW9uc30gW29wdGlvbnM9eyBzcGFjZXM6IDQgfV0gLSBGb3JtYXR0aW5nIG9wdGlvbnMgZm9yIEpTT04gb3V0cHV0XHJcbiAqIEByZXR1cm5zIHtQcm9taXNlPGJvb2xlYW4+fSAtIFJldHVybnMgdHJ1ZSBpZiB3cml0ZSBzdWNjZWVkZWQsIGZhbHNlIGlmIGZhaWxlZFxyXG4gKlxyXG4gKiBAZXhhbXBsZVxyXG4gKiAvLyBCYXNpYyB1c2FnZVxyXG4gKiBjb25zdCBzdWNjZXNzID0gYXdhaXQgc2FmZU91dHB1dEpTT04oJ2NvbmZpZy5qc29uJywgeyB0aGVtZTogJ2RhcmsnIH0pO1xyXG4gKlxyXG4gKiBAZXhhbXBsZVxyXG4gKiAvLyBXaXRoIGN1c3RvbSBvcHRpb25zXHJcbiAqIGF3YWl0IHNhZmVPdXRwdXRKU09OKCdkYXRhLmpzb24nLCBkYXRhc2V0LCB7IHNwYWNlczogMiB9KTtcclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzYWZlT3V0cHV0SlNPTihmaWxlOiBzdHJpbmcsIGRhdGE6IGFueSwgb3B0aW9uczogV3JpdGVPcHRpb25zID0geyBzcGFjZXM6IDQgfSk6IFByb21pc2U8Ym9vbGVhbj4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgICBhd2FpdCBvdXRwdXRKU09OKGZpbGUsIGRhdGEsIHsgc3BhY2VzOiA0IH0pO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKGBGYWlsZWQgdG8gd3JpdGUgSlNPTiBmaWxlOiAke2ZpbGV9LCBkYXRhOiAke2RhdGF9LCBvcHRpb25zOiAke29wdGlvbnN9IGAsIGVycm9yKTtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbn1cclxuIl19