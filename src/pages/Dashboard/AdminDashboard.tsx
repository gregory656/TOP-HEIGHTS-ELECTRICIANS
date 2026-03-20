import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Stack,
  Switch,
  TextField,
  Typography,
  FormControlLabel,
  Alert,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Edit, Delete, Add, School, People, TrendingUp } from '@mui/icons-material';
import { Course } from '../../utils/courseStorage';
import { useAuth } from '../../hooks/useAuth';
import {
  saveCourseToFirestore,
  deleteCourseFromFirestore,
  subscribeToCourses,
  subscribeToEnrollments,
  StudentEnrollment,
} from '../../services/courseService';

const initialFormState: Course = {
  id: '',
  title: '',
  description: '',
  duration: '',
  price: 0,
  instructor: '',
  category: '',
};

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<StudentEnrollment[]>([]);
  const [formState, setFormState] = useState<Course>(initialFormState);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [alert, setAlert] = useState<{ severity: 'success' | 'error'; message: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'courses' | 'students' | 'stats'>('courses');

  // Subscribe to courses from Firestore
  useEffect(() => {
    const unsubscribe = subscribeToCourses((updatedCourses) => {
      setCourses(updatedCourses);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Subscribe to enrollments from Firestore
  useEffect(() => {
    const unsubscribe = subscribeToEnrollments((updatedEnrollments) => {
      setEnrollments(updatedEnrollments);
    });

    return () => unsubscribe();
  }, []);

  // Get unique categories from courses
  const categories = [...new Set(courses.map(c => c.category))];

  // Stats calculations
  const stats = {
    totalCourses: courses.length,
    freeCourses: courses.filter(c => c.free).length,
    paidCourses: courses.filter(c => !c.free).length,
    totalStudents: enrollments.length,
    activeStudents: enrollments.filter(e => !e.completed).length,
    completedStudents: enrollments.filter(e => e.completed).length,
  };

  const resetForm = () => {
    setFormState(initialFormState);
    setEditingId(null);
    setAlert(null);
  };

  const handleOpenDialog = (course?: Course) => {
    if (course) {
      setFormState(course);
      setEditingId(course.id);
    } else {
      resetForm();
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    resetForm();
  };

  const handleSaveCourse = async () => {
    if (!formState.title.trim()) {
      setAlert({ severity: 'error', message: 'Title is required.' });
      return;
    }

    const course: Course = {
      ...formState,
      id: editingId || formState.id || formState.title.toLowerCase().replace(/\s+/g, '-'),
    };

    const success = await saveCourseToFirestore(course);
    
    if (success) {
      setAlert({ severity: 'success', message: editingId ? 'Course updated!' : 'Course created!' });
      setTimeout(() => {
        handleCloseDialog();
      }, 1000);
    } else {
      setAlert({ severity: 'error', message: 'Failed to save course.' });
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      const success = await deleteCourseFromFirestore(id);
      if (success) {
        setAlert({ severity: 'success', message: 'Course deleted!' });
      } else {
        setAlert({ severity: 'error', message: 'Failed to delete course.' });
      }
    }
  };

  const studentColumns: GridColDef[] = [
    { field: 'username', headerName: 'Student Name', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1 },
    { field: 'courseId', headerName: 'Course', flex: 1 },
    { field: 'progress', headerName: 'Progress %', width: 100 },
    { 
      field: 'completed', 
      headerName: 'Status', 
      width: 120,
      renderCell: (params) => (
        <Chip 
          label={params.value ? 'Completed' : 'In Progress'} 
          color={params.value ? 'success' : 'primary'} 
          size="small" 
        />
      )
    },
    { field: 'enrolledAt', headerName: 'Enrolled Date', flex: 1 },
  ];

  const studentRows = enrollments.map((enrollment, index) => {
    const course = courses.find(c => c.id === enrollment.courseId);
    return {
      id: index,
      username: enrollment.username,
      email: enrollment.email,
      courseId: course?.title || enrollment.courseId,
      progress: `${enrollment.progress}%`,
      completed: enrollment.completed,
      enrolledAt: new Date(enrollment.enrolledAt).toLocaleDateString(),
    };
  });

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress color="primary" />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Loading dashboards...
        </Typography>
      </Container>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">
          Access denied. Admin privileges required.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 6 }}>
      <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
        Admin Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Manage your courses, students, and track progress.
      </Typography>

      {/* Stats Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)', md: 'repeat(6, 1fr)' }, gap: 2, mb: 4 }}>
        <Card sx={{ background: 'rgba(17, 34, 64, 0.65)' }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={1}>
              <School color="primary" />
              <Box>
                <Typography variant="h5">{stats.totalCourses}</Typography>
                <Typography variant="caption" color="text.secondary">Total Courses</Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
        <Card sx={{ background: 'rgba(17, 34, 64, 0.65)' }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={1}>
              <People color="primary" />
              <Box>
                <Typography variant="h5">{stats.totalStudents}</Typography>
                <Typography variant="caption" color="text.secondary">Enrollments</Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
        <Card sx={{ background: 'rgba(17, 34, 64, 0.65)' }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={1}>
              <TrendingUp color="success" />
              <Box>
                <Typography variant="h5">{stats.activeStudents}</Typography>
                <Typography variant="caption" color="text.secondary">Active</Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
        <Card sx={{ background: 'rgba(17, 34, 64, 0.65)' }}>
          <CardContent>
            <Typography variant="h5" color="success">{stats.freeCourses}</Typography>
            <Typography variant="caption" color="text.secondary">Free Courses</Typography>
          </CardContent>
        </Card>
        <Card sx={{ background: 'rgba(17, 34, 64, 0.65)' }}>
          <CardContent>
            <Typography variant="h5" color="primary">{stats.paidCourses}</Typography>
            <Typography variant="caption" color="text.secondary">Paid Courses</Typography>
          </CardContent>
        </Card>
        <Card sx={{ background: 'rgba(17, 34, 64, 0.65)' }}>
          <CardContent>
            <Typography variant="h5" color="info">{stats.completedStudents}</Typography>
            <Typography variant="caption" color="text.secondary">Completed</Typography>
          </CardContent>
        </Card>
      </Box>

      <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {categories.map((category) => (
          <Chip key={category} label={category} size="small" variant="outlined" />
        ))}
      </Box>

      {/* Tabs */}
      <Box sx={{ mb: 3, display: 'flex', gap: 1 }}>
        <Button 
          variant={activeTab === 'courses' ? 'contained' : 'outlined'} 
          onClick={() => setActiveTab('courses')}
          startIcon={<School />}
        >
          Courses
        </Button>
        <Button 
          variant={activeTab === 'students' ? 'contained' : 'outlined'} 
          onClick={() => setActiveTab('students')}
          startIcon={<People />}
        >
          Students
        </Button>
      </Box>

      {alert && (
        <Alert severity={alert.severity} sx={{ mb: 2 }} onClose={() => setAlert(null)}>
          {alert.message}
        </Alert>
      )}

      {/* Courses Tab */}
      {activeTab === 'courses' && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button 
              variant="contained" 
              startIcon={<Add />}
              onClick={() => handleOpenDialog()}
            >
              Add Course
            </Button>
          </Box>

          <TableContainer component={Paper} sx={{ background: 'rgba(17, 34, 64, 0.65)' }}>
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
                  <TableRow key={course.id}>
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {course.title}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={course.category} size="small" />
                    </TableCell>
                    <TableCell>{course.instructor}</TableCell>
                    <TableCell>{course.duration}</TableCell>
                    <TableCell>
                      {course.free ? 'Free' : `KES ${course.price.toLocaleString()}`}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={course.free ? 'Free' : 'Paid'} 
                        color={course.free ? 'success' : 'primary'} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => handleOpenDialog(course)}>
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDeleteCourse(course.id)}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {courses.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">
                        No courses yet. Click "Add Course" to create one.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Students Tab */}
      {activeTab === 'students' && (
        <Card sx={{ background: 'rgba(17, 34, 64, 0.65)', minHeight: 400 }}>
          <CardContent>
            <Typography variant="h5" sx={{ mb: 2 }}>
              Student Enrollments
            </Typography>
            <DataGrid
              rows={studentRows}
              columns={studentColumns}
              autoHeight
              initialState={{
                pagination: { paginationModel: { pageSize: 10 } },
              }}
              pageSizeOptions={[5, 10, 25]}
              sx={{
                background: 'transparent',
                border: 'none',
                '& .MuiDataGrid-cell': {
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                },
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* Course Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingId ? 'Edit Course' : 'Add New Course'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Course Title"
              value={formState.title}
              onChange={(e) => setFormState({ ...formState, title: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Description"
              value={formState.description}
              onChange={(e) => setFormState({ ...formState, description: e.target.value })}
              fullWidth
              multiline
              rows={3}
            />
            <TextField
              label="Instructor"
              value={formState.instructor}
              onChange={(e) => setFormState({ ...formState, instructor: e.target.value })}
              fullWidth
            />
            <TextField
              label="Duration (e.g., 4 weeks)"
              value={formState.duration}
              onChange={(e) => setFormState({ ...formState, duration: e.target.value })}
              fullWidth
            />
            <TextField
              label="Price (KES)"
              type="number"
              value={formState.price}
              onChange={(e) => setFormState({ ...formState, price: Number(e.target.value) })}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={formState.category}
                label="Category"
                onChange={(e) => setFormState({ ...formState, category: e.target.value })}
              >
                <MenuItem value="Solar">Solar</MenuItem>
                <MenuItem value="Electrical">Electrical</MenuItem>
                <MenuItem value="Installation">Installation</MenuItem>
                <MenuItem value="Maintenance">Maintenance</MenuItem>
                <MenuItem value="Safety">Safety</MenuItem>
              </Select>
            </FormControl>
            <FormControlLabel
              control={
                <Switch
                  checked={Boolean(formState.free)}
                  onChange={(e) => setFormState({ ...formState, free: e.target.checked })}
                />
              }
              label="Free Course"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveCourse}>
            {editingId ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDashboard;
