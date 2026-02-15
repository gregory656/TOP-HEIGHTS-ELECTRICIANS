// src/pages/Profile.tsx
import { useState } from 'react';
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
} from '@mui/material';
import {
  Person,
  ShoppingCart,
  LocalShipping,
  Edit,
  WhatsApp,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/Footer';

// Demo Orders for customer
const demoOrders = [
  { id: 'ORD-101', product: 'LED Bulb Pack', date: '2024-01-18', status: 'Delivered', total: 850 },
  { id: 'ORD-102', product: 'Wall Socket', date: '2024-01-15', status: 'Shipped', total: 450 },
  { id: 'ORD-103', product: 'Industrial Circuit Breaker', date: '2024-01-20', status: 'Processing', total: 4500 },
];

const tabVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }).format(price);
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
              <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main', color: '#0A192F', fontSize: '2rem' }}>
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
            { icon: <ShoppingCart />, label: 'Total Orders', value: demoOrders.length, color: '#64FFDA' },
            { icon: <LocalShipping />, label: 'In Transit', value: demoOrders.filter(o => o.status === 'Shipped').length, color: '#64B5F6' },
            { icon: <Edit />, label: 'Total Spent', value: formatPrice(demoOrders.reduce((acc, o) => acc + o.total, 0)), color: '#81C784' },
          ].map((stat, i) => (
            <Grid size={{ xs: 6, md: 4 }} key={i}>
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
            <Tab icon={<Person />} iconPosition="start" label="Account Settings" />
          </Tabs>

          <Box sx={{ p: 3 }}>
            <AnimatePresence mode="wait">
              {activeTab === 0 && (
                <motion.div key="orders" variants={tabVariants} initial="hidden" animate="visible" exit="exit">
                  <Typography variant="h5" sx={{ mb: 3 }}>My Orders</Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Order ID</TableCell><TableCell>Product</TableCell><TableCell>Date</TableCell><TableCell>Total</TableCell><TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {demoOrders.map((order) => (
                          <TableRow key={order.id} hover>
                            <TableCell fontWeight={600}>{order.id}</TableCell>
                            <TableCell>{order.product}</TableCell>
                            <TableCell>{order.date}</TableCell>
                            <TableCell>{formatPrice(order.total)}</TableCell>
                            <TableCell>
                              <Chip label={order.status} size="small" sx={{ backgroundColor: order.status === 'Delivered' ? 'rgba(129, 199, 132, 0.2)' : order.status === 'Shipped' ? 'rgba(100, 181, 246, 0.2)' : 'rgba(255, 183, 77, 0.2)', color: order.status === 'Delivered' ? '#81C784' : order.status === 'Shipped' ? '#64B5F6' : '#FFB74D' }} />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </motion.div>
              )}
              {activeTab === 1 && (
                <motion.div key="settings" variants={tabVariants} initial="hidden" animate="visible" exit="exit">
                  <Typography variant="h5" sx={{ mb: 3 }}>Account Settings</Typography>
                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Card sx={{ background: 'rgba(17, 34, 64, 0.3)', border: '1px solid rgba(100, 255, 218, 0.1)' }}>
                        <CardContent>
                          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Username</Typography>
                          <Typography variant="body1" sx={{ mb: 2 }}>{user.name}</Typography>
                          <Button size="small" startIcon={<Edit />}>Edit</Button>
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
