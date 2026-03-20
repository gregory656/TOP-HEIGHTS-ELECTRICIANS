import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc,
  query, 
  orderBy,
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { Course } from '../utils/courseStorage';

const COURSES_COLLECTION = 'courses';

// Firestore course interface (matches Course but with Firestore metadata)
export interface FirestoreCourse extends Course {
  createdAt?: unknown;
  updatedAt?: unknown;
}

// Get all courses from Firestore
export const getCoursesFromFirestore = async (): Promise<Course[]> => {
  try {
    const coursesRef = collection(db, COURSES_COLLECTION);
    const q = query(coursesRef, orderBy('title', 'asc'));
    const querySnapshot = await getDocs(q);
    
    const courses: Course[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data() as FirestoreCourse;
      courses.push({
        id: doc.id,
        title: data.title,
        description: data.description,
        duration: data.duration,
        price: data.price,
        instructor: data.instructor,
        category: data.category,
        free: data.free,
      });
    });
    
    return courses;
  } catch (error) {
    console.error('Error getting courses from Firestore:', error);
    return [];
  }
};

// Save a course to Firestore (create or update)
export const saveCourseToFirestore = async (course: Course): Promise<boolean> => {
  try {
    const courseRef = doc(db, COURSES_COLLECTION, course.id);
    await setDoc(courseRef, {
      ...course,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    
    return true;
  } catch (error) {
    console.error('Error saving course to Firestore:', error);
    return false;
  }
};

// Delete a course from Firestore
export const deleteCourseFromFirestore = async (courseId: string): Promise<boolean> => {
  try {
    const courseRef = doc(db, COURSES_COLLECTION, courseId);
    await deleteDoc(courseRef);
    return true;
  } catch (error) {
    console.error('Error deleting course from Firestore:', error);
    return false;
  }
};

// Subscribe to courses changes in real-time
export const subscribeToCourses = (
  callback: (courses: Course[]) => void
): (() => void) => {
  const coursesRef = collection(db, COURSES_COLLECTION);
  const q = query(coursesRef, orderBy('title', 'asc'));
  
  return onSnapshot(q, (snapshot) => {
    const courses: Course[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data() as FirestoreCourse;
      courses.push({
        id: doc.id,
        title: data.title,
        description: data.description,
        duration: data.duration,
        price: data.price,
        instructor: data.instructor,
        category: data.category,
        free: data.free,
      });
    });
    callback(courses);
  });
};

// Student enrollment interface
export interface StudentEnrollment {
  id?: string;
  userId: string;
  username: string;
  email: string;
  courseId: string;
  progress: number;
  completed: boolean;
  enrolledAt: string;
}

const ENROLLMENTS_COLLECTION = 'enrollments';

// Get all enrollments from Firestore
export const getEnrollmentsFromFirestore = async (): Promise<StudentEnrollment[]> => {
  try {
    const enrollmentsRef = collection(db, ENROLLMENTS_COLLECTION);
    const querySnapshot = await getDocs(enrollmentsRef);
    
    const enrollments: StudentEnrollment[] = [];
    querySnapshot.forEach((doc) => {
      enrollments.push({
        id: doc.id,
        ...doc.data() as Omit<StudentEnrollment, 'id'>,
      });
    });
    
    return enrollments;
  } catch (error) {
    console.error('Error getting enrollments from Firestore:', error);
    return [];
  }
};

// Save enrollment to Firestore
export const saveEnrollmentToFirestore = async (enrollment: Omit<StudentEnrollment, 'id'>): Promise<boolean> => {
  try {
    const docRef = doc(collection(db, ENROLLMENTS_COLLECTION));
    await setDoc(docRef, {
      ...enrollment,
      enrolledAt: enrollment.enrolledAt || new Date().toISOString(),
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error('Error saving enrollment to Firestore:', error);
    return false;
  }
};

// Update enrollment progress
export const updateEnrollmentProgress = async (
  enrollmentId: string, 
  progress: number, 
  completed: boolean
): Promise<boolean> => {
  try {
    const enrollmentRef = doc(db, ENROLLMENTS_COLLECTION, enrollmentId);
    await setDoc(enrollmentRef, {
      progress,
      completed,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    return true;
  } catch (error) {
    console.error('Error updating enrollment progress:', error);
    return false;
  }
};

// Subscribe to enrollments changes
export const subscribeToEnrollments = (
  callback: (enrollments: StudentEnrollment[]) => void
): (() => void) => {
  const enrollmentsRef = collection(db, ENROLLMENTS_COLLECTION);
  
  return onSnapshot(enrollmentsRef, (snapshot) => {
    const enrollments: StudentEnrollment[] = [];
    snapshot.forEach((doc) => {
      enrollments.push({
        id: doc.id,
        ...doc.data() as Omit<StudentEnrollment, 'id'>,
      });
    });
    callback(enrollments);
  });
};

// News interface
export interface NewsItem {
  id?: string;
  title: string;
  content: string;
  date: string;
  active: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

const NEWS_COLLECTION = 'news';

// Get all news from Firestore
export const getNewsFromFirestore = async (): Promise<NewsItem[]> => {
  try {
    const newsRef = collection(db, NEWS_COLLECTION);
    const q = query(newsRef, orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const news: NewsItem[] = [];
    querySnapshot.forEach((doc) => {
      news.push({
        id: doc.id,
        ...doc.data() as NewsItem,
      });
    });
    
    return news;
  } catch (error) {
    console.error('Error getting news from Firestore:', error);
    return [];
  }
};

// Save news to Firestore
export const saveNewsToFirestore = async (news: NewsItem): Promise<boolean> => {
  try {
    const newsId = news.id || `news-${Date.now()}`;
    const newsRef = doc(db, NEWS_COLLECTION, newsId);
    await setDoc(newsRef, {
      ...news,
      id: newsId,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    return true;
  } catch (error) {
    console.error('Error saving news to Firestore:', error);
    return false;
  }
};

// Delete news from Firestore
export const deleteNewsFromFirestore = async (newsId: string): Promise<boolean> => {
  try {
    const newsRef = doc(db, NEWS_COLLECTION, newsId);
    await deleteDoc(newsRef);
    return true;
  } catch (error) {
    console.error('Error deleting news from Firestore:', error);
    return false;
  }
};

// Subscribe to news
export const subscribeToNews = (
  callback: (news: NewsItem[]) => void
): (() => void) => {
  const newsRef = collection(db, NEWS_COLLECTION);
  const q = query(newsRef, orderBy('date', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const news: NewsItem[] = [];
    snapshot.forEach((doc) => {
      news.push({
        id: doc.id,
        ...doc.data() as NewsItem,
      });
    });
    callback(news);
  });
};

// Orders interface
export interface OrderItem {
  id?: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  phone: string;
  items: Array<{
    productId: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
}

const ORDERS_COLLECTION = 'orders';

// Get all orders from Firestore
export const getOrdersFromFirestore = async (): Promise<OrderItem[]> => {
  try {
    const ordersRef = collection(db, ORDERS_COLLECTION);
    const q = query(ordersRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const orders: OrderItem[] = [];
    querySnapshot.forEach((doc) => {
      orders.push({
        id: doc.id,
        ...doc.data() as OrderItem,
      });
    });
    
    return orders;
  } catch (error) {
    console.error('Error getting orders from Firestore:', error);
    return [];
  }
};

// Subscribe to orders
export const subscribeToOrders = (
  callback: (orders: OrderItem[]) => void
): (() => void) => {
  const ordersRef = collection(db, ORDERS_COLLECTION);
  const q = query(ordersRef, orderBy('createdAt', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const orders: OrderItem[] = [];
    snapshot.forEach((doc) => {
      orders.push({
        id: doc.id,
        ...doc.data() as OrderItem,
      });
    });
    callback(orders);
  });
};

export default {
  getCoursesFromFirestore,
  saveCourseToFirestore,
  deleteCourseFromFirestore,
  subscribeToCourses,
  getEnrollmentsFromFirestore,
  saveEnrollmentToFirestore,
  updateEnrollmentProgress,
  subscribeToEnrollments,
  getNewsFromFirestore,
  saveNewsToFirestore,
  deleteNewsFromFirestore,
  subscribeToNews,
  getOrdersFromFirestore,
  subscribeToOrders,
};
