// src/components/ServiceDialog.tsx
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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
} from '@mui/material';
import {
  Close,
  CheckCircle,
  WhatsApp,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import type { Service } from '../data/services';
import ExternalVideo from './ExternalVideo';

interface ServiceDialogProps {
  open: boolean;
  onClose: () => void;
  service: Service | null;
}

const ServiceDialog: React.FC<ServiceDialogProps> = ({ open, onClose, service }) => {
  if (!service) return null;

  const handleWhatsAppClick = () => {
    const message = `I am interested in a quote for ${service.title}.`;
    const phoneNumber = '254711343412';
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
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
          <Chip
            label="Professional Service"
            size="small"
            sx={{
              backgroundColor: 'rgba(100, 255, 218, 0.15)',
              color: 'primary.main',
              fontWeight: 600,
              fontSize: '0.7rem',
              border: '1px solid rgba(100, 255, 218, 0.3)',
            }}
          />
          <Typography variant="h5" component="h3" sx={{ color: 'primary.main', fontWeight: 600 }}>
            {service.title}
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          sx={{
            color: 'text.secondary',
            '&:hover': {
              color: 'primary.main',
              backgroundColor: 'rgba(100, 255, 218, 0.1)',
            },
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {/* Video Placeholder */}
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: 280,
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #112240 0%, #0A192F 100%)',
          }}
        >
          <ExternalVideo src="https://www.youtube-nocookie.com/embed/2agQs02DziE" title={`${service.title} video`} height={280} />
        </Box>

        {/* Service Description */}
        <Box sx={{ p: 3 }}>
          <Typography
            variant="h6"
            sx={{ mb: 2, color: 'text.primary', fontWeight: 600 }}
          >
            About This Service
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 3, lineHeight: 1.8 }}
          >
            {service.fullDescription}
          </Typography>

          {/* Full Key Benefits */}
          <Typography
            variant="h6"
            sx={{ mb: 2, color: 'text.primary', fontWeight: 600 }}
          >
            Key Benefits
          </Typography>
          <List>
            {service.keyBenefits.map((benefit, index) => (
              <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <CheckCircle sx={{ color: 'primary.main', fontSize: 20 }} />
                </ListItemIcon>
                <ListItemText
                  primary={benefit}
                  primaryTypographyProps={{
                    variant: 'body2',
                    sx: { color: 'text.secondary' },
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          p: 3,
          borderTop: '1px solid rgba(100, 255, 218, 0.1)',
          background: 'rgba(100, 255, 218, 0.02)',
        }}
      >
        <Button onClick={onClose} color="inherit">
          Close
        </Button>
        <Button
          variant="contained"
          startIcon={<WhatsApp />}
          onClick={handleWhatsAppClick}
          sx={{
            px: 3,
          }}
        >
          Request Quote
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ServiceDialog;
