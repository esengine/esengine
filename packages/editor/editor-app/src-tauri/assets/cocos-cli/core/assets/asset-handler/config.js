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
exports.assetHandlerInfos = void 0;
exports.assetHandlerInfos = [
    {
        name: 'directory',
        extensions: ['*'],
        load: async () => {
            return (await Promise.resolve().then(() => __importStar(require('./assets/directory')))).default;
        }
    },
    {
        name: 'unknown',
        extensions: ['*'],
        load: async () => {
            return (await Promise.resolve().then(() => __importStar(require('./assets/unknown')))).default;
        }
    },
    {
        name: 'text',
        extensions: [
            '.txt',
            '.html',
            '.htm',
            '.xml',
            '.css',
            '.less',
            '.scss',
            '.stylus',
            '.yaml',
            '.ini',
            '.csv',
            '.proto',
            '.ts',
            '.tsx',
            '.md',
            '.markdown'
        ],
        load: async () => {
            return (await Promise.resolve().then(() => __importStar(require('./assets/text')))).default;
        }
    },
    {
        name: 'json',
        extensions: ['.json'],
        load: async () => {
            return (await Promise.resolve().then(() => __importStar(require('./assets/json')))).default;
        }
    },
    {
        name: 'spine-data',
        extensions: ['.json', '.skel'],
        load: async () => {
            return (await Promise.resolve().then(() => __importStar(require('./assets/spine')))).default;
        }
    },
    {
        name: 'dragonbones',
        extensions: ['.json', '.dbbin'],
        load: async () => {
            return (await Promise.resolve().then(() => __importStar(require('./assets/dragonbones/dragonbones')))).default;
        }
    },
    {
        name: 'dragonbones-atlas',
        extensions: ['.json'],
        load: async () => {
            return (await Promise.resolve().then(() => __importStar(require('./assets/dragonbones/dragonbones-atlas')))).default;
        }
    },
    {
        name: 'terrain',
        extensions: ['.terrain'],
        load: async () => {
            return (await Promise.resolve().then(() => __importStar(require('./assets/terrain')))).default;
        }
    },
    {
        name: 'javascript',
        extensions: ['.js', '.cjs', '.mjs'],
        load: async () => {
            return (await Promise.resolve().then(() => __importStar(require('./assets/javascript')))).default;
        }
    },
    {
        name: 'typescript',
        extensions: ['.ts'],
        load: async () => {
            return (await Promise.resolve().then(() => __importStar(require('./assets/typescript')))).default;
        }
    },
    {
        name: 'scene',
        extensions: ['.scene', '.fire'],
        load: async () => {
            return (await Promise.resolve().then(() => __importStar(require('./assets/scene')))).default;
        }
    },
    {
        name: 'prefab',
        extensions: ['.prefab'],
        load: async () => {
            return (await Promise.resolve().then(() => __importStar(require('./assets/scene/prefab')))).default;
        }
    },
    {
        name: 'sprite-frame',
        extensions: [],
        load: async () => {
            return (await Promise.resolve().then(() => __importStar(require('./assets/sprite-frame')))).default;
        }
    },
    {
        name: 'tiled-map',
        extensions: ['.tmx'],
        load: async () => {
            return (await Promise.resolve().then(() => __importStar(require('./assets/tiled-map')))).default;
        }
    },
    {
        name: 'buffer',
        extensions: ['.bin'],
        load: async () => {
            return (await Promise.resolve().then(() => __importStar(require('./assets/buffer')))).default;
        }
    },
    {
        name: 'image',
        extensions: [
            '.jpg',
            '.png',
            '.jpeg',
            '.webp',
            '.tga',
            '.hdr',
            '.bmp',
            '.psd',
            '.tif',
            '.tiff',
            '.exr',
            '.znt'
        ],
        load: async () => {
            return (await Promise.resolve().then(() => __importStar(require('./assets/image')))).default;
        }
    },
    {
        name: 'sign-image',
        extensions: [],
        load: async () => {
            return (await Promise.resolve().then(() => __importStar(require('./assets/image/sign')))).default;
        }
    },
    {
        name: 'alpha-image',
        extensions: [],
        load: async () => {
            return (await Promise.resolve().then(() => __importStar(require('./assets/image/alpha')))).default;
        }
    },
    {
        name: 'texture',
        extensions: ['.texture'],
        load: async () => {
            return (await Promise.resolve().then(() => __importStar(require('./assets/texture')))).default;
        }
    },
    {
        name: 'texture-cube',
        extensions: ['.cubemap'],
        load: async () => {
            return (await Promise.resolve().then(() => __importStar(require('./assets/texture-cube')))).default;
        }
    },
    {
        name: 'erp-texture-cube',
        extensions: [],
        load: async () => {
            return (await Promise.resolve().then(() => __importStar(require('./assets/erp-texture-cube')))).default;
        }
    },
    {
        name: 'render-texture',
        extensions: ['.rt'],
        load: async () => {
            return (await Promise.resolve().then(() => __importStar(require('./assets/render-texture')))).default;
        }
    },
    {
        name: 'texture-cube-face',
        extensions: [],
        load: async () => {
            return (await Promise.resolve().then(() => __importStar(require('./assets/texture-cube-face')))).default;
        }
    },
    {
        name: 'rt-sprite-frame',
        extensions: [],
        load: async () => {
            return (await Promise.resolve().then(() => __importStar(require('./assets/render-texture/rt-sprite-frame')))).default;
        }
    },
    {
        name: 'gltf',
        extensions: ['.gltf', '.glb'],
        load: async () => {
            return (await Promise.resolve().then(() => __importStar(require('./assets/gltf')))).default;
        }
    },
    {
        name: 'gltf-mesh',
        extensions: [],
        load: async () => {
            return (await Promise.resolve().then(() => __importStar(require('./assets/gltf/mesh')))).default;
        }
    },
    {
        name: 'gltf-animation',
        extensions: [],
        load: async () => {
            return (await Promise.resolve().then(() => __importStar(require('./assets/gltf/animation')))).default;
        }
    },
    {
        name: 'gltf-skeleton',
        extensions: [],
        load: async () => {
            return (await Promise.resolve().then(() => __importStar(require('./assets/gltf/skeleton')))).default;
        }
    },
    {
        name: 'gltf-material',
        extensions: [],
        load: async () => {
            return (await Promise.resolve().then(() => __importStar(require('./assets/gltf/material')))).default;
        }
    },
    {
        name: 'gltf-scene',
        extensions: [],
        load: async () => {
            return (await Promise.resolve().then(() => __importStar(require('./assets/gltf/prefab')))).default;
        }
    },
    {
        name: 'gltf-embeded-image',
        extensions: [],
        load: async () => {
            return (await Promise.resolve().then(() => __importStar(require('./assets/gltf/image')))).default;
        }
    },
    {
        name: 'fbx',
        extensions: ['.fbx'],
        load: async () => {
            return (await Promise.resolve().then(() => __importStar(require('./assets/fbx')))).default;
        }
    },
    {
        name: 'material',
        extensions: ['.mtl'],
        load: async () => {
            return (await Promise.resolve().then(() => __importStar(require('./assets/material')))).default;
        }
    },
    {
        name: 'physics-material',
        extensions: ['.pmtl'],
        load: async () => {
            return (await Promise.resolve().then(() => __importStar(require('./assets/physics-material')))).default;
        }
    },
    {
        name: 'effect',
        extensions: ['.effect'],
        load: async () => {
            return (await Promise.resolve().then(() => __importStar(require('./assets/effect')))).default;
        }
    },
    {
        name: 'effect-header',
        extensions: ['.chunk'],
        load: async () => {
            return (await Promise.resolve().then(() => __importStar(require('./assets/effect-header')))).default;
        }
    },
    {
        name: 'audio-clip',
        extensions: [
            '.mp3',
            '.wav',
            '.ogg',
            '.aac',
            '.pcm',
            '.m4a'
        ],
        load: async () => {
            return (await Promise.resolve().then(() => __importStar(require('./assets/audio-clip')))).default;
        }
    },
    {
        name: 'animation-clip',
        extensions: ['.anim'],
        load: async () => {
            return (await Promise.resolve().then(() => __importStar(require('./assets/animation-clip')))).default;
        }
    },
    {
        name: 'animation-graph',
        extensions: ['.animgraph'],
        load: async () => {
            return (await Promise.resolve().then(() => __importStar(require('./assets/animation-graph')))).default;
        }
    },
    {
        name: 'animation-graph-variant',
        extensions: ['.animgraphvari'],
        load: async () => {
            return (await Promise.resolve().then(() => __importStar(require('./assets/animation-graph-variant')))).default;
        }
    },
    {
        name: 'animation-mask',
        extensions: ['.animask'],
        load: async () => {
            return (await Promise.resolve().then(() => __importStar(require('./assets/animation-mask')))).default;
        }
    },
    {
        name: 'ttf-font',
        extensions: ['.ttf'],
        load: async () => {
            return (await Promise.resolve().then(() => __importStar(require('./assets/ttf-font')))).default;
        }
    },
    {
        name: 'bitmap-font',
        extensions: ['.fnt'],
        load: async () => {
            return (await Promise.resolve().then(() => __importStar(require('./assets/bitmap-font')))).default;
        }
    },
    {
        name: 'particle',
        extensions: ['.plist'],
        load: async () => {
            return (await Promise.resolve().then(() => __importStar(require('./assets/particle')))).default;
        }
    },
    {
        name: 'sprite-atlas',
        extensions: ['.plist'],
        load: async () => {
            return (await Promise.resolve().then(() => __importStar(require('./assets/texture-packer')))).default;
        }
    },
    {
        name: 'auto-atlas',
        extensions: ['.pac'],
        load: async () => {
            return (await Promise.resolve().then(() => __importStar(require('./assets/auto-atlas')))).default;
        }
    },
    {
        name: 'label-atlas',
        extensions: ['.labelatlas'],
        load: async () => {
            return (await Promise.resolve().then(() => __importStar(require('./assets/label-atlas')))).default;
        }
    },
    {
        name: 'render-pipeline',
        extensions: ['.rpp'],
        load: async () => {
            return (await Promise.resolve().then(() => __importStar(require('./assets/render-pipeline')))).default;
        }
    },
    {
        name: 'render-stage',
        extensions: ['.stg'],
        load: async () => {
            return (await Promise.resolve().then(() => __importStar(require('./assets/render-stage')))).default;
        }
    },
    {
        name: 'render-flow',
        extensions: ['.flow'],
        load: async () => {
            return (await Promise.resolve().then(() => __importStar(require('./assets/render-flow')))).default;
        }
    },
    {
        name: 'instantiation-material',
        extensions: ['.material'],
        load: async () => {
            return (await Promise.resolve().then(() => __importStar(require('./assets/instantiation-asset/material')))).default;
        }
    },
    {
        name: 'instantiation-mesh',
        extensions: ['.mesh'],
        load: async () => {
            return (await Promise.resolve().then(() => __importStar(require('./assets/instantiation-asset/mesh')))).default;
        }
    },
    {
        name: 'instantiation-skeleton',
        extensions: ['.skeleton'],
        load: async () => {
            return (await Promise.resolve().then(() => __importStar(require('./assets/instantiation-asset/skeleton')))).default;
        }
    },
    {
        name: 'instantiation-animation',
        extensions: ['.animation'],
        load: async () => {
            return (await Promise.resolve().then(() => __importStar(require('./assets/instantiation-asset/animation')))).default;
        }
    },
    {
        name: 'video-clip',
        extensions: ['.mp4'],
        load: async () => {
            return (await Promise.resolve().then(() => __importStar(require('./assets/video-clip')))).default;
        }
    }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvcmUvYXNzZXRzL2Fzc2V0LWhhbmRsZXIvY29uZmlnLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQU9hLFFBQUEsaUJBQWlCLEdBQXVCO0lBQ2pEO1FBQ0ksSUFBSSxFQUFFLFdBQVc7UUFDakIsVUFBVSxFQUFFLENBQUMsR0FBRyxDQUFDO1FBQ2pCLElBQUksRUFBRSxLQUFLLElBQUksRUFBRTtZQUNiLE9BQU8sQ0FBQyx3REFBYSxvQkFBb0IsR0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDO1FBQ3hELENBQUM7S0FDSjtJQUNEO1FBQ0ksSUFBSSxFQUFFLFNBQVM7UUFDZixVQUFVLEVBQUUsQ0FBQyxHQUFHLENBQUM7UUFDakIsSUFBSSxFQUFFLEtBQUssSUFBSSxFQUFFO1lBQ2IsT0FBTyxDQUFDLHdEQUFhLGtCQUFrQixHQUFDLENBQUMsQ0FBQyxPQUFPLENBQUM7UUFDdEQsQ0FBQztLQUNKO0lBQ0Q7UUFDSSxJQUFJLEVBQUUsTUFBTTtRQUNaLFVBQVUsRUFBRTtZQUNSLE1BQU07WUFDTixPQUFPO1lBQ1AsTUFBTTtZQUNOLE1BQU07WUFDTixNQUFNO1lBQ04sT0FBTztZQUNQLE9BQU87WUFDUCxTQUFTO1lBQ1QsT0FBTztZQUNQLE1BQU07WUFDTixNQUFNO1lBQ04sUUFBUTtZQUNSLEtBQUs7WUFDTCxNQUFNO1lBQ04sS0FBSztZQUNMLFdBQVc7U0FDZDtRQUNELElBQUksRUFBRSxLQUFLLElBQUksRUFBRTtZQUNiLE9BQU8sQ0FBQyx3REFBYSxlQUFlLEdBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQztRQUNuRCxDQUFDO0tBQ0o7SUFDRDtRQUNJLElBQUksRUFBRSxNQUFNO1FBQ1osVUFBVSxFQUFFLENBQUMsT0FBTyxDQUFDO1FBQ3JCLElBQUksRUFBRSxLQUFLLElBQUksRUFBRTtZQUNi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QyxPQUFPLENBQUM7UUFDekQsQ0FBQztLQUNKO0NBQ0osQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFzc2V0SGFuZGxlciB9IGZyb20gJy4uL0B0eXBlcy9wcm90ZWN0ZWQnO1xyXG5leHBvcnQgaW50ZXJmYWNlIEFzc2V0SGFuZGxlckluZm8ge1xyXG4gICAgbmFtZTogc3RyaW5nO1xyXG4gICAgZXh0ZW5zaW9uczogc3RyaW5nW107XHJcbiAgICBsb2FkOiAoKSA9PiBBc3NldEhhbmRsZXIgfCBQcm9taXNlPEFzc2V0SGFuZGxlcj47XHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBhc3NldEhhbmRsZXJJbmZvczogQXNzZXRIYW5kbGVySW5mb1tdID0gW1xyXG4gICAge1xyXG4gICAgICAgIG5hbWU6ICdkaXJlY3RvcnknLFxyXG4gICAgICAgIGV4dGVuc2lvbnM6IFsnKiddLFxyXG4gICAgICAgIGxvYWQ6IGFzeW5jICgpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIChhd2FpdCBpbXBvcnQoJy4vYXNzZXRzL2RpcmVjdG9yeScpKS5kZWZhdWx0O1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgICAgbmFtZTogJ3Vua25vd24nLFxyXG4gICAgICAgIGV4dGVuc2lvbnM6IFsnKiddLFxyXG4gICAgICAgIGxvYWQ6IGFzeW5jICgpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIChhd2FpdCBpbXBvcnQoJy4vYXNzZXRzL3Vua25vd24nKSkuZGVmYXVsdDtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAgIG5hbWU6ICd0ZXh0JyxcclxuICAgICAgICBleHRlbnNpb25zOiBbXHJcbiAgICAgICAgICAgICcudHh0JyxcclxuICAgICAgICAgICAgJy5odG1sJyxcclxuICAgICAgICAgICAgJy5odG0nLFxyXG4gICAgICAgICAgICAnLnhtbCcsXHJcbiAgICAgICAgICAgICcuY3NzJyxcclxuICAgICAgICAgICAgJy5sZXNzJyxcclxuICAgICAgICAgICAgJy5zY3NzJyxcclxuICAgICAgICAgICAgJy5zdHlsdXMnLFxyXG4gICAgICAgICAgICAnLnlhbWwnLFxyXG4gICAgICAgICAgICAnLmluaScsXHJcbiAgICAgICAgICAgICcuY3N2JyxcclxuICAgICAgICAgICAgJy5wcm90bycsXHJcbiAgICAgICAgICAgICcudHMnLFxyXG4gICAgICAgICAgICAnLnRzeCcsXHJcbiAgICAgICAgICAgICcubWQnLFxyXG4gICAgICAgICAgICAnLm1hcmtkb3duJ1xyXG4gICAgICAgIF0sXHJcbiAgICAgICAgbG9hZDogYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gKGF3YWl0IGltcG9ydCgnLi9hc3NldHMvdGV4dCcpKS5kZWZhdWx0O1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgICAgbmFtZTogJ2pzb24nLFxyXG4gICAgICAgIGV4dGVuc2lvbnM6IFsnLmpzb24nXSxcclxuICAgICAgICBsb2FkOiBhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiAoYXdhaXQgaW1wb3J0KCcuL2Fzc2V0cy9qc29uJykpLmRlZmF1bHQ7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgICBuYW1lOiAnc3BpbmUtZGF0YScsXHJcbiAgICAgICAgZXh0ZW5zaW9uczogWycuanNvbicsICcuc2tlbCddLFxyXG4gICAgICAgIGxvYWQ6IGFzeW5jICgpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIChhd2FpdCBpbXBvcnQoJy4vYXNzZXRzL3NwaW5lJykpLmRlZmF1bHQ7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgICBuYW1lOiAnZHJhZ29uYm9uZXMnLFxyXG4gICAgICAgIGV4dGVuc2lvbnM6IFsnLmpzb24nLCAnLmRiYmluJ10sXHJcbiAgICAgICAgbG9hZDogYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gKGF3YWl0IGltcG9ydCgnLi9hc3NldHMvZHJhZ29uYm9uZXMvZHJhZ29uYm9uZXMnKSkuZGVmYXVsdDtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAgIG5hbWU6ICdkcmFnb25ib25lcy1hdGxhcycsXHJcbiAgICAgICAgZXh0ZW5zaW9uczogWycuanNvbiddLFxyXG4gICAgICAgIGxvYWQ6IGFzeW5jICgpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIChhd2FpdCBpbXBvcnQoJy4vYXNzZXRzL2RyYWdvbmJvbmVzL2RyYWdvbmJvbmVzLWF0bGFzJykpLmRlZmF1bHQ7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgICBuYW1lOiAndGVycmFpbicsXHJcbiAgICAgICAgZXh0ZW5zaW9uczogWycudGVycmFpbiddLFxyXG4gICAgICAgIGxvYWQ6IGFzeW5jICgpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIChhd2FpdCBpbXBvcnQoJy4vYXNzZXRzL3RlcnJhaW4nKSkuZGVmYXVsdDtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAgIG5hbWU6ICdqYXZhc2NyaXB0JyxcclxuICAgICAgICBleHRlbnNpb25zOiBbJy5qcycsICcuY2pzJywgJy5tanMnXSxcclxuICAgICAgICBsb2FkOiBhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiAoYXdhaXQgaW1wb3J0KCcuL2Fzc2V0cy9qYXZhc2NyaXB0JykpLmRlZmF1bHQ7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgICBuYW1lOiAndHlwZXNjcmlwdCcsXHJcbiAgICAgICAgZXh0ZW5zaW9uczogWycudHMnXSxcclxuICAgICAgICBsb2FkOiBhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiAoYXdhaXQgaW1wb3J0KCcuL2Fzc2V0cy90eXBlc2NyaXB0JykpLmRlZmF1bHQ7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgICBuYW1lOiAnc2NlbmUnLFxyXG4gICAgICAgIGV4dGVuc2lvbnM6IFsnLnNjZW5lJywgJy5maXJlJ10sXHJcbiAgICAgICAgbG9hZDogYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gKGF3YWl0IGltcG9ydCgnLi9hc3NldHMvc2NlbmUnKSkuZGVmYXVsdDtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAgIG5hbWU6ICdwcmVmYWInLFxyXG4gICAgICAgIGV4dGVuc2lvbnM6IFsnLnByZWZhYiddLFxyXG4gICAgICAgIGxvYWQ6IGFzeW5jICgpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIChhd2FpdCBpbXBvcnQoJy4vYXNzZXRzL3NjZW5lL3ByZWZhYicpKS5kZWZhdWx0O1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgICAgbmFtZTogJ3Nwcml0ZS1mcmFtZScsXHJcbiAgICAgICAgZXh0ZW5zaW9uczogW10sXHJcbiAgICAgICAgbG9hZDogYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gKGF3YWl0IGltcG9ydCgnLi9hc3NldHMvc3ByaXRlLWZyYW1lJykpLmRlZmF1bHQ7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgICBuYW1lOiAndGlsZWQtbWFwJyxcclxuICAgICAgICBleHRlbnNpb25zOiBbJy50bXgnXSxcclxuICAgICAgICBsb2FkOiBhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiAoYXdhaXQgaW1wb3J0KCcuL2Fzc2V0cy90aWxlZC1tYXAnKSkuZGVmYXVsdDtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAgIG5hbWU6ICdidWZmZXInLFxyXG4gICAgICAgIGV4dGVuc2lvbnM6IFsnLmJpbiddLFxyXG4gICAgICAgIGxvYWQ6IGFzeW5jICgpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIChhd2FpdCBpbXBvcnQoJy4vYXNzZXRzL2J1ZmZlcicpKS5kZWZhdWx0O1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgICAgbmFtZTogJ2ltYWdlJyxcclxuICAgICAgICBleHRlbnNpb25zOiBbXHJcbiAgICAgICAgICAgICcuanBnJyxcclxuICAgICAgICAgICAgJy5wbmcnLFxyXG4gICAgICAgICAgICAnLmpwZWcnLFxyXG4gICAgICAgICAgICAnLndlYnAnLFxyXG4gICAgICAgICAgICAnLnRnYScsXHJcbiAgICAgICAgICAgICcuaGRyJyxcclxuICAgICAgICAgICAgJy5ibXAnLFxyXG4gICAgICAgICAgICAnLnBzZCcsXHJcbiAgICAgICAgICAgICcudGlmJyxcclxuICAgICAgICAgICAgJy50aWZmJyxcclxuICAgICAgICAgICAgJy5leHInLFxyXG4gICAgICAgICAgICAnLnpudCdcclxuICAgICAgICBdLFxyXG4gICAgICAgIGxvYWQ6IGFzeW5jICgpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIChhd2FpdCBpbXBvcnQoJy4vYXNzZXRzL2ltYWdlJykpLmRlZmF1bHQ7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgICBuYW1lOiAnc2lnbi1pbWFnZScsXHJcbiAgICAgICAgZXh0ZW5zaW9uczogW10sXHJcbiAgICAgICAgbG9hZDogYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gKGF3YWl0IGltcG9ydCgnLi9hc3NldHMvaW1hZ2Uvc2lnbicpKS5kZWZhdWx0O1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgICAgbmFtZTogJ2FscGhhLWltYWdlJyxcclxuICAgICAgICBleHRlbnNpb25zOiBbXSxcclxuICAgICAgICBsb2FkOiBhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiAoYXdhaXQgaW1wb3J0KCcuL2Fzc2V0cy9pbWFnZS9hbHBoYScpKS5kZWZhdWx0O1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgICAgbmFtZTogJ3RleHR1cmUnLFxyXG4gICAgICAgIGV4dGVuc2lvbnM6IFsnLnRleHR1cmUnXSxcclxuICAgICAgICBsb2FkOiBhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiAoYXdhaXQgaW1wb3J0KCcuL2Fzc2V0cy90ZXh0dXJlJykpLmRlZmF1bHQ7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgICBuYW1lOiAndGV4dHVyZS1jdWJlJyxcclxuICAgICAgICBleHRlbnNpb25zOiBbJy5jdWJlbWFwJ10sXHJcbiAgICAgICAgbG9hZDogYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gKGF3YWl0IGltcG9ydCgnLi9hc3NldHMvdGV4dHVyZS1jdWJlJykpLmRlZmF1bHQ7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgICBuYW1lOiAnZXJwLXRleHR1cmUtY3ViZScsXHJcbiAgICAgICAgZXh0ZW5zaW9uczogW10sXHJcbiAgICAgICAgbG9hZDogYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gKGF3YWl0IGltcG9ydCgnLi9hc3NldHMvZXJwLXRleHR1cmUtY3ViZScpKS5kZWZhdWx0O1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgICAgbmFtZTogJ3JlbmRlci10ZXh0dXJlJyxcclxuICAgICAgICBleHRlbnNpb25zOiBbJy5ydCddLFxyXG4gICAgICAgIGxvYWQ6IGFzeW5jICgpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIChhd2FpdCBpbXBvcnQoJy4vYXNzZXRzL3JlbmRlci10ZXh0dXJlJykpLmRlZmF1bHQ7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgICBuYW1lOiAndGV4dHVyZS1jdWJlLWZhY2UnLFxyXG4gICAgICAgIGV4dGVuc2lvbnM6IFtdLFxyXG4gICAgICAgIGxvYWQ6IGFzeW5jICgpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIChhd2FpdCBpbXBvcnQoJy4vYXNzZXRzL3RleHR1cmUtY3ViZS1mYWNlJykpLmRlZmF1bHQ7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgICBuYW1lOiAncnQtc3ByaXRlLWZyYW1lJyxcclxuICAgICAgICBleHRlbnNpb25zOiBbXSxcclxuICAgICAgICBsb2FkOiBhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiAoYXdhaXQgaW1wb3J0KCcuL2Fzc2V0cy9yZW5kZXItdGV4dHVyZS9ydC1zcHJpdGUtZnJhbWUnKSkuZGVmYXVsdDtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAgIG5hbWU6ICdnbHRmJyxcclxuICAgICAgICBleHRlbnNpb25zOiBbJy5nbHRmJywgJy5nbGInXSxcclxuICAgICAgICBsb2FkOiBhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiAoYXdhaXQgaW1wb3J0KCcuL2Fzc2V0cy9nbHRmJykpLmRlZmF1bHQ7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgICBuYW1lOiAnZ2x0Zi1tZXNoJyxcclxuICAgICAgICBleHRlbnNpb25zOiBbXSxcclxuICAgICAgICBsb2FkOiBhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiAoYXdhaXQgaW1wb3J0KCcuL2Fzc2V0cy9nbHRmL21lc2gnKSkuZGVmYXVsdDtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAgIG5hbWU6ICdnbHRmLWFuaW1hdGlvbicsXHJcbiAgICAgICAgZXh0ZW5zaW9uczogW10sXHJcbiAgICAgICAgbG9hZDogYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gKGF3YWl0IGltcG9ydCgnLi9hc3NldHMvZ2x0Zi9hbmltYXRpb24nKSkuZGVmYXVsdDtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAgIG5hbWU6ICdnbHRmLXNrZWxldG9uJyxcclxuICAgICAgICBleHRlbnNpb25zOiBbXSxcclxuICAgICAgICBsb2FkOiBhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiAoYXdhaXQgaW1wb3J0KCcuL2Fzc2V0cy9nbHRmL3NrZWxldG9uJykpLmRlZmF1bHQ7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgICBuYW1lOiAnZ2x0Zi1tYXRlcmlhbCcsXHJcbiAgICAgICAgZXh0ZW5zaW9uczogW10sXHJcbiAgICAgICAgbG9hZDogYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gKGF3YWl0IGltcG9ydCgnLi9hc3NldHMvZ2x0Zi9tYXRlcmlhbCcpKS5kZWZhdWx0O1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgICAgbmFtZTogJ2dsdGYtc2NlbmUnLFxyXG4gICAgICAgIGV4dGVuc2lvbnM6IFtdLFxyXG4gICAgICAgIGxvYWQ6IGFzeW5jICgpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIChhd2FpdCBpbXBvcnQoJy4vYXNzZXRzL2dsdGYvcHJlZmFiJykpLmRlZmF1bHQ7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgICBuYW1lOiAnZ2x0Zi1lbWJlZGVkLWltYWdlJyxcclxuICAgICAgICBleHRlbnNpb25zOiBbXSxcclxuICAgICAgICBsb2FkOiBhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiAoYXdhaXQgaW1wb3J0KCcuL2Fzc2V0cy9nbHRmL2ltYWdlJykpLmRlZmF1bHQ7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgICBuYW1lOiAnZmJ4JyxcclxuICAgICAgICBleHRlbnNpb25zOiBbJy5mYngnXSxcclxuICAgICAgICBsb2FkOiBhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiAoYXdhaXQgaW1wb3J0KCcuL2Fzc2V0cy9mYngnKSkuZGVmYXVsdDtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAgIG5hbWU6ICdtYXRlcmlhbCcsXHJcbiAgICAgICAgZXh0ZW5zaW9uczogWycubXRsJ10sXHJcbiAgICAgICAgbG9hZDogYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gKGF3YWl0IGltcG9ydCgnLi9hc3NldHMvbWF0ZXJpYWwnKSkuZGVmYXVsdDtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAgIG5hbWU6ICdwaHlzaWNzLW1hdGVyaWFsJyxcclxuICAgICAgICBleHRlbnNpb25zOiBbJy5wbXRsJ10sXHJcbiAgICAgICAgbG9hZDogYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gKGF3YWl0IGltcG9ydCgnLi9hc3NldHMvcGh5c2ljcy1tYXRlcmlhbCcpKS5kZWZhdWx0O1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgICAgbmFtZTogJ2VmZmVjdCcsXHJcbiAgICAgICAgZXh0ZW5zaW9uczogWycuZWZmZWN0J10sXHJcbiAgICAgICAgbG9hZDogYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gKGF3YWl0IGltcG9ydCgnLi9hc3NldHMvZWZmZWN0JykpLmRlZmF1bHQ7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgICBuYW1lOiAnZWZmZWN0LWhlYWRlcicsXHJcbiAgICAgICAgZXh0ZW5zaW9uczogWycuY2h1bmsnXSxcclxuICAgICAgICBsb2FkOiBhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiAoYXdhaXQgaW1wb3J0KCcuL2Fzc2V0cy9lZmZlY3QtaGVhZGVyJykpLmRlZmF1bHQ7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgICBuYW1lOiAnYXVkaW8tY2xpcCcsXHJcbiAgICAgICAgZXh0ZW5zaW9uczogW1xyXG4gICAgICAgICAgICAnLm1wMycsXHJcbiAgICAgICAgICAgICcud2F2JyxcclxuICAgICAgICAgICAgJy5vZ2cnLFxyXG4gICAgICAgICAgICAnLmFhYycsXHJcbiAgICAgICAgICAgICcucGNtJyxcclxuICAgICAgICAgICAgJy5tNGEnXHJcbiAgICAgICAgXSxcclxuICAgICAgICBsb2FkOiBhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiAoYXdhaXQgaW1wb3J0KCcuL2Fzc2V0cy9hdWRpby1jbGlwJykpLmRlZmF1bHQ7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgICBuYW1lOiAnYW5pbWF0aW9uLWNsaXAnLFxyXG4gICAgICAgIGV4dGVuc2lvbnM6IFsnLmFuaW0nXSxcclxuICAgICAgICBsb2FkOiBhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiAoYXdhaXQgaW1wb3J0KCcuL2Fzc2V0cy9hbmltYXRpb24tY2xpcCcpKS5kZWZhdWx0O1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgICAgbmFtZTogJ2FuaW1hdGlvbi1ncmFwaCcsXHJcbiAgICAgICAgZXh0ZW5zaW9uczogWycuYW5pbWdyYXBoJ10sXHJcbiAgICAgICAgbG9hZDogYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gKGF3YWl0IGltcG9ydCgnLi9hc3NldHMvYW5pbWF0aW9uLWdyYXBoJykpLmRlZmF1bHQ7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgICBuYW1lOiAnYW5pbWF0aW9uLWdyYXBoLXZhcmlhbnQnLFxyXG4gICAgICAgIGV4dGVuc2lvbnM6IFsnLmFuaW1ncmFwaHZhcmknXSxcclxuICAgICAgICBsb2FkOiBhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiAoYXdhaXQgaW1wb3J0KCcuL2Fzc2V0cy9hbmltYXRpb24tZ3JhcGgtdmFyaWFudCcpKS5kZWZhdWx0O1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgICAgbmFtZTogJ2FuaW1hdGlvbi1tYXNrJyxcclxuICAgICAgICBleHRlbnNpb25zOiBbJy5hbmltYXNrJ10sXHJcbiAgICAgICAgbG9hZDogYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gKGF3YWl0IGltcG9ydCgnLi9hc3NldHMvYW5pbWF0aW9uLW1hc2snKSkuZGVmYXVsdDtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAgIG5hbWU6ICd0dGYtZm9udCcsXHJcbiAgICAgICAgZXh0ZW5zaW9uczogWycudHRmJ10sXHJcbiAgICAgICAgbG9hZDogYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gKGF3YWl0IGltcG9ydCgnLi9hc3NldHMvdHRmLWZvbnQnKSkuZGVmYXVsdDtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAgIG5hbWU6ICdiaXRtYXAtZm9udCcsXHJcbiAgICAgICAgZXh0ZW5zaW9uczogWycuZm50J10sXHJcbiAgICAgICAgbG9hZDogYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gKGF3YWl0IGltcG9ydCgnLi9hc3NldHMvYml0bWFwLWZvbnQnKSkuZGVmYXVsdDtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAgIG5hbWU6ICdwYXJ0aWNsZScsXHJcbiAgICAgICAgZXh0ZW5zaW9uczogWycucGxpc3QnXSxcclxuICAgICAgICBsb2FkOiBhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiAoYXdhaXQgaW1wb3J0KCcuL2Fzc2V0cy9wYXJ0aWNsZScpKS5kZWZhdWx0O1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgICAgbmFtZTogJ3Nwcml0ZS1hdGxhcycsXHJcbiAgICAgICAgZXh0ZW5zaW9uczogWycucGxpc3QnXSxcclxuICAgICAgICBsb2FkOiBhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiAoYXdhaXQgaW1wb3J0KCcuL2Fzc2V0cy90ZXh0dXJlLXBhY2tlcicpKS5kZWZhdWx0O1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgICAgbmFtZTogJ2F1dG8tYXRsYXMnLFxyXG4gICAgICAgIGV4dGVuc2lvbnM6IFsnLnBhYyddLFxyXG4gICAgICAgIGxvYWQ6IGFzeW5jICgpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIChhd2FpdCBpbXBvcnQoJy4vYXNzZXRzL2F1dG8tYXRsYXMnKSkuZGVmYXVsdDtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAgIG5hbWU6ICdsYWJlbC1hdGxhcycsXHJcbiAgICAgICAgZXh0ZW5zaW9uczogWycubGFiZWxhdGxhcyddLFxyXG4gICAgICAgIGxvYWQ6IGFzeW5jICgpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIChhd2FpdCBpbXBvcnQoJy4vYXNzZXRzL2xhYmVsLWF0bGFzJykpLmRlZmF1bHQ7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgICBuYW1lOiAncmVuZGVyLXBpcGVsaW5lJyxcclxuICAgICAgICBleHRlbnNpb25zOiBbJy5ycHAnXSxcclxuICAgICAgICBsb2FkOiBhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiAoYXdhaXQgaW1wb3J0KCcuL2Fzc2V0cy9yZW5kZXItcGlwZWxpbmUnKSkuZGVmYXVsdDtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAgIG5hbWU6ICdyZW5kZXItc3RhZ2UnLFxyXG4gICAgICAgIGV4dGVuc2lvbnM6IFsnLnN0ZyddLFxyXG4gICAgICAgIGxvYWQ6IGFzeW5jICgpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIChhd2FpdCBpbXBvcnQoJy4vYXNzZXRzL3JlbmRlci1zdGFnZScpKS5kZWZhdWx0O1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgICAgbmFtZTogJ3JlbmRlci1mbG93JyxcclxuICAgICAgICBleHRlbnNpb25zOiBbJy5mbG93J10sXHJcbiAgICAgICAgbG9hZDogYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gKGF3YWl0IGltcG9ydCgnLi9hc3NldHMvcmVuZGVyLWZsb3cnKSkuZGVmYXVsdDtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAgIG5hbWU6ICdpbnN0YW50aWF0aW9uLW1hdGVyaWFsJyxcclxuICAgICAgICBleHRlbnNpb25zOiBbJy5tYXRlcmlhbCddLFxyXG4gICAgICAgIGxvYWQ6IGFzeW5jICgpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIChhd2FpdCBpbXBvcnQoJy4vYXNzZXRzL2luc3RhbnRpYXRpb24tYXNzZXQvbWF0ZXJpYWwnKSkuZGVmYXVsdDtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAgIG5hbWU6ICdpbnN0YW50aWF0aW9uLW1lc2gnLFxyXG4gICAgICAgIGV4dGVuc2lvbnM6IFsnLm1lc2gnXSxcclxuICAgICAgICBsb2FkOiBhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiAoYXdhaXQgaW1wb3J0KCcuL2Fzc2V0cy9pbnN0YW50aWF0aW9uLWFzc2V0L21lc2gnKSkuZGVmYXVsdDtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAgIG5hbWU6ICdpbnN0YW50aWF0aW9uLXNrZWxldG9uJyxcclxuICAgICAgICBleHRlbnNpb25zOiBbJy5za2VsZXRvbiddLFxyXG4gICAgICAgIGxvYWQ6IGFzeW5jICgpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIChhd2FpdCBpbXBvcnQoJy4vYXNzZXRzL2luc3RhbnRpYXRpb24tYXNzZXQvc2tlbGV0b24nKSkuZGVmYXVsdDtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAgIG5hbWU6ICdpbnN0YW50aWF0aW9uLWFuaW1hdGlvbicsXHJcbiAgICAgICAgZXh0ZW5zaW9uczogWycuYW5pbWF0aW9uJ10sXHJcbiAgICAgICAgbG9hZDogYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gKGF3YWl0IGltcG9ydCgnLi9hc3NldHMvaW5zdGFudGlhdGlvbi1hc3NldC9hbmltYXRpb24nKSkuZGVmYXVsdDtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAgIG5hbWU6ICd2aWRlby1jbGlwJyxcclxuICAgICAgICBleHRlbnNpb25zOiBbJy5tcDQnXSxcclxuICAgICAgICBsb2FkOiBhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiAoYXdhaXQgaW1wb3J0KCcuL2Fzc2V0cy92aWRlby1jbGlwJykpLmRlZmF1bHQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5dOyJdfQ==