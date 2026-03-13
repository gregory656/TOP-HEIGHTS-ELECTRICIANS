import React, { useMemo, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Stack,
  Chip,
  Divider,
} from '@mui/material';
import CourseProgress from '../../components/CourseProgress';
import {
  getCourses,
  getStudentCourses,
  updateProgress,
  getStoredUsername,
} from '../../utils/courseStorage';

const lessonsPlaceholder = [
  'Lesson 1: Introduction',
  'Lesson 2: Core Concepts',
  'Lesson 3: Practical Exercise',
];

const StudentDashboard: React.FC = () => {
  const username = getStoredUsername();
  const courses = useMemo(() => getCourses(), []);
  const buildStudentEntries = () =>
    getStudentCourses().map((entry) => ({
      ...entry,
      course: courses.find((course) => course.id === entry.courseId),
    }));
  const [studentEntries, setStudentEntries] = useState(buildStudentEntries);

  const freeCourses = courses.filter((course) => course.free);

  const handleContinue = (entryId: string) => {
    const entry = studentEntries.find((item) => item.courseId === entryId);
    if (!entry) return;
    const nextProgress = Math.min(entry.progress + 10, 100);
    updateProgress({
      courseId: entry.courseId,
      progress: nextProgress,
      completed: nextProgress >= 100,
      userId: entry.userId,
      username: entry.username,
    });
    setStudentEntries(buildStudentEntries());
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
        Welcome, {username || 'Learner'}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Track your progress, pick up new content, and continue learning with Top Heights.
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
          gap: 3,
        }}
      >
        <Box>
          <Card
            sx={{
              background: 'rgba(17, 34, 64, 0.65)',
              border: '1px solid rgba(100, 255, 218, 0.1)',
              mb: 3,
            }}
          >
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h5">Enrolled Courses</Typography>
                <Chip label={`${studentEntries.length} tracked`} />
              </Stack>
              <Stack spacing={2}>
                {studentEntries.map((entry) => {
                  const course = entry.course;
                  if (!course) return null;
                  return (
                    <Box
                      key={`${entry.courseId}-${entry.enrolledAt}`}
                      sx={{ p: 2, borderRadius: 2, background: 'rgba(255, 255, 255, 0.02)' }}
                    >
                      <CourseProgress
                        title={course.title}
                        instructor={course.instructor}
                        progress={entry.progress}
                      />
                      <Button
                        variant="contained"
                        size="small"
                        sx={{ mt: 2 }}
                        onClick={() => handleContinue(entry.courseId)}
                      >
                        Continue Course
                      </Button>
                    </Box>
                  );
                })}
                {studentEntries.length === 0 && (
                  <Typography color="text.secondary">
                    You have not enrolled in any courses yet. Visit the Courses page to get started.
                  </Typography>
                )}
              </Stack>
            </CardContent>
          </Card>

          <Card
            sx={{
              background: 'rgba(17, 34, 64, 0.65)',
              border: '1px solid rgba(100, 255, 218, 0.1)',
              mb: 3,
            }}
          >
            <CardContent>
              <Typography variant="h5" sx={{ mb: 2 }}>
                Video Lessons Placeholder
              </Typography>
              <Stack spacing={1}>
                {lessonsPlaceholder.map((lesson) => (
                  <Typography key={lesson} variant="body2" color="text.secondary">
                    {lesson}
                  </Typography>
                ))}
              </Stack>
            </CardContent>
          </Card>

          <Card
            sx={{
              background: 'rgba(17, 34, 64, 0.65)',
              border: '1px solid rgba(100, 255, 218, 0.1)',
            }}
          >
            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="h5">Downloadable Resources</Typography>
              <Typography color="text.secondary">
                PDF guides and walkthroughs will appear here once published.
              </Typography>
              <Button variant="contained">Download PDF</Button>
            </CardContent>
          </Card>
        </Box>

        <Box
          sx={{
            p: 3,
            borderRadius: 3,
            background: 'rgba(17, 34, 64, 0.55)',
            border: '1px solid rgba(100, 255, 218, 0.1)',
          }}
        >
          <Typography variant="h5" sx={{ mb: 2 }}>
            Free Tier
          </Typography>
          <Stack spacing={1}>
            {freeCourses.length === 0 && (
              <Typography color="text.secondary">No free courses available yet.</Typography>
            )}
            {freeCourses.map((course) => (
              <Box key={course.id}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {course.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {course.description}
                </Typography>
                <Chip label="Free" size="small" sx={{ mt: 1 }} />
                <Divider sx={{ my: 1 }} />
              </Box>
            ))}
          </Stack>
        </Box>
      </Box>
    </Container>
  );
};

export default StudentDashboard;
