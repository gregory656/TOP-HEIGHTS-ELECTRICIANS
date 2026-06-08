// src/pages/Services.tsx
import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Chip,
  Button,
} from '@mui/material';
import {
  BatteryChargingFull,
  SolarPower,
  WhatsApp,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { services } from '../data/services';
import type { Service } from '../data/services';
import ServiceCard from '../components/ServiceCard';
import ServiceDialog from '../components/ServiceDialog';
import Footer from '../components/Footer';

// Animation variants for staggerChildren effect
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut' as const,
    },
  },
};

const Services: React.FC = () => {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleExplore = (service: Service) => {
    setSelectedService(service);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setTimeout(() => setSelectedService(null), 300);
  };

  const handleWhatsAppContact = () => {
    const message = 'I am interested in a solar energy system. Please provide more information.';
    const phoneNumber = '254719637416';
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <Box>
      {/* Header Section */}
      <Box
        sx={{
          py: 8,
          background: '#FFFFFF',
          borderBottom: '1px solid #E4EFE8',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Chip
                icon={<SolarPower sx={{ fontSize: 16 }} />}
                label="Solar Services"
                size="small"
                sx={{
                  backgroundColor: '#F0FFF6',
                  color: 'primary.main',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  border: '1px solid #BFEFD0',
                  '& .MuiChip-icon': {
                    color: 'primary.main',
                  },
                }}
              />
            </Box>
            
            <Typography
              variant="h1"
              sx={{
                mb: 2,
                fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem' },
                color: '#101914',
              }}
            >
              Professional Solar Services
            </Typography>
            
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                maxWidth: 600,
                mb: 4,
                fontSize: { xs: '0.95rem', sm: '1rem' },
                lineHeight: 1.8,
              }}
            >
              Top Heights Solar designs, installs, and maintains clean energy systems for homes,
              businesses, schools, and farms across Kenya.
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<WhatsApp />}
                onClick={handleWhatsAppContact}
                sx={{
                  py: 1.5,
                  px: 3,
                }}
              >
                Get a Quote
              </Button>
              <Button
                variant="outlined"
                size="large"
                startIcon={<BatteryChargingFull />}
                sx={{
                  py: 1.5,
                  px: 3,
                }}
              >
                Plan Battery Backup
              </Button>
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* Services Grid */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Grid container spacing={3}>
            {services.map((service) => (
              <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={service.id}>
                <motion.div variants={itemVariants}>
                  <ServiceCard
                    service={service}
                    onExplore={handleExplore}
                  />
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Box
            sx={{
              mt: 8,
              p: 4,
              borderRadius: 3,
              background: '#F7FBF8',
              border: '1px solid #E4EFE8',
              textAlign: 'center',
            }}
          >
            <Typography variant="h4" sx={{ mb: 2, color: 'text.primary' }}>
              Need a Custom Solar Solution?
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}>
              Tell us your location, power needs, and budget. We will recommend a practical solar system.
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<WhatsApp />}
              onClick={handleWhatsAppContact}
              sx={{ py: 1.5, px: 4 }}
            >
              Contact Us Now
            </Button>
          </Box>
        </motion.div>
      </Container>

      {/* Service Dialog */}
      <AnimatePresence mode="wait">
        {dialogOpen && selectedService && (
          <ServiceDialog
            open={dialogOpen}
            onClose={handleCloseDialog}
            service={selectedService}
          />
        )}
      </AnimatePresence>

      <Footer />
    </Box>
  );
};

export default Services;
