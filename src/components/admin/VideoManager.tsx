import { useEffect, useState } from 'react';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { services } from '../../data/services';
import { loadAdminVideos, saveVideo, type WebsiteVideo } from '../../services/videoService';
import { videoUrl } from '../../utils/videoUrl';
import ExternalVideo from '../ExternalVideo';
const blank = (): WebsiteVideo => ({ id: crypto.randomUUID(), title: '', videoUrl: '', placement: 'all-services', order: 0, status: 'draft' });
export default function VideoManager() {
  const [videos, setVideos] = useState<WebsiteVideo[]>([]);
  const [form, setForm] = useState<WebsiteVideo | null>(null);
  const [preview, setPreview] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const reload = async () => setVideos((await loadAdminVideos()).videos);
  useEffect(() => { let active = true; loadAdminVideos().then(result => { if (active) setVideos(result.videos); }).catch(e => { if (active) setError(e instanceof Error ? e.message : 'Could not load videos.'); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, []);
  async function save(video: WebsiteVideo) {
    setBusy(true); setError(''); setNotice('');
    try {
      if (!video.title.trim() || !videoUrl(video.videoUrl)) throw new Error('Enter a title and a valid HTTPS YouTube or Vimeo link.');
      if (!Number.isInteger(video.order) || video.order < 0 || video.order > 10000) throw new Error('Display order must be a whole number from 0 to 10000.');
      await saveVideo(video); setForm(null); setPreview(false); setNotice('Video saved.'); await reload();
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not save the video.'); }
    finally { setBusy(false); }
  }
  function edit(video: WebsiteVideo) { setForm({ ...video }); setPreview(false); setError(''); }
  return <Stack spacing={2}>
    <Typography variant="h5">Website videos</Typography><Typography color="text.secondary">Manage Services videos using YouTube or Vimeo links. Blog videos are edited inside each article; course videos stay in Learning admin. Hiding or removing a link does not delete the original video.</Typography>
    {error && <Alert severity="error">{error}</Alert>}{notice && <Alert severity="success">{notice}</Alert>}
    <Stack direction="row" gap={1} flexWrap="wrap"><Button variant="contained" disabled={busy || loading} onClick={() => edit(blank())}>Add video</Button><Button disabled={busy} onClick={() => { setError(''); setLoading(true); void reload().catch(e => setError(e instanceof Error ? e.message : 'Could not refresh.')).finally(() => setLoading(false)); }}>Refresh videos</Button>
      {!videos.some(v => v.id === 'original-services-video') && <Button disabled={busy || loading} onClick={() => edit({ ...blank(), id: 'original-services-video', title: 'Solar installation overview', videoUrl: 'https://www.youtube.com/watch?v=2agQs02DziE' })}>Import original Services video as draft</Button>}
    </Stack>
    {loading ? <Typography>Loading videos…</Typography> : !videos.length ? <Alert severity="info">No managed videos yet. Import the existing link or add your own, then publish it.</Alert> : [...videos].sort((a,b) => a.order-b.order || a.id.localeCompare(b.id)).map(video => <Box key={video.id} sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 2 }}>
      <Typography fontWeight={700}>{video.title}</Typography><Typography variant="body2">{video.placement === 'all-services' ? 'All services' : services.find(s => s.id === video.placement)?.title || video.placement} · {video.status} · Order {video.order}</Typography>
      <Stack direction="row" gap={1} flexWrap="wrap"><Button disabled={busy} onClick={() => edit(video)}>Edit / preview</Button><Button disabled={busy || video.status === 'archived'} onClick={() => void save({ ...video, status: video.status === 'published' ? 'draft' : 'published' })}>{video.status === 'published' ? 'Hide' : 'Publish'}</Button><Button color="error" disabled={busy || video.status === 'archived'} onClick={() => { if (window.confirm('Remove this video from the website? Its record will remain archived.')) void save({ ...video, status: 'archived' }); }}>Remove</Button></Stack>
    </Box>)}
    <Dialog open={!!form} onClose={() => { if (!busy) setForm(null); }} fullWidth maxWidth="sm"><DialogTitle>{preview ? 'Preview video' : 'Edit website video'}</DialogTitle><DialogContent>{error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}{form && (preview ? videoUrl(form.videoUrl) ? <ExternalVideo key={form.videoUrl} src={videoUrl(form.videoUrl)} title={form.title || 'Video preview'} /> : <Alert severity="info">Enter a valid YouTube or Vimeo link first.</Alert> : <Stack spacing={2} sx={{ pt: 1 }}>
      <TextField required label="Video title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
      <TextField required label="YouTube or Vimeo URL" value={form.videoUrl} onChange={e => setForm({ ...form, videoUrl: e.target.value })} helperText="Paste the share link. No video file is uploaded." />
      <TextField select label="Placement" value={form.placement} onChange={e => setForm({ ...form, placement: e.target.value })}><MenuItem value="all-services">All services</MenuItem>{services.map(service => <MenuItem key={service.id} value={service.id}>{service.title}</MenuItem>)}</TextField>
      <TextField label="Display order" type="number" value={Number.isNaN(form.order) ? '' : form.order} onChange={e => setForm({ ...form, order: e.target.value === '' ? NaN : Number(e.target.value) })} helperText="Lower numbers appear first." />
      <TextField select label="Publication status" value={form.status} onChange={e => setForm({ ...form, status: e.target.value as WebsiteVideo['status'] })}>{['draft', 'published', 'archived'].map(status => <MenuItem key={status} value={status}>{status}</MenuItem>)}</TextField>
    </Stack>)}</DialogContent><DialogActions><Button disabled={busy} onClick={() => setForm(null)}>Cancel</Button><Button disabled={busy} onClick={() => setPreview(!preview)}>{preview ? 'Back to editor' : 'Preview'}</Button><Button variant="contained" disabled={busy || !form} onClick={() => { if (form) void save(form); }}>{busy ? 'Saving…' : 'Save video'}</Button></DialogActions></Dialog>
  </Stack>;
}
