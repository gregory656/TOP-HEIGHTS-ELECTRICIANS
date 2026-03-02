// src/pages/AdminPanel.tsx
import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Switch,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Inventory,
  Article,
  LocalShipping,
  TrendingUp,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';

// Types
interface Product {
  id: number;
  name: string;
  price: number;
  size: string;
  color: string;
  description: string;
  inStock: boolean;
  category: string;
  image: string;
}

interface NewsItem {
  id: number;
  title: string;
  content: string;
  date: string;
  active: boolean;
}

interface Order {
  id: string;
  customer: string;
  product: string;
  status: 'Pending' | 'Approved' | 'Completed';
  date: string;
  total: number;
}

// Demo Data
const initialProducts: Product[] = [
  { id: 1, name: 'Industrial Circuit Breaker', price: 4500, size: '200A', color: 'Grey', description: 'High-capacity circuit breaker', inStock: true, category: 'Breakers', image: 'https://picsum.photos/400/300?breaker' },
  { id: 2, name: 'LED Bulb Pack', price: 850, size: '9W', color: 'White', description: 'Energy-efficient LED bulbs', inStock: true, category: 'Lighting', image: 'https://picsum.photos/400/300?led' },
  { id: 3, name: 'Commercial Wiring Kit', price: 12500, size: '50m', color: 'Copper', description: 'Complete wiring solution', inStock: false, category: 'Wiring', image: 'https://picsum.photos/400/300?wire' },
];

const initialNews: NewsItem[] = [
  { id: 1, title: 'New Solar Panel Range', content: 'Added new solar panels', date: '2024-01-15', active: true },
  { id: 2, title: 'Holiday Schedule', content: 'Operating hours update', date: '2024-12-20', active: false },
];

const initialOrders: Order[] = [
  { id: 'ORD-001', customer: 'John Doe', product: 'Industrial Circuit Breaker', status: 'Pending', date: '2024-01-20', total: 4500 },
  { id: 'ORD-002', customer: 'Jane Smith', product: 'LED Bulb Pack', status: 'Approved', date: '2024-01-19', total: 850 },
  { id: 'ORD-003', customer: 'Bob Johnson', product: 'Commercial Wiring Kit', status: 'Completed', date: '2024-01-18', total: 12500 },
];

const tabVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

