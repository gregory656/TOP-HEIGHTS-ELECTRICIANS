// src/pages/Profile.tsx
import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper,
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
  Card,
  CardContent,
  Button,
  CircularProgress,
} from '@mui/material';
import {
  Person,
  ShoppingCart,
  LocalShipping,
  Edit,
  WhatsApp,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { subscribeToUserOrders, type Order } from '../services/orderService';
import { useCart } from '../context/CartContext';
import Footer from '../components/Footer';

const tabVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

const Profile: React.FC = () => {
  const { user } = useAuth();
  const { cartItems, cartTotal } = useCart();
  const [activeTab, setActiveTab] = useState(0);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Subscribe to orders
  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToUserOrders(user.uid, (userOrders) => {
      setOrders(userOrders);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Cart is from CartContext (no Firestore subscription)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }).format(price);
  };

  const formatDate = (timestamp: unknown) => {
    if (!timestamp) return 'N/A';
    const date = typeof timestamp === 'object' && timestamp !== null && 'toDate' in timestamp 
      ? (timestamp as { toDate: () => Date }).toDate() 
      : new Date(timestamp as number | string);
    return date.toLocaleDateString('en-KE', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return { bg: 'rgba(129, 199, 132, 0.2)', color: '#81C784' };
      case 'processing':
        return { bg: 'rgba(100, 181, 246, 0.2)', color: '#64B5F6' };
      case 'pending':
        return { bg: 'rgba(255, 183, 77, 0.2)', color: '#FFB74D' };
      case 'failed':
        return { bg: 'rgba(244, 67, 54, 0.2)', color: '#f44336' };
      default:
        return { bg: 'rgba(100, 255, 218, 0.2)', color: '#64FFDA' };
    }
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return { bg: 'rgba(129, 199, 132, 0.2)', color: '#81C784' };
      case 'processed':
        return { bg: 'rgba(100, 181, 246, 0.2)', color: '#64B5F6' };
      case 'shipped':
        return { bg: 'rgba(100, 181, 246, 0.2)', color: '#64B5F6' };
      case 'pending':
        return { bg: 'rgba(255, 183, 77, 0.2)', color: '#FFB74D' };
      case 'cancelled':
        return { bg: 'rgba(244, 67, 54, 0.2)', color: '#f44336' };
      default:
        return { bg: 'rgba(100, 255, 218, 0.2)', color: '#64FFDA' };
    }
  };

  if (!user || user.role === 'admin') {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h4" color="error">Access Denied</Typography>
        <Typography color="text.secondary">Customer access only.</Typography>
      </Container>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          py: 6,
          background: 'linear-gradient(135deg, rgba(100, 255, 218, 0.05) 0%, rgba(100, 181, 246, 0.02) 100%)',
          borderBottom: '1px solid rgba(100, 255, 218, 0.1)',
        }}
      >
        <Container maxWidth="lg">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Avatar 
                src={user.photoURL}
                sx={{ width: 80, height: 80, bgcolor: 'primary.main', color: '#0A192F', fontSize: '2rem' }}
              >
                {user.name.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="h3" sx={{ mb: 0.5 }}>{user.name}</Typography>
                <Chip label="Customer" size="small" sx={{ backgroundColor: 'rgba(100, 255, 218, 0.15)', color: 'primary.main' }} />
              </Box>
            </Box>
          </motion.div>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[
            { icon: <ShoppingCart />, label: 'Total Orders', value: orders.length, color: '#64FFDA' },
            { icon: <LocalShipping />, label: 'Pending Orders', value: orders.filter(o => o.orderStatus === 'pending').length, color: '#FFB74D' },
            { icon: <Edit />, label: 'Total Spent', value: formatPrice(orders.reduce((acc, o) => acc + (o.totalAmount ?? 0), 0)), color: '#81C784' },
            {
              icon: <ShoppingCart />,
              label: 'Items Ordered',
              value: orders.reduce((acc, o) => acc + (o.items?.reduce((s, i) => s + (i.quantity || 0), 0) ?? 0), 0),
              color: '#64B5F6',
            },
          ].map((stat, i) => (
            <Grid size={{ xs: 6, md: 3 }} key={i}>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card sx={{ background: 'rgba(17, 34, 64, 0.5)', border: '1px solid rgba(100, 255, 218, 0.1)' }}>
                  <CardContent sx={{ textAlign: 'center', py: 3 }}>
                    <Avatar sx={{ bgcolor: `${stat.color}20`, color: stat.color, width: 56, height: 56, mx: 'auto', mb: 2 }}>{stat.icon}</Avatar>
                    <Typography variant="h4" sx={{ color: 'text.primary', fontWeight: 700 }}>{stat.value}</Typography>
                    <Typography variant="body2" color="text.secondary">{stat.label}</Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        <Paper sx={{ background: 'rgba(17, 34, 64, 0.5)', border: '1px solid rgba(100, 255, 218, 0.1)' }}>
          <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ borderBottom: '1px solid rgba(100, 255, 218, 0.1)', '& .MuiTab-root': { color: 'text.secondary' }, '& .Mui-selected': { color: 'primary.main' }, '& .MuiTabs-indicator': { backgroundColor: 'primary.main' } }}>
            <Tab icon={<ShoppingCart />} iconPosition="start" label="My Orders" />
            <Tab icon={<LocalShipping />} iconPosition="start" label="Live Cart" />
            <Tab icon={<Person />} iconPosition="start" label="Account Settings" />
          </Tabs>

          <Box sx={{ p: 3 }}>
            <AnimatePresence mode="wait">
              {activeTab === 0 && (
                <motion.div key="orders" variants={tabVariants} initial="hidden" animate="visible" exit="exit">
                  <Typography variant="h5" sx={{ mb: 3 }}>My Orders</Typography>
                  {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                      <CircularProgress />
                    </Box>
                  ) : orders.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body1" color="text.secondary">No orders yet. Start shopping!</Typography>
                    </Box>
                  ) : (
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Order ID</TableCell>
                            <TableCell>Items</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>Total</TableCell>
                            <TableCell>Payment</TableCell>
                            <TableCell>Status</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {orders.map((order) => (
                            <TableRow key={order.id} hover>
                              <TableCell sx={{ fontWeight: 600 }}>{order.id?.substring(0, 8)}...</TableCell>
                              <TableCell>
                                {order.items.map((item, idx) => (
                                  <Typography key={idx} variant="body2">
                                    {item.quantity}x {item.name}
                                  </Typography>
                                ))}
                              </TableCell>
                              <TableCell>{formatDate(order.createdAt)}</TableCell>
                              <TableCell>{formatPrice(order.totalAmount)}</TableCell>
                              <TableCell>
                                <Chip 
                                  label={order.paymentStatus.toUpperCase()} 
                                  size="small" 
                                  sx={{ 
                                    backgroundColor: getPaymentStatusColor(order.paymentStatus).bg, 
                                    color: getPaymentStatusColor(order.paymentStatus).color 
                                  }} 
                                />
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  label={order.orderStatus.toUpperCase()} 
                                  size="small" 
                                  sx={{ 
                                    backgroundColor: getOrderStatusColor(order.orderStatus).bg, 
                                    color: getOrderStatusColor(order.orderStatus).color 
                                  }} 
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </motion.div>
              )}

              {activeTab === 1 && (
                <motion.div key="cart" variants={tabVariants} initial="hidden" animate="visible" exit="exit">
                  <Typography variant="h5" sx={{ mb: 3 }}>Live Cart</Typography>
                  {cartItems.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body1" color="text.secondary">Your cart is empty</Typography>
                    </Box>
                  ) : (
                    <>
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Product</TableCell>
                              <TableCell>Price</TableCell>
                              <TableCell>Quantity</TableCell>
                              <TableCell>Subtotal</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {cartItems.map((item) => (
                              <TableRow key={item.productId} hover>
                                <TableCell>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Avatar variant="rounded" src={item.image} sx={{ width: 40, height: 40 }} />
                                    <Typography variant="body2">{item.name}</Typography>
                                  </Box>
                                </TableCell>
                                <TableCell>{formatPrice(item.price)}</TableCell>
                                <TableCell>{item.quantity}</TableCell>
                                <TableCell>{formatPrice(item.price * item.quantity)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                      <Box sx={{ mt: 2, textAlign: 'right' }}>
                        <Typography variant="h6">
                          Cart Total: {formatPrice(cartTotal)}
                        </Typography>
                      </Box>
                    </>
                  )}
                </motion.div>
              )}

              {activeTab === 2 && (
                <motion.div key="settings" variants={tabVariants} initial="hidden" animate="visible" exit="exit">
                  <Typography variant="h5" sx={{ mb: 3 }}>Account Settings</Typography>
                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Card sx={{ background: 'rgba(17, 34, 64, 0.3)', border: '1px solid rgba(100, 255, 218, 0.1)' }}>
                        <CardContent>
                          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Name</Typography>
                          <Typography variant="body1" sx={{ mb: 2 }}>{user.name}</Typography>
                          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Email</Typography>
                          <Typography variant="body1" sx={{ mb: 2 }}>{user.email}</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Card sx={{ background: 'rgba(17, 34, 64, 0.3)', border: '1px solid rgba(100, 255, 218, 0.1)' }}>
                        <CardContent>
                          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Contact Support</Typography>
                          <Button variant="outlined" startIcon={<WhatsApp />} href="https://wa.me/254711343412" target="_blank">WhatsApp Us</Button>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </motion.div>
              )}
            </AnimatePresence>
          </Box>
        </Paper>
      </Container>

      <Footer />
    </Box>
  );
};

export default Profile;
