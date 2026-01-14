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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMigrationList = exports.CocosConfigLoader = exports.CocosMigration = exports.CocosMigrationManager = void 0;
__exportStar(require("./types"), exports);
var cocos_migration_manager_1 = require("./cocos-migration-manager");
Object.defineProperty(exports, "CocosMigrationManager", { enumerable: true, get: function () { return cocos_migration_manager_1.CocosMigrationManager; } });
var cocos_migration_1 = require("./cocos-migration");
Object.defineProperty(exports, "CocosMigration", { enumerable: true, get: function () { return cocos_migration_1.CocosMigration; } });
var cocos_config_loader_1 = require("./cocos-config-loader");
Object.defineProperty(exports, "CocosConfigLoader", { enumerable: true, get: function () { return cocos_config_loader_1.CocosConfigLoader; } });
var register_migration_1 = require("./register-migration");
Object.defineProperty(exports, "getMigrationList", { enumerable: true, get: function () { return register_migration_1.getMigrationList; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29yZS9jb25maWd1cmF0aW9uL21pZ3JhdGlvbi9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDBDQUF3QjtBQUN4QixxRUFBa0U7QUFBekQsZ0lBQUEscUJBQXFCLE9BQUE7QUFDOUIscURBQW1EO0FBQTFDLGlIQUFBLGNBQWMsT0FBQTtBQUN2Qiw2REFBMEQ7QUFBakQsd0hBQUEsaUJBQWlCLE9BQUE7QUFDMUIsMkRBQXdEO0FBQS9DLHNIQUFBLGdCQUFnQixPQUFBIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0ICogZnJvbSAnLi90eXBlcyc7XHJcbmV4cG9ydCB7IENvY29zTWlncmF0aW9uTWFuYWdlciB9IGZyb20gJy4vY29jb3MtbWlncmF0aW9uLW1hbmFnZXInO1xyXG5leHBvcnQgeyBDb2Nvc01pZ3JhdGlvbiB9IGZyb20gJy4vY29jb3MtbWlncmF0aW9uJztcclxuZXhwb3J0IHsgQ29jb3NDb25maWdMb2FkZXIgfSBmcm9tICcuL2NvY29zLWNvbmZpZy1sb2FkZXInO1xyXG5leHBvcnQgeyBnZXRNaWdyYXRpb25MaXN0IH0gZnJvbSAnLi9yZWdpc3Rlci1taWdyYXRpb24nO1xyXG4iXX0=