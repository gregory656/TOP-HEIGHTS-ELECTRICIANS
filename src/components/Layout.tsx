// src/components/Layout.tsx
import React, { useState } from 'react';
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
  AccountCircle,
  ElectricBolt,
  Close,
} from '@mui/icons-material';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { styled, alpha } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';

const drawerWidth = 280;

const navItems = [
  { text: 'Home', icon: <Home />, path: '/' },
  { text: 'Services', icon: <Build />, path: '/services' },
  { text: 'Shop', icon: <ShoppingCart />, path: '/shop' },
  { text: 'About', icon: <Info />, path: '/about' },
  { text: 'News', icon: <Article />, path: '/news' },
  { text: 'Admin', icon: <AdminPanelSettings />, path: '/admin' },
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavClick = () => {
    if (isMobile) {
      setMobileOpen(false);
    }
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
            sx={{
              bgcolor: 'primary.main',
              width: 40,
              height: 40,
            }}
          >
            <ElectricBolt />
          </Avatar>
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
        {navItems.map((item) => (
          <NavItem
            button
            component={Link}
            to={item.path}
            key={item.text}
            active={location.pathname === item.path ? 'true' : 'false'}
            onClick={handleNavClick}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </NavItem>
        ))}
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
            📞 +254 719 637 416
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      
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
              sx={{
                bgcolor: 'primary.main',
                width: 36,
                height: 36,
              }}
            >
              <ElectricBolt sx={{ fontSize: 20 }} />
            </Avatar>
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
          
          <IconButton size="large" color="inherit">
            <AccountCircle />
          </IconButton>
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
    </Box>
  );
}
