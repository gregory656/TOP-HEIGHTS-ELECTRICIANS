import { useEffect, useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { Alert, Box, Button, Card, CardContent, CardMedia, Chip, Container, Grid, Typography } from '@mui/material';
import { subscribePosts, type BlogPost } from '../services/contentService';
import BlogArticle from '../components/BlogArticle';
import ExternalVideo from '../components/ExternalVideo';
import PageMeta from '../components/PageMeta';
import Footer from '../components/Footer';
import { publicAsset } from '../utils/publicAsset';
import { videoUrl } from '../utils/videoUrl';
import { firebaseAuthConfigured } from '../services/firebase';
import { starterGuides } from '../data/starterGuides';
import { useAuth } from '../hooks/useAuth';

export default function Blog() {
  const { user } = useAuth();
  const { slug } = useParams();
  const [posts, setPosts] = useState<BlogPost[] | null>(() => firebaseAuthConfigured ? null : starterGuides);
  const [category, setCategory] = useState('All topics');
  const [error, setError] = useState('');
  useEffect(() => {
    if (!firebaseAuthConfigured) return;
    return subscribePosts(items => {
      setPosts(items);
    }, () => { setError('Articles could not be loaded. Please reload or contact the shop.'); setPosts([]); });
  }, []);
  const post = posts?.find(p => p.slug === slug);
  const categories = ['All topics', ...new Set((posts || []).map(item => item.category).filter(Boolean))];
  const visiblePosts = (posts || []).filter(item => category === 'All topics' || item.category === category);
  const readTime = (item: BlogPost) => Math.max(1, Math.ceil(`${item.title} ${item.excerpt} ${item.summary} ${item.content}`.trim().split(/\s+/).length / 220));
  return <><Container maxWidth={slug ? 'md' : 'lg'} sx={{ py: { xs: 4, md: 6 } }}>
    <PageMeta title={post ? post.seoTitle || post.title : slug ? 'Article unavailable' : 'Blog'} description={post ? post.seoDescription || post.excerpt : 'Electrical and solar news, advice and updates from Top Heights Electricals.'} path={slug ? `/blog/${slug}` : '/blog'} image={post?.image} article={!!post} noindex={!!slug && !post} />
    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
    {user?.role === 'admin' && <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}><Button component={RouterLink} to="/admin?tab=blog" variant="outlined">Manage blog</Button></Box>}
    {!posts ? <Typography>Loading articles…</Typography> : <>
      {slug ? post ? <BlogArticle post={post} /> : <><Typography variant="h4" component="h1">Article unavailable</Typography><Typography sx={{ my: 2 }}>This article has not been published or is no longer available.</Typography></> : <>
      <Box sx={{ py: { xs: 2, md: 4 } }}><Typography variant="overline" color="primary">ENERGY, IN PLAIN LANGUAGE</Typography><Typography variant="h1" sx={{ mb: 2 }}>Knowledge for the energy journey.</Typography><Typography color="text.secondary" sx={{ mb: 3, maxWidth: 680 }}>Useful ideas for solar, electrical safety and the choices that make energy work better in your home or business.</Typography></Box>
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 4 }} aria-label="Filter articles by topic">{categories.map(item => <Chip key={item} label={item} clickable color={category === item ? 'primary' : 'default'} variant={category === item ? 'filled' : 'outlined'} onClick={() => setCategory(item)} aria-pressed={category === item}/>)}</Box>
      {posts.length === 0 && <Typography>New articles will appear here when they are published.</Typography>}
      {posts.length>0 && visiblePosts.length===0 && <Typography>No articles are published for this topic yet.</Typography>}
      <Grid container spacing={3}>{visiblePosts.map(p => <Grid key={p.id} size={{ xs: 12, sm: 6, md: 4 }}><Card sx={{ height: '100%' }}>
        {p.mediaType === 'image' && p.image ? <CardMedia component="img" image={publicAsset(p.image)} alt={p.title} height={210} sx={{ objectFit: 'cover' }} /> : videoUrl(p.videoUrl || '') ? <ExternalVideo src={videoUrl(p.videoUrl)!} title={p.title} height={210} /> : null}
        <CardContent><Typography variant="overline">{p.category} · {p.publishedDate} · {readTime(p)} min read</Typography><Typography variant="h5" component="h2" sx={{ my: 1 }}>{p.title}</Typography><Typography color="text.secondary" sx={{ mb: 2 }}>{p.excerpt}</Typography><Button component={RouterLink} to={`/blog/${p.slug}`}>Read the guide</Button></CardContent>
      </Card></Grid>)}</Grid>
      </>}
    </>}
    {slug && <Button component={RouterLink} to="/blog" sx={{ mt: 4 }}>Back to articles</Button>}
  </Container><Footer /></>;
}
