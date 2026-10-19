// src/components/CheckoutSidebar.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Button,
  TextField,
  Divider,
  List,
  ListItem,
  Avatar,
  CircularProgress,
  Alert,
  Skeleton,
} from '@mui/material';
import {
  Close,
  Delete,
  Add,
  Remove,
  ShoppingCartCheckout,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../context/CartContext';
import { createOrderWithItems, startOrderPayment, refreshOrderPayment, type OrderQuote } from '../services/orderService';

interface CheckoutSidebarProps {
  open: boolean;
  onClose: () => void;
}

const CheckoutSidebar: React.FC<CheckoutSidebarProps> = ({ open, onClose }) => {
  const { user, isAuthenticated, setLoginModalOpen } = useAuth();
  const { cartItems, cartTotal, updateQuantity, removeFromCart, clearCart } = useCart();
  const [loading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'details' | 'payment' | 'processing' | 'success'>('cart');
  const paymentMethod = 'MPESA' as const;
  const [orderId, setOrderId] = useState('');
  const [quote, setQuote] = useState<OrderQuote | null>(null);
  const busy = useRef(false);
  const [skeletonActive, setSkeletonActive] = useState(false);

  // Form validation errors
  const [formErrors, setFormErrors] = useState({
    email: '',
    phone: '',
    address: '',
  });

  // Checkout form
  const [landmark, setLandmark] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    address: '',
  });

  // Form prefill from user
  useEffect(() => {
    if (user?.email) setFormData((prev) => ({ ...prev, email: user.email || '' }));
  }, [user?.email]);

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) removeFromCart(productId);
    else updateQuantity(productId, newQuantity);
  };

  const handleRemoveItem = (productId: string) => {
    removeFromCart(productId);
  };
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const fieldStyles = {
    '& .MuiInputBase-root': {
      borderRadius: 1.5,
      backgroundColor: 'background.paper',
    },
  };

  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      setLoginModalOpen(true);
      return;
    }
    setCheckoutStep('details');
  };

  // Validate form fields
  const validateForm = (): boolean => {
    const errors = {
      email: '',
      phone: '',
      address: '',
    };
    let isValid = true;

    // Email validation
    if (!formData.email) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email';
      isValid = false;
    }

    // Phone validation (Kenyan phone format)
    if (!formData.phone) {
      errors.phone = 'Phone number is required';
      isValid = false;
    } else if (!/^(?:\+254|254|0)?[17]\d{8}$/.test(formData.phone.replace(/\s/g, ''))) {
      errors.phone = 'Please enter a valid Kenyan phone number';
      isValid = false;
    }

    // Address validation
    if (!formData.address) {
      errors.address = 'Town or delivery location is required';
      isValid = false;
    } else if (formData.address.trim().length < 2 || !/\p{L}/u.test(formData.address)) {
      errors.address = 'Enter a town name or delivery location';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmitOrder = async () => {
    if (busy.current || !validateForm() || !user || !cartItems.length) return;
    busy.current = true;
    setProcessing(true); setError('');
    try {
      const result = await createOrderWithItems({ userId: user.uid, fullName: user.name || 'Customer',
        email: formData.email, phone: formData.phone, address: formData.address, landmark, paymentMethod,
        items: cartItems.map(({ productId, quantity }) => ({ productId, quantity })) });
      setQuote(result); setOrderId(result.orderId); setCheckoutStep('payment');
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not prepare your order. Please try again.'); }
    finally { busy.current = false; setProcessing(false); }
  };

  const checkPayment = async () => {
    if (busy.current) return;
    busy.current = true; setProcessing(true); setError('');
    try {
      const status = await refreshOrderPayment(orderId);
      if (status.paymentStatus === 'paid' && status.paymentVerified) {
        if (quote && cartItems.length === quote.items.length && quote.items.every(item => cartItems.some(cart => cart.productId === item.productId && cart.quantity === item.quantity))) clearCart();
        setCheckoutStep('success');
      } else setError(status.paymentStatus === 'failed' ? 'Payment was not completed. You can resume the same checkout from My Orders.' : 'Payment is awaiting confirmation. Your order is saved in My Orders.');
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not check payment. Your order is still saved.'); }
    finally { busy.current = false; setProcessing(false); }
  };

  const payOrder = async () => {
    if (busy.current) return;
    busy.current = true; setProcessing(true); setError('');
    try {
      const payment = await startOrderPayment(orderId);
      if (payment.url) window.location.assign(payment.url);
      else { busy.current = false; await checkPayment(); }
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not open payment. Check My Orders before trying again.'); }
    finally { busy.current = false; setProcessing(false); }
  };

  const renderCartContent = () => (
    <Box
      sx={{
        p: { xs: 2, sm: 3 },
        backgroundColor: 'background.paper',

      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Your Cart
        </Typography>
        <IconButton
          aria-label="Close cart"
          onClick={onClose}
          sx={{
            backgroundColor: '#F0F4F1',
            transition: 'transform 0.3s ease, background 0.3s ease',
            '&:hover': {
              backgroundColor: '#F0F4F1',
            },
          }}
        >
          <Close />
        </IconButton>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : skeletonActive && cartItems.length > 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[1, 2, 3].map((row) => (
            <Skeleton
              key={`cart-skeleton-${row}`}
              variant="rounded"
              height={70}
              animation="wave"
            />
          ))}
          <Skeleton variant="rounded" height={110} animation="wave" />
          <Skeleton variant="rounded" height={48} width="80%" animation="wave" />
          <Skeleton variant="rounded" height={48} width="60%" animation="wave" />
        </Box>
      ) : cartItems.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <ShoppingCartCheckout
            sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }}
          />
          <Typography variant="h6" color="text.secondary">
            You have nothing in cart
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Browse our shop and add some products!
          </Typography>
          <Button variant="contained" onClick={onClose} sx={{ mt: 1 }}>
            Continue Shopping
          </Button>
        </Box>
      ) : (
        <>
          <List
            sx={{
              maxHeight: '50vh',
              overflowY: 'auto',
              pr: 1,
              '&::-webkit-scrollbar': {
                width: 6,
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#F0F4F1',
                borderRadius: 99,
              },
            }}
          >
            <AnimatePresence>
              {cartItems.map((item) => (
                <motion.div
                  key={item.productId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <ListItem
                    sx={{
                      px: 0,
                      py: 2,
                      borderRadius: 2,
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        gap: { xs: 1.5, sm: 2 },
                        width: '100%',
                        alignItems: 'center',
                      }}
                    >
                      <Avatar
                        variant="rounded"
                        src={item.image}
                        sx={{
                          width: { xs: 48, sm: 60 },
                          height: { xs: 48, sm: 60 },
                          borderRadius: 2,
                          border: '1px solid #DDE5DF',
                        }}
                      />
                      <Box sx={{ flex: 1, minWidth: 0, overflowWrap: 'anywhere' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {item.name}
                        </Typography>
                        <Typography variant="body2" color="primary.main" sx={{ fontWeight: 600 }}>
                          {formatPrice(item.price)}
                        </Typography>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            mt: 1,
                          }}
                        >
                          <IconButton
                            size="small"
                            aria-label={`Decrease quantity of ${item.name}`}
                            onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                            sx={{
                              backgroundColor: '#F0F4F1',
                              width: 44,
                              height: 44,
                              '&:hover': {
                                backgroundColor: '#F0F4F1',
                              },
                            }}
                          >
                            <Remove fontSize="small" />
                          </IconButton>
                          <Typography variant="body2" sx={{ minWidth: 28, textAlign: 'center' }}>
                            {item.quantity}
                          </Typography>
                          <IconButton
                            size="small"
                            disabled={item.quantity >= Math.min(99, item.stock ?? 99)} aria-label={`Increase quantity of ${item.name}`}
                            onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                            sx={{
                              backgroundColor: '#F0F4F1',
                              width: 44,
                              height: 44,
                              '&:hover': {
                                backgroundColor: '#F0F4F1',
                              },
                            }}
                          >
                            <Add fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            aria-label={`Remove ${item.name} from cart`}
                            onClick={() => handleRemoveItem(item.productId)}
                            sx={{
                              ml: 'auto',
                              color: 'error.main',
                              borderRadius: 2,
                              '&:hover': {
                                backgroundColor: 'rgba(255, 99, 132, 0.15)',
                              },
                            }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    </Box>
                  </ListItem>
                  <Divider sx={{ borderColor: '#F0F4F1' }} />
                </motion.div>
              ))}
            </AnimatePresence>
          </List>

          <Box
            sx={{
              mt: 3,
              px: 2,
              py: 2.5,
              borderRadius: 3,
              background: '#F0F6F2',
              border: '1px solid #DDE5DF',

            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, mb: 1 }}>
              <Typography variant="body1">Subtotal:</Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {formatPrice(cartTotal)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Shipping:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Calculated at checkout
              </Typography>
            </Box>
            <Divider sx={{ borderColor: '#F0F4F1', mb: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              <Typography variant="h6">Total:</Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
                {formatPrice(cartTotal)}
              </Typography>
            </Box>
            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={<ShoppingCartCheckout />}
              onClick={handleProceedToCheckout}
              sx={{
                py: 1.5,
              }}
            >
              Proceed to Checkout
            </Button>
          </Box>
        </>
      )}
    </Box>
  );

  const renderDetailsForm = () => (
    <Box
      sx={{
        p: { xs: 2, sm: 3 },
        backgroundColor: 'background.paper',

      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Checkout Details
        </Typography>
        <IconButton aria-label="Close checkout" onClick={onClose}>
          <Close />
        </IconButton>
      </Box>

      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 2,
            boxShadow: 'none',
          }}
        >
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          value={formData.email}
          onChange={(e) => {
            setFormData({ ...formData, email: e.target.value });
            if (formErrors.email) setFormErrors(prev => ({ ...prev, email: '' }));
          }}
          onBlur={() => {
            if (!formData.email) {
              setFormErrors(prev => ({ ...prev, email: 'Email is required' }));
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
              setFormErrors(prev => ({ ...prev, email: 'Please enter a valid email' }));
            }
          }}
          fullWidth
          required
          error={!!formErrors.email}
          helperText={formErrors.email}
          sx={fieldStyles}
        />
        <TextField
          label="Phone Number"
          type="tel"
          autoComplete="tel"
          value={formData.phone}
          onChange={(e) => {
            setFormData({ ...formData, phone: e.target.value });
            if (formErrors.phone) setFormErrors(prev => ({ ...prev, phone: '' }));
          }}
          onBlur={() => {
            if (!formData.phone) {
              setFormErrors(prev => ({ ...prev, phone: 'Phone number is required' }));
            } else if (!/^(?:\+254|254|0)?[17]\d{8}$/.test(formData.phone.replace(/\s/g, ''))) {
              setFormErrors(prev => ({ ...prev, phone: 'Please enter a valid Kenyan phone number' }));
            }
          }}
          fullWidth
          required
          error={!!formErrors.phone}
          helperText={formErrors.phone || 'Use your M-Pesa or contact number'}
          sx={fieldStyles}
          placeholder="2547XX XXX XXX"
        />
        <TextField
          label="Town or delivery location"
          autoComplete="street-address"
          value={formData.address}
          onChange={(e) => {
            setFormData({ ...formData, address: e.target.value });
            if (formErrors.address) setFormErrors(prev => ({ ...prev, address: '' }));
          }}
          onBlur={() => {
            if (!formData.address) {
              setFormErrors(prev => ({ ...prev, address: 'Town or delivery location is required' }));
            } else if (formData.address.trim().length < 2 || !/\p{L}/u.test(formData.address)) {
              setFormErrors(prev => ({ ...prev, address: 'Enter a town name or delivery location' }));
            }
          }}
          fullWidth
          required
          error={!!formErrors.address}
          helperText={formErrors.address || 'Town or nearby town, e.g. Voi, Embu or Thika. Add a landmark if helpful.'}
          sx={fieldStyles}
          multiline
          rows={3}
        />
      </Box>

<TextField fullWidth label="Landmark (optional)" value={landmark} onChange={e => setLandmark(e.target.value)} sx={{ mt: 2 }} inputProps={{ maxLength: 300 }} />
      <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>Payment method</Typography>
      <Box sx={{ p: 2, borderRadius: 3, border: '2px solid', borderColor: 'primary.main', backgroundColor: '#EAF5EE' }}>
        <Typography fontWeight={700}>M-Pesa (STK Push)</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Use the M-Pesa phone number above. Approve the payment on your phone; never enter your M-Pesa PIN on this website.
        </Typography>
      </Box>

      {/* Order Summary */}
      <Box
        sx={{
          mt: 3,
          p: 3,
          borderRadius: 3,
          background: '#F0F6F2',
          border: '1px solid #DDE5DF',
          boxShadow: 'none',

        }}
      >
        <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
          Order Summary:
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
          {formatPrice(cartTotal)}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {cartItems.length} item(s)
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1.5, mt: 3 }}>
        <Button
          variant="outlined"
          onClick={() => setCheckoutStep('cart')}
          sx={{
            flex: 1,
            borderColor: '#F0F4F1',
            color: 'primary.main',
          }}
        >
          Back to Cart
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmitOrder}
          disabled={processing || !formData.phone || !formData.address}
          sx={{
            flex: 1,
            py: 1.5,
            boxShadow: 'none',
          }}
        >
          {processing ? <CircularProgress size={24} /> : 'Review Order'}
        </Button>
      </Box>

    </Box>
  );

  const renderPayment = () => (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">Review your order</Typography>
        <IconButton aria-label="Close checkout" onClick={onClose}><Close /></IconButton>
      </Box>
      {error && <Alert severity="info" sx={{ mb: 2 }}>{error}</Alert>}
      {quote?.paymentEnvironment === 'sandbox' && <Alert severity="warning" sx={{ mb: 2 }}>Test checkout — this is not a live order for delivery.</Alert>}
      {quote?.items.map(item => <Box key={item.productId} sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mb: 2 }}>
        <Typography>{item.quantity} × {item.name}</Typography><Typography sx={{ whiteSpace: 'nowrap' }}>{formatPrice(item.total)}</Typography>
      </Box>)}
      <Divider sx={{ my: 2 }} />
      <Typography>Subtotal: {formatPrice(quote?.subtotal || 0)}</Typography>
      <Typography sx={{ mt: 1 }}>Delivery: {formatPrice(quote?.shippingFee || 0)}</Typography>
      <Typography variant="h5" sx={{ my: 2 }}>Total: {formatPrice(quote?.totalAmount || 0)}</Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>Review the confirmed prices and delivery charge. Continue to the secure M-Pesa checkout to request the phone prompt. Your order stays available in My Orders.</Typography>
      <Button fullWidth variant="contained" disabled={processing} onClick={payOrder} sx={{ mb: 1.5 }}>{processing ? 'Please wait…' : 'Continue to M-Pesa'}</Button>
      <Button fullWidth disabled={processing} onClick={checkPayment}>Check payment status</Button>
      <Button fullWidth component={RouterLink} to="/profile" onClick={onClose}>My Orders</Button>
      <Button fullWidth disabled={processing} onClick={() => setCheckoutStep('details')}>Edit order details</Button>
    </Box>
  );

  const renderSuccess = () => (
    <Box
      sx={{
        p: 3,
        textAlign: 'center',
        borderRadius: 3,
        border: '1px solid #DDE5DF',
        background:
          '#F0F6F2',
        boxShadow: 'none',

      }}
    >
      <Box
        sx={{
          width: 88,
          height: 88,
          borderRadius: '50%',
          background: '#EAF5EE',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mx: 'auto',
          mb: 3,
          boxShadow: 'none',
        }}
      >
        <Typography variant="h3" sx={{ color: 'primary.main' }}>
          ✓
        </Typography>
      </Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
        Payment confirmed
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Order ID: {orderId}
      </Typography>
      <Alert
        severity="success"
        sx={{
          mb: 3,
          textAlign: 'left',
          boxShadow: 'none',
          border: '1px solid #DDE5DF',
        }}
      >
        {quote?.paymentEnvironment === 'sandbox' ? 'Test payment confirmed. No delivery will be arranged.' : 'Thank you! Your payment is verified and your order is ready for the shop to fulfil.'}
      </Alert>
      <Button
        variant="contained"
        onClick={onClose}
        fullWidth
        sx={{ py: 1.5, boxShadow: 'none' }}
      >
        Continue Shopping
      </Button>
    </Box>
  );

  const renderContent = () => {
    switch (checkoutStep) {
      case 'cart':
        return renderCartContent();
      case 'details':
        return renderDetailsForm();
      case 'payment':
      case 'processing':
        return renderPayment();
      case 'success':
        return renderSuccess();
      default:
        return renderCartContent();
    }
  };

  // Reset checkout step when drawer opens
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (open) {
      setCheckoutStep('cart');
      setError('');
      if (cartItems.length > 0) {
        setSkeletonActive(true);
        timer = setTimeout(() => setSkeletonActive(false), 900);
      } else {
        setSkeletonActive(false);
      }
    } else {
      setSkeletonActive(false);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  // Cart changes must not dismiss an active payment or its confirmation.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Drawer
      anchor="right"
      sx={{ zIndex: (theme) => theme.zIndex.drawer + 4 }}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 450 },
          maxWidth: '100vw',
          backgroundColor: 'background.paper',
          color: 'text.primary',
          borderLeft: '1px solid #DDE5DF',
          boxShadow: '-8px 0 32px rgba(16,32,24,0.12)',

        },
      }}
    >
      <Box
        sx={{
          minHeight: '100%',
          overflowY: 'auto',
          overflowX: 'hidden',
          backgroundColor: 'background.paper',
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={checkoutStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </Box>
    </Drawer>
  );
};

export default CheckoutSidebar;
