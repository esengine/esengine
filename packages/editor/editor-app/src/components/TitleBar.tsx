import { useState, useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { resetDockLayout } from './DockContainer';
import '../styles/TitleBar.css';

interface TitleBarProps {
    title?: string;
    onOpenProject?: (path: string) => void;
}

interface MenuItem {
    label: string;
    action?: () => void;
    shortcut?: string;
    separator?: boolean;
    disabled?: boolean;
}

interface Menu {
    label: string;
    items: MenuItem[];
}

export function TitleBar({ title = 'ESEngine Editor', onOpenProject }: TitleBarProps) {
    const handleOpenProject = async () => {
        try {
            const selectedPath = await invoke<string | null>('open_folder_dialog', {
                title: 'Open Project Folder'
            });
            if (selectedPath) {
                onOpenProject?.(selectedPath);
            }
        } catch (error) {
            console.error('[TitleBar] Failed to open project:', error);
        }
    };

    const menus: Menu[] = [
        {
            label: 'File',
            items: [
                { label: 'Open Project...', action: handleOpenProject },
                { separator: true, label: '' },
                { label: 'New Scene', shortcut: 'Ctrl+N', disabled: true },
                { label: 'Open Scene', shortcut: 'Ctrl+O', disabled: true },
                { separator: true, label: '' },
                { label: 'Save', shortcut: 'Ctrl+S', disabled: true },
                { label: 'Save As...', shortcut: 'Ctrl+Shift+S', disabled: true },
            ]
        },
        {
            label: 'Edit',
            items: [
                { label: 'Undo', shortcut: 'Ctrl+Z', disabled: true },
                { label: 'Redo', shortcut: 'Ctrl+Y', disabled: true },
                { separator: true, label: '' },
                { label: 'Cut', shortcut: 'Ctrl+X', disabled: true },
                { label: 'Copy', shortcut: 'Ctrl+C', disabled: true },
                { label: 'Paste', shortcut: 'Ctrl+V', disabled: true },
            ]
        },
        {
            label: 'View',
            items: [
                { label: 'Reset Layout', action: () => resetDockLayout() },
            ]
        }
    ];
    const [isMaximized, setIsMaximized] = useState(false);
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const appWindow = getCurrentWindow();

    useEffect(() => {
        const checkMaximized = async () => {
            try {
                const maximized = await appWindow.isMaximized();
                setIsMaximized(maximized);
            } catch (e) {
                // Not in Tauri environment
            }
        };

        checkMaximized();

        let cleanup: (() => void) | undefined;
        appWindow.onResized(async () => {
            const maximized = await appWindow.isMaximized();
            setIsMaximized(maximized);
        }).then(fn => {
            cleanup = fn;
        }).catch(() => {});

        return () => {
            cleanup?.();
        };
    }, []);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setActiveMenu(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMenuClick = (menuLabel: string) => {
        setActiveMenu(activeMenu === menuLabel ? null : menuLabel);
    };

    const handleMenuItemClick = (item: MenuItem) => {
        if (item.disabled) return;
        if (item.action) {
            item.action();
        }
        setActiveMenu(null);
    };

    const handleMinimize = async () => {
        try {
            await appWindow.minimize();
        } catch (e) {
            console.log('Not in Tauri environment');
        }
    };

    const handleMaximize = async () => {
        try {
            await appWindow.toggleMaximize();
        } catch (e) {
            console.log('Not in Tauri environment');
        }
    };

    const handleClose = async () => {
        try {
            await appWindow.close();
        } catch (e) {
            console.log('Not in Tauri environment');
        }
    };

    return (
        <div className="titlebar">
            <div className="titlebar-left">
                <div className="titlebar-logo">
                    <span className="titlebar-logo-text">ES</span>
                </div>
                <div className="titlebar-menus" ref={menuRef}>
                    {menus.map(menu => (
                        <div key={menu.label} className="titlebar-menu-item">
                            <button
                                className={`titlebar-menu-button ${activeMenu === menu.label ? 'active' : ''}`}
                                onClick={() => handleMenuClick(menu.label)}
                            >
                                {menu.label}
                            </button>
                            {activeMenu === menu.label && (
                                <div className="titlebar-dropdown">
                                    {menu.items.map((item, index) => (
                                        item.separator ? (
                                            <div key={index} className="titlebar-dropdown-separator" />
                                        ) : (
                                            <button
                                                key={item.label}
                                                className={`titlebar-dropdown-item ${item.disabled ? 'disabled' : ''}`}
                                                onClick={() => handleMenuItemClick(item)}
                                            >
                                                <span className="titlebar-dropdown-item-content">
                                                    {item.label}
                                                </span>
                                                {item.shortcut && (
                                                    <span className="titlebar-dropdown-shortcut">{item.shortcut}</span>
                                                )}
                                            </button>
                                        )
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="titlebar-center" data-tauri-drag-region>
                <span className="titlebar-title">{title}</span>
            </div>

            <div className="titlebar-right">
                <div className="titlebar-window-controls">
                    <button className="titlebar-button" onClick={handleMinimize} title="Minimize">
                        <svg width="10" height="1" viewBox="0 0 10 1">
                            <rect width="10" height="1" fill="currentColor"/>
                        </svg>
                    </button>
                    <button className="titlebar-button" onClick={handleMaximize} title={isMaximized ? 'Restore' : 'Maximize'}>
                        {isMaximized ? (
                            <svg width="10" height="10" viewBox="0 0 10 10">
                                <path d="M2 0v2H0v8h8V8h2V0H2zm6 8H2V4h6v4z" fill="currentColor"/>
                            </svg>
                        ) : (
                            <svg width="10" height="10" viewBox="0 0 10 10">
                                <rect width="10" height="10" fill="none" stroke="currentColor" strokeWidth="1"/>
                            </svg>
                        )}
                    </button>
                    <button className="titlebar-button titlebar-button-close" onClick={handleClose} title="Close">
                        <svg width="10" height="10" viewBox="0 0 10 10">
                            <path d="M1 1L9 9M9 1L1 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
