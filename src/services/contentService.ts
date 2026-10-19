import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, storage } from './firebase';
import { commerceApi } from './orderService';
import { orderTime } from './orderModel';

export type BlogPost = {
  id: string; title: string; slug: string; excerpt: string; summary: string; content: string; author: string;
  category: string; tags: string[]; mediaType: 'image' | 'video'; image: string; videoUrl: string; embedUrl: string;
  status: 'draft' | 'published' | 'archived'; publishedDate: string; seoTitle: string; seoDescription: string;
  version?: number; createdAt?: unknown; updatedAt?: unknown;
};
export type AuditEvent = { id: string; actor: string; createdAt: unknown; note?: string; type?: string; quantity?: number; previousQuantity?: number; newQuantity?: number; from?: string; to?: string };
export function subscribePosts(callback: (posts: BlogPost[]) => void, error: (error: Error) => void, admin = false) {
  const posts = collection(db, 'news');
  return onSnapshot(admin ? posts : query(posts, where('status', '==', 'published')), snapshot => callback(snapshot.docs.map(d => ({ ...d.data(), id: d.id }) as BlogPost).sort((a, b) => (b.publishedDate || '').localeCompare(a.publishedDate || ''))), error);
}
export function subscribeHistory(kind: 'inventoryMovements' | 'fulfilmentEvents', field: 'productId' | 'orderId', id: string, callback: (events: AuditEvent[]) => void, error: (error: Error) => void) {
  return onSnapshot(query(collection(db, kind), where(field, '==', id)), snapshot => callback(snapshot.docs.map(d => ({ ...d.data(), id: d.id }) as AuditEvent).sort((a, b) => orderTime(b.createdAt) - orderTime(a.createdAt))), error);
}
export const saveContent = (kind: 'products' | 'news', id: string, data: unknown) => commerceApi(`/admin/${kind}/${encodeURIComponent(id)}`, data);
export const adjustInventory = (id: string, data: unknown) => commerceApi(`/admin/products/${encodeURIComponent(id)}/stock`, data);
export const imageUploadsEnabled = import.meta.env.VITE_IMAGE_UPLOADS_ENABLED !== 'false';
export async function uploadImage(kind: 'products' | 'news', file: File) {
  if (!imageUploadsEnabled) throw new Error('Image uploads are unavailable. Use an existing image URL or site image path.');
  const useCloudinary = import.meta.env.VITE_IMAGE_UPLOAD_PROVIDER === 'cloudinary';
  const maxMb = useCloudinary ? 3 : 5;
  if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type) || file.size >= maxMb * 1024 * 1024) throw new Error(`Choose a JPG, PNG, WebP or GIF smaller than ${maxMb} MB.`);
  if (useCloudinary) {
    const data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('The image could not be read.'));
      reader.onload = () => resolve(String(reader.result).split(',')[1]);
      reader.readAsDataURL(file);
    });
    const result = await commerceApi<{ url: string }>('/admin/media/upload', { kind, contentType: file.type, data });
    return result.url;
  }
  const object = ref(storage, `commerce/${kind}/${crypto.randomUUID()}`);
  await uploadBytes(object, file, { contentType: file.type });
  return getDownloadURL(object);
}
