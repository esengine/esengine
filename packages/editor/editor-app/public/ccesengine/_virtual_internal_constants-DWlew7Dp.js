function tryDefineGlobal (name, value) {
    const _global = typeof window === 'undefined' ? global : window;
    if (typeof _global[name] === 'undefined') {
        return (_global[name] = value);
    } else {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return _global[name];
    }
}
tryDefineGlobal('CC_WECHAT', false);

const WECHAT_MINI_PROGRAM = false;

const XIAOMI = false;
tryDefineGlobal('CC_XIAOMI', false);
tryDefineGlobal('CC_ALIPAY', false);

const BYTEDANCE = false;
tryDefineGlobal('CC_BYTEDANCE', false);
tryDefineGlobal('CC_OPPO', false);
tryDefineGlobal('CC_VIVO', false);
tryDefineGlobal('CC_HUAWEI', false);
tryDefineGlobal('CC_MIGU', false);
tryDefineGlobal('CC_HONOR', false);
tryDefineGlobal('CC_COCOS_RUNTIME', false);
tryDefineGlobal('CC_SUD', false);
tryDefineGlobal('CC_NODEJS', false);

const EDITOR = false;
tryDefineGlobal('CC_EDITOR', false);

const EDITOR_NOT_IN_PREVIEW = false;

const PREVIEW = true;
tryDefineGlobal('CC_PREVIEW', true);
tryDefineGlobal('CC_BUILD', false);

const TEST = false;
tryDefineGlobal('CC_TEST', false);
tryDefineGlobal('CC_DEBUG', true);

const DEV = true;
tryDefineGlobal('CC_DEV', true);
tryDefineGlobal('CC_MINIGAME', false);
tryDefineGlobal('CC_RUNTIME_BASED', false);

const SUPPORT_JIT = false;
tryDefineGlobal('CC_SUPPORT_JIT', false);
tryDefineGlobal('CC_JSB', false);

const USE_XR = true;

export { BYTEDANCE as B, DEV as D, EDITOR as E, PREVIEW as P, SUPPORT_JIT as S, TEST as T, USE_XR as U, WECHAT_MINI_PROGRAM as W, XIAOMI as X, EDITOR_NOT_IN_PREVIEW as a };
//# sourceMappingURL=_virtual_internal_constants-DWlew7Dp.js.map
