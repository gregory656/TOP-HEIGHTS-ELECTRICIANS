import { useState } from 'react';
import { Box, Button, Typography } from '@mui/material';

export default function ExternalVideo({ src, title, height }: { src: string; title: string; height?: number }) {
  const [loaded, setLoaded] = useState(false);
  return <Box sx={{ width: '100%', height, aspectRatio: height ? undefined : '16 / 9', mb: height ? 0 : 3, borderRadius: 2, overflow: 'hidden', bgcolor: '#edf4ee' }}>
    {loaded ? <Box component="iframe" src={src} title={title} allow="fullscreen; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" sx={{ width: '100%', height: '100%', border: 0 }} />
      : <Box sx={{ height: '100%', display: 'grid', placeContent: 'center', gap: 1, p: 2, textAlign: 'center' }}><Button variant="outlined" onClick={() => setLoaded(true)}>Load video: {title}</Button><Typography variant="caption">Loading connects to YouTube or Vimeo. Their privacy terms apply.</Typography></Box>}
  </Box>;
}
