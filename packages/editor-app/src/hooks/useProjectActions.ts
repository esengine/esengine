/**
 * @zh 项目操作 Hook
 * @en Project Actions Hook
 *
 * @zh 封装项目相关的操作（打开、创建、关闭项目）
 * @en Encapsulates project-related operations (open, create, close project)
 */

import { useCallback } from 'react';
import { Core } from '@esengine/ecs-framework';
import {
    ProjectService,
    PluginManager,
    SceneManagerService,
    UserCodeService
} from '@esengine/editor-core';
import { useEditorStore, useDialogStore } from '../stores';
import { TauriAPI } from '../api/tauri';
import { SettingsService } from '../services/SettingsService';
import { EngineService } from '../services/EngineService';
import { PluginLoader } from '../services/PluginLoader';
import { useLocale } from './useLocale';

interface UseProjectActionsParams {
    pluginLoader: PluginLoader;
    pluginManagerRef: React.RefObject<PluginManager | null>;
    projectServiceRef: React.RefObject<ProjectService | null>;
    showToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export function useProjectActions({
    pluginLoader,
    pluginManagerRef,
    projectServiceRef,
    showToast,
}: UseProjectActionsParams) {
    const { t } = useLocale();

    const {
        setProjectLoaded,
        setCurrentProjectPath,
        setAvailableScenes,
        setIsLoading,
        setStatus,
        setShowProjectWizard,
    } = useEditorStore();

    const { setErrorDialog, setConfirmDialog } = useDialogStore();

    /**
     * @zh 打开最近项目
     * @en Open recent project
     */
    const handleOpenRecentProject = useCallback(async (projectPath: string) => {
        try {
            setIsLoading(true, t('loading.step1'));

            const projectService = Core.services.resolve(ProjectService);
            if (!projectService) {
                console.error('Required services not available');
                setIsLoading(false);
                return;
            }

            projectServiceRef.current = projectService;
            await projectService.openProject(projectPath);

            await TauriAPI.setProjectBasePath(projectPath);

            try {
                await TauriAPI.updateProjectTsconfig(projectPath);
            } catch (e) {
                console.warn('[useProjectActions] Failed to update project tsconfig:', e);
            }

            const settings = SettingsService.getInstance();
            settings.addRecentProject(projectPath);

            setCurrentProjectPath(projectPath);

            try {
                const sceneFiles = await TauriAPI.scanDirectory(`${projectPath}/scenes`, '*.ecs');
                const sceneNames = sceneFiles.map(f => `scenes/${f.split(/[\\/]/).pop()}`);
                setAvailableScenes(sceneNames);
            } catch (e) {
                console.warn('[useProjectActions] Failed to scan scenes:', e);
            }

            setProjectLoaded(true);

            setIsLoading(true, t('loading.step2'));
            const engineService = EngineService.getInstance();

            const engineReady = await engineService.waitForInitialization(30000);
            if (!engineReady) {
                throw new Error(t('loading.engineTimeoutError'));
            }

            if (pluginManagerRef.current) {
                const pluginSettings = projectService.getPluginSettings();
                if (pluginSettings && pluginSettings.enabledPlugins.length > 0) {
                    await pluginManagerRef.current.loadConfig({ enabledPlugins: pluginSettings.enabledPlugins });
                }
            }

            await engineService.initializeModuleSystems();

            const uiResolution = projectService.getUIDesignResolution();
            engineService.setUICanvasSize(uiResolution.width, uiResolution.height);

            setStatus(t('header.status.projectOpened'));
            setIsLoading(true, t('loading.step3'));

            const userCodeService = Core.services.tryResolve(UserCodeService);
            if (userCodeService) {
                await userCodeService.waitForReady();
            }

            const sceneManagerService = Core.services.resolve(SceneManagerService);
            if (sceneManagerService) {
                await sceneManagerService.newScene();
            }

            if (pluginManagerRef.current) {
                setIsLoading(true, t('loading.loadingPlugins'));
                await pluginLoader.loadProjectPlugins(projectPath, pluginManagerRef.current);
            }

            setIsLoading(false);
        } catch (error) {
            console.error('Failed to open project:', error);
            setStatus(t('header.status.failed'));
            setIsLoading(false);

            const errorMessage = error instanceof Error ? error.message : String(error);
            setErrorDialog({
                title: t('project.openFailed'),
                message: `${t('project.openFailed')}:\n${errorMessage}`
            });
        }
    }, [t, pluginLoader, pluginManagerRef, projectServiceRef, setProjectLoaded, setCurrentProjectPath, setAvailableScenes, setIsLoading, setStatus, setErrorDialog]);

    /**
     * @zh 打开项目对话框
     * @en Open project dialog
     */
    const handleOpenProject = useCallback(async () => {
        try {
            const projectPath = await TauriAPI.openProjectDialog();
            if (!projectPath) return;

            await handleOpenRecentProject(projectPath);
        } catch (error) {
            console.error('Failed to open project dialog:', error);
        }
    }, [handleOpenRecentProject]);

    /**
     * @zh 显示创建项目向导
     * @en Show create project wizard
     */
    const handleCreateProject = useCallback(() => {
        setShowProjectWizard(true);
    }, [setShowProjectWizard]);

    /**
     * @zh 从向导创建项目
     * @en Create project from wizard
     */
    const handleCreateProjectFromWizard = useCallback(async (
        projectName: string,
        projectPath: string,
        _templateId: string
    ) => {
        const sep = projectPath.includes('/') ? '/' : '\\';
        const fullProjectPath = `${projectPath}${sep}${projectName}`;

        try {
            setIsLoading(true, t('project.creating'));

            const projectService = Core.services.resolve(ProjectService);
            if (!projectService) {
                console.error('ProjectService not available');
                setIsLoading(false);
                setErrorDialog({
                    title: t('project.createFailed'),
                    message: t('project.serviceUnavailable')
                });
                return;
            }

            await projectService.createProject(fullProjectPath);
            setIsLoading(true, t('project.createdOpening'));
            await handleOpenRecentProject(fullProjectPath);
        } catch (error) {
            console.error('Failed to create project:', error);
            setIsLoading(false);

            const errorMessage = error instanceof Error ? error.message : String(error);

            if (errorMessage.includes('already exists')) {
                setConfirmDialog({
                    title: t('project.alreadyExists'),
                    message: t('project.existsQuestion'),
                    confirmText: t('project.open'),
                    cancelText: t('common.cancel'),
                    onConfirm: () => {
                        setConfirmDialog(null);
                        setIsLoading(true, t('project.opening'));
                        handleOpenRecentProject(fullProjectPath).catch((err) => {
                            console.error('Failed to open project:', err);
                            setIsLoading(false);
                            setErrorDialog({
                                title: t('project.openFailed'),
                                message: `${t('project.openFailed')}:\n${err instanceof Error ? err.message : String(err)}`
                            });
                        });
                    }
                });
            } else {
                setStatus(t('project.createFailed'));
                setErrorDialog({
                    title: t('project.createFailed'),
                    message: `${t('project.createFailed')}:\n${errorMessage}`
                });
            }
        }
    }, [t, handleOpenRecentProject, setIsLoading, setStatus, setErrorDialog, setConfirmDialog]);

    /**
     * @zh 浏览项目路径
     * @en Browse project path
     */
    const handleBrowseProjectPath = useCallback(async (): Promise<string | null> => {
        try {
            const path = await TauriAPI.openProjectDialog();
            return path || null;
        } catch (error) {
            console.error('Failed to browse path:', error);
            return null;
        }
    }, []);

    /**
     * @zh 关闭项目
     * @en Close project
     */
    const handleCloseProject = useCallback(async () => {
        if (pluginManagerRef.current) {
            await pluginLoader.unloadProjectPlugins(pluginManagerRef.current);
        }

        const scene = Core.scene;
        if (scene) {
            scene.end();
        }

        const engineService = EngineService.getInstance();
        engineService.clearModuleSystems();

        const projectService = Core.services.tryResolve(ProjectService);
        if (projectService) {
            await projectService.closeProject();
        }

        setProjectLoaded(false);
        setCurrentProjectPath(null);
        setStatus(t('header.status.ready'));
    }, [t, pluginLoader, pluginManagerRef, setProjectLoaded, setCurrentProjectPath, setStatus]);

    /**
     * @zh 删除项目
     * @en Delete project
     */
    const handleDeleteProject = useCallback(async (projectPath: string) => {
        console.log('[useProjectActions] handleDeleteProject called with path:', projectPath);
        try {
            console.log('[useProjectActions] Calling TauriAPI.deleteFolder...');
            await TauriAPI.deleteFolder(projectPath);
            console.log('[useProjectActions] deleteFolder succeeded');

            const settings = SettingsService.getInstance();
            settings.removeRecentProject(projectPath);
            setStatus(t('header.status.ready'));
        } catch (error) {
            console.error('[useProjectActions] Failed to delete project:', error);
            setErrorDialog({
                title: t('project.deleteFailed'),
                message: `${t('project.deleteFailed')}:\n${error instanceof Error ? error.message : String(error)}`
            });
        }
    }, [t, setStatus, setErrorDialog]);

    /**
     * @zh 从最近项目列表移除
     * @en Remove from recent projects
     */
    const handleRemoveRecentProject = useCallback((projectPath: string) => {
        const settings = SettingsService.getInstance();
        settings.removeRecentProject(projectPath);
        setStatus(t('header.status.ready'));
    }, [t, setStatus]);

    return {
        handleOpenProject,
        handleOpenRecentProject,
        handleCreateProject,
        handleCreateProjectFromWizard,
        handleBrowseProjectPath,
        handleCloseProject,
        handleDeleteProject,
        handleRemoveRecentProject,
    };
}
