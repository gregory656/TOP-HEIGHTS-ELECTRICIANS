import React, { useState } from 'react';
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
  Drawer,
  IconButton,
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
  ShoppingCart,
  ShoppingCartCheckout,
  Logout,
} from '@mui/icons-material';
import { Link, Outlet, useLocation } from 'react-router-dom';
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
} from '../utils/courseStorage';

const drawerWidth = 280;
const collapsedWidth = 88;

const navItems: NavItem[] = [
  { text: 'Home', icon: <Home />, path: '/' },
  { text: 'Services', icon: <Build />, path: '/services' },
  { text: 'Shop', icon: <ShoppingCart />, path: '/shop' },
  { text: 'Blog', icon: <Article />, path: '/blog' },
  { text: 'About', icon: <Info />, path: '/about' },
  { text: 'Business admin', icon: <AdminPanelSettings />, path: '/admin', adminOnly: true },
  { text: 'Learning admin', icon: <Dashboard />, path: '/admin-dashboard', adminOnly: true },
];


const Layout: React.FC = () => {
  const theme = useTheme();
  const location = useLocation();
  const activeNavPath = location.pathname.startsWith('/shop/') ? '/shop' : location.pathname.startsWith('/blog/') ? '/blog' : location.pathname;
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, logout, isAuthenticated, loginModalOpen, setLoginModalOpen, authLoading } =
    useAuth();
  const { cartCount } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const adminAccess = !authLoading && user?.role === 'admin';

  const filteredNavItems = navItems.filter(
    (item) => !item.adminOnly || adminAccess
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
    logout();
    handleProfileMenuClose();
  };

  const toggleSidebarCollapsed = () => {
    setSidebarCollapsed((prev) => !prev);
  };

  const mobileDrawer = (
    <Box
      sx={{
        width: drawerWidth,
        p: 3,
        background: '#FFFFFF',
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
              border: '1px solid #E4EFE8',
            }}
          />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Top Heights
            </Typography>
            <Typography variant="caption" sx={{ color: 'primary.light' }}>
              Solar
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
                selected={activeNavPath === item.path}
                sx={{
                  borderRadius: 2,
                  mb: 1,
                  backgroundColor:
                    activeNavPath === item.path
                      ? 'rgba(14, 122, 61, 0.12)'
                      : 'transparent',
                }}
              >
                <ListItemIcon
                  sx={{
                    color:
                      activeNavPath === item.path
                        ? 'primary.main'
                        : 'text.secondary',
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
        <Divider sx={{ borderColor: '#E4EFE8', mb: 2 }} />
        <Box
          sx={{
            px: 1,
          }}
        >
          <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
            Need solar planning?
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
          color: 'primary.main',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: 'rgba(246, 248, 247, 0.94)',
        }}
        open={authLoading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      <PremiumSidebar
        navItems={filteredNavItems}
        collapsed={sidebarCollapsed}
        activePath={activeNavPath}
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
          // Use tokens so AppBar adapts with theme
          backgroundColor: theme.palette.background.paper,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Toolbar sx={{ gap: { xs: 0.5, sm: 1 }, px: { xs: 1, sm: 3 } }}>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="Open navigation"
              aria-expanded={mobileOpen}
              aria-controls={mobileOpen ? "mobile-navigation" : undefined}
              onClick={handleDrawerToggle}
              sx={{ flexShrink: 0 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Box component={Link} to="/" sx={{ display: 'flex', alignItems: 'center', minWidth: 0, color: 'inherit', textDecoration: 'none', gap: { xs: 0.75, sm: 1 } }}>
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
              <Typography component="span" sx={{ fontWeight: 700, lineHeight: 1.2, fontSize: { xs: '0.85rem', sm: '1.125rem' }, whiteSpace: 'nowrap' }}>
                Top Heights
              </Typography>
              <Typography component="span" variant="caption" sx={{ display: 'block', color: 'primary.main' }}>
                Solar
              </Typography>
            </Box>
          </Box>

          <Box sx={{ flexGrow: 1 }} />


          <Tooltip title={cartCount > 0 ? `Cart (${cartCount} items)` : 'Cart'}>
            <IconButton
              onClick={() => setCheckoutOpen(true)}
              sx={{ flexShrink: 0, color: 'text.primary' }}
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
                label={isMobile ? user.name : `Welcome, ${user.name}`}
                onClick={handleProfileMenuOpen}
                sx={{
                  ml: 0.5,
                  maxWidth: { xs: 82, sm: 180 },
                  minHeight: 44,
                  backgroundColor: 'rgba(14, 122, 61, 0.12)',
                  color: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'rgba(14, 122, 61, 0.18)',
                  },
                }}
              />
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleProfileMenuClose}
                PaperProps={{
                  sx: {
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E4EFE8',
                    mt: 1,
                  },
                }}
              >
                <MenuItem
                  component={Link}
                  to={adminAccess ? '/admin' : '/student-dashboard'}
                  onClick={handleProfileMenuClose}
                >
                  <ListItemIcon>
                    {adminAccess ? <Dashboard fontSize="small" /> : <Person fontSize="small" />}
                  </ListItemIcon>
                  {adminAccess ? 'Business admin' : 'Student Dashboard'}
                </MenuItem>
                {adminAccess && (
                  <MenuItem component={Link} to="/admin-dashboard" onClick={handleProfileMenuClose}>
                    <ListItemIcon><Dashboard fontSize="small" /></ListItemIcon>
                    Learning admin
                  </MenuItem>
                )}
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
                ml: 0.5,
                px: { xs: 1, sm: 1.5 },
                flexShrink: 0,
                whiteSpace: 'nowrap',
                borderColor: 'divider',
                color: 'text.primary',
              }}
            >
              Sign In
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Drawer
        open={isMobile && mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{ zIndex: theme.zIndex.drawer + 3, '& .MuiDrawer-paper': { width: 280, maxWidth: '90vw' } }}
      >
        <Box component="nav" id="mobile-navigation" aria-label="Main navigation" sx={{ position: 'relative', height: '100%' }}>
          <IconButton aria-label="Close navigation" onClick={() => setMobileOpen(false)} sx={{ position: 'absolute', top: 8, right: 8 }}>
            <Close />
          </IconButton>
          {mobileDrawer}
        </Box>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minHeight: '100vh',
          ml: isMobile ? 0 : `${desktopWidth}px`,
          transition: 'margin 0.3s ease',
          pt: 0,
          minWidth: 0,
          px: { xs: 0, sm: 0, md: 0 },
          position: 'relative',
        }}
      >
        <Toolbar />
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
      />

      <CheckoutSidebar open={checkoutOpen} onClose={() => setCheckoutOpen(false)} />

    </Box>
  );
};

export default Layout;
