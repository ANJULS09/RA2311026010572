'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Box, Typography, Tabs, Tab, Pagination, CircularProgress, Alert } from '@mui/material';
import NotificationCard from '../components/NotificationCard';
import { useNotifications } from '../hooks/useNotifications';
import { Log } from '@/utils/logger';
import { NotificationType } from '../lib/api';

function NotificationsContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const { notifications, loading, error, fetchList, viewedIds, markAsViewed } = useNotifications();

    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const typeParam = searchParams.get('notification_type') || 'All';

    const [currentTab, setCurrentTab] = useState<string>(typeParam);

    useEffect(() => {
        void Log("frontend", "info", "page", `Home page loaded. Page: ${page}, Limit: ${limit}, Type: ${typeParam}`);
        fetchList({
            limit,
            page,
            notification_type: typeParam as NotificationType | "All"
        }).catch((err) => void Log("frontend", "error", "page", String(err)));
    }, [page, limit, typeParam, fetchList]);

    const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
        setCurrentTab(newValue);
        void Log("frontend", "info", "state", `Notification type filter changed to ${newValue}`);
        
        const params = new URLSearchParams(searchParams.toString());
        if (newValue === 'All') {
            params.delete('notification_type');
        } else {
            params.set('notification_type', newValue);
        }
        params.set('page', '1'); // reset to page 1 on filter change
        router.push(`${pathname}?${params.toString()}`);
    };

    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        void Log("frontend", "info", "state", `Pagination changed to page ${value}`);
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', value.toString());
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>All Notifications</Typography>
            
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={currentTab} onChange={handleTabChange} aria-label="notification types" variant="scrollable" scrollButtons="auto">
                    <Tab label="All" value="All" />
                    <Tab label="Placement" value="Placement" />
                    <Tab label="Result" value="Result" />
                    <Tab label="Event" value="Event" />
                </Tabs>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {loading && !error && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <CircularProgress />
                </Box>
            )}

            {!loading && !error && notifications.length === 0 && (
                <Typography variant="body1" color="text.secondary" align="center" sx={{ my: 4 }}>
                    No notifications found for the selected filter.
                </Typography>
            )}

            {!loading && !error && notifications.map((notif) => (
                <NotificationCard 
                    key={notif.ID}
                    notification={notif}
                    isViewed={viewedIds.has(notif.ID)}
                    onView={markAsViewed}
                />
            ))}

            {!loading && !error && notifications.length > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    {/* Assuming arbitrary large count since API doesn't return total count */}
                    <Pagination 
                        count={20} 
                        page={page} 
                        onChange={handlePageChange} 
                        color="primary" 
                    />
                </Box>
            )}
        </Box>
    );
}

export default function Home() {
    return (
        <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>}>
            <NotificationsContent />
        </Suspense>
    );
}
