import React, { useMemo, useState, useEffect } from 'react';
import { Container, Typography, Stack, Chip, Box, Snackbar, Alert } from '@mui/material';
import CourseCard from '../../components/CourseCard';
import { Course, getCourses as getLocalCourses } from '../../utils/courseStorage';
import { useCourseEnrollment } from '../../hooks/useCourseEnrollment';
import { getCoursesFromFirestore, subscribeToCourses } from '../../services/courseService';

const CoursesPage: React.FC = () => {
  const { handleEnroll, processingCourse, feedback, clearFeedback } = useCourseEnrollment();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  // Subscribe to courses from Firestore
  useEffect(() => {
    // First try to get courses from Firestore
    getCoursesFromFirestore().then((firestoreCourses) => {
      if (firestoreCourses.length > 0) {
        setCourses(firestoreCourses);
      } else {
        // Fallback to localStorage courses if Firestore is empty
        console.log('[CoursesPage] Firestore empty, using local courses');
        setCourses(getLocalCourses());
      }
      setLoading(false);
    }).catch(() => {
      // Fallback to localStorage on error
      console.log('[CoursesPage] Firestore error, using local courses');
      setCourses(getLocalCourses());
      setLoading(false);
    });

    // Subscribe to real-time updates from Firestore
    const unsubscribe = subscribeToCourses((updatedCourses) => {
      if (updatedCourses.length > 0) {
        setCourses(updatedCourses);
      }
    });

    return () => unsubscribe();
  }, []);

  const categories = useMemo(() => {
    const found = Array.from(new Set(courses.map((course) => course.category)));
    return ['All', ...found];
  }, [courses]);

  const filteredCourses =
    selectedCategory === 'All'
      ? courses
      : courses.filter((course) => course.category === selectedCategory);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
          Courses
        </Typography>
        <Typography color="text.secondary">Loading courses...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
        Courses
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Choose a learning path and enroll today. Free tier options are included for self-paced study.
      </Typography>

      <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 3 }}>
        {categories.map((category) => (
          <Chip
            key={category}
            label={category}
            variant={selectedCategory === category ? 'filled' : 'outlined'}
            color="primary"
            onClick={() => setSelectedCategory(category)}
            sx={{ cursor: 'pointer' }}
          />
        ))}
      </Stack>

      {filteredCourses.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography variant="h6" color="text.secondary">
            No courses available yet.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Check back soon for new courses!
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(1, minmax(0, 1fr))',
              sm: 'repeat(2, minmax(0, 1fr))',
              md: 'repeat(3, minmax(0, 1fr))',
            },
            gap: 3,
          }}
        >
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onEnroll={() => handleEnroll(course)}
              enrolling={processingCourse === course.id}
            />
          ))}
        </Box>
      )}

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

export default CoursesPage;
