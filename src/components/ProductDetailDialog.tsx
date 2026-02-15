// src/components/ProductDetailDialog.tsx
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
  Chip,
  Grid,
  Divider,
} from '@mui/material';
import {
  Close,
  WhatsApp,
  ShoppingCart,
  CheckCircle,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

interface ProductDetailDialogProps {
  open: boolean;
  onClose: () => void;
  product: {
    id: number;
    name: string;
    price: number;
    category: string;
    image: string;
    description?: string;
    inStock?: boolean;
    size?: string;
    color?: string;
  } | null;
  onAddToCart?: () => void;
}

const ProductDetailDialog: React.FC<ProductDetailDialogProps> = ({ open, onClose, product, onAddToCart }) => {
  const { isAuthenticated, loginModalOpen, setLoginModalOpen } = useAuth();

  if (!product) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }).format(price);
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      onClose();
      setLoginModalOpen(true);
      return;
    }
    onAddToCart?.();
  };

  const handleWhatsAppOrder = () => {
    const message = `Order Inquiry: ${product.name} - ${product.size || 'N/A'} - ${formatPrice(product.price)}`;
    const phoneNumber = '254711343412';
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <AnimatePresence>
      {open && (
        <Dialog
          open={open}
          onClose={onClose}
          maxWidth="md"
          fullWidth
          PaperProps={{
            component: motion.div,
            initial: { opacity: 0, scale: 0.9, y: 20 },
            animate: { opacity: 1, scale: 1, y: 0 },
            exit: { opacity: 0, scale: 0.9, y: 20 },
            transition: { duration: 0.3 },
          }}
        >
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip label={product.category} size="small" sx={{ backgroundColor: 'rgba(100, 255, 218, 0.15)', color: 'primary.main' }} />
              <Typography variant="h5" component="h2" sx={{ color: 'text.primary', fontWeight: 600 }}>
                {product.name}
              </Typography>
            </Box>
            <IconButton onClick={onClose} sx={{ color: 'text.secondary' }}>
              <Close />
            </IconButton>
          </DialogTitle>

          <DialogContent sx={{ p: 0 }}>
            <Grid container>
              <Grid size={{ xs: 12, md: 6 }}>
                <Box
                  component="img"
                  src={product.image}
                  alt={product.name}
                  sx={{ width: '100%', height: { xs: 250, md: 400 }, objectFit: 'cover' }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }} sx={{ p: 3 }}>
                <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 700, mb: 2 }}>
                  {formatPrice(product.price)}
                </Typography>

                {product.inStock !== false && (
                  <Chip
                    icon={<CheckCircle sx={{ fontSize: 16 }} />}
                    label="In Stock"
                    size="small"
                    sx={{ mb: 3, backgroundColor: 'rgba(100, 255, 218, 0.15)', color: 'success.main' }}
                  />
                )}

                {product.description && (
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3, lineHeight: 1.8 }}>
                    {product.description}
                  </Typography>
                )}

                <Divider sx={{ my: 2, borderColor: 'rgba(100, 255, 218, 0.1)' }} />

                <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1 }}>
                  Specifications
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
                  {product.size && (
                    <Chip label={`Size: ${product.size}`} size="small" variant="outlined" />
                  )}
                  {product.color && (
                    <Chip label={`Color: ${product.color}`} size="small" variant="outlined" />
                  )}
                  <Chip label={`Category: ${product.category}`} size="small" variant="outlined" />
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Free shipping within Nairobi. 30-day return policy on all electrical products.
                </Typography>
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(100, 255, 218, 0.1)' }}>
            <Button
              variant="outlined"
              startIcon={<WhatsApp />}
              onClick={handleWhatsAppOrder}
              sx={{ px: 3 }}
            >
              Order via WhatsApp
            </Button>
            <Button
              variant="contained"
              startIcon={<ShoppingCart />}
              onClick={handleAddToCart}
              sx={{ px: 3 }}
            >
              Add to Cart
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </AnimatePresence>
  );
};

export default ProductDetailDialog;
