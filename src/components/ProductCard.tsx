import { Card, CardActionArea, CardContent, Typography, Box, Chip, Stack } from '@mui/material';
import ArrowForward from '@mui/icons-material/ArrowForward';
import { Link as RouterLink } from 'react-router-dom';
import type { Product } from '../data/products';
import ProductActions from './ProductActions';
import ProductImage from './ProductImage';

interface ProductCardProps {
  product: Product;
  onOrder?: (product: Product) => void;
}

export default function ProductCard({ product, onOrder }: ProductCardProps) {
  return (
    <Card component="article" sx={{ height: '100%', display: 'flex', flexDirection: 'column', minWidth: 0,
      transition: 'border-color 160ms ease', '&:hover': { borderColor: 'primary.main' } }}>
      <CardActionArea component={RouterLink} to={`/shop/${product.slug || product.id}`} aria-label={`View ${product.name}`}
        sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch', justifyContent: 'flex-start',
          '&.Mui-focusVisible': { outline: '3px solid', outlineColor: 'primary.main', outlineOffset: -3 } }}>
        <Box sx={{ position: 'relative', bgcolor: '#F0F4F1' }}>
          <ProductImage product={product} />
          <Chip label={product.inStock === false ? 'Unavailable' : product.inStock ? 'In stock' : 'Check availability'} size="small"
            sx={{ position: 'absolute', top: 12, left: 12, bgcolor: 'background.paper', color: 'text.primary', fontWeight: 600 }} />
        </Box>
        <CardContent sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column', width: '100%', '&:last-child': { pb: 2.5 } }}>
          <Typography variant="overline" sx={{ color: 'primary.dark', fontSize: '0.7rem', letterSpacing: '0.07em', lineHeight: 1.5, mb: 1 }}>
            {product.category}
          </Typography>
          <Typography component="h3" variant="h6" sx={{ fontWeight: 700, lineHeight: 1.4, mb: 1, fontSize: '1.125rem' }}>
            {product.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {product.description}
          </Typography>
          <Stack spacing={1} sx={{ mt: 'auto' }}>
            <Typography component="p" sx={{ fontWeight: 800, fontSize: '1.35rem', fontVariantNumeric: 'tabular-nums' }}>
              KES {product.price.toLocaleString('en-KE')}
            </Typography>
            {product.comparisonPrice && product.comparisonPrice > product.price ? <Typography component="del" variant="body2" color="text.secondary">KES {product.comparisonPrice.toLocaleString('en-KE')}</Typography> : null}
            <Typography component="span" variant="body2" sx={{ color: 'primary.dark', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
              View product <ArrowForward sx={{ fontSize: 18 }} />
            </Typography>
          </Stack>
        </CardContent>
      </CardActionArea>
      <Box sx={{ p: 2.5, pt: 0 }}>
        <Box sx={{ pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <ProductActions product={product} onOrder={onOrder} />
        </Box>
      </Box>
    </Card>
  );
}
