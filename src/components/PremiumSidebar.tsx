import React from 'react';
import {
  Avatar,
  Box,
  Divider,
  IconButton,
  List,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { ChevronLeft, ChevronRight, ContactSupport } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';

export interface NavItem {
  text: string;
  icon: React.ReactNode;
  path: string;
  adminOnly?: boolean;
}

export interface PremiumSidebarProps {
  navItems: NavItem[];
  collapsed: boolean;
  activePath: string;
  isAdmin: boolean;
  logoSrc: string;
  logoAlt: string;
  onToggle: () => void;
  onItemClick?: () => void;
}

const sidebarVariants: Variants = {
  open: {
    width: 280,
    transition: { type: 'spring', stiffness: 220, damping: 28 },
  },
  closed: {
    width: 88,
    transition: { type: 'spring', stiffness: 220, damping: 28 },
  },
};

const listVariants: Variants = {
  open: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.15,
    },
  },
  closed: {
    transition: {
      staggerChildren: 0.04,
      staggerDirection: -1,
    },
  },
};

const itemVariants: Variants = {
  open: {
    opacity: 1,
    x: 0,
  },
  closed: {
    opacity: 0.4,
    x: -20,
  },
};

const iconVariants: Variants = {
  open: { scale: 1, opacity: 1 },
  closed: { scale: 1, opacity: 1 },
};

const labelVariants: Variants = {
  open: { opacity: 1, x: 0 },
  closed: { opacity: 0, x: -20 },
};

const MotionSidebar = motion(Box);
const MotionList = motion(List);
const MotionListItem = motion(Box);
const MotionLabel = motion(Typography);
const MotionIconWrapper = motion(Box);

const PremiumSidebar: React.FC<PremiumSidebarProps> = ({
  navItems,
  collapsed,
  activePath,
  isAdmin,
  logoSrc,
  logoAlt,
  onToggle,
  onItemClick,
}) => {
  return (
    <MotionSidebar
      variants={sidebarVariants}
      animate={collapsed ? 'closed' : 'open'}
      initial={false}
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        background:
          'linear-gradient(180deg, rgba(10, 25, 47, 0.98), rgba(17, 34, 64, 0.95))',
        borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 20px 45px rgba(5, 6, 20, 0.8)',
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        justifyContent: 'space-between',
        p: 3,
        transition: 'background 0.3s ease',
        backdropFilter: 'blur(14px)',
        zIndex: (theme) => theme.zIndex.appBar - 1,
      }}
    >
      <Stack spacing={3}>
        <Box
          component={Link}
          to="/"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            textDecoration: 'none',
            color: 'inherit',
          }}
          onClick={onItemClick}
        >
          <Avatar
            src={logoSrc}
            alt={logoAlt}
            variant="rounded"
            sx={{
              width: 48,
              height: 48,
              borderRadius: 3,
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 8px 20px rgba(5,5,15,0.6)',
            }}
          />
          {!collapsed && (
            <Stack spacing={0.5}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Top Heights
              </Typography>
              <Typography variant="caption" sx={{ color: 'primary.light' }}>
                Electricals
              </Typography>
            </Stack>
          )}
        </Box>

        <MotionList
          disablePadding
          variants={listVariants}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 0.5,
          }}
        >
          {navItems.map((item) => {
            if (item.adminOnly && !isAdmin) return null;
            const isActive = activePath === item.path;
            return (
              <MotionListItem
                key={item.text}
                variants={itemVariants}
                sx={{
                  display: 'flex',
                }}
              >
                <Tooltip title={collapsed ? item.text : ''} placement="right" arrow>
                  <Box
                    component={Link}
                    to={item.path}
                    onClick={onItemClick}
                    sx={{
                      width: '100%',
                      textDecoration: 'none',
                    }}
                  >
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={collapsed ? 0 : 2}
                      sx={{
                        position: 'relative',
                        px: collapsed ? 1.5 : 2.75,
                        py: 1.25,
                        borderRadius: 2,
                        color: isActive ? '#FFFFFF' : 'rgba(255,255,255,0.85)',
                        backgroundColor: isActive
                          ? 'rgba(108, 99, 255, 0.25)'
                          : 'transparent',
                        boxShadow: isActive
                          ? '0 10px 30px rgba(108, 99, 255, 0.25)'
                          : 'none',
                        overflow: 'hidden',
                        transition: 'all 0.3s ease',
                      }}
                      component={motion.div}
                      whileHover={{
                        scale: 1.03,
                        boxShadow: '0 0 30px rgba(108, 99, 255, 0.35)',
                      }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <Box
                        sx={{
                          width: 4,
                          height: 32,
                          borderRadius: 2,
                          position: 'absolute',
                          left: 0,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: isActive
                            ? 'linear-gradient(180deg, #6C63FF, #1E90FF)'
                            : 'transparent',
                          boxShadow: isActive
                            ? '0 0 12px rgba(108, 99, 255, 0.8)'
                            : 'none',
                        }}
                      />
                      <MotionIconWrapper
                        variants={iconVariants}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minWidth: 32,
                          color: 'primary.light',
                        }}
                      >
                        {item.icon}
                      </MotionIconWrapper>
                      {!collapsed && (
                        <MotionLabel
                          variant="body1"
                          noWrap
                          variants={labelVariants}
                          sx={{ fontWeight: 600 }}
                        >
                          {item.text}
                        </MotionLabel>
                      )}
                    </Stack>
                  </Box>
                </Tooltip>
              </MotionListItem>
            );
          })}
        </MotionList>

        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />

        <Stack
          spacing={0.5}
          sx={{
            px: collapsed ? 1 : 2,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <ContactSupport fontSize="small" sx={{ color: 'primary.light' }} />
            {!collapsed && (
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Need support?
              </Typography>
            )}
          </Stack>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Call +254 711 343 412
          </Typography>
        </Stack>
      </Stack>

      <Box
        sx={{
          display: 'flex',
          justifyContent: collapsed ? 'center' : 'flex-end',
          pt: 2,
        }}
      >
        <Tooltip title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} arrow>
          <IconButton
            onClick={onToggle}
            sx={{
              border: `1px solid rgba(255, 255, 255, 0.2)`,
              color: '#E6F1FF',
              width: 40,
              height: 40,
            }}
          >
            {collapsed ? <ChevronRight /> : <ChevronLeft />}
          </IconButton>
        </Tooltip>
      </Box>
    </MotionSidebar>
  );
};

export default PremiumSidebar;
