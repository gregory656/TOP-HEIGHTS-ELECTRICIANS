import React, { useEffect, useState } from 'react';
import { AppBar, Avatar, Backdrop, Badge, Box, Button, CircularProgress, Drawer, IconButton, Menu, MenuItem, Toolbar, Typography } from '@mui/material';
import { ArrowOutward, Close, Menu as MenuIcon, ShoppingBagOutlined, SolarPower } from '@mui/icons-material';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoginModal from './LoginModal';
import CheckoutSidebar from './CheckoutSidebar';
import PremiumSidebar, { type NavItem } from './PremiumSidebar';
import { useCart } from '../context/CartContext';
import { clearAdminAccessFlag, clearStoredUsername } from '../utils/courseStorage';
import { QuoteWizard } from './SolarExperiences';

const navItems: NavItem[] = [
  { text: 'Home', icon: <SolarPower />, path: '/' },
  { text: 'Services', icon: <SolarPower />, path: '/services' },
  { text: 'Shop', icon: <ShoppingBagOutlined />, path: '/shop' },
  { text: 'Blog', icon: <SolarPower />, path: '/blog' },
  { text: 'About', icon: <SolarPower />, path: '/about' },
  { text: 'Business admin', icon: <SolarPower />, path: '/admin', adminOnly: true },
  { text: 'Learning admin', icon: <SolarPower />, path: '/admin-dashboard', adminOnly: true },
];

