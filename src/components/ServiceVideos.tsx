import { useEffect, useState } from 'react';
import { Alert, Box, Typography } from '@mui/material';
import { loadPublicVideos, videosForService, type WebsiteVideo } from '../services/videoService';
import { videoUrl } from '../utils/videoUrl';
import ExternalVideo from './ExternalVideo';
export default function ServiceVideos({ serviceId }: { serviceId: string }) {
  const [videos, setVideos] = useState<WebsiteVideo[]>([]);
  const [error, setError] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    loadPublicVideos(controller.signal).then(setVideos).catch(() => { if (!controller.signal.aborted) setError(true); });
    return () => controller.abort();
  }, []);
  return <Box>{error && <Alert severity="info">Service videos are temporarily unavailable.</Alert>}
    {videosForService(videos, serviceId).map(video => {
      const src = videoUrl(video.videoUrl);
      return src ? <Box key={`${video.id}:${src}`} sx={{ mb: 2 }}><Typography variant="h6" sx={{ px: 3, pt: 2 }}>{video.title}</Typography><ExternalVideo src={src} title={video.title} height={280} /></Box> : null;
    })}
  </Box>;
}
