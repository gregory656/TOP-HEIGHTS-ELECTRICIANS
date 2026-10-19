import { useEffect, useState } from 'react';
import { Alert, Box, Container, Grid, Paper, Tab, Tabs, Typography } from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import AdminAccessNotice from '../components/AdminAccessNotice';
import { subscribeToAllOrders, type Order } from '../services/orderService';
import { isVerifiedSale } from '../services/orderModel';
import { subscribeProducts } from '../services/productService';
import { subscribePosts, type BlogPost } from '../services/contentService';
import type { Product } from '../data/products';
import ProductManager from '../components/admin/ProductManager';
import OrderManager from '../components/admin/OrderManager';
import BlogManager from '../components/admin/BlogManager';
import PageMeta from '../components/PageMeta';

function BusinessDashboard() {
  const [tab, setTab] = useState(0);
  const [products, setProducts] = useState<Product[] | null>(null);
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [posts, setPosts] = useState<BlogPost[] | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    const failed = () => setError('Some dashboard records could not be loaded. Check your connection and reload.');
    const unsub = [subscribeProducts(setProducts, failed, true), subscribeToAllOrders(setOrders, failed), subscribePosts(setPosts, failed, true)];
    return () => unsub.forEach(stop => stop());
  }, []);
  const stats = [
    ['Active products', products?.filter(p => p.status === 'active' && p.published).length],
    ['Out of stock', products?.filter(p => p.status !== 'archived' && (p.stock === 0 || p.status === 'out_of_stock')).length],
    ['Low stock', products?.filter(p => p.status === 'active' && Number(p.stock) > 0 && Number(p.stock) <= Number(p.lowStockThreshold)).length],
    ['Pending orders', orders?.filter(o => ['pending', 'processing'].includes(o.paymentStatus) && o.orderStatus !== 'cancelled').length],
    ['Paid orders', orders?.filter(isVerifiedSale).length],
    ['Awaiting dispatch', orders?.filter(o => isVerifiedSale(o) && ['processed', 'ready'].includes(o.orderStatus)).length],
    ['Verified sales (KES)', orders?.filter(isVerifiedSale).reduce((sum, o) => sum + o.totalAmount, 0).toLocaleString('en-KE')],
  ];
  return <><PageMeta title="Business admin" description="Manage products, stock, orders and articles." path="/admin" noindex />
    <Box sx={{ py: 5, borderBottom: 1, borderColor: 'divider' }}><Container maxWidth="lg"><Typography variant="h1">Business admin</Typography><Typography color="text.secondary">Products, stock, orders and publishing.</Typography></Container></Box>
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Grid container spacing={2} sx={{ mb: 3 }}>{stats.map(([label, value]) => <Grid key={label} size={{ xs: 6, md: 3 }}><Paper variant="outlined" sx={{ p: 2, height: '100%' }}><Typography variant="h5">{value ?? '…'}</Typography><Typography variant="body2" color="text.secondary">{label}</Typography></Paper></Grid>)}</Grid>
      <Paper variant="outlined"><Tabs value={tab} onChange={(_, value) => setTab(value)} variant="scrollable" scrollButtons="auto"><Tab label="Orders" /><Tab label="Products & stock" /><Tab label="Blog" /></Tabs>
        <Box sx={{ p: { xs: 2, md: 3 } }}>{tab === 0 ? orders ? <OrderManager orders={orders} /> : <Typography>Loading orders…</Typography> : tab === 1 ? products ? <ProductManager products={products} /> : <Typography>Loading products…</Typography> : posts ? <BlogManager posts={posts} /> : <Typography>Loading articles…</Typography>}</Box>
      </Paper>
    </Container>
  </>;
}
export default function AdminPanel() {
  const { user, authLoading } = useAuth();
  return !authLoading && user?.role === 'admin' ? <BusinessDashboard key={user.uid} /> : <AdminAccessNotice />;
}
