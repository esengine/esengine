import 'reflect-metadata';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { invoke } from '@tauri-apps/api/core';
import App from './App';
import './styles/global.css';
import './styles/index.css';

async function logErrorToFile(type: string, error: unknown) {
    try {
        const timestamp = new Date().toISOString();
        const errorStr = error instanceof Error
            ? `${error.message}\n${error.stack || ''}`
            : String(error);
        const logEntry = `[${timestamp}] [${type}]\n${errorStr}\n${'='.repeat(80)}\n`;

        const tempDir = await invoke<string>('get_temp_dir');
        const logPath = `${tempDir}/esengine-editor-crash.log`;
        await invoke('append_to_log', { path: logPath, content: logEntry });
        console.log(`[Error logged to ${logPath}]`);
    } catch (e) {
        console.error('Failed to write error log:', e);
    }
}

window.addEventListener('error', (event) => {
    console.error('[Global Error]', event.error || event.message);
    logErrorToFile('Global Error', event.error || event.message);
    event.preventDefault();
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('[Unhandled Promise Rejection]', event.reason);
    logErrorToFile('Unhandled Promise Rejection', event.reason);
    event.preventDefault();
});

logErrorToFile('App Start', `Editor started at ${new Date().toISOString()}`);

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
