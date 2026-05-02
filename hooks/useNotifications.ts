import { useState, useEffect, useCallback } from 'react';
import { fetchNotifications, Notification, FetchNotificationsParams } from '../lib/api';
import { Log } from '../utils/logger';

export function useNotifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [viewedIds, setViewedIds] = useState<Set<string>>(new Set());

    // Load viewed IDs from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem('viewedNotificationIds');
            if (stored) {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setViewedIds(new Set(JSON.parse(stored)));
            }
        } catch {
            void Log("frontend", "warn", "hook", "Failed to parse viewed IDs from localStorage");
        }
    }, []);

    const fetchList = useCallback(async (params: FetchNotificationsParams) => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchNotifications(params);
            setNotifications(data);
        } catch (err: unknown) {
            const error = err as Error;
            setError(error.message || 'Failed to fetch notifications');
        } finally {
            setLoading(false);
        }
    }, []); // Empty deps because it doesn't depend on external changing props

    const markAsViewed = useCallback(async (id: string) => {
        setViewedIds((prev) => {
            if (prev.has(id)) return prev;
            const next = new Set(prev);
            next.add(id);
            try {
                localStorage.setItem('viewedNotificationIds', JSON.stringify(Array.from(next)));
                void Log("frontend", "info", "state", `Marked notification ${id} as viewed`);
            } catch {
                void Log("frontend", "error", "hook", "Failed to save viewed IDs to localStorage");
            }
            return next;
        });
    }, []);

    return {
        notifications,
        loading,
        error,
        viewedIds,
        fetchList,
        markAsViewed
    };
}
