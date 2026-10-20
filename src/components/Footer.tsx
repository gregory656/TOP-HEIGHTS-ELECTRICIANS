import React from 'react';
import {
  Box,
  Button,
  Container,
  Divider,
  IconButton,
  Link as MuiLink,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  Email,
  Facebook,
  Instagram,
  LocationOn,
  Phone,
  WhatsApp,
  YouTube,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import BrandLogo from './BrandLogo';

const Footer: React.FC = () => {
  const [email, setEmail] = React.useState('');
  const [subscribed, setSubscribed] = React.useState(false);

  const handleSubscribe = (event: React.FormEvent) => {
    event.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail('');
    window.setTimeout(() => setSubscribed(false), 2600);
  };

  const socialLinks = [
    { icon: <WhatsApp />, label: 'WhatsApp', url: 'https://wa.me/254711343412' },
    { icon: <Instagram />, label: 'Instagram', url: 'https://www.instagram.com/topheightselectricians?igsh=ZjBvcTU3ZmV3bWFy' },
    { icon: <Facebook />, label: 'Facebook', url: 'https://facebook.com/TopHeightsElectricalsPLC' },
    { icon: <YouTube />, label: 'YouTube', url: 'https://youtube.com/@topheightselectricians' },
  ];

  const links = [
    { label: 'Solar Services', path: '/services' },
    { label: 'Solar Shop', path: '/shop' },
    { label: 'Blog', path: '/blog' },
    { label: 'About Top Heights', path: '/about' },
  ];

  return (
    <Box component="footer" sx={{ mt: 8, bgcolor: '#FFFFFF', borderTop: '1px solid #E4EFE8' }}>
      <Container maxWidth="xl" sx={{ py: { xs: 5, md: 7 } }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1.15fr 0.85fr 1fr' },
            gap: 4,
          }}
        >
          <Stack spacing={2.5}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <BrandLogo size={56} />
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#101914' }}>
                  Top Heights Solar
                </Typography>
                <Typography variant="body2" sx={{ color: '#52675D' }}>
                  Clean energy systems for Kenya
                </Typography>
              </Box>
            </Stack>

            <Typography variant="body2" sx={{ color: '#52675D', maxWidth: 460 }}>
              Solar design, installation, battery backup, and maintenance for homes, businesses, schools, and farms.
            </Typography>

            <Stack spacing={1.2}>
              <Stack direction="row" spacing={1.2} alignItems="center">
                <LocationOn fontSize="small" sx={{ color: '#0E7A3D' }} />
                <Typography variant="body2" sx={{ color: '#52675D' }}>
                  Nairobi, Kenya
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1.2} alignItems="center">
                <Phone fontSize="small" sx={{ color: '#0E7A3D' }} />
                <Typography variant="body2" sx={{ color: '#52675D' }}>
                  +254 711 343 412
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1.2} alignItems="center">
                <Email fontSize="small" sx={{ color: '#0E7A3D' }} />
                <Typography variant="body2" sx={{ color: '#52675D' }}>
                  topheightselectricals@gmail.com
                </Typography>
              </Stack>
            </Stack>
          </Stack>

          <Stack spacing={2}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#101914' }}>
              Explore
            </Typography>
            {links.map((item) => (
              <MuiLink
                key={item.label}
                component={Link}
                to={item.path}
                underline="none"
                sx={{
                  color: '#52675D',
                  width: 'fit-content',
                  '&:hover': { color: '#0E7A3D' },
                }}
              >
                {item.label}
              </MuiLink>
            ))}
            <Stack direction="row" spacing={1} sx={{ pt: 1 }}>
              {socialLinks.map((social) => (
                <IconButton
                  key={social.label}
                  component="a"
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  sx={{
                    border: '1px solid #E4EFE8',
                    color: '#52675D',
                    '&:hover': { color: '#0E7A3D', bgcolor: '#F0FFF6' },
                  }}
                >
                  {social.icon}
                </IconButton>
              ))}
            </Stack>
          </Stack>

          <Box component="form" onSubmit={handleSubscribe}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#101914', mb: 1 }}>
              Get solar updates
            </Typography>
            <Typography variant="body2" sx={{ color: '#52675D', mb: 2 }}>
              Receive practical solar offers, maintenance tips, and installation availability.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <TextField
                fullWidth
                size="small"
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              <Button type="submit" variant="contained">
                {subscribed ? 'Done' : 'Subscribe'}
              </Button>
            </Stack>
          </Box>
        </Box>
      </Container>

      <Divider sx={{ borderColor: '#E4EFE8' }} />
      <Container maxWidth="xl" sx={{ py: 2.5 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1}>
          <Typography variant="body2" sx={{ color: '#52675D' }}>
            © 2026 Top Heights Solar. All rights reserved.
          </Typography>
          <Stack direction="row" gap={2} flexWrap="wrap"><MuiLink component={Link} to="/privacy" color="inherit">Privacy policy</MuiLink><Button size="small" onClick={() => window.dispatchEvent(new Event('open-privacy-preferences'))}>Privacy choices</Button></Stack>
        </Stack>
      </Container>
    </Box>
  );
};

export default Footer;
