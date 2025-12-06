import { NextRequest, NextResponse } from 'next/server';
import { capturePayPalOrder, getPayPalOrder, PayPalError, isPayPalConfigured } from '@/lib/paypal';

interface CaptureParams {
  params: Promise<{
    orderId: string;
  }>;
}

export async function POST(
  request: NextRequest,
  context: CaptureParams
) {
  try {
    if (!isPayPalConfigured()) {
      return NextResponse.json(
        { error: 'PayPal not configured' },
        { status: 503 }
      );
    }

    const { orderId } = await context.params;

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Verify order exists and is in APPROVED state
    const order = await getPayPalOrder(orderId);
    
    if (order.status !== 'APPROVED') {
      return NextResponse.json(
        { error: `Order status is ${order.status}, expected APPROVED. Customer may not have completed payment.` },
        { status: 400 }
      );
    }

    // Capture the order
    const capturedOrder = await capturePayPalOrder(orderId);

    // Check capture was successful
    const captureStatus = capturedOrder.purchase_units?.[0]?.payments?.captures?.[0]?.status;
    
    if (capturedOrder.status === 'COMPLETED' && captureStatus === 'COMPLETED') {
      return NextResponse.json({ 
        success: true,
        order: capturedOrder,
        captureId: capturedOrder.purchase_units[0].payments.captures[0].id
      }, { status: 200 });
    }

    return NextResponse.json(
      { error: `Capture failed with status: ${capturedOrder.status}` },
      { status: 400 }
    );
  } catch (error) {
    if (error instanceof PayPalError) {
      console.error('PayPal capture error:', error.message);
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }
    console.error('Order capture failed:', error);
    return NextResponse.json(
      { error: 'Failed to capture order' },
      { status: 500 }
    );
  }
}