const Layout: React.FC = () => {
  const location = useLocation();
  const { user, logout, isAuthenticated, loginModalOpen, setLoginModalOpen, authLoading } = useAuth();
  const { cartCount } = useCart();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [accountAnchor, setAccountAnchor] = useState<HTMLElement | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const isAdminArea = ['/admin', '/admin-dashboard', '/student-dashboard', '/profile'].some(path => location.pathname.startsWith(path));
  const adminAccess = !authLoading && user?.role === 'admin';
  const activePath = location.pathname.startsWith('/shop/') ? '/shop' : location.pathname.startsWith('/blog/') ? '/blog' : location.pathname;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => { clearStoredUsername(); clearAdminAccessFlag(); logout(); };
  const publicLinks = [
    { label: 'Solutions', href: '/services' }, { label: 'Projects', href: '/#projects' },
    { label: 'Shop', href: '/shop' }, { label: 'Insights', href: '/blog' }, { label: 'About', href: '/about' },
  ];
  const openQuote = () => { window.dispatchEvent(new Event('open-quote-wizard')); setMobileOpen(false); };

  return <Box sx={{ minHeight: '100vh' }}>
    <Backdrop sx={{ zIndex: theme => theme.zIndex.drawer + 5, color: '#0E7A3D', bgcolor: 'rgba(248,250,247,.84)' }} open={authLoading}><CircularProgress color="inherit" /></Backdrop>
    {isAdminArea ? <>
      <PremiumSidebar navItems={navItems.filter(item => !item.adminOnly || adminAccess)} collapsed={false} activePath={activePath} isAdmin={adminAccess} logoSrc="/topeheights.jpeg" logoAlt="Top Heights" onToggle={() => undefined} />
      <Box component="main" sx={{ ml: { xs: 0, md: '280px' }, minHeight: '100vh' }}><Toolbar /><Outlet /></Box>
    </> : <>
      <AppBar position="fixed" elevation={0} className={`public-header ${location.pathname === '/' ? 'home-header' : 'inner-header'} ${scrolled ? 'is-scrolled' : ''}`}>
        <Toolbar className="public-header-inner">
          <Link to="/" className="brand-lockup" aria-label="Top Heights Solar home">
            <span className="brand-mark"><SolarPower /></span><span className="brand-name">TOP HEIGHTS<small>SOLAR · KENYA</small></span>
          </Link>
          <Box className="desktop-navigation" component="nav" aria-label="Main navigation">
            {publicLinks.map(link => link.label === 'Solutions' ? <Button key={link.label} onMouseEnter={event => setMenuAnchor(event.currentTarget)} onClick={event => setMenuAnchor(event.currentTarget)} aria-expanded={Boolean(menuAnchor)}>{link.label}</Button> : <Button key={link.label} component={Link} to={link.href}>{link.label}</Button>)}
          </Box>
          <Box sx={{ flex: 1 }} />
          <IconButton className="header-cart" aria-label={`Open cart, ${cartCount} items`} onClick={() => setCheckoutOpen(true)}><Badge badgeContent={cartCount} color="success"><ShoppingBagOutlined /></Badge></IconButton>
          {isAuthenticated && user ? <>
            <Button onClick={event => setAccountAnchor(event.currentTarget)} sx={{ display: { xs: 'none', md: 'inline-flex' }, minWidth: 'auto', color: 'inherit', maxWidth: 150 }} aria-haspopup="menu" aria-expanded={Boolean(accountAnchor)}>{user.name}</Button>
            <Menu anchorEl={accountAnchor} open={Boolean(accountAnchor)} onClose={() => setAccountAnchor(null)}>
              <MenuItem component={Link} to="/profile" onClick={() => setAccountAnchor(null)}>My profile</MenuItem>
              {adminAccess ? <MenuItem component={Link} to="/admin" onClick={() => setAccountAnchor(null)}>Business admin</MenuItem> : <MenuItem component={Link} to="/student-dashboard" onClick={() => setAccountAnchor(null)}>My learning</MenuItem>}
              {adminAccess && <MenuItem component={Link} to="/admin-dashboard" onClick={() => setAccountAnchor(null)}>Learning admin</MenuItem>}
              <MenuItem onClick={() => { handleLogout(); setAccountAnchor(null); }}>Sign out</MenuItem>
            </Menu>
          </> : <Button onClick={() => setLoginModalOpen(true)} sx={{ display: { xs: 'none', md: 'inline-flex' }, minWidth: 'auto', color: 'inherit' }}>Sign in</Button>}
          <Button className="quote-nav-cta" variant="contained" onClick={openQuote} endIcon={<ArrowOutward />}>Get a quote</Button>
          <IconButton className="mobile-menu-button" aria-label="Open navigation" onClick={() => setMobileOpen(true)}><MenuIcon /></IconButton>
        </Toolbar>
      </AppBar>
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)} onMouseLeave={() => setMenuAnchor(null)} MenuListProps={{ onMouseLeave: () => setMenuAnchor(null) }} PaperProps={{ className: 'solutions-mega-menu' }}>
        <Box className="mega-menu-grid">
          <Box className="mega-menu-feature"><span>DESIGNED AROUND YOUR DAY</span><Typography variant="h5">Energy for the way Kenya lives.</Typography><Typography variant="body2">Explore solutions that start with your appliances, your site and your priorities.</Typography><Button component={Link} to="/services" onClick={() => setMenuAnchor(null)}>All solutions <ArrowOutward /></Button></Box>
          {[['Residential solar', 'For homes and everyday essentials'], ['Commercial energy', 'For teams, shops and institutions'], ['Battery backup', 'Keep the important things running']].map(([title, detail]) => <MenuItem key={title} component={Link} to="/services" onClick={() => setMenuAnchor(null)}><span className="mega-menu-icon"><SolarPower /></span><span><strong>{title}</strong><small>{detail}</small></span><ArrowOutward fontSize="small" /></MenuItem>)}
        </Box>
      </Menu>
      <Drawer anchor="right" open={mobileOpen} onClose={() => setMobileOpen(false)} PaperProps={{ className: 'mobile-nav-drawer' }}>
        <Box className="mobile-nav-top"><Link to="/" className="brand-lockup" onClick={() => setMobileOpen(false)}><span className="brand-mark"><SolarPower /></span><span className="brand-name">TOP HEIGHTS<small>SOLAR · KENYA</small></span></Link><IconButton aria-label="Close navigation" onClick={() => setMobileOpen(false)}><Close /></IconButton></Box>
        <Box component="nav" className="mobile-nav-links">{publicLinks.map(link => <Button key={link.label} component={Link} to={link.href} onClick={() => setMobileOpen(false)}>{link.label}<ArrowOutward /></Button>)}{isAuthenticated && user ? <><Button component={Link} to="/profile" onClick={() => setMobileOpen(false)}>My profile<ArrowOutward /></Button><Button component={Link} to={adminAccess?'/admin':'/student-dashboard'} onClick={() => setMobileOpen(false)}>{adminAccess?'Business admin':'My learning'}<ArrowOutward /></Button><Button onClick={() => { handleLogout(); setMobileOpen(false); }}>Sign out</Button></> : <Button onClick={() => { setLoginModalOpen(true); setMobileOpen(false); }}>Sign in</Button>}</Box>
        <Button variant="contained" onClick={openQuote} endIcon={<ArrowOutward />}>Plan your solar system</Button>
        <Typography className="mobile-nav-contact">Questions? Call <a href="tel:+254711343412">+254 711 343 412</a></Typography>
      </Drawer>
      <Box component="main" className={`public-main ${location.pathname === '/' ? 'home-main' : 'inner-main'}`}><Outlet /></Box>
    </>}
    <LoginModal open={loginModalOpen} onClose={() => setLoginModalOpen(false)} />
    <CheckoutSidebar open={checkoutOpen} onClose={() => setCheckoutOpen(false)} />
    {!isAdminArea && <QuoteWizard />}
  </Box>;
};

export default Layout;
