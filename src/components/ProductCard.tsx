// src/components/ProductCard.tsx
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Button,
  Chip,
  IconButton,
  CardActionArea,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  ShoppingCart,
  Favorite,
  FavoriteBorder,
  AddShoppingCart,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import type { Product } from '../data/products';
import { useAuth } from '../hooks/useAuth';
import { addToCart } from '../services/cartService';

interface ProductCardProps {
  product: Product;
  onOrder: (product: Product) => void;
  onFavorite?: (id: number) => void;
  isFavorite?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onOrder,
  onFavorite,
  isFavorite = false,
}) => {
  const { user, isAuthenticated, setLoginModalOpen } = useAuth();
  const [hovered, setHovered] = useState(false);
  const [localFavorite, setLocalFavorite] = useState(isFavorite);
  const [addingToCart, setAddingToCart] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLocalFavorite(!localFavorite);
    onFavorite?.(product.id);
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!isAuthenticated || !user) {
      setLoginModalOpen(true);
      return;
    }

    setAddingToCart(true);
    try {
      await addToCart(user.uid, product, 1);
      setSnackbar({ 
        open: true, 
        message: `${product.name} added to cart!`, 
        severity: 'success' 
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      setSnackbar({ 
        open: true, 
        message: 'Failed to add to cart', 
        severity: 'error' 
      });
    }
    setAddingToCart(false);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -8 }}
        transition={{ duration: 0.3 }}
      >
        <Card
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(135deg, rgba(100, 255, 218, 0.1) 0%, rgba(100, 181, 246, 0.05) 100%)',
              opacity: hovered ? 1 : 0,
              transition: 'opacity 0.3s ease',
              pointerEvents: 'none',
              zIndex: 0,
            },
            '&:hover': {
              transform: 'translateY(-8px)',
              boxShadow: '0 20px 40px rgba(100, 255, 218, 0.15)',
              '& .product-image': {
                transform: 'scale(1.1)',
              },
              '& .order-button': {
                opacity: 1,
                transform: 'translateY(0)',
              },
              '& .favorite-button': {
                opacity: 1,
                transform: 'translateX(0)',
              },
            },
          }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <CardActionArea>
            <Box sx={{ position: 'relative', overflow: 'hidden' }}>
              <CardMedia
                component="img"
                className="product-image"
                height="200"
                image={product.image}
                alt={product.name}
                sx={{
                  objectFit: 'cover',
                  transition: 'transform 0.5s ease',
                }}
              />
              
              {/* Favorite Button */}
              <IconButton
                className="favorite-button"
                onClick={handleFavoriteClick}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  backgroundColor: 'rgba(17, 32, 64, 0.8)',
                  backdropFilter: 'blur(8px)',
                  color: localFavorite ? 'error.main' : 'text.secondary',
                  opacity: 0,
                  transform: 'translateX(20px)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(17, 32, 64, 0.9)',
                    color: localFavorite ? 'error.main' : 'primary.main',
                  },
                }}
              >
                {localFavorite ? <Favorite /> : <FavoriteBorder />}
              </IconButton>

              {/* Stock Badge */}
              {product.inStock !== false && (
                <Chip
                  label="In Stock"
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    backgroundColor: 'rgba(100, 255, 218, 0.15)',
                    color: 'primary.main',
                    fontWeight: 600,
                    fontSize: '0.7rem',
                    border: '1px solid rgba(100, 255, 218, 0.3)',
                  }}
                />
              )}
            </Box>
          </CardActionArea>

          <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
            <Chip
              label={product.category}
              size="small"
              sx={{
                alignSelf: 'flex-start',
                backgroundColor: 'rgba(100, 181, 246, 0.1)',
                color: 'secondary.main',
                fontSize: '0.7rem',
                mb: 1,
              }}
            />

            <Typography
              variant="h6"
              component="h3"
              sx={{
                fontWeight: 600,
                mb: 1,
                fontSize: { xs: '1rem', sm: '1.1rem' },
                lineHeight: 1.3,
              }}
            >
              {product.name}
            </Typography>

            {product.description && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mb: 2,
                  flexGrow: 1,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {product.description}
              </Typography>
            )}

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mt: 'auto',
              }}
            >
              <Box>
                <Typography
                  variant="h5"
                  sx={{
                    color: 'primary.main',
                    fontWeight: 700,
                    fontSize: { xs: '1.3rem', sm: '1.5rem' },
                  }}
                >
                  {formatPrice(product.price)}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block' }}
                >
                  KES
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 1 }}>
                {/* Add to Cart Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileHover={{ scale: 1.05 }}
                  style={{
                    opacity: hovered ? 1 : 1,
                    transform: hovered ? 'translateY(0)' : 'translateY(10px)',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<AddShoppingCart />}
                    onClick={handleAddToCart}
                    disabled={addingToCart}
                    className="order-button"
                    sx={{
                      borderRadius: 2,
                      px: 1.5,
                      minWidth: 'auto',
                      backgroundColor: 'secondary.main',
                      '&:hover': {
                        backgroundColor: 'secondary.dark',
                      },
                    }}
                  >
                    Cart
                  </Button>
                </motion.div>

                {/* Order Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileHover={{ scale: 1.05 }}
                  style={{
                    opacity: hovered ? 1 : 1,
                    transform: hovered ? 'translateY(0)' : 'translateY(10px)',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<ShoppingCart />}
                    onClick={() => onOrder(product)}
                    className="order-button"
                    sx={{
                      borderRadius: 2,
                      px: 2,
                    }}
                  >
                    Order
                  </Button>
                </motion.div>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </motion.div>

      {/* Snackbar for cart feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ProductCard;
