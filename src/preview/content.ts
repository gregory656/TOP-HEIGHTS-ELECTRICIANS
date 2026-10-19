import type { BlogPost } from '../services/contentService';
const post: BlogPost = { id: 'preview-article', title: 'Choosing solar for your home', slug: 'choosing-solar', excerpt: 'Sample article for the visual preview.', summary: 'Demo content only.', content: 'This preview shows the article layout. Publishing and uploads are disabled.', author: 'Top Heights', category: 'Solar', tags: ['solar'], mediaType: 'image', image: '/solarenergy.jpeg', videoUrl: '', embedUrl: '', status: 'published', publishedDate: '2026-09-24', seoTitle: '', seoDescription: '' };
export const subscribePosts = (callback: (posts: BlogPost[]) => void) => { callback([post]); return () => {}; };
export const subscribeHistory = (_kind: string, _field: string, _id: string, callback: (events: never[]) => void) => { callback([]); return () => {}; };
const disabled = async (): Promise<never> => { throw new Error('Changes are disabled in this visual preview.'); };
export const saveContent = disabled;
export const adjustInventory = disabled;
export const uploadImage = disabled;
export const imageUploadsEnabled = false;
