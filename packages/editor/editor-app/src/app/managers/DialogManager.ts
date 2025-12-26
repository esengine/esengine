import { create } from 'zustand';
import type { ConfirmDialogData } from '../../services/TauriDialogService';

interface ErrorDialogData {
    title: string;
    message: string;
}

/**
 * 外部修改对话框数据
 * External modification dialog data
 */
export interface ExternalModificationDialogData {
    sceneName: string;
    onReload: () => void;
    onOverwrite: () => void;
}

interface DialogState {
    showProfiler: boolean;
    showAdvancedProfiler: boolean;
    showPortManager: boolean;
    showSettings: boolean;
    showAbout: boolean;
    showPluginGenerator: boolean;
    showBuildSettings: boolean;
    showRenderDebug: boolean;
    errorDialog: ErrorDialogData | null;
    confirmDialog: ConfirmDialogData | null;
    externalModificationDialog: ExternalModificationDialogData | null;

    setShowProfiler: (show: boolean) => void;
    setShowAdvancedProfiler: (show: boolean) => void;
    setShowPortManager: (show: boolean) => void;
    setShowSettings: (show: boolean) => void;
    setShowAbout: (show: boolean) => void;
    setShowPluginGenerator: (show: boolean) => void;
    setShowBuildSettings: (show: boolean) => void;
    setShowRenderDebug: (show: boolean) => void;
    setErrorDialog: (data: ErrorDialogData | null) => void;
    setConfirmDialog: (data: ConfirmDialogData | null) => void;
    setExternalModificationDialog: (data: ExternalModificationDialogData | null) => void;
    closeAllDialogs: () => void;
}

export const useDialogStore = create<DialogState>((set) => ({
    showProfiler: false,
    showAdvancedProfiler: false,
    showPortManager: false,
    showSettings: false,
    showAbout: false,
    showPluginGenerator: false,
    showBuildSettings: false,
    showRenderDebug: false,
    errorDialog: null,
    confirmDialog: null,
    externalModificationDialog: null,

    setShowProfiler: (show) => set({ showProfiler: show }),
    setShowAdvancedProfiler: (show) => set({ showAdvancedProfiler: show }),
    setShowPortManager: (show) => set({ showPortManager: show }),
    setShowSettings: (show) => set({ showSettings: show }),
    setShowAbout: (show) => set({ showAbout: show }),
    setShowPluginGenerator: (show) => set({ showPluginGenerator: show }),
    setShowBuildSettings: (show) => set({ showBuildSettings: show }),
    setShowRenderDebug: (show) => set({ showRenderDebug: show }),
    setErrorDialog: (data) => set({ errorDialog: data }),
    setConfirmDialog: (data) => set({ confirmDialog: data }),
    setExternalModificationDialog: (data) => set({ externalModificationDialog: data }),

    closeAllDialogs: () => set({
        showProfiler: false,
        showAdvancedProfiler: false,
        showPortManager: false,
        showSettings: false,
        showAbout: false,
        showPluginGenerator: false,
        showBuildSettings: false,
        showRenderDebug: false,
        errorDialog: null,
        confirmDialog: null,
        externalModificationDialog: null
    })
}));
