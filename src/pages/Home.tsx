import React, { useEffect, useRef } from 'react';
import {
  Avatar,
  Box,
  Button,
  Chip,
  Container,
  Typography,
  Card,
} from '@mui/material';
import {
  ElectricBolt,
  FlashOn,
  AutoGraph,
  Bolt,
  TrendingUp,
  SupportAgent,
  LocalShipping,
  ArrowForward,
  WhatsApp,
  EmojiObjects,
} from '@mui/icons-material';
import { motion, useInView, useScroll } from 'framer-motion';
import { keyframes } from '@mui/material/styles';
import { Link } from 'react-router-dom';
import { products } from '../data/products';
import ProductCard from '../components/ProductCard';
import Footer from '../components/Footer';
import logoImage from '../assets/topeheights.jpeg';
import useExplorerTracker, {
  AchievementState,
} from '../hooks/useExplorerTracker';
import AchievementBadge from '../components/gamification/AchievementBadge';
import ExplorerProgress from '../components/gamification/ExplorerProgress';
import InteractionCounter from '../components/gamification/InteractionCounter';
import SparkButton from '../components/ui/SparkButton';

const shimmerGlow = keyframes`
  0% {
    opacity: 0.4;
    text-shadow: 0 0 25px rgba(94, 240, 255, 0.6);
  }
  50% {
    opacity: 1;
    text-shadow: 0 0 40px rgba(94, 240, 255, 0.9);
  }
  100% {
    opacity: 0.4;
    text-shadow: 0 0 25px rgba(94, 240, 255, 0.6);
  }
`;

const marqueeSlide = keyframes`
  0% {
    transform: translateX(0%);
  }
  100% {
    transform: translateX(-50%);
  }
`;

const pulseLine = keyframes`
  0% {
    transform: scaleX(0.8);
    opacity: 0.4;
  }
  50% {
    transform: scaleX(1);
    opacity: 0.9;
  }
  100% {
    transform: scaleX(0.8);
    opacity: 0.4;
  }
`;

const stats = [
  { icon: <ElectricBolt />, value: '10+', label: 'Years Experience' },
  { icon: <TrendingUp />, value: '5000+', label: 'Projects Powered' },
  { icon: <SupportAgent />, value: '24/7', label: 'Support' },
  { icon: <LocalShipping />, value: '48hrs', label: 'Delivery' },
];

const services = [
  {
    title: 'Residential Wiring',
    description: 'Smart, secure and future-ready home wiring solutions.',
    icon: <ElectricBolt fontSize="large" />,
  },
  {
    title: 'Commercial Solutions',
    description: 'Scalable electrical systems for offices, malls, and retail.',
    icon: <TrendingUp fontSize="large" />,
  },
  {
    title: 'Industrial Projects',
    description: 'Heavy-duty installations designed for uptime and safety.',
    icon: <SupportAgent fontSize="large" />,
  },
];

const sparkParticles = [
  { top: '12%', left: '16%', size: 6, delay: 0 },
  { top: '28%', left: '70%', size: 8, delay: 0.4 },
  { top: '45%', left: '40%', size: 5, delay: 0.7 },
  { top: '65%', left: '22%', size: 7, delay: 0.2 },
  { top: '55%', left: '80%', size: 6, delay: 0.5 },
];

const floatingIcons = [
  { id: 'bolt', icon: <Bolt sx={{ fontSize: 34 }} />, position: { top: '10%', right: '14%' }, delay: 0.2 },
  { id: 'flash', icon: <FlashOn sx={{ fontSize: 28 }} />, position: { bottom: '26%', left: '12%' }, delay: 0.5 },
  { id: 'spark', icon: <ElectricBolt sx={{ fontSize: 32 }} />, position: { top: '48%', right: '6%' }, delay: 0.8 },
];

const mascots = [
  { id: 'core', label: 'Power Core', position: { top: '70%', right: '8%' }, delay: 0.4 },
  { id: 'guardian', label: 'Circuit Guardian', position: { bottom: '12%', left: '6%' }, delay: 0.7 },
];

