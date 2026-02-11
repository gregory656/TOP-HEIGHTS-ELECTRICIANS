// src/App.tsx
import { ThemeProvider } from '@mui/material/styles';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import theme from './themes/theme';
import Layout from './components/Layout';
import Home from './pages/Home';
import AdminPanel from './pages/AdminPanel';
import Shop from './pages/Shop';
import Services from './pages/Services';
import About from './pages/About';
import Profile from './pages/Profile';
import { AuthProvider } from './context/AuthContext';
// Import placeholder pages for routes that don't have content yet
import { Box, Typography } from '@mui/material';

// Placeholder component
const Placeholder = ({ title }: { title: string }) => (
  <Box>
    <Typography variant="h3">{title}</Typography>
    <Typography>This page is under construction.</Typography>
  </Box>
);


function App() {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="services" element={<Services />} />
              <Route path="shop" element={<Shop />} />
              <Route path="admin" element={<AdminPanel />} />
              <Route path="about" element={<About />} />
              <Route path="profile" element={<Profile />} />
              <Route path="news" element={<Placeholder title="News" />} />
              {/* Add a catch-all route for 404 if desired */}
              <Route path="*" element={<Placeholder title="404 - Not Found" />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;