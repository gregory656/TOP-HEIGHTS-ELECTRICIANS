// src/components/OrderModal.tsx
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  Divider,
  Alert,
  CircularProgress,
  Avatar,
  Chip,
} from '@mui/material';
import {
  Close,
  WhatsApp,
  ShoppingCart,
  LocalShipping,
  Person,
  Phone,
  Email,
  CheckCircle,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
}

interface OrderModalProps {
  open: boolean;
  onClose: () => void;
  product: Product | null;
}

type OrderStep = 'login' | 'details' | 'confirmation';

const OrderModal: React.FC<OrderModalProps> = ({ open, onClose, product }) => {
  const [step, setStep] = useState<OrderStep>('login');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    quantity: 1,
    notes: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleContinue = () => {
    if (step === 'login') {
      setStep('details');
    } else if (step === 'details') {
      setStep('confirmation');
      setLoading(true);
      // Simulate order processing
      setTimeout(() => {
        setLoading(false);
      }, 1500);
    }
  };

  const handleWhatsAppOrder = () => {
    if (!product) return;
    const message = `Hello! I'm interested in ordering:\n\n📦 Product: ${product.name}\n💰 Price: KES ${product.price.toLocaleString()}\n📏 Quantity: ${formData.quantity}\n👤 Name: ${formData.name}\n📞 Phone: ${formData.phone}\n🏠 Address: ${formData.address}`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/254719637416?text=${encodedMessage}`, '_blank');
    onClose();
  };

  const handleClose = () => {
    setStep('login');
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
      quantity: 1,
      notes: '',
    });
    onClose();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (!product) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        component: motion.div,
        initial: { opacity: 0, scale: 0.9, y: 20 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.9, y: 20 },
        transition: { type: 'spring', stiffness: 300, damping: 25 },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, rgba(100, 255, 218, 0.1) 0%, rgba(100, 181, 246, 0.05) 100%)',
          borderBottom: '1px solid rgba(100, 255, 218, 0.1)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            sx={{
              bgcolor: 'primary.main',
              width: 48,
              height: 48,
            }}
          >
            <ShoppingCart />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Order Product
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Complete your order in 2 easy steps
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={handleClose} sx={{ color: 'text.secondary' }}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ mt: 3 }}>
        {/* Progress Steps */}
        <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
          {['login', 'details', 'confirmation'].map((s, index) => {
            const stepIndex = ['login', 'details', 'confirmation'].indexOf(step);
            const isActive = s === step;
            const isCompleted = ['login', 'details', 'confirmation'].indexOf(s) < stepIndex;
            
            return (
              <Chip
                key={s}
                label={index + 1}
                size="small"
                sx={{
                  backgroundColor: isActive || isCompleted ? 'primary.main' : 'rgba(100, 255, 218, 0.1)',
                  color: isActive || isCompleted ? '#0A192F' : 'text.secondary',
                  fontWeight: 600,
                  '& .MuiChip-label': {
                    px: 1,
                  },
                }}
              />
            );
          })}
        </Box>

        {/* Product Summary */}
        <Box
          sx={{
            p: 2,
            mb: 3,
            borderRadius: 3,
            backgroundColor: 'rgba(100, 255, 218, 0.05)',
            border: '1px solid rgba(100, 255, 218, 0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: 2,
              backgroundImage: `url(${product.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {product.name}
            </Typography>
            <Typography variant="body2" color="primary.main" sx={{ fontWeight: 700 }}>
              {formatPrice(product.price)}
            </Typography>
          </Box>
          <Chip
            label={`Qty: ${formData.quantity}`}
            size="small"
            sx={{
              backgroundColor: 'rgba(100, 255, 218, 0.15)',
              color: 'primary.main',
            }}
          />
        </Box>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {step === 'login' && (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Alert
                severity="info"
                sx={{
                  mb: 3,
                  backgroundColor: 'rgba(100, 181, 246, 0.1)',
                  border: '1px solid rgba(100, 181, 246, 0.2)',
                  '& .MuiAlert-icon': { color: 'secondary.main' },
                }}
              >
                You need to be logged in to place an order. Don't worry, you can continue as a guest or login later!
              </Alert>

              <Button
                fullWidth
                variant="outlined"
                size="large"
                startIcon={<Person />}
                onClick={() => setStep('details')}
                sx={{
                  mb: 2,
                  py: 1.5,
                  borderColor: 'rgba(100, 255, 218, 0.3)',
                  color: 'text.primary',
                  '&:hover': {
                    borderColor: 'primary.main',
                    backgroundColor: 'rgba(100, 255, 218, 0.05)',
                  },
                }}
              >
                Continue as Guest
              </Button>

              <Divider sx={{ my: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  OR ORDER VIA WHATSAPP
                </Typography>
              </Divider>

              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={<WhatsApp sx={{ fontSize: 24 }} />}
                onClick={handleWhatsAppOrder}
                sx={{
                  py: 1.5,
                  background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                  fontWeight: 700,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #2BBE68 0%, #1EA496 100%)',
                  },
                }}
              >
                Order via WhatsApp
              </Button>
            </motion.div>
          )}

          {step === 'details' && (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Box sx={{ display: 'grid', gap: 2 }}>
                <TextField
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  InputProps={{
                    startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
                <TextField
                  label="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  placeholder="+254 700 000 000"
                  InputProps={{
                    startAdornment: <Phone sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
                <TextField
                  label="Email (Optional)"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  fullWidth
                  InputProps={{
                    startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
                <TextField
                  label="Delivery Address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  multiline
                  rows={2}
                  InputProps={{
                    startAdornment: <LocalShipping sx={{ mr: 1, color: 'text.secondary', alignSelf: 'flex-start', mt: 0.5 }} />,
                  }}
                />
                <TextField
                  label="Quantity"
                  name="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  fullWidth
                  inputProps={{ min: 1, max: 100 }}
                />
                <TextField
                  label="Additional Notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  fullWidth
                  multiline
                  rows={2}
                  placeholder="Any special instructions..."
                />
              </Box>
            </motion.div>
          )}

          {step === 'confirmation' && (
            <motion.div
              key="confirmation"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              {loading ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
                  <CircularProgress sx={{ color: 'primary.main', mb: 2 }} />
                  <Typography color="text.secondary">Processing your order...</Typography>
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <CheckCircle
                    sx={{
                      fontSize: 64,
                      color: 'primary.main',
                      mb: 2,
                    }}
                  />
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                    Order Confirmed! 🎉
                  </Typography>
                  <Typography color="text.secondary" sx={{ mb: 3 }}>
                    Thank you for your order, {formData.name}! We'll contact you at {formData.phone} shortly.
                  </Typography>

                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    startIcon={<WhatsApp sx={{ fontSize: 24 }} />}
                    onClick={handleWhatsAppOrder}
                    sx={{
                      py: 1.5,
                      background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                      fontWeight: 700,
                    }}
                  >
                    Confirm via WhatsApp
                  </Button>
                </Box>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>

      {step !== 'confirmation' && (
        <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(100, 255, 218, 0.1)' }}>
          <Button onClick={handleClose} sx={{ color: 'text.secondary' }}>
            Cancel
          </Button>
          {step !== 'login' && (
            <Button
              variant="contained"
              onClick={handleContinue}
              disabled={
                (step === 'details' && (!formData.name || !formData.phone || !formData.address))
              }
            >
              {step === 'details' ? 'Confirm Order' : 'Continue'}
            </Button>
          )}
        </DialogActions>
      )}
    </Dialog>
  );
};

export default OrderModal;
