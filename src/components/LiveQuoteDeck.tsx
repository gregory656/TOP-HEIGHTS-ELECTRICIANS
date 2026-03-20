import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  IconButton,
  Slider,
  Stack,
  Step,
  StepLabel,
  Stepper,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { motion } from 'framer-motion';

const serviceOptions = [
  {
    id: 'residential',
    label: 'Residential Upgrade',
    description: 'Lighting, outlets, and smart controls for homes and apartments.',
    base: 42000,
    panelNote: 'Main panel ready',
  },
  {
    id: 'commercial',
    label: 'Commercial Fit-Out',
    description: 'Hybrid office, retail, and hospitality wiring with analytics.',
    base: 88000,
    panelNote: 'Panel + sub-feed audit',
  },
  {
    id: 'industrial',
    label: 'Industrial & Infrastructure',
    description: 'High-capacity distribution, UPS, and automation-ready builds.',
    base: 132000,
    panelNote: 'Panel upgrade probable',
  },
];

const priorityOptions = [
  { value: 'standard', label: 'Standard (3–5 days)', multiplier: 1 },
  { value: 'priority', label: 'Priority (24–48 hrs)', multiplier: 1.22 },
  { value: 'emergency', label: 'Emergency (Same day)', multiplier: 1.45 },
];

const addOnCatalog = [
  { id: 'surge', label: 'Surge Protection Package', price: 12000 },
  { id: 'ev', label: 'EV Charging Ready Circuit', price: 23000 },
  { id: 'panel', label: 'Panel Health + Upgrade', price: 35000 },
  { id: 'smart', label: 'Smart Control Panel', price: 18000 },
];

const steps = ['Service', 'Priority', 'Sizing', 'Add-ons'];

const formatPrice = (value: number) =>
  new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }).format(
    value
  );

interface LiveQuoteDeckProps {
  open: boolean;
  onClose: () => void;
}

