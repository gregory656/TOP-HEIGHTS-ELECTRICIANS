import React from 'react';
import { Box, LinearProgress, Typography } from '@mui/material';
import { motion } from 'framer-motion';

interface ExplorerProgressProps {
  progress: number;
  points: number;
}

const ExplorerProgress: React.FC<ExplorerProgressProps> = ({ progress, points }) => (
  <motion.div
    animate={{ y: [0, -4, 0], opacity: [0.95, 1, 0.95] }}
    transition={{ duration: 3, repeat: Infinity }}
  >
    <Box
      sx={{
        borderRadius: 3,
        border: '1px solid rgba(94, 240, 255, 0.2)',
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        p: 3,
        minWidth: 260,
        maxWidth: 320,
        backdropFilter: 'blur(18px)',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="overline" sx={{ letterSpacing: 0.7 }}>
          Explorer progress
        </Typography>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          {Math.round(progress * 100)}%
        </Typography>
      </Box>
      <LinearProgress variant="determinate" value={progress * 100} />
      <Box
        sx={{
          mt: 2.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="caption" color="text.secondary">
          Engagement Sparks
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {points}
        </Typography>
      </Box>
    </Box>
  </motion.div>
);

export default ExplorerProgress;
