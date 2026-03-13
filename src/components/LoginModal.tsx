// src/components/LoginModal.tsx
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  IconButton,
  InputAdornment,
  Alert,
  CircularProgress,
  Divider,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Close,
  Visibility,
  VisibilityOff,
  ElectricBolt,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  onLoginSuccess?: (username: string, password: string) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ open, onClose, onLoginSuccess }) => {
  const { login, loginWithGoogle, signup } = useAuth();
  const [tab, setTab] = useState(0);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (tab === 0 && !username.trim()) {
        setError('Please enter your username.');
        setLoading(false);
        return;
      }
      let success = false;
      if (tab === 0) {
        // Login
        success = await login(email, password);
        if (!success) {
          setError('Invalid email or password. Please try again.');
        }
      } else {
        // Signup
        if (!name.trim()) {
          setError('Please enter your name');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters');
          setLoading(false);
          return;
        }
        success = await signup(email, password, name);
        if (!success) {
          setError('Failed to create account. Email may already be in use or invalid.');
        }
      }

      if (success) {
        onLoginSuccess?.(username, password);
        handleClose();
      }
    } catch (err) {
      console.error('Form submission error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    
    try {
      const success = await loginWithGoogle();
      if (success) {
        onLoginSuccess?.('', '');
        handleClose();
      } else {
        setError('Failed to sign in with Google');
      }
    } catch (err) {
      if (err && typeof err === 'object' && 'code' in err && err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in was cancelled');
      } else {
        setError('Failed to sign in with Google');
      }
    }
    setLoading(false);
  };

  const handleClose = () => {
    setUsername('');
    setEmail('');
    setPassword('');
    setName('');
    setError('');
    setLoading(false);
    setTab(0);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <Dialog
          open={open}
          onClose={handleClose}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            component: motion.div,
            initial: { opacity: 0, scale: 0.9, y: 20 },
            animate: { opacity: 1, scale: 1, y: 0 },
            exit: { opacity: 0, scale: 0.9, y: 20 },
            transition: { duration: 0.3 },
          }}
        >
          <DialogTitle
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'linear-gradient(135deg, rgba(100, 255, 218, 0.05) 0%, rgba(100, 181, 246, 0.02) 100%)',
              borderBottom: '1px solid rgba(100, 255, 218, 0.1)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ElectricBolt sx={{ color: 'primary.main' }} />
              <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 600 }}>
                Welcome to Top Heights
              </Typography>
            </Box>
            <IconButton
              onClick={handleClose}
              sx={{
                color: 'text.secondary',
                '&:hover': { color: 'primary.main' },
              }}
            >
              <Close />
            </IconButton>
          </DialogTitle>

          <DialogContent sx={{ pt: 3 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {/* Google Login Button */}
            <Button
              fullWidth
              variant="outlined"
              size="large"
              onClick={handleGoogleLogin}
              disabled={loading}
              sx={{
                mb: 2,
                py: 1.5,
                borderColor: 'rgba(100, 255, 218, 0.3)',
                color: 'text.primary',
                '&:hover': {
                  borderColor: 'primary.main',
                  backgroundColor: 'rgba(100, 255, 218, 0.05)',
                },
              }}
            >
              <Box component="img"
                src="https://www.google.com/favicon.ico"
                sx={{ width: 20, height: 20, mr: 1 }}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              Continue with Google
            </Button>

            <Divider sx={{ my: 2 }}>
              <Typography variant="body2" color="text.secondary">
                OR
              </Typography>
            </Divider>

            {/* Tab Selection */}
            <Tabs
              value={tab}
              onChange={(_, v) => setTab(v)}
              variant="fullWidth"
              sx={{
                mb: 2,
                '& .MuiTab-root': {
                  color: 'text.secondary',
                },
                '& .Mui-selected': {
                  color: 'primary.main',
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: 'primary.main',
                },
              }}
            >
              <Tab label="Sign In" />
              <Tab label="Sign Up" />
            </Tabs>

            <form onSubmit={handleSubmit}>
      {tab === 0 && (
        <TextField
          fullWidth
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          margin="normal"
          required
          sx={{
            '& .MuiOutlinedInput-root': {
              '& fieldset': { borderColor: 'rgba(100, 255, 218, 0.2)' },
              '&:hover fieldset': { borderColor: 'rgba(100, 255, 218, 0.4)' },
              '&.Mui-focused fieldset': { borderColor: '#64FFDA' },
            },
          }}
        />
      )}
      {tab === 1 && (
        <TextField
          fullWidth
          label="Full Name"
          value={name}
                  onChange={(e) => setName(e.target.value)}
                  margin="normal"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: 'rgba(100, 255, 218, 0.2)' },
                      '&:hover fieldset': { borderColor: 'rgba(100, 255, 218, 0.4)' },
                      '&.Mui-focused fieldset': { borderColor: '#64FFDA' },
                    },
                  }}
                />
              )}

              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                margin="normal"
                required
                autoFocus
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'rgba(100, 255, 218, 0.2)' },
                    '&:hover fieldset': { borderColor: 'rgba(100, 255, 218, 0.4)' },
                    '&.Mui-focused fieldset': { borderColor: '#64FFDA' },
                  },
                }}
              />

              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                margin="normal"
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{ color: 'text.secondary' }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'rgba(100, 255, 218, 0.2)' },
                    '&:hover fieldset': { borderColor: 'rgba(100, 255, 218, 0.4)' },
                    '&.Mui-focused fieldset': { borderColor: '#64FFDA' },
                  },
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  mt: 3,
                  py: 1.5,
                }}
              >
                {loading ? (
                  <CircularProgress size={24} sx={{ color: '#0A192F' }} />
                ) : (
                  tab === 0 ? 'Sign In' : 'Create Account'
                )}
              </Button>
            </form>
          </DialogContent>

          <DialogActions
            sx={{
              justifyContent: 'center',
              pb: 3,
              background: 'rgba(100, 255, 218, 0.02)',
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {tab === 0 ? "Don't have an account? " : "Already have an account? "}
              <Typography
                component="span"
                variant="body2"
                sx={{ color: 'primary.main', cursor: 'pointer' }}
                onClick={() => setTab(tab === 0 ? 1 : 0)}
              >
                {tab === 0 ? 'Sign Up' : 'Sign In'}
              </Typography>
            </Typography>
          </DialogActions>
        </Dialog>
      )}
    </AnimatePresence>
  );
};

export default LoginModal;
