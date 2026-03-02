// src/components/LoginRequiredDialog.tsx
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
} from '@mui/material';
import {
  Close,
  WhatsApp,
} from '@mui/icons-material';

interface LoginRequiredDialogProps {
  open: boolean;
  onClose: () => void;
  onLogin: () => void;
  onSignup: () => void;
  onWhatsApp: () => void;
}

const LoginRequiredDialog: React.FC<LoginRequiredDialogProps> = ({
  open,
  onClose,
  onLogin,
  onSignup,
  onWhatsApp,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: '#112240',
          border: '1px solid rgba(100, 255, 218, 0.2)',
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 1,
      }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Login Required
        </Typography>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <Typography variant="body1" color="text.secondary">
            You need to be logged in to add items to cart.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Please login or sign up to continue, or order via WhatsApp as a guest.
          </Typography>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ flexDirection: 'column', gap: 1, px: 3, pb: 3 }}>
        <Button
          fullWidth
          variant="contained"
          onClick={onLogin}
          sx={{
            py: 1.5,
            backgroundColor: 'primary.main',
            fontWeight: 600,
            '&:hover': {
              backgroundColor: 'primary.dark',
            },
          }}
        >
          Login
        </Button>
        
        <Button
          fullWidth
          variant="outlined"
          onClick={onSignup}
          sx={{
            py: 1.5,
            borderColor: 'primary.main',
            color: 'primary.main',
            fontWeight: 600,
            '&:hover': {
              borderColor: 'primary.dark',
              backgroundColor: 'rgba(100, 255, 218, 0.05)',
            },
          }}
        >
          Sign Up
        </Button>
        
        <Button
          fullWidth
          variant="contained"
          onClick={onWhatsApp}
          startIcon={<WhatsApp />}
          sx={{
            py: 1.5,
            backgroundColor: '#25D366',
            color: 'white',
            fontWeight: 600,
            mt: 1,
            '&:hover': {
              backgroundColor: '#20BD5A',
            },
          }}
        >
          Continue with WhatsApp
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LoginRequiredDialog;
