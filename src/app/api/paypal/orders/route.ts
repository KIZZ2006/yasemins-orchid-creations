import { NextRequest, NextResponse } from 'next/server';
import { createPayPalOrder, PayPalError, isPayPalConfigured } from '@/lib/paypal';

interface CreateOrderRequest {
  amount: string;
  currency?: string;
  description?: string;
}

export async function POST(request: NextRequest) {
  try {
    if (!isPayPalConfigured()) {
      return NextResponse.json(
        { error: 'PayPal not configured' },
        { status: 503 }
      );
    }

    const body: CreateOrderRequest = await request.json();

    if (!body.amount || parseFloat(body.amount) <= 0) {
      return NextResponse.json(
        { error: 'Valid amount is required' },
        { status: 400 }
      );
    }

    const orderId = await createPayPalOrder(
      parseFloat(body.amount).toFixed(2),
      body.currency || 'USD',
      body.description
    );

    return NextResponse.json({ orderId }, { status: 201 });
  } catch (error) {
    if (error instanceof PayPalError) {
      console.error('PayPal order creation error:', error.message);
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }
    console.error('Order creation failed:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
