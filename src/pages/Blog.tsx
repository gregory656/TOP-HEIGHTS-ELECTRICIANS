import { useEffect, useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { Alert, Box, Button, Card, CardContent, CardMedia, Container, Grid, Typography } from '@mui/material';
import { subscribePosts, type BlogPost } from '../services/contentService';
import BlogArticle from '../components/BlogArticle';
import PageMeta from '../components/PageMeta';
import Footer from '../components/Footer';
import { publicAsset } from '../utils/publicAsset';
import { videoUrl } from '../utils/videoUrl';

export default function Blog() {
  const { slug } = useParams();
  const [posts, setPosts] = useState<BlogPost[] | null>(null);
  const [error, setError] = useState('');
  useEffect(() => subscribePosts(setPosts, () => setError('Articles could not be loaded. Please reload to try again.')), []);
  const post = posts?.find(p => p.slug === slug);
  return <><Container maxWidth={slug ? 'md' : 'lg'} sx={{ py: { xs: 4, md: 6 } }}>
    <PageMeta title={post ? post.seoTitle || post.title : slug ? 'Article unavailable' : 'News & advice'} description={post ? post.seoDescription || post.excerpt : 'Electrical and solar news, advice and updates from Top Heights Electricals.'} path={slug ? `/blog/${slug}` : '/blog'} image={post?.image} article={!!post} noindex={!!slug && !post} />
    {error ? <Alert severity="error">{error}</Alert> : !posts ? <Typography>Loading articles…</Typography> : slug ? post ? <BlogArticle post={post} /> : <><Typography variant="h4" component="h1">Article unavailable</Typography><Typography sx={{ my: 2 }}>This article has not been published or is no longer available.</Typography></> : <>
      <Typography variant="h1" sx={{ mb: 2 }}>News & advice</Typography><Typography color="text.secondary" sx={{ mb: 4 }}>Updates, practical guidance and ideas for your electrical and solar projects.</Typography>
      {posts.length === 0 && <Typography>New articles will appear here when they are published.</Typography>}
      <Grid container spacing={3}>{posts.map(p => <Grid key={p.id} size={{ xs: 12, sm: 6, md: 4 }}><Card sx={{ height: '100%' }}>
        {p.mediaType === 'image' && p.image ? <CardMedia component="img" image={publicAsset(p.image)} alt={p.title} height={210} sx={{ objectFit: 'cover' }} /> : videoUrl(p.videoUrl || '') ? <Box component="iframe" src={videoUrl(p.videoUrl)} title={p.title} loading="lazy" allowFullScreen sx={{ width: '100%', height: 210, border: 0 }} /> : null}
        <CardContent><Typography variant="overline">{p.category} · {p.publishedDate}</Typography><Typography variant="h5" component="h2" sx={{ my: 1 }}>{p.title}</Typography><Typography color="text.secondary" sx={{ mb: 2 }}>{p.excerpt}</Typography><Button component={RouterLink} to={`/blog/${p.slug}`}>Read more</Button></CardContent>
      </Card></Grid>)}</Grid>
    </>}
    {slug && <Button component={RouterLink} to="/blog" sx={{ mt: 4 }}>Back to articles</Button>}
  </Container><Footer /></>;
}
