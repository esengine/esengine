"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.listenModuleMessages = listenModuleMessages;
async function listenModuleMessages() {
    const { default: scriptManager } = await Promise.resolve().then(() => __importStar(require('../../scripting')));
    const { assetManager } = await Promise.resolve().then(() => __importStar(require('../../assets')));
    const { ScriptProxy } = await Promise.resolve().then(() => __importStar(require('./proxy/script-proxy')));
    const { AssetProxy } = await Promise.resolve().then(() => __importStar(require('./proxy/asset-proxy')));
    scriptManager.on('pack-build-end', (targetName) => {
        if (targetName === 'editor') {
            void ScriptProxy.investigatePackerDriver();
        }
    });
    assetManager.on('asset-add', async (asset) => {
        switch (asset.meta.importer) {
            case 'typescript':
            case 'javascript':
                void ScriptProxy.loadScript();
                break;
        }
    });
    assetManager.on('asset-change', (asset) => {
        switch (asset.meta.importer) {
            case 'typescript':
            case 'javascript': {
                void ScriptProxy.scriptChange();
                break;
            }
        }
        AssetProxy.assetChanged(asset.uuid).catch((err) => { });
    });
    assetManager.on('asset-delete', (asset) => {
        switch (asset.meta.importer) {
            case 'typescript':
            case 'javascript': {
                void ScriptProxy.removeScript();
                break;
            }
        }
        AssetProxy.assetDeleted(asset.uuid).catch((err) => { });
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVzc2FnZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29yZS9zY2VuZS9tYWluLXByb2Nlc3MvbWVzc2FnZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFQSxvREEwQ0M7QUExQ00sS0FBSyxVQUFVLG9CQUFvQjtJQUN0QyxNQUFNLEVBQUUsT0FBTyxFQUFFLGFBQWEsRUFBRSxHQUFHLHdEQUFhLGlCQUFpQixHQUFDLENBQUM7SUFDbkUsTUFBTSxFQUFFLFlBQVksRUFBRSxHQUFHLHdEQUFhLGNBQWMsR0FBQyxDQUFDO0lBQ3RELE1BQU0sRUFBRSxXQUFXLEVBQUUsR0FBRyx3REFBYSxzQkFBc0IsR0FBQyxDQUFDO0lBQzdELE1BQU0sRUFBRSxVQUFVLEVBQUUsR0FBRyx3REFBYSxxQkFBcUIsR0FBQyxDQUFDO0lBRTNELGFBQWEsQ0FBQyxFQUFFLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxVQUFrQixFQUFFLEVBQUU7UUFDdEQsSUFBSSxVQUFVLEtBQUssUUFBUSxFQUFFLENBQUM7WUFDMUIsS0FBSyxXQUFXLENBQUMsdUJBQXVCLEVBQUUsQ0FBQztRQUMvQyxDQUFDO0lBQ0wsQ0FBQyxDQUFDLENBQUM7SUFFSCxZQUFZLENBQUMsRUFBRSxDQUFDLFdBQVcsRUFBRSxLQUFLLEVBQUUsS0FBYSxFQUFFLEVBQUU7UUFDakQsUUFBUSxLQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQzFCLEtBQUssWUFBWSxDQUFDO1lBQ2xCLEtBQUssWUFBWTtnQkFDYixLQUFLLFdBQVcsQ0FBQyxVQUFVLEVBQUUsQ0FBQztnQkFDOUIsTUFBTTtRQUNkLENBQUM7SUFDTCxDQUFDLENBQUMsQ0FBQztJQUVILFlBQVksQ0FBQyxFQUFFLENBQUMsY0FBYyxFQUFFLENBQUMsS0FBYSxFQUFFLEVBQUU7UUFDOUMsUUFBUSxLQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQzFCLEtBQUssWUFBWSxDQUFDO1lBQ2xCLEtBQUssWUFBWSxDQUFDLENBQUMsQ0FBQztnQkFDaEIsS0FBSyxXQUFXLENBQUMsWUFBWSxFQUFFLENBQUM7Z0JBQ2hDLE1BQU07WUFDVixDQUFDO1FBQ0wsQ0FBQztRQUNELFVBQVUsQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFLEdBQUUsQ0FBQyxDQUFDLENBQUM7SUFDM0QsQ0FBQyxDQUFDLENBQUM7SUFFSCxZQUFZLENBQUMsRUFBRSxDQUFDLGNBQWMsRUFBRSxDQUFDLEtBQWEsRUFBRSxFQUFFO1FBQzlDLFFBQVEsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUMxQixLQUFLLFlBQVksQ0FBQztZQUNsQixLQUFLLFlBQVksQ0FBQyxDQUFDLENBQUM7Z0JBQ2hCLEtBQUssV0FBVyxDQUFDLFlBQVksRUFBRSxDQUFDO2dCQUNoQyxNQUFNO1lBQ1YsQ0FBQztRQUNMLENBQUM7UUFDRCxVQUFVLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxHQUFFLENBQUMsQ0FBQyxDQUFDO0lBQzNELENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHsgSUFzc2V0IH0gZnJvbSAnLi4vLi4vYXNzZXRzL0B0eXBlcy9wcm90ZWN0ZWQvYXNzZXQnO1xyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGxpc3Rlbk1vZHVsZU1lc3NhZ2VzKCkge1xyXG4gICAgY29uc3QgeyBkZWZhdWx0OiBzY3JpcHRNYW5hZ2VyIH0gPSBhd2FpdCBpbXBvcnQoJy4uLy4uL3NjcmlwdGluZycpO1xyXG4gICAgY29uc3QgeyBhc3NldE1hbmFnZXIgfSA9IGF3YWl0IGltcG9ydCgnLi4vLi4vYXNzZXRzJyk7XHJcbiAgICBjb25zdCB7IFNjcmlwdFByb3h5IH0gPSBhd2FpdCBpbXBvcnQoJy4vcHJveHkvc2NyaXB0LXByb3h5Jyk7XHJcbiAgICBjb25zdCB7IEFzc2V0UHJveHkgfSA9IGF3YWl0IGltcG9ydCgnLi9wcm94eS9hc3NldC1wcm94eScpO1xyXG5cclxuICAgIHNjcmlwdE1hbmFnZXIub24oJ3BhY2stYnVpbGQtZW5kJywgKHRhcmdldE5hbWU6IHN0cmluZykgPT4ge1xyXG4gICAgICAgIGlmICh0YXJnZXROYW1lID09PSAnZWRpdG9yJykge1xyXG4gICAgICAgICAgICB2b2lkIFNjcmlwdFByb3h5LmludmVzdGlnYXRlUGFja2VyRHJpdmVyKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgYXNzZXRNYW5hZ2VyLm9uKCdhc3NldC1hZGQnLCBhc3luYyAoYXNzZXQ6IElBc3NldCkgPT4ge1xyXG4gICAgICAgIHN3aXRjaCAoYXNzZXQubWV0YS5pbXBvcnRlcikge1xyXG4gICAgICAgICAgICBjYXNlICd0eXBlc2NyaXB0JzpcclxuICAgICAgICAgICAgY2FzZSAnamF2YXNjcmlwdCc6XHJcbiAgICAgICAgICAgICAgICB2b2lkIFNjcmlwdFByb3h5LmxvYWRTY3JpcHQoKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIGFzc2V0TWFuYWdlci5vbignYXNzZXQtY2hhbmdlJywgKGFzc2V0OiBJQXNzZXQpID0+IHtcclxuICAgICAgICBzd2l0Y2ggKGFzc2V0Lm1ldGEuaW1wb3J0ZXIpIHtcclxuICAgICAgICAgICAgY2FzZSAndHlwZXNjcmlwdCc6XHJcbiAgICAgICAgICAgIGNhc2UgJ2phdmFzY3JpcHQnOiB7XHJcbiAgICAgICAgICAgICAgICB2b2lkIFNjcmlwdFByb3h5LnNjcmlwdENoYW5nZSgpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgQXNzZXRQcm94eS5hc3NldENoYW5nZWQoYXNzZXQudXVpZCkuY2F0Y2goKGVycikgPT4ge30pO1xyXG4gICAgfSk7XHJcblxyXG4gICAgYXNzZXRNYW5hZ2VyLm9uKCdhc3NldC1kZWxldGUnLCAoYXNzZXQ6IElBc3NldCkgPT4ge1xyXG4gICAgICAgIHN3aXRjaCAoYXNzZXQubWV0YS5pbXBvcnRlcikge1xyXG4gICAgICAgICAgICBjYXNlICd0eXBlc2NyaXB0JzpcclxuICAgICAgICAgICAgY2FzZSAnamF2YXNjcmlwdCc6IHtcclxuICAgICAgICAgICAgICAgIHZvaWQgU2NyaXB0UHJveHkucmVtb3ZlU2NyaXB0KCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBBc3NldFByb3h5LmFzc2V0RGVsZXRlZChhc3NldC51dWlkKS5jYXRjaCgoZXJyKSA9PiB7fSk7XHJcbiAgICB9KTtcclxufVxyXG4iXX0=