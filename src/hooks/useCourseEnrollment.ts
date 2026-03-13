import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Course, getStoredUsername, updateProgress } from '../utils/courseStorage';
import { useAuth } from './useAuth';
import { INTASEND_CONFIG } from '../config/intasendConfig';

type Feedback = { severity: 'success' | 'error'; text: string } | null;

type IntaSendEvent = 'COMPLETE' | 'FAILED' | 'IN-PROGRESS';
type IntaSendHandler = () => void | Promise<void>;

type IntaSendInstance = {
  on: (event: IntaSendEvent, handler: IntaSendHandler) => IntaSendInstance;
};

type IntaSendConstructor = new (options: {
  publicAPIKey: string;
  live: boolean;
}) => IntaSendInstance;

type CheckoutWindow = Window & {
  IntaSend?: IntaSendConstructor;
};

const INTASEND_SCRIPT_URL = 'https://unpkg.com/intasend-inlinejs-sdk@4.0.7/build/intasend-inline.js';

// Module-level reference for the payment button
let paymentButton: HTMLButtonElement | null = null;
let sdkLoaded = false;
let sdkLoadingPromise: Promise<IntaSendConstructor> | null = null;

// Create the payment button (outside of React hooks)
const getPaymentButton = (): HTMLButtonElement => {
  if (!paymentButton || !document.body.contains(paymentButton)) {
    paymentButton = document.createElement('button');
    paymentButton.type = 'button';
    paymentButton.className = 'intaSendCoursePayButton';
    paymentButton.style.display = 'none';
    document.body.appendChild(paymentButton);
  }
  return paymentButton;
};

// Load the IntaSend SDK with retry logic
const loadIntaSendSdk = async (): Promise<IntaSendConstructor> => {
  const w = window as CheckoutWindow;
  
  if (w.IntaSend && sdkLoaded) {
    return w.IntaSend;
  }
  
  if (sdkLoadingPromise) {
    return sdkLoadingPromise;
  }

  sdkLoadingPromise = new Promise<IntaSendConstructor>((resolve, reject) => {
    const w = window as CheckoutWindow;
    
    // Check if already loaded
    if (w.IntaSend) {
      sdkLoaded = true;
      resolve(w.IntaSend);
      return;
    }

    // Check if script already exists
    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-intasend-sdk="true"], script[src*="intasend-inline.js"]'
    );
    
    if (existing) {
      // Wait for it to load
      const checkInterval = setInterval(() => {
        if (w.IntaSend) {
          clearInterval(checkInterval);
          sdkLoaded = true;
          resolve(w.IntaSend);
        }
      }, 100);
      
      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        if (!w.IntaSend) {
          reject(new Error('IntaSend SDK loading timeout'));
        }
      }, 10000);
      return;
    }

    // Create and load new script
    const script = document.createElement('script');
    script.src = INTASEND_SCRIPT_URL;
    script.async = true;
    script.dataset.intasendSdk = 'true';
    
    script.onload = () => {
      // Give it a moment to initialize
      setTimeout(() => {
        if (w.IntaSend) {
          sdkLoaded = true;
          resolve(w.IntaSend);
        } else {
          reject(new Error('IntaSend SDK loaded but window.IntaSend is not available'));
        }
      }, 500);
    };
    
    script.onerror = () => {
      reject(new Error('Failed to load IntaSend SDK'));
    };
    
    document.body.appendChild(script);
  });

  return sdkLoadingPromise;
};

