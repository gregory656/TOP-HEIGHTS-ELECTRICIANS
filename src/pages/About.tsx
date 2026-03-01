// src/pages/About.tsx
import { useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  Button,
  Avatar,
  Paper,
  Chip,
} from '@mui/material';
import {
  ElectricalServices,
  Visibility,
  VerifiedUser,
  People,
  Work,
  LinkedIn,
  Twitter,
  Facebook,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import Footer from '../components/Footer';

// TypeScript Interface for Company Milestone
interface CompanyMilestone {
  year: string;
  title: string;
  description: string;
  image: string;
}

// Company Milestones Data
const milestones: CompanyMilestone[] = [
  {
    year: '2018',
    title: 'Foundation',
    description: 'Top Heights Electricians was established with a vision to transform electrical services in Kenya.',
    image: 'public/topeheights.jpeg',
  },
  {
    year: '2020',
    title: 'Expansion',
    description: 'Extended services to commercial and industrial sectors, doubling our team of certified electricians.',
    image: 'public/commercialwiring.jpeg',
  },
  {
    year: '2022',
    title: 'Solar Innovation',
    description: 'Launched comprehensive solar energy solutions, becoming a leader in sustainable electrical systems.',
    image: 'public/solarenergy.jpeg',
  },
  {
    year: '2024',
    title: 'Market Leader',
    description: 'Recognized as one of Kenya\'s top electrical service providers with 500+ completed projects.',
    image: 'public/marketleader.jpeg',
  },
];

// Three Pillars Data
const pillars = [
  {
    icon: <ElectricalServices sx={{ fontSize: 40 }} />,
    title: 'Our Mission',
    description: 'Empowering Kenya through innovative electrical solutions that power homes, businesses, and industries with safety, efficiency, and sustainability at the core of everything we do.',
  },
  {
    icon: <Visibility sx={{ fontSize: 40 }} />,
    title: 'Our Vision',
    description: 'To be the most trusted and innovative electrical services company in East Africa, setting standards for quality, safety, and customer satisfaction.',
  },
  {
    icon: <VerifiedUser sx={{ fontSize: 40 }} />,
    title: 'Our Values',
    description: 'Safety First, Integrity, Innovation, Excellence, and Customer-Centricity guide every project we undertake.',
  },
];

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' as const },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
};

