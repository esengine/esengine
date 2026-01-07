import { useState, useEffect, useRef } from 'react';
import { getVersion } from '@tauri-apps/api/app';
import { open } from '@tauri-apps/plugin-dialog';
import { Trash2 } from 'lucide-react';
import { StartupLogo } from './StartupLogo';
import '../styles/StartupPage.css';

interface StartupPageProps {
    onProjectOpen?: (path: string) => void;
}

export function StartupPage({ onProjectOpen }: StartupPageProps) {
    const [showLogo, setShowLogo] = useState(true);
    const [appVersion, setAppVersion] = useState('1.0.0');
    const [recentProjects, setRecentProjects] = useState<string[]>([]);
    const [hoveredProject, setHoveredProject] = useState<string | null>(null);

    useEffect(() => {
        getVersion().then(setAppVersion).catch(() => setAppVersion('1.0.0'));

        // Load recent projects from localStorage
        const saved = localStorage.getItem('recentProjects');
        if (saved) {
            try {
                setRecentProjects(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to parse recent projects');
            }
        }
    }, []);

    const handleLogoComplete = () => {
        setShowLogo(false);
    };

    const handleOpenProject = async () => {
        try {
            const selected = await open({
                directory: true,
                multiple: false,
                title: 'Select Project Folder'
            });

            if (selected && typeof selected === 'string') {
                addRecentProject(selected);
                onProjectOpen?.(selected);
            }
        } catch (e) {
            console.error('Failed to open project dialog:', e);
        }
    };

    const handleCreateProject = async () => {
        try {
            const selected = await open({
                directory: true,
                multiple: false,
                title: 'Select Location for New Project'
            });

            if (selected && typeof selected === 'string') {
                addRecentProject(selected);
                onProjectOpen?.(selected);
            }
        } catch (e) {
            console.error('Failed to create project:', e);
        }
    };

    const addRecentProject = (path: string) => {
        const updated = [path, ...recentProjects.filter(p => p !== path)].slice(0, 10);
        setRecentProjects(updated);
        localStorage.setItem('recentProjects', JSON.stringify(updated));
    };

    const removeRecentProject = (path: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const updated = recentProjects.filter(p => p !== path);
        setRecentProjects(updated);
        localStorage.setItem('recentProjects', JSON.stringify(updated));
    };

    const openRecentProject = (path: string) => {
        addRecentProject(path);
        onProjectOpen?.(path);
    };

    return (
        <div className="startup-page">
            {showLogo && <StartupLogo onAnimationComplete={handleLogoComplete} />}

            <div className="startup-header">
                <h1 className="startup-title">ESEngine Editor</h1>
                <p className="startup-subtitle">Cross-platform 2D Game Engine</p>
            </div>

            <div className="startup-content">
                <div className="startup-actions">
                    <button className="startup-action-btn primary" onClick={handleOpenProject}>
                        <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V9C21 7.89543 20.1046 7 19 7H13L11 5H5C3.89543 5 3 5.89543 3 7Z" strokeWidth="2"/>
                        </svg>
                        <span>Open Project</span>
                    </button>

                    <button className="startup-action-btn" onClick={handleCreateProject}>
                        <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M12 5V19M5 12H19" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span>Create Project</span>
                    </button>
                </div>

                <div className="startup-recent">
                    <h2 className="recent-title">Recent Projects</h2>
                    {recentProjects.length === 0 ? (
                        <p className="recent-empty">No recent projects</p>
                    ) : (
                        <ul className="recent-list">
                            {recentProjects.map((project, index) => (
                                <li
                                    key={index}
                                    className={`recent-item ${hoveredProject === project ? 'hovered' : ''}`}
                                    onMouseEnter={() => setHoveredProject(project)}
                                    onMouseLeave={() => setHoveredProject(null)}
                                    onClick={() => openRecentProject(project)}
                                >
                                    <svg className="recent-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path d="M3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V9C21 7.89543 20.1046 7 19 7H13L11 5H5C3.89543 5 3 5.89543 3 7Z" strokeWidth="2"/>
                                    </svg>
                                    <div className="recent-info">
                                        <div className="recent-name">{project.split(/[\\/]/).pop()}</div>
                                        <div className="recent-path">{project}</div>
                                    </div>
                                    <button
                                        className="recent-remove-btn"
                                        onClick={(e) => removeRecentProject(project, e)}
                                        title="Remove from list"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            <div className="startup-footer">
                <span className="startup-version">Version {appVersion}</span>
            </div>
        </div>
    );
}
