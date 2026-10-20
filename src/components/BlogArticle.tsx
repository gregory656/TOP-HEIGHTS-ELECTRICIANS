import { Box, Button, Chip, Stack, Typography } from '@mui/material';
import { ArrowForward, WhatsApp } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import type { BlogPost } from '../services/contentService';
import { publicAsset } from '../utils/publicAsset';
import { videoUrl } from '../utils/videoUrl';
import ExternalVideo from './ExternalVideo';

export default function BlogArticle({ post }: { post: BlogPost }) {
  const safeEmbed = videoUrl(post.videoUrl || '');
  return <Box component="article">
    <Stack direction="row" gap={1} flexWrap="wrap" sx={{ mb: 2 }}><Chip size="small" label={post.category} /><Typography color="text.secondary">{post.publishedDate} · {post.author}</Typography></Stack>
    <Typography variant="h2" component="h1" sx={{ mb: 2, overflowWrap: 'anywhere' }}>{post.title}</Typography>
    <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>{post.excerpt}</Typography>
    {post.mediaType === 'video' && safeEmbed ? <ExternalVideo src={safeEmbed} title={post.title} /> : post.mediaType !== 'video' && post.image ? <Box component="img" src={publicAsset(post.image)} alt={post.title} sx={{ width: '100%', maxHeight: 520, objectFit: 'cover', borderRadius: 2, mb: 3 }} /> : null}
    {post.summary && <Typography sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2, mb: 3 }}>{post.summary}</Typography>}
    <Typography component="div" sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', lineHeight: 1.9 }}>{post.content}</Typography>
    <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 3 }}>{(post.tags || []).map(tag => <Chip key={tag} label={tag} size="small" />)}</Stack>
    <Box sx={{ mt: 5, p: { xs: 2.5, sm: 3.5 }, borderRadius: 3, bgcolor: '#F0F6F0', border: '1px solid #DCE9DC' }}>
      <Typography variant="overline" color="primary">NEXT STEP</Typography>
      <Typography variant="h5" sx={{ mt: .5, mb: 1 }}>Want to put this into practice?</Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>Talk through your site, equipment or energy goals with the Top Heights team.</Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} gap={1.5}>
        <Button component="a" href={`https://wa.me/254711343412?text=${encodeURIComponent(`Hello Top Heights, I read “${post.title}” and would like advice about my solar needs.`)}`} target="_blank" rel="noreferrer" variant="contained" startIcon={<WhatsApp />}>Ask a specialist</Button>
        <Button component={Link} to="/shop" endIcon={<ArrowForward />}>Explore solar products</Button>
      </Stack>
    </Box>
  </Box>;
}
