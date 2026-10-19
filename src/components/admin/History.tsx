import { useEffect, useState } from 'react';
import { Alert, Box, Typography } from '@mui/material';
import { subscribeHistory, type AuditEvent } from '../../services/contentService';
import { orderTime, fulfilmentLabels, type Order } from '../../services/orderModel';

export default function History({ kind, id }: { kind: 'inventoryMovements' | 'fulfilmentEvents'; id: string }) {
  const [events, setEvents] = useState<AuditEvent[] | null>(null);
  const [error, setError] = useState('');
  useEffect(() => subscribeHistory(kind, kind === 'inventoryMovements' ? 'productId' : 'orderId', id, setEvents, () => setError('History could not be loaded.')), [kind, id]);
  return <Box sx={{ my: 2 }}>
    <Typography variant="h6">{kind === 'inventoryMovements' ? 'Stock movement history' : 'Status history'}</Typography>
    {error && <Alert severity="error">{error}</Alert>}
    {!events && <Typography>Loading history…</Typography>}
    {events?.length === 0 && <Typography color="text.secondary">No recorded changes yet.</Typography>}
    {events?.map(event => <Box key={event.id} sx={{ py: 1, borderBottom: 1, borderColor: 'divider' }}>
      <Typography variant="body2">{event.type ? `${event.type.replaceAll('_', ' ')}: ${event.previousQuantity} → ${event.newQuantity}` : `${fulfilmentLabels[event.from as Order['orderStatus']] || event.from} → ${fulfilmentLabels[event.to as Order['orderStatus']] || event.to}`}</Typography>
      {event.note && <Typography variant="body2">{event.note}</Typography>}
      <Typography variant="caption" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>{event.actor} · {orderTime(event.createdAt) ? new Date(orderTime(event.createdAt)).toLocaleString('en-KE') : 'Saving…'}</Typography>
    </Box>)}
  </Box>;
}
