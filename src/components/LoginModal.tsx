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
} from '@mui/material';
import {
  Close,
  Visibility,
  VisibilityOff,
  ElectricBolt,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  onLoginSuccess?: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ open, onClose, onLoginSuccess }) => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (login(username, password)) {
      onLoginSuccess?.();
      handleClose();
    } else {
      setError('Invalid credentials. Please try again.');
    }
    setLoading(false);
  };

  const handleClose = () => {
    setUsername('');
    setPassword('');
    setError('');
    setLoading(false);
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
                Welcome Back
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

            <Box
              sx={{
                p: 2,
                mb: 2,
                borderRadius: 2,
                backgroundColor: 'rgba(100, 255, 218, 0.05)',
                border: '1px solid rgba(100, 255, 218, 0.1)',
              }}
            >
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Demo Credentials:
              </Typography>
              <Typography variant="body2" sx={{ color: 'primary.main' }}>
                Admin: admin / 123
              </Typography>
            </Box>

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                margin="normal"
                required
                autoFocus
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'rgba(100, 255, 218, 0.2)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(100, 255, 218, 0.4)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#64FFDA',
                    },
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
                    '& fieldset': {
                      borderColor: 'rgba(100, 255, 218, 0.2)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(100, 255, 218, 0.4)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#64FFDA',
                    },
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
                  'Sign In'
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
              Don't have an account?{' '}
              <Typography
                component="span"
                variant="body2"
                sx={{ color: 'primary.main', cursor: 'pointer' }}
                onClick={() => {
                  // For demo, create account with entered credentials
                  if (username && password) {
                    login(username, password);
                    handleClose();
                  }
                }}
              >
                Sign up
              </Typography>
            </Typography>
          </DialogActions>
        </Dialog>
      )}
    </AnimatePresence>
  );
};

export default LoginModal;
