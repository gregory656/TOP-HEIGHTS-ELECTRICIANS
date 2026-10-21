import { commerceApi } from './orderService';
export type WebsiteVideo = { id: string; title: string; videoUrl: string; placement: string; order: number; status: 'draft' | 'published' | 'archived'; version?: number };
export const loadAdminVideos = () => commerceApi<{ videos: WebsiteVideo[] }>('/admin/videos/list');
export const saveVideo = (video: WebsiteVideo) => commerceApi(`/admin/videos/${encodeURIComponent(video.id)}`, video);
export async function loadPublicVideos(signal: AbortSignal): Promise<WebsiteVideo[]> {
  const base = (import.meta.env.VITE_COMMERCE_API_URL || '').replace(/\/+$/, '');
  if (!base) return [];
  const response = await fetch(`${base}/videos`, { signal, cache: 'no-store' });
  if (!response.ok) throw new Error('Videos are temporarily unavailable.');
  const data = await response.json();
  return data.videos;
}
export function videosForService(videos: WebsiteVideo[], serviceId: string) {
  return videos.filter(video => video.placement === 'all-services' || video.placement === serviceId)
    .sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
}
