"use client";

import { useState } from 'react';
import { QrCode, Copy, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface UpiPaymentProps {
  amount: string;
  description?: string;
  onSuccess: (transactionId: string) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
}

export function UpiPayment({ amount, description, onSuccess, onError, disabled }: UpiPaymentProps) {
  const [transactionId, setTransactionId] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [copied, setCopied] = useState(false);

  const upiId = process.env.NEXT_PUBLIC_UPI_ID || 'ajitsharma6509-1@okaxis';
  const receiverName = 'Ajit Sharma';
  
  // Generate UPI payment URL
  const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(receiverName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(description || 'Digital Artwork Purchase')}`;

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('UPI ID copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  const handlePayment = () => {
    // Try to open UPI app
    window.open(upiUrl, '_blank');
    toast.info('Opening UPI payment app...');
  };

  const handleVerifyPayment = async () => {
    if (!transactionId.trim()) {
      toast.error('Please enter your transaction ID');
      return;
    }

    setVerifying(true);
    
    try {
      // In production, this would verify with payment gateway
      // For now, we'll accept any transaction ID and mark as pending
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Transaction ID recorded! Processing payment...');
      onSuccess(transactionId.trim());
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Verification failed';
      toast.error(message);
      onError?.(message);
    } finally {
      setVerifying(false);
    }
  };

  const convertToINR = (usdAmount: string) => {
    const inrRate = 83; // Approximate USD to INR conversion
    return (parseFloat(usdAmount) * inrRate).toFixed(2);
  };

  return (
    <div className="space-y-6">
      {/* UPI Payment Info */}
      <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg p-6">
        <div className="flex items-start gap-3 mb-4">
          <QrCode className="h-6 w-6 text-purple-400 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-bold text-lg text-purple-300 mb-1">PAY WITH UPI</h3>
            <p className="text-sm text-muted-foreground">
              Scan QR code or use UPI ID to pay directly from your UPI app
            </p>
          </div>
        </div>

        {/* Amount Display */}
        <div className="bg-background/50 rounded-lg p-4 mb-4 border border-border">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">Amount (USD):</span>
            <span className="text-xl font-bold neon-text-cyan">${amount}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Approx. INR:</span>
            <span className="text-lg font-semibold neon-text-magenta">₹{convertToINR(amount)}</span>
          </div>
        </div>

        {/* UPI ID */}
        <div className="space-y-3">
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">UPI ID</Label>
            <div className="flex gap-2">
              <Input
                value={upiId}
                readOnly
                className="bg-background/50 font-mono text-sm"
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(upiId)}
                className="flex-shrink-0"
              >
                {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">Receiver Name</Label>
            <Input
              value={receiverName}
              readOnly
              className="bg-background/50"
            />
          </div>
        </div>

        {/* Payment Button */}
        <Button
          onClick={handlePayment}
          disabled={disabled}
          className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold"
        >
          OPEN UPI APP & PAY
        </Button>
      </div>

      {/* Transaction ID Input */}
      <div className="bg-card/50 cyber-border p-6">
        <h4 className="font-bold text-lg mb-3 neon-text-cyan">VERIFY PAYMENT</h4>
        <p className="text-sm text-muted-foreground mb-4">
          After completing the payment, enter your transaction ID below to confirm
        </p>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="transactionId" className="text-sm font-semibold tracking-wider">
              TRANSACTION ID / UTR NUMBER *
            </Label>
            <Input
              id="transactionId"
              type="text"
              placeholder="Enter your UPI transaction ID"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              className="mt-1 bg-input border-border"
              disabled={disabled || verifying}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Find this in your UPI app's transaction history
            </p>
          </div>

          <Button
            onClick={handleVerifyPayment}
            disabled={disabled || !transactionId.trim() || verifying}
            className="w-full neon-button bg-transparent hover:bg-primary hover:text-primary-foreground"
          >
            {verifying ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                VERIFYING...
              </>
            ) : (
              'CONFIRM PAYMENT'
            )}
          </Button>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-yellow-950/20 border border-yellow-500/30 rounded-lg p-4">
        <p className="text-xs text-yellow-300 font-semibold mb-2">📱 PAYMENT INSTRUCTIONS:</p>
        <ol className="text-xs text-yellow-200/80 space-y-1 list-decimal list-inside">
          <li>Click "OPEN UPI APP & PAY" button above</li>
          <li>Complete payment in your UPI app (Google Pay, PhonePe, Paytm, etc.)</li>
          <li>Copy the Transaction ID from your payment confirmation</li>
          <li>Paste it above and click "CONFIRM PAYMENT"</li>
          <li>Your order will be processed after verification</li>
        </ol>
      </div>
    </div>
  );
}
