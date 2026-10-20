import React from 'react';
import { Avatar, Box, Button, Container, Typography } from '@mui/material';
import { ArrowForward, ArrowOutward, BatteryChargingFull, SolarPower, WhatsApp, WbSunny } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import ProductCard from '../components/ProductCard';
import Footer from '../components/Footer';
import PageMeta from '../components/PageMeta';
import { publicAsset } from '../utils/publicAsset';
import { EnergyFlow, ProjectGallery, SavingsLab, SystemConfigurator } from '../components/SolarExperiences';

const services = [
  { title: 'Residential solar', description: 'Thoughtful systems built around the rhythm of your home, from everyday appliances to backup priorities.', icon: <SolarPower />, image: '/solarpeople.jpg', href: '/services' },
  { title: 'Business & farm', description: 'Practical energy planning for shops, offices, farms and growing operations.', icon: <WbSunny />, image: '/solafarm.jpg', href: '/services' },
  { title: 'Battery backup', description: 'Keep the essentials running with storage and backup designed around your loads.', icon: <BatteryChargingFull />, image: '/leadacidbatteries.jpeg', href: '/services' },
];

const process = [
  ['01', 'Listen & assess', 'We learn how you use power and understand your site.'],
  ['02', 'Design the system', 'A clear recommendation follows your needs and conditions.'],
  ['03', 'Install with care', 'Equipment is installed and commissioned by professionals.'],
  ['04', 'Stay supported', 'Get guidance on using and maintaining your system.'],
];

