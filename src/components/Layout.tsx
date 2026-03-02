// src/components/Layout.tsx
import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CssBaseline,
  IconButton,
  Box,
  InputBase,
  useTheme,
  useMediaQuery,
  Divider,
  Avatar,
  Button,
  Menu,
  MenuItem,
  Chip,
  Badge,
  CircularProgress,
  Backdrop,
} from '@mui/material';
import {
  Home,
  Build,
  ShoppingCart,
  Info,
  Article,
  AdminPanelSettings,
  Menu as MenuIcon,
  Search as SearchIcon,
  Close,
  Person,
  Logout,
  Dashboard,
  ShoppingCartCheckout,
} from '@mui/icons-material';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { styled, alpha } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import LoginModal from './LoginModal';
import CheckoutSidebar from './CheckoutSidebar';
import logoImage from '../assets/topeheights.jpeg';
import { subscribeToCart } from '../services/cartService';

const drawerWidth = 280;

const navItems = [
  { text: 'Home', icon: <Home />, path: '/' },
  { text: 'Services', icon: <Build />, path: '/services' },
  { text: 'Shop', icon: <ShoppingCart />, path: '/shop' },
  { text: 'About', icon: <Info />, path: '/about' },
  { text: 'News', icon: <Article />, path: '/news' },
  { text: 'Admin', icon: <AdminPanelSettings />, path: '/admin', adminOnly: true },
];

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.08),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.12),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.palette.primary.main,
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '18ch',
    },
  },
}));

const LogoContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
});

