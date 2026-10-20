// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import AdminPanel from './pages/AdminPanel';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
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
import Blog from './pages/Blog';
import Privacy from './pages/Privacy';

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
                <Route path="shop/:id" element={<ProductDetails />} />
                <Route path="admin" element={<AdminPanel />} />
                <Route path="about" element={<About />} />
                <Route path="privacy" element={<Privacy />} />
                <Route path="profile" element={<Profile />} />
                <Route path="news" element={<Navigate to="/blog" replace />} />
                <Route path="blog" element={<Blog />} />
                <Route path="blog/:slug" element={<Blog />} />
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
