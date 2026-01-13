'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const asset_db_1 = require("@cocos/asset-db");
const fs_extra_1 = require("fs-extra");
const InternalBundleName = ['internal', 'resources', 'main'];
const DirectoryHandler = {
    // Handler 的名字，用于指定 Handler as 等
    name: 'directory',
    importer: {
        // 版本号如果变更，则会强制重新导入
        version: '1.2.0',
        /**
         * 实际导入流程
         * @param asset
         */
        async import(asset) {
            const userData = asset.userData;
            const url = (0, asset_db_1.queryUrl)(asset.uuid);
            if (url === 'db://assets/resources') {
                userData.isBundle = true;
                userData.bundleConfigID = userData.bundleConfigID ?? 'default';
                userData.bundleName = 'resources';
                userData.priority = 8;
            }
            return true;
        },
    },
    iconInfo: {
        default: {
            value: 'directory',
            type: 'icon',
        },
        generateThumbnail(asset) {
            const userData = asset.userData;
            if (userData.isBundle) {
                return {
                    value: 'bundle-folder',
                    type: 'icon',
                };
            }
            return {
                value: 'directory',
                type: 'icon',
            };
        },
    },
    createInfo: {
        generateMenuInfo() {
            return [
                {
                    label: 'i18n:ENGINE.assets.newFolder',
                    fullFileName: 'folder',
                    name: 'default',
                },
            ];
        },
        async create(option) {
            (0, fs_extra_1.ensureDirSync)(option.target);
            return option.target;
        },
    },
    async validate(asset) {
        return asset.isDirectory();
    },
};
exports.default = DirectoryHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlyZWN0b3J5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2NvcmUvYXNzZXRzL2Fzc2V0LWhhbmRsZXIvYXNzZXRzL2RpcmVjdG9yeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7O0FBRWIsOENBQWdFO0FBR2hFLHVDQUF5QztBQUV6QyxNQUFNLGtCQUFrQixHQUFHLENBQUMsVUFBVSxFQUFFLFdBQVcsRUFBRSxNQUFNLENBQUMsQ0FBQztBQUU3RCxNQUFNLGdCQUFnQixHQUFpQjtJQUNuQyxnQ0FBZ0M7SUFDaEMsSUFBSSxFQUFFLFdBQVc7SUFDakIsUUFBUSxFQUFFO1FBQ04sbUJBQW1CO1FBQ25CLE9BQU8sRUFBRSxPQUFPO1FBQ2hCOzs7V0FHRztRQUNILEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBMkI7WUFDcEMsTUFBTSxRQUFRLEdBQUcsS0FBSyxDQUFDLFFBQWtDLENBQUM7WUFDMUQsTUFBTSxHQUFHLEdBQUcsSUFBQSxtQkFBUSxFQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNqQyxJQUFJLEdBQUcsS0FBSyx1QkFBdUIsRUFBRSxDQUFDO2dCQUNsQyxRQUFRLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztnQkFDekIsUUFBUSxDQUFDLGNBQWMsR0FBRyxRQUFRLENBQUMsY0FBYyxJQUFJLFNBQVMsQ0FBQztnQkFDL0QsUUFBUSxDQUFDLFVBQVUsR0FBRyxXQUFXLENBQUM7Z0JBQ2xDLFFBQVEsQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDO1lBQzFCLENBQUM7WUFDRCxPQUFPLElBQUksQ0FBQztRQUNoQixDQUFDO0tBQ0o7SUFFRCxRQUFRLEVBQUU7UUFDTixPQUFPLEVBQUU7WUFDTCxLQUFLLEVBQUUsV0FBVztZQUNsQixJQUFJLEVBQUUsTUFBTTtTQUNmO1FBQ0QsaUJBQWlCLENBQUMsS0FBSztZQUNuQixNQUFNLFFBQVEsR0FBRyxLQUFLLENBQUMsUUFBa0MsQ0FBQztZQUMxRCxJQUFJLFFBQVEsQ0FBQyxRQUFRLEVBQUUsQ0FBQztnQkFDcEIsT0FBTztvQkFDSCxLQUFLLEVBQUUsZUFBZTtvQkFDdEIsSUFBSSxFQUFFLE1BQU07aUJBQ2YsQ0FBQztZQUNOLENBQUM7WUFDRCxPQUFPO2dCQUNILEtBQUssRUFBRSxXQUFXO2dCQUNsQixJQUFJLEVBQUUsTUFBTTthQUNmLENBQUM7UUFDTixDQUFDO0tBQ0o7SUFFRCxVQUFVLEVBQUU7UUFDUixnQkFBZ0I7WUFDWixPQUFPO2dCQUNIO29CQUNJLEtBQUssRUFBRSw4QkFBOEI7b0JBQ3JDLFlBQVksRUFBRSxRQUFRO29CQUN0QixJQUFJLEVBQUUsU0FBUztpQkFDbEI7YUFDSixDQUFDO1FBQ04sQ0FBQztRQUVELEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTTtZQUNmLElBQUEsd0JBQWEsRUFBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDN0IsT0FBTyxNQUFNLENBQUMsTUFBTSxDQUFDO1FBQ3pCLENBQUM7S0FDSjtJQUVELEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBWTtRQUN2QixPQUFPLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUMvQixDQUFDO0NBQ0osQ0FBQztBQUNGLGtCQUFlLGdCQUFnQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xyXG5cclxuaW1wb3J0IHsgQXNzZXQsIHF1ZXJ5VXJsLCBWaXJ0dWFsQXNzZXQgfSBmcm9tICdAY29jb3MvYXNzZXQtZGInO1xyXG5pbXBvcnQgeyBBc3NldEhhbmRsZXIgfSBmcm9tICcuLi8uLi9AdHlwZXMvcHJvdGVjdGVkJztcclxuaW1wb3J0IHsgRGlyZWN0b3J5QXNzZXRVc2VyRGF0YSB9IGZyb20gJy4uLy4uL0B0eXBlcy91c2VyRGF0YXMnO1xyXG5pbXBvcnQgeyBlbnN1cmVEaXJTeW5jIH0gZnJvbSAnZnMtZXh0cmEnO1xyXG5cclxuY29uc3QgSW50ZXJuYWxCdW5kbGVOYW1lID0gWydpbnRlcm5hbCcsICdyZXNvdXJjZXMnLCAnbWFpbiddO1xyXG5cclxuY29uc3QgRGlyZWN0b3J5SGFuZGxlcjogQXNzZXRIYW5kbGVyID0ge1xyXG4gICAgLy8gSGFuZGxlciDnmoTlkI3lrZfvvIznlKjkuo7mjIflrpogSGFuZGxlciBhcyDnrYlcclxuICAgIG5hbWU6ICdkaXJlY3RvcnknLFxyXG4gICAgaW1wb3J0ZXI6IHtcclxuICAgICAgICAvLyDniYjmnKzlj7flpoLmnpzlj5jmm7TvvIzliJnkvJrlvLrliLbph43mlrDlr7zlhaVcclxuICAgICAgICB2ZXJzaW9uOiAnMS4yLjAnLFxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIOWunumZheWvvOWFpea1geeoi1xyXG4gICAgICAgICAqIEBwYXJhbSBhc3NldFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGFzeW5jIGltcG9ydChhc3NldDogQXNzZXQgfCBWaXJ0dWFsQXNzZXQpIHtcclxuICAgICAgICAgICAgY29uc3QgdXNlckRhdGEgPSBhc3NldC51c2VyRGF0YSBhcyBEaXJlY3RvcnlBc3NldFVzZXJEYXRhO1xyXG4gICAgICAgICAgICBjb25zdCB1cmwgPSBxdWVyeVVybChhc3NldC51dWlkKTtcclxuICAgICAgICAgICAgaWYgKHVybCA9PT0gJ2RiOi8vYXNzZXRzL3Jlc291cmNlcycpIHtcclxuICAgICAgICAgICAgICAgIHVzZXJEYXRhLmlzQnVuZGxlID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIHVzZXJEYXRhLmJ1bmRsZUNvbmZpZ0lEID0gdXNlckRhdGEuYnVuZGxlQ29uZmlnSUQgPz8gJ2RlZmF1bHQnO1xyXG4gICAgICAgICAgICAgICAgdXNlckRhdGEuYnVuZGxlTmFtZSA9ICdyZXNvdXJjZXMnO1xyXG4gICAgICAgICAgICAgICAgdXNlckRhdGEucHJpb3JpdHkgPSA4O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH0sXHJcbiAgICB9LFxyXG5cclxuICAgIGljb25JbmZvOiB7XHJcbiAgICAgICAgZGVmYXVsdDoge1xyXG4gICAgICAgICAgICB2YWx1ZTogJ2RpcmVjdG9yeScsXHJcbiAgICAgICAgICAgIHR5cGU6ICdpY29uJyxcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdlbmVyYXRlVGh1bWJuYWlsKGFzc2V0KSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHVzZXJEYXRhID0gYXNzZXQudXNlckRhdGEgYXMgRGlyZWN0b3J5QXNzZXRVc2VyRGF0YTtcclxuICAgICAgICAgICAgaWYgKHVzZXJEYXRhLmlzQnVuZGxlKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiAnYnVuZGxlLWZvbGRlcicsXHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2ljb24nLFxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgdmFsdWU6ICdkaXJlY3RvcnknLFxyXG4gICAgICAgICAgICAgICAgdHlwZTogJ2ljb24nLFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH0sXHJcbiAgICB9LFxyXG5cclxuICAgIGNyZWF0ZUluZm86IHtcclxuICAgICAgICBnZW5lcmF0ZU1lbnVJbmZvKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gW1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnaTE4bjpFTkdJTkUuYXNzZXRzLm5ld0ZvbGRlcicsXHJcbiAgICAgICAgICAgICAgICAgICAgZnVsbEZpbGVOYW1lOiAnZm9sZGVyJyxcclxuICAgICAgICAgICAgICAgICAgICBuYW1lOiAnZGVmYXVsdCcsXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBdO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGFzeW5jIGNyZWF0ZShvcHRpb24pIHtcclxuICAgICAgICAgICAgZW5zdXJlRGlyU3luYyhvcHRpb24udGFyZ2V0KTtcclxuICAgICAgICAgICAgcmV0dXJuIG9wdGlvbi50YXJnZXQ7XHJcbiAgICAgICAgfSxcclxuICAgIH0sXHJcblxyXG4gICAgYXN5bmMgdmFsaWRhdGUoYXNzZXQ6IEFzc2V0KSB7XHJcbiAgICAgICAgcmV0dXJuIGFzc2V0LmlzRGlyZWN0b3J5KCk7XHJcbiAgICB9LFxyXG59O1xyXG5leHBvcnQgZGVmYXVsdCBEaXJlY3RvcnlIYW5kbGVyO1xyXG4iXX0=