const LiveQuoteDeck: React.FC<LiveQuoteDeckProps> = ({ open, onClose }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedService, setSelectedService] = useState(serviceOptions[0].id);
  const [priority, setPriority] = useState(priorityOptions[0].value);
  const [area, setArea] = useState(120);
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);

  const currentService = serviceOptions.find((option) => option.id === selectedService) ?? serviceOptions[0];
  const priorityMeta = priorityOptions.find((option) => option.value === priority) ?? priorityOptions[0];

  const areaMultiplier = useMemo(() => {
    if (area <= 80) return 0.92;
    if (area <= 180) return 1;
    if (area <= 300) return 1.15;
    return 1.3;
  }, [area]);

  const addOnTotal = useMemo(
    () =>
      selectedAddOns.reduce((total, addonId) => {
        const addon = addOnCatalog.find((item) => item.id === addonId);
        return total + (addon ? addon.price : 0);
      }, 0),
    [selectedAddOns]
  );

  const estimate = useMemo(() => {
    return currentService.base * priorityMeta.multiplier * areaMultiplier + addOnTotal;
  }, [currentService.base, priorityMeta.multiplier, areaMultiplier, addOnTotal]);

  const rangeMin = estimate * 0.94;
  const rangeMax = estimate * 1.16;

  const handleNext = () => {
    setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  const toggleAddOn = (addonId: string) => {
    setSelectedAddOns((prev) =>
      prev.includes(addonId) ? prev.filter((id) => id !== addonId) : [...prev, addonId]
    );
  };

  const stepContent = [
    <Stack direction="column" spacing={2} key="service-options">
      {serviceOptions.map((option) => (
        <Button
          key={option.id}
          variant={selectedService === option.id ? 'contained' : 'outlined'}
          onClick={() => setSelectedService(option.id)}
          sx={{
            borderRadius: 3,
            justifyContent: 'flex-start',
            textTransform: 'none',
            px: 3,
            py: 2,
            borderColor: 'rgba(255, 255, 255, 0.08)',
          }}
        >
          <Box sx={{ textAlign: 'left' }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {option.label}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {option.description}
            </Typography>
          </Box>
        </Button>
      ))}
    </Stack>,
    <ToggleButtonGroup
      value={priority}
      exclusive
      onChange={(event, value) => value && setPriority(value)}
      aria-label="Priority scheduling"
      sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
      key="priority-options"
    >
      {priorityOptions.map((option) => (
        <ToggleButton
          key={option.value}
          value={option.value}
          sx={{
            borderRadius: 3,
            borderColor: 'rgba(255,255,255,0.12)',
            paddingY: 2,
            justifyContent: 'flex-start',
            textTransform: 'none',
          }}
        >
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {option.label}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Timeline multiplier {option.multiplier.toFixed(2)}x
            </Typography>
          </Box>
        </ToggleButton>
      ))}
    </ToggleButtonGroup>,
    <Box key="sizing">
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Estimate the scope by floor area (m²). Adjust to reflect the project size or complexity.
      </Typography>
      <Slider
        value={area}
        min={60}
        max={400}
        step={10}
        onChange={(event, value) => setArea(value as number)}
        valueLabelDisplay="on"
        valueLabelFormat={(value) => `${value} m²`}
        sx={{ color: 'primary.main' }}
      />
      <Typography variant="caption" color="text.secondary">
        {area <= 80
          ? 'Boutique scope'
          : area <= 180
          ? 'Standard deployment'
          : area <= 300
          ? 'Large footprint'
          : 'Enterprise-scale'}
      </Typography>
    </Box>,
    <Stack direction="column" spacing={1} key="addons">
      <Typography variant="body2" color="text.secondary">
        Add value with optional services.
      </Typography>
      <Stack direction="row" flexWrap="wrap" gap={1}>
        {addOnCatalog.map((addon) => (
          <Chip
            key={addon.id}
            label={`${addon.label} · ${formatPrice(addon.price)}`}
            variant={selectedAddOns.includes(addon.id) ? 'filled' : 'outlined'}
            color="secondary"
            onClick={() => toggleAddOn(addon.id)}
            sx={{ borderRadius: 2, cursor: 'pointer', fontWeight: 600 }}
          />
        ))}
      </Stack>
    </Stack>,
  ];

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 480 },
          background:
            'linear-gradient(180deg, rgba(10, 25, 47, 0.98), rgba(17, 34, 64, 0.95))',
          borderLeft: '1px solid rgba(255,255,255,0.15)',
          backdropFilter: 'blur(18px)',
        },
      }}
    >
      <Box sx={{ height: '100%', overflowY: 'auto', px: 3, py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Guided Quote Deck
            </Typography>
            <Typography variant="body2" color="text.secondary">
              JOHN GATEHI For Tech......stuff - electrical and solar panel quoting in minutes.
            </Typography>
          </Box>
          <IconButton onClick={onClose} color="inherit">
            <Close />
          </IconButton>
        </Box>

        <Stepper
          activeStep={activeStep}
          alternativeLabel
          sx={{
            mb: 4,
            '.MuiStepLabel-label': { fontSize: 12, fontWeight: 600 },
          }}
        >
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ mb: 3 }}>
          <motion.div
            key={`step-${activeStep}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            {stepContent[activeStep]}
          </motion.div>
        </Box>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 3 }} />

        <Box
          sx={{
            borderRadius: 3,
            background: 'rgba(17, 34, 64, 0.85)',
            border: '1px solid rgba(255,255,255,0.08)',
            p: 3,
            mb: 3,
          }}
        >
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            Estimated range
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {formatPrice(rangeMin)} - {formatPrice(rangeMax)}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {currentService.panelNote} · {priorityMeta.label}
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center" sx={{ mt: 2 }}>
            <Chip label={`Area: ${area} m²`} size="small" />
            <Chip label={`Add-ons: ${selectedAddOns.length}`} size="small" />
            <Chip label={`Add-on total: ${formatPrice(addOnTotal)}`} size="small" />
          </Stack>
        </Box>

        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <Button
            variant="outlined"
            fullWidth
            onClick={handleBack}
            disabled={activeStep === 0}
            sx={{ borderRadius: 3, borderColor: 'rgba(255,255,255,0.2)' }}
          >
            Back
          </Button>
          <Button
            variant="contained"
            fullWidth
            onClick={activeStep === steps.length - 1 ? onClose : handleNext}
            sx={{ borderRadius: 3 }}
          >
            {activeStep === steps.length - 1 ? 'Save Quote' : 'Next Step'}
          </Button>
        </Stack>

        <Button
          variant="text"
          fullWidth
          onClick={() => alert('A summary PDF will be emailed shortly.')}
          sx={{ textTransform: 'none', color: 'primary.light' }}
        >
          Email me this draft
        </Button>
      </Box>
    </Drawer>
  );
};

export default LiveQuoteDeck;
