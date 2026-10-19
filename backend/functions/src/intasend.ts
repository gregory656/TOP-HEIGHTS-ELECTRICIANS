import { CommerceError, record } from './commerce';

export interface PaymentProvider {
  assertReady(): void;
  create(payload: Record<string, unknown>): Promise<Record<string, unknown>>;
  status(session: Record<string, unknown>): Promise<unknown>;
}

export function intasendProvider(mode: 'sandbox' | 'live', publicKey: string, secretKey: string): PaymentProvider {
  // IntaSend's current API uses one host; the key pair selects test or live.
  const base = 'https://api.intasend.com';
  publicKey = publicKey.trim();
  secretKey = secretKey.trim();
  function assertReady() {
    if (!publicKey || !secretKey) throw new CommerceError(503, 'Payments are not configured yet. Please contact the shop.');
    const environment = mode === 'sandbox' ? 'test' : 'live';
    if (!publicKey.startsWith(`ISPubKey_${environment}_`) || !secretKey.startsWith(`ISSecretKey_${environment}_`)) {
      throw new CommerceError(503, 'Payment credentials do not match this environment. Please contact the shop.');
    }
  }
  async function post(path: string, payload: Record<string, unknown>, authenticated: boolean) {
    assertReady();
    try {
      const response = await fetch(`${base}/api/v1/${path}/`, {
        method: 'POST', redirect: 'error', signal: AbortSignal.timeout(20000),
        headers: { 'Content-Type': 'application/json', 'X-IntaSend-Public-API-Key': publicKey,
          ...(authenticated ? { Authorization: `Bearer ${secretKey}` } : {}) },
        body: JSON.stringify({ ...payload, public_key: publicKey }),
      });
      if (!response.ok) throw new Error(`Provider HTTP ${response.status}`);
      return record(await response.json());
    } catch {
      // Never expose provider payloads, personal information or credentials to the browser/logs.
      throw new CommerceError(502, 'The payment provider could not confirm this request. Check the order status before trying again.');
    }
  }
  return {
    assertReady,
    create: payload => post('checkout', payload, false),
    // The verified webhook supplies the invoice to look up; settlement separately
    // checks the authoritative amount, currency and this server's random reference.
    status: session => post('payment/status', typeof session.invoiceId === 'string' ? {
      invoice_id: session.invoiceId,
    } : { invoice_id: '', checkout_id: session.checkoutId, signature: session.signature }, true),
  };
}
