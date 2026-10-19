import { Box, Chip, Stack, Typography } from '@mui/material';
import type { BlogPost } from '../services/contentService';
import { publicAsset } from '../utils/publicAsset';
import { videoUrl } from '../utils/videoUrl';

export default function BlogArticle({ post }: { post: BlogPost }) {
  const safeEmbed = videoUrl(post.videoUrl || '');
  return <Box component="article">
    <Stack direction="row" gap={1} flexWrap="wrap" sx={{ mb: 2 }}><Chip size="small" label={post.category} /><Typography color="text.secondary">{post.publishedDate} · {post.author}</Typography></Stack>
    <Typography variant="h2" component="h1" sx={{ mb: 2, overflowWrap: 'anywhere' }}>{post.title}</Typography>
    <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>{post.excerpt}</Typography>
    {post.mediaType === 'video' && safeEmbed ? <Box component="iframe" src={safeEmbed} title={post.title} loading="lazy" allow="fullscreen; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" sx={{ width: '100%', aspectRatio: '16 / 9', border: 0, borderRadius: 2, mb: 3 }} /> : post.mediaType !== 'video' && post.image ? <Box component="img" src={publicAsset(post.image)} alt={post.title} sx={{ width: '100%', maxHeight: 520, objectFit: 'cover', borderRadius: 2, mb: 3 }} /> : null}
    {post.summary && <Typography sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2, mb: 3 }}>{post.summary}</Typography>}
    <Typography component="div" sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', lineHeight: 1.9 }}>{post.content}</Typography>
    <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 3 }}>{(post.tags || []).map(tag => <Chip key={tag} label={tag} size="small" />)}</Stack>
  </Box>;
}
