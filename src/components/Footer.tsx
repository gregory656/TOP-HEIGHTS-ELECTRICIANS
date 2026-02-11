// src/components/Footer.tsx
import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  TextField,
  Button,
  IconButton,
  Divider,
  Link as MuiLink,
} from '@mui/material';
import {
  YouTube,
  WhatsApp,
  Instagram,
  Facebook,
  Twitter,
  Send,
  Email,
  Phone,
  LocationOn,
  ElectricBolt,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const [email, setEmail] = React.useState('');
  const [subscribed, setSubscribed] = React.useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 3000);
      setEmail('');
    }
  };

  const socialLinks = [
    { icon: <YouTube />, label: 'YouTube', url: 'https://youtube.com/@gregory656' },
    { icon: <WhatsApp />, label: 'WhatsApp', url: 'https://wa.me/254719637416' },
    { icon: <Instagram />, label: 'Instagram', url: 'https://instagram.com/gregory656' },
    { icon: <Facebook />, label: 'Facebook', url: 'https://facebook.com/gregory656' },
    { icon: <Twitter />, label: 'X (Twitter)', url: 'https://x.com/gregory656' },
  ];

  const footerLinks = {
    company: [
      { label: 'About Us', path: '/about' },
      { label: 'Our Services', path: '/services' },
      { label: 'Shop', path: '/shop' },
      { label: 'News', path: '/news' },
    ],
    support: [
      { label: 'Contact Us', path: '#' },
      { label: 'FAQs', path: '#' },
      { label: 'Shipping Info', path: '#' },
      { label: 'Returns', path: '#' },
    ],
  };

  const newsItems = [
    {
      title: 'Kenya Launches New Electrical Safety Standards',
      date: 'Feb 10, 2026',
      excerpt: 'New regulations aim to improve electrical safety across residential and commercial buildings.',
    },
    {
      title: 'Renewable Energy Adoption Grows in East Africa',
      date: 'Feb 8, 2026',
      excerpt: 'More homeowners are switching to solar and renewable energy solutions.',
    },
    {
      title: 'Smart Home Technology Trends for 2026',
      date: 'Feb 5, 2026',
      excerpt: 'The latest innovations in electrical and smart home automation.',
    },
  ];

  return (
    <Box
      component="footer"
      sx={{
        mt: 8,
        backgroundColor: '#112240',
        borderTop: '1px solid rgba(100, 255, 218, 0.1)',
      }}
    >
      {/* Newsletter Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, rgba(100, 255, 218, 0.1) 0%, rgba(100, 181, 246, 0.05) 100%)',
          py: 4,
          borderBottom: '1px solid rgba(100, 255, 218, 0.1)',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    backgroundColor: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Send sx={{ color: '#0A192F' }} />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Stay Updated
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Get the latest electrical news and exclusive offers
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 5 }}>
              <form onSubmit={handleSubscribe}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Enter your email..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'rgba(255,255,255,0.05)',
                      },
                    }}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    sx={{
                      minWidth: 'auto',
                      px: 3,
                    }}
                  >
                    {subscribed ? '✓' : 'Subscribe'}
                  </Button>
                </Box>
              </form>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Box sx={{ display: 'flex', gap: 1, justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                {socialLinks.map((social) => (
                  <motion.div
                    key={social.label}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <IconButton
                      component="a"
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        color: 'text.secondary',
                        '&:hover': {
                          color: 'primary.main',
                          backgroundColor: 'rgba(100, 255, 218, 0.1)',
                        },
                      }}
                      aria-label={social.label}
                    >
                      {social.icon}
                    </IconButton>
                  </motion.div>
                ))}
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Main Footer Content */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={4}>
          {/* Company Info */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <ElectricBolt sx={{ color: 'primary.main', fontSize: 32 }} />
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  Top Heights
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Your trusted partner for all electrical solutions in Kenya. 
                Quality products, expert services, and reliable support since 2015.
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationOn sx={{ color: 'primary.main', fontSize: 20 }} />
                  <Typography variant="body2" color="text.secondary">
                    Nairobi, Kenya
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Phone sx={{ color: 'primary.main', fontSize: 20 }} />
                  <Typography variant="body2" color="text.secondary">
                    +254 719 637 416
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Email sx={{ color: 'primary.main', fontSize: 20 }} />
                  <Typography variant="body2" color="text.secondary">
                    info@topheights.co.ke
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid size={{ xs: 6, md: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Company
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {footerLinks.company.map((link) => (
                <MuiLink
                  key={link.label}
                  component={Link}
                  to={link.path}
                  underline="none"
                  sx={{
                    color: 'text.secondary',
                    fontSize: '0.9rem',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      color: 'primary.main',
                      transform: 'translateX(4px)',
                    },
                  }}
                >
                  {link.label}
                </MuiLink>
              ))}
            </Box>
          </Grid>

          {/* Support */}
          <Grid size={{ xs: 6, md: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Support
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {footerLinks.support.map((link) => (
                <MuiLink
                  key={link.label}
                  component={Link}
                  to={link.path}
                  underline="none"
                  sx={{
                    color: 'text.secondary',
                    fontSize: '0.9rem',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      color: 'primary.main',
                      transform: 'translateX(4px)',
                    },
                  }}
                >
                  {link.label}
                </MuiLink>
              ))}
            </Box>
          </Grid>

          {/* News Section */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Latest News
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {newsItems.map((news, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      backgroundColor: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(100, 255, 218, 0.05)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        backgroundColor: 'rgba(100, 255, 218, 0.05)',
                        borderColor: 'rgba(100, 255, 218, 0.1)',
                      },
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 600,
                        mb: 0.5,
                        fontSize: '0.9rem',
                      }}
                    >
                      {news.title}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="primary.main"
                      sx={{ display: 'block', mb: 0.5 }}
                    >
                      {news.date}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        fontSize: '0.8rem',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {news.excerpt}
                    </Typography>
                  </Box>
                </motion.div>
              ))}
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Bottom Bar */}
      <Divider sx={{ borderColor: 'rgba(100, 255, 218, 0.1)' }} />
      <Box sx={{ py: 3 }}>
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              © 2026 Top Heights Electricals. All rights reserved.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Made with ⚡ by{' '}
              <Typography
                component="span"
                variant="body2"
                sx={{ color: 'primary.main', fontWeight: 600 }}
              >
                @gregory656
              </Typography>
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Footer;
