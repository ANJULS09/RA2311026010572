'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
    Box, 
    Typography, 
    Select, 
    MenuItem, 
    FormControl, 
    InputLabel, 
    CircularProgress,
    Alert,
    SelectChangeEvent
} from '@mui/material';
import NotificationCard from './NotificationCard';
import { useNotifications } from '../hooks/useNotifications';
import { calculatePriorityScore, PrioritizedNotification } from '../utils/priorityScore';
import { Log } from '../utils/logger';

export default function PriorityInbox() {
    const { notifications, loading, error, fetchList, viewedIds, markAsViewed } = useNotifications();
    const [n, setN] = useState<number>(10);
    const [filterType, setFilterType] = useState<string>('All');

    useEffect(() => {
        // Fetch all notifications to compute top N
        fetchList({ limit: 1000 }).catch(console.error);
    }, [fetchList]);

    const topNotifications = useMemo(() => {
        void Log("frontend", "info", "component", `Calculating top ${n} priority notifications`);
        
        let filtered = notifications;
        if (filterType !== 'All') {
            filtered = notifications.filter(notif => notif.Type === filterType);
        }

        const prioritized: PrioritizedNotification[] = filtered.map(notif => ({
            ...notif,
            priorityScore: calculatePriorityScore(notif.Type, notif.Timestamp, notif.ID)
        }));

        prioritized.sort((a, b) => b.priorityScore - a.priorityScore);
        
        return prioritized.slice(0, n);
    }, [notifications, n, filterType]);

    const handleNChange = (event: SelectChangeEvent<number>) => {
        setN(Number(event.target.value));
        void Log("frontend", "info", "state", `Priority N changed to ${event.target.value}`);
    };

    const handleFilterChange = (event: SelectChangeEvent<string>) => {
        setFilterType(event.target.value as string);
        void Log("frontend", "info", "state", `Priority filter changed to ${event.target.value}`);
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Priority Inbox</Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>Type Filter</InputLabel>
                        <Select value={filterType} label="Type Filter" onChange={handleFilterChange}>
                            <MenuItem value="All">All Types</MenuItem>
                            <MenuItem value="Placement">Placement</MenuItem>
                            <MenuItem value="Result">Result</MenuItem>
                            <MenuItem value="Event">Event</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>Show Top N</InputLabel>
                        <Select value={n} label="Show Top N" onChange={handleNChange}>
                            <MenuItem value={10}>Top 10</MenuItem>
                            <MenuItem value={15}>Top 15</MenuItem>
                            <MenuItem value={20}>Top 20</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
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

            {!loading && !error && topNotifications.length === 0 && (
                <Typography variant="body1" color="text.secondary" align="center" sx={{ my: 4 }}>
                    No notifications match your criteria.
                </Typography>
            )}

            {!loading && !error && topNotifications.map((notif) => (
                <NotificationCard 
                    key={notif.ID}
                    notification={notif}
                    isViewed={viewedIds.has(notif.ID)}
                    onView={markAsViewed}
                    score={notif.priorityScore}
                />
            ))}
        </Box>
    );
}
