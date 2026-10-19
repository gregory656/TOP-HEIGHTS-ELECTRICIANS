import express, { type Express, type Request } from 'express';
import { randomUUID } from 'node:crypto';
import { CommerceError, record, reject } from './commerce';

export const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
export type ImageUpload = { kind: 'products' | 'news'; contentType: string; data: string };
export type ImageUploader = (image: ImageUpload) => Promise<string>;

export function parseImageUpload(value: unknown): ImageUpload {
  const body = record(value);
  if (body.kind !== 'products' && body.kind !== 'news') reject('Invalid image destination.');
  if (typeof body.contentType !== 'string' || !['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(body.contentType)) reject('Choose a JPG, PNG, WebP or GIF image.');
  if (typeof body.data !== 'string' || !body.data.length || body.data.length > Math.ceil(MAX_IMAGE_BYTES / 3) * 4 || !/^[A-Za-z0-9+/]+={0,2}$/.test(body.data)) return reject('Choose an image smaller than 3 MB.');
  const bytes = Buffer.from(body.data, 'base64');
  if (bytes.length >= MAX_IMAGE_BYTES || bytes.toString('base64') !== body.data) reject('Invalid image or image larger than 3 MB.');
  const matches = body.contentType === 'image/png' ? bytes.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex'))
    : body.contentType === 'image/jpeg' ? bytes.subarray(0, 3).equals(Buffer.from('ffd8ff', 'hex'))
    : body.contentType === 'image/gif' ? ['GIF87a', 'GIF89a'].includes(bytes.subarray(0, 6).toString('ascii'))
    : bytes.subarray(0, 4).toString('ascii') === 'RIFF' && bytes.subarray(8, 12).toString('ascii') === 'WEBP';
  if (!matches) reject('The selected file does not match its image type.');
  return { kind: body.kind, contentType: body.contentType, data: body.data } as ImageUpload;
}

export function cloudinaryUploader(config: { cloudName?: string; apiKey?: string; apiSecret?: string }): ImageUploader {
  return async image => {
    const { cloudName, apiKey, apiSecret } = config;
    if (!cloudName || !/^[a-zA-Z0-9_-]+$/.test(cloudName) || !apiKey || !apiSecret) throw new CommerceError(503, 'Image uploads are not configured yet.');
    const form = new FormData();
    form.set('file', `data:${image.contentType};base64,${image.data}`);
    form.set('public_id', `commerce/${image.kind}/${randomUUID()}`);
    form.set('overwrite', 'false');
    form.set('allowed_formats', 'jpg,png,webp,gif');
    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST', redirect: 'error', signal: AbortSignal.timeout(25000), body: form,
        headers: { Authorization: `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString('base64')}` },
      });
      if (!response.ok) throw Error('Upload failed');
      const data = record(await response.json());
      const url = new URL(String(data.secure_url || ''));
      if (url.protocol !== 'https:' || url.hostname !== 'res.cloudinary.com' || url.username || url.password || url.port || !url.pathname.startsWith(`/${cloudName}/image/upload/`)) throw Error('Unexpected image address');
      return url.href;
    } catch {
      // Never expose Cloudinary responses or account credentials to clients/logs.
      throw new CommerceError(502, 'Image upload could not be confirmed. Check the media library before retrying.');
    }
  };
}

// Register before the normal 100 KB JSON parser. Only an authenticated admin can
// reach the larger parser; the 3 MB image limit fits Netlify's buffered payload.
export function mediaRoutes(app: Express, admin: (req: Request) => Promise<string>, upload?: ImageUploader) {
  app.post('/admin/media/upload', (req, _res, next) => { void admin(req).then(() => next(), next); },
    express.json({ limit: '4200kb' }), (req, res, next) => {
      void (async () => {
        if (!upload) throw new CommerceError(503, 'Image uploads are not configured yet.');
        res.json({ url: await upload(parseImageUpload(req.body)) });
      })().catch(next);
    });
}
