export interface Course {
  id: string;
  title: string;
  description: string;
  duration: string;
  price: number;
  instructor: string;
  category: string;
  free?: boolean;
}

export interface StudentCourse {
  courseId: string;
  username?: string;
  userId?: string;
  progress: number;
  completed: boolean;
  enrolledAt: string;
}

const COURSES_STORAGE_KEY = 'topheights_courses';
const STUDENT_COURSES_KEY = 'topheights_student_courses';
const CURRENT_USERNAME_KEY = 'topheights_current_username';
const ADMIN_ACCESS_KEY = 'topheights_admin_access';

const DEFAULT_COURSES: Course[] = [
  {
    id: 'solar-installation-basics',
    title: 'Solar PV Installation Basics',
    description: 'Learn the fundamentals of installing solar photovoltaic systems, from panel mounting to wiring connections.',
    duration: '4 weeks',
    price: 0,
    instructor: 'JOHN GATEHI',
    category: 'Solar',
    free: true,
  },
  {
    id: 'off-grid-solar-systems',
    title: 'Off-Grid Solar System Design',
    description: 'Master the design and installation of off-grid solar systems with battery storage for remote locations.',
    duration: '6 weeks',
    price: 15000,
    instructor: 'JOHN GATEHI',
    category: 'Solar',
  },
  {
    id: 'grid-tied-solar-installations',
    title: 'Grid-Tied Solar Installations',
    description: 'Learn to install and connect grid-tied solar systems with net metering for residential and commercial properties.',
    duration: '5 weeks',
    price: 12000,
    instructor: 'JOHN GATEHI',
    category: 'Solar',
  },
  {
    id: 'solar-battery-systems',
    title: 'Solar Battery Storage Systems',
    description: 'Comprehensive training on solar battery installation, maintenance, and troubleshooting of energy storage systems.',
    duration: '4 weeks',
    price: 10000,
    instructor: 'JOHN GATEHI',
    category: 'Solar',
  },
  {
    id: 'electrical-wiring-fundamentals',
    title: 'Electrical Wiring Fundamentals',
    description: 'Essential electrical wiring skills for residential and commercial buildings, including safety protocols.',
    duration: '8 weeks',
    price: 8000,
    instructor: 'JOHN GATEHI',
    category: 'Electrical',
  },
  {
    id: 'solar-water-heating',
    title: 'Solar Water Heating Systems',
    description: 'Install and maintain solar water heating systems for domestic and commercial applications.',
    duration: '3 weeks',
    price: 5000,
    instructor: 'JOHN GATEHI',
    category: 'Solar',
  },
  {
    id: 'electrical-panel-installation',
    title: 'Electrical Panel Installation',
    description: 'Learn proper installation and configuration of electrical distribution panels and circuit breakers.',
    duration: '4 weeks',
    price: 7500,
    instructor: 'JOHN GATEHI',
    category: 'Electrical',
  },
  {
    id: 'solar-pump-installation',
    title: 'Solar Water Pump Installation',
    description: 'Install and maintain solar-powered water pumping systems for irrigation and domestic water supply.',
    duration: '3 weeks',
    price: 6000,
    instructor: 'JOHN GATEHI',
    category: 'Solar',
  },
];

const safeRead = <T>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') {
    return fallback;
  }
  const stored = window.localStorage.getItem(key);
  if (!stored) return fallback;
  try {
    return JSON.parse(stored) as T;
  } catch {
    return fallback;
  }
};

const safeSave = <T>(key: string, value: T) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
};

// Old course IDs to detect and replace
const OLD_COURSE_IDS = [
  'web-development-fundamentals',
  'react-mastery',
  'cybersecurity-basics',
  'product-design-sprints',
];

export const getCourses = (): Course[] => {
  const stored = safeRead<Course[]>(COURSES_STORAGE_KEY, []);
  // Check if old courses exist or if stored courses have old IDs
  const hasOldCourses = stored.length === 0 || stored.some(c => OLD_COURSE_IDS.includes(c.id));
  if (stored.length > 0 && !hasOldCourses) return stored;
  // Replace with new solar courses
  safeSave(COURSES_STORAGE_KEY, DEFAULT_COURSES);
  return DEFAULT_COURSES;
};

export const saveCourses = (courses: Course[]) => {
  safeSave(COURSES_STORAGE_KEY, courses);
};

export const getStudentCourses = (): StudentCourse[] => {
  return safeRead<StudentCourse[]>(STUDENT_COURSES_KEY, []);
};

export const saveStudentCourses = (entries: StudentCourse[]) => {
  safeSave(STUDENT_COURSES_KEY, entries);
};

export const updateProgress = (params: {
  courseId: string;
  userId?: string;
  username?: string;
  progress: number;
  completed?: boolean;
}): StudentCourse => {
  const entries = getStudentCourses();
  const existingIndex = entries.findIndex((entry) => entry.courseId === params.courseId && entry.userId === params.userId);
  if (existingIndex > -1) {
    const updated: StudentCourse = {
      ...entries[existingIndex],
      progress: params.progress,
      completed: params.completed ?? entries[existingIndex].completed,
      username: params.username ?? entries[existingIndex].username,
    };
    entries[existingIndex] = updated;
    saveStudentCourses(entries);
    return updated;
  }

  const newEntry: StudentCourse = {
    courseId: params.courseId,
    userId: params.userId,
    username: params.username,
    progress: params.progress,
    completed: params.completed ?? false,
    enrolledAt: new Date().toISOString(),
  };
  const next = [...entries, newEntry];
  saveStudentCourses(next);
  return newEntry;
};

export const getStoredUsername = (): string => {
  return safeRead<string>(CURRENT_USERNAME_KEY, '');
};

export const setStoredUsername = (value: string) => {
  safeSave(CURRENT_USERNAME_KEY, value);
};

export const clearStoredUsername = () => {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(CURRENT_USERNAME_KEY);
};

export const isAdminAccessAllowed = (): boolean => {
  return safeRead<boolean>(ADMIN_ACCESS_KEY, false);
};

export const setAdminAccessAllowed = (value: boolean) => {
  safeSave(ADMIN_ACCESS_KEY, value);
};

export const clearAdminAccessFlag = () => {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(ADMIN_ACCESS_KEY);
};
