"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeScriptHandler = void 0;
const asset_db_1 = require("@cocos/asset-db");
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const utils_1 = require("../utils");
// import { dirname, normalize } from 'path';
// import * as ts from 'typescript';
const javascript_1 = __importDefault(require("./javascript"));
const ts_utils_1 = require("./utils/ts-utils");
const asset_config_1 = __importDefault(require("../../asset-config"));
const i18n_1 = __importDefault(require("../../../base/i18n"));
const utils_2 = require("../../utils");
const engine_1 = require("../../../engine");
// import { getCompilerOptions } from './utils/ts-utils';
// const enum TypeCheckLevel {
//     disable = 'disable',
//     checkOnly = 'checkOnly',
//     fatalOnError = 'fatalOnError',
// }
exports.TypeScriptHandler = {
    // Handler 的名字，用于指定 Handler as 等
    name: 'typescript',
    // 引擎内对应的类型
    assetType: 'cc.Script',
    open: utils_1.openCode,
    createInfo: {
        async generateMenuInfo() {
            const menu = [
                {
                    label: 'i18n:ENGINE.assets.newTypeScript',
                    fullFileName: `${ts_utils_1.ScriptNameChecker.getDefaultClassName()}.ts`,
                    template: `db://internal/default_file_content/${exports.TypeScriptHandler.name}/default`,
                    group: 'script',
                    fileNameCheckConfigs: [ts_utils_1.DefaultScriptFileNameCheckConfig],
                    name: 'default',
                },
            ];
            const templateDir = (0, path_1.join)(asset_config_1.default.data.root, '.creator/asset-template/typescript');
            // TODO 文件夹初始化应该在点击查看脚本模板时处理
            // ensureDirSync(templateDir);
            const guideFileName = 'Custom Script Template Help Documentation.url';
            const guideFile = (0, path_1.join)(templateDir, guideFileName);
            if (!(0, fs_extra_1.existsSync)(guideFile)) {
                const content = '[InternetShortcut]\nURL=https://docs.cocos.com/creator/manual/en/scripting/setup.html#custom-script-template';
                (0, fs_extra_1.outputFileSync)(guideFile, content);
            }
            if ((0, fs_extra_1.existsSync)(templateDir)) {
                const names = (0, fs_extra_1.readdirSync)(templateDir);
                names.forEach((name) => {
                    const filePath = (0, path_1.join)(templateDir, name);
                    const stat = (0, fs_extra_1.statSync)(filePath);
                    if (stat.isDirectory()) {
                        return;
                    }
                    if (name === guideFileName || name.startsWith('.')) {
                        return;
                    }
                    const baseName = (0, path_1.basename)(name, (0, path_1.extname)(name));
                    menu.push({
                        label: baseName,
                        fullFileName: (ts_utils_1.ScriptNameChecker.getValidClassName(baseName) || ts_utils_1.ScriptNameChecker.getDefaultClassName()) + '.ts',
                        template: filePath,
                        fileNameCheckConfigs: [ts_utils_1.DefaultScriptFileNameCheckConfig],
                        name: baseName,
                    });
                });
            }
            return menu;
        },
        async create(options) {
            const path = (0, utils_2.url2path)(options.template || 'db://internal/default_file_content/typescript/default');
            if (options.content && typeof options.content !== 'string') {
                (0, fs_extra_1.outputFileSync)(options.target, options.content, 'utf-8');
                return options.target;
            }
            let content = options.content || await (0, fs_extra_1.readFile)(path, 'utf-8');
            content = content.replace(ts_utils_1.ScriptNameChecker.commentsReg, ($0) => {
                if ($0.includes('COMMENTS_GENERATE_IGNORE')) {
                    return '';
                }
                return $0;
            });
            const FileBasenameNoExtension = (0, path_1.basename)(options.target, (0, path_1.extname)(options.target));
            const scriptNameChecker = await ts_utils_1.ScriptNameCheckerManager.getScriptChecker(content);
            // 替换模板内的脚本信息
            const useData = {
                nickname: 'cocos cli'
            };
            const replaceContents = {
                // 获取一个可用的类名
                Name: ts_utils_1.ScriptNameChecker.getValidClassName(FileBasenameNoExtension),
                UnderscoreCaseClassName: ts_utils_1.ScriptNameChecker.getValidClassName(FileBasenameNoExtension),
                CamelCaseClassName: scriptNameChecker.getValidCamelCaseClassName(FileBasenameNoExtension),
                DateTime: new Date().toString(),
                Author: useData.nickname,
                FileBasename: (0, path_1.basename)(options.target),
                FileBasenameNoExtension,
                URL: (0, asset_db_1.queryUrl)(options.target),
                EditorVersion: engine_1.Engine.getInfo().version,
                ManualUrl: 'https://docs.cocos.com/creator/manual/en/scripting/setup.html#custom-script-template',
            };
            const classKey = scriptNameChecker.classNameStringFormat.substring(2, scriptNameChecker.classNameStringFormat.length - 2);
            if (classKey in replaceContents) {
                let className = replaceContents[classKey];
                if (!className || !ts_utils_1.ScriptNameChecker.invalidClassNameReg.test(className)) {
                    replaceContents.DefaultCamelCaseClassName =
                        replaceContents.CamelCaseClassName || ts_utils_1.ScriptNameChecker.getDefaultClassName();
                    if (!ts_utils_1.ScriptNameChecker.invalidClassNameReg.test(className)) {
                        content = content.replace(`@ccclass('<%${classKey}%>')`, `@ccclass('<%DefaultCamelCaseClassName%>')`);
                        content = content.replace(`class <%${classKey}%>`, `class <%DefaultCamelCaseClassName%>`);
                    }
                    className = replaceContents.DefaultCamelCaseClassName;
                    !replaceContents.CamelCaseClassName &&
                        console.warn(i18n_1.default.t('importer.script.find_class_name_from_file_name_failed', {
                            fileBasename: FileBasenameNoExtension,
                            className,
                        }));
                }
                if (!replaceContents.CamelCaseClassName) {
                    if (!replaceContents.Name) {
                        replaceContents.Name = className;
                    }
                    replaceContents.CamelCaseClassName = className;
                }
            }
            Object.keys(replaceContents).forEach((key) => {
                content = content.replace(new RegExp(`<%${key}%>`, 'g'), replaceContents[key]);
            });
            (0, fs_extra_1.outputFileSync)(options.target, content, 'utf-8');
            return options.target;
        },
        preventDefaultTemplateMenu: true,
    },
    importer: {
        ...javascript_1.default.importer,
        async import(asset) {
            const fileName = asset.source;
            if (fileName.endsWith('.d.ts')) {
                return true;
            }
            // let doTypeCheck = false;
            // let fatalOnError = false;
            // const checkLevel = await getTypeCheckLevel();
            // switch (checkLevel) {
            //     case 'checkOnly':
            //         doTypeCheck = true;
            //         fatalOnError = false;
            //         break;
            //     case 'fatalOnError':
            //         doTypeCheck = true;
            //         fatalOnError = true;
            //         break;
            //     case 'disable':
            //     default:
            //         doTypeCheck = false;
            //         break;
            // }
            return javascript_1.default.importer.import(asset);
        },
    },
    destroy: javascript_1.default.destroy,
    /**
     * 类型检查指定脚本资源。
     * @param asset 要检查的脚本资源。
     * @returns 包含错误返回 `true`，否则返回 `false`。
     */
    // private async _typeCheck(asset: Asset) {
    //     const fileName = asset.source;
    //     const compilerOptions = getCompilerOptions();
    //     const program = ts.createProgram({
    //         rootNames: [fileName],
    //         options: compilerOptions,
    //     });
    //     const sourceFile = program.getSourceFile(fileName);
    //     if (!sourceFile) {
    //         console.debug(`program created in _typeCheck() doesn't contain main entry file?`);
    //         return false;
    //     }
    //     const diagnostics = ts.getPreEmitDiagnostics(program, sourceFile);
    //     // const diagnostics = program.getSyntacticDiagnostics(sourceFile);
    //     if (!diagnostics || diagnostics.length === 0) {
    //         return false;
    //     }
    //     const formatDiagnosticsHost: ts.FormatDiagnosticsHost = {
    //         getCurrentDirectory() {
    //             return dirname(asset.source);
    //         },
    //         getCanonicalFileName(fileName: string) {
    //             return normalize(fileName);
    //         },
    //         getNewLine() {
    //             return '\n';
    //         },
    //     };
    //     let nError = 0;
    //     for (const diagnostic of diagnostics) {
    //         const text = ts.formatDiagnostic(diagnostic, formatDiagnosticsHost);
    //         let printer: undefined | ((text: string) => void);
    //         switch (diagnostic.category) {
    //             case ts.DiagnosticCategory.Error:
    //                 ++nError;
    //                 printer = console.error;
    //                 break;
    //             case ts.DiagnosticCategory.Warning:
    //                 printer = console.warn;
    //                 break;
    //             case ts.DiagnosticCategory.Message:
    //             case ts.DiagnosticCategory.Suggestion:
    //             default:
    //                 printer = console.log;
    //                 break;
    //         }
    //         printer(text);
    //     }
    //     return nError !== 0;
    // }
};
exports.default = exports.TypeScriptHandler;
// async function getTypeCheckLevel() {
//     const data = await configurationManager.get('project.general.type_check_level');
//     return data;
// }
// function CocosScriptFrameTransformer<T extends ts.Node>(compressedUUID: string, basename: string): ts.TransformerFactory<T> {
//     return (context) => {
//         const visit: ts.Visitor = (node) => {
//             if (ts.isSourceFile(node)) {
//                 // `cc._RF.push(window.module || {}, compressed_uuid, basename); // begin basename`;
//                 const ccRFPush = ts.createExpressionStatement(
//                     ts.createCall(
//                         ts.createPropertyAccess(
//                             ts.createPropertyAccess(ts.createIdentifier('cc'), ts.createIdentifier('_RF')),
//                             ts.createIdentifier('push')
//                         ),
//                         undefined, // typeArguments
//                         [
//                             ts.createBinary(
//                                 ts.createPropertyAccess(ts.createIdentifier('window'), ts.createIdentifier('module')),
//                                 ts.SyntaxKind.BarBarToken,
//                                 ts.createObjectLiteral()
//                             ),
//                             ts.createStringLiteral(compressedUUID),
//                             ts.createStringLiteral(basename),
//                         ]
//                     )
//                 );
//                 // `cc._RF.pop(); // end basename`
//                 const ccRFPop = ts.createExpressionStatement(
//                     ts.createCall(
//                         ts.createPropertyAccess(
//                             ts.createPropertyAccess(ts.createIdentifier('cc'), ts.createIdentifier('_RF')),
//                             ts.createIdentifier('pop')
//                         ),
//                         undefined, // typeArguments
//                         []
//                     )
//                 );
//                 const statements = new Array<ts.Statement>();
//                 statements.push(ccRFPush);
//                 statements.push(...(node.statements));
//                 statements.push(ccRFPop);
//                 return ts.updateSourceFileNode(
//                     node,
//                     statements,
//                     node.isDeclarationFile,
//                     node.referencedFiles,
//                     node.typeReferenceDirectives,
//                     node.hasNoDefaultLib,
//                     node.libReferenceDirectives);
//             }
//             return ts.visitEachChild(node, (child) => visit(child), context);
//         };
//         return (node) => ts.visitNode(node, visit);
//     };
// }
// function CocosLibTransformer<T extends ts.Node>(): ts.TransformerFactory<T> {
//     return (context) => {
//         const visit: ts.Visitor = (node) => {
//             if (!ts.isImportDeclaration(node) ||
//                 !node.importClause || // `import "xx";` is ignored.
//                 !ts.isStringLiteral(node.moduleSpecifier) ||
//                 node.moduleSpecifier.text !== 'Cocos3D') {
//                 return ts.visitEachChild(node, (child) => visit(child), context);
//             }
//             const createCC = () => {
//                 return ts.createIdentifier('cc');
//             };
//             const variableDeclarations = new Array<ts.VariableDeclaration>();
//             const makeDefaultImport = (id: ts.Identifier) => {
//                 variableDeclarations.push(ts.createVariableDeclaration(
//                     ts.createIdentifier(id.text),
//                     undefined,
//                     createCC()
//                 ));
//             };
//             const { importClause: { name, namedBindings } } = node;
//             if (name) {
//                 // import xx from 'Cocos3D';
//                 // const xx = cc;
//                 makeDefaultImport(name);
//             }
//             if (namedBindings) {
//                 if (ts.isNamespaceImport(namedBindings)) {
//                     // import * as xx from 'Cocos3D';
//                     // const xx = cc;
//                     makeDefaultImport(namedBindings.name);
//                 } else {
//                     const bindingElements = new Array<ts.BindingElement>();
//                     for (const { name, propertyName } of namedBindings.elements) {
//                         if (propertyName) {
//                             // import { xx as yy } from 'Cocos3D';
//                             // const { xx: yy } = cc;
//                             bindingElements.push(ts.createBindingElement(
//                                 undefined, // ...
//                                 ts.createIdentifier(propertyName.text),
//                                 ts.createIdentifier(name.text)
//                             ));
//                         } else {
//                             // import { xx } from 'Cocos3D';
//                             // const { xx } = cc;
//                             bindingElements.push(ts.createBindingElement(
//                                 undefined, // ...
//                                 undefined,
//                                 ts.createIdentifier(name.text)
//                             ));
//                         }
//                     }
//                     variableDeclarations.push(ts.createVariableDeclaration(
//                         ts.createObjectBindingPattern(bindingElements),
//                         undefined, // type
//                         createCC()
//                     ));
//                 }
//             }
//             if (variableDeclarations.length === 0) {
//                 return undefined;
//             }
//             return ts.createVariableStatement(
//                 [ts.createModifier(ts.SyntaxKind.ConstKeyword)],
//                 variableDeclarations
//             );
//         };
//         return (node) => ts.visitNode(node, visit);
//     };
// }
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZXNjcmlwdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9jb3JlL2Fzc2V0cy9hc3NldC1oYW5kbGVyL2Fzc2V0cy90eXBlc2NyaXB0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLDhDQUFrRDtBQUNsRCx1Q0FBc0c7QUFDdEcsK0JBQXdEO0FBQ3hELG9DQUFtRDtBQUNuRCw2Q0FBNkM7QUFDN0Msb0NBQW9DO0FBQ3BDLDhEQUE2QztBQUM3QywrQ0FBaUg7QUFFakgsc0VBQTZDO0FBQzdDLDhEQUFzQztBQUN0Qyx1Q0FBdUM7QUFDdkMsNENBQXlDO0FBQ3pDLHlEQUF5RDtBQUV6RCw4QkFBOEI7QUFDOUIsMkJBQTJCO0FBQzNCLCtCQUErQjtBQUMvQixxQ0FBcUM7QUFDckMsSUFBSTtBQUVTLFFBQUEsaUJBQWlCLEdBQWlCO0lBQzNDLGdDQUFnQztJQUNoQyxJQUFJLEVBQUUsWUFBWTtJQUVsQixXQUFXO0lBQ1gsU0FBUyxFQUFFLFdBQVc7SUFDdEIsSUFBSSxFQUFFLGdCQUFRO0lBQ2QsVUFBVSxFQUFFO1FBQ1IsS0FBSyxDQUFDLGdCQUFnQjtZQUNsQixNQUFNLElBQUksR0FBc0I7Z0JBQzVCO29CQUNJLEtBQUssRUFBRSxrQ0FBa0M7b0JBQ3pDLFlBQVksRUFBRSxHQUFHLDRCQUFpQixDQUFDLG1CQUFtQixFQUFFLEtBQUs7b0JBQzdELFFBQVEsRUFBRSxzQ0FBc0MseUJBQWlCLENBQUMsSUFBSSxVQUFVO29CQUNoRixLQUFLLEVBQUUsUUFBUTtvQkFDZixvQkFBb0IsRUFBRSxDQUFDLDJDQUFnQyxDQUFDO29CQUN4RCxJQUFJLEVBQUUsU0FBUztpQkFDbEI7YUFDSixDQUFDO1lBQ0YsTUFBTSxXQUFXLEdBQUcsSUFBQSxXQUFJLEVBQUMsc0JBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLG9DQUFvQyxDQUFDLENBQUM7WUFDdEYsNEJBQTRCO1lBQzVCLDhCQUE4QjtZQUU5QixN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MEI7QUFDMUIsb0JBQW9CO0FBQ3BCLGdCQUFnQjtBQUNoQix1REFBdUQ7QUFDdkQsb0NBQW9DO0FBQ3BDLGdCQUFnQjtBQUNoQixpREFBaUQ7QUFDakQsbUVBQW1FO0FBQ25FLHVDQUF1QztBQUN2QyxpQkFBaUI7QUFDakIsYUFBYTtBQUNiLHNEQUFzRDtBQUN0RCxTQUFTO0FBQ1QsSUFBSSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFzc2V0LCBxdWVyeVVybCB9IGZyb20gJ0Bjb2Nvcy9hc3NldC1kYic7XHJcbmltcG9ydCB7IGVuc3VyZURpclN5bmMsIGV4aXN0c1N5bmMsIG91dHB1dEZpbGVTeW5jLCByZWFkZGlyU3luYywgcmVhZEZpbGUsIHN0YXRTeW5jIH0gZnJvbSAnZnMtZXh0cmEnO1xyXG5pbXBvcnQgeyBiYXNlbmFtZSwgZGlybmFtZSwgZXh0bmFtZSwgam9pbiB9IGZyb20gJ3BhdGgnO1xyXG5pbXBvcnQgeyBpMThuVHJhbnNsYXRlLCBvcGVuQ29kZSB9IGZyb20gJy4uL3V0aWxzJztcclxuLy8gaW1wb3J0IHsgZGlybmFtZSwgbm9ybWFsaXplIH0gZnJvbSAncGF0aCc7XHJcbi8vIGltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xyXG5pbXBvcnQgSmF2YXNjcmlwdEhhbmRsZXIgZnJvbSAnLi9qYXZhc2NyaXB0JztcclxuaW1wb3J0IHsgRGVmYXVsdFNjcmlwdEZpbGVOYW1lQ2hlY2tDb25maWcsIFNjcmlwdE5hbWVDaGVja2VyLCBTY3JpcHROYW1lQ2hlY2tlck1hbmFnZXIgfSBmcm9tICcuL3V0aWxzL3RzLXV0aWxzJztcclxuaW1wb3J0IHsgQXNzZXRIYW5kbGVyLCBJQ3JlYXRlTWVudUluZm8gfSBmcm9tICcuLi8uLi9AdHlwZXMvcHJvdGVjdGVkJztcclxuaW1wb3J0IGFzc2V0Q29uZmlnIGZyb20gJy4uLy4uL2Fzc2V0LWNvbmZpZyc7XHJcbmltcG9ydCBpMThuIGZyb20gJy4uLy4uLy4uL2Jhc2UvaTE4bic7XHJcbmltcG9ydCB7IHVybDJwYXRoIH0gZnJvbSAnLi4vLi4vdXRpbHMnO1xyXG5pbXBvcnQgeyBFbmdpbmUgfSBmcm9tICcuLi8uLi8uLi9lbmdpbmUnO1xyXG4vLyBpbXBvcnQgeyBnZXRDb21waWxlck9wdGlvbnMgfSBmcm9tICcuL3V0aWxzL3RzLXV0aWxzJztcclxuXHJcbi8vIGNvbnN0IGVudW0gVHlwZUNoZWNrTGV2ZWwge1xyXG4vLyAgICAgZGlzYWJsZSA9ICdkaXNhYmxlJyxcclxuLy8gICAgIGNoZWNrT25seSA9ICdjaGVja09ubHknLFxyXG4vLyAgICAgZmF0YWxPbkVycm9yID0gJ2ZhdGFsT25FcnJvcicsXHJcbi8vIH1cclxuXHJcbmV4cG9ydCBjb25zdCBUeXBlU2NyaXB0SGFuZGxlcjogQXNzZXRIYW5kbGVyID0ge1xyXG4gICAgLy8gSGFuZGxlciDnmoTlkI3lrZfvvIznlKjkuo7mjIflrpogSGFuZGxlciBhcyDnrYlcclxuICAgIG5hbWU6ICd0eXBlc2NyaXB0JyxcclxuXHJcbiAgICAvLyDlvJXmk47lhoXlr7nlupTnmoTnsbvlnotcclxuICAgIGFzc2V0VHlwZTogJ2NjLlNjcmlwdCcsXHJcbiAgICBvcGVuOiBvcGVuQ29kZSxcclxuICAgIGNyZWF0ZUluZm86IHtcclxuICAgICAgICBhc3luYyBnZW5lcmF0ZU1lbnVJbmZvKCkge1xyXG4gICAgICAgICAgICBjb25zdCBtZW51OiBJQ3JlYXRlTWVudUluZm9bXSA9IFtcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ2kxOG46RU5HSU5FLmFzc2V0cy5uZXdUeXBlU2NyaXB0JyxcclxuICAgICAgICAgICAgICAgICAgICBmdWxsRmlsZU5hbWU6IGAke1NjcmlwdE5hbWVDaGVja2VyLmdldERlZmF1bHRDbGFzc05hbWUoKX0udHNgLFxyXG4gICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlOiBgZGI6Ly9pbnRlcm5hbC9kZWZhdWx0X2ZpbGVfY29udGVudC8ke1R5cGVTY3JpcHRIYW5kbGVyLm5hbWV9L2RlZmF1bHRgLFxyXG4gICAgICAgICAgICAgICAgICAgIGdyb3VwOiAnc2NyaXB0JyxcclxuICAgICAgICAgICAgICAgICAgICBmaWxlTmFtZUNoZWNrQ29uZmlnczogW0RlZmF1bHRTY3JpcHRGaWxlTmFtZUNoZWNrQ29uZmlnXSxcclxuICAgICAgICAgICAgICAgICAgICBuYW1lOiAnZGVmYXVsdCcsXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBdO1xyXG4gICAgICAgICAgICBjb25zdCB0ZW1wbGF0ZURpciA9IGpvaW4oYXNzZXRDb25maWcuZGF0YS5yb290LCAnLmNyZWF0b3IvYXNzZXQtdGVtcGxhdGUvdHlwZXNjcmlwdCcpO1xyXG4gICAgICAgICAgICAvLyBUT0RPIOaWh+S7tuWkueWIneWni+WMluW6lOivpeWcqOeCueWHu+afpeeci+iEmuacrOaooeadv+aXtuWkhOeQhlxyXG4gICAgICAgICAgICAvLyBlbnN1cmVEaXJTeW5jKHRlbXBsYXRlRGlyKTtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IGd1aWRlRmlsZU5hbWUgPSAnQ3VzdG9tIFNjcmlwdCBUZW1wbGF0ZSBIZWxwIERvY3VtZW50YXRpb24udXJsJztcclxuICAgICAgICAgICAgY29uc3QgZ3VpZGVGaWxlID0gam9pbih0ZW1wbGF0ZURpciwgZ3VpZGVGaWxlTmFtZSk7XHJcblxyXG4gICAgICAgICAgICBpZiAoIWV4aXN0c1N5bmMoZ3VpZGVGaWxlKSkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgY29udGVudCA9XHJcbiAgICAgICAgICAgICAgICAgICAgJ1tJbnRlcm5ldFNob3J0Y3V0XVxcblVSTD1odHRwczovL2RvY3MuY29jb3MuY29tL2NyZWF0b3IvbWFudWFsL2VuL3NjcmlwdGluZy9zZXR1cC5odG1sI2N1c3RvbS1zY3JpcHQtdGVtcGxhdGUnO1xyXG4gICAgICAgICAgICAgICAgb3V0cHV0RmlsZVN5bmMoZ3VpZGVGaWxlLCBjb250ZW50KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKGV4aXN0c1N5bmModGVtcGxhdGVEaXIpKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBuYW1lcyA9IHJlYWRkaXJTeW5jKHRlbXBsYXRlRGlyKTtcclxuICAgICAgICAgICAgICAgIG5hbWVzLmZvckVhY2goKG5hbWU6IHN0cmluZykgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGZpbGVQYXRoID0gam9pbih0ZW1wbGF0ZURpciwgbmFtZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3RhdCA9IHN0YXRTeW5jKGZpbGVQYXRoKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoc3RhdC5pc0RpcmVjdG9yeSgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5hbWUgPT09IGd1aWRlRmlsZU5hbWUgfHwgbmFtZS5zdGFydHNXaXRoKCcuJykpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYmFzZU5hbWUgPSBiYXNlbmFtZShuYW1lLCBleHRuYW1lKG5hbWUpKTtcclxuICAgICAgICAgICAgICAgICAgICBtZW51LnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogYmFzZU5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZ1bGxGaWxlTmFtZTogKFNjcmlwdE5hbWVDaGVja2VyLmdldFZhbGlkQ2xhc3NOYW1lKGJhc2VOYW1lKSB8fCBTY3JpcHROYW1lQ2hlY2tlci5nZXREZWZhdWx0Q2xhc3NOYW1lKCkpICsgJy50cycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlOiBmaWxlUGF0aCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZU5hbWVDaGVja0NvbmZpZ3M6IFtEZWZhdWx0U2NyaXB0RmlsZU5hbWVDaGVja0NvbmZpZ10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGJhc2VOYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIG1lbnU7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBhc3luYyBjcmVhdGUob3B0aW9ucykge1xyXG4gICAgICAgICAgICBjb25zdCBwYXRoID0gdXJsMnBhdGgob3B0aW9ucy50ZW1wbGF0ZSB8fCAnZGI6Ly9pbnRlcm5hbC9kZWZhdWx0X2ZpbGVfY29udGVudC90eXBlc2NyaXB0L2RlZmF1bHQnKTtcclxuICAgICAgICAgICAgaWYgKG9wdGlvbnMuY29udGVudCAmJiB0eXBlb2Ygb3B0aW9ucy5jb250ZW50ICE9PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICAgICAgb3V0cHV0RmlsZVN5bmMob3B0aW9ucy50YXJnZXQsIG9wdGlvbnMuY29udGVudCwgJ3V0Zi04Jyk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gb3B0aW9ucy50YXJnZXQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbGV0IGNvbnRlbnQgPSBvcHRpb25zLmNvbnRlbnQgfHwgYXdhaXQgcmVhZEZpbGUocGF0aCwgJ3V0Zi04Jyk7XHJcbiAgICAgICAgICAgIGNvbnRlbnQgPSBjb250ZW50LnJlcGxhY2UoU2NyaXB0TmFtZUNoZWNrZXIuY29tbWVudHNSZWcsICgkMDogc3RyaW5nKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoJDAuaW5jbHVkZXMoJ0NPTU1FTlRTX0dFTkVSQVRFX0lHTk9SRScpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICcnO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuICQwO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IEZpbGVCYXNlbmFtZU5vRXh0ZW5zaW9uID0gYmFzZW5hbWUob3B0aW9ucy50YXJnZXQsIGV4dG5hbWUob3B0aW9ucy50YXJnZXQpKTtcclxuICAgICAgICAgICAgY29uc3Qgc2NyaXB0TmFtZUNoZWNrZXIgPSBhd2FpdCBTY3JpcHROYW1lQ2hlY2tlck1hbmFnZXIuZ2V0U2NyaXB0Q2hlY2tlcihjb250ZW50KTtcclxuXHJcbiAgICAgICAgICAgIC8vIOabv+aNouaooeadv+WGheeahOiEmuacrOS/oeaBr1xyXG4gICAgICAgICAgICBjb25zdCB1c2VEYXRhID0ge1xyXG4gICAgICAgICAgICAgICAgbmlja25hbWU6ICdjb2NvcyBjbGknXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGNvbnN0IHJlcGxhY2VDb250ZW50czogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcclxuICAgICAgICAgICAgICAgIC8vIOiOt+WPluS4gOS4quWPr+eUqOeahOexu+WQjVxyXG4gICAgICAgICAgICAgICAgTmFtZTogU2NyaXB0TmFtZUNoZWNrZXIuZ2V0VmFsaWRDbGFzc05hbWUoRmlsZUJhc2VuYW1lTm9FeHRlbnNpb24pLFxyXG4gICAgICAgICAgICAgICAgVW5kZXJzY29yZUNhc2VDbGFzc05hbWU6IFNjcmlwdE5hbWVDaGVja2VyLmdldFZhbGlkQ2xhc3NOYW1lKEZpbGVCYXNlbmFtZU5vRXh0ZW5zaW9uKSxcclxuICAgICAgICAgICAgICAgIENhbWVsQ2FzZUNsYXNzTmFtZTogc2NyaXB0TmFtZUNoZWNrZXIuZ2V0VmFsaWRDYW1lbENhc2VDbGFzc05hbWUoRmlsZUJhc2VuYW1lTm9FeHRlbnNpb24pLFxyXG4gICAgICAgICAgICAgICAgRGF0ZVRpbWU6IG5ldyBEYXRlKCkudG9TdHJpbmcoKSxcclxuICAgICAgICAgICAgICAgIEF1dGhvcjogdXNlRGF0YS5uaWNrbmFtZSxcclxuICAgICAgICAgICAgICAgIEZpbGVCYXNlbmFtZTogYmFzZW5hbWUob3B0aW9ucy50YXJnZXQpLFxyXG4gICAgICAgICAgICAgICAgRmlsZUJhc2VuYW1lTm9FeHRlbnNpb24sXHJcbiAgICAgICAgICAgICAgICBVUkw6IHF1ZXJ5VXJsKG9wdGlvbnMudGFyZ2V0KSxcclxuICAgICAgICAgICAgICAgIEVkaXRvclZlcnNpb246IEVuZ2luZS5nZXRJbmZvKCkudmVyc2lvbixcclxuICAgICAgICAgICAgICAgIE1hbnVhbFVybDogJ2h0dHBzOi8vZG9jcy5jb2Nvcy5jb20vY3JlYXRvci9tYW51YWwvZW4vc2NyaXB0aW5nL3NldHVwLmh0bWwjY3VzdG9tLXNjcmlwdC10ZW1wbGF0ZScsXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGNvbnN0IGNsYXNzS2V5ID0gc2NyaXB0TmFtZUNoZWNrZXIuY2xhc3NOYW1lU3RyaW5nRm9ybWF0LnN1YnN0cmluZygyLCBzY3JpcHROYW1lQ2hlY2tlci5jbGFzc05hbWVTdHJpbmdGb3JtYXQubGVuZ3RoIC0gMik7XHJcbiAgICAgICAgICAgIGlmIChjbGFzc0tleSBpbiByZXBsYWNlQ29udGVudHMpIHtcclxuICAgICAgICAgICAgICAgIGxldCBjbGFzc05hbWUgPSByZXBsYWNlQ29udGVudHNbY2xhc3NLZXldO1xyXG4gICAgICAgICAgICAgICAgaWYgKCFjbGFzc05hbWUgfHwgIVNjcmlwdE5hbWVDaGVja2VyLmludmFsaWRDbGFzc05hbWVSZWcudGVzdChjbGFzc05hbWUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVwbGFjZUNvbnRlbnRzLkRlZmF1bHRDYW1lbENhc2VDbGFzc05hbWUgPVxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXBsYWNlQ29udGVudHMuQ2FtZWxDYXNlQ2xhc3NOYW1lIHx8IFNjcmlwdE5hbWVDaGVja2VyLmdldERlZmF1bHRDbGFzc05hbWUoKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIVNjcmlwdE5hbWVDaGVja2VyLmludmFsaWRDbGFzc05hbWVSZWcudGVzdChjbGFzc05hbWUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnQgPSBjb250ZW50LnJlcGxhY2UoYEBjY2NsYXNzKCc8JSR7Y2xhc3NLZXl9JT4nKWAsIGBAY2NjbGFzcygnPCVEZWZhdWx0Q2FtZWxDYXNlQ2xhc3NOYW1lJT4nKWApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50ID0gY29udGVudC5yZXBsYWNlKGBjbGFzcyA8JSR7Y2xhc3NLZXl9JT5gLCBgY2xhc3MgPCVEZWZhdWx0Q2FtZWxDYXNlQ2xhc3NOYW1lJT5gKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lID0gcmVwbGFjZUNvbnRlbnRzLkRlZmF1bHRDYW1lbENhc2VDbGFzc05hbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgIXJlcGxhY2VDb250ZW50cy5DYW1lbENhc2VDbGFzc05hbWUgJiZcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaTE4bi50KCdpbXBvcnRlci5zY3JpcHQuZmluZF9jbGFzc19uYW1lX2Zyb21fZmlsZV9uYW1lX2ZhaWxlZCcsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlQmFzZW5hbWU6IEZpbGVCYXNlbmFtZU5vRXh0ZW5zaW9uLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmICghcmVwbGFjZUNvbnRlbnRzLkNhbWVsQ2FzZUNsYXNzTmFtZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghcmVwbGFjZUNvbnRlbnRzLk5hbWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVwbGFjZUNvbnRlbnRzLk5hbWUgPSBjbGFzc05hbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHJlcGxhY2VDb250ZW50cy5DYW1lbENhc2VDbGFzc05hbWUgPSBjbGFzc05hbWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgT2JqZWN0LmtleXMocmVwbGFjZUNvbnRlbnRzKS5mb3JFYWNoKChrZXkpID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnRlbnQgPSBjb250ZW50LnJlcGxhY2UobmV3IFJlZ0V4cChgPCUke2tleX0lPmAsICdnJyksIHJlcGxhY2VDb250ZW50c1trZXldKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIG91dHB1dEZpbGVTeW5jKG9wdGlvbnMudGFyZ2V0LCBjb250ZW50LCAndXRmLTgnKTtcclxuICAgICAgICAgICAgcmV0dXJuIG9wdGlvbnMudGFyZ2V0O1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcHJldmVudERlZmF1bHRUZW1wbGF0ZU1lbnU6IHRydWUsXHJcbiAgICB9LFxyXG5cclxuICAgIGltcG9ydGVyOiB7XHJcbiAgICAgICAgLi4uSmF2YXNjcmlwdEhhbmRsZXIuaW1wb3J0ZXIsXHJcbiAgICAgICAgYXN5bmMgaW1wb3J0KGFzc2V0OiBBc3NldCkge1xyXG4gICAgICAgICAgICBjb25zdCBmaWxlTmFtZSA9IGFzc2V0LnNvdXJjZTtcclxuICAgICAgICAgICAgaWYgKGZpbGVOYW1lLmVuZHNXaXRoKCcuZC50cycpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBsZXQgZG9UeXBlQ2hlY2sgPSBmYWxzZTtcclxuICAgICAgICAgICAgLy8gbGV0IGZhdGFsT25FcnJvciA9IGZhbHNlO1xyXG4gICAgICAgICAgICAvLyBjb25zdCBjaGVja0xldmVsID0gYXdhaXQgZ2V0VHlwZUNoZWNrTGV2ZWwoKTtcclxuICAgICAgICAgICAgLy8gc3dpdGNoIChjaGVja0xldmVsKSB7XHJcbiAgICAgICAgICAgIC8vICAgICBjYXNlICdjaGVja09ubHknOlxyXG4gICAgICAgICAgICAvLyAgICAgICAgIGRvVHlwZUNoZWNrID0gdHJ1ZTtcclxuICAgICAgICAgICAgLy8gICAgICAgICBmYXRhbE9uRXJyb3IgPSBmYWxzZTtcclxuICAgICAgICAgICAgLy8gICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgLy8gICAgIGNhc2UgJ2ZhdGFsT25FcnJvcic6XHJcbiAgICAgICAgICAgIC8vICAgICAgICAgZG9UeXBlQ2hlY2sgPSB0cnVlO1xyXG4gICAgICAgICAgICAvLyAgICAgICAgIGZhdGFsT25FcnJvciA9IHRydWU7XHJcbiAgICAgICAgICAgIC8vICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIC8vICAgICBjYXNlICdkaXNhYmxlJzpcclxuICAgICAgICAgICAgLy8gICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgIC8vICAgICAgICAgZG9UeXBlQ2hlY2sgPSBmYWxzZTtcclxuICAgICAgICAgICAgLy8gICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgLy8gfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIEphdmFzY3JpcHRIYW5kbGVyLmltcG9ydGVyLmltcG9ydChhc3NldCk7XHJcbiAgICAgICAgfSxcclxuICAgIH0sXHJcblxyXG4gICAgZGVzdHJveTogSmF2YXNjcmlwdEhhbmRsZXIuZGVzdHJveSxcclxuICAgIC8qKlxyXG4gICAgICog57G75Z6L5qOA5p+l5oyH5a6a6ISa5pys6LWE5rqQ44CCXHJcbiAgICAgKiBAcGFyYW0gYXNzZXQg6KaB5qOA5p+l55qE6ISa5pys6LWE5rqQ44CCXHJcbiAgICAgKiBAcmV0dXJucyDljIXlkKvplJnor6/ov5Tlm54gYHRydWVg77yM5ZCm5YiZ6L+U5ZueIGBmYWxzZWDjgIJcclxuICAgICAqL1xyXG4gICAgLy8gcHJpdmF0ZSBhc3luYyBfdHlwZUNoZWNrKGFzc2V0OiBBc3NldCkge1xyXG4gICAgLy8gICAgIGNvbnN0IGZpbGVOYW1lID0gYXNzZXQuc291cmNlO1xyXG4gICAgLy8gICAgIGNvbnN0IGNvbXBpbGVyT3B0aW9ucyA9IGdldENvbXBpbGVyT3B0aW9ucygpO1xyXG4gICAgLy8gICAgIGNvbnN0IHByb2dyYW0gPSB0cy5jcmVhdGVQcm9ncmFtKHtcclxuICAgIC8vICAgICAgICAgcm9vdE5hbWVzOiBbZmlsZU5hbWVdLFxyXG4gICAgLy8gICAgICAgICBvcHRpb25zOiBjb21waWxlck9wdGlvbnMsXHJcbiAgICAvLyAgICAgfSk7XHJcbiAgICAvLyAgICAgY29uc3Qgc291cmNlRmlsZSA9IHByb2dyYW0uZ2V0U291cmNlRmlsZShmaWxlTmFtZSk7XHJcbiAgICAvLyAgICAgaWYgKCFzb3VyY2VGaWxlKSB7XHJcbiAgICAvLyAgICAgICAgIGNvbnNvbGUuZGVidWcoYHByb2dyYW0gY3JlYXRlZCBpbiBfdHlwZUNoZWNrKCkgZG9lc24ndCBjb250YWluIG1haW4gZW50cnkgZmlsZT9gKTtcclxuICAgIC8vICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgLy8gICAgIH1cclxuICAgIC8vICAgICBjb25zdCBkaWFnbm9zdGljcyA9IHRzLmdldFByZUVtaXREaWFnbm9zdGljcyhwcm9ncmFtLCBzb3VyY2VGaWxlKTtcclxuICAgIC8vICAgICAvLyBjb25zdCBkaWFnbm9zdGljcyA9IHByb2dyYW0uZ2V0U3ludGFjdGljRGlhZ25vc3RpY3Moc291cmNlRmlsZSk7XHJcbiAgICAvLyAgICAgaWYgKCFkaWFnbm9zdGljcyB8fCBkaWFnbm9zdGljcy5sZW5ndGggPT09IDApIHtcclxuICAgIC8vICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgLy8gICAgIH1cclxuICAgIC8vICAgICBjb25zdCBmb3JtYXREaWFnbm9zdGljc0hvc3Q6IHRzLkZvcm1hdERpYWdub3N0aWNzSG9zdCA9IHtcclxuICAgIC8vICAgICAgICAgZ2V0Q3VycmVudERpcmVjdG9yeSgpIHtcclxuICAgIC8vICAgICAgICAgICAgIHJldHVybiBkaXJuYW1lKGFzc2V0LnNvdXJjZSk7XHJcbiAgICAvLyAgICAgICAgIH0sXHJcbiAgICAvLyAgICAgICAgIGdldENhbm9uaWNhbEZpbGVOYW1lKGZpbGVOYW1lOiBzdHJpbmcpIHtcclxuICAgIC8vICAgICAgICAgICAgIHJldHVybiBub3JtYWxpemUoZmlsZU5hbWUpO1xyXG4gICAgLy8gICAgICAgICB9LFxyXG4gICAgLy8gICAgICAgICBnZXROZXdMaW5lKCkge1xyXG4gICAgLy8gICAgICAgICAgICAgcmV0dXJuICdcXG4nO1xyXG4gICAgLy8gICAgICAgICB9LFxyXG4gICAgLy8gICAgIH07XHJcbiAgICAvLyAgICAgbGV0IG5FcnJvciA9IDA7XHJcbiAgICAvLyAgICAgZm9yIChjb25zdCBkaWFnbm9zdGljIG9mIGRpYWdub3N0aWNzKSB7XHJcbiAgICAvLyAgICAgICAgIGNvbnN0IHRleHQgPSB0cy5mb3JtYXREaWFnbm9zdGljKGRpYWdub3N0aWMsIGZvcm1hdERpYWdub3N0aWNzSG9zdCk7XHJcbiAgICAvLyAgICAgICAgIGxldCBwcmludGVyOiB1bmRlZmluZWQgfCAoKHRleHQ6IHN0cmluZykgPT4gdm9pZCk7XHJcbiAgICAvLyAgICAgICAgIHN3aXRjaCAoZGlhZ25vc3RpYy5jYXRlZ29yeSkge1xyXG4gICAgLy8gICAgICAgICAgICAgY2FzZSB0cy5EaWFnbm9zdGljQ2F0ZWdvcnkuRXJyb3I6XHJcbiAgICAvLyAgICAgICAgICAgICAgICAgKytuRXJyb3I7XHJcbiAgICAvLyAgICAgICAgICAgICAgICAgcHJpbnRlciA9IGNvbnNvbGUuZXJyb3I7XHJcbiAgICAvLyAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAvLyAgICAgICAgICAgICBjYXNlIHRzLkRpYWdub3N0aWNDYXRlZ29yeS5XYXJuaW5nOlxyXG4gICAgLy8gICAgICAgICAgICAgICAgIHByaW50ZXIgPSBjb25zb2xlLndhcm47XHJcbiAgICAvLyAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAvLyAgICAgICAgICAgICBjYXNlIHRzLkRpYWdub3N0aWNDYXRlZ29yeS5NZXNzYWdlOlxyXG4gICAgLy8gICAgICAgICAgICAgY2FzZSB0cy5EaWFnbm9zdGljQ2F0ZWdvcnkuU3VnZ2VzdGlvbjpcclxuICAgIC8vICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAvLyAgICAgICAgICAgICAgICAgcHJpbnRlciA9IGNvbnNvbGUubG9nO1xyXG4gICAgLy8gICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgLy8gICAgICAgICB9XHJcbiAgICAvLyAgICAgICAgIHByaW50ZXIodGV4dCk7XHJcbiAgICAvLyAgICAgfVxyXG4gICAgLy8gICAgIHJldHVybiBuRXJyb3IgIT09IDA7XHJcbiAgICAvLyB9XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBUeXBlU2NyaXB0SGFuZGxlcjtcclxuXHJcbi8vIGFzeW5jIGZ1bmN0aW9uIGdldFR5cGVDaGVja0xldmVsKCkge1xyXG4vLyAgICAgY29uc3QgZGF0YSA9IGF3YWl0IGNvbmZpZ3VyYXRpb25NYW5hZ2VyLmdldCgncHJvamVjdC5nZW5lcmFsLnR5cGVfY2hlY2tfbGV2ZWwnKTtcclxuLy8gICAgIHJldHVybiBkYXRhO1xyXG4vLyB9XHJcblxyXG4vLyBmdW5jdGlvbiBDb2Nvc1NjcmlwdEZyYW1lVHJhbnNmb3JtZXI8VCBleHRlbmRzIHRzLk5vZGU+KGNvbXByZXNzZWRVVUlEOiBzdHJpbmcsIGJhc2VuYW1lOiBzdHJpbmcpOiB0cy5UcmFuc2Zvcm1lckZhY3Rvcnk8VD4ge1xyXG4vLyAgICAgcmV0dXJuIChjb250ZXh0KSA9PiB7XHJcbi8vICAgICAgICAgY29uc3QgdmlzaXQ6IHRzLlZpc2l0b3IgPSAobm9kZSkgPT4ge1xyXG4vLyAgICAgICAgICAgICBpZiAodHMuaXNTb3VyY2VGaWxlKG5vZGUpKSB7XHJcbi8vICAgICAgICAgICAgICAgICAvLyBgY2MuX1JGLnB1c2god2luZG93Lm1vZHVsZSB8fCB7fSwgY29tcHJlc3NlZF91dWlkLCBiYXNlbmFtZSk7IC8vIGJlZ2luIGJhc2VuYW1lYDtcclxuLy8gICAgICAgICAgICAgICAgIGNvbnN0IGNjUkZQdXNoID0gdHMuY3JlYXRlRXhwcmVzc2lvblN0YXRlbWVudChcclxuLy8gICAgICAgICAgICAgICAgICAgICB0cy5jcmVhdGVDYWxsKFxyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICB0cy5jcmVhdGVQcm9wZXJ0eUFjY2VzcyhcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRzLmNyZWF0ZVByb3BlcnR5QWNjZXNzKHRzLmNyZWF0ZUlkZW50aWZpZXIoJ2NjJyksIHRzLmNyZWF0ZUlkZW50aWZpZXIoJ19SRicpKSxcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRzLmNyZWF0ZUlkZW50aWZpZXIoJ3B1c2gnKVxyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICApLFxyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICB1bmRlZmluZWQsIC8vIHR5cGVBcmd1bWVudHNcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgW1xyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHMuY3JlYXRlQmluYXJ5KFxyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRzLmNyZWF0ZVByb3BlcnR5QWNjZXNzKHRzLmNyZWF0ZUlkZW50aWZpZXIoJ3dpbmRvdycpLCB0cy5jcmVhdGVJZGVudGlmaWVyKCdtb2R1bGUnKSksXHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHMuU3ludGF4S2luZC5CYXJCYXJUb2tlbixcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cy5jcmVhdGVPYmplY3RMaXRlcmFsKClcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICksXHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cy5jcmVhdGVTdHJpbmdMaXRlcmFsKGNvbXByZXNzZWRVVUlEKSxcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRzLmNyZWF0ZVN0cmluZ0xpdGVyYWwoYmFzZW5hbWUpLFxyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICBdXHJcbi8vICAgICAgICAgICAgICAgICAgICAgKVxyXG4vLyAgICAgICAgICAgICAgICAgKTtcclxuLy8gICAgICAgICAgICAgICAgIC8vIGBjYy5fUkYucG9wKCk7IC8vIGVuZCBiYXNlbmFtZWBcclxuLy8gICAgICAgICAgICAgICAgIGNvbnN0IGNjUkZQb3AgPSB0cy5jcmVhdGVFeHByZXNzaW9uU3RhdGVtZW50KFxyXG4vLyAgICAgICAgICAgICAgICAgICAgIHRzLmNyZWF0ZUNhbGwoXHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgIHRzLmNyZWF0ZVByb3BlcnR5QWNjZXNzKFxyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHMuY3JlYXRlUHJvcGVydHlBY2Nlc3ModHMuY3JlYXRlSWRlbnRpZmllcignY2MnKSwgdHMuY3JlYXRlSWRlbnRpZmllcignX1JGJykpLFxyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHMuY3JlYXRlSWRlbnRpZmllcigncG9wJylcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgKSxcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgdW5kZWZpbmVkLCAvLyB0eXBlQXJndW1lbnRzXHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgIFtdXHJcbi8vICAgICAgICAgICAgICAgICAgICAgKVxyXG4vLyAgICAgICAgICAgICAgICAgKTtcclxuLy8gICAgICAgICAgICAgICAgIGNvbnN0IHN0YXRlbWVudHMgPSBuZXcgQXJyYXk8dHMuU3RhdGVtZW50PigpO1xyXG4vLyAgICAgICAgICAgICAgICAgc3RhdGVtZW50cy5wdXNoKGNjUkZQdXNoKTtcclxuLy8gICAgICAgICAgICAgICAgIHN0YXRlbWVudHMucHVzaCguLi4obm9kZS5zdGF0ZW1lbnRzKSk7XHJcbi8vICAgICAgICAgICAgICAgICBzdGF0ZW1lbnRzLnB1c2goY2NSRlBvcCk7XHJcbi8vICAgICAgICAgICAgICAgICByZXR1cm4gdHMudXBkYXRlU291cmNlRmlsZU5vZGUoXHJcbi8vICAgICAgICAgICAgICAgICAgICAgbm9kZSxcclxuLy8gICAgICAgICAgICAgICAgICAgICBzdGF0ZW1lbnRzLFxyXG4vLyAgICAgICAgICAgICAgICAgICAgIG5vZGUuaXNEZWNsYXJhdGlvbkZpbGUsXHJcbi8vICAgICAgICAgICAgICAgICAgICAgbm9kZS5yZWZlcmVuY2VkRmlsZXMsXHJcbi8vICAgICAgICAgICAgICAgICAgICAgbm9kZS50eXBlUmVmZXJlbmNlRGlyZWN0aXZlcyxcclxuLy8gICAgICAgICAgICAgICAgICAgICBub2RlLmhhc05vRGVmYXVsdExpYixcclxuLy8gICAgICAgICAgICAgICAgICAgICBub2RlLmxpYlJlZmVyZW5jZURpcmVjdGl2ZXMpO1xyXG4vLyAgICAgICAgICAgICB9XHJcbi8vICAgICAgICAgICAgIHJldHVybiB0cy52aXNpdEVhY2hDaGlsZChub2RlLCAoY2hpbGQpID0+IHZpc2l0KGNoaWxkKSwgY29udGV4dCk7XHJcbi8vICAgICAgICAgfTtcclxuLy8gICAgICAgICByZXR1cm4gKG5vZGUpID0+IHRzLnZpc2l0Tm9kZShub2RlLCB2aXNpdCk7XHJcbi8vICAgICB9O1xyXG4vLyB9XHJcblxyXG4vLyBmdW5jdGlvbiBDb2Nvc0xpYlRyYW5zZm9ybWVyPFQgZXh0ZW5kcyB0cy5Ob2RlPigpOiB0cy5UcmFuc2Zvcm1lckZhY3Rvcnk8VD4ge1xyXG4vLyAgICAgcmV0dXJuIChjb250ZXh0KSA9PiB7XHJcbi8vICAgICAgICAgY29uc3QgdmlzaXQ6IHRzLlZpc2l0b3IgPSAobm9kZSkgPT4ge1xyXG4vLyAgICAgICAgICAgICBpZiAoIXRzLmlzSW1wb3J0RGVjbGFyYXRpb24obm9kZSkgfHxcclxuLy8gICAgICAgICAgICAgICAgICFub2RlLmltcG9ydENsYXVzZSB8fCAvLyBgaW1wb3J0IFwieHhcIjtgIGlzIGlnbm9yZWQuXHJcbi8vICAgICAgICAgICAgICAgICAhdHMuaXNTdHJpbmdMaXRlcmFsKG5vZGUubW9kdWxlU3BlY2lmaWVyKSB8fFxyXG4vLyAgICAgICAgICAgICAgICAgbm9kZS5tb2R1bGVTcGVjaWZpZXIudGV4dCAhPT0gJ0NvY29zM0QnKSB7XHJcbi8vICAgICAgICAgICAgICAgICByZXR1cm4gdHMudmlzaXRFYWNoQ2hpbGQobm9kZSwgKGNoaWxkKSA9PiB2aXNpdChjaGlsZCksIGNvbnRleHQpO1xyXG4vLyAgICAgICAgICAgICB9XHJcbi8vICAgICAgICAgICAgIGNvbnN0IGNyZWF0ZUNDID0gKCkgPT4ge1xyXG4vLyAgICAgICAgICAgICAgICAgcmV0dXJuIHRzLmNyZWF0ZUlkZW50aWZpZXIoJ2NjJyk7XHJcbi8vICAgICAgICAgICAgIH07XHJcbi8vICAgICAgICAgICAgIGNvbnN0IHZhcmlhYmxlRGVjbGFyYXRpb25zID0gbmV3IEFycmF5PHRzLlZhcmlhYmxlRGVjbGFyYXRpb24+KCk7XHJcbi8vICAgICAgICAgICAgIGNvbnN0IG1ha2VEZWZhdWx0SW1wb3J0ID0gKGlkOiB0cy5JZGVudGlmaWVyKSA9PiB7XHJcbi8vICAgICAgICAgICAgICAgICB2YXJpYWJsZURlY2xhcmF0aW9ucy5wdXNoKHRzLmNyZWF0ZVZhcmlhYmxlRGVjbGFyYXRpb24oXHJcbi8vICAgICAgICAgICAgICAgICAgICAgdHMuY3JlYXRlSWRlbnRpZmllcihpZC50ZXh0KSxcclxuLy8gICAgICAgICAgICAgICAgICAgICB1bmRlZmluZWQsXHJcbi8vICAgICAgICAgICAgICAgICAgICAgY3JlYXRlQ0MoKVxyXG4vLyAgICAgICAgICAgICAgICAgKSk7XHJcbi8vICAgICAgICAgICAgIH07XHJcbi8vICAgICAgICAgICAgIGNvbnN0IHsgaW1wb3J0Q2xhdXNlOiB7IG5hbWUsIG5hbWVkQmluZGluZ3MgfSB9ID0gbm9kZTtcclxuLy8gICAgICAgICAgICAgaWYgKG5hbWUpIHtcclxuLy8gICAgICAgICAgICAgICAgIC8vIGltcG9ydCB4eCBmcm9tICdDb2NvczNEJztcclxuLy8gICAgICAgICAgICAgICAgIC8vIGNvbnN0IHh4ID0gY2M7XHJcbi8vICAgICAgICAgICAgICAgICBtYWtlRGVmYXVsdEltcG9ydChuYW1lKTtcclxuLy8gICAgICAgICAgICAgfVxyXG4vLyAgICAgICAgICAgICBpZiAobmFtZWRCaW5kaW5ncykge1xyXG4vLyAgICAgICAgICAgICAgICAgaWYgKHRzLmlzTmFtZXNwYWNlSW1wb3J0KG5hbWVkQmluZGluZ3MpKSB7XHJcbi8vICAgICAgICAgICAgICAgICAgICAgLy8gaW1wb3J0ICogYXMgeHggZnJvbSAnQ29jb3MzRCc7XHJcbi8vICAgICAgICAgICAgICAgICAgICAgLy8gY29uc3QgeHggPSBjYztcclxuLy8gICAgICAgICAgICAgICAgICAgICBtYWtlRGVmYXVsdEltcG9ydChuYW1lZEJpbmRpbmdzLm5hbWUpO1xyXG4vLyAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuLy8gICAgICAgICAgICAgICAgICAgICBjb25zdCBiaW5kaW5nRWxlbWVudHMgPSBuZXcgQXJyYXk8dHMuQmluZGluZ0VsZW1lbnQ+KCk7XHJcbi8vICAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCB7IG5hbWUsIHByb3BlcnR5TmFtZSB9IG9mIG5hbWVkQmluZGluZ3MuZWxlbWVudHMpIHtcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHByb3BlcnR5TmFtZSkge1xyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gaW1wb3J0IHsgeHggYXMgeXkgfSBmcm9tICdDb2NvczNEJztcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNvbnN0IHsgeHg6IHl5IH0gPSBjYztcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJpbmRpbmdFbGVtZW50cy5wdXNoKHRzLmNyZWF0ZUJpbmRpbmdFbGVtZW50KFxyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVuZGVmaW5lZCwgLy8gLi4uXHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHMuY3JlYXRlSWRlbnRpZmllcihwcm9wZXJ0eU5hbWUudGV4dCksXHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHMuY3JlYXRlSWRlbnRpZmllcihuYW1lLnRleHQpXHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICApKTtcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGltcG9ydCB7IHh4IH0gZnJvbSAnQ29jb3MzRCc7XHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBjb25zdCB7IHh4IH0gPSBjYztcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJpbmRpbmdFbGVtZW50cy5wdXNoKHRzLmNyZWF0ZUJpbmRpbmdFbGVtZW50KFxyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVuZGVmaW5lZCwgLy8gLi4uXHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdW5kZWZpbmVkLFxyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRzLmNyZWF0ZUlkZW50aWZpZXIobmFtZS50ZXh0KVxyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSk7XHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuLy8gICAgICAgICAgICAgICAgICAgICB9XHJcbi8vICAgICAgICAgICAgICAgICAgICAgdmFyaWFibGVEZWNsYXJhdGlvbnMucHVzaCh0cy5jcmVhdGVWYXJpYWJsZURlY2xhcmF0aW9uKFxyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICB0cy5jcmVhdGVPYmplY3RCaW5kaW5nUGF0dGVybihiaW5kaW5nRWxlbWVudHMpLFxyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICB1bmRlZmluZWQsIC8vIHR5cGVcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgY3JlYXRlQ0MoKVxyXG4vLyAgICAgICAgICAgICAgICAgICAgICkpO1xyXG4vLyAgICAgICAgICAgICAgICAgfVxyXG4vLyAgICAgICAgICAgICB9XHJcbi8vICAgICAgICAgICAgIGlmICh2YXJpYWJsZURlY2xhcmF0aW9ucy5sZW5ndGggPT09IDApIHtcclxuLy8gICAgICAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbi8vICAgICAgICAgICAgIH1cclxuLy8gICAgICAgICAgICAgcmV0dXJuIHRzLmNyZWF0ZVZhcmlhYmxlU3RhdGVtZW50KFxyXG4vLyAgICAgICAgICAgICAgICAgW3RzLmNyZWF0ZU1vZGlmaWVyKHRzLlN5bnRheEtpbmQuQ29uc3RLZXl3b3JkKV0sXHJcbi8vICAgICAgICAgICAgICAgICB2YXJpYWJsZURlY2xhcmF0aW9uc1xyXG4vLyAgICAgICAgICAgICApO1xyXG4vLyAgICAgICAgIH07XHJcbi8vICAgICAgICAgcmV0dXJuIChub2RlKSA9PiB0cy52aXNpdE5vZGUobm9kZSwgdmlzaXQpO1xyXG4vLyAgICAgfTtcclxuLy8gfVxyXG4iXX0=