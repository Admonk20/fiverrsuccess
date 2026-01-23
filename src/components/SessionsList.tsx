import { Clock, Trash2, FolderOpen, Plus } from 'lucide-react';
import { useStore } from '../store/useStore';

export function SessionsList() {
    const { savedSessions, currentSessionId, loadSession, deleteSession, clearCurrentSession } = useStore();

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (savedSessions.length === 0) {
        return (
            <div className="sessions-empty">
                <FolderOpen size={32} />
                <p>No saved sessions yet</p>
                <span>Your gig research sessions will appear here</span>
            </div>
        );
    }

    return (
        <div className="sessions-list">
            <div className="sessions-header">
                <h3>Your Sessions</h3>
                <button
                    className="btn btn-ghost"
                    onClick={clearCurrentSession}
                    title="New Session"
                >
                    <Plus size={16} />
                    New
                </button>
            </div>

            {savedSessions.map((session) => (
                <div
                    key={session.id}
                    className={`session-item ${currentSessionId === session.id ? 'active' : ''}`}
                >
                    <button
                        className="session-content"
                        onClick={() => loadSession(session.id)}
                    >
                        <div className="session-niche">{session.niche}</div>
                        <div className="session-meta">
                            <Clock size={12} />
                            <span>{formatDate(session.updated_at)}</span>
                        </div>
                    </button>
                    <button
                        className="session-delete"
                        onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('Delete this session?')) {
                                deleteSession(session.id);
                            }
                        }}
                        title="Delete session"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            ))}
        </div>
    );
}
