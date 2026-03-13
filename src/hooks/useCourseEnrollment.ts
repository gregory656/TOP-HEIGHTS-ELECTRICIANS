import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Course, getStoredUsername, updateProgress } from '../utils/courseStorage';
import { useAuth } from './useAuth';
import { createOrderWithItems, updateOrderStatus } from '../services/orderService';
import { triggerIntaSendPayment } from '../services/intasendService';

type Feedback = { severity: 'success' | 'error' | 'info'; text: string } | null;

const PHONE_PROMPT_TITLE = 'Enter the phone number that will receive the IntaSend checkout';
const PHONE_PROMPT_HINT = 'Use +2547XXXXXXXX or 07XXXXXXXX';

const normalizeKenyanPhone = (input: string): string => {
  let value = input.replace(/\s+/g, '').replace(/[^0-9+]/g, '');
  if (value.startsWith('+')) {
    value = value.slice(1);
  }
  if (value.startsWith('0')) {
    value = `254${value.slice(1)}`;
  }
  if (value && !value.startsWith('254')) {
    value = `254${value}`;
  }
  return value;
};

const askForPhoneNumber = (fallback: string) => {
  if (typeof window === 'undefined') {
    return fallback;
  }
  const raw = window.prompt(`${PHONE_PROMPT_TITLE}\n${PHONE_PROMPT_HINT}`, fallback);
  if (!raw) return '';
  return raw.trim();
};

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

    const fallbackPhone = firebaseUser?.phoneNumber || '0712345678';
    const rawPhone = askForPhoneNumber(fallbackPhone);
    if (!rawPhone) {
      setFeedback({ severity: 'error', text: 'Phone number is required to open the IntaSend checkout.' });
      return;
    }
    const phoneNumber = normalizeKenyanPhone(rawPhone);

    setProcessingCourse(course.id);
    setFeedback({ severity: 'info', text: 'Opening IntaSend checkout...' });

    let currentOrderId: string | null = null;
    const displayName = user.name || username || 'Top Heights Student';

    try {
      const { orderId, totalAmount } = await createOrderWithItems({
        userId: user.uid,
        fullName: displayName,
        email,
        phone: phoneNumber,
        address: 'Online Course Purchase',
        paymentMethod: 'INTASEND',
        items: [
          {
            productId: course.id,
            name: course.title,
            price: course.price,
            quantity: 1,
          },
        ],
      });

      currentOrderId = orderId;
      await triggerIntaSendPayment({
        checkoutOrderId: orderId,
        amount: totalAmount,
        email,
        phone: phoneNumber,
        callbacks: {
          onStatusChange: (status) => {
            if (status === 'IN-PROGRESS') {
              setFeedback({
                severity: 'info',
                text: 'Payment in progress. Complete the IntaSend checkout popup.',
              });
            }
          },
          onComplete: async () => {
            try {
              await updateOrderStatus(orderId, {
                paymentStatus: 'paid',
                orderStatus: 'processed',
              });
              setFeedback({
                severity: 'success',
                text: `${course.title} enrolled successfully! Check your dashboard.`,
              });
            } catch (statusError) {
              console.error('[Course Enrollment] Order status update failed', statusError);
              setFeedback({
                severity: 'success',
                text: `${course.title} enrolled successfully! Check your dashboard.`,
              });
            }
            updateProgress({
              courseId: course.id,
              progress: 0,
              completed: false,
              userId: user.uid,
              username,
            });
            setTimeout(() => navigate('/student-dashboard'), 1500);
            setProcessingCourse(null);
          },
          onFailed: async () => {
            if (currentOrderId) {
              await updateOrderStatus(currentOrderId, { paymentStatus: 'failed' });
            }
            setFeedback({
              severity: 'error',
              text: 'Payment failed or was cancelled. Please try again.',
            });
            setProcessingCourse(null);
          },
        },
      });
    } catch (error) {
      console.error('[Course Enrollment] Payment error:', error);
      const message = error instanceof Error ? error.message : 'Enrollment failed.';
      setFeedback({ severity: 'error', text: message });
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
