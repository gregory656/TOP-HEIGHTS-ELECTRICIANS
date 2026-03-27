// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import AdminPanel from './pages/AdminPanel';
import Shop from './pages/Shop';
import Services from './pages/Services';
import About from './pages/About';
import Profile from './pages/Profile';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ErrorBoundary from './components/ErrorBoundary';
import { Box, Typography } from '@mui/material';
import CoursesPage from './pages/Courses/CoursesPage';
import CourseDetails from './pages/Courses/CourseDetails';
import StudentDashboard from './pages/Dashboard/StudentDashboard';
import AdminDashboard from './pages/Dashboard/AdminDashboard';
import NewsPage from './pages/NewsPage';

const Placeholder = ({ title }: { title: string }) => (
  <Box>
    <Typography variant="h3">{title}</Typography>
    <Typography>This page is under construction.</Typography>
  </Box>
);

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <CartProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="services" element={<Services />} />
                <Route path="shop" element={<Shop />} />
                <Route path="admin" element={<AdminPanel />} />
                <Route path="about" element={<About />} />
                <Route path="profile" element={<Profile />} />
                <Route path="news" element={<NewsPage />} />
                <Route path="courses" element={<CoursesPage />} />
                <Route path="courses/:id" element={<CourseDetails />} />
                <Route path="student-dashboard" element={<StudentDashboard />} />
                <Route path="admin-dashboard" element={<AdminDashboard />} />
                {/* Add a catch-all route for 404 if desired */}
                <Route path="*" element={<Placeholder title="404 - Not Found" />} />
              </Route>
            </Routes>
          </Router>
        </CartProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
