"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.componentDump = void 0;
const index_1 = __importDefault(require("../../component/index"));
// valueType直接使用引擎序列化
class ComponentDump {
    encode(object, data, opts) {
        data.value = {
            uuid: object ? object.uuid || '' : '',
        };
    }
    decode(data, info, dump, opts) {
        data[info.key] = index_1.default.query(dump.value.uuid);
    }
}
exports.componentDump = new ComponentDump();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcG9uZW50LWR1bXAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvY29yZS9zY2VuZS9zY2VuZS1wcm9jZXNzL3NlcnZpY2UvZHVtcC90eXBlcy9jb21wb25lbnQtZHVtcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFLQSxrRUFBcUQ7QUFFckQscUJBQXFCO0FBQ3JCLE1BQU0sYUFBYTtJQUNSLE1BQU0sQ0FBQyxNQUFXLEVBQUUsSUFBZSxFQUFFLElBQVU7UUFDbEQsSUFBSSxDQUFDLEtBQUssR0FBRztZQUNULElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFO1NBQ3hDLENBQUM7SUFDTixDQUFDO0lBRU0sTUFBTSxDQUFDLElBQVMsRUFBRSxJQUFTLEVBQUUsSUFBUyxFQUFFLElBQVU7UUFDckQsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxlQUFnQixDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzdELENBQUM7Q0FDSjtBQUVZLFFBQUEsYUFBYSxHQUFHLElBQUksYUFBYSxFQUFFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xyXG4gICAgSVByb3BlcnR5LFxyXG59IGZyb20gJy4uLy4uLy4uLy4uL0B0eXBlcy9wdWJsaWMnO1xyXG5cclxuaW1wb3J0IHsgRHVtcEludGVyZmFjZSB9IGZyb20gJy4vZHVtcC1pbnRlcmZhY2UnO1xyXG5pbXBvcnQgQ29tcG9uZW50TWFuYWdlciBmcm9tICcuLi8uLi9jb21wb25lbnQvaW5kZXgnO1xyXG5cclxuLy8gdmFsdWVUeXBl55u05o6l5L2/55So5byV5pOO5bqP5YiX5YyWXHJcbmNsYXNzIENvbXBvbmVudER1bXAgaW1wbGVtZW50cyBEdW1wSW50ZXJmYWNlIHtcclxuICAgIHB1YmxpYyBlbmNvZGUob2JqZWN0OiBhbnksIGRhdGE6IElQcm9wZXJ0eSwgb3B0cz86IGFueSk6IHZvaWQge1xyXG4gICAgICAgIGRhdGEudmFsdWUgPSB7XHJcbiAgICAgICAgICAgIHV1aWQ6IG9iamVjdCA/IG9iamVjdC51dWlkIHx8ICcnIDogJycsXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZGVjb2RlKGRhdGE6IGFueSwgaW5mbzogYW55LCBkdW1wOiBhbnksIG9wdHM/OiBhbnkpOiB2b2lkIHtcclxuICAgICAgICBkYXRhW2luZm8ua2V5XSA9IENvbXBvbmVudE1hbmFnZXIucXVlcnkoZHVtcC52YWx1ZS51dWlkKTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IGNvbXBvbmVudER1bXAgPSBuZXcgQ29tcG9uZW50RHVtcCgpO1xyXG4iXX0=