export const useCourseEnrollment = () => {
  const { user, isAuthenticated, setLoginModalOpen } = useAuth();
  const navigate = useNavigate();
  const [processingCourse, setProcessingCourse] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);
  
  // Use useRef to store the current course for callbacks
  const currentCourseRef = useRef<Course | null>(null);
  const currentUsernameRef = useRef<string>('');
  const currentUserRef = useRef(user);

  // Keep user ref updated
  currentUserRef.current = user;

  // Start IntaSend checkout for course payment
  const startIntaSendCheckout = async (params: {
    checkoutOrderId: string;
    amount: number;
    email: string;
    phone: string;
    course: Course;
    username: string;
  }) => {
    const { checkoutOrderId, amount, email, phone, course, username } = params;

    console.log('[Course Payment] Starting payment for course:', course.title);
    console.log('[Course Payment] Amount:', amount, 'KES');

    if (!INTASEND_CONFIG.PUBLIC_KEY) {
      throw new Error('IntaSend public key is not configured');
    }

    // Store for callback access
    currentCourseRef.current = course;
    currentUsernameRef.current = username;

    // Get the payment button
    const btn = getPaymentButton();
    
    // Set button attributes - these are critical for the SDK
    btn.setAttribute('data-amount', String(amount));
    btn.setAttribute('data-currency', 'KES');
    btn.setAttribute('data-email', email);
    btn.setAttribute('data-phone_number', phone);
    btn.setAttribute('data-api_ref', checkoutOrderId);

    console.log('[Course Payment] Button configured, loading SDK...');

    try {
      // Load SDK first
      const IntaSend = await loadIntaSendSdk();
      console.log('[Course Payment] SDK loaded successfully');

      // Create IntaSend instance with handlers
      const intaSendInstance = new IntaSend({
        publicAPIKey: INTASEND_CONFIG.PUBLIC_KEY,
        live: true,
      });

      // Set up event handlers BEFORE clicking
      intaSendInstance
        .on('COMPLETE', async () => {
          console.log('[Course Payment] Payment completed!');
          const enrolledCourse = currentCourseRef.current;
          const storedUsername = currentUsernameRef.current;
          const currentUser = currentUserRef.current;
          
          if (enrolledCourse) {
            updateProgress({
              courseId: enrolledCourse.id,
              progress: 0,
              completed: false,
              userId: currentUser?.uid,
              username: storedUsername,
            });
            setFeedback({
              severity: 'success',
              text: `${enrolledCourse.title} enrolled successfully! Check your dashboard.`,
            });
            setTimeout(() => {
              navigate('/student-dashboard');
            }, 1500);
          }
        })
        .on('FAILED', () => {
          console.log('[Course Payment] Payment failed or cancelled');
          setFeedback({ severity: 'error', text: 'Payment failed or was cancelled. You can try again.' });
        })
        .on('IN-PROGRESS', () => {
          console.log('[Course Payment] Payment in progress...');
        });

      console.log('[Course Payment] Triggering payment...');
      
      // Add small delay to ensure SDK is ready
      await new Promise(resolve => setTimeout(resolve, 100));
      
      btn.click();
      console.log('[Course Payment] Payment triggered!');
    } catch (sdkError) {
      console.error('[Course Payment] SDK Error:', sdkError);
      const errorMsg = sdkError instanceof Error ? sdkError.message : 'Payment failed to initialize';
      throw new Error(`Payment Error: ${errorMsg}`);
    }
  };

  const enroll = async (course: Course) => {
    console.log('[Course Enrollment] Enroll clicked for:', course.title, 'Free:', course.free);
    
    if (!isAuthenticated) {
      console.log('[Course Enrollment] Not authenticated, opening login modal');
      setFeedback({ severity: 'error', text: 'Sign in before enrolling in a course.' });
      setLoginModalOpen(true);
      return;
    }

    const username = getStoredUsername() || user?.name || '';

    if (course.free) {
      console.log('[Course Enrollment] Free course, enrolling directly');
      updateProgress({
        courseId: course.id,
        progress: 0,
        completed: true,
        userId: user?.uid,
        username,
      });
      setFeedback({ severity: 'success', text: `${course.title} added to your dashboard.` });
      setTimeout(() => {
        navigate('/student-dashboard');
      }, 1000);
      return;
    }

    // For paid courses
    console.log('[Course Enrollment] Paid course, starting payment');
    const phone = '0712345678'; // Default phone
    
    try {
      setProcessingCourse(course.id);
      const orderId = `course-${course.id}-${Date.now()}`;
      
      await startIntaSendCheckout({
        checkoutOrderId: orderId,
        amount: course.price,
        email: user?.email || `${username || 'student'}@topheights.local`,
        phone: phone,
        course: course,
        username: username,
      });
      
    } catch (error) {
      console.error('[Course Enrollment] Error:', error);
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
