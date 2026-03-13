// src/pages/AdminPanel.tsx
import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Switch,
  Grid,
  Card,
  CardContent,
  Alert,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Inventory,
  Article,
  LocalShipping,
  TrendingUp,
  School,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { Course } from '../utils/courseStorage';
import { 
  getCoursesFromFirestore, 
  saveCourseToFirestore, 
  deleteCourseFromFirestore,
  subscribeToCourses 
} from '../services/courseService';

interface Product {
  id: number;
  name: string;
  price: number;
  size: string;
  color: string;
  description: string;
  inStock: boolean;
  category: string;
  image: string;
}

interface NewsItem {
  id: number;
  title: string;
  content: string;
  date: string;
  active: boolean;
}

interface Order {
  id: string;
  customer: string;
  product: string;
  status: 'Pending' | 'Approved' | 'Completed';
  date: string;
  total: number;
}

const initialProducts: Product[] = [
  { id: 1, name: 'Industrial Circuit Breaker', price: 4500, size: '200A', color: 'Grey', description: 'High-capacity circuit breaker', inStock: true, category: 'Breakers', image: 'https://picsum.photos/400/300?breaker' },
  { id: 2, name: 'LED Bulb Pack', price: 850, size: '9W', color: 'White', description: 'Energy-efficient LED bulbs', inStock: true, category: 'Lighting', image: 'https://picsum.photos/400/300?led' },
];

const initialNews: NewsItem[] = [
  { id: 1, title: 'New Solar Panel Range', content: 'Added new solar panels', date: '2024-01-15', active: true },
];

const initialOrders: Order[] = [
  { id: 'ORD-001', customer: 'John Doe', product: 'Industrial Circuit Breaker', status: 'Pending', date: '2024-01-20', total: 4500 },
];

const tabVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

const initialCourseForm: Course = {
  id: '',
  title: '',
  description: '',
  duration: '',
  price: 0,
  instructor: '',
  category: '',
};

