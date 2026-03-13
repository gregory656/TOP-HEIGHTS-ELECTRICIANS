import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Chip,
  Divider,
  Stack,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Course, getCourses as getLocalCourses } from '../../utils/courseStorage';
import { useCourseEnrollment } from '../../hooks/useCourseEnrollment';
import { getCoursesFromFirestore, subscribeToCourses } from '../../services/courseService';

const CourseDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const { handleEnroll, processingCourse, feedback, clearFeedback } = useCourseEnrollment();

  // Subscribe to courses from Firestore
  useEffect(() => {
    getCoursesFromFirestore().then((courses) => {
      const found = courses.find((entry) => entry.id === id);
      if (found) {
        setCourse(found);
      } else {
        // Fallback to localStorage courses
        const localCourses = getLocalCourses();
        const localFound = localCourses.find((c) => c.id === id);
        setCourse(localFound || null);
      }
      setLoading(false);
    }).catch(() => {
      // Fallback to localStorage on error
      const localCourses = getLocalCourses();
      const localFound = localCourses.find((c) => c.id === id);
      setCourse(localFound || null);
      setLoading(false);
    });

    const unsubscribe = subscribeToCourses((courses) => {
      const found = courses.find((entry) => entry.id === id);
      if (found) {
        setCourse(found);
      }
    });

    return () => unsubscribe();
  }, [id]);

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!course) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography variant="h4">Course not found</Typography>
        <Typography color="text.secondary">Select another item from the catalog.</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
      <Box
        sx={{
          p: 3,
          borderRadius: 3,
          background: 'rgba(17, 34, 64, 0.6)',
          border: '1px solid rgba(100, 255, 218, 0.2)',
          mb: 3,
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h3" sx={{ fontWeight: 700 }}>
            {course.title}
          </Typography>
          <Chip label={course.free ? 'Free' : `KES ${course.price}`} color="primary" />
        </Stack>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          {course.description}
        </Typography>
        <Stack direction="row" spacing={2}>
          <Typography variant="subtitle2" color="text.secondary">
            Instructor: {course.instructor}
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            Duration: {course.duration}
          </Typography>
        </Stack>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
          gap: 3,
        }}
      >
        <Box>
          <Box
            sx={{
              p: 3,
              borderRadius: 3,
              background: 'rgba(17, 34, 64, 0.5)',
              border: '1px solid rgba(100, 255, 218, 0.1)',
              mb: 3,
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
              Course Overview
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Duration: {course.duration}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Pricing: {course.free ? 'Free' : `KES ${course.price}`}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Instructor: {course.instructor}
            </Typography>
          </Box>

          <Box
            sx={{
              p: 3,
              borderRadius: 3,
              background: 'rgba(17, 34, 64, 0.4)',
              border: '1px solid rgba(100, 255, 218, 0.1)',
              mb: 3,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Lessons
            </Typography>
            <Stack spacing={1}>
              <Box sx={{ p: 2, borderRadius: 2, background: 'rgba(255, 255, 255, 0.02)' }}>
                <Typography variant="body2">Lesson 1: Introduction to {course.title}</Typography>
              </Box>
              <Box sx={{ p: 2, borderRadius: 2, background: 'rgba(255, 255, 255, 0.02)' }}>
                <Typography variant="body2">Lesson 2: Core Concepts</Typography>
              </Box>
              <Box sx={{ p: 2, borderRadius: 2, background: 'rgba(255, 255, 255, 0.02)' }}>
                <Typography variant="body2">Lesson 3: Practical Exercise</Typography>
              </Box>
              <Box sx={{ p: 2, borderRadius: 2, background: 'rgba(255, 255, 255, 0.02)' }}>
                <Typography variant="body2">Lesson 4: Certification</Typography>
              </Box>
            </Stack>
          </Box>

          <Box
            sx={{
              p: 3,
              borderRadius: 3,
              background: 'rgba(17, 34, 64, 0.4)',
              border: '1px solid rgba(100, 255, 218, 0.1)',
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Q&A
            </Typography>
            <Stack spacing={1}>
              <Box>
                <Typography variant="subtitle2">What prerequisites are needed?</Typography>
                <Typography variant="body2" color="text.secondary">
                  Basic electrical knowledge recommended. No prior solar experience required.
                </Typography>
                <Divider sx={{ my: 1 }} />
              </Box>
              <Box>
                <Typography variant="subtitle2">Is a certificate provided?</Typography>
                <Typography variant="body2" color="text.secondary">
                  Yes, certificate of completion provided after finishing the course.
                </Typography>
                <Divider sx={{ my: 1 }} />
              </Box>
              <Box>
                <Typography variant="subtitle2">How do I access course materials?</Typography>
                <Typography variant="body2" color="text.secondary">
                  After enrollment, access your dashboard for all course materials.
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Box>

        <Box
          sx={{
            p: 3,
            borderRadius: 3,
            background: 'rgba(17, 34, 64, 0.5)',
            border: '1px solid rgba(100, 255, 218, 0.1)',
            height: 'fit-content',
          }}
        >
          <Typography variant="h6" sx={{ mb: 2 }}>
            Ready to start?
          </Typography>
          <Button
            variant="contained"
            fullWidth
            onClick={() => handleEnroll(course)}
            disabled={processingCourse === course.id}
            size="large"
          >
            {course.free ? 'Join Free' : processingCourse === course.id ? 'Processing...' : 'Enroll Now'}
          </Button>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
            {course.free 
              ? 'Click to start learning immediately' 
              : 'Payment processed via IntaSend. Check your phone for the STK prompt.'}
          </Typography>
        </Box>
      </Box>

      <Snackbar
        open={Boolean(feedback)}
        autoHideDuration={4000}
        onClose={clearFeedback}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        {feedback && (
          <Alert onClose={clearFeedback} severity={feedback.severity} variant="filled">
            {feedback.text}
          </Alert>
        )}
      </Snackbar>
    </Container>
  );
};

export default CourseDetails;
