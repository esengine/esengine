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
exports.transformPluginScript = transformPluginScript;
const babel = __importStar(require("@babel/core"));
async function transformPluginScript(code, options) {
    // 模拟 babel 的 auto compact 行为，超过 500kb 不开启 compact 选项
    // babel compact 选项默认传入 'auto'，当脚本超过 500 kb 时，会有报错提示，影响用户体验
    const autoCompact = code.length > 500000 ? false : true;
    const babelResult = await babel.transformAsync(code, {
        compact: autoCompact,
        plugins: [[wrapPluginScript(options)]],
    });
    if (!babelResult) {
        return {
            code,
        };
    }
    return {
        code: babelResult.code,
    };
}
const wrapPluginScript = (options) => {
    const programBodyTemplate = babel.template.statements(`(function(root) {
    %%HIDE_COMMONJS%%;
    %%HIDE_AMD%%;
    %%SIMULATE_GLOBALS%%;
    (function() {
        %%ORIGINAL_CODE%%
    }).call(root);
})(
    // The environment-specific global.
    (function() {
        if (typeof globalThis !== 'undefined') return globalThis;
        if (typeof self !== 'undefined') return self;
        if (typeof window !== 'undefined') return window;
        if (typeof global !== 'undefined') return global;
        if (typeof this !== 'undefined') return this;
        return {};
    }).call(this),
);
`, {
        preserveComments: true,
        // @ts-ignore
        syntacticPlaceholders: true,
    });
    return {
        visitor: {
            Program: (path, state) => {
                let HIDE_COMMONJS;
                if (options.hideCommonJs) {
                    HIDE_COMMONJS = babel.types.variableDeclaration('var', ['exports', 'module', 'require'].map((variableName) => babel.types.variableDeclarator(babel.types.identifier(variableName), babel.types.identifier('undefined'))));
                }
                let HIDE_AMD;
                if (options.hideAmd) {
                    HIDE_AMD = babel.types.variableDeclaration('var', ['define'].map((variableName) => babel.types.variableDeclarator(babel.types.identifier(variableName), babel.types.identifier('undefined'))));
                }
                let SIMULATE_GLOBALS;
                if (options.simulateGlobals && options.simulateGlobals.length !== 0) {
                    SIMULATE_GLOBALS = babel.types.variableDeclaration('var', options.simulateGlobals.map((variableName) => babel.types.variableDeclarator(babel.types.identifier(variableName), babel.types.identifier('root'))));
                }
                path.node.body = programBodyTemplate({
                    ORIGINAL_CODE: path.node.body,
                    SIMULATE_GLOBALS,
                    HIDE_COMMONJS,
                    HIDE_AMD,
                });
            },
        },
    };
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NyaXB0LWNvbXBpbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2NvcmUvYXNzZXRzL2Fzc2V0LWhhbmRsZXIvYXNzZXRzL3V0aWxzL3NjcmlwdC1jb21waWxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVBLHNEQWdCQztBQWxCRCxtREFBcUM7QUFFOUIsS0FBSyxVQUFVLHFCQUFxQixDQUFDLElBQVksRUFBRSxPQUFzQztJQUM1RixxREFBcUQ7SUFDckQsMkRBQTJEO0lBQzNELE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztJQUN4RCxNQUFNLFdBQVcsR0FBRyxNQUFNLEtBQUssQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFO1FBQ2pELE9BQU8sRUFBRSxXQUFXO1FBQ3BCLE9BQU8sRUFBRSxDQUFDLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztLQUN6QyxDQUFDLENBQUM7SUFDSCxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDZixPQUFPO1lBQ0gsSUFBSTtTQUNQLENBQUM7SUFDTixDQUFDO0lBQ0QsT0FBTztRQUNILElBQUksRUFBRSxXQUFXLENBQUMsSUFBYztLQUNuQyxDQUFDO0FBQ04sQ0FBQztBQUVELE1BQU0sZ0JBQWdCLEdBQUcsQ0FBQyxPQUFzQyxFQUFtQixFQUFFO0lBQ2pGLE1BQU0sbUJBQW1CLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQ2pEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FrQlAsRUFDTztRQUNJLGdCQUFnQixFQUFFLElBQUk7UUFDdEIsYUFBYTtRQUNiLHFCQUFxQixFQUFFLElBQUk7S0FDdkIsQ0FDWCxDQUFDO0lBRUYsT0FBTztRQUNILE9BQU8sRUFBRTtZQUNMLE9BQU8sRUFBRSxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsRUFBRTtnQkFDckIsSUFBSSxhQUFhLENBQUM7Z0JBQ2xCLElBQUksT0FBTyxDQUFDLFlBQVksRUFBRSxDQUFDO29CQUN2QixhQUFhLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsQ0FDM0MsS0FBSyxFQUNMLENBQUMsU0FBUyxFQUFFLFFBQVEsRUFBRSxTQUFTLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxZQUFZLEVBQUUsRUFBRSxDQUNsRCxLQUFLLENBQUMsS0FBSyxDQUFDLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxFQUFFLEtBQUssQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQzVHLENBQ0osQ0FBQztnQkFDTixDQUFDO2dCQUVELElBQUksUUFBUSxDQUFDO2dCQUNiLElBQUksT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO29CQUNsQixRQUFRLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsQ0FDdEMsS0FBSyxFQUNMLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsWUFBWSxFQUFFLEVBQUUsQ0FDNUIsS0FBSyxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsRUFBRSxLQUFLLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUM1RyxDQUNKLENBQUM7Z0JBQ04sQ0FBQztnQkFFRCxJQUFJLGdCQUFnQixDQUFDO2dCQUNyQixJQUFJLE9BQU8sQ0FBQyxlQUFlLElBQUksT0FBTyxDQUFDLGVBQWUsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFLENBQUM7b0JBQ2xFLGdCQUFnQixHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsbUJBQW1CLENBQzlDLEtBQUssRUFDTCxPQUFPLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxDQUFDLFlBQVksRUFBRSxFQUFFLENBQ3pDLEtBQUssQ0FBQyxLQUFLLENBQUMsa0JBQWtCLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLEVBQUUsS0FBSyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FDdkcsQ0FDSixDQUFDO2dCQUNOLENBQUM7Z0JBRUQsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEdBQUcsbUJBQW1CLENBQUM7b0JBQ2pDLGFBQWEsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUk7b0JBQzdCLGdCQUFnQjtvQkFDaEIsYUFBYTtvQkFDYixRQUFRO2lCQUNYLENBQUMsQ0FBQztZQUNQLENBQUM7U0FDSjtLQUNKLENBQUM7QUFDTixDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBiYWJlbCBmcm9tICdAYmFiZWwvY29yZSc7XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gdHJhbnNmb3JtUGx1Z2luU2NyaXB0KGNvZGU6IHN0cmluZywgb3B0aW9uczogdHJhbnNmb3JtUGx1Z2luU2NyaXB0Lk9wdGlvbnMpIHtcclxuICAgIC8vIOaooeaLnyBiYWJlbCDnmoQgYXV0byBjb21wYWN0IOihjOS4uu+8jOi2hei/hyA1MDBrYiDkuI3lvIDlkK8gY29tcGFjdCDpgInpoblcclxuICAgIC8vIGJhYmVsIGNvbXBhY3Qg6YCJ6aG56buY6K6k5Lyg5YWlICdhdXRvJ++8jOW9k+iEmuacrOi2hei/hyA1MDAga2Ig5pe277yM5Lya5pyJ5oql6ZSZ5o+Q56S677yM5b2x5ZON55So5oi35L2T6aqMXHJcbiAgICBjb25zdCBhdXRvQ29tcGFjdCA9IGNvZGUubGVuZ3RoID4gNTAwMDAwID8gZmFsc2UgOiB0cnVlO1xyXG4gICAgY29uc3QgYmFiZWxSZXN1bHQgPSBhd2FpdCBiYWJlbC50cmFuc2Zvcm1Bc3luYyhjb2RlLCB7XHJcbiAgICAgICAgY29tcGFjdDogYXV0b0NvbXBhY3QsXHJcbiAgICAgICAgcGx1Z2luczogW1t3cmFwUGx1Z2luU2NyaXB0KG9wdGlvbnMpXV0sXHJcbiAgICB9KTtcclxuICAgIGlmICghYmFiZWxSZXN1bHQpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBjb2RlLFxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIGNvZGU6IGJhYmVsUmVzdWx0LmNvZGUgYXMgc3RyaW5nLFxyXG4gICAgfTtcclxufVxyXG5cclxuY29uc3Qgd3JhcFBsdWdpblNjcmlwdCA9IChvcHRpb25zOiB0cmFuc2Zvcm1QbHVnaW5TY3JpcHQuT3B0aW9ucyk6IGJhYmVsLlBsdWdpbk9iaiA9PiB7XHJcbiAgICBjb25zdCBwcm9ncmFtQm9keVRlbXBsYXRlID0gYmFiZWwudGVtcGxhdGUuc3RhdGVtZW50cyhcclxuICAgICAgICBgKGZ1bmN0aW9uKHJvb3QpIHtcclxuICAgICUlSElERV9DT01NT05KUyUlO1xyXG4gICAgJSVISURFX0FNRCUlO1xyXG4gICAgJSVTSU1VTEFURV9HTE9CQUxTJSU7XHJcbiAgICAoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgJSVPUklHSU5BTF9DT0RFJSVcclxuICAgIH0pLmNhbGwocm9vdCk7XHJcbn0pKFxyXG4gICAgLy8gVGhlIGVudmlyb25tZW50LXNwZWNpZmljIGdsb2JhbC5cclxuICAgIChmdW5jdGlvbigpIHtcclxuICAgICAgICBpZiAodHlwZW9mIGdsb2JhbFRoaXMgIT09ICd1bmRlZmluZWQnKSByZXR1cm4gZ2xvYmFsVGhpcztcclxuICAgICAgICBpZiAodHlwZW9mIHNlbGYgIT09ICd1bmRlZmluZWQnKSByZXR1cm4gc2VsZjtcclxuICAgICAgICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcpIHJldHVybiB3aW5kb3c7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnKSByZXR1cm4gZ2xvYmFsO1xyXG4gICAgICAgIGlmICh0eXBlb2YgdGhpcyAhPT0gJ3VuZGVmaW5lZCcpIHJldHVybiB0aGlzO1xyXG4gICAgICAgIHJldHVybiB7fTtcclxuICAgIH0pLmNhbGwodGhpcyksXHJcbik7XHJcbmAsXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBwcmVzZXJ2ZUNvbW1lbnRzOiB0cnVlLFxyXG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlXHJcbiAgICAgICAgICAgIHN5bnRhY3RpY1BsYWNlaG9sZGVyczogdHJ1ZSxcclxuICAgICAgICB9IGFzIGFueSxcclxuICAgICk7XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICB2aXNpdG9yOiB7XHJcbiAgICAgICAgICAgIFByb2dyYW06IChwYXRoLCBzdGF0ZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgbGV0IEhJREVfQ09NTU9OSlM7XHJcbiAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy5oaWRlQ29tbW9uSnMpIHtcclxuICAgICAgICAgICAgICAgICAgICBISURFX0NPTU1PTkpTID0gYmFiZWwudHlwZXMudmFyaWFibGVEZWNsYXJhdGlvbihcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ3ZhcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFsnZXhwb3J0cycsICdtb2R1bGUnLCAncmVxdWlyZSddLm1hcCgodmFyaWFibGVOYW1lKSA9PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFiZWwudHlwZXMudmFyaWFibGVEZWNsYXJhdG9yKGJhYmVsLnR5cGVzLmlkZW50aWZpZXIodmFyaWFibGVOYW1lKSwgYmFiZWwudHlwZXMuaWRlbnRpZmllcigndW5kZWZpbmVkJykpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICApLFxyXG4gICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IEhJREVfQU1EO1xyXG4gICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMuaGlkZUFtZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIEhJREVfQU1EID0gYmFiZWwudHlwZXMudmFyaWFibGVEZWNsYXJhdGlvbihcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ3ZhcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFsnZGVmaW5lJ10ubWFwKCh2YXJpYWJsZU5hbWUpID0+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWJlbC50eXBlcy52YXJpYWJsZURlY2xhcmF0b3IoYmFiZWwudHlwZXMuaWRlbnRpZmllcih2YXJpYWJsZU5hbWUpLCBiYWJlbC50eXBlcy5pZGVudGlmaWVyKCd1bmRlZmluZWQnKSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICksXHJcbiAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgU0lNVUxBVEVfR0xPQkFMUztcclxuICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLnNpbXVsYXRlR2xvYmFscyAmJiBvcHRpb25zLnNpbXVsYXRlR2xvYmFscy5sZW5ndGggIT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBTSU1VTEFURV9HTE9CQUxTID0gYmFiZWwudHlwZXMudmFyaWFibGVEZWNsYXJhdGlvbihcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ3ZhcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnMuc2ltdWxhdGVHbG9iYWxzLm1hcCgodmFyaWFibGVOYW1lKSA9PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFiZWwudHlwZXMudmFyaWFibGVEZWNsYXJhdG9yKGJhYmVsLnR5cGVzLmlkZW50aWZpZXIodmFyaWFibGVOYW1lKSwgYmFiZWwudHlwZXMuaWRlbnRpZmllcigncm9vdCcpKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgKSxcclxuICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHBhdGgubm9kZS5ib2R5ID0gcHJvZ3JhbUJvZHlUZW1wbGF0ZSh7XHJcbiAgICAgICAgICAgICAgICAgICAgT1JJR0lOQUxfQ09ERTogcGF0aC5ub2RlLmJvZHksXHJcbiAgICAgICAgICAgICAgICAgICAgU0lNVUxBVEVfR0xPQkFMUyxcclxuICAgICAgICAgICAgICAgICAgICBISURFX0NPTU1PTkpTLFxyXG4gICAgICAgICAgICAgICAgICAgIEhJREVfQU1ELFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfSxcclxuICAgIH07XHJcbn07XHJcbmV4cG9ydCBuYW1lc3BhY2UgdHJhbnNmb3JtUGx1Z2luU2NyaXB0IHtcclxuICAgIGV4cG9ydCBpbnRlcmZhY2UgT3B0aW9ucyB7XHJcbiAgICAgICAgc2ltdWxhdGVHbG9iYWxzOiBzdHJpbmdbXTtcclxuICAgICAgICBoaWRlQ29tbW9uSnM6IGJvb2xlYW47XHJcbiAgICAgICAgaGlkZUFtZDogYm9vbGVhbjtcclxuICAgIH1cclxufVxyXG4iXX0=