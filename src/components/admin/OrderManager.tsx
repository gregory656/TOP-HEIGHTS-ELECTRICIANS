import { useState } from 'react';
import { Alert, Box, Button, Chip, Dialog, DialogContent, DialogTitle, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { formatOrderDate, fulfilmentLabels, orderTime, paymentLabels, type Order } from '../../services/orderModel';
import OrderActions from '../OrderActions';
import History from './History';

export default function OrderManager({ orders }: { orders: Order[] }) {
  const [search, setSearch] = useState(''), [payment, setPayment] = useState(''), [fulfilment, setFulfilment] = useState(''), [date, setDate] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const order = orders.find(o => o.id === selected);
  const filtered = orders.filter(o => `${o.orderId} ${o.customerInfo.fullName} ${o.customerInfo.email} ${o.customerInfo.phone} ${o.invoiceId || ''}`.toLowerCase().includes(search.toLowerCase()) && (!payment || o.paymentStatus === payment) && (!fulfilment || o.orderStatus === fulfilment) && (!date || new Date(orderTime(o.createdAt)).toLocaleDateString('en-CA') === date));
  return <Stack spacing={2}>
    <Typography variant="h5">Orders</Typography><Typography color="text.secondary">Sales totals include only provider-verified live payments. Test orders are clearly labelled.</Typography>
    <TextField label="Search order, customer, telephone or payment reference" value={search} onChange={e => setSearch(e.target.value)} size="small" />
    <Stack direction={{ xs: 'column', sm: 'row' }} gap={2}>
      <TextField fullWidth select label="Payment status" value={payment} onChange={e => setPayment(e.target.value)} size="small"><MenuItem value="">All payments</MenuItem>{Object.entries(paymentLabels).map(([key, label]) => <MenuItem key={key} value={key}>{label}</MenuItem>)}</TextField>
      <TextField fullWidth select label="Fulfilment status" value={fulfilment} onChange={e => setFulfilment(e.target.value)} size="small"><MenuItem value="">All fulfilment</MenuItem>{Object.entries(fulfilmentLabels).map(([key, label]) => <MenuItem key={key} value={key}>{label}</MenuItem>)}</TextField>
      <TextField fullWidth label="Order date" type="date" value={date} onChange={e => setDate(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} size="small" />
    </Stack>
    {filtered.length === 0 && <Typography>No matching orders.</Typography>}
    {filtered.map(o => <Box key={o.id} sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 2, overflowWrap: 'anywhere' }}>
      <Stack direction={{ xs: 'column', md: 'row' }} gap={2} justifyContent="space-between"><Box><Typography fontWeight={700}>{o.customerInfo.fullName || o.customerInfo.email} · KES {o.totalAmount.toLocaleString()}</Typography><Typography variant="body2">{o.orderId}</Typography><Typography variant="body2">{o.customerInfo.phone} · {o.customerInfo.deliveryAddress} · {formatOrderDate(o.createdAt)}</Typography><Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 1 }}><Chip size="small" label={paymentLabels[o.paymentStatus]} /><Chip size="small" label={fulfilmentLabels[o.orderStatus]} />{o.paymentEnvironment !== 'live' && <Chip size="small" label={o.paymentEnvironment} color="warning" />}{o.inventoryStatus === 'review' && <Chip size="small" color="error" label="Stock review needed" />}</Stack></Box><Button onClick={() => setSelected(o.id)}>View order</Button></Stack>
    </Box>)}
    <Dialog open={!!order} onClose={() => setSelected(null)} fullWidth maxWidth="sm"><DialogTitle>Order details<Button onClick={() => setSelected(null)} sx={{ float: 'right' }}>Close</Button></DialogTitle><DialogContent>{order && <Stack spacing={2} sx={{ overflowWrap: 'anywhere' }}>
      <Typography>{order.orderId}</Typography><Typography>{order.customerInfo.fullName}<br />{order.customerInfo.email}<br />{order.customerInfo.phone}</Typography><Typography>Town / location: {order.customerInfo.deliveryAddress}<br />Landmark: {order.customerInfo.landmark || 'Not specified'}</Typography>
      {order.items.map(item => <Typography key={item.productId}>{item.quantity} × {item.name} — KES {item.total.toLocaleString()}</Typography>)}
      <Typography>Delivery: KES {order.shippingFee.toLocaleString()}<br /><strong>Total: KES {order.totalAmount.toLocaleString()}</strong></Typography>
      <Typography>Method: {order.paymentMethod}<br />Reference: {order.invoiceId || 'Awaiting provider'}<br />Provider verified: {order.paymentVerified ? 'Yes' : 'No'}<br />Payment: {paymentLabels[order.paymentStatus]}<br />Fulfilment: {fulfilmentLabels[order.orderStatus]}</Typography>
      <Typography variant="body2">Created: {formatOrderDate(order.createdAt)} · Updated: {formatOrderDate(order.updatedAt)}{order.paidAt ? ` · Paid: ${formatOrderDate(order.paidAt)}` : ''}</Typography>
      {order.inventoryStatus === 'review' && <Alert severity="error">Payment received but stock could not be allocated. Contact the customer before dispatch. Arrange stock or a provider refund manually.</Alert>}
      {order.orderStatus === 'cancelled' && order.paymentVerified && <Alert severity="warning">Cancellation does not refund payment or return stock. Reconcile the refund in IntaSend and record any returned stock separately.</Alert>}
      <OrderActions order={order} admin /><History key={order.id} kind="fulfilmentEvents" id={order.id} />
    </Stack>}</DialogContent></Dialog>
  </Stack>;
}
