'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.TTFFontHandler = void 0;
const utils_1 = require("../utils");
exports.TTFFontHandler = {
    // Handler 的名字，用于指定 Handler as 等
    name: 'ttf-font',
    // 编辑器属性上定义的如果是资源的基类类型，此处也需要定义基类类型
    // 不会影响实际资源类型
    assetType: 'cc.TTFFont',
    importer: {
        // 版本号如果变更，则会强制重新导入
        version: '1.0.1',
        /**
         * 实际导入流程
         * 需要自己控制是否生成、拷贝文件
         *
         * 返回是否导入成功的标记
         * 如果返回 false，则 imported 标记不会变成 true
         * 后续的一系列操作都不会执行
         * @param asset
         */
        async import(asset) {
            const filename = asset.basename + '.ttf';
            await asset.copyToLibrary(filename, asset.source);
            const ttf = createTTFFont(asset);
            const serializeJSON = EditorExtends.serialize(ttf);
            await asset.saveToLibrary('.json', serializeJSON);
            const depends = (0, utils_1.getDependUUIDList)(serializeJSON);
            asset.setData('depends', depends);
            return true;
        },
    },
};
exports.default = exports.TTFFontHandler;
function createTTFFont(asset) {
    const ttf = new cc.TTFFont();
    ttf.name = asset.basename;
    ttf._setRawAsset(ttf.name + '.ttf');
    return ttf;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHRmLWZvbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvY29yZS9hc3NldHMvYXNzZXQtaGFuZGxlci9hc3NldHMvdHRmLWZvbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOzs7QUFNYixvQ0FBNkM7QUFHaEMsUUFBQSxjQUFjLEdBQWlCO0lBQ3hDLGdDQUFnQztJQUNoQyxJQUFJLEVBQUUsVUFBVTtJQUVoQixrQ0FBa0M7SUFDbEMsYUFBYTtJQUNiLFNBQVMsRUFBRSxZQUFZO0lBRXZCLFFBQVEsRUFBRTtRQUNOLG1CQUFtQjtRQUNuQixPQUFPLEVBQUUsT0FBTztRQUNoQjs7Ozs7Ozs7V0FRRztRQUNILEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBWTtZQUNyQixNQUFNLFFBQVEsR0FBRyxLQUFLLENBQUMsUUFBUSxHQUFHLE1BQU0sQ0FBQztZQUN6QyxNQUFNLEtBQUssQ0FBQyxhQUFhLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNsRCxNQUFNLEdBQUcsR0FBRyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7WUFFakMsTUFBTSxhQUFhLEdBQUcsYUFBYSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNuRCxNQUFNLEtBQUssQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLGFBQWEsQ0FBQyxDQUFDO1lBRWxELE1BQU0sT0FBTyxHQUFHLElBQUEseUJBQWlCLEVBQUMsYUFBYSxDQUFDLENBQUM7WUFDakQsS0FBSyxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFFbEMsT0FBTyxJQUFJLENBQUM7UUFDaEIsQ0FBQztLQUNKO0NBQ0osQ0FBQztBQUVGLGtCQUFlLHNCQUFjLENBQUM7QUFFOUIsU0FBUyxhQUFhLENBQUMsS0FBWTtJQUMvQixNQUFNLEdBQUcsR0FBRyxJQUFJLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUM3QixHQUFHLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUM7SUFDMUIsR0FBRyxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQyxDQUFDO0lBQ3BDLE9BQU8sR0FBRyxDQUFDO0FBQ2YsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcclxuXHJcbmltcG9ydCB7IEFzc2V0IH0gZnJvbSAnQGNvY29zL2Fzc2V0LWRiJztcclxuaW1wb3J0IHsgQXNzZXRIYW5kbGVyIH0gZnJvbSAnLi4vLi4vQHR5cGVzL3Byb3RlY3RlZCc7XHJcbmltcG9ydCB7IGV4dG5hbWUgfSBmcm9tICdwYXRoJztcclxuXHJcbmltcG9ydCB7IGdldERlcGVuZFVVSURMaXN0IH0gZnJvbSAnLi4vdXRpbHMnO1xyXG5kZWNsYXJlIGNvbnN0IGNjOiBhbnk7XHJcblxyXG5leHBvcnQgY29uc3QgVFRGRm9udEhhbmRsZXI6IEFzc2V0SGFuZGxlciA9IHtcclxuICAgIC8vIEhhbmRsZXIg55qE5ZCN5a2X77yM55So5LqO5oyH5a6aIEhhbmRsZXIgYXMg562JXHJcbiAgICBuYW1lOiAndHRmLWZvbnQnLFxyXG5cclxuICAgIC8vIOe8lui+keWZqOWxnuaAp+S4iuWumuS5ieeahOWmguaenOaYr+i1hOa6kOeahOWfuuexu+exu+Wei++8jOatpOWkhOS5n+mcgOimgeWumuS5ieWfuuexu+exu+Wei1xyXG4gICAgLy8g5LiN5Lya5b2x5ZON5a6e6ZmF6LWE5rqQ57G75Z6LXHJcbiAgICBhc3NldFR5cGU6ICdjYy5UVEZGb250JyxcclxuXHJcbiAgICBpbXBvcnRlcjoge1xyXG4gICAgICAgIC8vIOeJiOacrOWPt+WmguaenOWPmOabtO+8jOWImeS8muW8uuWItumHjeaWsOWvvOWFpVxyXG4gICAgICAgIHZlcnNpb246ICcxLjAuMScsXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog5a6e6ZmF5a+85YWl5rWB56iLXHJcbiAgICAgICAgICog6ZyA6KaB6Ieq5bex5o6n5Yi25piv5ZCm55Sf5oiQ44CB5ou36LSd5paH5Lu2XHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiDov5Tlm57mmK/lkKblr7zlhaXmiJDlip/nmoTmoIforrBcclxuICAgICAgICAgKiDlpoLmnpzov5Tlm54gZmFsc2XvvIzliJkgaW1wb3J0ZWQg5qCH6K6w5LiN5Lya5Y+Y5oiQIHRydWVcclxuICAgICAgICAgKiDlkI7nu63nmoTkuIDns7vliJfmk43kvZzpg73kuI3kvJrmiafooYxcclxuICAgICAgICAgKiBAcGFyYW0gYXNzZXRcclxuICAgICAgICAgKi9cclxuICAgICAgICBhc3luYyBpbXBvcnQoYXNzZXQ6IEFzc2V0KSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGZpbGVuYW1lID0gYXNzZXQuYmFzZW5hbWUgKyAnLnR0Zic7XHJcbiAgICAgICAgICAgIGF3YWl0IGFzc2V0LmNvcHlUb0xpYnJhcnkoZmlsZW5hbWUsIGFzc2V0LnNvdXJjZSk7XHJcbiAgICAgICAgICAgIGNvbnN0IHR0ZiA9IGNyZWF0ZVRURkZvbnQoYXNzZXQpO1xyXG5cclxuICAgICAgICAgICAgY29uc3Qgc2VyaWFsaXplSlNPTiA9IEVkaXRvckV4dGVuZHMuc2VyaWFsaXplKHR0Zik7XHJcbiAgICAgICAgICAgIGF3YWl0IGFzc2V0LnNhdmVUb0xpYnJhcnkoJy5qc29uJywgc2VyaWFsaXplSlNPTik7XHJcblxyXG4gICAgICAgICAgICBjb25zdCBkZXBlbmRzID0gZ2V0RGVwZW5kVVVJRExpc3Qoc2VyaWFsaXplSlNPTik7XHJcbiAgICAgICAgICAgIGFzc2V0LnNldERhdGEoJ2RlcGVuZHMnLCBkZXBlbmRzKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH0sXHJcbiAgICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgVFRGRm9udEhhbmRsZXI7XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVUVEZGb250KGFzc2V0OiBBc3NldCkge1xyXG4gICAgY29uc3QgdHRmID0gbmV3IGNjLlRURkZvbnQoKTtcclxuICAgIHR0Zi5uYW1lID0gYXNzZXQuYmFzZW5hbWU7XHJcbiAgICB0dGYuX3NldFJhd0Fzc2V0KHR0Zi5uYW1lICsgJy50dGYnKTtcclxuICAgIHJldHVybiB0dGY7XHJcbn1cclxuIl19