const AdminPanel: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [news, setNews] = useState<NewsItem[]>(initialNews);
  const [orders] = useState<Order[]>(initialOrders);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [newsDialogOpen, setNewsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({ name: '', price: 0, size: '', color: '', description: '', inStock: true, category: '', image: 'https://picsum.photos/400/300?product' });
  const [newNews, setNewNews] = useState<Partial<NewsItem>>({ title: '', content: '', active: true });

  const formatPrice = (price: number) => new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }).format(price);

  if (user?.role !== 'admin') {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h4" color="error">Access Denied</Typography>
        <Typography color="text.secondary">You must be an admin to view this page.</Typography>
      </Container>
    );
  }

  const handleAddProduct = () => { setEditingProduct(null); setNewProduct({ name: '', price: 0, size: '', color: '', description: '', inStock: true, category: '', image: 'https://picsum.photos/400/300?product' }); setProductDialogOpen(true); };
  const handleEditProduct = (p: Product) => { setEditingProduct(p); setNewProduct(p); setProductDialogOpen(true); };
  const handleSaveProduct = () => {
    if (editingProduct) setProducts(products.map(p => p.id === editingProduct.id ? { ...newProduct, id: p.id } as Product : p));
    else setProducts([...products, { ...newProduct, id: Date.now() } as Product]);
    setProductDialogOpen(false);
  };
  const handleDeleteProduct = (id: number) => setProducts(products.filter(p => p.id !== id));

  const handleAddNews = () => { setEditingNews(null); setNewNews({ title: '', content: '', active: true }); setNewsDialogOpen(true); };
  const handleEditNews = (n: NewsItem) => { setEditingNews(n); setNewNews(n); setNewsDialogOpen(true); };
  const handleSaveNews = () => {
    if (editingNews) setNews(news.map(n => n.id === editingNews.id ? { ...newNews, id: n.id, date: n.date } as NewsItem : n));
    else setNews([...news, { ...newNews, id: Date.now(), date: new Date().toISOString().split('T')[0] } as NewsItem]);
    setNewsDialogOpen(false);
  };
  const handleDeleteNews = (id: number) => setNews(news.filter(n => n.id !== id));

  return (
    <Box>
      <Box sx={{ py: 6, background: 'linear-gradient(135deg, rgba(100, 255, 218, 0.05) 0%, rgba(100, 181, 246, 0.02) 100%)', borderBottom: '1px solid rgba(100, 255, 218, 0.1)' }}>
        <Container maxWidth="lg">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Typography variant="h1" sx={{ mb: 1 }}>Admin Dashboard</Typography>
            <Typography variant="body1" color="text.secondary">Welcome Admin, manage your business from here.</Typography>
          </motion.div>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[
            { icon: <Inventory />, label: 'Products', value: products.length, color: '#64FFDA' },
            { icon: <Article />, label: 'Active News', value: news.filter(n => n.active).length, color: '#64B5F6' },
            { icon: <LocalShipping />, label: 'Pending Orders', value: orders.filter(o => o.status === 'Pending').length, color: '#FFB74D' },
            { icon: <TrendingUp />, label: 'Revenue', value: formatPrice(orders.reduce((acc, o) => acc + o.total, 0)), color: '#81C784' },
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
            <Tab icon={<Inventory />} iconPosition="start" label="Inventory" />
            <Tab icon={<Article />} iconPosition="start" label="News Manager" />
            <Tab icon={<LocalShipping />} iconPosition="start" label="Order Tracker" />
          </Tabs>

          <Box sx={{ p: 3 }}>
            <AnimatePresence mode="wait">
              {activeTab === 0 && (
                <motion.div key="inventory" variants={tabVariants} initial="hidden" animate="visible" exit="exit">
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h5">Product Inventory</Typography>
                    <Button variant="contained" startIcon={<Add />} onClick={handleAddProduct}>Add Product</Button>
                  </Box>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Product</TableCell><TableCell>Category</TableCell><TableCell>Price</TableCell><TableCell>Size</TableCell><TableCell>Stock</TableCell><TableCell align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {products.map((p) => (
                          <TableRow key={p.id} hover>
                            <TableCell><Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}><Avatar variant="rounded" src={p.image} sx={{ width: 48, height: 48 }} /><Box><Typography variant="body2" fontWeight={600}>{p.name}</Typography><Typography variant="caption" color="text.secondary">{p.description}</Typography></Box></Box></TableCell>
                            <TableCell><Chip label={p.category} size="small" /></TableCell>
                            <TableCell>{formatPrice(p.price)}</TableCell>
                            <TableCell>{p.size}</TableCell>
                            <TableCell><Chip label={p.inStock ? 'In Stock' : 'Out'} size="small" color={p.inStock ? 'success' : 'error'} /></TableCell>
                            <TableCell align="right"><IconButton onClick={() => handleEditProduct(p)} color="primary"><Edit /></IconButton><IconButton onClick={() => handleDeleteProduct(p.id)} color="error"><Delete /></IconButton></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </motion.div>
              )}
              {activeTab === 1 && (
                <motion.div key="news" variants={tabVariants} initial="hidden" animate="visible" exit="exit">
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h5">News Manager</Typography>
                    <Button variant="contained" startIcon={<Add />} onClick={handleAddNews}>Add News</Button>
                  </Box>
                  <TableContainer>
                    <Table>
                      <TableHead><TableRow><TableCell>Title</TableCell><TableCell>Date</TableCell><TableCell>Status</TableCell><TableCell align="right">Actions</TableCell></TableRow></TableHead>
                      <TableBody>
                        {news.map((n) => (
                          <TableRow key={n.id} hover>
                            <TableCell><Typography variant="body2" fontWeight={600}>{n.title}</Typography><Typography variant="caption" color="text.secondary">{n.content}</Typography></TableCell>
                            <TableCell>{n.date}</TableCell>
                            <TableCell><Switch checked={n.active} onChange={() => setNews(news.map(x => x.id === n.id ? { ...x, active: !x.active } : x))} /></TableCell>
                            <TableCell align="right"><IconButton onClick={() => handleEditNews(n)} color="primary"><Edit /></IconButton><IconButton onClick={() => handleDeleteNews(n.id)} color="error"><Delete /></IconButton></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </motion.div>
              )}
              {activeTab === 2 && (
                <motion.div key="orders" variants={tabVariants} initial="hidden" animate="visible" exit="exit">
                  <Typography variant="h5" sx={{ mb: 3 }}>Order Tracker</Typography>
                  <TableContainer>
                    <Table>
                      <TableHead><TableRow><TableCell>Order ID</TableCell><TableCell>Customer</TableCell><TableCell>Product</TableCell><TableCell>Total</TableCell><TableCell>Status</TableCell></TableRow></TableHead>
                      <TableBody>
                        {orders.map((o) => (
                          <TableRow key={o.id} hover>
                            <TableCell fontWeight={600}>{o.id}</TableCell>
                            <TableCell>{o.customer}</TableCell>
                            <TableCell>{o.product}</TableCell>
                            <TableCell>{formatPrice(o.total)}</TableCell>
                            <TableCell><Chip label={o.status} size="small" sx={{ backgroundColor: o.status === 'Pending' ? 'rgba(255, 183, 77, 0.2)' : o.status === 'Approved' ? 'rgba(100, 181, 246, 0.2)' : 'rgba(129, 199, 132, 0.2)', color: o.status === 'Pending' ? '#FFB74D' : o.status === 'Approved' ? '#64B5F6' : '#81C784' }} /></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </motion.div>
              )}
            </AnimatePresence>
          </Box>
        </Paper>
      </Container>

      {/* Product Dialog */}
      <Dialog open={productDialogOpen} onClose={() => setProductDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingProduct ? 'Edit Product' : 'Add Product'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField label="Name" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} fullWidth />
            <TextField label="Price" type="number" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })} fullWidth />
            <TextField label="Size" value={newProduct.size} onChange={(e) => setNewProduct({ ...newProduct, size: e.target.value })} fullWidth />
            <TextField label="Color" value={newProduct.color} onChange={(e) => setNewProduct({ ...newProduct, color: e.target.value })} fullWidth />
            <TextField label="Category" value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })} fullWidth />
            <TextField label="Description" value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} fullWidth multiline rows={2} />
            <FormControl fullWidth>
              <InputLabel>Stock Status</InputLabel>
              <Select value={newProduct.inStock ? 'inStock' : 'out'} label="Stock Status" onChange={(e) => setNewProduct({ ...newProduct, inStock: e.target.value === 'inStock' })}>
                <MenuItem value="inStock">In Stock</MenuItem>
                <MenuItem value="out">Out of Stock</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setProductDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveProduct}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* News Dialog */}
      <Dialog open={newsDialogOpen} onClose={() => setNewsDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingNews ? 'Edit News' : 'Add News'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField label="Title" value={newNews.title} onChange={(e) => setNewNews({ ...newNews, title: e.target.value })} fullWidth />
            <TextField label="Content" value={newNews.content} onChange={(e) => setNewNews({ ...newNews, content: e.target.value })} fullWidth multiline rows={3} />
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select value={newNews.active ? 'active' : 'inactive'} label="Status" onChange={(e) => setNewNews({ ...newNews, active: e.target.value === 'active' })}>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setNewsDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveNews}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminPanel;
       