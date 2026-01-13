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
exports.GltfPrefabHandler = void 0;
const cc = __importStar(require("cc"));
const path_1 = __importDefault(require("path"));
const asset_finder_1 = require("./asset-finder");
const load_asset_sync_1 = require("../utils/load-asset-sync");
const reader_manager_1 = require("./reader-manager");
const { v5: uuidV5 } = require('uuid');
const utils_1 = require("../../utils");
const fbx_1 = __importDefault(require("../fbx"));
const gltf_1 = __importDefault(require("../gltf"));
const nodePathMap = new Map();
// uuid.v5 需要一个uuid做为namespace
// https://github.com/uuidjs/uuid#uuidv5name-namespace-buffer-offset
const GLTF_PREFAB_NAMESPACE = '8fa06a75-f07a-44d4-82cf-d08c3c986599';
exports.GltfPrefabHandler = {
    // Handler 的名字，用于指定 Handler as 等
    name: 'gltf-scene',
    // 引擎内对应的类型
    assetType: 'cc.Prefab',
    importer: {
        // 版本号如果变更，则会强制重新导入
        version: '1.0.14',
        async import(asset) {
            if (!asset.parent) {
                return false;
            }
            let version = gltf_1.default.importer.version;
            if (asset.parent.meta.importer === 'fbx') {
                version = fbx_1.default.importer.version;
            }
            const gltfConverter = await reader_manager_1.glTfReaderManager.getOrCreate(asset.parent, version);
            const gltfUserData = asset.parent.userData;
            const gltfAssetFinder = new asset_finder_1.DefaultGltfAssetFinder(gltfUserData.assetFinder);
            const sceneNode = gltfConverter.createScene(asset.userData.gltfIndex, gltfAssetFinder);
            const animationUUIDs = [];
            for (const siblingAssetName of Object.keys(asset.parent.subAssets)) {
                const siblingAsset = asset.parent.subAssets[siblingAssetName];
                if (siblingAsset.meta.importer === 'gltf-animation') {
                    animationUUIDs.push(siblingAsset.uuid);
                }
            }
            const mountAllAnimationsOnPrefab = gltfUserData.mountAllAnimationsOnPrefab ?? true;
            let animationComponent = null;
            if (sceneNode.getComponentInChildren(cc.SkinnedMeshRenderer)) {
                // create the right type of Animation upfront even if there is actually no animation clip,
                // because of the confusing results of mismatching Animation type
                animationComponent = sceneNode.addComponent(cc.SkeletalAnimation);
                // @ts-ignore TS2445
                animationComponent._sockets = gltfConverter.createSockets(sceneNode);
            }
            else if (animationUUIDs.length !== 0) {
                animationComponent = sceneNode.addComponent(cc.Animation);
            }
            if (mountAllAnimationsOnPrefab && animationComponent) {
                const animationClips = animationUUIDs.map((animationUUID) => (0, load_asset_sync_1.loadAssetSync)(animationUUID, cc.AnimationClip) || null);
                // @ts-ignore TS2445
                animationComponent._clips = animationClips;
                for (const clip of animationClips) {
                    if (clip) {
                        // @ts-ignore TS2445
                        animationComponent._defaultClip = clip;
                        break;
                    }
                }
            }
            // 生成 lod 节点
            if (gltfUserData.lods && !gltfUserData.lods.hasBuiltinLOD && gltfUserData.lods.enable) {
                // 获取原 mesh 子资源和新 mesh 子资源
                const subAssets = asset.parent.subAssets;
                // { uuid: userData }
                const newSubAssets = {}, baseSubAssets = {};
                for (const key in subAssets) {
                    const subAsset = subAssets[key];
                    if (subAsset.meta.importer === 'gltf-mesh') {
                        if (subAsset.userData.lodOptions) {
                            newSubAssets[subAsset.uuid] = subAsset.userData;
                        }
                        else {
                            baseSubAssets[subAsset.uuid] = subAsset.userData;
                        }
                    }
                }
                // 修改原节点名称
                const baseNodes = new Array(Object.keys(baseSubAssets).length);
                sceneNode.children.forEach((child) => {
                    // 获取节点下所有 meshRenderer
                    const meshRenderers = child.getComponentsInChildren(cc.MeshRenderer);
                    for (const uuid in baseSubAssets) {
                        meshRenderers.forEach((meshRenderer) => {
                            // 修改自带的 meshRenderer 的节点的名称
                            if (meshRenderer?.mesh?.uuid && uuid === meshRenderer.mesh.uuid) {
                                meshRenderer.node.name = meshRenderer.node.name + '_LOD0';
                                baseNodes[baseSubAssets[uuid].gltfIndex] = meshRenderer.node;
                            }
                        });
                    }
                });
                // 创建新节点
                for (const uuid in newSubAssets) {
                    const index = gltfUserData.assetFinder?.meshes?.indexOf(uuid) || -1;
                    if (index === -1) {
                        continue;
                    }
                    const mesh = gltfAssetFinder.find('meshes', index, cc.Mesh);
                    if (!mesh) {
                        continue;
                    }
                    const userData = newSubAssets[uuid];
                    const baseNode = baseNodes[userData.gltfIndex];
                    const name = baseNode.name.replace(/(_LOD0)+$/, `_LOD${userData.lodLevel}`);
                    // 复制原节点，修改名称和 mesh
                    const newNode = cc.instantiate(baseNode);
                    newNode.name = name;
                    const meshRenderer = newNode.getComponent(cc.MeshRenderer);
                    meshRenderer && (meshRenderer.mesh = mesh);
                    // 自带 meshRenderer 的节点的父节点中插入新节点
                    baseNode.parent.addChild(newNode);
                }
            }
            // 生成 LODGroup 组件
            const lodToInsert = [];
            let lodGroup = sceneNode.getComponent(cc.LODGroup);
            sceneNode.children.forEach((child) => {
                const lodArr = /_LOD(\d+)$/i.exec(child.name);
                if (lodArr && lodArr.length > 1) {
                    if (!lodGroup) {
                        try {
                            lodGroup = sceneNode.addComponent(cc.LODGroup);
                        }
                        catch (error) {
                            console.error('Add LODGroup component failed!');
                        }
                    }
                    const index = parseInt(lodArr[1], 10);
                    let lod = lodGroup?.LODs[index];
                    lod = lod !== undefined ? lod : lodToInsert[index];
                    if (!lod) {
                        lod = new cc.LOD();
                        lodToInsert[index] = lod;
                    }
                    const deepFindMeshRenderer = (node) => {
                        const meshRenderers = node.getComponents(cc.MeshRenderer);
                        if (meshRenderers && meshRenderers.length > 0) {
                            meshRenderers.forEach((meshRenderer) => {
                                lod?.insertRenderer(-1, meshRenderer);
                            });
                        }
                        if (node.children && node.children.length > 0) {
                            node.children.forEach((node) => {
                                deepFindMeshRenderer(node);
                            });
                        }
                    };
                    deepFindMeshRenderer(child);
                }
            });
            if (lodGroup) {
                let screenSize = 0.25;
                const len = lodToInsert.length;
                for (let index = 0; index < len - 1; index++) {
                    const lod = lodToInsert[index];
                    screenSize = gltfUserData.lods?.options[index]?.screenRatio || screenSize;
                    lodGroup.insertLOD(index, screenSize, lod);
                    screenSize /= 2;
                }
                // 手动修改的最后一层 screenSize，不做处理
                // 默认的最后一层 screenSize，最后一层小于 1%， 以计算结果为准；如果大于1 ，则用 1% 作为最后一个层级的屏占比
                if (gltfUserData.lods?.options[len - 1]?.screenRatio) {
                    lodGroup.insertLOD(len - 1, gltfUserData.lods.options[len - 1].screenRatio, lodToInsert[len - 1]);
                }
                else {
                    if (screenSize < 0.01) {
                        lodGroup.insertLOD(len - 1, screenSize, lodToInsert[len - 1]);
                    }
                    else {
                        lodGroup.insertLOD(len - 1, 0.01, lodToInsert[len - 1]);
                    }
                }
            }
            if (gltfConverter.gltf.scenes.length === 1) {
                const baseName = asset.parent.basename;
                sceneNode.name = path_1.default.basename(baseName, path_1.default.extname(baseName));
            }
            const prefab = generatePrefab(sceneNode);
            let serializeJSON = EditorExtends.serialize(prefab);
            // 影眸模型导入后需要重定向材质
            if (gltfUserData.redirectMaterialMap) {
                const prefabJSON = JSON.parse(serializeJSON);
                try {
                    await changeMaterialsInJSON(gltfUserData.redirectMaterialMap, prefabJSON);
                }
                catch (error) {
                    console.error(error);
                    console.error(`changeMaterialsInJSON in asset ${asset.url} failed!`);
                }
                serializeJSON = JSON.stringify(prefabJSON, undefined, 2);
            }
            await asset.saveToLibrary('.json', serializeJSON);
            const depends = (0, utils_1.getDependUUIDList)(serializeJSON);
            asset.setData('depends', depends);
            nodePathMap.clear();
            return true;
        },
    },
};
exports.default = exports.GltfPrefabHandler;
function changeMaterialsInJSON(redirectMaterialMap, prefabJSON) {
    const compInfo = prefabJSON.find((info) => info.__type__ === 'cc.SkinnedMeshRenderer' || info.__type__ === 'cc.MeshRenderer');
    for (const index of Object.keys(redirectMaterialMap)) {
        if (!compInfo._materials[index]) {
            continue;
        }
        const uuid = redirectMaterialMap[index];
        if (!uuid) {
            console.error(`overwriteMaterial uuid is empty, index: ${index}`);
            continue;
        }
        compInfo._materials[index].__uuid__ = uuid;
    }
}
function getCompressedUuid(name) {
    // 通过名字生成一个uuid，名字相同生成的uuid相同
    // https://tools.ietf.org/html/rfc4122#page-13
    let uuid = uuidV5(name, GLTF_PREFAB_NAMESPACE);
    uuid = EditorExtends.UuidUtils.compressUuid(uuid, true);
    return uuid;
}
function getNodePath(node) {
    if (nodePathMap.has(node)) {
        return nodePathMap.get(node);
    }
    let nodePath = '';
    // 使用节点路径来生成FileId
    const nodePathArray = [];
    let nodeItr = node;
    while (nodeItr) {
        // 为了防止名字冲突，加上siblingIndex
        const siblingIndex = nodeItr.getSiblingIndex();
        nodePathArray.push(nodeItr.name + siblingIndex);
        nodeItr = nodeItr.parent;
    }
    nodePath = nodePathArray.reverse().join('/');
    nodePathMap.set(node, nodePath);
    return nodePath;
}
function nodeFileIdGenerator(node) {
    const nodePath = getNodePath(node);
    const nodeFileId = getCompressedUuid(nodePath);
    return nodeFileId;
}
function compFileIdGenerator(comp, index) {
    const nodePath = getNodePath(comp.node);
    const compPath = nodePath + '/comp' + index;
    const compFileId = getCompressedUuid(compPath);
    return compFileId;
}
function getDumpableNode(node, prefab) {
    // deep clone, since we dont want the given node changed by codes below
    // node = cc.instantiate(node);
    nodePathMap.clear();
    // 使用节点路径来生成FileId，这样可以防止每次gltf重导后生成不同的FileId
    EditorExtends.PrefabUtils.addPrefabInfo(node, node, prefab, { nodeFileIdGenerator, compFileIdGenerator });
    EditorExtends.PrefabUtils.checkAndStripNode(node);
    return node;
}
function generatePrefab(node) {
    const prefab = new cc.Prefab();
    const dump = getDumpableNode(node, prefab);
    prefab.data = dump;
    return prefab;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlZmFiLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2NvcmUvYXNzZXRzL2Fzc2V0LWhhbmRsZXIvYXNzZXRzL2dsdGYvcHJlZmFiLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUNBLHVDQUF5QjtBQUN6QixnREFBd0I7QUFFeEIsaURBQXdEO0FBQ3hELDhEQUF5RDtBQUN6RCxxREFBcUQ7QUFDckQsTUFBTSxFQUFFLEVBQUUsRUFBRSxNQUFNLEVBQUUsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7QUFFdkMsdUNBQWdEO0FBR2hELGlEQUFnQztBQUNoQyxtREFBa0M7QUFHbEMsTUFBTSxXQUFXLEdBQXlCLElBQUksR0FBRyxFQUFtQixDQUFDO0FBRXJFLDhCQUE4QjtBQUM5QixvRUFBb0U7QUFDcEUsTUFBTSxxQkFBcUIsR0FBRyxzQ0FBc0MsQ0FBQztBQUV4RCxRQUFBLGlCQUFpQixHQUFpQjtJQUMzQyxnQ0FBZ0M7SUFDaEMsSUFBSSxFQUFFLFlBQVk7SUFFbEIsV0FBVztJQUNYLFNBQVMsRUFBRSxXQUFXO0lBRXRCLFFBQVEsRUFBRTtRQUNOLG1CQUFtQjtRQUNuQixPQUFPLEVBQUUsUUFBUTtRQUNqQixLQUFLLENBQUMsTUFBTSxDQUFDLEtBQW1CO1lBQzVCLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUM7Z0JBQ2hCLE9BQU8sS0FBSyxDQUFDO1lBQ2pCLENBQUM7WUFDRCxJQUFJLE9BQU8sR0FBRyxjQUFXLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQztZQUMzQyxJQUFJLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsS0FBSyxLQUFLLEVBQUUsQ0FBQztnQkFDdkMsT0FBTyxHQUFHLGFBQVUsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDO1lBQzFDLENBQUM7WUFDRCxNQUFNLGFBQWEs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QU8sSUFBSSxDQUFDO0FBQ2hCLENBQUM7QUFFRCxTQUFTLGNBQWMsQ0FBQyxJQUFhO0lBQ2pDLE1BQU0sTUFBTSxHQUFHLElBQUksRUFBRSxDQUFDLE1BQU0sRUFBRSxDQUFDO0lBQy9CLE1BQU0sSUFBSSxHQUFHLGVBQWUsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDM0MsTUFBTSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7SUFDbkIsT0FBTyxNQUFNLENBQUM7QUFDbEIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFzc2V0LCBWaXJ0dWFsQXNzZXQgfSBmcm9tICdAY29jb3MvYXNzZXQtZGInO1xyXG5pbXBvcnQgKiBhcyBjYyBmcm9tICdjYyc7XHJcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xyXG5pbXBvcnQgeyBHbFRGVXNlckRhdGEsIElWaXJ0dWFsQXNzZXRVc2VyRGF0YSB9IGZyb20gJy4uLy4uLy4uL0B0eXBlcy91c2VyRGF0YXMnO1xyXG5pbXBvcnQgeyBEZWZhdWx0R2x0ZkFzc2V0RmluZGVyIH0gZnJvbSAnLi9hc3NldC1maW5kZXInO1xyXG5pbXBvcnQgeyBsb2FkQXNzZXRTeW5jIH0gZnJvbSAnLi4vdXRpbHMvbG9hZC1hc3NldC1zeW5jJztcclxuaW1wb3J0IHsgZ2xUZlJlYWRlck1hbmFnZXIgfSBmcm9tICcuL3JlYWRlci1tYW5hZ2VyJztcclxuY29uc3QgeyB2NTogdXVpZFY1IH0gPSByZXF1aXJlKCd1dWlkJyk7XHJcblxyXG5pbXBvcnQgeyBnZXREZXBlbmRVVUlETGlzdCB9IGZyb20gJy4uLy4uL3V0aWxzJztcclxuaW1wb3J0IHsgR2x0ZkNvbnZlcnRlciB9IGZyb20gJy4uL3V0aWxzL2dsdGYtY29udmVydGVyJztcclxuaW1wb3J0IHsgQXNzZXRIYW5kbGVyIH0gZnJvbSAnLi4vLi4vLi4vQHR5cGVzL3Byb3RlY3RlZCc7XHJcbmltcG9ydCBGYnhIYW5kbGVyIGZyb20gJy4uL2ZieCc7XHJcbmltcG9ydCBHbHRmSGFuZGxlciBmcm9tICcuLi9nbHRmJztcclxuXHJcbmRlY2xhcmUgY29uc3QgRWRpdG9yRXh0ZW5kczogYW55O1xyXG5jb25zdCBub2RlUGF0aE1hcDogTWFwPGNjLk5vZGUsIHN0cmluZz4gPSBuZXcgTWFwPGNjLk5vZGUsIHN0cmluZz4oKTtcclxuXHJcbi8vIHV1aWQudjUg6ZyA6KaB5LiA5LiqdXVpZOWBmuS4um5hbWVzcGFjZVxyXG4vLyBodHRwczovL2dpdGh1Yi5jb20vdXVpZGpzL3V1aWQjdXVpZHY1bmFtZS1uYW1lc3BhY2UtYnVmZmVyLW9mZnNldFxyXG5jb25zdCBHTFRGX1BSRUZBQl9OQU1FU1BBQ0UgPSAnOGZhMDZhNzUtZjA3YS00NGQ0LTgyY2YtZDA4YzNjOTg2NTk5JztcclxuXHJcbmV4cG9ydCBjb25zdCBHbHRmUHJlZmFiSGFuZGxlcjogQXNzZXRIYW5kbGVyID0ge1xyXG4gICAgLy8gSGFuZGxlciDnmoTlkI3lrZfvvIznlKjkuo7mjIflrpogSGFuZGxlciBhcyDnrYlcclxuICAgIG5hbWU6ICdnbHRmLXNjZW5lJyxcclxuXHJcbiAgICAvLyDlvJXmk47lhoXlr7nlupTnmoTnsbvlnotcclxuICAgIGFzc2V0VHlwZTogJ2NjLlByZWZhYicsXHJcblxyXG4gICAgaW1wb3J0ZXI6IHtcclxuICAgICAgICAvLyDniYjmnKzlj7flpoLmnpzlj5jmm7TvvIzliJnkvJrlvLrliLbph43mlrDlr7zlhaVcclxuICAgICAgICB2ZXJzaW9uOiAnMS4wLjE0JyxcclxuICAgICAgICBhc3luYyBpbXBvcnQoYXNzZXQ6IFZpcnR1YWxBc3NldCkge1xyXG4gICAgICAgICAgICBpZiAoIWFzc2V0LnBhcmVudCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGxldCB2ZXJzaW9uID0gR2x0ZkhhbmRsZXIuaW1wb3J0ZXIudmVyc2lvbjtcclxuICAgICAgICAgICAgaWYgKGFzc2V0LnBhcmVudC5tZXRhLmltcG9ydGVyID09PSAnZmJ4Jykge1xyXG4gICAgICAgICAgICAgICAgdmVyc2lvbiA9IEZieEhhbmRsZXIuaW1wb3J0ZXIudmVyc2lvbjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCBnbHRmQ29udmVydGVyID0gYXdhaXQgZ2xUZlJlYWRlck1hbmFnZXIuZ2V0T3JDcmVhdGUoYXNzZXQucGFyZW50IGFzIEFzc2V0LCB2ZXJzaW9uKTtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IGdsdGZVc2VyRGF0YSA9IGFzc2V0LnBhcmVudC51c2VyRGF0YSBhcyBHbFRGVXNlckRhdGE7XHJcblxyXG4gICAgICAgICAgICBjb25zdCBnbHRmQXNzZXRGaW5kZXIgPSBuZXcgRGVmYXVsdEdsdGZBc3NldEZpbmRlcihnbHRmVXNlckRhdGEuYXNzZXRGaW5kZXIpO1xyXG4gICAgICAgICAgICBjb25zdCBzY2VuZU5vZGUgPSBnbHRmQ29udmVydGVyLmNyZWF0ZVNjZW5lKGFzc2V0LnVzZXJEYXRhLmdsdGZJbmRleCBhcyBudW1iZXIsIGdsdGZBc3NldEZpbmRlcik7XHJcblxyXG4gICAgICAgICAgICBjb25zdCBhbmltYXRpb25VVUlEczogc3RyaW5nW10gPSBbXTtcclxuICAgICAgICAgICAgZm9yIChjb25zdCBzaWJsaW5nQXNzZXROYW1lIG9mIE9iamVjdC5rZXlzKGFzc2V0LnBhcmVudC5zdWJBc3NldHMpKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBzaWJsaW5nQXNzZXQgPSBhc3NldC5wYXJlbnQuc3ViQXNzZXRzW3NpYmxpbmdBc3NldE5hbWVdO1xyXG4gICAgICAgICAgICAgICAgaWYgKHNpYmxpbmdBc3NldC5tZXRhLmltcG9ydGVyID09PSAnZ2x0Zi1hbmltYXRpb24nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYW5pbWF0aW9uVVVJRHMucHVzaChzaWJsaW5nQXNzZXQudXVpZCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNvbnN0IG1vdW50QWxsQW5pbWF0aW9uc09uUHJlZmFiID0gZ2x0ZlVzZXJEYXRhLm1vdW50QWxsQW5pbWF0aW9uc09uUHJlZmFiID8/IHRydWU7XHJcblxyXG4gICAgICAgICAgICBsZXQgYW5pbWF0aW9uQ29tcG9uZW50OiBjYy5BbmltYXRpb24gfCBudWxsID0gbnVsbDtcclxuICAgICAgICAgICAgaWYgKHNjZW5lTm9kZS5nZXRDb21wb25lbnRJbkNoaWxkcmVuKGNjLlNraW5uZWRNZXNoUmVuZGVyZXIpKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBjcmVhdGUgdGhlIHJpZ2h0IHR5cGUgb2YgQW5pbWF0aW9uIHVwZnJvbnQgZXZlbiBpZiB0aGVyZSBpcyBhY3R1YWxseSBubyBhbmltYXRpb24gY2xpcCxcclxuICAgICAgICAgICAgICAgIC8vIGJlY2F1c2Ugb2YgdGhlIGNvbmZ1c2luZyByZXN1bHRzIG9mIG1pc21hdGNoaW5nIEFuaW1hdGlvbiB0eXBlXHJcbiAgICAgICAgICAgICAgICBhbmltYXRpb25Db21wb25lbnQgPSBzY2VuZU5vZGUuYWRkQ29tcG9uZW50KGNjLlNrZWxldGFsQW5pbWF0aW9uKTtcclxuICAgICAgICAgICAgICAgIC8vIEB0cy1pZ25vcmUgVFMyNDQ1XHJcbiAgICAgICAgICAgICAgICBhbmltYXRpb25Db21wb25lbnQuX3NvY2tldHMgPSBnbHRmQ29udmVydGVyLmNyZWF0ZVNvY2tldHMoc2NlbmVOb2RlKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChhbmltYXRpb25VVUlEcy5sZW5ndGggIT09IDApIHtcclxuICAgICAgICAgICAgICAgIGFuaW1hdGlvbkNvbXBvbmVudCA9IHNjZW5lTm9kZS5hZGRDb21wb25lbnQoY2MuQW5pbWF0aW9uKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKG1vdW50QWxsQW5pbWF0aW9uc09uUHJlZmFiICYmIGFuaW1hdGlvbkNvbXBvbmVudCkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgYW5pbWF0aW9uQ2xpcHMgPSBhbmltYXRpb25VVUlEcy5tYXAoKGFuaW1hdGlvblVVSUQpID0+IGxvYWRBc3NldFN5bmMoYW5pbWF0aW9uVVVJRCwgY2MuQW5pbWF0aW9uQ2xpcCkgfHwgbnVsbCk7XHJcbiAgICAgICAgICAgICAgICAvLyBAdHMtaWdub3JlIFRTMjQ0NVxyXG4gICAgICAgICAgICAgICAgYW5pbWF0aW9uQ29tcG9uZW50Ll9jbGlwcyA9IGFuaW1hdGlvbkNsaXBzO1xyXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBjbGlwIG9mIGFuaW1hdGlvbkNsaXBzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNsaXApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gQHRzLWlnbm9yZSBUUzI0NDVcclxuICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0aW9uQ29tcG9uZW50Ll9kZWZhdWx0Q2xpcCA9IGNsaXA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8g55Sf5oiQIGxvZCDoioLngrlcclxuICAgICAgICAgICAgaWYgKGdsdGZVc2VyRGF0YS5sb2RzICYmICFnbHRmVXNlckRhdGEubG9kcy5oYXNCdWlsdGluTE9EICYmIGdsdGZVc2VyRGF0YS5sb2RzLmVuYWJsZSkge1xyXG4gICAgICAgICAgICAgICAgLy8g6I635Y+W5Y6fIG1lc2gg5a2Q6LWE5rqQ5ZKM5pawIG1lc2gg5a2Q6LWE5rqQXHJcbiAgICAgICAgICAgICAgICBjb25zdCBzdWJBc3NldHMgPSBhc3NldC5wYXJlbnQuc3ViQXNzZXRzO1xyXG4gICAgICAgICAgICAgICAgLy8geyB1dWlkOiB1c2VyRGF0YSB9XHJcbiAgICAgICAgICAgICAgICBjb25zdCBuZXdTdWJBc3NldHM6IHsgW2tleTogc3RyaW5nXTogSVZpcnR1YWxBc3NldFVzZXJEYXRhIH0gPSB7fSxcclxuICAgICAgICAgICAgICAgICAgICBiYXNlU3ViQXNzZXRzOiB7IFtrZXk6IHN0cmluZ106IElWaXJ0dWFsQXNzZXRVc2VyRGF0YSB9ID0ge307XHJcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiBzdWJBc3NldHMpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBzdWJBc3NldDogVmlydHVhbEFzc2V0ID0gc3ViQXNzZXRzW2tleV07XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN1YkFzc2V0Lm1ldGEuaW1wb3J0ZXIgPT09ICdnbHRmLW1lc2gnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzdWJBc3NldC51c2VyRGF0YS5sb2RPcHRpb25zKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdTdWJBc3NldHNbc3ViQXNzZXQudXVpZF0gPSBzdWJBc3NldC51c2VyRGF0YTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhc2VTdWJBc3NldHNbc3ViQXNzZXQudXVpZF0gPSBzdWJBc3NldC51c2VyRGF0YTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvLyDkv67mlLnljp/oioLngrnlkI3np7BcclxuICAgICAgICAgICAgICAgIGNvbnN0IGJhc2VOb2RlcyA9IG5ldyBBcnJheShPYmplY3Qua2V5cyhiYXNlU3ViQXNzZXRzKS5sZW5ndGgpO1xyXG4gICAgICAgICAgICAgICAgc2NlbmVOb2RlLmNoaWxkcmVuLmZvckVhY2goKGNoaWxkOiBjYy5Ob2RlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8g6I635Y+W6IqC54K55LiL5omA5pyJIG1lc2hSZW5kZXJlclxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG1lc2hSZW5kZXJlcnMgPSBjaGlsZC5nZXRDb21wb25lbnRzSW5DaGlsZHJlbihjYy5NZXNoUmVuZGVyZXIpO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3QgdXVpZCBpbiBiYXNlU3ViQXNzZXRzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc2hSZW5kZXJlcnMuZm9yRWFjaCgobWVzaFJlbmRlcmVyKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyDkv67mlLnoh6rluKbnmoQgbWVzaFJlbmRlcmVyIOeahOiKgueCueeahOWQjeensFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG1lc2hSZW5kZXJlcj8ubWVzaD8udXVpZCAmJiB1dWlkID09PSBtZXNoUmVuZGVyZXIubWVzaC51dWlkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVzaFJlbmRlcmVyLm5vZGUubmFtZSA9IG1lc2hSZW5kZXJlci5ub2RlLm5hbWUgKyAnX0xPRDAnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhc2VOb2Rlc1tiYXNlU3ViQXNzZXRzW3V1aWRdLmdsdGZJbmRleCFdID0gbWVzaFJlbmRlcmVyLm5vZGU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgLy8g5Yib5bu65paw6IqC54K5XHJcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHV1aWQgaW4gbmV3U3ViQXNzZXRzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaW5kZXggPSBnbHRmVXNlckRhdGEuYXNzZXRGaW5kZXI/Lm1lc2hlcz8uaW5kZXhPZih1dWlkKSB8fCAtMTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaW5kZXggPT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBtZXNoID0gZ2x0ZkFzc2V0RmluZGVyLmZpbmQoJ21lc2hlcycsIGluZGV4LCBjYy5NZXNoKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIW1lc2gpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHVzZXJEYXRhID0gbmV3U3ViQXNzZXRzW3V1aWRdO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGJhc2VOb2RlID0gYmFzZU5vZGVzW3VzZXJEYXRhLmdsdGZJbmRleCFdO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG5hbWUgPSBiYXNlTm9kZS5uYW1lLnJlcGxhY2UoLyhfTE9EMCkrJC8sIGBfTE9EJHt1c2VyRGF0YS5sb2RMZXZlbH1gKTtcclxuICAgICAgICAgICAgICAgICAgICAvLyDlpI3liLbljp/oioLngrnvvIzkv67mlLnlkI3np7DlkowgbWVzaFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG5ld05vZGUgPSBjYy5pbnN0YW50aWF0ZShiYXNlTm9kZSkgYXMgY2MuTm9kZTtcclxuICAgICAgICAgICAgICAgICAgICBuZXdOb2RlLm5hbWUgPSBuYW1lO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG1lc2hSZW5kZXJlciA9IG5ld05vZGUuZ2V0Q29tcG9uZW50KGNjLk1lc2hSZW5kZXJlcikgYXMgY2MuTWVzaFJlbmRlcmVyO1xyXG4gICAgICAgICAgICAgICAgICAgIG1lc2hSZW5kZXJlciAmJiAobWVzaFJlbmRlcmVyLm1lc2ggPSBtZXNoKTtcclxuICAgICAgICAgICAgICAgICAgICAvLyDoh6rluKYgbWVzaFJlbmRlcmVyIOeahOiKgueCueeahOeItuiKgueCueS4reaPkuWFpeaWsOiKgueCuVxyXG4gICAgICAgICAgICAgICAgICAgIGJhc2VOb2RlLnBhcmVudC5hZGRDaGlsZChuZXdOb2RlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8g55Sf5oiQIExPREdyb3VwIOe7hOS7tlxyXG4gICAgICAgICAgICBjb25zdCBsb2RUb0luc2VydDogY2MuTE9EW10gPSBbXTtcclxuICAgICAgICAgICAgbGV0IGxvZEdyb3VwID0gc2NlbmVOb2RlLmdldENvbXBvbmVudChjYy5MT0RHcm91cCk7XHJcbiAgICAgICAgICAgIHNjZW5lTm9kZS5jaGlsZHJlbi5mb3JFYWNoKChjaGlsZDogY2MuTm9kZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgbG9kQXJyID0gL19MT0QoXFxkKykkL2kuZXhlYyhjaGlsZC5uYW1lKTtcclxuICAgICAgICAgICAgICAgIGlmIChsb2RBcnIgJiYgbG9kQXJyLmxlbmd0aCA+IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIWxvZEdyb3VwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2RHcm91cCA9IHNjZW5lTm9kZS5hZGRDb21wb25lbnQoY2MuTE9ER3JvdXApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignQWRkIExPREdyb3VwIGNvbXBvbmVudCBmYWlsZWQhJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaW5kZXggPSBwYXJzZUludChsb2RBcnJbMV0sIDEwKTtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgbG9kID0gbG9kR3JvdXA/LkxPRHNbaW5kZXhdO1xyXG4gICAgICAgICAgICAgICAgICAgIGxvZCA9IGxvZCAhPT0gdW5kZWZpbmVkID8gbG9kIDogbG9kVG9JbnNlcnRbaW5kZXhdO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghbG9kKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvZCA9IG5ldyBjYy5MT0QoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbG9kVG9JbnNlcnRbaW5kZXhdID0gbG9kO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZGVlcEZpbmRNZXNoUmVuZGVyZXIgPSAobm9kZTogY2MuTm9kZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBtZXNoUmVuZGVyZXJzID0gbm9kZS5nZXRDb21wb25lbnRzKGNjLk1lc2hSZW5kZXJlcik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChtZXNoUmVuZGVyZXJzICYmIG1lc2hSZW5kZXJlcnMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVzaFJlbmRlcmVycy5mb3JFYWNoKChtZXNoUmVuZGVyZXI6IGNjLk1lc2hSZW5kZXJlcikgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZD8uaW5zZXJ0UmVuZGVyZXIoLTEsIG1lc2hSZW5kZXJlcik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobm9kZS5jaGlsZHJlbiAmJiBub2RlLmNoaWxkcmVuLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUuY2hpbGRyZW4uZm9yRWFjaCgobm9kZTogY2MuTm9kZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZXBGaW5kTWVzaFJlbmRlcmVyKG5vZGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgIGRlZXBGaW5kTWVzaFJlbmRlcmVyKGNoaWxkKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGlmIChsb2RHcm91cCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHNjcmVlblNpemUgPSAwLjI1O1xyXG4gICAgICAgICAgICAgICAgY29uc3QgbGVuID0gbG9kVG9JbnNlcnQubGVuZ3RoO1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IGxlbiAtIDE7IGluZGV4KyspIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBsb2Q6IGNjLkxPRCA9IGxvZFRvSW5zZXJ0W2luZGV4XTtcclxuICAgICAgICAgICAgICAgICAgICBzY3JlZW5TaXplID0gZ2x0ZlVzZXJEYXRhLmxvZHM/Lm9wdGlvbnNbaW5kZXhdPy5zY3JlZW5SYXRpbyB8fCBzY3JlZW5TaXplO1xyXG4gICAgICAgICAgICAgICAgICAgIGxvZEdyb3VwLmluc2VydExPRChpbmRleCwgc2NyZWVuU2l6ZSwgbG9kKTtcclxuICAgICAgICAgICAgICAgICAgICBzY3JlZW5TaXplIC89IDI7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy8g5omL5Yqo5L+u5pS555qE5pyA5ZCO5LiA5bGCIHNjcmVlblNpemXvvIzkuI3lgZrlpITnkIZcclxuICAgICAgICAgICAgICAgIC8vIOm7mOiupOeahOacgOWQjuS4gOWxgiBzY3JlZW5TaXpl77yM5pyA5ZCO5LiA5bGC5bCP5LqOIDEl77yMIOS7peiuoeeul+e7k+aenOS4uuWHhu+8m+WmguaenOWkp+S6jjEg77yM5YiZ55SoIDElIOS9nOS4uuacgOWQjuS4gOS4quWxgue6p+eahOWxj+WNoOavlFxyXG4gICAgICAgICAgICAgICAgaWYgKGdsdGZVc2VyRGF0YS5sb2RzPy5vcHRpb25zW2xlbiAtIDFdPy5zY3JlZW5SYXRpbykge1xyXG4gICAgICAgICAgICAgICAgICAgIGxvZEdyb3VwLmluc2VydExPRChsZW4gLSAxLCBnbHRmVXNlckRhdGEubG9kcy5vcHRpb25zW2xlbiAtIDFdLnNjcmVlblJhdGlvLCBsb2RUb0luc2VydFtsZW4gLSAxXSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChzY3JlZW5TaXplIDwgMC4wMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsb2RHcm91cC5pbnNlcnRMT0QobGVuIC0gMSwgc2NyZWVuU2l6ZSwgbG9kVG9JbnNlcnRbbGVuIC0gMV0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvZEdyb3VwLmluc2VydExPRChsZW4gLSAxLCAwLjAxLCBsb2RUb0luc2VydFtsZW4gLSAxXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoZ2x0ZkNvbnZlcnRlci5nbHRmLnNjZW5lcyEubGVuZ3RoID09PSAxKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBiYXNlTmFtZSA9IChhc3NldC5wYXJlbnQgYXMgQXNzZXQpLmJhc2VuYW1lO1xyXG4gICAgICAgICAgICAgICAgc2NlbmVOb2RlLm5hbWUgPSBwYXRoLmJhc2VuYW1lKGJhc2VOYW1lLCBwYXRoLmV4dG5hbWUoYmFzZU5hbWUpKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY29uc3QgcHJlZmFiID0gZ2VuZXJhdGVQcmVmYWIoc2NlbmVOb2RlKTtcclxuICAgICAgICAgICAgbGV0IHNlcmlhbGl6ZUpTT04gPSBFZGl0b3JFeHRlbmRzLnNlcmlhbGl6ZShwcmVmYWIpO1xyXG4gICAgICAgICAgICAvLyDlvbHnnLjmqKHlnovlr7zlhaXlkI7pnIDopoHph43lrprlkJHmnZDotKhcclxuICAgICAgICAgICAgaWYgKGdsdGZVc2VyRGF0YS5yZWRpcmVjdE1hdGVyaWFsTWFwKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBwcmVmYWJKU09OID0gSlNPTi5wYXJzZShzZXJpYWxpemVKU09OKTtcclxuICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgY2hhbmdlTWF0ZXJpYWxzSW5KU09OKGdsdGZVc2VyRGF0YS5yZWRpcmVjdE1hdGVyaWFsTWFwLCBwcmVmYWJKU09OKTtcclxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnJvcik7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgY2hhbmdlTWF0ZXJpYWxzSW5KU09OIGluIGFzc2V0ICR7YXNzZXQudXJsfSBmYWlsZWQhYCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBzZXJpYWxpemVKU09OID0gSlNPTi5zdHJpbmdpZnkocHJlZmFiSlNPTiwgdW5kZWZpbmVkLCAyKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBhd2FpdCBhc3NldC5zYXZlVG9MaWJyYXJ5KCcuanNvbicsIHNlcmlhbGl6ZUpTT04pO1xyXG4gICAgICAgICAgICBjb25zdCBkZXBlbmRzID0gZ2V0RGVwZW5kVVVJRExpc3Qoc2VyaWFsaXplSlNPTik7XHJcbiAgICAgICAgICAgIGFzc2V0LnNldERhdGEoJ2RlcGVuZHMnLCBkZXBlbmRzKTtcclxuICAgICAgICAgICAgbm9kZVBhdGhNYXAuY2xlYXIoKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfSxcclxuICAgIH0sXHJcbn07XHJcbmV4cG9ydCBkZWZhdWx0IEdsdGZQcmVmYWJIYW5kbGVyO1xyXG5cclxuZnVuY3Rpb24gY2hhbmdlTWF0ZXJpYWxzSW5KU09OKHJlZGlyZWN0TWF0ZXJpYWxNYXA6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4sIHByZWZhYkpTT046IGFueVtdKSB7XHJcbiAgICBjb25zdCBjb21wSW5mbyA9IHByZWZhYkpTT04uZmluZCgoaW5mbykgPT4gaW5mby5fX3R5cGVfXyA9PT0gJ2NjLlNraW5uZWRNZXNoUmVuZGVyZXInIHx8IGluZm8uX190eXBlX18gPT09ICdjYy5NZXNoUmVuZGVyZXInKTtcclxuICAgIGZvciAoY29uc3QgaW5kZXggb2YgT2JqZWN0LmtleXMocmVkaXJlY3RNYXRlcmlhbE1hcCkpIHtcclxuICAgICAgICBpZiAoIWNvbXBJbmZvLl9tYXRlcmlhbHNbaW5kZXhdKSB7XHJcbiAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCB1dWlkID0gcmVkaXJlY3RNYXRlcmlhbE1hcFtpbmRleF07XHJcbiAgICAgICAgaWYgKCF1dWlkKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYG92ZXJ3cml0ZU1hdGVyaWFsIHV1aWQgaXMgZW1wdHksIGluZGV4OiAke2luZGV4fWApO1xyXG4gICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29tcEluZm8uX21hdGVyaWFsc1tpbmRleF0uX191dWlkX18gPSB1dWlkO1xyXG4gICAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRDb21wcmVzc2VkVXVpZChuYW1lOiBzdHJpbmcpIHtcclxuICAgIC8vIOmAmui/h+WQjeWtl+eUn+aIkOS4gOS4qnV1aWTvvIzlkI3lrZfnm7jlkIznlJ/miJDnmoR1dWlk55u45ZCMXHJcbiAgICAvLyBodHRwczovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjNDEyMiNwYWdlLTEzXHJcbiAgICBsZXQgdXVpZCA9IHV1aWRWNShuYW1lLCBHTFRGX1BSRUZBQl9OQU1FU1BBQ0UpO1xyXG4gICAgdXVpZCA9IEVkaXRvckV4dGVuZHMuVXVpZFV0aWxzLmNvbXByZXNzVXVpZCh1dWlkLCB0cnVlKTtcclxuXHJcbiAgICByZXR1cm4gdXVpZDtcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0Tm9kZVBhdGgobm9kZTogY2MuTm9kZSkge1xyXG4gICAgaWYgKG5vZGVQYXRoTWFwLmhhcyhub2RlKSkge1xyXG4gICAgICAgIHJldHVybiBub2RlUGF0aE1hcC5nZXQobm9kZSkhO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCBub2RlUGF0aCA9ICcnO1xyXG4gICAgLy8g5L2/55So6IqC54K56Lev5b6E5p2l55Sf5oiQRmlsZUlkXHJcbiAgICBjb25zdCBub2RlUGF0aEFycmF5OiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgbGV0IG5vZGVJdHI6IGNjLk5vZGUgfCBudWxsID0gbm9kZTtcclxuICAgIHdoaWxlIChub2RlSXRyKSB7XHJcbiAgICAgICAgLy8g5Li65LqG6Ziy5q2i5ZCN5a2X5Yay56qB77yM5Yqg5LiKc2libGluZ0luZGV4XHJcbiAgICAgICAgY29uc3Qgc2libGluZ0luZGV4ID0gbm9kZUl0ci5nZXRTaWJsaW5nSW5kZXgoKTtcclxuICAgICAgICBub2RlUGF0aEFycmF5LnB1c2gobm9kZUl0ci5uYW1lICsgc2libGluZ0luZGV4KTtcclxuICAgICAgICBub2RlSXRyID0gbm9kZUl0ci5wYXJlbnQ7XHJcbiAgICB9XHJcbiAgICBub2RlUGF0aCA9IG5vZGVQYXRoQXJyYXkucmV2ZXJzZSgpLmpvaW4oJy8nKTtcclxuICAgIG5vZGVQYXRoTWFwLnNldChub2RlLCBub2RlUGF0aCk7XHJcblxyXG4gICAgcmV0dXJuIG5vZGVQYXRoO1xyXG59XHJcblxyXG5mdW5jdGlvbiBub2RlRmlsZUlkR2VuZXJhdG9yKG5vZGU6IGNjLk5vZGUpIHtcclxuICAgIGNvbnN0IG5vZGVQYXRoID0gZ2V0Tm9kZVBhdGgobm9kZSk7XHJcbiAgICBjb25zdCBub2RlRmlsZUlkID0gZ2V0Q29tcHJlc3NlZFV1aWQobm9kZVBhdGgpO1xyXG5cclxuICAgIHJldHVybiBub2RlRmlsZUlkO1xyXG59XHJcblxyXG5mdW5jdGlvbiBjb21wRmlsZUlkR2VuZXJhdG9yKGNvbXA6IGNjLkNvbXBvbmVudCwgaW5kZXg6IG51bWJlcikge1xyXG4gICAgY29uc3Qgbm9kZVBhdGggPSBnZXROb2RlUGF0aChjb21wLm5vZGUpO1xyXG4gICAgY29uc3QgY29tcFBhdGggPSBub2RlUGF0aCArICcvY29tcCcgKyBpbmRleDtcclxuICAgIGNvbnN0IGNvbXBGaWxlSWQgPSBnZXRDb21wcmVzc2VkVXVpZChjb21wUGF0aCk7XHJcblxyXG4gICAgcmV0dXJuIGNvbXBGaWxlSWQ7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldER1bXBhYmxlTm9kZShub2RlOiBjYy5Ob2RlLCBwcmVmYWI6IGNjLlByZWZhYikge1xyXG4gICAgLy8gZGVlcCBjbG9uZSwgc2luY2Ugd2UgZG9udCB3YW50IHRoZSBnaXZlbiBub2RlIGNoYW5nZWQgYnkgY29kZXMgYmVsb3dcclxuICAgIC8vIG5vZGUgPSBjYy5pbnN0YW50aWF0ZShub2RlKTtcclxuICAgIG5vZGVQYXRoTWFwLmNsZWFyKCk7XHJcbiAgICAvLyDkvb/nlKjoioLngrnot6/lvoTmnaXnlJ/miJBGaWxlSWTvvIzov5nmoLflj6/ku6XpmLLmraLmr4/mrKFnbHRm6YeN5a+85ZCO55Sf5oiQ5LiN5ZCM55qERmlsZUlkXHJcbiAgICBFZGl0b3JFeHRlbmRzLlByZWZhYlV0aWxzLmFkZFByZWZhYkluZm8obm9kZSwgbm9kZSwgcHJlZmFiLCB7IG5vZGVGaWxlSWRHZW5lcmF0b3IsIGNvbXBGaWxlSWRHZW5lcmF0b3IgfSk7XHJcblxyXG4gICAgRWRpdG9yRXh0ZW5kcy5QcmVmYWJVdGlscy5jaGVja0FuZFN0cmlwTm9kZShub2RlKTtcclxuXHJcbiAgICByZXR1cm4gbm9kZTtcclxufVxyXG5cclxuZnVuY3Rpb24gZ2VuZXJhdGVQcmVmYWIobm9kZTogY2MuTm9kZSkge1xyXG4gICAgY29uc3QgcHJlZmFiID0gbmV3IGNjLlByZWZhYigpO1xyXG4gICAgY29uc3QgZHVtcCA9IGdldER1bXBhYmxlTm9kZShub2RlLCBwcmVmYWIpO1xyXG4gICAgcHJlZmFiLmRhdGEgPSBkdW1wO1xyXG4gICAgcmV0dXJuIHByZWZhYjtcclxufVxyXG4iXX0=