const AdminPanel: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [products] = useState<Product[]>(initialProducts);
  const [news] = useState<NewsItem[]>(initialNews);
  const [orders] = useState<Order[]>(initialOrders);
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseDialogOpen, setCourseDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [courseForm, setCourseForm] = useState<Course>(initialCourseForm);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ severity: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    getCoursesFromFirestore().then((firestoreCourses) => {
      if (firestoreCourses.length > 0) {
        setCourses(firestoreCourses);
      }
    });

    const unsubscribe = subscribeToCourses((updatedCourses) => {
      setCourses(updatedCourses);
    });

    return () => unsubscribe();
  }, []);

  const formatPrice = (price: number) => new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }).format(price);

  if (user?.role !== 'admin') {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h4" color="error">Access Denied</Typography>
        <Typography color="text.secondary">You must be an admin to view this page.</Typography>
      </Container>
    );
  }

  const handleOpenCourseDialog = (course?: Course) => {
    if (course) {
      setEditingCourse(course);
      setCourseForm(course);
    } else {
      setEditingCourse(null);
      setCourseForm(initialCourseForm);
    }
    setAlert(null);
    setCourseDialogOpen(true);
  };

  const handleSaveCourse = async () => {
    if (!courseForm.title.trim()) {
      setAlert({ severity: 'error', message: 'Please enter a course title' });
      return;
    }
    
    setSaving(true);
    setAlert(null);
    
    try {
      // Generate unique ID
      const timestamp = Date.now();
      const slug = courseForm.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const courseId = editingCourse?.id || courseForm.id || `${slug}-${timestamp}`;
      
      const course: Course = {
        ...courseForm,
        id: courseId,
      };
      
      console.log('[AdminPanel] Saving course:', course);
      
      const success = await saveCourseToFirestore(course);
      
      if (success) {
        setAlert({ severity: 'success', message: editingCourse ? 'Course updated!' : 'Course created!' });
        setTimeout(() => {
          setCourseDialogOpen(false);
          setAlert(null);
        }, 1000);
      } else {
        setAlert({ severity: 'error', message: 'Failed to save course. Check console for details.' });
      }
    } catch (error) {
      console.error('[AdminPanel] Error saving course:', error);
      setAlert({ severity: 'error', message: 'Error saving course: ' + (error instanceof Error ? error.message : 'Unknown error') });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (window.confirm('Delete this course?')) {
      try {
        await deleteCourseFromFirestore(id);
        setAlert({ severity: 'success', message: 'Course deleted!' });
      } catch (error) {
        setAlert({ severity: 'error', message: 'Failed to delete course' });
      }
    }
  };

  return (
    <Box>
      <Box sx={{ py: 6, background: 'linear-gradient(135deg, rgba(100, 255, 218, 0.05) 0%, rgba(100, 181, 246, 0.02) 100%)', borderBottom: '1px solid rgba(100, 255, 218, 0.1)' }}>
        <Container maxWidth="lg">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Typography variant="h1" sx={{ mb: 1 }}>Admin Dashboard</Typography>
            <Typography variant="body1" color="text.secondary">Welcome Admin, manage your business from here.</Typography>
          </motion.div>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[
            { icon: <Inventory />, label: 'Products', value: products.length, color: '#64FFDA' },
            { icon: <School />, label: 'Courses', value: courses.length, color: '#AB47BC' },
            { icon: <Article />, label: 'Active News', value: news.filter(n => n.active).length, color: '#64B5F6' },
            { icon: <LocalShipping />, label: 'Pending Orders', value: orders.filter(o => o.status === 'Pending').length, color: '#FFB74D' },
            { icon: <TrendingUp />, label: 'Revenue', value: formatPrice(orders.reduce((acc, o) => acc + o.total, 0)), color: '#81C784' },
          ].map((stat, i) => (
            <Grid size={{ xs: 6, md: 2.4 }} key={i}>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card sx={{ background: 'rgba(17, 34, 64, 0.5)', border: '1px solid rgba(100, 255, 218, 0.1)' }}>
                  <CardContent sx={{ textAlign: 'center', py: 3 }}>
                    <Avatar sx={{ bgcolor: `${stat.color}20`, color: stat.color, width: 56, height: 56, mx: 'auto', mb: 2 }}>{stat.icon}</Avatar>
                    <Typography variant="h4" sx={{ color: 'text.primary', fontWeight: 700 }}>{stat.value}</Typography>
                    <Typography variant="body2" color="text.secondary">{stat.label}</Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        <Paper sx={{ background: 'rgba(17, 34, 64, 0.5)', border: '1px solid rgba(100, 255, 218, 0.1)' }}>
          <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ borderBottom: '1px solid rgba(100, 255, 218, 0.1)', '& .MuiTab-root': { color: 'text.secondary' }, '& .Mui-selected': { color: 'primary.main' }, '& .MuiTabs-indicator': { backgroundColor: 'primary.main' } }}>
            <Tab icon={<Inventory />} iconPosition="start" label="Inventory" />
            <Tab icon={<School />} iconPosition="start" label="Courses" />
            <Tab icon={<Article />} iconPosition="start" label="News Manager" />
            <Tab icon={<LocalShipping />} iconPosition="start" label="Order Tracker" />
          </Tabs>

          <Box sx={{ p: 3 }}>
            <AnimatePresence mode="wait">
              {activeTab === 0 && (
                <motion.div key="inventory" variants={tabVariants} initial="hidden" animate="visible" exit="exit">
                  <Typography variant="h5" sx={{ mb: 2 }}>Product Inventory</Typography>
                  <Typography color="text.secondary">Manage your products here.</Typography>
                </motion.div>
              )}

              {activeTab === 1 && (
                <motion.div key="courses" variants={tabVariants} initial="hidden" animate="visible" exit="exit">
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h5">Course Management</Typography>
                    <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenCourseDialog()}>Add Course</Button>
                  </Box>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Title</TableCell>
                          <TableCell>Category</TableCell>
                          <TableCell>Instructor</TableCell>
                          <TableCell>Duration</TableCell>
                          <TableCell>Price</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {courses.map((course) => (
                          <TableRow key={course.id} hover>
                            <TableCell>
                              <Typography variant="body2" fontWeight={600}>{course.title}</Typography>
                            </TableCell>
                            <TableCell><Chip label={course.category} size="small" /></TableCell>
                            <TableCell>{course.instructor}</TableCell>
                            <TableCell>{course.duration}</TableCell>
                            <TableCell>{course.free ? 'Free' : formatPrice(course.price)}</TableCell>
                            <TableCell><Chip label={course.free ? 'Free' : 'Paid'} size="small" color={course.free ? 'success' : 'primary'} /></TableCell>
                            <TableCell align="right">
                              <IconButton onClick={() => handleOpenCourseDialog(course)} color="primary"><Edit /></IconButton>
                              <IconButton onClick={() => handleDeleteCourse(course.id)} color="error"><Delete /></IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                        {courses.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                              <Typography color="text.secondary">No courses yet. Click "Add Course" to create one.</Typography>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </motion.div>
              )}

              {activeTab === 2 && (
                <motion.div key="news" variants={tabVariants} initial="hidden" animate="visible" exit="exit">
                  <Typography variant="h5" sx={{ mb: 2 }}>News Manager</Typography>
                  <Typography color="text.secondary">Manage your news here.</Typography>
                </motion.div>
              )}

              {activeTab === 3 && (
                <motion.div key="orders" variants={tabVariants} initial="hidden" animate="visible" exit="exit">
                  <Typography variant="h5" sx={{ mb: 2 }}>Order Tracker</Typography>
                  <Typography color="text.secondary">Track your orders here.</Typography>
                </motion.div>
              )}
            </AnimatePresence>
          </Box>
        </Paper>
      </Container>

      {/* Course Dialog */}
      <Dialog open={courseDialogOpen} onClose={() => setCourseDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingCourse ? 'Edit Course' : 'Add New Course'}</DialogTitle>
        <DialogContent>
          {alert && (
            <Alert severity={alert.severity} sx={{ mb: 2 }}>
              {alert.message}
            </Alert>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField label="Course Title" value={courseForm.title} onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })} fullWidth required />
            <TextField label="Description" value={courseForm.description} onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })} fullWidth multiline rows={2} />
            <TextField label="Instructor" value={courseForm.instructor} onChange={(e) => setCourseForm({ ...courseForm, instructor: e.target.value })} fullWidth />
            <TextField label="Duration (e.g., 4 weeks)" value={courseForm.duration} onChange={(e) => setCourseForm({ ...courseForm, duration: e.target.value })} fullWidth />
            <TextField label="Price (KES)" type="number" value={courseForm.price} onChange={(e) => setCourseForm({ ...courseForm, price: Number(e.target.value) })} fullWidth />
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select value={courseForm.category} label="Category" onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}>
                <MenuItem value="Solar">Solar</MenuItem>
                <MenuItem value="Electrical">Electrical</MenuItem>
                <MenuItem value="Installation">Installation</MenuItem>
                <MenuItem value="Maintenance">Maintenance</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Switch checked={Boolean(courseForm.free)} onChange={(e) => setCourseForm({ ...courseForm, free: e.target.checked })} />
              <Typography>Free Course</Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCourseDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveCourse}>{editingCourse ? 'Update' : 'Create'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminPanel;
