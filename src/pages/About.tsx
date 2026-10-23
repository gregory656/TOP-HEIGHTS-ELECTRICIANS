import PublicPageMeta from '../components/PublicPageMeta';
import React from 'react';
import {
  Avatar,
  Box,
  Button,
  Card,
  Container,
  Stack,
  Typography,
} from '@mui/material';
import {
  BatteryChargingFull,
  Engineering,
  SolarPower,
  WhatsApp,
  WbSunny,
} from '@mui/icons-material';
import Footer from '../components/Footer';
import { publicAsset } from '../utils/publicAsset';

const values = [
  {
    title: 'Design first',
    description: 'We size systems from real energy needs before recommending panels, batteries, or inverters.',
    icon: <Engineering />,
  },
  {
    title: 'Clean installation',
    description: 'Every system is installed for safety, access, weather exposure, and long-term serviceability.',
    icon: <SolarPower />,
  },
  {
    title: 'Reliable backup',
    description: 'We help clients choose practical storage so essential loads keep running when power is unstable.',
    icon: <BatteryChargingFull />,
  },
];

const About: React.FC = () => {
  return (
    <Box sx={{ bgcolor: '#FFFFFF' }}>
      <PublicPageMeta path="/about" />
      <Box component="section" sx={{ py: { xs: 6, md: 9 }, borderBottom: '1px solid #E4EFE8' }}>
        <Container maxWidth="xl">
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: '0.95fr 1.05fr' },
              gap: { xs: 4, lg: 7 },
              alignItems: 'center',
            }}
          >
            <Stack spacing={2.5}>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ color: '#0E7A3D' }}>
                <WbSunny />
                <Typography variant="overline" sx={{ letterSpacing: 1, fontWeight: 800 }}>
                  About Top Heights Solar
                </Typography>
              </Stack>
              <Typography
                variant="h1"
                sx={{
                  color: '#101914',
                  fontSize: { xs: '2rem', md: '2.75rem' },
                  lineHeight: 1.16,
                }}
              >
                We build solar systems that feel clear, dependable, and worth the investment.
              </Typography>
              <Typography variant="body1" sx={{ color: '#52675D', maxWidth: 720 }}>
                Top Heights Solar helps Kenyan homes and businesses move toward cleaner energy with practical system design,
                professional installation, and ongoing support. Our goal is simple: make solar easier to trust.
              </Typography>
              <Button
                component="a"
                href="https://wa.me/254711343412?text=Hello%20Top%20Heights%20Solar%2C%20I%20want%20to%20learn%20more."
                target="_blank"
                variant="contained"
                startIcon={<WhatsApp />}
                sx={{ alignSelf: 'flex-start' }}
              >
                Talk to Our Team
              </Button>
            </Stack>

            <Box
              component="img"
              src={publicAsset('/solafarm.jpg')}
              alt="Solar panels installed in sunlight"
              sx={{
                width: '100%',
                height: { xs: 360, md: 560 },
                objectFit: 'cover',
                borderRadius: 2,
              }}
            />
          </Box>
        </Container>
      </Box>

      <Box component="section" sx={{ py: { xs: 6, md: 9 }, bgcolor: '#F7FBF8' }}>
        <Container maxWidth="xl">
          <Typography variant="h2" sx={{ color: '#101914', mb: 4, fontSize: { xs: '2rem', md: '3rem' } }}>
            What guides the work
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
              gap: 2.5,
            }}
          >
            {values.map((value) => (
              <Card key={value.title} sx={{ p: 3, borderRadius: 2, boxShadow: 'none' }}>
                <Avatar sx={{ bgcolor: '#ECFFF4', color: '#0E7A3D', mb: 2 }}>
                  {value.icon}
                </Avatar>
                <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, color: '#101914' }}>
                  {value.title}
                </Typography>
                <Typography variant="body2" sx={{ color: '#52675D' }}>
                  {value.description}
                </Typography>
              </Card>
            ))}
          </Box>
        </Container>
      </Box>

      <Box component="section" sx={{ py: { xs: 6, md: 9 } }}>
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'auto 1fr' },
              gap: 3,
              alignItems: 'center',
            }}
          >
            <Avatar
              src={publicAsset('/director.jpeg')}
              alt="Top Heights Solar director"
              sx={{ width: { xs: 120, md: 160 }, height: { xs: 120, md: 160 } }}
            />
            <Box>
              <Typography variant="h3" sx={{ color: '#101914', fontWeight: 800, mb: 1 }}>
                Led by hands-on project experience
              </Typography>
              <Typography variant="body1" sx={{ color: '#52675D' }}>
                Founder John Gatehi leads Top Heights with a practical approach: understand the client, design the
                right system, install it neatly, and stay available after handover.
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
};

export default About;
