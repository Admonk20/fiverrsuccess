import { useState } from 'react';
import { X, Key, ExternalLink, Check, AlertCircle, ShieldCheck } from 'lucide-react';
import { useStore } from '../store/useStore';
import { openaiService } from '../services/openaiService';

interface SettingsModalProps {
    onClose: () => void;
}

export function SettingsModal({ onClose }: SettingsModalProps) {
    const { openaiApiKey, user, updateApiKey } = useStore();

    const hasEnvKey = openaiService.hasEnvKey();
    const [localApiKey, setLocalApiKey] = useState(openaiApiKey);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    const handleSaveOpenAI = async () => {
        if (!localApiKey.trim()) {
            setError('Please enter an API key');
            return;
        }

        setSaving(true);
        setError('');
        setSuccess('');

        try {
            await updateApiKey(localApiKey);
            setSuccess('OpenAI API key saved successfully!');
            setTimeout(() => {
                setSuccess('');
                onClose();
            }, 1500);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3><Key size={20} /> Settings</h3>
                    <button className="btn btn-ghost btn-icon" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-body">
                    {/* Environment Key Status */}
                    {hasEnvKey && (
                        <div className="env-key-status">
                            <ShieldCheck size={24} />
                            <div>
                                <strong>✓ API Key Configured</strong>
                                <p>The app is ready to use! AI features are enabled.</p>
                            </div>
                        </div>
                    )}

                    <div className="settings-section">
                        <div className="input-group">
                            <label className="input-label">
                                {hasEnvKey ? 'Override API Key (Optional)' : 'OpenAI API Key'}
                            </label>
                            <input
                                type="password"
                                className="input"
                                placeholder={hasEnvKey ? 'Leave empty to use default key' : 'sk-...'}
                                value={localApiKey}
                                onChange={e => setLocalApiKey(e.target.value)}
                            />
                            {!hasEnvKey && (
                                <p className="input-help">
                                    Get your API key from{' '}
                                    <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">
                                        OpenAI Platform <ExternalLink size={12} />
                                    </a>
                                </p>
                            )}
                        </div>

                        <div className="settings-info">
                            <p>
                                <strong>Model:</strong> GPT-4o-mini (fast & affordable)
                            </p>
                            {!hasEnvKey && (
                                <p>
                                    <strong>Cost:</strong> ~$0.01 per gig generation
                                </p>
                            )}
                            {user && (
                                <p>
                                    <strong>Status:</strong> <span className="text-success">Logged in - key will be saved to your account</span>
                                </p>
                            )}
                        </div>

                        {error && (
                            <div className="settings-error">
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="settings-success">
                                <Check size={16} />
                                {success}
                            </div>
                        )}
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>
                        {hasEnvKey ? 'Close' : 'Cancel'}
                    </button>
                    {(!hasEnvKey || localApiKey) && (
                        <button
                            className="btn btn-primary"
                            onClick={handleSaveOpenAI}
                            disabled={saving || (!localApiKey && !hasEnvKey)}
                        >
                            {saving ? 'Saving...' : 'Save API Key'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
