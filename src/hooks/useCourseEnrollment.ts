import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Course, getStoredUsername, updateProgress } from '../utils/courseStorage';
import { useAuth } from './useAuth';
import { createOrderWithItems, initiateSTKPush, pollPaymentStatus } from '../services/orderService';

type Feedback = { severity: 'success' | 'error' | 'info'; text: string } | null;

const MPESA_PHONE_FALLBACK = '0712345678';

export const useCourseEnrollment = () => {
  const { user, firebaseUser, isAuthenticated, setLoginModalOpen } = useAuth();
  const navigate = useNavigate();
  const [processingCourse, setProcessingCourse] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);

  const enroll = async (course: Course) => {
    if (!isAuthenticated || !user) {
      setFeedback({ severity: 'error', text: 'Sign in before enrolling in a course.' });
      setLoginModalOpen(true);
      return;
    }

    const storedUsername = getStoredUsername();
    const username = storedUsername || user.name || 'Student';
    const email = user.email || `${username.toLowerCase().replace(/\s+/g, '')}@topheights.local`;

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

    const phoneNumber = firebaseUser?.phoneNumber || MPESA_PHONE_FALLBACK;

    setProcessingCourse(course.id);
    setFeedback({ severity: 'info', text: 'Preparing payment. Please check your phone for the STK push.' });

    try {
      const displayName = user.name || username || 'Top Heights Student';
      const { orderId, totalAmount } = await createOrderWithItems({
        userId: user.uid,
        fullName: displayName,
        email,
        phone: phoneNumber,
        address: 'Online Course Purchase',
        paymentMethod: 'MPESA',
        items: [
          {
            productId: course.id,
            name: course.title,
            price: course.price,
            quantity: 1,
          },
        ],
      });

      setFeedback({ severity: 'info', text: 'STK push sent. Waiting for payment confirmation...' });
      const { checkoutId } = await initiateSTKPush(orderId, phoneNumber, totalAmount, email);

      const paid = await pollPaymentStatus(
        checkoutId,
        orderId,
        ({ status, message, attempt, maxAttempts }) => {
          console.log('[Course Payment] Status', `${attempt}/${maxAttempts}`, status, message || '');
        },
        20,
        3000
      );

      if (paid) {
        updateProgress({
          courseId: course.id,
          progress: 0,
          completed: false,
          userId: user.uid,
          username,
        });
        setFeedback({
          severity: 'success',
          text: `${course.title} enrolled successfully! Check your dashboard.`,
        });
        setTimeout(() => {
          navigate('/student-dashboard');
        }, 1500);
      } else {
        setFeedback({
          severity: 'error',
          text: 'Payment failed or timed out. If your M-Pesa has insufficient funds, top up and try again.',
        });
      }
    } catch (error) {
      console.error('[Course Enrollment] Payment error:', error);
      const message = error instanceof Error ? error.message : 'Enrollment failed.';
      setFeedback({ severity: 'error', text: message });
    } finally {
      setProcessingCourse(null);
    }
  };

  return {
    handleEnroll: enroll,
    processingCourse,
    feedback,
    clearFeedback: () => setFeedback(null),
  };
};

export default useCourseEnrollment;
