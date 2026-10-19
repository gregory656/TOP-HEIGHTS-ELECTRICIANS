import { useEffect, useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { Box, Breadcrumbs, Button, Chip, Container, Divider, Grid, IconButton, Link, Paper, Stack, Typography } from '@mui/material';
import Add from '@mui/icons-material/Add';
import Remove from '@mui/icons-material/Remove';
import ArrowBack from '@mui/icons-material/ArrowBack';
import type { Product } from '../data/products';
import { useProducts } from '../hooks/useProducts';
import PageMeta from '../components/PageMeta';
import ProductActions from '../components/ProductActions';
import ProductCard from '../components/ProductCard';
import ProductImage from '../components/ProductImage';
import Footer from '../components/Footer';

function ProductContent({ product, products }: { product: Product; products: Product[] }) {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(product.image);
  const sameCategory = products.filter((item) => item.id !== product.id && item.category === product.category);
  const suggestions = (sameCategory.length ? sameCategory : products.filter((item) => item.id !== product.id)).slice(0, 3);

  return (
    <>
      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
        <Breadcrumbs aria-label="Breadcrumb" sx={{ mb: 3, '& .MuiBreadcrumbs-li': { overflowWrap: 'anywhere' } }}>
          <Link component={RouterLink} to="/shop" color="text.secondary" underline="hover">Solar shop</Link>
          <Typography color="text.primary" aria-current="page">{product.name}</Typography>
        </Breadcrumbs>
        <Grid container spacing={{ xs: 3, md: 5 }}>
          <Grid size={{ xs: 12, md: 7 }} sx={{ minWidth: 0 }}>
            <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, bgcolor: '#F0F4F1' }}>
              <ProductImage product={{ ...product, image: selectedImage }} large />
              {(product.images?.length || 0) > 1 && <Stack direction="row" gap={1} sx={{ mt: 2 }} flexWrap="wrap">{product.images?.map((image, index) => <Button key={image} variant={image === selectedImage ? 'contained' : 'outlined'} onClick={() => setSelectedImage(image)}>Image {index + 1}</Button>)}</Stack>}
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 5 }} sx={{ minWidth: 0 }}>
            <Typography variant="overline" sx={{ color: 'primary.dark', letterSpacing: '0.08em', fontWeight: 700 }}>{product.category}</Typography>
            <Typography component="h1" variant="h3" sx={{ mt: 1, mb: 2, fontSize: { xs: '1.85rem', md: '2.4rem' }, lineHeight: 1.15 }}>{product.name}</Typography>
            <Chip size="small" label={product.inStock === false ? 'Currently unavailable' : product.inStock ? 'In stock' : 'Check availability'}
              sx={{ mb: 2, bgcolor: product.inStock ? '#E6F3EA' : 'action.hover', color: product.inStock ? 'primary.dark' : 'text.secondary', fontWeight: 600 }} />
            <Typography color="text.secondary" sx={{ lineHeight: 1.7, mb: 3 }}>{product.description}</Typography>
            <Typography sx={{ fontSize: '2rem', fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>KES {product.price.toLocaleString('en-KE')}</Typography>
            <Divider sx={{ my: 3 }} />
            <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2} sx={{ mb: 2 }}>
              <Typography id="product-quantity-label" fontWeight={600}>Quantity</Typography>
              <Stack direction="row" alignItems="center" role="group" aria-labelledby="product-quantity-label" sx={{ border: 1, borderColor: 'divider', borderRadius: 2, bgcolor: 'background.paper' }}>
                <IconButton aria-label="Decrease quantity" disabled={quantity === 1 || product.inStock === false} onClick={() => setQuantity((value) => value - 1)} sx={{ width: 44, height: 44 }}><Remove fontSize="small" /></IconButton>
                <Typography component="output" aria-label="Quantity" aria-live="polite" sx={{ minWidth: 36, textAlign: 'center', fontWeight: 700 }}>{quantity}</Typography>
                <IconButton aria-label="Increase quantity" disabled={quantity >= Math.min(99, product.stock ?? 0) || product.inStock === false} onClick={() => setQuantity((value) => value + 1)} sx={{ width: 44, height: 44 }}><Add fontSize="small" /></IconButton>
              </Stack>
            </Stack>
            {quantity > 1 && <Typography aria-live="polite" variant="body2" sx={{ mb: 2 }}>Subtotal: KES {(product.price * quantity).toLocaleString('en-KE')}</Typography>}
            <ProductActions product={product} quantity={quantity} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2, lineHeight: 1.6 }}>Confirm delivery costs and any installation requirements with our team before ordering.</Typography>
          </Grid>
        </Grid>
        <Grid container spacing={{ xs: 3, md: 5 }} sx={{ mt: { xs: 4, md: 6 } }}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Typography component="h2" variant="h5" sx={{ mb: 2 }}>About this {product.name.includes('Consultation') || product.name.includes('Installation') ? 'service' : 'product'}</Typography>
            <Typography color="text.secondary" sx={{ lineHeight: 1.8, mb: 3 }}>{product.details || product.description || 'Contact our team for more information about this product.'}</Typography>
            <Paper variant="outlined" sx={{ p: 3 }}>
              <Typography component="h2" variant="h6" sx={{ mb: 1 }}>Before you order</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>{product.buyingAdvice || 'Contact our team to confirm specifications and suitability for your installation.'}</Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <Typography component="h2" variant="h5" sx={{ mb: 2 }}>Product details</Typography>
            <Box component="dl" sx={{ m: 0 }}>
              {(product.specifications || [{ label: 'Category', value: product.category }]).map(({ label, value }) => (
                <Box key={label} sx={{ py: 1.75, borderBottom: 1, borderColor: 'divider', display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 3fr)', gap: 2 }}>
                  <Typography component="dt" variant="body2" color="text.secondary">{label}</Typography>
                  <Typography component="dd" variant="body2" sx={{ m: 0, fontWeight: 600, overflowWrap: 'anywhere' }}>{value}</Typography>
                </Box>
              ))}
            </Box>
          </Grid>
        </Grid>
        <Box component="section" aria-labelledby="more-products-heading" sx={{ mt: { xs: 5, md: 8 } }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} sx={{ mb: 3 }}>
            <Typography id="more-products-heading" component="h2" variant="h5">{sameCategory.length ? 'More in ' + product.category.toLowerCase() : 'Explore more products'}</Typography>
            <Button component={RouterLink} to="/shop" startIcon={<ArrowBack />}>Back to shop</Button>
          </Stack>
          <Grid container spacing={3}>
            {suggestions.map((item) => <Grid key={item.id} size={{ xs: 12, sm: 6, md: 4 }}><ProductCard product={item} /></Grid>)}
          </Grid>
        </Box>
      </Container>
      <Footer />
    </>
  );
}

export default function ProductDetails() {
  const { id } = useParams();
  const { products, loading, error } = useProducts();
  const product = products.find((item) => String(item.id) === id || item.slug === id);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [id]);

  if (loading || error) return <Container sx={{ py: 6 }}><Typography>{error || 'Loading product…'}</Typography></Container>;
  if (!product) {
    return <><Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
      <Typography component="h1" variant="h4" sx={{ mb: 2 }}>Product not found</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>This product link is unavailable. Browse the shop to find our current products.</Typography>
      <Button component={RouterLink} to="/shop" variant="contained" startIcon={<ArrowBack />}>Back to shop</Button>
    </Container><Footer /></>;
  }

  return <><PageMeta title={product.name} description={product.description || product.name} path={`/shop/${product.slug || product.id}`} image={product.image} /><ProductContent key={product.id} product={product} products={products} /></>;
}