const About: React.FC = () => {
  const footerRef = useRef<HTMLElement>(null);

  const scrollToFooter = () => {
    footerRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <Box>
      {/* Hero Section with Background Image */}
      <Box
        sx={{
          position: 'relative',
          py: 12,
          minHeight: 500,
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
        }}
      >
        {/* Background Image */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'url(public/commercialwiring.jpeg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            '&::after': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(135deg, rgba(10, 25, 47, 0.95) 0%, rgba(17, 34, 64, 0.85) 50%, rgba(10, 25, 47, 0.9) 100%)',
            },
          }}
        />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Chip
              label="About Top Heights Electricians"
              size="small"
              sx={{
                mb: 3,
                backgroundColor: 'rgba(100, 255, 218, 0.15)',
                color: 'primary.main',
                fontWeight: 600,
                border: '1px solid rgba(100, 255, 218, 0.3)',
              }}
            />
            
            <Typography
              variant="h1"
              sx={{
                mb: 3,
                fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem' },
                background: 'linear-gradient(135deg, #E6F1FF 0%, #64FFDA 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Empowering Kenya Through Innovative Electrical Solutions
            </Typography>
            
            <Typography
              variant="h5"
              color="text.secondary"
              sx={{
                maxWidth: 700,
                lineHeight: 1.8,
                fontSize: { xs: '1.1rem', sm: '1.25rem' },
              }}
            >
              Top Heights Electricians is a premier electrical services company dedicated 
              to delivering safe, efficient, and innovative electrical solutions across 
              residential, commercial, and industrial sectors.
            </Typography>
          </motion.div>
        </Container>
      </Box>

      {/* Three Pillars Section */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <Grid container spacing={4}>
            {pillars.map((pillar, index) => (
              <Grid size={{ xs: 12, md: 4 }} key={index}>
                <motion.div variants={fadeInUp}>
                  <Card
                    sx={{
                      height: '100%',
                      textAlign: 'center',
                      p: 3,
                      background: 'rgba(17, 34, 64, 0.5)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(100, 255, 218, 0.1)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        borderColor: 'rgba(100, 255, 218, 0.3)',
                        boxShadow: '0 20px 40px rgba(100, 255, 218, 0.1)',
                      },
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 80,
                        height: 80,
                        mx: 'auto',
                        mb: 3,
                        backgroundColor: 'rgba(100, 255, 218, 0.1)',
                        border: '2px solid rgba(100, 255, 218, 0.3)',
                        color: 'primary.main',
                      }}
                    >
                      {pillar.icon}
                    </Avatar>
                    
                    <Typography
                      variant="h4"
                      component="h3"
                      sx={{
                        mb: 2,
                        color: 'primary.main',
                        fontWeight: 600,
                      }}
                    >
                      {pillar.title}
                    </Typography>
                    
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{ lineHeight: 1.8 }}
                    >
                      {pillar.description}
                    </Typography>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      </Container>

      {/* Interactive Timeline Section */}
      <Box
        sx={{
          py: 10,
          background: 'linear-gradient(180deg, rgba(100, 255, 218, 0.02) 0%, rgba(100, 181, 246, 0.02) 100%)',
        }}
      >
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Typography
              variant="h2"
              sx={{
                mb: 2,
                textAlign: 'center',
                color: 'text.primary',
              }}
            >
              Our Journey
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 6, textAlign: 'center', maxWidth: 600, mx: 'auto' }}
            >
              From humble beginnings to becoming a market leader, 
              explore the key milestones that have shaped Top Heights Electricians.
            </Typography>
          </motion.div>

          {/* Vertical Timeline */}
          <Box
            sx={{
              position: 'relative',
              maxWidth: 800,
              mx: 'auto',
              '&::before': {
                content: '""',
                position: 'absolute',
                left: { xs: 20, md: '50%' },
                top: 0,
                bottom: 0,
                width: 2,
                background: 'linear-gradient(180deg, rgba(100, 255, 218, 0.5) 0%, rgba(100, 181, 246, 0.5) 100%)',
                transform: { xs: 'none', md: 'translateX(-50%)' },
              },
            }}
          >
            {milestones.map((milestone, index) => (
              <motion.div
                key={milestone.year}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                style={{
                  display: 'flex',
                  justifyContent: index % 2 === 0 ? 'flex-start' : 'flex-end',
                  mb: 4,
                  paddingLeft: index % 2 === 0 ? 0 : '50%',
                  paddingRight: index % 2 === 0 ? '50%' : 0,
                  position: 'relative',
                }}
              >
                <Paper
                  sx={{
                    p: 3,
                    width: '100%',
                    maxWidth: 360,
                    background: 'rgba(17, 34, 64, 0.6)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(100, 255, 218, 0.15)',
                    borderRadius: 3,
                    position: 'relative',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.02)',
                      borderColor: 'rgba(100, 255, 218, 0.4)',
                      boxShadow: '0 10px 30px rgba(100, 255, 218, 0.1)',
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: '50%',
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      backgroundColor: 'primary.main',
                      border: '3px solid #0A192F',
                      transform: 'translateY(-50%)',
                      left: { xs: -36, md: index % 2 === 0 ? 'auto' : -36 },
                      right: { xs: 'auto', md: index % 2 === 0 ? -36 : 'auto' },
                    },
                  }}
                >
                  <Chip
                    label={milestone.year}
                    size="small"
                    sx={{
                      mb: 2,
                      backgroundColor: 'rgba(100, 255, 218, 0.15)',
                      color: 'primary.main',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                    }}
                  />
                  
                  <Typography
                    variant="h5"
                    component="h3"
                    sx={{
                      mb: 1,
                      color: 'text.primary',
                      fontWeight: 600,
                    }}
                  >
                    {milestone.title}
                  </Typography>
                  
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ lineHeight: 1.7 }}
                  >
                    {milestone.description}
                  </Typography>
                </Paper>
              </motion.div>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Meet the Director CTA Section */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Paper
            sx={{
              p: { xs: 4, md: 6 },
              background: 'linear-gradient(135deg, rgba(100, 255, 218, 0.05) 0%, rgba(100, 181, 246, 0.02) 100%)',
              border: '1px solid rgba(100, 255, 218, 0.15)',
              borderRadius: 4,
            }}
          >
            <Grid container spacing={6} alignItems="center">
              <Grid size={{ xs: 12, md: 4 }}>
                <Box
                  sx={{
                    position: 'relative',
                    width: 280,
                    height: 280,
                    mx: { xs: 'auto', md: '0' },
                  }}
                >
                  <Box
                    component="img"
                    src="public/director.jpeg"
                    alt="JOHN  - Director"
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '50%',
                      border: '4px solid rgba(100, 255, 218, 0.3)',
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 10,
                      right: 10,
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      backgroundColor: 'primary.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '3px solid #0A192F',
                    }}
                  >
                    <People sx={{ fontSize: 30, color: '#0A192F' }} />
                  </Box>
                </Box>
              </Grid>
              
              <Grid size={{ xs: 12, md: 8 }}>
                <Chip
                  label="Meet the Director"
                  size="small"
                  sx={{
                    mb: 2,
                    backgroundColor: 'rgba(100, 255, 218, 0.15)',
                    color: 'primary.main',
                    fontWeight: 600,
                  }}
                />
                
                <Typography
                  variant="h3"
                  component="h2"
                  sx={{
                    mb: 2,
                    color: 'text.primary',
                    fontWeight: 600,
                  }}
                >
                  JOHN
                </Typography>
                
                <Typography
                  variant="h6"
                  sx={{
                    mb: 3,
                    color: 'secondary.main',
                    fontWeight: 500,
                  }}
                >
                  Founder and Director, Top Heights Electricians
                </Typography>
                
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mb: 4, lineHeight: 1.9 }}
                >
                  With over 15 years of experience in the electrical industry, John has 
                  built Top Heights Electricians from the ground up, driven by a passion 
                  for quality workmanship and exceptional customer service. His vision 
                  continues to guide our team toward excellence in every project.
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    startIcon={<Work />}
                    sx={{ px: 3, py: 1.5 }}
                  >
                    Work With Us
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={scrollToFooter}
                    sx={{ px: 3, py: 1.5 }}
                  >
                    Connect With John
                  </Button>
                </Box>

                {/* Social Links Preview */}
                <Box sx={{ mt: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Chip
                    icon={<LinkedIn sx={{ fontSize: 18 }} />}
                    label="LinkedIn"
                    size="small"
                    sx={{
                      backgroundColor: 'rgba(100, 181, 246, 0.1)',
                      color: 'secondary.main',
                      '& .MuiChip-icon': { color: 'secondary.main' },
                    }}
                  />
                  <Chip
                    icon={<Twitter sx={{ fontSize: 18 }} />}
                    label="Twitter"
                    size="small"
                    sx={{
                      backgroundColor: 'rgba(100, 181, 246, 0.1)',
                      color: 'secondary.main',
                      '& .MuiChip-icon': { color: 'secondary.main' },
                    }}
                  />
                  <Chip
                    icon={<Facebook sx={{ fontSize: 18 }} />}
                    label="Facebook"
                    size="small"
                    sx={{
                      backgroundColor: 'rgba(100, 181, 246, 0.1)',
                      color: 'secondary.main',
                      '& .MuiChip-icon': { color: 'secondary.main' },
                    }}
                  />
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </motion.div>
      </Container>

      <Box ref={footerRef}>
        <Footer />
      </Box>
    </Box>
  );
};

export default About;
