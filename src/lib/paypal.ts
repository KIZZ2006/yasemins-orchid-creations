import crypto from 'crypto';

const PAYPAL_API_BASE_SANDBOX = 'https://api-m.sandbox.paypal.com';
const PAYPAL_API_BASE_PROD = 'https://api-m.paypal.com';

const isProduction = process.env.PAYPAL_MODE === 'live';
const API_BASE = isProduction ? PAYPAL_API_BASE_PROD : PAYPAL_API_BASE_SANDBOX;
const CLIENT_ID = process.env.PAYPAL_CLIENT_ID || '';
const CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || '';

interface PayPalTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface PayPalOrder {
  id: string;
  status: 'CREATED' | 'SAVED' | 'APPROVED' | 'VOIDED' | 'COMPLETED' | 'PAYER_ACTION_REQUIRED';
  payer?: {
    email_address: string;
    name: {
      given_name: string;
      surname: string;
    };
  };
  purchase_units: Array<{
    amount: {
      value: string;
      currency_code: string;
    };
  }>;
}

interface CaptureOrderResponse {
  id: string;
  status: 'COMPLETED' | 'APPROVED' | 'SAVED' | 'VOIDED' | 'PAYER_ACTION_REQUIRED';
  purchase_units: Array<{
    payments: {
      captures: Array<{
        id: string;
        status: 'COMPLETED' | 'DECLINED' | 'PARTIALLY_REFUNDED' | 'PENDING' | 'REFUNDED';
      }>;
    };
  }>;
}

export class PayPalError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = 'PayPalError';
  }
}

/**
 * Get PayPal access token using OAuth2 client credentials flow
 */
export async function getPayPalAccessToken(): Promise<string> {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new PayPalError(500, 'PayPal credentials not configured');
  }

  const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
  
  const response = await fetch(`${API_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    const error = await response.text();
    throw new PayPalError(response.status, `Failed to get access token: ${error}`);
  }

  const data: PayPalTokenResponse = await response.json();
  return data.access_token;
}

/**
 * Generate browser client token for frontend SDK initialization
 */
export async function generateClientToken(): Promise<string> {
  const accessToken = await getPayPalAccessToken();
  
  const response = await fetch(`${API_BASE}/v1/identity/generate-token`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new PayPalError(response.status, `Failed to generate client token: ${error}`);
  }

  const data = await response.json();
  return data.client_token;
}

/**
 * Create a PayPal order (initial authorization, NOT captured yet)
 */
export async function createPayPalOrder(
  amount: string,
  currency: string = 'USD',
  purchaseDescription?: string
): Promise<string> {
  const accessToken = await getPayPalAccessToken();
  const requestId = crypto.randomUUID();

  const payload = {
    intent: 'CAPTURE',
    purchase_units: [
      {
        amount: {
          currency_code: currency,
          value: amount,
        },
        description: purchaseDescription || 'Digital Artwork Purchase',
      },
    ],
    application_context: {
      brand_name: "Yasemin's Creations",
      shipping_preference: 'NO_SHIPPING',
    },
  };

  const response = await fetch(`${API_BASE}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'PayPal-Request-Id': requestId,
      'Prefer': 'return=representation',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new PayPalError(response.status, `Failed to create order: ${JSON.stringify(error)}`);
  }

  const order: PayPalOrder = await response.json();
  return order.id;
}

/**
 * Capture a PayPal order (finalize payment)
 */
export async function capturePayPalOrder(orderId: string): Promise<CaptureOrderResponse> {
  const accessToken = await getPayPalAccessToken();

  const response = await fetch(`${API_BASE}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new PayPalError(response.status, `Failed to capture order: ${JSON.stringify(error)}`);
  }

  return response.json();
}

/**
 * Get order details
 */
export async function getPayPalOrder(orderId: string): Promise<PayPalOrder> {
  const accessToken = await getPayPalAccessToken();

  const response = await fetch(`${API_BASE}/v2/checkout/orders/${orderId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new PayPalError(response.status, `Failed to get order: ${error}`);
  }

  return response.json();
}

/**
 * Check if PayPal is configured
 */
export function isPayPalConfigured(): boolean {
  return !!(CLIENT_ID && CLIENT_SECRET);
}
