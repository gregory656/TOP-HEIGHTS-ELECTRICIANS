import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { useAuth } from '../hooks/useAuth';

export default function PreviewLoginModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { login, signup } = useAuth();
  return <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
    <DialogTitle>Explore the client preview</DialogTitle>
    <DialogContent><Typography>Select a demo account to review the interface. No email, password or real account is needed.</Typography></DialogContent>
    <DialogActions sx={{ flexWrap: 'wrap', gap: 1, p: 2 }}>
      <Button onClick={onClose}>Cancel</Button>
      <Button onClick={() => { void login('', ''); }} variant="outlined">Demo customer</Button>
      <Button onClick={() => { void signup('', '', ''); }} variant="contained">Demo admin</Button>
    </DialogActions>
  </Dialog>;
}
