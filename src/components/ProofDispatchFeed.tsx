import React, { useMemo, useState } from 'react';
import {
  Avatar,
  Box,
  Card,
  Chip,
  Container,
  Grid,
  Stack,
  Typography,
  Button,
} from '@mui/material';
import { motion } from 'framer-motion';
import { dispatchCategories, dispatchFeed } from '../data/dispatchFeed';
import { LocalShipping, Verified } from '@mui/icons-material';

const statusColorMap: Record<string, 'success' | 'warning' | 'info' | 'secondary'> = {
  'In Progress': 'info',
  'QA Passed': 'success',
  Scheduled: 'warning',
  'Field Completed': 'secondary',
};

const ProofDispatchFeed: React.FC = () => {
  const [category, setCategory] = useState<string>('all');

  const filteredFeed = useMemo(() => {
    if (category === 'all') return dispatchFeed;
    return dispatchFeed.filter((entry) => entry.category === category);
  }, [category]);

  return (
    <Box
      component="section"
      sx={{
        py: 10,
        background:
          'linear-gradient(180deg, rgba(94, 240, 255, 0.04), rgba(5, 12, 24, 0.95))',
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ mb: 4, textAlign: { xs: 'left', md: 'center' } }}>
          <Typography variant="h6" color="primary.light" sx={{ mb: 1 }}>
            JOHN GATEHI Dispatch Feed
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
            Live Electrical & Solar Project Signal
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 760, mx: 'auto' }}>
            Real-time updates from JOHN GATEHI's electrical and solar crews keep clients confident
            every panel install, generator retrofit, and critical circuit upgrade meets premium standards.
          </Typography>
        </Box>

        <Stack
          direction="row"
          spacing={1}
          flexWrap="wrap"
          justifyContent="center"
          sx={{ mb: 4 }}
        >
          {dispatchCategories.map((option) => (
            <Chip
              key={option.value}
              label={option.label}
              color={category === option.value ? 'primary' : 'default'}
              variant={category === option.value ? 'filled' : 'outlined'}
              onClick={() => setCategory(option.value)}
              sx={{
                borderRadius: 2,
                px: 2,
                py: 0.7,
                cursor: 'pointer',
                textTransform: 'none',
              }}
            />
          ))}
        </Stack>

        <Grid container spacing={3}>
          {filteredFeed.map((entry) => (
            <Grid key={entry.id} size={{ xs: 12, md: 6 }}>
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Card
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    border: '1px solid rgba(255,255,255,0.08)',
                    background: 'rgba(17, 34, 64, 0.78)',
                    boxShadow: '0 20px 45px rgba(0, 0, 0, 0.45)',
                    backdropFilter: 'blur(18px)',
                    minHeight: 260,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 2,
                    }}
                  >
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar
                        sx={{
                          bgcolor: 'rgba(94, 240, 255, 0.15)',
                          color: 'primary.main',
                          width: 46,
                          height: 46,
                        }}
                      >
                        <LocalShipping />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          {entry.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {entry.location}
                        </Typography>
                      </Box>
                    </Stack>
                    <Chip
                      label={entry.badge}
                      size="small"
                      color="secondary"
                      variant="outlined"
                      icon={<Verified fontSize="small" />}
                      sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600 }}
                    />
                  </Box>

                  <Typography variant="body2" color="text.secondary">
                    {entry.description}
                  </Typography>

                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: 2,
                    }}
                  >
                    <Chip
                      label={entry.status}
                      size="small"
                      color={statusColorMap[entry.status] || 'info'}
                      variant="filled"
                      sx={{ borderRadius: 1.5, textTransform: 'none' }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {entry.timestamp}
                    </Typography>
                  </Box>

                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption" color="text.secondary">
                      Tech: {entry.technician}
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      sx={{
                        borderRadius: 999,
                        borderColor: 'rgba(255,255,255,0.2)',
                        color: '#E6F1FF',
                        textTransform: 'none',
                      }}
                    >
                      View Snapshot
                    </Button>
                  </Stack>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default ProofDispatchFeed;
