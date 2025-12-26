/**
 * @zh 场景操作 Hook
 * @en Scene Actions Hook
 *
 * @zh 封装场景相关的操作（新建、打开、保存场景）
 * @en Encapsulates scene-related operations (new, open, save scene)
 */

import { useCallback } from 'react';
import { Core } from '@esengine/ecs-framework';
import { SceneManagerService, UserCodeService } from '@esengine/editor-core';
import { useEditorStore, useDialogStore } from '../stores';
import { useLocale } from './useLocale';

interface UseSceneActionsParams {
    sceneManagerRef: React.RefObject<SceneManagerService | null>;
    showToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export function useSceneActions({
    sceneManagerRef,
    showToast,
}: UseSceneActionsParams) {
    const { t } = useLocale();
    const { setStatus } = useEditorStore();
    const { setErrorDialog } = useDialogStore();

    /**
     * @zh 新建场景
     * @en Create new scene
     */
    const handleNewScene = useCallback(async () => {
        const sceneManager = sceneManagerRef.current;
        if (!sceneManager) {
            console.error('SceneManagerService not available');
            return;
        }

        try {
            await sceneManager.newScene();
            setStatus(t('scene.newCreated'));
        } catch (error) {
            console.error('Failed to create new scene:', error);
            setStatus(t('scene.createFailed'));
        }
    }, [t, sceneManagerRef, setStatus]);

    /**
     * @zh 打开场景（通过对话框选择）
     * @en Open scene (via dialog)
     */
    const handleOpenScene = useCallback(async () => {
        const sceneManager = sceneManagerRef.current;
        if (!sceneManager) {
            console.error('SceneManagerService not available');
            return;
        }

        try {
            const userCodeService = Core.services.tryResolve(UserCodeService);
            if (userCodeService) {
                await userCodeService.waitForReady();
            }

            await sceneManager.openScene();
            const sceneState = sceneManager.getSceneState();
            setStatus(t('scene.openedSuccess', { name: sceneState.sceneName }));
        } catch (error) {
            console.error('Failed to open scene:', error);
            setStatus(t('scene.openFailed'));
        }
    }, [t, sceneManagerRef, setStatus]);

    /**
     * @zh 通过路径打开场景
     * @en Open scene by path
     */
    const handleOpenSceneByPath = useCallback(async (scenePath: string) => {
        console.log('[useSceneActions] handleOpenSceneByPath called:', scenePath);
        const sceneManager = sceneManagerRef.current;
        if (!sceneManager) {
            console.error('SceneManagerService not available');
            return;
        }

        try {
            const userCodeService = Core.services.tryResolve(UserCodeService);
            if (userCodeService) {
                console.log('[useSceneActions] Waiting for user code service...');
                await userCodeService.waitForReady();
                console.log('[useSceneActions] User code service ready');
            }

            console.log('[useSceneActions] Calling sceneManager.openScene...');
            await sceneManager.openScene(scenePath);
            console.log('[useSceneActions] Scene opened successfully');
            const sceneState = sceneManager.getSceneState();
            setStatus(t('scene.openedSuccess', { name: sceneState.sceneName }));
        } catch (error) {
            console.error('Failed to open scene:', error);
            setStatus(t('scene.openFailed'));
            setErrorDialog({
                title: t('scene.openFailed'),
                message: `${t('scene.openFailed')}:\n${error instanceof Error ? error.message : String(error)}`
            });
        }
    }, [t, sceneManagerRef, setStatus, setErrorDialog]);

    /**
     * @zh 保存场景
     * @en Save scene
     */
    const handleSaveScene = useCallback(async () => {
        const sceneManager = sceneManagerRef.current;
        if (!sceneManager) {
            console.error('SceneManagerService not available');
            return;
        }

        try {
            await sceneManager.saveScene();
            const sceneState = sceneManager.getSceneState();
            setStatus(t('scene.savedSuccess', { name: sceneState.sceneName }));
        } catch (error) {
            console.error('Failed to save scene:', error);
            setStatus(t('scene.saveFailed'));
        }
    }, [t, sceneManagerRef, setStatus]);

    /**
     * @zh 另存为场景
     * @en Save scene as
     */
    const handleSaveSceneAs = useCallback(async () => {
        const sceneManager = sceneManagerRef.current;
        if (!sceneManager) {
            console.error('SceneManagerService not available');
            return;
        }

        try {
            await sceneManager.saveSceneAs();
            const sceneState = sceneManager.getSceneState();
            setStatus(t('scene.savedSuccess', { name: sceneState.sceneName }));
        } catch (error) {
            console.error('Failed to save scene as:', error);
            setStatus(t('scene.saveAsFailed'));
        }
    }, [t, sceneManagerRef, setStatus]);

    /**
     * @zh 保存预制体或场景（用于快捷键）
     * @en Save prefab or scene (for shortcut)
     */
    const handleSave = useCallback(async () => {
        const sceneManager = sceneManagerRef.current;
        if (!sceneManager) return;

        try {
            if (sceneManager.isPrefabEditMode()) {
                await sceneManager.savePrefab();
                const prefabState = sceneManager.getPrefabEditModeState();
                showToast(t('editMode.prefab.savedSuccess', { name: prefabState?.prefabName ?? 'Prefab' }), 'success');
            } else {
                await sceneManager.saveScene();
                const sceneState = sceneManager.getSceneState();
                showToast(t('scene.savedSuccess', { name: sceneState.sceneName }), 'success');
            }
        } catch (error) {
            console.error('Failed to save:', error);
            if (sceneManager.isPrefabEditMode()) {
                showToast(t('editMode.prefab.saveFailed'), 'error');
            } else {
                showToast(t('scene.saveFailed'), 'error');
            }
        }
    }, [t, sceneManagerRef, showToast]);

    return {
        handleNewScene,
        handleOpenScene,
        handleOpenSceneByPath,
        handleSaveScene,
        handleSaveSceneAs,
        handleSave,
    };
}
