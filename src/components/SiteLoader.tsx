import BrandLogo from './BrandLogo';

export default function SiteLoader({ label = 'Loading Top Heights…' }: { label?: string }) {
  return <div className="site-loader" role="status" aria-live="polite"><BrandLogo size={88} decorative />
    <span>{label}</span><span className="site-loader-line" aria-hidden="true"><i /></span>
  </div>;
}
