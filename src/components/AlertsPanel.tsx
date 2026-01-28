import { useState } from 'react';
import { Bell, TrendingUp, AlertCircle, Sparkles, X, Check, ChevronRight, Target } from 'lucide-react';
import type { KeywordAlert } from '../types';

interface AlertsPanelProps {
    alerts: KeywordAlert[];
    onDismiss: (id: string) => void;
    onAction?: (alert: KeywordAlert) => void;
}

export function AlertsPanel({ alerts, onDismiss, onAction }: AlertsPanelProps) {
    const [filter, setFilter] = useState<'all' | 'unread'>('unread');

    const filteredAlerts = alerts.filter(a => filter === 'all' || !a.isRead);
    const unreadCount = alerts.filter(a => !a.isRead).length;

    const getAlertIcon = (type: KeywordAlert['type']) => {
        switch (type) {
            case 'opportunity': return <Sparkles size={16} className="alert-icon opportunity" />;
            case 'new_keyword': return <TrendingUp size={16} className="alert-icon new" />;
            case 'trend_change': return <TrendingUp size={16} className="alert-icon trend" />;
            case 'competition_drop': return <Target size={16} className="alert-icon competition" />;
            case 'new_service': return <Bell size={16} className="alert-icon service" />;
            default: return <AlertCircle size={16} className="alert-icon" />;
        }
    };

    const getPriorityClass = (priority: KeywordAlert['priority']) => {
        switch (priority) {
            case 'urgent': return 'priority-urgent';
            case 'high': return 'priority-high';
            case 'medium': return 'priority-medium';
            default: return 'priority-low';
        }
    };

    const formatTime = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - new Date(date).getTime();

        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return `${Math.floor(diff / 86400000)}d ago`;
    };

    if (alerts.length === 0) {
        return (
            <div className="alerts-panel empty">
                <Bell size={32} />
                <h4>No alerts yet</h4>
                <p>We'll notify you when we find keyword opportunities in your specialty</p>
            </div>
        );
    }

    return (
        <div className="alerts-panel">
            <div className="alerts-header">
                <div className="alerts-title">
                    <Bell size={20} />
                    <h3>Keyword Alerts</h3>
                    {unreadCount > 0 && (
                        <span className="unread-badge">{unreadCount}</span>
                    )}
                </div>
                <div className="alerts-filter">
                    <button
                        onClick={() => setFilter('unread')}
                        className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
                    >
                        Unread
                    </button>
                    <button
                        onClick={() => setFilter('all')}
                        className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                    >
                        All
                    </button>
                </div>
            </div>

            <div className="alerts-list">
                {filteredAlerts.map(alert => (
                    <div
                        key={alert.id}
                        className={`alert-card ${getPriorityClass(alert.priority)} ${alert.isRead ? 'read' : ''}`}
                    >
                        <div className="alert-main">
                            {getAlertIcon(alert.type)}
                            <div className="alert-content">
                                <div className="alert-header-row">
                                    <h4>{alert.title}</h4>
                                    <span className="alert-time">{formatTime(alert.createdAt)}</span>
                                </div>
                                <p>{alert.description}</p>
                                {alert.keyword && (
                                    <span className="alert-keyword">"{alert.keyword}"</span>
                                )}
                            </div>
                        </div>
                        <div className="alert-actions">
                            {onAction && alert.keyword && (
                                <button
                                    onClick={() => onAction(alert)}
                                    className="btn btn-sm btn-primary"
                                >
                                    Research
                                    <ChevronRight size={14} />
                                </button>
                            )}
                            <button
                                onClick={() => onDismiss(alert.id)}
                                className="dismiss-btn"
                                title="Dismiss"
                            >
                                {alert.isRead ? <X size={14} /> : <Check size={14} />}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {filteredAlerts.length === 0 && filter === 'unread' && (
                <div className="no-unread">
                    <Check size={24} />
                    <p>All caught up!</p>
                </div>
            )}
        </div>
    );
}
