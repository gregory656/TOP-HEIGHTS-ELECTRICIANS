import React from 'react';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardMedia,
  Chip,
  Container,
  Stack,
  Typography,
} from '@mui/material';
import {
  ArrowForward,
  BatteryChargingFull,
  Engineering,
  SolarPower,
  Speed,
  WhatsApp,
  WbSunny,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { products } from '../data/products';
import ProductCard from '../components/ProductCard';
import Footer from '../components/Footer';
import { publicAsset } from '../utils/publicAsset';

const stats = [
  { value: '10+', label: 'Years building reliable energy systems' },
  { value: '500+', label: 'Solar and backup projects delivered' },
  { value: '48hr', label: 'Site assessment turnaround in Nairobi' },
  { value: '24/7', label: 'Support for installed systems' },
];

const services = [
  {
    title: 'Home Solar Systems',
    description: 'Clean roof-mounted solar packages sized for daily home use, backup comfort, and lower bills.',
    icon: <SolarPower />,
    image: '/solarpeople.jpg',
  },
  {
    title: 'Commercial Solar',
    description: 'High-output solar arrays for shops, offices, schools, farms, and light industrial facilities.',
    icon: <WbSunny />,
    image: '/solafarm.jpg',
  },
  {
    title: 'Battery Backup',
    description: 'Hybrid inverter and battery systems that keep essentials running during outages.',
    icon: <BatteryChargingFull />,
    image: '/leadacidbatteries.jpeg',
  },
];

const process = [
  'Site survey and load audit',
  'Custom solar design and quote',
  'Professional installation',
  'Monitoring, maintenance, and support',
];

const featuredProducts = products
  .filter((product) =>
    ['Solar Panels', 'Renewable Energy', 'Solar Storage', 'Solar Accessories'].includes(product.category)
  )
  .slice(0, 4);

const Home: React.FC = () => {
  return (
    <Box component="main" sx={{ bgcolor: '#FFFFFF', color: '#102018', overflow: 'hidden' }}>
      <Box
        component="section"
        sx={{
          minHeight: { xs: 'auto', md: 'calc(100vh - 96px)' },
          display: 'flex',
          alignItems: 'center',
          py: { xs: 5, md: 8 },
        }}
      >
        <Container maxWidth="xl">
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: '1.02fr 0.98fr' },
              gap: { xs: 5, lg: 7 },
              alignItems: 'center',
            }}
          >
            <Stack spacing={3.5}>
              <Chip
                icon={<SolarPower />}
                label="Solar energy systems for Kenya"
                sx={{
                  alignSelf: 'flex-start',
                  bgcolor: '#F0FFF6',
                  borderColor: '#BFEFD0',
                  color: '#0D6B37',
                  fontWeight: 700,
                }}
              />

              <Box>
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: '2.6rem', sm: '3.4rem', lg: '4.8rem' },
                    lineHeight: 0.96,
                    letterSpacing: 0,
                    color: '#101914',
                    maxWidth: 760,
                  }}
                >
                  Top Heights Solar
                </Typography>
                <Typography
                  variant="h4"
                  sx={{
                    mt: 2,
                    maxWidth: 690,
                    color: '#355044',
                    fontSize: { xs: '1.15rem', md: '1.45rem' },
                    lineHeight: 1.45,
                    fontWeight: 500,
                  }}
                >
                  Premium solar design, installation, and backup power for homes and businesses that want cleaner energy without drama.
                </Typography>
              </Box>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button
                  component="a"
                  href="https://wa.me/254711343412?text=I%20want%20a%20solar%20quote%20from%20Top%20Heights%20Solar."
                  target="_blank"
                  variant="contained"
                  size="large"
                  startIcon={<WhatsApp />}
                  sx={{
                    bgcolor: '#0E7A3D',
                    boxShadow: '0 16px 36px rgba(14, 122, 61, 0.22)',
                    '&:hover': { bgcolor: '#0A6231' },
                  }}
                >
                  Get Solar Quote
                </Button>
                <Button
                  component={Link}
                  to="/services"
                  variant="outlined"
                  size="large"
                  endIcon={<ArrowForward />}
                  sx={{
                    borderColor: '#C9DED2',
                    color: '#102018',
                    bgcolor: '#FFFFFF',
                  }}
                >
                  View Solar Services
                </Button>
              </Stack>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
                  gap: 1.5,
                  maxWidth: 820,
                }}
              >
                {stats.map((stat) => (
                  <Box
                    key={stat.label}
                    sx={{
                      p: 2,
                      border: '1px solid #E4EFE8',
                      borderRadius: 2,
                      bgcolor: '#FFFFFF',
                    }}
                  >
                    <Typography variant="h4" sx={{ color: '#0E7A3D', fontWeight: 800 }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#52675D', display: 'block' }}>
                      {stat.label}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Stack>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <Box
                sx={{
                  position: 'relative',
                  minHeight: { xs: 420, md: 620 },
                  borderRadius: 2,
                  overflow: 'hidden',
                  boxShadow: '0 28px 80px rgba(25, 58, 42, 0.16)',
                }}
              >
                <Box
                  component="img"
                  src={publicAsset('/solarpeople.jpg')}
                  alt="Solar technicians installing panels on a roof"
                  sx={{
                    width: '100%',
                    height: '100%',
                    position: 'absolute',
                    inset: 0,
                    objectFit: 'cover',
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(180deg, rgba(255,255,255,0) 35%, rgba(9, 43, 25, 0.68) 100%)',
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    left: 24,
                    right: 24,
                    bottom: 24,
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: 'auto 1fr' },
                    gap: 2,
                    alignItems: 'center',
                    color: '#FFFFFF',
                  }}
                >
                  <Avatar sx={{ width: 56, height: 56, bgcolor: '#FFFFFF', color: '#0E7A3D' }}>
                    <Engineering />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                      Designed before installation begins
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.86)' }}>
                      Every quote starts with load needs, roof conditions, battery goals, and long-term service.
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </motion.div>
          </Box>
        </Container>
      </Box>

      <Box component="section" sx={{ py: { xs: 6, md: 9 }, bgcolor: '#F7FBF8' }}>
        <Container maxWidth="xl">
          <Stack spacing={1.5} sx={{ mb: 4, maxWidth: 780 }}>
            <Typography variant="h2" sx={{ color: '#101914', fontSize: { xs: '2rem', md: '3rem' } }}>
              Solar solutions, stripped down to what matters
            </Typography>
            <Typography variant="body1" sx={{ color: '#52675D' }}>
              Clean energy should feel clear: the right panels, the right inverter, the right batteries, and a team that stands behind the system.
            </Typography>
          </Stack>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
              gap: 2.5,
            }}
          >
            {services.map((service) => (
              <Card key={service.title} sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: 'none' }}>
                <CardMedia component="img" src={publicAsset(service.image)} alt={service.title} height="230" />
                <Box sx={{ p: 3 }}>
                  <Avatar sx={{ bgcolor: '#ECFFF4', color: '#0E7A3D', mb: 2 }}>
                    {service.icon}
                  </Avatar>
                  <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
                    {service.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#52675D' }}>
                    {service.description}
                  </Typography>
                </Box>
              </Card>
            ))}
          </Box>
        </Container>
      </Box>

      <Box component="section" sx={{ py: { xs: 6, md: 9 } }}>
        <Container maxWidth="xl">
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: '0.8fr 1.2fr' },
              gap: { xs: 4, lg: 7 },
              alignItems: 'center',
            }}
          >
            <Box>
              <Typography variant="h2" sx={{ color: '#101914', fontSize: { xs: '2rem', md: '3rem' }, mb: 2 }}>
                A simple path to solar confidence
              </Typography>
              <Typography variant="body1" sx={{ color: '#52675D', mb: 4 }}>
                We remove guesswork from solar by turning your energy needs into a practical system plan before a panel is mounted.
              </Typography>
              <Stack spacing={2}>
                {process.map((item, index) => (
                  <Stack key={item} direction="row" spacing={2} alignItems="center">
                    <Avatar sx={{ bgcolor: '#0E7A3D', color: '#FFFFFF', fontWeight: 800 }}>
                      {index + 1}
                    </Avatar>
                    <Typography variant="h6" sx={{ color: '#102018' }}>
                      {item}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Box>
            <Box
              component="img"
              src={publicAsset('/solafarm2.jpg')}
              alt="Large solar panel installation"
              sx={{
                width: '100%',
                height: { xs: 360, md: 520 },
                objectFit: 'cover',
                borderRadius: 2,
              }}
            />
          </Box>
        </Container>
      </Box>

      <Box component="section" sx={{ py: { xs: 6, md: 9 }, bgcolor: '#F7FBF8' }}>
        <Container maxWidth="xl">
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', md: 'flex-end' }}
            spacing={2}
            sx={{ mb: 4 }}
          >
            <Box>
              <Typography variant="h2" sx={{ color: '#101914', fontSize: { xs: '2rem', md: '3rem' } }}>
                Featured solar products
              </Typography>
              <Typography variant="body1" sx={{ color: '#52675D' }}>
                Panels, inverters, batteries, and accessories selected for dependable systems.
              </Typography>
            </Box>
            <Button component={Link} to="/shop" variant="outlined" endIcon={<ArrowForward />}>
              Browse Shop
            </Button>
          </Stack>

          <Box
            sx={{
              display: 'grid',
              gap: 3,
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, minmax(0, 1fr))',
                lg: 'repeat(4, minmax(0, 1fr))',
              },
            }}
          >
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} onOrder={() => undefined} />
            ))}
          </Box>
        </Container>
      </Box>

      <Box component="section" sx={{ py: { xs: 7, md: 10 } }}>
        <Container maxWidth="lg">
          <Box
            sx={{
              p: { xs: 3, md: 5 },
              borderRadius: 2,
              bgcolor: '#0E7A3D',
              color: '#FFFFFF',
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr auto' },
              gap: 3,
              alignItems: 'center',
            }}
          >
            <Box>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
                <Speed />
                <Typography variant="overline" sx={{ letterSpacing: 1 }}>
                  Fast solar assessment
                </Typography>
              </Stack>
              <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
                Ready to lower your power bill?
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.84)' }}>
                Send us your location and power needs. We will recommend a clear solar package and installation plan.
              </Typography>
            </Box>
            <Button
              component="a"
              href="https://wa.me/254711343412?text=Hello%20Top%20Heights%20Solar%2C%20I%20need%20a%20solar%20assessment."
              target="_blank"
              variant="contained"
              startIcon={<WhatsApp />}
              sx={{
                bgcolor: '#FFFFFF',
                color: '#0E7A3D',
                minWidth: 210,
                '&:hover': { bgcolor: '#EAF7EF' },
              }}
            >
              WhatsApp Now
            </Button>
          </Box>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
};

export default Home;
