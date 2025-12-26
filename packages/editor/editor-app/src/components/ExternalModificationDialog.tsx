import { AlertTriangle, X, RefreshCw, Save } from 'lucide-react';
import '../styles/ConfirmDialog.css';

interface ExternalModificationDialogProps {
    sceneName: string;
    onReload: () => void;
    onOverwrite: () => void;
    onCancel: () => void;
}

/**
 * 外部修改对话框
 * External Modification Dialog
 *
 * 当场景文件被外部修改时显示，让用户选择操作
 * Shown when scene file is modified externally, let user choose action
 */
export function ExternalModificationDialog({
    sceneName,
    onReload,
    onOverwrite,
    onCancel
}: ExternalModificationDialogProps) {
    return (
        <div className="confirm-dialog-overlay" onClick={onCancel}>
            <div className="confirm-dialog external-modification-dialog" onClick={(e) => e.stopPropagation()}>
                <div className="confirm-dialog-header">
                    <AlertTriangle size={20} className="warning-icon" />
                    <h2>文件已被外部修改</h2>
                    <button className="close-btn" onClick={onCancel}>
                        <X size={16} />
                    </button>
                </div>
                <div className="confirm-dialog-content">
                    <p>
                        场景 <strong>{sceneName}</strong> 已在编辑器外部被修改。
                    </p>
                    <p className="hint-text">
                        请选择如何处理：
                    </p>
                </div>
                <div className="confirm-dialog-footer external-modification-footer">
                    <button className="confirm-dialog-btn cancel" onClick={onCancel}>
                        取消
                    </button>
                    <button className="confirm-dialog-btn reload" onClick={onReload}>
                        <RefreshCw size={14} />
                        重新加载
                    </button>
                    <button className="confirm-dialog-btn overwrite" onClick={onOverwrite}>
                        <Save size={14} />
                        覆盖保存
                    </button>
                </div>
            </div>
        </div>
    );
}
