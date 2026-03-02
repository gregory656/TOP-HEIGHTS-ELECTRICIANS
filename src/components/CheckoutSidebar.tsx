// src/components/CheckoutSidebar.tsx
import React, { useState, useEffect } from 'react';
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
  FormControlLabel,
  Radio,
  RadioGroup,
} from '@mui/material';
import {
  Close,
  Delete,
  Add,
  Remove,
  ShoppingCartCheckout,
  AccountBalance,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { 
  type CartItem, 
  subscribeToCart, 
  updateCartItemQuantity, 
  removeFromCart, 
  calculateCartTotal,
  clearCart 
} from '../services/cartService';
import { 
  createOrder, 
  initiateSTKPush, 
  pollPaymentStatus 
} from '../services/orderService';

interface CheckoutSidebarProps {
  open: boolean;
  onClose: () => void;
}

const CheckoutSidebar: React.FC<CheckoutSidebarProps> = ({ open, onClose }) => {
  const { user, isAuthenticated, setLoginModalOpen } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'details' | 'payment' | 'processing' | 'success'>('cart');
  const [paymentMethod, setPaymentMethod] = useState<'MPESA' | 'INTASEND'>('INTASEND');
  const [orderId, setOrderId] = useState('');
  
  // Form validation errors
  const [formErrors, setFormErrors] = useState({
    email: '',
    phone: '',
    address: '',
  });
  
  // Checkout form
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    address: '',
  });

  // Subscribe to cart changes
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setCartItems([]);
      setLoading(false);
      return;
    }

    setFormData(prev => ({ ...prev, email: user.email || '' }));

    const unsubscribe = subscribeToCart(user.uid, (items) => {
      setCartItems(items);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isAuthenticated, user]);

  const handleQuantityChange = async (productId: number, newQuantity: number) => {
    if (!user) return;
    if (newQuantity < 1) {
      await removeFromCart(user.uid, productId);
    } else {
      await updateCartItemQuantity(user.uid, productId, newQuantity);
    }
  };

  const handleRemoveItem = async (productId: number) => {
    if (!user) return;
    await removeFromCart(user.uid, productId);
  };

  const cartTotal = calculateCartTotal(cartItems);
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(price);
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
    } else if (!/^(?:\+254|254|0)?[7]\d{8}$/.test(formData.phone.replace(/\s/g, ''))) {
      errors.phone = 'Please enter a valid Kenyan phone number';
      isValid = false;
    }

    // Address validation
    if (!formData.address) {
      errors.address = 'Delivery address is required';
      isValid = false;
    } else if (formData.address.length < 10) {
      errors.address = 'Please enter a complete address';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmitOrder = async () => {
    // Validate form first
    if (!validateForm()) {
      setError('Please fix the errors in the form');
      return;
    }

    if (!user || cartItems.length === 0) {
      setError('Your cart is empty or you are not logged in');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      // Create order in Firestore
      const newOrderId = await createOrder({
        userId: user.uid,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        items: cartItems,
        totalAmount: cartTotal,
        paymentMethod: paymentMethod,
        paymentStatus: 'pending',
        orderStatus: 'pending',
      });

      setOrderId(newOrderId);

      if (paymentMethod === 'MPESA' || paymentMethod === 'INTASEND') {
        setCheckoutStep('processing');
        
        // Initiate STK Push
        try {
          const { checkoutId } = await initiateSTKPush(
            newOrderId,
            formData.phone,
            cartTotal,
            formData.email
          );

          // Poll for payment status
          const paymentSuccess = await pollPaymentStatus(
            checkoutId,
            newOrderId,
            (status) => {
              console.log('Payment status:', status);
            }
          );

          if (paymentSuccess) {
            setCheckoutStep('success');
            // Clear cart after successful payment
            await clearCart(user.uid);
          } else {
            setError('Payment was not completed. Please try again or contact support.');
            setCheckoutStep('details');
          }
        } catch (stkError) {
          console.error('STK Push error:', stkError);
          // If STK fails, order is still created with pending payment
          // User can pay later via other means
          setError('STK Push failed to initiate. Your order has been created. We will contact you for payment.');
          setCheckoutStep('success');
          await clearCart(user.uid);
        }
      } else {
        // For other payment methods, show success immediately
        setCheckoutStep('success');
        await clearCart(user.uid);
      }
    } catch (err) {
      console.error('Order creation error:', err);
      setError('Failed to create order. Please try again.');
      setCheckoutStep('details');
    } finally {
      setProcessing(false);
    }
  };

  const renderCartContent = () => (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Your Cart
        </Typography>
        <IconButton onClick={onClose}>
          <Close />
        </IconButton>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : cartItems.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <ShoppingCartCheckout sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            You have nothing in cart
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Browse our shop and add some products!
          </Typography>
          <Button variant="contained" onClick={onClose}>
            Continue Shopping
          </Button>
        </Box>
      ) : (
        <>
          {/* Cart Items */}
          <List sx={{ maxHeight: '50vh', overflow: 'auto' }}>
            <AnimatePresence>
              {cartItems.map((item) => (
                <motion.div
                  key={item.productId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <ListItem sx={{ px: 0, py: 2 }}>
                    <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
                      <Avatar
                        variant="rounded"
                        src={item.image}
                        sx={{ width: 60, height: 60 }}
                      />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {item.name}
                        </Typography>
                        <Typography variant="body2" color="primary.main" sx={{ fontWeight: 600 }}>
                          {formatPrice(item.price)}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                          <IconButton
                            size="small"
                            onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                            sx={{ 
                              backgroundColor: 'rgba(100, 255, 218, 0.1)',
                              width: 28,
                              height: 28,
                            }}
                          >
                            <Remove fontSize="small" />
                          </IconButton>
                          <Typography variant="body2" sx={{ minWidth: 20, textAlign: 'center' }}>
                            {item.quantity}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                            sx={{ 
                              backgroundColor: 'rgba(100, 255, 218, 0.1)',
                              width: 28,
                              height: 28,
                            }}
                          >
                            <Add fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveItem(item.productId)}
                            sx={{ ml: 'auto', color: 'error.main' }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    </Box>
                  </ListItem>
                  <Divider sx={{ borderColor: 'rgba(100, 255, 218, 0.1)' }} />
                </motion.div>
              ))}
            </AnimatePresence>
          </List>

          {/* Total */}
          <Box sx={{ mt: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body1">Subtotal:</Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {formatPrice(cartTotal)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="body2" color="text.secondary">Shipping:</Typography>
              <Typography variant="body2" color="text.secondary">Calculated at checkout</Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
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
              sx={{ py: 1.5 }}
            >
              Proceed to Checkout
            </Button>
          </Box>
        </>
      )}
    </Box>
  );

  const renderDetailsForm = () => (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Checkout Details
        </Typography>
        <IconButton onClick={onClose}>
          <Close />
        </IconButton>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Email"
          type="email"
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
        />
        <TextField
          label="Phone Number"
          value={formData.phone}
          onChange={(e) => {
            setFormData({ ...formData, phone: e.target.value });
            if (formErrors.phone) setFormErrors(prev => ({ ...prev, phone: '' }));
          }}
          onBlur={() => {
            if (!formData.phone) {
              setFormErrors(prev => ({ ...prev, phone: 'Phone number is required' }));
            } else if (!/^(?:\+254|254|0)?[7]\d{8}$/.test(formData.phone.replace(/\s/g, ''))) {
              setFormErrors(prev => ({ ...prev, phone: 'Please enter a valid Kenyan phone number' }));
            }
          }}
          fullWidth
          required
          error={!!formErrors.phone}
          helperText={formErrors.phone || 'Required for M-Pesa STK Push'}
          placeholder="2547XX XXX XXX"
        />
        <TextField
          label="Delivery Address"
          value={formData.address}
          onChange={(e) => {
            setFormData({ ...formData, address: e.target.value });
            if (formErrors.address) setFormErrors(prev => ({ ...prev, address: '' }));
          }}
          onBlur={() => {
            if (!formData.address) {
              setFormErrors(prev => ({ ...prev, address: 'Delivery address is required' }));
            } else if (formData.address.length < 10) {
              setFormErrors(prev => ({ ...prev, address: 'Please enter a complete address' }));
            }
          }}
          fullWidth
          required
          error={!!formErrors.address}
          helperText={formErrors.address}
          multiline
          rows={3}
        />
      </Box>

      {/* Payment Method Selection */}
      <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
        Payment Method
      </Typography>
      <RadioGroup
        value={paymentMethod}
        onChange={(e) => setPaymentMethod(e.target.value as 'MPESA' | 'INTASEND')}
      >
        <Box sx={{ 
          p: 2, 
          mb: 2, 
          borderRadius: 2, 
          border: paymentMethod === 'MPESA' ? '2px solid' : '1px solid',
          borderColor: paymentMethod === 'MPESA' ? 'primary.main' : 'rgba(100, 255, 218, 0.2)',
          backgroundColor: paymentMethod === 'MPESA' ? 'rgba(100, 255, 218, 0.05)' : 'transparent',
        }}>
          <FormControlLabel
            value="MPESA"
            control={<Radio />}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box 
                  component="img"
                  src="https://upload.wikimedia.org/wikipedia/commons/1/15/M-Pesa_%28USSD%29.png"
                  sx={{ height: 24, width: 'auto' }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <Typography>M-Pesa (STK Push)</Typography>
              </Box>
            }
          />
          <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
            Pay instantly via M-Pesa STK Push
          </Typography>
        </Box>

        <Box sx={{ 
          p: 2, 
          borderRadius: 2, 
          border: paymentMethod === 'INTASEND' ? '2px solid' : '1px solid',
          borderColor: paymentMethod === 'INTASEND' ? 'primary.main' : 'rgba(100, 255, 218, 0.2)',
          backgroundColor: paymentMethod === 'INTASEND' ? 'rgba(100, 255, 218, 0.05)' : 'transparent',
        }}>
          <FormControlLabel
            value="INTASEND"
            control={<Radio />}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccountBalance sx={{ color: 'primary.main' }} />
                <Typography>IntaSend</Typography>
              </Box>
            }
          />
          <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
            Pay via IntaSend (Card, M-Pesa, Bank)
          </Typography>
        </Box>
      </RadioGroup>

      {/* Order Summary */}
      <Box sx={{ mt: 3, p: 2, borderRadius: 2, backgroundColor: 'rgba(100, 255, 218, 0.05)' }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>Order Summary:</Typography>
        <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
          {formatPrice(cartTotal)}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {cartItems.length} item(s)
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
        <Button
          variant="outlined"
          onClick={() => setCheckoutStep('cart')}
          sx={{ flex: 1 }}
        >
          Back to Cart
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmitOrder}
          disabled={processing || !formData.phone || !formData.address}
          sx={{ flex: 1 }}
        >
          {processing ? <CircularProgress size={24} /> : 'Place Order'}
        </Button>
      </Box>
    </Box>
  );

  const renderProcessing = () => (
    <Box sx={{ p: 3, textAlign: 'center' }}>
      <CircularProgress sx={{ mb: 3 }} />
      <Typography variant="h6" sx={{ mb: 1 }}>
        Processing Payment...
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Please check your phone for the M-Pesa STK push prompt
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Enter your PIN to complete payment
      </Typography>
    </Box>
  );

  const renderSuccess = () => (
    <Box sx={{ p: 3, textAlign: 'center' }}>
      <Box sx={{ 
        width: 80, 
        height: 80, 
        borderRadius: '50%', 
        backgroundColor: 'rgba(100, 255, 218, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        mx: 'auto',
        mb: 3
      }}>
        <Typography variant="h3">✓</Typography>
      </Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
        Order Placed Successfully!
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Order ID: {orderId}
      </Typography>
      <Alert severity="success" sx={{ mb: 3, textAlign: 'left' }}>
        Thank you for your order! We will contact you shortly to confirm delivery.
      </Alert>
      <Button variant="contained" onClick={onClose} fullWidth>
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
      case 'processing':
        return renderProcessing();
      case 'success':
        return renderSuccess();
      default:
        return renderCartContent();
    }
  };

  // Reset checkout step when drawer opens
  useEffect(() => {
    if (open) {
      setCheckoutStep('cart');
      setError('');
    }
  }, [open]);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 450 },
          backgroundColor: '#112240',
          borderLeft: '1px solid rgba(100, 255, 218, 0.1)',
        },
      }}
    >
      <Box
        sx={{
          height: '100%',
          overflow: 'auto',
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
