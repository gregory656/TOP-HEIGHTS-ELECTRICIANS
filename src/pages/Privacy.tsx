import { Button, Container, Link as MuiLink, Stack, Typography } from '@mui/material';
import PageMeta from '../components/PageMeta';
import Footer from '../components/Footer';

export default function Privacy() {
  return <><PageMeta title="Privacy policy" description="How Top Heights handles account, order and website privacy choices." path="/privacy" />
    <Container maxWidth="md" sx={{ py: { xs: 5, md: 8 } }}><Stack spacing={3}>
      <Typography variant="overline" color="primary">Last updated: 20 October 2026</Typography>
      <Typography variant="h1">Privacy at Top Heights</Typography>
      <Typography>Top Heights Electricals uses the information you provide to operate accounts, answer enquiries, process orders and arrange delivery. Contact us at <MuiLink href="mailto:topheightselectricals@gmail.com">topheightselectricals@gmail.com</MuiLink> about your information or these choices.</Typography>
      <Typography variant="h5" component="h2">Accounts, orders and enquiries</Typography>
      <Typography>Depending on the service you use, we process your name, email, phone number, delivery location, order details and payment status. Account sign-in and records are handled through Firebase. Website hosting is provided by Vercel. Uploaded public product and article images are hosted by Cloudinary. Please do not put confidential information in public images.</Typography>
      <Typography variant="h5" component="h2">Payments</Typography>
      <Typography>IntaSend handles the hosted payment checkout. We keep order references and verified payment results to reconcile orders and stock. Enter your M-Pesa PIN only in the prompt on your phone; do not send it to us.</Typography>
      <Typography variant="h5" component="h2">Essential storage and optional analytics</Typography>
      <Typography>Essential browser storage supports sign-in, your cart and your saved privacy choice. You can browse without accepting optional analytics. If analytics is configured for this website, Google/Firebase Analytics starts only after you accept it. Your choice is saved on this browser for up to six months, and you can change it below. Blocking browser storage may affect sign-in and remembered choices.</Typography>
      <Button variant="outlined" sx={{ alignSelf: 'flex-start' }} onClick={() => window.dispatchEvent(new Event('open-privacy-preferences'))}>Change privacy choices</Button>
      <Typography variant="h5" component="h2">Videos and external links</Typography>
      <Typography>YouTube and Vimeo videos load only when you choose to load the player. Those providers and external services such as WhatsApp have their own privacy terms. Our privacy banner controls optional website analytics, not the settings of a service you visit separately.</Typography>
      <Typography variant="h5" component="h2">Your information and requests</Typography>
      <Typography>Access is limited according to account and business roles. Service providers may process information outside Kenya. Account and order information may need to be kept for service, transaction and record-keeping purposes; closing an account does not necessarily remove all order records. Contact us to request access, correction or deletion, or to raise a privacy concern. Some requests may require identity verification and consideration of records we must retain.</Typography>
      <Typography>You can also read about data-subject rights at the <MuiLink href="https://www.odpc.go.ke/rights-of-a-data-subject/" target="_blank" rel="noreferrer">Office of the Data Protection Commissioner</MuiLink>.</Typography>
    </Stack></Container><Footer /></>;
}
