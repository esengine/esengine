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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
exports.default = {
    get: [
        {
            // TODO 这里后续需要改引擎 wasm/wasm-nodejs.ts 的写法，改成向服务器请求数据
            url: '/engine_external/',
            async handler(req, res) {
                const url = req.query.url;
                const externalProtocol = 'external:';
                if (typeof url === 'string' && url.startsWith(externalProtocol)) {
                    const { Engine } = await Promise.resolve().then(() => __importStar(require('../engine')));
                    const nativeEnginePath = Engine.getInfo().native.path;
                    const externalFilePath = url.replace(externalProtocol, path_1.default.join(nativeEnginePath, 'external/'));
                    const arrayBuffer = await fs_extra_1.default.readFile(externalFilePath);
                    res.status(200).send(arrayBuffer);
                }
                else {
                    res.status(404).send(`请求 external 资源失败，请使用 external 协议: ${req.url}`);
                }
            },
        },
        {
            url: '/query-extname/:uuid',
            async handler(req, res) {
                const uuid = req.params.uuid;
                const { assetManager } = await Promise.resolve().then(() => __importStar(require('../assets')));
                const assetInfo = assetManager.queryAssetInfo(uuid);
                if (assetInfo && assetInfo.library['.bin'] && Object.keys(assetInfo.library).length === 1) {
                    res.status(200).send('.cconb');
                }
                else {
                    res.status(200).send('');
                }
            },
        },
        {
            url: '/:dir/:uuid/:nativeName.:ext',
            async handler(req, res, next) {
                if (req.params.dir === 'build' || req.params.dir === 'mcp') {
                    return next();
                }
                const { uuid, ext, nativeName } = req.params;
                const { assetManager } = await Promise.resolve().then(() => __importStar(require('../assets')));
                const assetInfo = assetManager.queryAssetInfo(uuid);
                const filePath = assetInfo && assetInfo.library[`${nativeName}.${ext}`];
                if (!filePath) {
                    console.warn(`Asset not found: ${req.url}`);
                    return res.status(404).json({
                        error: 'Asset not found',
                        requested: req.url,
                        uuid,
                        file: `${nativeName}.${ext}`
                    });
                }
                res.status(200).send(filePath || req.url);
            },
        },
        {
            url: '/:dir/:uuid.:ext',
            async handler(req, res) {
                const { uuid, ext } = req.params;
                const { assetManager } = await Promise.resolve().then(() => __importStar(require('../assets')));
                const assetInfo = assetManager.queryAssetInfo(uuid);
                const filePath = assetInfo && assetInfo.library[`.${ext}`];
                if (!filePath) {
                    console.warn(`Asset not found: ${req.url}`);
                    return res.status(404).json({
                        error: 'Asset not found',
                        requested: req.url,
                        uuid,
                    });
                }
                res.status(200).send(filePath || req.url);
            },
        }
    ],
    post: [],
    staticFiles: [],
    socket: {
        connection: (socket) => { },
        disconnect: (socket) => { }
    },
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NlbmUubWlkZGxld2FyZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlL3NjZW5lL3NjZW5lLm1pZGRsZXdhcmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFQSxnREFBd0I7QUFDeEIsd0RBQTJCO0FBRTNCLGtCQUFlO0lBQ1gsR0FBRyxFQUFFO1FBQ0Q7WUFDSSxvREFBb0Q7WUFDcEQsR0FBRyxFQUFFLG1CQUFtQjtZQUN4QixLQUFLLENBQUMsT0FBTyxDQUFDLEdBQVksRUFBRSxHQUFhO2dCQUNyQyxNQUFNLEdBQUcsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQztnQkFDMUIsTUFBTSxnQkFBZ0IsR0FBRyxXQUFXLENBQUM7Z0JBQ3JDLElBQUksT0FBTyxHQUFHLEtBQUssUUFBUSxJQUFJLEdBQUcsQ0FBQyxVQUFVLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxDQUFDO29CQUM5RCxNQUFNLEVBQUUsTUFBTSxFQUFFLEdBQUcsd0RBQWEsV0FBVyxHQUFDLENBQUM7b0JBQzdDLE1BQU0sZ0JBQWdCLEdBQUcsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7b0JBQ3RELE1BQU0sZ0JBQWdCLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsRUFBRSxjQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUM7b0JBQ2pHLE1BQU0sV0FBVyxHQUFHLE1BQU0sa0JBQUcsQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztvQkFDekQsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBQ3RDLENBQUM7cUJBQU0sQ0FBQztvQkFDSixHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFD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LENBQUM7Z0JBQzNELElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztvQkFDWixPQUFPLENBQUMsSUFBSSxDQUFDLG9CQUFvQixHQUFHLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztvQkFDNUMsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQzt3QkFDeEIsS0FBSyxFQUFFLGlCQUFpQjt3QkFDeEIsU0FBUyxFQUFFLEdBQUcsQ0FBQyxHQUFHO3dCQUNsQixJQUFJO3FCQUNQLENBQUMsQ0FBQztnQkFDUCxDQUFDO2dCQUNELEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsSUFBSSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDOUMsQ0FBQztTQUNKO0tBQ0o7SUFDRCxJQUFJLEVBQUUsRUFBRTtJQUNSLFdBQVcsRUFBRSxFQUFFO0lBQ2YsTUFBTSxFQUFFO1FBQ0osVUFBVSxFQUFFLENBQUMsTUFBVyxFQUFFLEVBQUUsR0FBRyxDQUFDO1FBQ2hDLFVBQVUsRUFBRSxDQUFDLE1BQVcsRUFBRSxFQUFFLEdBQUcsQ0FBQztLQUNuQztDQUN1QixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBJTWlkZGxld2FyZUNvbnRyaWJ1dGlvbiB9IGZyb20gJy4uLy4uL3NlcnZlci9pbnRlcmZhY2VzJztcclxuaW1wb3J0IHsgUmVxdWVzdCwgUmVzcG9uc2UsIE5leHRGdW5jdGlvbiB9IGZyb20gJ2V4cHJlc3MnO1xyXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcclxuaW1wb3J0IGZzZSBmcm9tICdmcy1leHRyYSc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgICBnZXQ6IFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIC8vIFRPRE8g6L+Z6YeM5ZCO57ut6ZyA6KaB5pS55byV5pOOIHdhc20vd2FzbS1ub2RlanMudHMg55qE5YaZ5rOV77yM5pS55oiQ5ZCR5pyN5Yqh5Zmo6K+35rGC5pWw5o2uXHJcbiAgICAgICAgICAgIHVybDogJy9lbmdpbmVfZXh0ZXJuYWwvJyxcclxuICAgICAgICAgICAgYXN5bmMgaGFuZGxlcihyZXE6IFJlcXVlc3QsIHJlczogUmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHVybCA9IHJlcS5xdWVyeS51cmw7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBleHRlcm5hbFByb3RvY29sID0gJ2V4dGVybmFsOic7XHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHVybCA9PT0gJ3N0cmluZycgJiYgdXJsLnN0YXJ0c1dpdGgoZXh0ZXJuYWxQcm90b2NvbCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCB7IEVuZ2luZSB9ID0gYXdhaXQgaW1wb3J0KCcuLi9lbmdpbmUnKTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBuYXRpdmVFbmdpbmVQYXRoID0gRW5naW5lLmdldEluZm8oKS5uYXRpdmUucGF0aDtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBleHRlcm5hbEZpbGVQYXRoID0gdXJsLnJlcGxhY2UoZXh0ZXJuYWxQcm90b2NvbCwgcGF0aC5qb2luKG5hdGl2ZUVuZ2luZVBhdGgsICdleHRlcm5hbC8nKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYXJyYXlCdWZmZXIgPSBhd2FpdCBmc2UucmVhZEZpbGUoZXh0ZXJuYWxGaWxlUGF0aCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzLnN0YXR1cygyMDApLnNlbmQoYXJyYXlCdWZmZXIpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICByZXMuc3RhdHVzKDQwNCkuc2VuZChg6K+35rGCIGV4dGVybmFsIOi1hOa6kOWksei0pe+8jOivt+S9v+eUqCBleHRlcm5hbCDljY/orq46ICR7cmVxLnVybH1gKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdXJsOiAnL3F1ZXJ5LWV4dG5hbWUvOnV1aWQnLFxyXG4gICAgICAgICAgICBhc3luYyBoYW5kbGVyKHJlcTogUmVxdWVzdCwgcmVzOiBSZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgdXVpZCA9IHJlcS5wYXJhbXMudXVpZDtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHsgYXNzZXRNYW5hZ2VyIH0gPSBhd2FpdCBpbXBvcnQoJy4uL2Fzc2V0cycpO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgYXNzZXRJbmZvID0gYXNzZXRNYW5hZ2VyLnF1ZXJ5QXNzZXRJbmZvKHV1aWQpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGFzc2V0SW5mbyAmJiBhc3NldEluZm8ubGlicmFyeVsnLmJpbiddICYmIE9iamVjdC5rZXlzKGFzc2V0SW5mby5saWJyYXJ5KS5sZW5ndGggPT09IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXMuc3RhdHVzKDIwMCkuc2VuZCgnLmNjb25iJyk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlcy5zdGF0dXMoMjAwKS5zZW5kKCcnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdXJsOiAnLzpkaXIvOnV1aWQvOm5hdGl2ZU5hbWUuOmV4dCcsXHJcbiAgICAgICAgICAgIGFzeW5jIGhhbmRsZXIocmVxOiBSZXF1ZXN0LCByZXM6IFJlc3BvbnNlLCBuZXh0OiBOZXh0RnVuY3Rpb24pIHtcclxuICAgICAgICAgICAgICAgIGlmIChyZXEucGFyYW1zLmRpciA9PT0gJ2J1aWxkJyB8fCByZXEucGFyYW1zLmRpciA9PT0gJ21jcCcpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV4dCgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY29uc3QgeyB1dWlkLCBleHQsIG5hdGl2ZU5hbWUgfSA9IHJlcS5wYXJhbXM7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB7IGFzc2V0TWFuYWdlciB9ID0gYXdhaXQgaW1wb3J0KCcuLi9hc3NldHMnKTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGFzc2V0SW5mbyA9IGFzc2V0TWFuYWdlci5xdWVyeUFzc2V0SW5mbyh1dWlkKTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGZpbGVQYXRoID0gYXNzZXRJbmZvICYmIGFzc2V0SW5mby5saWJyYXJ5W2Ake25hdGl2ZU5hbWV9LiR7ZXh0fWBdO1xyXG4gICAgICAgICAgICAgICAgaWYgKCFmaWxlUGF0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgQXNzZXQgbm90IGZvdW5kOiAke3JlcS51cmx9YCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDA0KS5qc29uKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6ICdBc3NldCBub3QgZm91bmQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXF1ZXN0ZWQ6IHJlcS51cmwsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHV1aWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGU6IGAke25hdGl2ZU5hbWV9LiR7ZXh0fWBcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJlcy5zdGF0dXMoMjAwKS5zZW5kKGZpbGVQYXRoIHx8IHJlcS51cmwpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB1cmw6ICcvOmRpci86dXVpZC46ZXh0JyxcclxuICAgICAgICAgICAgYXN5bmMgaGFuZGxlcihyZXE6IFJlcXVlc3QsIHJlczogUmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHsgdXVpZCwgZXh0IH0gPSByZXEucGFyYW1zO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgeyBhc3NldE1hbmFnZXIgfSA9IGF3YWl0IGltcG9ydCgnLi4vYXNzZXRzJyk7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBhc3NldEluZm8gPSBhc3NldE1hbmFnZXIucXVlcnlBc3NldEluZm8odXVpZCk7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBmaWxlUGF0aCA9IGFzc2V0SW5mbyAmJiBhc3NldEluZm8ubGlicmFyeVtgLiR7ZXh0fWBdO1xyXG4gICAgICAgICAgICAgICAgaWYgKCFmaWxlUGF0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgQXNzZXQgbm90IGZvdW5kOiAke3JlcS51cmx9YCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDA0KS5qc29uKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6ICdBc3NldCBub3QgZm91bmQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXF1ZXN0ZWQ6IHJlcS51cmwsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHV1aWQsXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXMuc3RhdHVzKDIwMCkuc2VuZChmaWxlUGF0aCB8fCByZXEudXJsKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9XHJcbiAgICBdLFxyXG4gICAgcG9zdDogW10sXHJcbiAgICBzdGF0aWNGaWxlczogW10sXHJcbiAgICBzb2NrZXQ6IHtcclxuICAgICAgICBjb25uZWN0aW9uOiAoc29ja2V0OiBhbnkpID0+IHsgfSxcclxuICAgICAgICBkaXNjb25uZWN0OiAoc29ja2V0OiBhbnkpID0+IHsgfVxyXG4gICAgfSxcclxufSBhcyBJTWlkZGxld2FyZUNvbnRyaWJ1dGlvbjtcclxuIl19