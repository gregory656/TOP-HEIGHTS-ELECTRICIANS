// src/pages/Home.tsx
import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  Chip,
  Avatar,
} from '@mui/material';
import {
  ElectricBolt,
  TrendingUp,
  SupportAgent,
  LocalShipping,
  ArrowForward,
  WhatsApp,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { products } from '../data/products';
import ProductCard from '../components/ProductCard';
import Footer from '../components/Footer';
import logoImage from '../assets/topeheights.jpeg';

const Home: React.FC = () => {
  const featuredProducts = products.slice(0, 4);

  const stats = [
    { icon: <ElectricBolt />, value: '10+', label: 'Years Experience' },
    { icon: <TrendingUp />, value: '5000+', label: 'Happy Customers' },
    { icon: <SupportAgent />, value: '24/7', label: 'Support' },
    { icon: <LocalShipping />, value: '48hrs', label: 'Delivery' },
  ];

  const services = [
    {
      title: 'Residential Wiring',
      description: 'Complete home electrical installations and repairs',
      icon: <ElectricBolt />,
    },
    {
      title: 'Commercial Solutions',
      description: 'Office and retail electrical systems',
      icon: <TrendingUp />,
    },
    {
      title: 'Industrial Projects',
      description: 'Heavy-duty electrical solutions for factories',
      icon: <SupportAgent />,
    },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          minHeight: 'calc(100vh - 64px)',
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(ellipse at 30% 20%, rgba(100, 255, 218, 0.08) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(100, 181, 246, 0.08) 0%, transparent 50%)',
            pointerEvents: 'none',
          },
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid size={{ xs: 12, md: 7 }}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Chip
                  label="⚡ Kenya's Trusted Electrical Supplier"
                  sx={{
                    mb: 3,
                    backgroundColor: 'rgba(100, 255, 218, 0.1)',
                    border: '1px solid rgba(100, 255, 218, 0.3)',
                    color: 'primary.main',
                    fontWeight: 600,
                  }}
                />
                
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: '2.5rem', sm: '3rem', md: '4rem' },
                    fontWeight: 800,
                    lineHeight: 1.1,
                    mb: 3,
                    background: 'linear-gradient(135deg, #E6F1FF 0%, #64FFDA 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  Powering Your World with Excellence
                </Typography>
                
                <Typography
                  variant="h5"
                  color="text.secondary"
                  sx={{ mb: 4, fontWeight: 400, lineHeight: 1.6, maxWidth: 500 }}
                >
                  Top Heights Electricals delivers premium electrical solutions 
                  across Kenya. Quality products, expert services, guaranteed satisfaction.
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    component={Link}
                    to="/shop"
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForward />}
                    sx={{ px: 4, py: 1.5 }}
                  >
                    Shop Now
                  </Button>
                  <Button
                    component="a"
                    href="https://wa.me/254711343412"
                    target="_blank"
                    variant="outlined"
                    size="large"
                    startIcon={<WhatsApp />}
                    sx={{ px: 4, py: 1.5 }}
                  >
                    WhatsApp Us
                  </Button>
                </Box>

                {/* Stats */}
                <Grid container spacing={3} sx={{ mt: 6 }}>
                  {stats.map((stat, index) => (
                    <Grid size={{ xs: 6, md: 3 }} key={index}>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                      >
                        <Box
                          sx={{
                            textAlign: 'center',
                            p: 2,
                            borderRadius: 2,
                            backgroundColor: 'rgba(100, 255, 218, 0.03)',
                            border: '1px solid rgba(100, 255, 218, 0.08)',
                          }}
                        >
                          <Avatar
                            sx={{
                              bgcolor: 'rgba(100, 255, 218, 0.1)',
                              color: 'primary.main',
                              width: 48,
                              height: 48,
                              mx: 'auto',
                              mb: 1,
                            }}
                          >
                            {stat.icon}
                          </Avatar>
                          <Typography
                            variant="h4"
                            sx={{ fontWeight: 700, color: 'primary.main' }}
                          >
                            {stat.value}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {stat.label}
                          </Typography>
                        </Box>
                      </motion.div>
                    </Grid>
                  ))}
                </Grid>
              </motion.div>
            </Grid>

            <Grid size={{ xs: 12, md: 5 }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '100%',
                      height: '100%',
                      background: 'radial-gradient(circle, rgba(100, 255, 218, 0.2) 0%, transparent 70%)',
                      zIndex: -1,
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: '100%',
                      height: { xs: 300, md: 450 },
                      borderRadius: 4,
                      overflow: 'hidden',
                      background: 'linear-gradient(135deg, rgba(100, 255, 218, 0.1) 0%, rgba(100, 181, 246, 0.1) 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid rgba(100, 255, 218, 0.2)',
                      backdropFilter: 'blur(10px)',
                      position: 'relative',
                    }}
                  >
                    {/* Watermark Logo */}
                    <Box
                      component="img"
                      src={logoImage}
                      alt="Top Heights Logo"
                      sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: { xs: 150, md: 250 },
                        height: 'auto',
                        opacity: 0.15,
                        filter: 'grayscale(100%) brightness(200%)',
                        zIndex: 0,
                      }}
                    />
                    <Box sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                      <ElectricBolt
                        sx={{
                          fontSize: { xs: 100, md: 150 },
                          color: 'primary.main',
                          filter: 'drop-shadow(0 0 20px rgba(100, 255, 218, 0.5))',
                        }}
                      />
                      <Typography
                        variant="h4"
                        sx={{ mt: 2, fontWeight: 700, color: 'primary.main' }}
                      >
                        Top Heights
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        Electrical Excellence
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Services Section */}
      <Box sx={{ py: 10 }}>
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Box sx={{ textAlign: 'center', mb: 6 }}>
              <Typography variant="h2" sx={{ mb: 2 }}>
                Our Services
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
                Professional electrical solutions for residential, commercial, and industrial needs
              </Typography>
            </Box>
          </motion.div>

          <Grid container spacing={3}>
            {services.map((service, index) => (
              <Grid size={{ xs: 12, md: 4 }} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <Card
                    sx={{
                      height: '100%',
                      textAlign: 'center',
                      p: 3,
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'rgba(100, 255, 218, 0.05)',
                      },
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 72,
                        height: 72,
                        mx: 'auto',
                        mb: 2,
                        bgcolor: 'rgba(100, 255, 218, 0.1)',
                        color: 'primary.main',
                      }}
                    >
                      {service.icon}
                    </Avatar>
                    <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
                      {service.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {service.description}
                    </Typography>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Featured Products */}
      <Box sx={{ py: 10, backgroundColor: 'rgba(100, 255, 218, 0.02)' }}>
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <Box>
                <Typography variant="h2" sx={{ mb: 1 }}>
                  Featured Products
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Top-rated electrical products from our catalog
                </Typography>
              </Box>
              <Button
                component={Link}
                to="/shop"
                variant="outlined"
                endIcon={<ArrowForward />}
              >
                View All
              </Button>
            </Box>
          </motion.div>

          <Grid container spacing={3}>
            {featuredProducts.map((product, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={product.id}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <ProductCard
                    product={product}
                    onOrder={(p) => console.log('Order:', p)}
                  />
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          py: 10,
          background: 'linear-gradient(135deg, rgba(100, 255, 218, 0.1) 0%, rgba(100, 181, 246, 0.05) 100%)',
          borderTop: '1px solid rgba(100, 255, 218, 0.1)',
          borderBottom: '1px solid rgba(100, 255, 218, 0.1)',
        }}
      >
        <Container maxWidth="md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h2" sx={{ mb: 2 }}>
                Ready to Get Started?
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Contact us today for a free consultation and quote on your electrical needs
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button
                  component="a"
                  href="https://wa.me/254711343412"
                  target="_blank"
                  variant="contained"
                  size="large"
                  startIcon={<WhatsApp />}
                  sx={{ px: 4 }}
                >
                  WhatsApp Us
                </Button>
                <Button
                  component={Link}
                  to="/about"
                  variant="outlined"
                  size="large"
                  sx={{ px: 4 }}
                >
                  Learn More
                </Button>
              </Box>
            </Box>
          </motion.div>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
};

export default Home;