const NavItem = styled(ListItem)<{ active?: string }>(({ theme, active }) => ({
  margin: '4px 12px',
  borderRadius: 12,
  transition: 'all 0.3s ease',
  backgroundColor: active === 'true' ? 'rgba(100, 255, 218, 0.1)' : 'transparent',
  border: active === 'true' ? '1px solid rgba(100, 255, 218, 0.2)' : '1px solid transparent',
  '&:hover': {
    backgroundColor: 'rgba(100, 255, 218, 0.08)',
    transform: 'translateX(4px)',
  },
  '& .MuiListItemIcon-root': {
    color: active === 'true' ? theme.palette.primary.main : theme.palette.text.secondary,
    minWidth: 40,
  },
  '& .MuiListItemText-primary': {
    color: active === 'true' ? theme.palette.primary.main : theme.palette.text.primary,
    fontWeight: active === 'true' ? 600 : 400,
  },
}));

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const { user, logout, isAuthenticated, loginModalOpen, setLoginModalOpen, authLoading } = useAuth();

  // Subscribe to cart changes
  useEffect(() => {
    if (!user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCartItemCount(0);
      return;
    }

    const unsubscribe = subscribeToCart(user.uid, (items) => {
      setCartItemCount(items.reduce((total, item) => total + item.quantity, 0));
    });

    return () => unsubscribe();
  }, [user]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavClick = () => {
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleProfileMenuClose();
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{
          p: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <LogoContainer>
          <Avatar
            src={logoImage}
            alt="Top Heights Logo"
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              objectFit: 'cover',
            }}
          />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              Top Heights
            </Typography>
            <Typography variant="caption" sx={{ color: 'primary.main' }}>
              Electricals
            </Typography>
          </Box>
        </LogoContainer>
        {isMobile && (
          <IconButton onClick={handleDrawerToggle} sx={{ color: 'text.primary' }}>
            <Close />
          </IconButton>
        )}
      </Box>
      
      <Divider sx={{ borderColor: 'rgba(100, 255, 218, 0.1)' }} />
      
      <List sx={{ flex: 1, px: 1, py: 2 }}>
        {navItems.map((item) => {
          if (item.adminOnly && user?.role !== 'admin') return null;
          return (
            <NavItem
              // @ts-expect-error - MUI ListItem component prop compatibility
              component={Link}
              to={item.path}
              key={item.text}
              active={location.pathname === item.path ? 'true' : 'false'}
              onClick={handleNavClick}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </NavItem>
          );
        })}
      </List>

      <Divider sx={{ borderColor: 'rgba(100, 255, 218, 0.1)' }} />
      
      <Box sx={{ p: 2 }}>
        <Box
          sx={{
            p: 2,
            borderRadius: 3,
            backgroundColor: 'rgba(100, 255, 218, 0.05)',
            border: '1px solid rgba(100, 255, 218, 0.1)',
          }}
        >
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
            Need help with electrical services?
          </Typography>
          <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 600 }}>
            📞 +254 711 343 412
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      
      {/* Auth Loading Backdrop - prevents flickering during auth state resolution */}
      <Backdrop
        sx={{
          color: '#64FFDA',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: 'rgba(17, 34, 64, 0.9)',
        }}
        open={authLoading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      
      {/* Top AppBar */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <LogoContainer sx={{ display: { xs: 'none', sm: 'flex' } }}>
            <Avatar
              src={logoImage}
              alt="Top Heights Logo"
              sx={{
                width: 36,
                height: 36,
                borderRadius: 2,
                objectFit: 'cover',
              }}
            />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                Top Heights
              </Typography>
              <Typography variant="caption" sx={{ color: 'primary.main' }}>
                Electricals
              </Typography>
            </Box>
          </LogoContainer>

          <Box sx={{ display: { xs: 'flex', sm: 'none' }, alignItems: 'center', gap: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Top Heights
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1 }} />
          
          <Search>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search products..."
              inputProps={{ 'aria-label': 'search' }}
            />
          </Search>
          
          {/* Cart Button */}
          <IconButton
            onClick={() => setCheckoutOpen(true)}
            sx={{ ml: 1, color: 'primary.main' }}
          >
            <Badge badgeContent={cartItemCount} color="secondary">
              <ShoppingCartCheckout />
            </Badge>
          </IconButton>

          {isAuthenticated && user ? (
            <>
              <Chip
                label={`Welcome, ${user.name}`}
                onClick={handleProfileMenuOpen}
                sx={{
                  ml: 1,
                  backgroundColor: 'rgba(100, 255, 218, 0.1)',
                  color: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'rgba(100, 255, 218, 0.2)',
                  },
                }}
              />
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleProfileMenuClose}
                PaperProps={{
                  sx: {
                    backgroundColor: '#112240',
                    border: '1px solid rgba(100, 255, 218, 0.2)',
                    mt: 1,
                  },
                }}
              >
                <MenuItem
                  component={Link}
                  to={user.role === 'admin' ? '/admin' : '/profile'}
                  onClick={handleProfileMenuClose}
                >
                  <ListItemIcon>
                    {user.role === 'admin' ? <Dashboard fontSize="small" /> : <Person fontSize="small" />}
                  </ListItemIcon>
                  {user.role === 'admin' ? 'Dashboard' : 'My Profile'}
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <Logout fontSize="small" />
                  </ListItemIcon>
                  Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Button
              variant="contained"
              size="small"
              onClick={() => setLoginModalOpen(true)}
              sx={{
                ml: 2,
                backgroundColor: 'rgba(100, 255, 218, 0.1)',
                color: 'primary.main',
                '&:hover': {
                  backgroundColor: 'rgba(100, 255, 218, 0.2)',
                },
              }}
            >
              Sign In
            </Button>
          )}
        </Toolbar>
      </AppBar>

      {/* Sidebar Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        {/* Mobile Drawer */}
        <AnimatePresence>
          {isMobile && mobileOpen && (
            <Drawer
              variant="temporary"
              open={mobileOpen}
              onClose={handleDrawerToggle}
              ModalProps={{
                keepMounted: true,
              }}
              sx={{
                display: { xs: 'block', md: 'none' },
                '& .MuiDrawer-paper': {
                  boxSizing: 'border-box',
                  width: drawerWidth,
                  borderRight: 'none',
                },
              }}
              slotProps={{
                paper: {
                  component: motion.div,
                  initial: { x: -drawerWidth, opacity: 0 },
                  animate: { x: 0, opacity: 1 },
                  exit: { x: -drawerWidth, opacity: 0 },
                  transition: { type: 'spring', stiffness: 300, damping: 30 },
                },
              }}
            >
              {drawer}
            </Drawer>
          )}
        </AnimatePresence>

        {/* Desktop Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
        }}
      >
        <Toolbar />
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </Box>
      </Box>

      {/* Login Modal */}
      <LoginModal
        open={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />

      {/* Checkout Sidebar */}
      <CheckoutSidebar
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
      />
    </Box>
  );
}
