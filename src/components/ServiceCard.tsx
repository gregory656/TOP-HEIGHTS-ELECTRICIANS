// src/components/ServiceCard.tsx
import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
} from '@mui/material';
import {
  CheckCircle,
  WhatsApp,
  Explore,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import type { Service } from '../data/services';

interface ServiceCardProps {
  service: Service;
  onExplore: (service: Service) => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, onExplore }) => {
  const [hovered, setHovered] = React.useState(false);

  const handleWhatsAppClick = () => {
    const message = `I am interested in a quote for ${service.title}.`;
    const phoneNumber = '254719637416';
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.4 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(100, 255, 218, 0.1) 0%, rgba(100, 181, 246, 0.05) 100%)',
            opacity: hovered ? 1 : 0,
            transition: 'opacity 0.3s ease',
            pointerEvents: 'none',
            zIndex: 0,
          },
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: '0 20px 40px rgba(100, 255, 218, 0.15)',
            '& .service-image': {
              transform: 'scale(1.1)',
            },
          },
        }}
      >
        {/* Service Image */}
        <Box sx={{ position: 'relative', overflow: 'hidden' }}>
          <CardMedia
            component="img"
            className="service-image"
            height="180"
            image={service.image}
            alt={service.title}
            sx={{
              objectFit: 'cover',
              transition: 'transform 0.5s ease',
            }}
          />
          
          {/* Service Badge */}
          <Chip
            label="Professional Service"
            size="small"
            sx={{
              position: 'absolute',
              top: 12,
              left: 12,
              backgroundColor: 'rgba(100, 255, 218, 0.15)',
              color: 'primary.main',
              fontWeight: 600,
              fontSize: '0.7rem',
              border: '1px solid rgba(100, 255, 218, 0.3)',
            }}
          />
        </Box>

        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
          {/* Service Title */}
          <Typography
            variant="h5"
            component="h3"
            sx={{
              fontWeight: 600,
              mb: 1.5,
              fontSize: { xs: '1.1rem', sm: '1.25rem' },
              lineHeight: 1.3,
              color: 'primary.main',
            }}
          >
            {service.title}
          </Typography>

          {/* Short Description */}
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 2,
              flexGrow: 1,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              lineHeight: 1.6,
            }}
          >
            {service.shortDescription}
          </Typography>

          {/* Key Benefits */}
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="subtitle2"
              sx={{
                color: 'text.secondary',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                mb: 1,
              }}
            >
              Key Benefits
            </Typography>
            <List dense sx={{ py: 0 }}>
              {service.keyBenefits.slice(0, 3).map((benefit, index) => (
                <ListItem key={index} sx={{ px: 0, py: 0.25 }}>
                  <ListItemIcon sx={{ minWidth: 28 }}>
                    <CheckCircle
                      sx={{
                        fontSize: 16,
                        color: 'primary.main',
                      }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={benefit}
                    primaryTypographyProps={{
                      variant: 'body2',
                      sx: {
                        fontSize: '0.8rem',
                        color: 'text.secondary',
                      },
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>

          {/* Action Buttons */}
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              mt: 'auto',
            }}
          >
            <Button
              variant="contained"
              size="small"
              startIcon={<WhatsApp />}
              onClick={handleWhatsAppClick}
              sx={{
                flex: 1,
                py: 1,
                fontSize: '0.75rem',
              }}
            >
              Request Quote
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Explore />}
              onClick={() => onExplore(service)}
              sx={{
                flex: 1,
                py: 1,
                fontSize: '0.75rem',
              }}
            >
              Explore
            </Button>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ServiceCard;
