// src/pages/Shop.tsx
import React, { useState, useMemo } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  TextField,
  InputAdornment,
  Chip,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  useTheme,
  useMediaQuery,
  Drawer,
  IconButton,
  Slider,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import { Search, FilterList, Close, Sort } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useProducts } from '../hooks/useProducts';
import PageMeta from '../components/PageMeta';
import { orderTime } from '../services/orderModel';
import { Alert } from '@mui/material';
import type { Product } from '../data/products';
import ProductCard from '../components/ProductCard';
import OrderModal from '../components/OrderModal';
import Footer from '../components/Footer';

const Shop: React.FC = () => {
  const { products, loading, error } = useProducts();
  const categories = ['All', ...new Set(products.map(p => p.category))];
  const priceMaximum = Math.max(400000, ...products.map(p => p.price));
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [priceRange, setPriceRange] = useState<number[]>([0, Number.MAX_SAFE_INTEGER]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const itemsPerPage = 8;

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search filter
    if (searchQuery) {
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'All') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // Price filter
    result = result.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    // Sort
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
        result.sort((a, b) => orderTime(b.createdAt) - orderTime(a.createdAt));
        break;
    }

    return result;
  }, [products, searchQuery, selectedCategory, sortBy, priceRange]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleOrder = (product: Product) => {
    setSelectedProduct(product);
    setOrderModalOpen(true);
  };

  const handleCloseOrderModal = () => {
    setOrderModalOpen(false);
    setSelectedProduct(null);
  };

  const handleSortChange = (event: SelectChangeEvent) => {
    setSortBy(event.target.value);
  };

  return (
    <Box>
      <PageMeta title="Solar & electrical shop" description="Shop published solar panels, batteries, inverters and electrical products from Top Heights Electricals." path="/shop" />
      {/* Header */}
      <Box
        sx={{
          py: { xs: 4, md: 6 },
          background: '#FFFFFF',
          borderBottom: '1px solid #E4EFE8',
        }}
      >
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Typography variant="h1" sx={{ mb: 1 }}>
              Solar Shop
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Browse solar panels, batteries, inverters, and complete installation packages.
            </Typography>
          </motion.div>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {error && <Alert severity="error">{error}</Alert>}
        {loading && <Typography>Loading products…</Typography>}
        {/* Filters Bar */}
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            mb: 4,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          {/* Search */}
          <TextField
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            size="small"
            sx={{ flex: { xs: '1 1 100%', sm: '1 1 260px' } }}
            inputProps={{ 'aria-label': 'Search products' }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
          />

          {/* Sort Dropdown */}
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="shop-sort-label">
              <Sort sx={{ mr: 0.5, verticalAlign: 'middle' }} />
              Sort by
            </InputLabel>
            <Select
              value={sortBy}
              label="Sort by"
              labelId="shop-sort-label"
              onChange={handleSortChange}
            >
              <MenuItem value="name">Name (A-Z)</MenuItem>
              <MenuItem value="price-low">Price: Low to High</MenuItem>
              <MenuItem value="price-high">Price: High to Low</MenuItem>
              <MenuItem value="newest">Newest First</MenuItem>
            </Select>
          </FormControl>

          {/* Mobile Filter Button */}
          {isMobile && (
            <Button
              variant="outlined"
              startIcon={<FilterList />}
              onClick={() => setFilterDrawerOpen(true)}
            >
              Filters
            </Button>
          )}
          {/* Category Chips */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', flex: '1 1 100%' }}>
            {categories.map((category) => (
              <Chip
                key={category}
                label={category}
                aria-pressed={selectedCategory === category}
                onClick={() => { setSelectedCategory(category); setCurrentPage(1); }}
                sx={{
                  backgroundColor:
                    selectedCategory === category
                      ? 'primary.main'
                      : '#F0FFF6',
                  color:
                    selectedCategory === category ? '#FFFFFF' : 'text.secondary',
                  fontWeight: selectedCategory === category ? 600 : 400,
                  '&:hover': {
                    backgroundColor:
                      selectedCategory === category
                        ? 'primary.dark'
                        : '#E6F7ED',
                  },
                }}
              />
            ))}
          </Box>


        </Box>

        {/* Active Filters */}
        {(selectedCategory !== 'All' || priceRange[0] > 0 || priceRange[1] < priceMaximum) && (
          <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Active filters:
            </Typography>
            {selectedCategory !== 'All' && (
              <Chip
                label={`Category: ${selectedCategory}`}
                size="small"
                onDelete={() => setSelectedCategory('All')}
                sx={{
                  backgroundColor: '#F0FFF6',
                  '& .MuiChip-label': {
                    color: 'primary.main',
                  },
                }}
              />
            )}
            {(priceRange[0] > 0 || priceRange[1] < priceMaximum) && (
              <Chip
                label={`Price: KES ${priceRange[0].toLocaleString()} - ${Math.min(priceRange[1], priceMaximum).toLocaleString()}`}
                size="small"
                onDelete={() => setPriceRange([0, Number.MAX_SAFE_INTEGER])}
                sx={{
                  backgroundColor: '#F0FFF6',
                  '& .MuiChip-label': {
                    color: 'primary.main',
                  },
                }}
              />
            )}
          </Box>
        )}

        {/* Results Count */}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Showing {paginatedProducts.length} of {filteredProducts.length} products
        </Typography>

        {/* Products Grid */}
        {paginatedProducts.length > 0 ? (
          <>
            <Grid container spacing={3}>
              {paginatedProducts.map((product, index) => (
                <Grid size={{ xs: 12, sm: 6, md: 6, lg: 4, xl: 3 }} key={product.id}>
                  <motion.div
                    style={{ height: '100%' }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                  >
                    <ProductCard
                      product={product}
                      onOrder={handleOrder}
                    />
                  </motion.div>
                </Grid>
              ))}
            </Grid>

            {/* Pagination */}
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={(_, value) => setCurrentPage(value)}
                  color="primary"
                  size={isMobile ? 'small' : 'medium'}
                  sx={{
                    '& .MuiPaginationItem-root': {
                      backgroundColor: '#F0FFF6',
                      border: '1px solid #E4EFE8',
                    },
                    '& .Mui-selected': {
                      backgroundColor: 'primary.main !important',
                      color: '#FFFFFF',
                    },
                  }}
                />
              </Box>
            )}
          </>
        ) : (
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
              backgroundColor: '#F7FBF8',
              borderRadius: 3,
              border: '1px solid #E4EFE8',
            }}
          >
            <Typography variant="h5" sx={{ mb: 1 }}>
              {loading ? 'Loading products…' : error ? 'Products unavailable' : 'No products found'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Try adjusting your search or filter criteria
            </Typography>
            <Button
              variant="outlined"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setPriceRange([0, Number.MAX_SAFE_INTEGER]);
                setCurrentPage(1);
              }}
            >
              Clear Filters
            </Button>
          </Box>
        )}
      </Container>

      {/* Mobile Filter Drawer */}
      <Drawer
        anchor="right"
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: 320,
            backgroundColor: '#FFFFFF',
            p: 3,
          },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Filters
          </Typography>
          <IconButton onClick={() => setFilterDrawerOpen(false)} sx={{ color: 'text.secondary' }}>
            <Close />
          </IconButton>
        </Box>

        {/* Price Range */}
        <Typography variant="subtitle2" sx={{ mb: 2 }}>
          Price Range
        </Typography>
        <Slider
          value={[priceRange[0], Math.min(priceRange[1], priceMaximum)]}
          onChange={(_, value) => setPriceRange(value as number[])}
          valueLabelDisplay="auto"
          min={0}
          max={priceMaximum}
          sx={{
            color: 'primary.main',
            '& .MuiSlider-thumb': {
              backgroundColor: '#0E7A3D',
            },
          }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
          <Typography variant="body2" color="text.secondary">
            KES {priceRange[0].toLocaleString()}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            KES {Math.min(priceRange[1], priceMaximum).toLocaleString()}
          </Typography>
        </Box>

        {/* Categories */}
        <Typography variant="subtitle2" sx={{ mb: 2 }}>
          Categories
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {categories.map((category) => (
            <Chip
              key={category}
              label={category}
              onClick={() => { setSelectedCategory(category); setCurrentPage(1); }}
              sx={{
                backgroundColor:
                  selectedCategory === category
                    ? 'primary.main'
                    : '#F0FFF6',
                color:
                  selectedCategory === category ? '#FFFFFF' : 'text.secondary',
              }}
            />
          ))}
        </Box>

        {/* Apply Button */}
        <Button
          variant="contained"
          fullWidth
          sx={{ mt: 4 }}
          onClick={() => setFilterDrawerOpen(false)}
        >
          Apply Filters
        </Button>
      </Drawer>

      {/* Order Modal */}
      <OrderModal
        open={orderModalOpen}
        onClose={handleCloseOrderModal}
        product={selectedProduct}
      />

      <Footer />
    </Box>
  );
};

export default Shop;
