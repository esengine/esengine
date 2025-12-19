/**
 * UI Utilities
 * UI 工具函数
 */

export {
    // Texture utilities | 纹理工具
    type UITextureDescriptor,
    type UINinePatchDescriptor,
    isValidTexture,
    isValidTextureGuid,
    getTextureKey,
    defaultUV,
    normalizeTextureDescriptor,
    extractTextureGuid,
    mergeTextureDescriptors,
    isValidNinePatchMargins,
    getNinePatchMinSize
} from './UITextureUtils';

export {
    // Dirty flag utilities | 脏标记工具
    UIDirtyFlags,
    type IDirtyTrackable,
    DirtyOnChange,
    DirtyTracker,
    markFrameDirty,
    isFrameDirty,
    getDirtyComponentCount,
    clearFrameDirty
} from './UIDirtyFlags';

export {
    // Text measure utilities | 文本测量工具
    getTextMeasureService,
    disposeTextMeasureService,
    type TextMeasureFont,
    type CharacterPosition,
    type LineInfo
} from './TextMeasureService';
