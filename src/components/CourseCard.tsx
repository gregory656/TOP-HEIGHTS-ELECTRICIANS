import React from 'react';
import { Card, CardContent, CardActions, Typography, Button, Box, Chip, Stack } from '@mui/material';
import { Link } from 'react-router-dom';
import { Course } from '../utils/courseStorage';

interface CourseCardProps {
  course: Course;
  onEnroll: () => void;
  enrolling?: boolean;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onEnroll, enrolling }) => {
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'rgba(17, 34, 64, 0.8)',
        border: '1px solid rgba(100, 255, 218, 0.1)',
      }}
    >
      <CardContent sx={{ flex: 1 }}>
        <Stack direction="row" justifyContent="space-between" mb={1}>
          <Typography variant="subtitle2" color="text.secondary">
            {course.category}
          </Typography>
          {course.free ? (
            <Chip size="small" label="Free" color="success" />
          ) : (
            <Chip size="small" label={`KES ${course.price}`} color="primary" />
          )}
        </Stack>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
          {course.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {course.description}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Instructor: {course.instructor}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Duration: {course.duration}
        </Typography>
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2 }}>
        <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
          <Button
            variant="contained"
            size="small"
            onClick={onEnroll}
            disabled={enrolling}
            fullWidth
          >
            {course.free ? 'Join Free' : enrolling ? 'Processing...' : 'Enroll'}
          </Button>
          <Button
            component={Link}
            to={`/courses/${course.id}`}
            variant="outlined"
            size="small"
            fullWidth
          >
            Details
          </Button>
        </Box>
      </CardActions>
    </Card>
  );
};

export default CourseCard;
