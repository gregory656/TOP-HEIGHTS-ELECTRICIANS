import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import ImageNotSupportedOutlined from '@mui/icons-material/ImageNotSupportedOutlined';
import type { Product } from '../data/products';
import { publicAsset } from '../utils/publicAsset';

export default function ProductImage({ product, large = false }: { product: Product; large?: boolean }) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const src = publicAsset(product.image);
  const dimensions = large ? { aspectRatio: '4 / 3', width: '100%' } : { height: 220, width: '100%' };

  if (failedSource === src) {
    return (
      <Box role="img" aria-label={`${product.name}: image unavailable`}
        sx={{ ...dimensions, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1, color: 'text.secondary' }}>
        <ImageNotSupportedOutlined sx={{ fontSize: 40 }} />
        <Typography variant="body2">Image unavailable</Typography>
      </Box>
    );
  }

  return <Box component="img" src={src} alt={product.name} loading={large ? 'eager' : 'lazy'}
    onError={() => setFailedSource(src)} sx={{ ...dimensions, display: 'block', objectFit: large ? 'contain' : 'cover', borderRadius: large ? 1 : 0 }} />;
}
