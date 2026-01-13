"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compressDirs = compressDirs;
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const jszip_1 = __importDefault(require("jszip"));
const global_1 = require("../../../share/global");
async function compressDirs(dirnames, basepath, outputPath) {
    await new Promise(resolve => {
        const jsZip = new jszip_1.default();
        const filesToCompress = [];
        const dir = (0, path_1.parse)(global_1.BuildGlobalInfo.BUNDLE_ZIP_NAME).name;
        dirnames.forEach(dirname => {
            getFilesInDirectory(filesToCompress, dirname);
        });
        // https://stackoverflow.com/questions/57175871/how-to-make-jszip-generate-same-buffer/57177371#57177371?newreg=b690df5d033d4576bb3be28f6bb010ab
        // https://adoyle.me/blog/why-zip-file-checksum-changed.html
        const options = {
            date: new Date('2021.06.21 06:00:00Z'),
            createFolders: false,
        };
        filesToCompress.forEach(filepath => {
            const relativePath = (0, path_1.relative)(basepath, filepath);
            let targetPath = (0, path_1.join)(dir, relativePath);
            targetPath = targetPath.replace(/\\/g, '/');
            jsZip.file(targetPath, (0, fs_extra_1.readFileSync)(filepath), options);
        });
        jsZip.generateAsync({
            type: 'nodebuffer',
            compression: 'DEFLATE',
            compressionOptions: {
                level: 9,
            },
        }).then((content) => {
            (0, fs_extra_1.writeFileSync)(outputPath, content);
            dirnames.forEach((dirname) => {
                (0, fs_extra_1.removeSync)(dirname);
            });
            resolve();
        });
    });
}
function getFilesInDirectory(output, dirname) {
    const dirlist = (0, fs_extra_1.readdirSync)(dirname);
    dirlist.forEach(item => {
        const absolutePath = (0, path_1.join)(dirname, item);
        const statInfo = (0, fs_extra_1.statSync)(absolutePath);
        if (statInfo.isDirectory()) {
            getFilesInDirectory(output, absolutePath);
        }
        else {
            output.push(absolutePath);
        }
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiemlwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2NvcmUvYnVpbGRlci93b3JrZXIvYnVpbGRlci91dGlscy96aXAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFJQSxvQ0FrQ0M7QUF0Q0QsdUNBQTBGO0FBQzFGLCtCQUE2QztBQUM3QyxrREFBMEI7QUFDMUIsa0RBQXdEO0FBQ2pELEtBQUssVUFBVSxZQUFZLENBQUMsUUFBa0IsRUFBRSxRQUFnQixFQUFFLFVBQWtCO0lBQ3ZGLE1BQU0sSUFBSSxPQUFPLENBQU8sT0FBTyxDQUFDLEVBQUU7UUFDOUIsTUFBTSxLQUFLLEdBQUcsSUFBSSxlQUFLLEVBQUUsQ0FBQztRQUMxQixNQUFNLGVBQWUsR0FBYSxFQUFFLENBQUM7UUFDckMsTUFBTSxHQUFHLEdBQUcsSUFBQSxZQUFLLEVBQUMsd0JBQWUsQ0FBQyxlQUFlLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFDeEQsUUFBUSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRTtZQUN2QixtQkFBbUIsQ0FBQyxlQUFlLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDbEQsQ0FBQyxDQUFDLENBQUM7UUFDSCxnSkFBZ0o7UUFDaEosNERBQTREO1FBQzVELE1BQU0sT0FBTyxHQUFHO1lBQ1osSUFBSSxFQUFFLElBQUksSUFBSSxDQUFDLHNCQUFzQixDQUFDO1lBQ3RDLGFBQWEsRUFBRSxLQUFLO1NBQ3ZCLENBQUM7UUFDRixlQUFlLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFO1lBQy9CLE1BQU0sWUFBWSxHQUFHLElBQUEsZUFBUSxFQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztZQUNsRCxJQUFJLFVBQVUsR0FBRyxJQUFBLFdBQUksRUFBQyxHQUFHLEVBQUUsWUFBWSxDQUFDLENBQUM7WUFDekMsVUFBVSxHQUFHLFVBQVUsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQzVDLEtBQUssQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUEsdUJBQVksRUFBQyxRQUFRLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUM1RCxDQUFDLENBQUMsQ0FBQztRQUNILEtBQUssQ0FBQyxhQUFhLENBQUM7WUFDaEIsSUFBSSxFQUFFLFlBQVk7WUFDbEIsV0FBVyxFQUFFLFNBQVM7WUFDdEIsa0JBQWtCLEVBQUU7Z0JBQ2hCLEtBQUssRUFBRSxDQUFDO2FBQ1g7U0FDSixDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBWSxFQUFFLEVBQUU7WUFDckIsSUFBQSx3QkFBYSxFQUFDLFVBQVUsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUNuQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUU7Z0JBQ3pCLElBQUEscUJBQVUsRUFBQyxPQUFPLENBQUMsQ0FBQztZQUN4QixDQUFDLENBQUMsQ0FBQztZQUNILE9BQU8sRUFBRSxDQUFDO1FBQ2QsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDLENBQUMsQ0FBQztBQUNQLENBQUM7QUFFRCxTQUFTLG1CQUFtQixDQUFDLE1BQWdCLEVBQUUsT0FBZTtJQUMxRCxNQUFNLE9BQU8sR0FBRyxJQUFBLHNCQUFXLEVBQUMsT0FBTyxDQUFDLENBQUM7SUFDckMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTtRQUNuQixNQUFNLFlBQVksR0FBRyxJQUFBLFdBQUksRUFBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDekMsTUFBTSxRQUFRLEdBQUcsSUFBQSxtQkFBUSxFQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ3hDLElBQUksUUFBUSxDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUM7WUFDekIsbUJBQW1CLENBQUMsTUFBTSxFQUFFLFlBQVksQ0FBQyxDQUFDO1FBQzlDLENBQUM7YUFDSSxDQUFDO1lBQ0YsTUFBTSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUM5QixDQUFDO0lBQ0wsQ0FBQyxDQUFDLENBQUM7QUFDUCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgcmVhZEZpbGVTeW5jLCB3cml0ZUZpbGVTeW5jLCByZW1vdmVTeW5jLCByZWFkZGlyU3luYywgc3RhdFN5bmMgfSBmcm9tICdmcy1leHRyYSc7XHJcbmltcG9ydCB7IHJlbGF0aXZlLCBqb2luLCBwYXJzZSB9IGZyb20gJ3BhdGgnO1xyXG5pbXBvcnQgSnNaaXAgZnJvbSAnanN6aXAnO1xyXG5pbXBvcnQgeyBCdWlsZEdsb2JhbEluZm8gfSBmcm9tICcuLi8uLi8uLi9zaGFyZS9nbG9iYWwnO1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY29tcHJlc3NEaXJzKGRpcm5hbWVzOiBzdHJpbmdbXSwgYmFzZXBhdGg6IHN0cmluZywgb3V0cHV0UGF0aDogc3RyaW5nKSB7XHJcbiAgICBhd2FpdCBuZXcgUHJvbWlzZTx2b2lkPihyZXNvbHZlID0+IHtcclxuICAgICAgICBjb25zdCBqc1ppcCA9IG5ldyBKc1ppcCgpO1xyXG4gICAgICAgIGNvbnN0IGZpbGVzVG9Db21wcmVzczogc3RyaW5nW10gPSBbXTtcclxuICAgICAgICBjb25zdCBkaXIgPSBwYXJzZShCdWlsZEdsb2JhbEluZm8uQlVORExFX1pJUF9OQU1FKS5uYW1lO1xyXG4gICAgICAgIGRpcm5hbWVzLmZvckVhY2goZGlybmFtZSA9PiB7XHJcbiAgICAgICAgICAgIGdldEZpbGVzSW5EaXJlY3RvcnkoZmlsZXNUb0NvbXByZXNzLCBkaXJuYW1lKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICAvLyBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy81NzE3NTg3MS9ob3ctdG8tbWFrZS1qc3ppcC1nZW5lcmF0ZS1zYW1lLWJ1ZmZlci81NzE3NzM3MSM1NzE3NzM3MT9uZXdyZWc9YjY5MGRmNWQwMzNkNDU3NmJiM2JlMjhmNmJiMDEwYWJcclxuICAgICAgICAvLyBodHRwczovL2Fkb3lsZS5tZS9ibG9nL3doeS16aXAtZmlsZS1jaGVja3N1bS1jaGFuZ2VkLmh0bWxcclxuICAgICAgICBjb25zdCBvcHRpb25zID0ge1xyXG4gICAgICAgICAgICBkYXRlOiBuZXcgRGF0ZSgnMjAyMS4wNi4yMSAwNjowMDowMFonKSxcclxuICAgICAgICAgICAgY3JlYXRlRm9sZGVyczogZmFsc2UsXHJcbiAgICAgICAgfTtcclxuICAgICAgICBmaWxlc1RvQ29tcHJlc3MuZm9yRWFjaChmaWxlcGF0aCA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IHJlbGF0aXZlUGF0aCA9IHJlbGF0aXZlKGJhc2VwYXRoLCBmaWxlcGF0aCk7XHJcbiAgICAgICAgICAgIGxldCB0YXJnZXRQYXRoID0gam9pbihkaXIsIHJlbGF0aXZlUGF0aCk7XHJcbiAgICAgICAgICAgIHRhcmdldFBhdGggPSB0YXJnZXRQYXRoLnJlcGxhY2UoL1xcXFwvZywgJy8nKTtcclxuICAgICAgICAgICAganNaaXAuZmlsZSh0YXJnZXRQYXRoLCByZWFkRmlsZVN5bmMoZmlsZXBhdGgpLCBvcHRpb25zKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBqc1ppcC5nZW5lcmF0ZUFzeW5jKHtcclxuICAgICAgICAgICAgdHlwZTogJ25vZGVidWZmZXInLFxyXG4gICAgICAgICAgICBjb21wcmVzc2lvbjogJ0RFRkxBVEUnLFxyXG4gICAgICAgICAgICBjb21wcmVzc2lvbk9wdGlvbnM6IHtcclxuICAgICAgICAgICAgICAgIGxldmVsOiA5LFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH0pLnRoZW4oKGNvbnRlbnQ6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICB3cml0ZUZpbGVTeW5jKG91dHB1dFBhdGgsIGNvbnRlbnQpO1xyXG4gICAgICAgICAgICBkaXJuYW1lcy5mb3JFYWNoKChkaXJuYW1lKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZW1vdmVTeW5jKGRpcm5hbWUpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgcmVzb2x2ZSgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEZpbGVzSW5EaXJlY3Rvcnkob3V0cHV0OiBzdHJpbmdbXSwgZGlybmFtZTogc3RyaW5nKSB7XHJcbiAgICBjb25zdCBkaXJsaXN0ID0gcmVhZGRpclN5bmMoZGlybmFtZSk7XHJcbiAgICBkaXJsaXN0LmZvckVhY2goaXRlbSA9PiB7XHJcbiAgICAgICAgY29uc3QgYWJzb2x1dGVQYXRoID0gam9pbihkaXJuYW1lLCBpdGVtKTtcclxuICAgICAgICBjb25zdCBzdGF0SW5mbyA9IHN0YXRTeW5jKGFic29sdXRlUGF0aCk7XHJcbiAgICAgICAgaWYgKHN0YXRJbmZvLmlzRGlyZWN0b3J5KCkpIHtcclxuICAgICAgICAgICAgZ2V0RmlsZXNJbkRpcmVjdG9yeShvdXRwdXQsIGFic29sdXRlUGF0aCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBvdXRwdXQucHVzaChhYnNvbHV0ZVBhdGgpO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG59Il19