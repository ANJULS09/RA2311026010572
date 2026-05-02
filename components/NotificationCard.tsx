'use client';

import React from 'react';
import { Card, CardContent, Typography, Chip, Box, Grow } from '@mui/material';
import { Notification, NotificationType } from '../lib/api';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import EventIcon from '@mui/icons-material/Event';

interface NotificationCardProps {
    notification: Notification;
    isViewed: boolean;
    onView: (id: string) => void;
    score?: number; // Optional priority score to display
}

const getTypeConfig = (type: NotificationType) => {
    switch (type) {
        case 'Placement': return { color: 'info' as const, icon: <CheckCircleOutlineIcon fontSize="small" /> }; // Blue
        case 'Result': return { color: 'success' as const, icon: <ErrorOutlineIcon fontSize="small" /> }; // Green
        case 'Event': return { color: 'warning' as const, icon: <EventIcon fontSize="small" /> }; // Orange
        default: return { color: 'default' as const, icon: undefined };
    }
};

export default function NotificationCard({ notification, isViewed, onView, score }: NotificationCardProps) {
    const handleClick = () => {
        if (!isViewed) {
            onView(notification.ID);
        }
    };

    const config = getTypeConfig(notification.Type);

    return (
        <Grow in={true} timeout={500}>
            <Card 
                onClick={handleClick}
                elevation={isViewed ? 0 : 2}
                sx={{ 
                    mb: 2, 
                    cursor: isViewed ? 'default' : 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    borderLeft: isViewed ? '4px solid transparent' : '4px solid',
                    borderLeftColor: isViewed ? 'transparent' : `${config.color}.main`,
                    opacity: isViewed ? 0.6 : 1,
                    backgroundColor: isViewed ? 'background.default' : 'background.paper',
                    '&:hover': {
                        transform: isViewed ? 'none' : 'translateY(-4px)',
                        boxShadow: isViewed ? 0 : 4,
                        opacity: 1
                    }
                }}
            >
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                            <Chip 
                                icon={config.icon}
                                label={notification.Type} 
                                color={config.color} 
                                size="small" 
                                sx={{ fontWeight: 600, px: 0.5 }}
                            />
                            {!isViewed && (
                                <Chip 
                                    label="NEW" 
                                    color="error" 
                                    size="small" 
                                    variant="outlined" 
                                    sx={{ fontWeight: 'bold', animation: 'pulse 2s infinite' }} 
                                />
                            )}
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <EventIcon fontSize="small" />
                            {new Date(notification.Timestamp).toLocaleString()}
                        </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ mt: 1, lineHeight: 1.6, color: 'text.primary' }}>
                        {notification.Message}
                    </Typography>
                    {score !== undefined && (
                        <Box sx={{ mt: 2, pt: 1, borderTop: "1px solid rgba(0,0,0,0.05)" }}>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                Priority Score: <span style={{ color: 'text.primary' }}>{score.toFixed(6)}</span>
                            </Typography>
                        </Box>
                    )}
                </CardContent>
            </Card>
        </Grow>
    );
}
