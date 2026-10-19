// Used only by the separate client-preview build. Never authenticates a real account.
import { useEffect, useState, type ReactNode } from 'react';
import { Box, Button, ButtonGroup, GlobalStyles, Typography } from '@mui/material';
import { AuthContext, type User, type UserRole } from '../context/AuthContextData';
import { setStoredUsername } from '../utils/courseStorage';

export { AuthContext };

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const selectRole = (role: UserRole | null) => {
    const name = role === 'admin' ? 'Demo Admin' : 'Demo Customer';
    setUser(role ? { uid: `preview-${role}`, name, email: `${role}@example.test`, role } : null);
    setStoredUsername(role ? name : '');
    setLoginModalOpen(false);
  };

  useEffect(() => {
    const originalOpen = window.open;
    window.open = () => { window.alert('Client preview: external enquiries and payments are disabled.'); return null; };
    const blockContact = (event: MouseEvent) => {
      const anchor = event.target instanceof Element ? event.target.closest('a') : null;
      if (anchor && /^(https?:\/\/(wa\.me|api\.whatsapp\.com)|mailto:|tel:)/i.test(anchor.href)) {
        event.preventDefault();
        window.alert('Client preview: contact actions are disabled.');
      }
    };
    document.addEventListener('click', blockContact, true);
    return () => { window.open = originalOpen; document.removeEventListener('click', blockContact, true); };
  }, []);

  return <AuthContext.Provider value={{
    user, firebaseUser: null, isAuthenticated: !!user, isLoading: false, authLoading: false,
    loginModalOpen, setLoginModalOpen,
    login: async () => { selectRole('customer'); return true; },
    loginWithGoogle: async () => { selectRole('customer'); return true; },
    signup: async () => { selectRole('admin'); return true; },
    logout: async () => { selectRole(null); },
  }}>
    <GlobalStyles styles={{ body: { paddingBottom: 105 } }} />
    {children}
    <Box component="aside" aria-label="Client preview controls" sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1100,
      bgcolor: '#FFFFFF', borderTop: '2px solid #0E7A3D', px: 2, py: 1, display: 'flex', gap: 1.5, alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
      <Typography variant="body2"><strong>Client preview</strong> · Demo data · Payments disabled</Typography>
      <ButtonGroup size="small" aria-label="Preview as">
        {([{ label: 'Visitor', role: null }, { label: 'Customer', role: 'customer' }, { label: 'Admin', role: 'admin' }] as const).map((item) =>
          <Button key={item.label} aria-pressed={(user?.role ?? null) === item.role} variant={(user?.role ?? null) === item.role ? 'contained' : 'outlined'} onClick={() => selectRole(item.role)}>{item.label}</Button>)}
      </ButtonGroup>
    </Box>
  </AuthContext.Provider>;
}
