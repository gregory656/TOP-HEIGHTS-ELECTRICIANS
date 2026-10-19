import { useState } from 'react';
import { Alert, Button, Snackbar, Stack } from '@mui/material';
import AddShoppingCart from '@mui/icons-material/AddShoppingCart';
import WhatsApp from '@mui/icons-material/WhatsApp';
import type { Product } from '../data/products';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../context/CartContext';
import { orderViaWhatsApp } from '../services/whatsappService';
import LoginRequiredDialog from './LoginRequiredDialog';

interface ProductActionsProps {
  product: Product;
  quantity?: number;
  onOrder?: (product: Product) => void;
}

export default function ProductActions({ product, quantity = 1, onOrder }: ProductActionsProps) {
  const { user, isAuthenticated, setLoginModalOpen } = useAuth();
  const { addToCart, cartItems } = useCart();
  const [error, setError] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [loginRequiredOpen, setLoginRequiredOpen] = useState(false);

  const openLogin = () => {
    setLoginRequiredOpen(false);
    setLoginModalOpen(true);
  };
  const openWhatsApp = () => {
    setLoginRequiredOpen(false);
    orderViaWhatsApp(product, quantity);
  };
  const handleAddToCart = () => {
    setError('');
    if (product.inStock === false) return;
    if (!isAuthenticated || !user) {
      setLoginRequiredOpen(true);
      return;
    }
    if ((cartItems.find(item => item.productId === String(product.id))?.quantity || 0) + quantity > Math.min(99, product.stock ?? 99)) {
      setError('Your cart already contains the available quantity.'); setSnackbarOpen(true); return;
    }
    addToCart(product, quantity);
    setSnackbarOpen(true);
  };

  return (
    <>
      <Stack spacing={1}>
        <Button fullWidth variant="contained" startIcon={<AddShoppingCart />} onClick={handleAddToCart} disabled={product.inStock === false}>
          Add to cart
        </Button>
        <Button fullWidth variant="outlined" startIcon={<WhatsApp />} onClick={openWhatsApp}>Enquire on WhatsApp</Button>
        {onOrder && <Button size="small" onClick={() => onOrder(product)}>Request an order</Button>}
      </Stack>
      <LoginRequiredDialog open={loginRequiredOpen} onClose={() => setLoginRequiredOpen(false)}
        onLogin={openLogin} onSignup={openLogin} onWhatsApp={openWhatsApp} />
      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={() => setSnackbarOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setSnackbarOpen(false)} severity={error ? 'warning' : 'success'}>{error || `${product.name} added to cart.`}</Alert>
      </Snackbar>
    </>
  );
}
