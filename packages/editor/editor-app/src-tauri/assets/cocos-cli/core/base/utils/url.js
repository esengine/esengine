"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDocUrl = getDocUrl;
const urls = {
    manual: 'https://docs.cocos.com/creator/manual/zh/',
    api: 'https://docs.cocos.com/creator/api/zh/'
};
/**
 * 快捷获取文档路径
 * @param relativeUrl
 * @param type
 */
function getDocUrl(relativeUrl, type = 'manual') {
    if (!relativeUrl) {
        return '';
    }
    return new URL(relativeUrl, urls[type]).href;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXJsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvcmUvYmFzZS91dGlscy91cmwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFVQSw4QkFLQztBQWRELE1BQU0sSUFBSSxHQUFHO0lBQ1QsTUFBTSxFQUFFLDJDQUEyQztJQUNuRCxHQUFHLEVBQUUsd0NBQXdDO0NBQ2hELENBQUE7QUFDRDs7OztHQUlHO0FBQ0gsU0FBZ0IsU0FBUyxDQUFDLFdBQW1CLEVBQUUsT0FBeUIsUUFBUTtJQUM1RSxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDZixPQUFPLEVBQUUsQ0FBQztJQUNkLENBQUM7SUFDRCxPQUFPLElBQUksR0FBRyxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7QUFDakQsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIlxyXG5jb25zdCB1cmxzID0ge1xyXG4gICAgbWFudWFsOiAnaHR0cHM6Ly9kb2NzLmNvY29zLmNvbS9jcmVhdG9yL21hbnVhbC96aC8nLFxyXG4gICAgYXBpOiAnaHR0cHM6Ly9kb2NzLmNvY29zLmNvbS9jcmVhdG9yL2FwaS96aC8nXHJcbn1cclxuLyoqXHJcbiAqIOW/q+aNt+iOt+WPluaWh+aho+i3r+W+hFxyXG4gKiBAcGFyYW0gcmVsYXRpdmVVcmwgXHJcbiAqIEBwYXJhbSB0eXBlIFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGdldERvY1VybChyZWxhdGl2ZVVybDogc3RyaW5nLCB0eXBlOiAnbWFudWFsJyB8ICdhcGknID0gJ21hbnVhbCcpOiBzdHJpbmcge1xyXG4gICAgaWYgKCFyZWxhdGl2ZVVybCkge1xyXG4gICAgICAgIHJldHVybiAnJztcclxuICAgIH1cclxuICAgIHJldHVybiBuZXcgVVJMKHJlbGF0aXZlVXJsLCB1cmxzW3R5cGVdKS5ocmVmO1xyXG59XHJcbiJdfQ==