const Home: React.FC = () => {
  const { products } = useProducts();
  const featuredProducts = products.filter(product => product.featured).slice(0, 4);

  return <Box component="main" className="showroom-home">
    <PageMeta title="Solar energy systems designed around you" description="Explore solar, battery backup and energy solutions from Top Heights Solar in Kenya. Plan a system around your home, business or farm." path="/" />

    <section className="hero-showroom">
      <img className="hero-image" src={publicAsset('/solarpeople.jpg')} alt="Solar technicians working on a rooftop installation" />
      <div className="hero-scrim" />
      <div className="hero-grid-texture" />
      <Container maxWidth="xl" className="hero-content">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7 }} className="hero-copy">
          <div className="hero-kicker"><span className="sun-pulse">☼</span> SOLAR, DESIGNED FOR KENYA</div>
          <Typography component="h1">Energy that works<br /><em>as hard as you do.</em></Typography>
          <Typography className="hero-subtitle">Intelligent solar systems for Kenyan homes, businesses and farms. Designed around your needs. Installed for the long run.</Typography>
          <div className="hero-actions">
            <Button className="hero-primary" variant="contained" endIcon={<ArrowOutward />} onClick={() => window.dispatchEvent(new Event('open-quote-wizard'))}>Plan your solar system</Button>
            <Button className="hero-secondary" component={Link} to="/services" endIcon={<ArrowForward />}>Explore solutions</Button>
          </div>
          <div className="hero-assurance"><span><i />Professional assessment</span><span><i />Thoughtful system design</span></div>
        </motion.div>
        <motion.div className="hero-image-caption" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: .4, duration: .6 }}><span className="caption-rule" /><span>BUILT AROUND<br />YOUR EVERYDAY</span></motion.div>
      </Container>
      <div className="hero-bottom-line"><span>NAIROBI · KENYA</span><span>01 / ENERGY, REIMAGINED</span><span>SCROLL TO EXPLORE ↓</span></div>
    </section>

    <section className="trust-strip"><Container maxWidth="xl"><div className="trust-strip-label">A BETTER WAY TO GO SOLAR</div><div className="trust-items">
      <div><span>01</span><strong>Needs-first design</strong><small>Planned around the way you use energy</small></div>
      <div><span>02</span><strong>Professional installation</strong><small>Thoughtful work from survey to commissioning</small></div>
      <div><span>03</span><strong>Support that stays</strong><small>Guidance for the system you bring home</small></div>
      <a href="tel:+254711343412" className="trust-call"><span>LET’S TALK</span><strong>+254 711 343 412 <ArrowOutward /></strong></a>
    </div></Container></section>

    <SavingsLab />

    <section className="solutions-section section-wrap"><div className="solutions-intro"><div className="section-heading"><span className="eyebrow">SOLAR, WITH INTENTION</span><Typography variant="h2">Your energy has a different story.</Typography><Typography>Our job is to understand it, then help you find the right way forward.</Typography></div><Button component={Link} to="/services" endIcon={<ArrowForward />}>Explore all solutions</Button></div><div className="solution-grid">{services.map((service, index) => <Link to={service.href} key={service.title} className={`solution-card solution-card-${index + 1}`}><div className="solution-image-wrap"><img src={publicAsset(service.image)} alt="" /><span className="solution-number">0{index + 1}</span></div><div className="solution-card-content"><Avatar>{service.icon}</Avatar><div><Typography variant="h5">{service.title}</Typography><Typography variant="body2">{service.description}</Typography></div><ArrowOutward className="solution-arrow" /></div></Link>)}</div></section>

    <ProjectGallery />
    <EnergyFlow />
    <SystemConfigurator />

    <section className="process-section"><Container maxWidth="xl"><div className="process-top"><div className="section-heading"><span className="eyebrow light">THE WORK BEHIND GOOD ENERGY</span><Typography variant="h2">From first question<br />to power that feels right.</Typography></div><Typography className="process-note">Every site is different. A careful process helps make the system fit what matters most to you.</Typography></div><div className="process-grid">{process.map(([number, title, copy]) => <div className="process-step" key={number}><span>{number}</span><div><Typography variant="h5">{title}</Typography><Typography>{copy}</Typography></div><i /></div>)}</div></Container></section>

    {featuredProducts.length > 0 && <section className="featured-shop-section section-wrap"><div className="featured-shop-heading"><div className="section-heading"><span className="eyebrow">THE EQUIPMENT THAT MAKES IT WORK</span><Typography variant="h2">Explore the solar shop.</Typography><Typography>Shop currently listed products and get help choosing the right equipment.</Typography></div><Button component={Link} to="/shop" endIcon={<ArrowForward />}>Visit the shop</Button></div><div className="featured-products">{featuredProducts.map(product => <ProductCard key={product.id} product={product} />)}</div></section>}

    <section className="knowledge-section"><Container maxWidth="xl"><div className="knowledge-panel"><div><span className="eyebrow light">ENERGY, IN PLAIN LANGUAGE</span><Typography variant="h2">A more confident energy decision starts with a good question.</Typography><Typography>Explore practical guides to batteries, inverters, solar planning and everyday energy use.</Typography><Button component={Link} to="/blog" variant="contained" endIcon={<ArrowOutward />}>Visit the blog</Button></div><div className="knowledge-orbit" aria-hidden="true"><span className="knowledge-sun">☼</span><div><span>Learn</span><span>Compare</span><span>Choose</span></div></div></div></Container></section>

    <section className="closing-cta"><Container maxWidth="xl"><div className="closing-inner"><div><span className="eyebrow light">LET’S MAKE A PLAN</span><Typography variant="h2">Let’s design energy<br />around your life.</Typography><Typography>Tell us what you need. We’ll help you take the next step.</Typography></div><div className="closing-actions"><Button variant="contained" onClick={() => window.dispatchEvent(new Event('open-quote-wizard'))} endIcon={<ArrowOutward />}>Start a solar quote</Button><Button component="a" href="https://wa.me/254711343412?text=Hello%20Top%20Heights%20Solar%2C%20I%27d%20like%20to%20talk%20about%20solar." target="_blank" rel="noreferrer" startIcon={<WhatsApp />}>Talk on WhatsApp</Button></div><div className="closing-spark">☼</div></div></Container></section>
    <Footer />
  </Box>;
};

export default Home;