const badgeIconMap: Record<AchievementState['id'], React.ReactNode> = {
  hero: <ElectricBolt color="primary" />,
  services: <FlashOn color="primary" />,
  products: <AutoGraph color="primary" />,
  cta: <Bolt color="primary" />,
  master: <EmojiObjects color="primary" />,
};

const Home: React.FC = () => {
  const heroRef = useRef<HTMLDivElement | null>(null);
  const servicesRef = useRef<HTMLElement | null>(null);
  const productsRef = useRef<HTMLElement | null>(null);
  const ctaRef = useRef<HTMLElement | null>(null);

  const heroInView = useInView(heroRef, { once: true, margin: '-30% 0px' });
  const servicesInView = useInView(servicesRef, { once: true, margin: '-30% 0px' });
  const productsInView = useInView(productsRef, { once: true, margin: '-30% 0px' });
  const ctaInView = useInView(ctaRef, { once: true, margin: '-30% 0px' });

  const { achievements, addPoints, markSectionVisited, points, progress } =
    useExplorerTracker();

  const { scrollYProgress } = useScroll();

  useEffect(() => {
    if (heroInView) {
      markSectionVisited('hero');
    }
  }, [heroInView, markSectionVisited]);

  useEffect(() => {
    if (servicesInView) {
      markSectionVisited('services');
    }
  }, [servicesInView, markSectionVisited]);

  useEffect(() => {
    if (productsInView) {
      markSectionVisited('products');
    }
  }, [productsInView, markSectionVisited]);

  useEffect(() => {
    if (ctaInView) {
      markSectionVisited('cta');
    }
  }, [ctaInView, markSectionVisited]);

  const handleSparkBoost = () => {
    addPoints(10);
  };

  return (
    <Box component="main" sx={{ position: 'relative', overflow: 'hidden' }}>
      <Box
        component="section"
        ref={heroRef}
        sx={{
          minHeight: '90vh',
          position: 'relative',
          overflow: 'hidden',
          pt: { xs: 6, md: 8 },
          pb: { xs: 8, md: 10 },
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at 20% 20%, rgba(94, 240, 255, 0.25), transparent 40%), radial-gradient(circle at 80% 0%, rgba(125, 159, 255, 0.2), transparent 35%)',
            opacity: 0.8,
            pointerEvents: 'none',
          }}
        />

        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            px: { xs: 2, md: 0 },
          }}
        >
          <Container maxWidth="lg">
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="body2"
                sx={{
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                  color: 'primary.light',
                }}
              >
                Electrify your curiosity
              </Typography>
              <Box
                sx={{
                  width: '100%',
                  height: 6,
                  mt: 1,
                  borderRadius: 3,
                  background: 'rgba(255,255,255,0.08)',
                  overflow: 'hidden',
                }}
              >
                <motion.div
                  style={{
                    height: '100%',
                    background: 'linear-gradient(90deg, #5EF0FF, #C5D1FF 60%, #F4F6FF)',
                    transformOrigin: '0 0',
                    scaleX: scrollYProgress,
                  }}
                />
              </Box>
            </Box>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { md: '7fr 5fr' },
                gap: 4,
                alignItems: 'center',
                position: 'relative',
              }}
            >
              <Box>
                <Chip
                  label="Kenya's Premium Electrical House"
                  sx={{
                    mb: 3,
                    borderRadius: 2,
                    border: '1px solid rgba(255, 120, 139, 0.6)',
                    color: '#FF9EB8',
                    backdropFilter: 'blur(18px)',
                    backgroundColor: 'rgba(255, 120, 139, 0.08)',
                  }}
                />

                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: '2.5rem', md: '4rem' },
                    fontWeight: 800,
                    lineHeight: 1.1,
                    mb: 3,
                  background:
                    'linear-gradient(120deg, rgba(255,255,255,0.9), rgba(255, 120, 139, 0.9), rgba(255, 179, 71, 0.8))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                      animation: `${shimmerGlow} 4s ease-in-out infinite`,
                  }}
                >
                  Welcome to TopHeights Electricals — Powering Innovation
                </Typography>

                <Typography
                  variant="h6"
                  color="text.secondary"
                  sx={{ mb: 4, maxWidth: 600 }}
                >
                  Premium electrical resources, gamified exploration, and polished
                  micro-interactions—built for adventurous engineering minds.
                </Typography>

                <Box
                  sx={{
                    display: 'flex',
                    gap: 2,
                    flexWrap: 'wrap',
                    alignItems: 'center',
                  }}
                >
                  <Link
                    to="/shop"
                    style={{ textDecoration: 'none', display: 'inline-flex' }}
                    aria-label="Shop Now"
                  >
                    <SparkButton endIcon={<ArrowForward />}>Shop Now</SparkButton>
                  </Link>

                  <Button
                    component="a"
                    href="https://wa.me/254711343412"
                    target="_blank"
                    variant="outlined"
                    startIcon={<WhatsApp />}
                    sx={{
                      borderColor: 'rgba(94, 240, 255, 0.5)',
                      color: 'primary.light',
                      borderRadius: 3,
                    }}
                    onMouseEnter={() => addPoints(3)}
                  >
                    WhatsApp Us
                  </Button>
                </Box>

                <Box
                  sx={{
                    mt: 5,
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                    gap: 2,
                  }}
                >
                  {stats.map((stat) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6 }}
                    >
                      <Box
                        sx={{
                          borderRadius: 3,
                          border: '1px solid rgba(255,255,255,0.1)',
                          px: 2,
                          py: 2.5,
                          backgroundColor: 'rgba(255,255,255,0.02)',
                          backdropFilter: 'blur(18px)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 0.5,
                        }}
                      >
                        <Avatar
                          sx={{
                            width: 42,
                            height: 42,
                            bgcolor: 'rgba(94, 240, 255, 0.15)',
                            color: 'primary.main',
                            mb: 0.5,
                          }}
                        >
                          {stat.icon}
                        </Avatar>
                        <Typography variant="h5" sx={{ fontWeight: 700 }}>
                          {stat.value}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ letterSpacing: 0.5 }}
                        >
                          {stat.label}
                        </Typography>
                      </Box>
                    </motion.div>
                  ))}
                </Box>
              </Box>

              <Box>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  <Box
                    sx={{
                      borderRadius: 4,
                      border: '1px solid rgba(94, 240, 255, 0.4)',
                      background:
                        'radial-gradient(circle at 20% 20%, rgba(94, 240, 255, 0.4), transparent 60%)',
                      position: 'relative',
                      p: 4,
                      overflow: 'hidden',
                      minHeight: 360,
                    }}
                  >
                    <Box
                      sx={{
                        width: 160,
                        height: 160,
                        borderRadius: '50%',
                        margin: '0 auto',
                        border: '2px solid rgba(255,255,255,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 0 45px rgba(94, 240, 255, 0.25)',
                      }}
                    >
                      <ElectricBolt
                        sx={{
                          fontSize: 100,
                          color: 'primary.main',
                          filter: 'drop-shadow(0 0 20px rgba(94, 240, 255, 0.6))',
                        }}
                      />
                    </Box>

                    <Box sx={{ textAlign: 'center', mt: 3 }}>
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        Top Heights
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Electrical craft, premium service, playful discovery.
                      </Typography>
                    </Box>

                    <Box
                      component="img"
                      src={logoImage}
                      alt="Top Heights Electricals logo"
                      sx={{
                        width: 96,
                        height: 96,
                        objectFit: 'cover',
                        borderRadius: '50%',
                        border: '2px solid rgba(94, 240, 255, 0.4)',
                        position: 'absolute',
                        bottom: 24,
                        right: 24,
                      }}
                    />
                  </Box>
                </motion.div>
              </Box>
            </Box>
          </Container>

          {floatingIcons.map((floating) => (
            <motion.div
              key={floating.id}
              animate={{ y: ['0%', '-8%', '0%'] }}
              transition={{ duration: 4, repeat: Infinity, delay: floating.delay }}
              style={{
                position: 'absolute',
                ...floating.position,
                pointerEvents: 'none',
              }}
            >
              <motion.div
                animate={{ rotate: [0, 8, -8, 0] }}
                transition={{ duration: 6, repeat: Infinity, delay: floating.delay }}
              >
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    background:
                      'radial-gradient(circle, rgba(255, 120, 139, 0.35), transparent 70%)',
                    border: '1px solid rgba(255, 120, 139, 0.7)',
                    boxShadow: '0 0 24px rgba(255, 120, 139, 0.65)',
                  }}
                >
                  {floating.icon}
                </Box>
              </motion.div>
            </motion.div>
          ))}

          {mascots.map((mascot) => (
            <motion.div
              key={mascot.id}
              animate={{ scale: [0.9, 1.05, 0.9], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 5, repeat: Infinity, delay: mascot.delay }}
              style={{
                position: 'absolute',
                ...mascot.position,
              }}
            >
              <Box
                sx={{
                  px: 2.5,
                  py: 1.25,
                  borderRadius: 2,
                  border: '1px solid rgba(94, 240, 255, 0.4)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  boxShadow: '0 8px 20px rgba(5, 12, 30, 0.65)',
                  textTransform: 'uppercase',
                  letterSpacing: 0.6,
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {mascot.label}
              </Box>
            </motion.div>
          ))}
          {sparkParticles.map((particle, index) => (
            <motion.span
              key={`spark-${index}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 3, repeat: Infinity, delay: particle.delay }}
              style={{
                position: 'absolute',
                width: particle.size,
                height: particle.size,
                top: particle.top,
                left: particle.left,
                borderRadius: '50%',
                background:
                  'radial-gradient(circle, rgba(94, 240, 255, 0.9), transparent 70%)',
                boxShadow: '0 0 25px rgba(94, 240, 255, 0.5)',
              }}
            />
          ))}
        </Box>
      </Box>

      <Box
        component="section"
        sx={{
          mt: 6,
          px: { xs: 2, md: 0 },
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'grid',
              gap: 3,
              gridTemplateColumns: { md: 'repeat(3, 1fr)' },
            }}
          >
            <Box>
              <ExplorerProgress progress={progress} points={points} />
            </Box>
            <Box>
              <InteractionCounter points={points} />
            </Box>
            <Box>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <Box
                  sx={{
                    borderRadius: 3,
                    border: '1px solid rgba(94, 240, 255, 0.3)',
                    backgroundColor: 'rgba(255,255,255,0.02)',
                    p: 3,
                    textAlign: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    backdropFilter: 'blur(18px)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.5,
                  }}
                >
                  <Typography variant="subtitle2" color="text.secondary">
                    Charge the beacon
                  </Typography>
                  <SparkButton endIcon={<Bolt />} onClick={handleSparkBoost}>
                    Release Spark
                  </SparkButton>
                  <Typography variant="caption" color="text.secondary">
                    +10 points stored in localStorage
                  </Typography>
                </Box>
              </motion.div>
            </Box>
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 2,
              justifyContent: 'center',
              mt: 4,
            }}
          >
            {achievements.map((item) => (
              <AchievementBadge
                key={item.id}
                title={item.title}
                description={item.description}
                unlocked={item.unlocked}
                icon={badgeIconMap[item.id]}
              />
            ))}
          </Box>
        </Container>
      </Box>

      <Box
        sx={{
          mt: 6,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <Box
          component={motion.div}
          initial={{ scaleX: 0.6, opacity: 0.4 }}
          whileInView={{ scaleX: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          sx={{
            width: { xs: '85%', md: '70%' },
            height: 6,
            borderRadius: 3,
            background:
              'linear-gradient(90deg, transparent, rgba(94, 240, 255, 0.6), transparent)',
            position: 'relative',
            overflow: 'hidden',
            '&::after': {
              content: '""',
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(90deg, rgba(94, 240, 255, 0), rgba(94, 240, 255, 0.9), rgba(94, 240, 255, 0))',
              animation: `${pulseLine} 2.6s ease-in-out infinite`,
            },
          }}
        />
      </Box>

      <Box
        component="section"
        ref={servicesRef}
        sx={{ py: 10, px: { xs: 2, md: 0 } }}
      >
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Box sx={{ textAlign: 'center', mb: 6 }}>
              <Typography variant="h2" sx={{ mb: 1 }}>
                Our Services
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ maxWidth: 680, mx: 'auto' }}
              >
                Elegant, resilient, and future-aware electrical systems for homes,
                offices, and industries across Kenya.
              </Typography>
            </Box>
          </motion.div>

          <Box
            sx={{
              display: 'grid',
              gap: 3,
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            }}
          >
            {services.map((service) => (
              <Box key={service.title}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <Card
                    onMouseEnter={() => addPoints(3)}
                    sx={{
                      p: 4,
                      borderRadius: 3,
                      border: '1px solid rgba(94, 240, 255, 0.15)',
                      background:
                        'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(94, 240, 255, 0.04))',
                      cursor: 'pointer',
                      '&:hover': {
                        boxShadow: '0 20px 40px rgba(94, 240, 255, 0.25)',
                        transform: 'translateY(-4px)',
                      },
                      transition: 'transform 0.35s ease, box-shadow 0.35s ease',
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 64,
                        height: 64,
                        mb: 2,
                        bgcolor: 'rgba(94, 240, 255, 0.12)',
                        color: 'primary.main',
                      }}
                    >
                      {service.icon}
                    </Avatar>
                    <Typography variant="h5" sx={{ mb: 1, fontWeight: 700 }}>
                      {service.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {service.description}
                    </Typography>
                  </Card>
                </motion.div>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      <Box
        component="section"
        ref={productsRef}
        sx={{ py: 10, backgroundColor: 'rgba(94, 240, 255, 0.04)' }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 2,
              mb: 4,
            }}
          >
            <Box>
              <Typography variant="h2" sx={{ mb: 1 }}>
                Featured Products
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Hand-picked tools that match the TopHeights standard.
              </Typography>
            </Box>
            <Link
              to="/shop"
              style={{ textDecoration: 'none', display: 'inline-flex' }}
              aria-label="Browse Catalog"
            >
              <SparkButton variant="contained" endIcon={<ArrowForward />}>
                Browse Catalog
              </SparkButton>
            </Link>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gap: 3,
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, minmax(0, 1fr))',
                md: 'repeat(4, minmax(0, 1fr))',
              },
            }}
          >
            {products.slice(0, 4).map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                onMouseEnter={() => addPoints(2)}
              >
                <ProductCard
                  product={product}
                  onOrder={() => console.log('Order:', product)}
                />
              </motion.div>
            ))}
          </Box>
        </Container>
      </Box>

      <Box
        component="section"
        ref={ctaRef}
        sx={{
          py: 10,
          px: { xs: 2, md: 0 },
          background:
            'linear-gradient(135deg, rgba(94, 240, 255, 0.15), rgba(8, 12, 32, 0.95))',
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
                Ready to explore the future of electrical craft?
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Our team merges precision, gamified discovery, and premium service
                to keep your projects shining bright.
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  gap: 2,
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                }}
              >
                <Link
                  to="/services"
                  style={{ textDecoration: 'none', display: 'inline-flex' }}
                  aria-label="Book a Consultation"
                >
                  <SparkButton>Book a Consultation</SparkButton>
                </Link>
                <Button
                  component="a"
                  href="https://wa.me/254711343412"
                  target="_blank"
                  variant="outlined"
                  sx={{
                    borderColor: 'rgba(94, 240, 255, 0.5)',
                    color: 'primary.light',
                    borderRadius: 3,
                  }}
                  onMouseEnter={() => addPoints(3)}
                >
                  Chat with an Engineer
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
