import React, { Suspense, lazy, useState } from 'react';
import {
  AppBar,
  Avatar,
  Backdrop,
  Badge,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  InputBase,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  AdminPanelSettings,
  Article,
  Build,
  Close,
  Dashboard,
  Home,
  Info,
  Menu as MenuIcon,
  Person,
  Search as SearchIcon,
  School,
  ShoppingCart,
  ShoppingCartCheckout,
  Logout,
} from '@mui/icons-material';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { styled, alpha } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import LoginModal from './LoginModal';
import CheckoutSidebar from './CheckoutSidebar';
import PremiumSidebar, { NavItem } from './PremiumSidebar';
import logoImage from '../assets/topeheights.jpeg';
import { useCart } from '../context/CartContext';
import {
  clearAdminAccessFlag,
  clearStoredUsername,
  isAdminAccessAllowed,
  setAdminAccessAllowed,
  setStoredUsername,
} from '../utils/courseStorage';
import DanceWordTrail from './ui/DanceWordTrail';
import { heroWordSequence } from '../constants/wordSequences';

const drawerWidth = 280;
const collapsedWidth = 88;

const TopHeightsChatbot = lazy(() => import('./chatbot/TopHeightsChatbot'));

const navItems: NavItem[] = [
  { text: 'Home', icon: <Home />, path: '/' },
  { text: 'Services', icon: <Build />, path: '/services' },
  { text: 'Courses', icon: <School />, path: '/courses' },
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

const Layout: React.FC = () => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, logout, isAuthenticated, loginModalOpen, setLoginModalOpen, authLoading } =
    useAuth();
  const { cartCount } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [adminAccess, setAdminAccess] = useState(isAdminAccessAllowed());

  const filteredNavItems = navItems.filter(
    (item) => !(item.adminOnly && user?.role !== 'admin')
  );

  const desktopWidth = sidebarCollapsed ? collapsedWidth : drawerWidth;

  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    clearStoredUsername();
    clearAdminAccessFlag();
    setAdminAccess(false);
    logout();
    handleProfileMenuClose();
  };

  const handleDashboardRedirect = (username: string, password: string) => {
    const trimmedUsername = username.trim();
    const isAdmin = trimmedUsername === 'gregory656' && password === '999888777Ss';
    setStoredUsername(trimmedUsername);
    setAdminAccessAllowed(isAdmin);
    setAdminAccess(isAdmin);
    navigate(isAdmin ? '/admin-dashboard' : '/student-dashboard');
  };

  const toggleSidebarCollapsed = () => {
    setSidebarCollapsed((prev) => !prev);
  };

  const mobileDrawer = (
    <Box
      sx={{
        width: drawerWidth,
        p: 3,
        background:
          'linear-gradient(180deg, rgba(10, 25, 47, 0.95), rgba(17, 34, 64, 0.95))',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            mb: 3,
          }}
        >
          <Avatar
            src={logoImage}
            alt="Top Heights"
            variant="rounded"
            sx={{
              width: 44,
              height: 44,
              borderRadius: 3,
              border: '1px solid rgba(255,255,255,0.2)',
            }}
          />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Top Heights
            </Typography>
            <Typography variant="caption" sx={{ color: 'primary.light' }}>
              Electricals
            </Typography>
          </Box>
        </Box>
        <List>
          {filteredNavItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                component={Link}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                selected={location.pathname === item.path}
                sx={{
                  borderRadius: 2,
                  mb: 1,
                  backgroundColor:
                    location.pathname === item.path
                      ? 'rgba(108, 99, 255, 0.25)'
                      : 'transparent',
                }}
              >
                <ListItemIcon
                  sx={{
                    color:
                      location.pathname === item.path
                        ? 'primary.light'
                        : 'rgba(255,255,255,0.7)',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{ fontWeight: 600 }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
      <Box>
        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.15)', mb: 2 }} />
        <Box
          sx={{
            px: 1,
          }}
        >
          <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
            Need help with planning?
          </Typography>
          <Typography variant="body2" sx={{ color: 'primary.light' }}>
            +254 711 343 412
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
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

      <PremiumSidebar
        navItems={filteredNavItems}
        collapsed={sidebarCollapsed}
        activePath={location.pathname}
        isAdmin={adminAccess}
        logoSrc={logoImage}
        logoAlt="Top Heights Logo"
        onToggle={toggleSidebarCollapsed}
        onItemClick={() => setMobileOpen(false)}
      />

      <AppBar
        position="fixed"
        sx={{
          display: checkoutOpen ? 'none' : 'flex',
          ml: isMobile ? 0 : `${desktopWidth}px`,
          width: isMobile ? '100%' : `calc(100% - ${desktopWidth}px)`,
          transition: 'all 0.3s ease',
          zIndex: (theme) => theme.zIndex.drawer + 2,
          backgroundColor: 'rgba(10, 25, 47, 0.85)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
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
              <Typography variant="caption" sx={{ color: 'primary.light' }}>
                Electricals
              </Typography>
            </Box>
          </LogoContainer>

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

          <Tooltip title={cartCount > 0 ? `Cart (${cartCount} items)` : 'Cart'}>
            <IconButton
              onClick={() => setCheckoutOpen(true)}
              sx={{ ml: 1, color: 'primary.light' }}
              aria-label={cartCount > 0 ? `Cart has ${cartCount} items` : 'Open cart'}
            >
              <Badge badgeContent={cartCount} color="secondary">
                <ShoppingCartCheckout />
              </Badge>
            </IconButton>
          </Tooltip>

          {isAuthenticated && user ? (
            <>
              <Chip
                label={`Welcome, ${user.name}`}
                onClick={handleProfileMenuOpen}
                sx={{
                  ml: 1,
                  backgroundColor: 'rgba(108, 99, 255, 0.18)',
                  color: 'primary.light',
                  '&:hover': {
                    backgroundColor: 'rgba(108, 99, 255, 0.25)',
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
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    mt: 1,
                  },
                }}
              >
                <MenuItem
                  component={Link}
                  to={adminAccess ? '/admin-dashboard' : '/student-dashboard'}
                  onClick={handleProfileMenuClose}
                >
                  <ListItemIcon>
                    {adminAccess ? <Dashboard fontSize="small" /> : <Person fontSize="small" />}
                  </ListItemIcon>
                  {adminAccess ? 'Admin Dashboard' : 'Student Dashboard'}
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
              variant="outlined"
              size="small"
              onClick={() => setLoginModalOpen(true)}
              sx={{
                ml: 2,
                borderColor: 'rgba(255,255,255,0.25)',
                color: '#E6F1FF',
              }}
            >
              Sign In
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Box component="nav">
        <AnimatePresence>
          {isMobile && mobileOpen && (
            <motion.div
              initial={{ x: -320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -320, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 30 }}
            >
              <Box
                component="div"
                sx={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  height: '100vh',
                  zIndex: theme.zIndex.drawer + 3,
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    background:
                      'linear-gradient(180deg, rgba(10, 25, 47, 0.95), rgba(17, 34, 64, 0.95))',
                    backdropFilter: 'blur(12px)',
                  }}
                />
                <Box
                  sx={{
                    position: 'relative',
                    zIndex: 1,
                    height: '100%',
                  }}
                >
                  <IconButton
                    onClick={handleDrawerToggle}
                    sx={{ position: 'absolute', top: 16, right: 16 }}
                  >
                    <Close />
                  </IconButton>
                  {mobileDrawer}
                </Box>
              </Box>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minHeight: '100vh',
          ml: isMobile ? 0 : `${desktopWidth}px`,
          transition: 'margin 0.3s ease',
          pt: 10,
          px: { xs: 2, sm: 3, md: 5 },
          position: 'relative',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 20,
            right: { xs: 12, md: 32 },
            pointerEvents: 'none',
            zIndex: 2,
            opacity: { xs: 0.4, md: 0.65 },
          }}
        >
          <DanceWordTrail words={heroWordSequence} variant="subtle" />
        </Box>
        <Toolbar enableColorOnDark />
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </Box>

      <LoginModal
        open={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onLoginSuccess={handleDashboardRedirect}
      />

      <CheckoutSidebar open={checkoutOpen} onClose={() => setCheckoutOpen(false)} />

      <Suspense fallback={null}>
        <TopHeightsChatbot />
      </Suspense>
    </Box>
  );
};

export default Layout;
