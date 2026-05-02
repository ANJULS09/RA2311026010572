'use client';

import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Container } from '@mui/material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
    const pathname = usePathname();

    return (
        <AppBar position="sticky" elevation={2} sx={{ backgroundColor: '#1e1e2f', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <Container maxWidth="lg">
                <Toolbar disableGutters>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700, letterSpacing: '0.5px' }}>
                        Campus<span style={{ color: '#4dabf5' }}>Alerts</span>
                    </Typography>
                    <Box sx={{ display: 'flex', gap: { xs: 1, sm: 2 } }}>
                        <Button
                            component={Link}
                            href="/"
                            color="inherit"
                            sx={{
                                fontWeight: pathname === '/' ? 700 : 500,
                                opacity: pathname === '/' ? 1 : 0.7,
                                borderBottom: pathname === '/' ? '3px solid #4dabf5' : '3px solid transparent',
                                borderRadius: 0,
                                paddingBottom: '6px',
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                    opacity: 1
                                }
                            }}
                        >
                            All
                        </Button>
                        <Button
                            component={Link}
                            href="/priority"
                            color="inherit"
                            sx={{
                                fontWeight: pathname === '/priority' ? 700 : 500,
                                opacity: pathname === '/priority' ? 1 : 0.7,
                                borderBottom: pathname === '/priority' ? '3px solid #f44336' : '3px solid transparent',
                                borderRadius: 0,
                                paddingBottom: '6px',
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                    opacity: 1
                                }
                            }}
                        >
                            Priority
                        </Button>
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
}
