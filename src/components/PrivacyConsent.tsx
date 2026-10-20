import { useEffect, useRef, useState } from 'react';
import { Box, Button, Link as MuiLink, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { setOptionalAnalyticsConsent } from '../services/firebase';
import { PRIVACY_KEY, readPrivacyChoice, type PrivacyChoice } from '../services/privacyPreferences';

function savedChoice() {
  try { return readPrivacyChoice(localStorage); } catch { return null; }
}
function clearAnalyticsCookies() {
  const domains = location.hostname.split('.');
  for (const cookie of document.cookie.split(';')) {
    const name = cookie.split('=')[0].trim();
    if (!/^_ga(?:_|$)|^_gid$|^_gat/.test(name)) continue;
    const expires = `${name}=; Max-Age=0; Path=/; SameSite=Lax`;
    document.cookie = expires;
    for (let i = 0; i < domains.length - 1; i++) document.cookie = `${expires}; Domain=.${domains.slice(i).join('.')}`;
  }
}

export default function PrivacyConsent() {
  const [choice, setChoice] = useState<PrivacyChoice | null>(savedChoice);
  const [open, setOpen] = useState(() => !savedChoice());
  const banner = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (choice?.analytics !== true) clearAnalyticsCookies();
    void setOptionalAnalyticsConsent(choice?.analytics === true);
  }, [choice]);
  useEffect(() => {
    const show = () => setOpen(true);
    const sync = (event: StorageEvent) => { if (event.key === PRIVACY_KEY) { const next = savedChoice(); setChoice(next); setOpen(!next); } };
    window.addEventListener('open-privacy-preferences', show);
    window.addEventListener('storage', sync);
    return () => { window.removeEventListener('open-privacy-preferences', show); window.removeEventListener('storage', sync); };
  }, []);
  useEffect(() => {
    const update = () => document.documentElement.style.setProperty('--privacy-banner-height', `${open ? banner.current?.offsetHeight || 0 : 0}px`);
    update();
    const observer = new ResizeObserver(update);
    if (banner.current) observer.observe(banner.current);
    return () => { observer.disconnect(); document.documentElement.style.setProperty('--privacy-banner-height', '0px'); };
  }, [open]);
  function choose(analytics: boolean) {
    const next: PrivacyChoice = { version: 1, analytics, savedAt: Date.now() };
    try { localStorage.setItem(PRIVACY_KEY, JSON.stringify(next)); } catch { /* Respect the choice for this visit if storage is unavailable. */ }
    if (!analytics) clearAnalyticsCookies();
    setChoice(next); setOpen(false);
  }
  if (!open) return null;
  return <Box ref={banner} component="section" className="privacy-banner" aria-labelledby="privacy-heading">
    <Box sx={{ minWidth: 0 }}><Typography id="privacy-heading" component="h2" fontWeight={750}>Your privacy, your choice</Typography>
      <Typography variant="body2" sx={{ mt: .5, color: 'text.secondary' }}>We use essential storage for sign-in, your cart and privacy choices. Optional analytics help us understand visits, only if you agree. <MuiLink component={Link} to="/privacy">Privacy policy</MuiLink></Typography>
    </Box>
    <Stack direction="row" gap={1} flexWrap="wrap" sx={{ flexShrink: 0 }}>
      <Button variant="outlined" onClick={() => choose(false)}>Essential only</Button>
      <Button variant="contained" onClick={() => choose(true)}>Accept optional analytics</Button>
    </Stack>
  </Box>;
}
