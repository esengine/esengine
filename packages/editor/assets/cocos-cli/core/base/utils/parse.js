'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.compareVersion = compareVersion;
/**
 * return result of versionMax > versionMin，其中仅支持纯数字版本，最高支持三位数版本号：333.666.345
 * @example (3.6.2, 3.7.0) => false; (3.9.0, 3.8.0) => true; (3.8.0, 3.8.0) => false;
 * @param versionMax
 * @param versionMin
 * @param split
 */
function compareVersion(versionMax, versionMin, split = '.') {
    if (typeof versionMax !== 'string' || typeof versionMin !== 'string') {
        throw new Error(`invalid param: ${versionMax}, ${versionMin}`);
    }
    versionMax = versionMax.replace(split, '').padStart(3, '0');
    versionMin = versionMin.replace(split, '').padStart(3, '0');
    return Number(versionMax) > Number(versionMin);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29yZS9iYXNlL3V0aWxzL3BhcnNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7QUFTYix3Q0FPQztBQWREOzs7Ozs7R0FNRztBQUNILFNBQWdCLGNBQWMsQ0FBQyxVQUFrQixFQUFFLFVBQWtCLEVBQUUsS0FBSyxHQUFHLEdBQUc7SUFDOUUsSUFBSSxPQUFPLFVBQVUsS0FBSyxRQUFRLElBQUksT0FBTyxVQUFVLEtBQUssUUFBUSxFQUFFLENBQUM7UUFDbkUsTUFBTSxJQUFJLEtBQUssQ0FBQyxrQkFBa0IsVUFBVSxLQUFLLFVBQVUsRUFBRSxDQUFDLENBQUM7SUFDbkUsQ0FBQztJQUNELFVBQVUsR0FBRyxVQUFVLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQzVELFVBQVUsR0FBRyxVQUFVLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQzVELE9BQU8sTUFBTSxDQUFDLFVBQVUsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUNuRCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xyXG5cclxuLyoqXHJcbiAqIHJldHVybiByZXN1bHQgb2YgdmVyc2lvbk1heCA+IHZlcnNpb25NaW7vvIzlhbbkuK3ku4XmlK/mjIHnuq/mlbDlrZfniYjmnKzvvIzmnIDpq5jmlK/mjIHkuInkvY3mlbDniYjmnKzlj7fvvJozMzMuNjY2LjM0NVxyXG4gKiBAZXhhbXBsZSAoMy42LjIsIDMuNy4wKSA9PiBmYWxzZTsgKDMuOS4wLCAzLjguMCkgPT4gdHJ1ZTsgKDMuOC4wLCAzLjguMCkgPT4gZmFsc2U7XHJcbiAqIEBwYXJhbSB2ZXJzaW9uTWF4XHJcbiAqIEBwYXJhbSB2ZXJzaW9uTWluXHJcbiAqIEBwYXJhbSBzcGxpdFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGNvbXBhcmVWZXJzaW9uKHZlcnNpb25NYXg6IHN0cmluZywgdmVyc2lvbk1pbjogc3RyaW5nLCBzcGxpdCA9ICcuJykge1xyXG4gICAgaWYgKHR5cGVvZiB2ZXJzaW9uTWF4ICE9PSAnc3RyaW5nJyB8fCB0eXBlb2YgdmVyc2lvbk1pbiAhPT0gJ3N0cmluZycpIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYGludmFsaWQgcGFyYW06ICR7dmVyc2lvbk1heH0sICR7dmVyc2lvbk1pbn1gKTtcclxuICAgIH1cclxuICAgIHZlcnNpb25NYXggPSB2ZXJzaW9uTWF4LnJlcGxhY2Uoc3BsaXQsICcnKS5wYWRTdGFydCgzLCAnMCcpO1xyXG4gICAgdmVyc2lvbk1pbiA9IHZlcnNpb25NaW4ucmVwbGFjZShzcGxpdCwgJycpLnBhZFN0YXJ0KDMsICcwJyk7XHJcbiAgICByZXR1cm4gTnVtYmVyKHZlcnNpb25NYXgpID4gTnVtYmVyKHZlcnNpb25NaW4pO1xyXG59XHJcbiJdfQ==