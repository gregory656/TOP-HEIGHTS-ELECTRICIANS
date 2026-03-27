import React from 'react';
import { Box, Typography } from '@mui/material';
import { motion, type Variants } from 'framer-motion';

interface DanceWordTrailProps {
  words: string[];
  variant?: 'hero' | 'subtle';
}

const variantConfig = {
  hero: {
    size: { xs: '2.5rem', md: '4rem' },
    gap: 1,
  },
  subtle: {
    size: { xs: '1rem', md: '1.3rem' },
    gap: 0.5,
  },
};

const wordVariants: Variants = {
  hidden: { y: -60, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 120, damping: 16 },
  },
};

const DanceWordTrail: React.FC<DanceWordTrailProps> = ({ words, variant = 'hero' }) => (
  <Box
    component={motion.div}
    variants={
      {
        hidden: {},
        visible: {
          transition: { staggerChildren: 0.24, delayChildren: 0.1 },
        },
      } satisfies Variants
    }
    initial="hidden"
    animate="visible"
    sx={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: variantConfig[variant].gap,
    }}
  >
    {words.map((word) => (
      <Typography
        key={word}
        component={motion.span}
        variants={wordVariants}
        variant="h1"
        sx={{
          fontSize: variantConfig[variant].size,
          fontWeight: 800,
          lineHeight: 1.1,
          background:
            'linear-gradient(120deg, rgba(255,255,255,0.9), rgba(255, 120, 139, 0.9), rgba(255, 179, 71, 0.8))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textTransform: 'uppercase',
          animation: 'pulse 4s ease-in-out infinite',
          '@keyframes pulse': {
            '0%, 100%': { opacity: 0.8 },
            '50%': { opacity: 1 },
          },
        }}
      >
        {word}
      </Typography>
    ))}
  </Box>
);

export default DanceWordTrail;
