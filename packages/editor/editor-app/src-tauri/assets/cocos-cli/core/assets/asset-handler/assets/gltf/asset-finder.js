"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultGltfAssetFinder = void 0;
const load_asset_sync_1 = require("../utils/load-asset-sync");
class DefaultGltfAssetFinder {
    _assetDetails;
    constructor(_assetDetails = {}) {
        this._assetDetails = _assetDetails;
    }
    serialize() {
        return this._assetDetails;
    }
    set(kind, values) {
        this._assetDetails[kind] = values;
    }
    find(kind, index, type) {
        const uuids = this._assetDetails[kind];
        if (uuids === undefined) {
            return null;
        }
        const detail = uuids[index];
        if (detail === null) {
            return null;
        }
        else {
            return (0, load_asset_sync_1.loadAssetSync)(detail, type) || null;
        }
    }
}
exports.DefaultGltfAssetFinder = DefaultGltfAssetFinder;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXNzZXQtZmluZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2NvcmUvYXNzZXRzL2Fzc2V0LWhhbmRsZXIvYXNzZXRzL2dsdGYvYXNzZXQtZmluZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUlBLDhEQUF5RDtBQUl6RCxNQUFhLHNCQUFzQjtJQUNYO0lBQXBCLFlBQW9CLGdCQUF1QyxFQUFFO1FBQXpDLGtCQUFhLEdBQWIsYUFBYSxDQUE0QjtJQUFHLENBQUM7SUFFMUQsU0FBUztRQUNaLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQztJQUM5QixDQUFDO0lBRU0sR0FBRyxDQUFDLElBQWtCLEVBQUUsTUFBNEI7UUFDdkQsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsR0FBRyxNQUFNLENBQUM7SUFDdEMsQ0FBQztJQUVNLElBQUksQ0FBcUIsSUFBa0IsRUFBRSxLQUFhLEVBQUUsSUFBb0I7UUFDbkYsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN2QyxJQUFJLEtBQUssS0FBSyxTQUFTLEVBQUUsQ0FBQztZQUN0QixPQUFPLElBQUksQ0FBQztRQUNoQixDQUFDO1FBQ0QsTUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzVCLElBQUksTUFBTSxLQUFLLElBQUksRUFBRSxDQUFDO1lBQ2xCLE9BQU8sSUFBSSxDQUFDO1FBQ2hCLENBQUM7YUFBTSxDQUFDO1lBQ0osT0FBTyxJQUFBLCtCQUFhLEVBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQztRQUMvQyxDQUFDO0lBQ0wsQ0FBQztDQUNKO0FBdkJELHdEQXVCQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNjIGZyb20gJ2NjJztcclxuaW1wb3J0IHsgQ29uc3RydWN0b3IgfSBmcm9tICdjYyc7XHJcbmltcG9ydCB7IFNlcmlhbGl6ZWRBc3NldEZpbmRlciB9IGZyb20gJy4uLy4uLy4uL0B0eXBlcy91c2VyRGF0YXMnO1xyXG5pbXBvcnQgeyBHbHRmQXNzZXRGaW5kZXJLaW5kLCBJR2x0ZkFzc2V0RmluZGVyIH0gZnJvbSAnLi4vdXRpbHMvZ2x0Zi1jb252ZXJ0ZXInO1xyXG5pbXBvcnQgeyBsb2FkQXNzZXRTeW5jIH0gZnJvbSAnLi4vdXRpbHMvbG9hZC1hc3NldC1zeW5jJztcclxuXHJcbmV4cG9ydCB0eXBlIE15RmluZGVyS2luZCA9IEdsdGZBc3NldEZpbmRlcktpbmQgfCAnc2NlbmVzJztcclxuXHJcbmV4cG9ydCBjbGFzcyBEZWZhdWx0R2x0ZkFzc2V0RmluZGVyIGltcGxlbWVudHMgSUdsdGZBc3NldEZpbmRlciB7XHJcbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9hc3NldERldGFpbHM6IFNlcmlhbGl6ZWRBc3NldEZpbmRlciA9IHt9KSB7fVxyXG5cclxuICAgIHB1YmxpYyBzZXJpYWxpemUoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2Fzc2V0RGV0YWlscztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc2V0KGtpbmQ6IE15RmluZGVyS2luZCwgdmFsdWVzOiBBcnJheTxzdHJpbmcgfCBudWxsPikge1xyXG4gICAgICAgIHRoaXMuX2Fzc2V0RGV0YWlsc1traW5kXSA9IHZhbHVlcztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZmluZDxUIGV4dGVuZHMgY2MuQXNzZXQ+KGtpbmQ6IE15RmluZGVyS2luZCwgaW5kZXg6IG51bWJlciwgdHlwZTogQ29uc3RydWN0b3I8VD4pOiBUIHwgbnVsbCB7XHJcbiAgICAgICAgY29uc3QgdXVpZHMgPSB0aGlzLl9hc3NldERldGFpbHNba2luZF07XHJcbiAgICAgICAgaWYgKHV1aWRzID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGRldGFpbCA9IHV1aWRzW2luZGV4XTtcclxuICAgICAgICBpZiAoZGV0YWlsID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBsb2FkQXNzZXRTeW5jKGRldGFpbCwgdHlwZSkgfHwgbnVsbDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIl19