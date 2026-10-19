import { useState } from 'react';
import { Alert, Box, Button, Typography } from '@mui/material';
import { cancelOrder, commerceApi, refreshOrderPayment, startOrderPayment, updateFulfilment, type Order } from '../services/orderService';
import { fulfilmentLabels, isVerifiedSale } from '../services/orderModel';

export default function OrderActions({ order, admin = false, onPaid }: { order: Order; admin?: boolean; onPaid?: () => void }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const run = async (action: () => Promise<void>) => {
    setBusy(true); setMessage('');
    try { await action(); } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not update this order.'); }
    finally { setBusy(false); }
  };
  if (order.schemaVersion !== 2) return <Typography variant="caption">Contact the shop to verify this older order.</Typography>;
  const next = order.orderStatus === 'processed' ? 'ready' : order.orderStatus === 'ready' ? 'shipped' : order.orderStatus === 'shipped' ? 'completed' : null;
  return <Box sx={{ minWidth: 145, maxWidth: 280 }}>
    {order.paymentEnvironment === 'sandbox' && <Typography variant="caption" color="warning.main" display="block">Test payment · no delivery</Typography>}
    {order.orderStatus === 'cancelled' && <Typography variant="body2">Order cancelled. Contact the shop if a payment was already sent.</Typography>}
    {!['paid', 'refunded'].includes(order.paymentStatus) && <>
      <Button size="small" disabled={busy} onClick={() => void run(async () => {
        const status = await refreshOrderPayment(order.id);
        if (status.paymentStatus === 'paid' && status.paymentVerified) { setMessage('Payment verified.'); onPaid?.(); }
        else setMessage(status.paymentStatus === 'failed' ? 'Payment was not completed. Resume checkout to try again.' : 'Awaiting payment confirmation. Your order is saved.');
      })}>Check payment</Button>
      {!admin && order.orderStatus !== 'cancelled' && order.paymentMethod !== 'MPESA' && <Typography variant="body2">This payment option is paused. Start a new order using M-Pesa.</Typography>}
      {!admin && order.orderStatus !== 'cancelled' && order.paymentMethod === 'MPESA' && <Button size="small" disabled={busy} onClick={() => void run(async () => {
        const payment = await startOrderPayment(order.id);
        if (payment.url) window.location.assign(payment.url);
        else { const status = await refreshOrderPayment(order.id); if (status.paymentVerified) onPaid?.(); }
      })}>Pay with M-Pesa</Button>}
    </>}
    {admin && isVerifiedSale(order) && next && <Button size="small" variant="outlined" disabled={busy || order.inventoryStatus === 'review'} onClick={() => void run(async () => { await updateFulfilment(order.id, next); })}>Mark {fulfilmentLabels[next].toLowerCase()}</Button>}
    {admin && order.paymentVerified && order.inventoryStatus === 'review' && order.orderStatus !== 'cancelled' && <Button size="small" disabled={busy} onClick={() => void run(async () => { await commerceApi(`/orders/${encodeURIComponent(order.id)}/allocate-stock`); })}>Allocate available stock</Button>}
    {(admin ? ['pending', 'processed', 'ready'].includes(order.orderStatus) : order.orderStatus === 'pending' && !order.paymentVerified) && <Button size="small" color="error" disabled={busy} onClick={() => { if (window.confirm(order.paymentVerified ? 'Cancel this order? Payment refunds and stock returns must be reconciled separately.' : 'Cancel this order?')) void run(async () => { if (admin) await updateFulfilment(order.id, 'cancelled'); else await cancelOrder(order.id); }); }}>Cancel order</Button>}
    {message && <Alert severity="info" sx={{ mt: 1 }}>{message}</Alert>}
  </Box>;
}
