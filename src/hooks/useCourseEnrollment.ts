import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Course, getStoredUsername, updateProgress } from '../utils/courseStorage';
import { useAuth } from './useAuth';

type Feedback = { severity: 'success' | 'error' | 'info'; text: string } | null;

export const useCourseEnrollment = () => {
  const { user, isAuthenticated, setLoginModalOpen } = useAuth();
  const navigate = useNavigate();
  const [processingCourse] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);

  const enroll = async (course: Course) => {
    if (!isAuthenticated || !user) {
      setFeedback({ severity: 'error', text: 'Sign in before enrolling in a course.' });
      setLoginModalOpen(true);
      return;
    }

    const storedUsername = getStoredUsername();
    const username = storedUsername || user.name || 'Student';

    if (course.free) {
      updateProgress({
        courseId: course.id,
        progress: 0,
        completed: true,
        userId: user.uid,
        username,
      });
      setFeedback({ severity: 'success', text: `${course.title} added to your dashboard.` });
      setTimeout(() => {
        navigate('/student-dashboard');
      }, 1000);
      return;
    }

    setFeedback({ severity: 'info', text: 'Paid training enrolment is being prepared. Please contact the team to register; no payment has been requested.' });
  };

  return {
    handleEnroll: enroll,
    processingCourse,
    feedback,
    clearFeedback: () => setFeedback(null),
  };
};

export default useCourseEnrollment;
