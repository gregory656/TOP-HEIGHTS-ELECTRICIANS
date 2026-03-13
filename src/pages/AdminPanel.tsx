// src/pages/AdminPanel.tsx
import { useState, useEffect } from 'react';
import { Box, Container, Typography, Tabs, Tab, Paper, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem, IconButton, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Avatar, Switch, Grid, Card, CardContent, Alert } from '@mui/material';
import { Add, Edit, Delete, Article, LocalShipping, TrendingUp, School } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { Course } from '../utils/courseStorage';
import { getCoursesFromFirestore, saveCourseToFirestore, deleteCourseFromFirestore, subscribeToCourses, getNewsFromFirestore, saveNewsToFirestore, deleteNewsFromFirestore, subscribeToNews, getOrdersFromFirestore, subscribeToOrders, NewsItem, OrderItem } from '../services/courseService';

const initialCourseForm: Course = { id: '', title: '', description: '', duration: '', price: 0, instructor: '', category: '' };
const initialNewsForm: NewsItem = { title: '', content: '', date: new Date().toISOString().split('T')[0], active: true };

const AdminPanel: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [courses, setCourses] = useState<Course[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [courseDialogOpen, setCourseDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [courseForm, setCourseForm] = useState<Course>(initialCourseForm);
  const [newsDialogOpen, setNewsDialogOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  const [newsForm, setNewsForm] = useState<NewsItem>(initialNewsForm);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ severity: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    getCoursesFromFirestore().then(setCourses);
    const unsubCourses = subscribeToCourses(setCourses);
    getNewsFromFirestore().then(setNews);
    const unsubNews = subscribeToNews(setNews);
    getOrdersFromFirestore().then(setOrders);
    const unsubOrders = subscribeToOrders(setOrders);
    return () => { unsubCourses(); unsubNews(); unsubOrders(); };
  }, []);

  const formatPrice = (price: number) => new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }).format(price);

  if (user?.role !== 'admin') {
    return <Container maxWidth="lg" sx={{ py: 8 }}><Typography variant="h4" color="error">Access Denied</Typography></Container>;
  }

  const handleOpenCourseDialog = (course?: Course) => { setEditingCourse(course || null); setCourseForm(course || initialCourseForm); setAlert(null); setCourseDialogOpen(true); };
  const handleSaveCourse = async () => {
    if (!courseForm.title.trim()) { setAlert({ severity: 'error', message: 'Please enter a course title' }); return; }
    setSaving(true); setAlert(null);
    try {
      const timestamp = Date.now();
      const slug = courseForm.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const course: Course = { ...courseForm, id: editingCourse?.id || courseForm.id || `${slug}-${timestamp}` };
      const success = await saveCourseToFirestore(course);
      if (success) { setAlert({ severity: 'success', message: editingCourse ? 'Course updated!' : 'Course created!' }); setTimeout(() => setCourseDialogOpen(false), 1000); }
      else setAlert({ severity: 'error', message: 'Failed to save course' });
    } catch { setAlert({ severity: 'error', message: 'Error saving course' }); }
    finally { setSaving(false); }
  };
  const handleDeleteCourse = async (id: string) => { if (window.confirm('Delete this course?')) await deleteCourseFromFirestore(id); };

  const handleOpenNewsDialog = (n?: NewsItem) => { setEditingNews(n || null); setNewsForm(n || initialNewsForm); setAlert(null); setNewsDialogOpen(true); };
  const handleSaveNews = async () => {
    if (!newsForm.title.trim()) { setAlert({ severity: 'error', message: 'Please enter a news title' }); return; }
    setSaving(true); setAlert(null);
    try {
      const success = await saveNewsToFirestore(newsForm);
      if (success) { setAlert({ severity: 'success', message: editingNews ? 'News updated!' : 'News created!' }); setTimeout(() => setNewsDialogOpen(false), 1000); }
      else setAlert({ severity: 'error', message: 'Failed to save news' });
    } catch { setAlert({ severity: 'error', message: 'Error saving news' }); }
    finally { setSaving(false); }
  };
  const handleDeleteNews = async (id: string) => { if (window.confirm('Delete this news?')) await deleteNewsFromFirestore(id); };

  const stats = { totalCourses: courses.length, activeNews: news.filter(n => n.active).length, totalOrders: orders.length, revenue: orders.reduce((acc, o) => acc + (o.totalAmount || 0), 0) };

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
          {[{ icon: <School />, label: 'Courses', value: stats.totalCourses, color: '#AB47BC' }, { icon: <Article />, label: 'Active News', value: stats.activeNews, color: '#64B5F6' }, { icon: <LocalShipping />, label: 'Orders', value: stats.totalOrders, color: '#FFB74D' }, { icon: <TrendingUp />, label: 'Revenue', value: formatPrice(stats.revenue), color: '#81C784' }].map((stat, i) => (
            <Grid size={{ xs: 6, md: 3 }} key={i}>
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
          <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ borderBottom: '1px solid rgba(100, 255, 218, 0.1)' }}>
            <Tab icon={<School />} iconPosition="start" label="Courses" />
            <Tab icon={<Article />} iconPosition="start" label="News" />
            <Tab icon={<LocalShipping />} iconPosition="start" label="Orders" />
          </Tabs>

          <Box sx={{ p: 3 }}>
            <AnimatePresence mode="wait">
              {activeTab === 0 && (
                <motion.div key="courses" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h5">Course Management</Typography>
                    <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenCourseDialog()}>Add Course</Button>
                  </Box>
                  <TableContainer>
                    <Table>
                      <TableHead><TableRow><TableCell>Title</TableCell><TableCell>Category</TableCell><TableCell>Instructor</TableCell><TableCell>Duration</TableCell><TableCell>Price</TableCell><TableCell>Status</TableCell><TableCell align="right">Actions</TableCell></TableRow></TableHead>
                      <TableBody>
                        {courses.map((course) => (
                          <TableRow key={course.id} hover>
                            <TableCell><Typography fontWeight={600}>{course.title}</Typography></TableCell>
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
                        {courses.length === 0 && <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4 }}>No courses yet.</TableCell></TableRow>}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </motion.div>
              )}

              {activeTab === 1 && (
                <motion.div key="news" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h5">News Management</Typography>
                    <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenNewsDialog()}>Add News</Button>
                  </Box>
                  <TableContainer>
                    <Table>
                      <TableHead><TableRow><TableCell>Title</TableCell><TableCell>Date</TableCell><TableCell>Status</TableCell><TableCell align="right">Actions</TableCell></TableRow></TableHead>
                      <TableBody>
                        {news.map((n) => (
                          <TableRow key={n.id} hover>
                            <TableCell><Typography fontWeight={600}>{n.title}</Typography></TableCell>
                            <TableCell>{n.date}</TableCell>
                            <TableCell><Chip label={n.active ? 'Active' : 'Inactive'} size="small" color={n.active ? 'success' : 'default'} /></TableCell>
                            <TableCell align="right">
                              <IconButton onClick={() => handleOpenNewsDialog(n)} color="primary"><Edit /></IconButton>
                              <IconButton onClick={() => handleDeleteNews(n.id!)} color="error"><Delete /></IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                        {news.length === 0 && <TableRow><TableCell colSpan={4} align="center" sx={{ py: 4 }}>No news yet.</TableCell></TableRow>}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </motion.div>
              )}

              {activeTab === 2 && (
                <motion.div key="orders" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Typography variant="h5" sx={{ mb: 3 }}>Order Management</Typography>
                  <TableContainer>
                    <Table>
                      <TableHead><TableRow><TableCell>Order ID</TableCell><TableCell>Customer</TableCell><TableCell>Total</TableCell><TableCell>Payment</TableCell><TableCell>Status</TableCell><TableCell>Date</TableCell></TableRow></TableHead>
                      <TableBody>
                        {orders.map((order) => (
                          <TableRow key={order.id} hover>
                            <TableCell><Typography fontWeight={600}>{order.orderId || order.id}</Typography></TableCell>
                            <TableCell>{order.customerName || order.customerEmail}</TableCell>
                            <TableCell>{formatPrice(order.totalAmount)}</TableCell>
                            <TableCell><Chip label={order.paymentStatus || 'Pending'} size="small" color={order.paymentStatus === 'paid' ? 'success' : 'warning'} /></TableCell>
                            <TableCell><Chip label={order.orderStatus || 'Pending'} size="small" color={order.orderStatus === 'completed' ? 'success' : 'warning'} /></TableCell>
                            <TableCell>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '-'}</TableCell>
                          </TableRow>
                        ))}
                        {orders.length === 0 && <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4 }}>No orders yet.</TableCell></TableRow>}
                      </TableBody>
                    </Table>
                  </TableContainer>
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
          {alert && <Alert severity={alert.severity} sx={{ mb: 2 }}>{alert.message}</Alert>}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField label="Course Title" value={courseForm.title} onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })} fullWidth required />
            <TextField label="Description" value={courseForm.description} onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })} fullWidth multiline rows={2} />
            <TextField label="Instructor" value={courseForm.instructor} onChange={(e) => setCourseForm({ ...courseForm, instructor: e.target.value })} fullWidth />
            <TextField label="Duration" value={courseForm.duration} onChange={(e) => setCourseForm({ ...courseForm, duration: e.target.value })} fullWidth />
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
          <Button variant="contained" onClick={handleSaveCourse} disabled={saving}>{saving ? 'Saving...' : (editingCourse ? 'Update' : 'Create')}</Button>
        </DialogActions>
      </Dialog>

      {/* News Dialog */}
      <Dialog open={newsDialogOpen} onClose={() => setNewsDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingNews ? 'Edit News' : 'Add News'}</DialogTitle>
        <DialogContent>
          {alert && <Alert severity={alert.severity} sx={{ mb: 2 }}>{alert.message}</Alert>}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField label="Title" value={newsForm.title} onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })} fullWidth required />
            <TextField label="Content" value={newsForm.content} onChange={(e) => setNewsForm({ ...newsForm, content: e.target.value })} fullWidth multiline rows={3} />
            <TextField label="Date" type="date" value={newsForm.date} onChange={(e) => setNewsForm({ ...newsForm, date: e.target.value })} fullWidth InputLabelProps={{ shrink: true }} />
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Switch checked={Boolean(newsForm.active)} onChange={(e) => setNewsForm({ ...newsForm, active: e.target.checked })} />
              <Typography>Active</Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewsDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveNews} disabled={saving}>{saving ? 'Saving...' : (editingNews ? 'Update' : 'Create')}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminPanel;
