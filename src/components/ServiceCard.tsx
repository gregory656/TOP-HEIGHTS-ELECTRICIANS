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
import { publicAsset } from '../utils/publicAsset';

interface ServiceCardProps {
  service: Service;
  onExplore: (service: Service) => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, onExplore }) => {
  const [imageSrc, setImageSrc] = React.useState(publicAsset(service.image));

  React.useEffect(() => {
    setImageSrc(publicAsset(service.image));
  }, [service.image]);

  const handleWhatsAppClick = () => {
    const message = `I am interested in a quote for ${service.title}.`;
    const phoneNumber = '254711343412';
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ height: '100%' }}
      transition={{ duration: 0.4 }}
    >
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Service Image */}
        <Box sx={{ position: 'relative', overflow: 'hidden' }}>
          <CardMedia
            component="img"
            className="service-image"
            height="220"
            loading="lazy"
            src={imageSrc}
            alt={service.title}
            onError={() => setImageSrc(publicAsset('/solarenergy.jpeg'))}
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
              backgroundColor: 'background.paper',
              color: 'primary.main',
              fontWeight: 600,
              fontSize: '0.75rem',
              border: '1px solid #DDE5DF',
            }}
          />
        </Box>

        <CardContent sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
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
                fontSize: '0.8rem',
                px: 1,
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
                fontSize: '0.8rem',
                px: 1,
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
