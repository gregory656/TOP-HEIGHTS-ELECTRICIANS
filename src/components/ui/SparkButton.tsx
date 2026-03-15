import React from 'react';
import { Button, ButtonProps } from '@mui/material';

const SparkButton = React.forwardRef<HTMLButtonElement, ButtonProps>(({ sx, ...props }, ref) => {
  const extraStyles = Array.isArray(sx) ? sx : sx ? [sx] : [];

  return (
    <Button
      ref={ref}
      {...props}
      sx={[
        {
          borderRadius: 999,
          padding: '12px 32px',
          textTransform: 'none',
          fontWeight: 700,
          letterSpacing: 0.5,
          backgroundImage: 'linear-gradient(135deg, #0F172A 0%, #5EF0FF 60%, #C5D1FF 100%)',
          color: '#030911',
          boxShadow: '0 12px 40px rgba(94, 240, 255, 0.35)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          position: 'relative',
          overflow: 'hidden',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          '&:hover': {
            transform: 'translateY(-3px)',
            boxShadow: '0 18px 60px rgba(94, 240, 255, 0.6)',
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle, rgba(255,255,255,0.5) 0%, transparent 60%)',
            opacity: 0,
            transition: 'opacity 0.4s ease',
          },
          '&:focus-visible::before, &:hover::before': {
            opacity: 0.4,
          },
        },
        ...extraStyles,
      ]}
    />
  );
});

SparkButton.displayName = 'SparkButton';

export default SparkButton;
