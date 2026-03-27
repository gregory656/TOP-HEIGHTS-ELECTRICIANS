import React from 'react';
import { IconButton, Tooltip, useTheme as useMuiTheme } from '@mui/material';
import { DarkMode, LightMode } from '@mui/icons-material';
import { useTheme } from '../context/ThemeContext';

/**
 * Theme toggle button.
 * Uses MUI tokens only (no hardcoded colors in component).
 */
export default function ThemeToggle() {
  const muiTheme = useMuiTheme();
  const { resolvedMode, toggleTheme } = useTheme();

  const isDark = resolvedMode === 'dark';

  return (
    <Tooltip title={isDark ? 'Switch to light mode' : 'Switch to dark mode'} arrow>
      <IconButton
        onClick={toggleTheme}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        sx={{
          ml: 1,
          color: 'text.primary',
          backgroundColor: 'action.hover',
          border: `1px solid ${muiTheme.palette.divider}`,
          '&:hover': { backgroundColor: 'action.selected' },
          transition: muiTheme.transitions.create(['transform', 'background-color'], {
            duration: muiTheme.transitions.duration.shortest,
          }),
        }}
      >
        {isDark ? (
          <LightMode fontSize="small" />
        ) : (
          <DarkMode fontSize="small" />
        )}
      </IconButton>
    </Tooltip>
  );
}
