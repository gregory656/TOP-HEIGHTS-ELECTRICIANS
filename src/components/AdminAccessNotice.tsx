import { Box, Button, CircularProgress, Container, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function AdminAccessNotice() {
  const { user, authLoading, setLoginModalOpen } = useAuth();
  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      {authLoading ? (
        <Box role="status" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <CircularProgress size={24} /><Typography>Checking your account…</Typography>
        </Box>
      ) : (
        <>
          <Typography component="h1" variant="h4" sx={{ mb: 2 }}>
            {user ? 'Admin access required' : 'Sign in to your admin account'}
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            {user ? 'This account has not been granted administrator access. Please contact the site owner.'
              : 'Use your existing account to access the business and learning dashboards.'}
          </Typography>
          {!user && <Button variant="contained" onClick={() => setLoginModalOpen(true)} sx={{ mr: 2 }}>Sign In</Button>}
          <Button component={Link} to="/shop" variant="outlined">Back to shop</Button>
        </>
      )}
    </Container>
  );
}
