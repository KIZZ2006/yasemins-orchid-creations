"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface PayPalTestResult {
  success: boolean;
  mode?: string;
  error?: string;
  credentials?: {
    clientId: string;
    clientSecret: string;
    clientIdLength: number;
    clientSecretLength: number;
  };
  paypalResponse?: any;
}

export default function AdminSettingsPage() {
  const router = useRouter();
  const [paypalStatus, setPaypalStatus] = useState<PayPalTestResult | null>(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    checkAuth();
    testPayPalConnection();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        router.push('/admin/login');
        return;
      }

      const response = await fetch('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        localStorage.removeItem('admin_token');
        router.push('/admin/login');
      }
    } catch (error) {
      localStorage.removeItem('admin_token');
      router.push('/admin/login');
    }
  };

  const testPayPalConnection = async () => {
    setTesting(true);
    try {
      const response = await fetch('/api/paypal/test-connection');
      const data = await response.json();
      setPaypalStatus(data);
    } catch (error) {
      setPaypalStatus({
        success: false,
        error: 'Failed to test PayPal connection'
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background scanline">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => router.push('/admin')}>← BACK</Button>
          <h1 className="text-2xl font-bold inline-block ml-4 neon-text-cyan">SETTINGS</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid gap-6">
          <Card className="cyber-border bg-card/50">
            <CardHeader>
              <CardTitle className="neon-text-magenta">PAYPAL CONNECTION STATUS</CardTitle>
              <CardDescription>
                REAL-TIME PAYPAL API CONNECTIVITY TEST
              </CardDescription>
            </CardHeader>
            <CardContent>
              {testing ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm">TESTING CONNECTION...</span>
                </div>
              ) : paypalStatus ? (
                <div className="space-y-4">
                  {paypalStatus.success ? (
                    <div className="flex items-start gap-3 p-4 bg-green-950/20 border border-green-800 rounded">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-green-400">
                          ✓ PAYPAL CONNECTION SUCCESSFUL
                        </p>
                        <p className="text-xs text-green-300 mt-1">
                          Mode: {paypalStatus.mode?.toUpperCase()}
                        </p>
                        <p className="text-xs text-green-300">
                          Your store is ready to accept {paypalStatus.mode === 'live' ? 'LIVE' : 'SANDBOX'} payments!
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-4 bg-red-950/20 border border-red-800 rounded">
                        <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-red-400">
                            ✗ PAYPAL AUTHENTICATION FAILED
                          </p>
                          <p className="text-xs text-red-300 mt-1">
                            {paypalStatus.error}
                          </p>
                          {paypalStatus.paypalResponse && (
                            <p className="text-xs text-red-300 mt-1">
                              PayPal Error: {paypalStatus.paypalResponse.error_description || paypalStatus.paypalResponse.error}
                            </p>
                          )}
                        </div>
                      </div>

                      {paypalStatus.credentials && (
                        <div className="p-4 bg-muted/50 border border-border rounded">
                          <p className="text-xs font-semibold mb-2 neon-text-cyan">CURRENT CONFIGURATION:</p>
                          <div className="space-y-1 text-xs">
                            <p>Mode: <span className="neon-text-magenta">{paypalStatus.mode?.toUpperCase()}</span></p>
                            <p>Client ID: <span className="font-mono">{paypalStatus.credentials.clientId}</span></p>
                            <p>Client Secret: <span className="font-mono">{paypalStatus.credentials.clientSecret}</span></p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-start gap-3 p-4 bg-yellow-950/20 border border-yellow-800 rounded">
                        <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                        <div className="text-xs space-y-2">
                          <p className="font-semibold text-yellow-400">HOW TO FIX:</p>
                          <ol className="list-decimal list-inside space-y-1 text-yellow-300">
                            <li>Go to <a href="https://developer.paypal.com/dashboard" target="_blank" rel="noopener noreferrer" className="underline neon-text-cyan">developer.paypal.com</a></li>
                            <li>Sign in with your PayPal account</li>
                            <li>Click "Apps & Credentials" in the top menu</li>
                            <li>Switch to "Sandbox" or "Live" tab (match your desired mode)</li>
                            <li>Click "Create App" or select existing app</li>
                            <li>Copy the "Client ID" and "Secret" from the app details</li>
                            <li>Update your <span className="font-mono bg-black/30 px-1">.env</span> file with the new credentials</li>
                            <li>Restart your application</li>
                          </ol>
                          <p className="mt-3 text-yellow-400">
                            <strong>Note:</strong> Make sure your app has "Accept Payments" checked in its settings.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <Button 
                    onClick={testPayPalConnection} 
                    className="neon-button"
                    size="sm"
                  >
                    RETEST CONNECTION
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Loading...</p>
              )}
            </CardContent>
          </Card>

          <Card className="cyber-border bg-card/50">
            <CardHeader>
              <CardTitle className="neon-text-magenta">AUTO-PRICING ALGORITHM</CardTitle>
              <CardDescription>
                PRODUCTS ARE AUTOMATICALLY PRICED BASED ON CATEGORY AND COMPLEXITY
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p><strong className="neon-text-cyan">BASE PRICE:</strong> $50</p>
                <p><strong className="neon-text-cyan">WATERCOLOR:</strong> 1.5x MULTIPLIER</p>
                <p><strong className="neon-text-cyan">DIGITAL ART:</strong> 2.0x MULTIPLIER</p>
                <p><strong className="neon-text-cyan">ACRYLIC PAINTING:</strong> 2.5x MULTIPLIER</p>
                <p><strong className="neon-text-cyan">PENCIL SKETCH:</strong> 1.0x MULTIPLIER</p>
                <p className="text-muted-foreground mt-4">
                  PLUS $5 FOR EVERY 10 CHARACTERS IN THE TITLE (COMPLEXITY BONUS)
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="cyber-border bg-card/50">
            <CardHeader>
              <CardTitle className="neon-text-magenta">DISCOUNT CODES</CardTitle>
              <CardDescription>
                MANAGE DISCOUNT CODES FROM THE DATABASE
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                ACTIVE CODES CAN BE MANAGED THROUGH THE API AT /api/discount-codes
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}