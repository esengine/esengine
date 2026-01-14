"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.serialize = serialize;
exports.serializeCompiled = serializeCompiled;
const builder_1 = require("./compiled/builder");
const pack_jsons_1 = __importDefault(require("./compiled/pack-jsons"));
const parser_1 = __importDefault(require("./parser"));
const dynamic_builder_1 = require("./dynamic-builder");
function serialize(obj, options) {
    // console.time('Serialize in dynamic format');
    options = Object.assign({
        builder: 'dynamic',
    }, options);
    const res = (0, parser_1.default)(obj, options);
    // console.timeEnd('Serialize in dynamic format');
    // if (!options.forceInline) {
    //     // console.time('Serialize by legacy module');
    //     const expectedRes = serializeLegacy(obj, options);
    //     // console.timeEnd('Serialize by legacy module');
    //     if (typeof res === 'string') {
    //         if (res !== expectedRes) {
    //             console.warn('Different serialize result, new:');
    //             console.log(res);
    //             console.warn('Old:');
    //             console.log(expectedRes);
    //             return expectedRes;
    //         }
    //     }
    // }
    return res;
}
serialize.asAsset = dynamic_builder_1.asAsset;
serialize.setName = dynamic_builder_1.setName;
serialize.findRootObject = dynamic_builder_1.findRootObject;
function serializeCompiled(obj, options) {
    options = Object.assign({
        builder: 'compiled',
        dontStripDefault: false,
    }, options);
    return (0, parser_1.default)(obj, options);
}
serializeCompiled.getRootData = builder_1.getRootData;
serializeCompiled.packJSONs = pack_jsons_1.default;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY29yZS9lbmdpbmUvZWRpdG9yLWV4dGVuZHMvdXRpbHMvc2VyaWFsaXplL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBS0EsOEJBd0JDO0FBTUQsOENBTUM7QUF6Q0QsZ0RBQWlEO0FBQ2pELHVFQUE4QztBQUM5QyxzREFBNEQ7QUFDNUQsdURBQXFFO0FBRXJFLFNBQWdCLFNBQVMsQ0FBQyxHQUFtQyxFQUFFLE9BQWtCO0lBQzdFLCtDQUErQztJQUMvQyxPQUFPLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQztRQUNwQixPQUFPLEVBQUUsU0FBUztLQUNyQixFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ1osTUFBTSxHQUFHLEdBQUcsSUFBQSxnQkFBVyxFQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUN0QyxrREFBa0Q7SUFFbEQsOEJBQThCO0lBQzlCLHFEQUFxRDtJQUNyRCx5REFBeUQ7SUFDekQsd0RBQXdEO0lBQ3hELHFDQUFxQztJQUNyQyxxQ0FBcUM7SUFDckMsZ0VBQWdFO0lBQ2hFLGdDQUFnQztJQUNoQyxvQ0FBb0M7SUFDcEMsd0NBQXdDO0lBQ3hDLGtDQUFrQztJQUNsQyxZQUFZO0lBQ1osUUFBUTtJQUNSLElBQUk7SUFFSixPQUFPLEdBQUcsQ0FBQztBQUNmLENBQUM7QUFFRCxTQUFTLENBQUMsT0FBTyxHQUFHLHlCQUFPLENBQUM7QUFDNUIsU0FBUyxDQUFDLE9BQU8sR0FBRyx5QkFBTyxDQUFDO0FBQzVCLFNBQVMsQ0FBQyxjQUFjLEdBQUcsZ0NBQWMsQ0FBQztBQUUxQyxTQUFnQixpQkFBaUIsQ0FBQyxHQUFtQyxFQUFFLE9BQWlCO0lBQ3BGLE9BQU8sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDO1FBQ3BCLE9BQU8sRUFBRSxVQUFVO1FBQ25CLGdCQUFnQixFQUFFLEtBQUs7S0FDMUIsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUNaLE9BQU8sSUFBQSxnQkFBVyxFQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQztBQUNyQyxDQUFDO0FBRUQsaUJBQWlCLENBQUMsV0FBVyxHQUFHLHFCQUFXLENBQUM7QUFDNUMsaUJBQWlCLENBQUMsU0FBUyxHQUFHLG9CQUFTLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBnZXRSb290RGF0YSB9IGZyb20gJy4vY29tcGlsZWQvYnVpbGRlcic7XHJcbmltcG9ydCBwYWNrSlNPTnMgZnJvbSAnLi9jb21waWxlZC9wYWNrLWpzb25zJztcclxuaW1wb3J0IHsgZGVmYXVsdCBhcyBkb1NlcmlhbGl6ZSwgSU9wdGlvbnMgfSBmcm9tICcuL3BhcnNlcic7XHJcbmltcG9ydCB7IGFzQXNzZXQsIHNldE5hbWUsIGZpbmRSb290T2JqZWN0IH0gZnJvbSAnLi9keW5hbWljLWJ1aWxkZXInO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHNlcmlhbGl6ZShvYmo6IEV4Y2x1ZGU8YW55LCBudWxsIHwgdW5kZWZpbmVkPiwgb3B0aW9ucz86IElPcHRpb25zKTogc3RyaW5nIHwgb2JqZWN0IHtcclxuICAgIC8vIGNvbnNvbGUudGltZSgnU2VyaWFsaXplIGluIGR5bmFtaWMgZm9ybWF0Jyk7XHJcbiAgICBvcHRpb25zID0gT2JqZWN0LmFzc2lnbih7XHJcbiAgICAgICAgYnVpbGRlcjogJ2R5bmFtaWMnLFxyXG4gICAgfSwgb3B0aW9ucyk7XHJcbiAgICBjb25zdCByZXMgPSBkb1NlcmlhbGl6ZShvYmosIG9wdGlvbnMpO1xyXG4gICAgLy8gY29uc29sZS50aW1lRW5kKCdTZXJpYWxpemUgaW4gZHluYW1pYyBmb3JtYXQnKTtcclxuXHJcbiAgICAvLyBpZiAoIW9wdGlvbnMuZm9yY2VJbmxpbmUpIHtcclxuICAgIC8vICAgICAvLyBjb25zb2xlLnRpbWUoJ1NlcmlhbGl6ZSBieSBsZWdhY3kgbW9kdWxlJyk7XHJcbiAgICAvLyAgICAgY29uc3QgZXhwZWN0ZWRSZXMgPSBzZXJpYWxpemVMZWdhY3kob2JqLCBvcHRpb25zKTtcclxuICAgIC8vICAgICAvLyBjb25zb2xlLnRpbWVFbmQoJ1NlcmlhbGl6ZSBieSBsZWdhY3kgbW9kdWxlJyk7XHJcbiAgICAvLyAgICAgaWYgKHR5cGVvZiByZXMgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAvLyAgICAgICAgIGlmIChyZXMgIT09IGV4cGVjdGVkUmVzKSB7XHJcbiAgICAvLyAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ0RpZmZlcmVudCBzZXJpYWxpemUgcmVzdWx0LCBuZXc6Jyk7XHJcbiAgICAvLyAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXMpO1xyXG4gICAgLy8gICAgICAgICAgICAgY29uc29sZS53YXJuKCdPbGQ6Jyk7XHJcbiAgICAvLyAgICAgICAgICAgICBjb25zb2xlLmxvZyhleHBlY3RlZFJlcyk7XHJcbiAgICAvLyAgICAgICAgICAgICByZXR1cm4gZXhwZWN0ZWRSZXM7XHJcbiAgICAvLyAgICAgICAgIH1cclxuICAgIC8vICAgICB9XHJcbiAgICAvLyB9XHJcblxyXG4gICAgcmV0dXJuIHJlcztcclxufVxyXG5cclxuc2VyaWFsaXplLmFzQXNzZXQgPSBhc0Fzc2V0O1xyXG5zZXJpYWxpemUuc2V0TmFtZSA9IHNldE5hbWU7XHJcbnNlcmlhbGl6ZS5maW5kUm9vdE9iamVjdCA9IGZpbmRSb290T2JqZWN0O1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHNlcmlhbGl6ZUNvbXBpbGVkKG9iajogRXhjbHVkZTxhbnksIG51bGwgfCB1bmRlZmluZWQ+LCBvcHRpb25zOiBJT3B0aW9ucyk6IHN0cmluZyB8IG9iamVjdCB7XHJcbiAgICBvcHRpb25zID0gT2JqZWN0LmFzc2lnbih7XHJcbiAgICAgICAgYnVpbGRlcjogJ2NvbXBpbGVkJyxcclxuICAgICAgICBkb250U3RyaXBEZWZhdWx0OiBmYWxzZSxcclxuICAgIH0sIG9wdGlvbnMpO1xyXG4gICAgcmV0dXJuIGRvU2VyaWFsaXplKG9iaiwgb3B0aW9ucyk7XHJcbn1cclxuXHJcbnNlcmlhbGl6ZUNvbXBpbGVkLmdldFJvb3REYXRhID0gZ2V0Um9vdERhdGE7XHJcbnNlcmlhbGl6ZUNvbXBpbGVkLnBhY2tKU09OcyA9IHBhY2tKU09OcztcclxuIl19