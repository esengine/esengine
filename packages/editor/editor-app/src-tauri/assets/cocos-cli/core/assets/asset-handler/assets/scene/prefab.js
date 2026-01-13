'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrefabHandler = void 0;
const index_1 = require("./index");
const fs_extra_1 = require("fs-extra");
const utils_1 = require("../../utils");
exports.PrefabHandler = {
    // Handler 的名字，用于指定 Handler as 等
    name: 'prefab',
    // 引擎内对应的类型
    assetType: 'cc.Prefab',
    open(asset) {
        // TODO: 实现打开预制体资产
        return false;
    },
    createInfo: {
        generateMenuInfo() {
            return [
                {
                    label: 'i18n:ENGINE.assets.newPrefab',
                    fullFileName: 'Node.prefab',
                    template: `db://internal/default_file_content/${exports.PrefabHandler.name}/default.prefab`,
                    group: 'scene',
                    name: 'default',
                },
            ];
        },
    },
    importer: {
        version: index_1.version,
        versionCode: index_1.versionCode,
        /**
         * 实际导入流程
         * 需要自己控制是否生成、拷贝文件
         *
         * 返回是否导入成功的标记
         * 如果返回 false，则 imported 标记不会变成 true
         * 后续的一系列操作都不会执行
         * @param asset 资源
         */
        async import(asset) {
            /**
             * 为了保持生成的 prefab 根节点的 nodeName 与 prefab 资源 baseName 一致
             * 在 meta 文件 userData 中增加一个标记 syncNodeName
             * 当 prefab 资源的文件名称与 syncNodeName 不一致时，更新资源和 library 中的数据
             */
            const source = await (0, fs_extra_1.readJSON)(asset.source);
            const basename = asset.basename || '';
            let dirty = source[0]._name !== basename || source[1]._name !== basename || source[0].persistent !== !!asset.userData.persistent;
            if (dirty) {
                // 更新资源的 name
                source[0]._name = basename || '';
                source[1]._name = basename || '';
                source[0].persistent = !!asset.userData.persistent;
            }
            try {
                // HACK 过去版本场景 prefab 资源可能会出现节点组件数据为空的情况
                dirty = dirty || (0, utils_1.removeNull)(source, asset.uuid);
            }
            catch (error) {
                console.debug(error);
            }
            // 同步到存档文件
            if (dirty) {
                try {
                    const serializeJSON = JSON.stringify(source, undefined, 2);
                    await (0, fs_extra_1.writeFile)(asset.source, serializeJSON);
                }
                catch (error) {
                    // 有可能只读，只读的话就不管源文件了
                }
            }
            const serializeJSON = JSON.stringify(source, undefined, 2);
            await asset.saveToLibrary('.json', serializeJSON);
            const dependInfo = (0, utils_1.getDependList)(serializeJSON);
            asset.setData('depends', dependInfo.uuids);
            asset.setData('dependScripts', dependInfo.dependScriptUuids);
            // 最后更改标记
            asset.userData.syncNodeName = basename;
            return true;
        },
    },
};
exports.default = exports.PrefabHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlZmFiLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2NvcmUvYXNzZXRzL2Fzc2V0LWhhbmRsZXIvYXNzZXRzL3NjZW5lL3ByZWZhYi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7OztBQUdiLG1DQUErQztBQUMvQyx1Q0FBK0M7QUFHL0MsdUNBQXdEO0FBRTNDLFFBQUEsYUFBYSxHQUFpQjtJQUN2QyxnQ0FBZ0M7SUFDaEMsSUFBSSxFQUFFLFFBQVE7SUFDZCxXQUFXO0lBQ1gsU0FBUyxFQUFFLFdBQVc7SUFDdEIsSUFBSSxDQUFDLEtBQUs7UUFDTixrQkFBa0I7UUFDbEIsT0FBTyxLQUFLLENBQUM7SUFDakIsQ0FBQztJQUNELFVBQVUsRUFBRTtRQUNSLGdCQUFnQjtZQUNaLE9BQU87Z0JBQ0g7b0JBQ0ksS0FBSyxFQUFFLDhCQUE4QjtvQkFDckMsWUFBWSxFQUFFLGFBQWE7b0JBQzNCLFFBQVEsRUFBRSxzQ0FBc0MscUJBQWEsQ0FBQyxJQUFJLGlCQUFpQjtvQkFDbkYsS0FBSyxFQUFFLE9BQU87b0JBQ2QsSUFBSSxFQUFFLFNBQVM7aUJBQ2xCO2FBQ0osQ0FBQztRQUNOLENBQUM7S0FDSjtJQUVELFFBQVEsRUFBRTtRQUNOLE9BQU8sRUFBUCxlQUFPO1FBQ1AsV0FBVyxFQUFYLG1CQUFXO1FBRVg7Ozs7Ozs7O1dBUUc7UUFDSCxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQVk7WUFDckI7Ozs7ZUFJRztZQUNILE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBQSxtQkFBUSxFQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUU1QyxNQUFNLFFBQVEsR0FBRyxLQUFLLENBQUMsUUFBUSxJQUFJLEVBQUUsQ0FBQztZQUN0QyxJQUFJLEtBQUssR0FDTCxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxLQUFLLFFBQVEsSUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxLQUFLLFFBQVEsSUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxLQUFLLENBQUMsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQztZQUV6SCxJQUFJLEtBQUssRUFBRSxDQUFDO2dCQUNSLGFBQWE7Z0JBQ2IsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxRQUFRLElBQUksRUFBRSxDQUFDO2dCQUNqQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLFFBQVEsSUFBSSxFQUFFLENBQUM7Z0JBQ2pDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDO1lBQ3ZELENBQUM7WUFDRCxJQUFJLENBQUM7Z0JBQ0Qsd0NBQXdDO2dCQUN4QyxLQUFLLEdBQUcsS0FBSyxJQUFJLElBQUEsa0JBQVUsRUFBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3BELENBQUM7WUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO2dCQUNiLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDekIsQ0FBQztZQUNELFVBQVU7WUFDVixJQUFJLEtBQUssRUFBRSxDQUFDO2dCQUNSLElBQUksQ0FBQztvQkFDRCxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUM7b0JBQzNELE1BQU0sSUFBQSxvQkFBUyxFQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsYUFBYSxDQUFDLENBQUM7Z0JBQ2pELENBQUM7Z0JBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztvQkFDYixvQkFBb0I7Z0JBQ3hCLENBQUM7WUFDTCxDQUFDO1lBRUQsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzNELE1BQU0sS0FBSyxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsYUFBYSxDQUFDLENBQUM7WUFDbEQsTUFBTSxVQUFVLEdBQUcsSUFBQSxxQkFBYSxFQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQ2hELEtBQUssQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUMzQyxLQUFLLENBQUMsT0FBTyxDQUFDLGVBQWUsRUFBRSxVQUFVLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUU3RCxTQUFTO1lBQ1QsS0FBSyxDQUFDLFFBQVEsQ0FBQyxZQUFZLEdBQUcsUUFBUSxDQUFDO1lBRXZDLE9BQU8sSUFBSSxDQUFDO1FBQ2hCLENBQUM7S0FDSjtDQUNKLENBQUM7QUFFRixrQkFBZSxxQkFBYSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xyXG5cclxuaW1wb3J0IHsgQXNzZXQgfSBmcm9tICdAY29jb3MvYXNzZXQtZGInO1xyXG5pbXBvcnQgeyB2ZXJzaW9uLCB2ZXJzaW9uQ29kZSB9IGZyb20gJy4vaW5kZXgnO1xyXG5pbXBvcnQgeyByZWFkSlNPTiwgd3JpdGVGaWxlIH0gZnJvbSAnZnMtZXh0cmEnO1xyXG5cclxuaW1wb3J0IHsgQXNzZXRIYW5kbGVyIH0gZnJvbSAnLi4vLi4vLi4vQHR5cGVzL3Byb3RlY3RlZCc7XHJcbmltcG9ydCB7IGdldERlcGVuZExpc3QsIHJlbW92ZU51bGwgfSBmcm9tICcuLi8uLi91dGlscyc7XHJcblxyXG5leHBvcnQgY29uc3QgUHJlZmFiSGFuZGxlcjogQXNzZXRIYW5kbGVyID0ge1xyXG4gICAgLy8gSGFuZGxlciDnmoTlkI3lrZfvvIznlKjkuo7mjIflrpogSGFuZGxlciBhcyDnrYlcclxuICAgIG5hbWU6ICdwcmVmYWInLFxyXG4gICAgLy8g5byV5pOO5YaF5a+55bqU55qE57G75Z6LXHJcbiAgICBhc3NldFR5cGU6ICdjYy5QcmVmYWInLFxyXG4gICAgb3Blbihhc3NldCkge1xyXG4gICAgICAgIC8vIFRPRE86IOWunueOsOaJk+W8gOmihOWItuS9k+i1hOS6p1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH0sXHJcbiAgICBjcmVhdGVJbmZvOiB7XHJcbiAgICAgICAgZ2VuZXJhdGVNZW51SW5mbygpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFtcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ2kxOG46RU5HSU5FLmFzc2V0cy5uZXdQcmVmYWInLFxyXG4gICAgICAgICAgICAgICAgICAgIGZ1bGxGaWxlTmFtZTogJ05vZGUucHJlZmFiJyxcclxuICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogYGRiOi8vaW50ZXJuYWwvZGVmYXVsdF9maWxlX2NvbnRlbnQvJHtQcmVmYWJIYW5kbGVyLm5hbWV9L2RlZmF1bHQucHJlZmFiYCxcclxuICAgICAgICAgICAgICAgICAgICBncm91cDogJ3NjZW5lJyxcclxuICAgICAgICAgICAgICAgICAgICBuYW1lOiAnZGVmYXVsdCcsXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBdO1xyXG4gICAgICAgIH0sXHJcbiAgICB9LFxyXG5cclxuICAgIGltcG9ydGVyOiB7XHJcbiAgICAgICAgdmVyc2lvbixcclxuICAgICAgICB2ZXJzaW9uQ29kZSxcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog5a6e6ZmF5a+85YWl5rWB56iLXHJcbiAgICAgICAgICog6ZyA6KaB6Ieq5bex5o6n5Yi25piv5ZCm55Sf5oiQ44CB5ou36LSd5paH5Lu2XHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiDov5Tlm57mmK/lkKblr7zlhaXmiJDlip/nmoTmoIforrBcclxuICAgICAgICAgKiDlpoLmnpzov5Tlm54gZmFsc2XvvIzliJkgaW1wb3J0ZWQg5qCH6K6w5LiN5Lya5Y+Y5oiQIHRydWVcclxuICAgICAgICAgKiDlkI7nu63nmoTkuIDns7vliJfmk43kvZzpg73kuI3kvJrmiafooYxcclxuICAgICAgICAgKiBAcGFyYW0gYXNzZXQg6LWE5rqQXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgYXN5bmMgaW1wb3J0KGFzc2V0OiBBc3NldCkge1xyXG4gICAgICAgICAgICAvKipcclxuICAgICAgICAgICAgICog5Li65LqG5L+d5oyB55Sf5oiQ55qEIHByZWZhYiDmoLnoioLngrnnmoQgbm9kZU5hbWUg5LiOIHByZWZhYiDotYTmupAgYmFzZU5hbWUg5LiA6Ie0XHJcbiAgICAgICAgICAgICAqIOWcqCBtZXRhIOaWh+S7tiB1c2VyRGF0YSDkuK3lop7liqDkuIDkuKrmoIforrAgc3luY05vZGVOYW1lXHJcbiAgICAgICAgICAgICAqIOW9kyBwcmVmYWIg6LWE5rqQ55qE5paH5Lu25ZCN56ew5LiOIHN5bmNOb2RlTmFtZSDkuI3kuIDoh7Tml7bvvIzmm7TmlrDotYTmupDlkowgbGlicmFyeSDkuK3nmoTmlbDmja5cclxuICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgIGNvbnN0IHNvdXJjZSA9IGF3YWl0IHJlYWRKU09OKGFzc2V0LnNvdXJjZSk7XHJcblxyXG4gICAgICAgICAgICBjb25zdCBiYXNlbmFtZSA9IGFzc2V0LmJhc2VuYW1lIHx8ICcnO1xyXG4gICAgICAgICAgICBsZXQgZGlydHkgPVxyXG4gICAgICAgICAgICAgICAgc291cmNlWzBdLl9uYW1lICE9PSBiYXNlbmFtZSB8fCBzb3VyY2VbMV0uX25hbWUgIT09IGJhc2VuYW1lIHx8IHNvdXJjZVswXS5wZXJzaXN0ZW50ICE9PSAhIWFzc2V0LnVzZXJEYXRhLnBlcnNpc3RlbnQ7XHJcblxyXG4gICAgICAgICAgICBpZiAoZGlydHkpIHtcclxuICAgICAgICAgICAgICAgIC8vIOabtOaWsOi1hOa6kOeahCBuYW1lXHJcbiAgICAgICAgICAgICAgICBzb3VyY2VbMF0uX25hbWUgPSBiYXNlbmFtZSB8fCAnJztcclxuICAgICAgICAgICAgICAgIHNvdXJjZVsxXS5fbmFtZSA9IGJhc2VuYW1lIHx8ICcnO1xyXG4gICAgICAgICAgICAgICAgc291cmNlWzBdLnBlcnNpc3RlbnQgPSAhIWFzc2V0LnVzZXJEYXRhLnBlcnNpc3RlbnQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIC8vIEhBQ0sg6L+H5Y6754mI5pys5Zy65pmvIHByZWZhYiDotYTmupDlj6/og73kvJrlh7rnjrDoioLngrnnu4Tku7bmlbDmja7kuLrnqbrnmoTmg4XlhrVcclxuICAgICAgICAgICAgICAgIGRpcnR5ID0gZGlydHkgfHwgcmVtb3ZlTnVsbChzb3VyY2UsIGFzc2V0LnV1aWQpO1xyXG4gICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5kZWJ1ZyhlcnJvcik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8g5ZCM5q2l5Yiw5a2Y5qGj5paH5Lu2XHJcbiAgICAgICAgICAgIGlmIChkaXJ0eSkge1xyXG4gICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBzZXJpYWxpemVKU09OID0gSlNPTi5zdHJpbmdpZnkoc291cmNlLCB1bmRlZmluZWQsIDIpO1xyXG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IHdyaXRlRmlsZShhc3NldC5zb3VyY2UsIHNlcmlhbGl6ZUpTT04pO1xyXG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyDmnInlj6/og73lj6ror7vvvIzlj6ror7vnmoTor53lsLHkuI3nrqHmupDmlofku7bkuoZcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY29uc3Qgc2VyaWFsaXplSlNPTiA9IEpTT04uc3RyaW5naWZ5KHNvdXJjZSwgdW5kZWZpbmVkLCAyKTtcclxuICAgICAgICAgICAgYXdhaXQgYXNzZXQuc2F2ZVRvTGlicmFyeSgnLmpzb24nLCBzZXJpYWxpemVKU09OKTtcclxuICAgICAgICAgICAgY29uc3QgZGVwZW5kSW5mbyA9IGdldERlcGVuZExpc3Qoc2VyaWFsaXplSlNPTik7XHJcbiAgICAgICAgICAgIGFzc2V0LnNldERhdGEoJ2RlcGVuZHMnLCBkZXBlbmRJbmZvLnV1aWRzKTtcclxuICAgICAgICAgICAgYXNzZXQuc2V0RGF0YSgnZGVwZW5kU2NyaXB0cycsIGRlcGVuZEluZm8uZGVwZW5kU2NyaXB0VXVpZHMpO1xyXG5cclxuICAgICAgICAgICAgLy8g5pyA5ZCO5pu05pS55qCH6K6wXHJcbiAgICAgICAgICAgIGFzc2V0LnVzZXJEYXRhLnN5bmNOb2RlTmFtZSA9IGJhc2VuYW1lO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfSxcclxuICAgIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBQcmVmYWJIYW5kbGVyO1xyXG4iXX0=