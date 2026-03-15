import React from 'react';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';

interface AchievementBadgeProps {
  title: string;
  description: string;
  unlocked: boolean;
  icon: React.ReactNode;
}

const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  title,
  description,
  unlocked,
  icon,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    whileHover={{ scale: unlocked ? 1.04 : 1.02 }}
  >
    <Box
      sx={{
        borderRadius: 3,
        border: `1px solid rgba(94, 240, 255, ${unlocked ? 0.6 : 0.25})`,
        backgroundColor: unlocked ? 'rgba(94, 240, 255, 0.08)' : 'rgba(255, 255, 255, 0.02)',
        backdropFilter: 'blur(18px)',
        px: 3,
        py: 2.5,
        minWidth: 220,
        maxWidth: 260,
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5,
      }}
    >
      <Box
        sx={{
          width: 46,
          height: 46,
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 24,
          backgroundColor: unlocked ? 'rgba(94, 240, 255, 0.15)' : 'rgba(255,255,255,0.05)',
        }}
      >
        {icon}
      </Box>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
        {title}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {description}
      </Typography>
      <Typography
        variant="overline"
        sx={{
          letterSpacing: 0.5,
          fontSize: 11,
          color: unlocked ? 'primary.main' : 'text.secondary',
        }}
      >
        {unlocked ? 'Unlocked' : 'Locked'}
      </Typography>
    </Box>
  </motion.div>
);

export default AchievementBadge;
