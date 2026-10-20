import { publicAsset } from '../utils/publicAsset';

export default function BrandLogo({ size = 48, decorative = false }: { size?: number; decorative?: boolean }) {
  return <img className="brand-logo" src={publicAsset('/topeheights.jpeg')} width={size} height={size}
    alt={decorative ? '' : 'Top Heights Electricals & Electricians'} />;
}
