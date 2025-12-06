"use client";

import { useEffect, useRef, useState } from 'react';
import { PayPalButtons, PayPalScriptProvider, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { toast } from 'sonner';

interface PayPalButtonProps {
  amount: string;
  description?: string;
  onSuccess: (paypalOrderId: string, captureId: string) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
}

function PayPalButtonWrapper({ amount, description, onSuccess, onError, disabled }: PayPalButtonProps) {
  const [{ isResolved }] = usePayPalScriptReducer();
  const [loading, setLoading] = useState(false);

  if (!isResolved) {
    return (
      <div className="w-full h-12 bg-muted animate-pulse rounded-lg flex items-center justify-center">
        <span className="text-sm text-muted-foreground">Loading PayPal...</span>
      </div>
    );
  }

  return (
    <PayPalButtons
      disabled={disabled || loading}
      style={{
        layout: 'vertical',
        color: 'gold',
        shape: 'rect',
        label: 'paypal',
      }}
      createOrder={async () => {
        try {
          setLoading(true);
          
          const response = await fetch('/api/paypal/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              amount: parseFloat(amount).toFixed(2),
              currency: 'USD',
              description: description || 'Digital Artwork Purchase',
            }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to create order');
          }

          const { orderId } = await response.json();
          return orderId;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to create order';
          toast.error(message);
          onError?.(message);
          setLoading(false);
          throw error;
        }
      }}
      onApprove={async (data) => {
        try {
          setLoading(true);
          
          const response = await fetch(`/api/paypal/capture/${data.orderID}`, {
            method: 'POST',
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to capture payment');
          }

          const result = await response.json();
          
          if (result.success) {
            toast.success('Payment completed successfully!');
            onSuccess(data.orderID, result.captureId);
          } else {
            throw new Error('Payment capture failed');
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to complete payment';
          toast.error(message);
          onError?.(message);
          setLoading(false);
        }
      }}
      onError={(err) => {
        console.error('PayPal error:', err);
        const message = 'Payment failed. Please try again.';
        toast.error(message);
        onError?.(message);
        setLoading(false);
      }}
      onCancel={() => {
        toast.info('Payment cancelled');
        setLoading(false);
      }}
    />
  );
}

export function PayPalButton(props: PayPalButtonProps) {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

  if (!clientId) {
    return (
      <div className="w-full p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
        <p className="font-semibold mb-1">⚠️ PayPal Not Configured</p>
        <p className="text-xs">
          Please add NEXT_PUBLIC_PAYPAL_CLIENT_ID to your environment variables to enable PayPal payments.
        </p>
      </div>
    );
  }

  return (
    <PayPalScriptProvider
      options={{
        clientId: clientId,
        currency: 'USD',
        intent: 'capture',
      }}
    >
      <PayPalButtonWrapper {...props} />
    </PayPalScriptProvider>
  );
}
