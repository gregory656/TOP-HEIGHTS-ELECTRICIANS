import React from 'react';
import { Box, Typography, LinearProgress, Stack } from '@mui/material';

interface CourseProgressProps {
  title: string;
  instructor?: string;
  progress: number;
}

const CourseProgress: React.FC<CourseProgressProps> = ({ title, instructor, progress }) => (
  <Box
    sx={{
      p: 2,
      borderRadius: 2,
      background: 'rgba(255, 255, 255, 0.02)',
      border: '1px solid rgba(100, 255, 218, 0.2)',
    }}
  >
    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
      <Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        {instructor && (
          <Typography variant="caption" color="text.secondary">
            {instructor}
          </Typography>
        )}
      </Box>
      <Typography variant="caption" color="text.secondary">
        Progress: {Math.round(progress)}%
      </Typography>
    </Stack>
    <LinearProgress variant="determinate" value={Math.min(Math.max(progress, 0), 100)} />
  </Box>
);

export default CourseProgress;
