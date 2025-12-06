import { NextResponse } from 'next/server';
import { generateClientToken, PayPalError, isPayPalConfigured } from '@/lib/paypal';

export async function GET() {
  try {
    if (!isPayPalConfigured()) {
      return NextResponse.json(
        { error: 'PayPal not configured. Please add PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET to environment variables.' },
        { status: 503 }
      );
    }

    const clientToken = await generateClientToken();
    return NextResponse.json({ clientToken });
  } catch (error) {
    if (error instanceof PayPalError) {
      console.error('PayPal client token error:', error.message);
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }
    console.error('Client token generation failed:', error);
    return NextResponse.json(
      { error: 'Failed to generate client token' },
      { status: 500 }
    );
  }
}
