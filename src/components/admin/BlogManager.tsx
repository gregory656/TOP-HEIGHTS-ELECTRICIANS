import { useState } from 'react';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { imageUploadsEnabled, saveContent, uploadImage, type BlogPost } from '../../services/contentService';
import BlogArticle from '../BlogArticle';

const blank = (): BlogPost => ({ id: crypto.randomUUID(), title: '', slug: '', excerpt: '', summary: '', content: '', author: 'Top Heights Electricals', category: 'Solar & electrical', tags: [], mediaType: 'image', image: '', videoUrl: '', embedUrl: '', status: 'draft', publishedDate: new Date().toISOString().slice(0, 10), seoTitle: '', seoDescription: '' });
export default function BlogManager({ posts }: { posts: BlogPost[] }) {
  const [form, setForm] = useState<BlogPost | null>(null);
  const [preview, setPreview] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const set = (key: keyof BlogPost, value: unknown) => setForm(current => current ? { ...current, [key]: value } : current);
  async function run(action: () => Promise<void>) { setBusy(true); setError(''); try { await action(); } catch (e) { setError(e instanceof Error ? e.message : 'Could not save article.'); } finally { setBusy(false); } }
  function edit(post = blank()) { setError(''); setPreview(false); setForm(post); }
  return <Stack spacing={2}>
    <Stack direction="row" gap={2} justifyContent="space-between" flexWrap="wrap"><Typography variant="h5">Blog publishing</Typography><Button variant="contained" onClick={() => edit()}>Add article</Button></Stack>
    {posts.length === 0 && <Typography>No articles yet. Create a draft to get started.</Typography>}
    {posts.map(post => <Box key={post.id} sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 2 }}><Stack direction="row" justifyContent="space-between" gap={2}><Box><Typography fontWeight={700}>{post.title}</Typography><Typography variant="body2">{post.status || 'Legacy news — migrate before editing'} · {post.publishedDate}</Typography></Box><Button disabled={!post.slug} onClick={() => edit(post)}>Edit / preview</Button></Stack></Box>)}
    <Dialog open={!!form} onClose={() => !busy && setForm(null)} maxWidth="md" fullWidth>
      <DialogTitle>{form?.version ? 'Edit article' : 'Create article'}</DialogTitle><DialogContent>{error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}{form && (preview ? <><Alert severity="info" sx={{ mb: 2 }}>Private preview. Your changes are saved only when you select Save article.</Alert><BlogArticle post={form} /></> : <Stack spacing={2} sx={{ pt: 1 }}>
        <TextField label="Title" required value={form.title} onChange={e => set('title', e.target.value)} />
        <TextField label="Slug" required value={form.slug} onChange={e => set('slug', e.target.value)} helperText="Lowercase words separated by hyphens" />
        <TextField label="Excerpt" multiline minRows={2} value={form.excerpt} onChange={e => set('excerpt', e.target.value)} />
        <TextField label="Short summary" multiline value={form.summary} onChange={e => set('summary', e.target.value)} />
        <TextField label="Main content" multiline minRows={10} value={form.content} onChange={e => set('content', e.target.value)} helperText="Plain text with paragraphs. HTML is displayed as text." />
        <Stack direction={{ xs: 'column', sm: 'row' }} gap={2}><TextField fullWidth label="Author" required value={form.author} onChange={e => set('author', e.target.value)} /><TextField fullWidth label="Category" required value={form.category} onChange={e => set('category', e.target.value)} /></Stack>
        <TextField label="Tags (comma separated)" value={form.tags.join(', ')} onChange={e => set('tags', e.target.value.split(',').map(t => t.trim()))} />
        <TextField select label="Featured media" value={form.mediaType} onChange={e => set('mediaType', e.target.value)}><MenuItem value="image">Image</MenuItem><MenuItem value="video">YouTube or Vimeo video</MenuItem></TextField>
        {form.mediaType === 'video' ? <TextField label="YouTube or Vimeo URL" value={form.videoUrl} onChange={e => setForm({ ...form, videoUrl: e.target.value, embedUrl: '' })} /> : <><TextField label="Featured image URL or site path" value={form.image} onChange={e => set('image', e.target.value)} helperText="Use an HTTPS image URL or an existing site image path." />{!imageUploadsEnabled && <Alert severity="info">File uploads are unavailable in this environment. Paste an image URL or site path above to add or replace the featured image.</Alert>}<Button component="label" disabled={busy || !imageUploadsEnabled} variant="outlined">Upload / replace featured image<input hidden disabled={!imageUploadsEnabled} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={e => { const file = e.target.files?.[0]; if (file) void run(async () => set('image', await uploadImage('news', file))); e.target.value = ''; }} /></Button></>}
        <TextField label="Publication date" type="date" value={form.publishedDate} onChange={e => set('publishedDate', e.target.value)} slotProps={{ inputLabel: { shrink: true } }} helperText="Future-dated posts stay as drafts until you publish them." />
        <TextField select label="Publication status" value={form.status} onChange={e => set('status', e.target.value)}>{['draft', 'published', 'archived'].map(status => <MenuItem key={status} value={status}>{status}</MenuItem>)}</TextField>
        <TextField label="SEO title" value={form.seoTitle} onChange={e => set('seoTitle', e.target.value)} helperText="Leave empty to use the article title" />
        <TextField label="SEO description" multiline value={form.seoDescription} onChange={e => set('seoDescription', e.target.value)} helperText="Leave empty to use the excerpt" />
      </Stack>)}</DialogContent><DialogActions><Button disabled={busy} onClick={() => setForm(null)}>Cancel</Button><Button onClick={() => setPreview(!preview)}>{preview ? 'Back to editor' : 'Preview'}</Button><Button variant="contained" disabled={busy} onClick={() => void run(async () => { if (!form) return; await saveContent('news', form.id, { ...form, tags: form.tags.filter(Boolean) }); setForm(null); })}>{busy ? 'Saving…' : 'Save article'}</Button></DialogActions>
    </Dialog>
  </Stack>;
}
