import { getCourses } from '../utils/courseStorage';
import type { Course } from '../utils/courseStorage';
import type { NewsItem, OrderItem, StudentEnrollment } from '../services/courseService';
import { products } from '../data/products';

const news: NewsItem[] = [{ id: 'demo-news', title: 'Sample training announcement', content: 'Demo content for reviewing the news layout. This is not a live announcement.', date: '2026-09-17', active: true }];
const enrollments: StudentEnrollment[] = [{ id: 'demo-enrollment', userId: 'preview-customer', username: 'Demo Customer', email: 'customer@example.test', courseId: 'solar-installation-basics', progress: 35, completed: false, enrolledAt: '2026-09-17' }];
const orders: OrderItem[] = [{ id: 'demo-order', orderId: 'DEMO-001', customerName: 'Demo Customer', customerEmail: 'customer@example.test', phone: 'Demo only', items: [{ productId: '1', name: products[0].name, price: products[0].price, quantity: 1 }], totalAmount: products[0].price, paymentMethod: 'DEMO', paymentStatus: 'pending', orderStatus: 'pending', createdAt: '2026-09-17' }];

function subscribe<T>(data: T[], callback: (items: T[]) => void) { callback(structuredClone(data)); return () => {}; }
async function readOnly() { window.alert('Client preview: changes to courses, news and enrollments are disabled.'); return false; }

export const getCoursesFromFirestore = async () => getCourses();
export const subscribeToCourses = (callback: (data: Course[]) => void) => subscribe(getCourses(), callback);
export const getNewsFromFirestore = async () => structuredClone(news);
export const subscribeToNews = (callback: (data: NewsItem[]) => void) => subscribe(news, callback);
export const getEnrollmentsFromFirestore = async () => structuredClone(enrollments);
export const subscribeToEnrollments = (callback: (data: StudentEnrollment[]) => void) => subscribe(enrollments, callback);
export const getOrdersFromFirestore = async () => structuredClone(orders);
export const subscribeToOrders = (callback: (data: OrderItem[]) => void) => subscribe(orders, callback);
export const fetchProducts = async () => products;
export const subscribeProducts = (callback: (items: typeof products) => void) => { callback(products.map(p => ({ ...p, stock: p.inStock === false ? 0 : 20, status: p.inStock === false ? 'out_of_stock' : 'active', published: true, featured: true, version: 1, sku: `DEMO-${p.id}` }))); return () => {}; };
export const saveCourseToFirestore = readOnly;
export const deleteCourseFromFirestore = readOnly;
export const saveNewsToFirestore = readOnly;
export const deleteNewsFromFirestore = readOnly;
export const saveEnrollmentToFirestore = readOnly;
export const updateEnrollmentProgress = readOnly;
