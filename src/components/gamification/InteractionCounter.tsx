import React from 'react';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';

interface InteractionCounterProps {
  points: number;
}

const InteractionCounter: React.FC<InteractionCounterProps> = ({ points }) => (
  <motion.div
    animate={{ scale: [1, 1.02, 1], boxShadow: ['0 0 25px rgba(94, 240, 255, 0.2)', '0 0 35px rgba(94, 240, 255, 0.4)', '0 0 25px rgba(94, 240, 255, 0.2)'] }}
    transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse' }}
  >
    <Box
      sx={{
        borderRadius: 3,
        px: 3,
        py: 2.5,
        background:
          'radial-gradient(circle at top right, rgba(94, 240, 255, 0.3), transparent 60%)',
        border: '1px solid rgba(94, 240, 255, 0.25)',
        textAlign: 'center',
      }}
    >
      <Typography variant="caption" sx={{ letterSpacing: 0.5, color: 'text.secondary' }}>
        Mini reward counter
      </Typography>
      <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>
        {points}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Hover interactions boosted the circuit
      </Typography>
    </Box>
  </motion.div>
);

export default InteractionCounter;
