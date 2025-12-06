import { NextResponse } from 'next/server';

export async function GET() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const mode = process.env.PAYPAL_MODE;

  // Check if credentials exist
  if (!clientId || !clientSecret) {
    return NextResponse.json({
      success: false,
      error: 'PayPal credentials not found in environment variables',
      hasClientId: !!clientId,
      hasClientSecret: !!clientSecret,
      mode
    }, { status: 500 });
  }

  // Show partial credentials for debugging (first/last 4 chars only)
  const maskedClientId = `${clientId.substring(0, 8)}...${clientId.substring(clientId.length - 8)}`;
  const maskedSecret = `${clientSecret.substring(0, 4)}...${clientSecret.substring(clientSecret.length - 4)}`;

  // Test PayPal authentication
  const apiBase = mode === 'live' 
    ? 'https://api-m.paypal.com' 
    : 'https://api-m.sandbox.paypal.com';

  try {
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    
    const response = await fetch(`${apiBase}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    const responseText = await response.text();
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = responseText;
    }

    if (response.ok) {
      return NextResponse.json({
        success: true,
        message: 'PayPal credentials are valid!',
        mode,
        apiBase,
        credentials: {
          clientId: maskedClientId,
          clientSecret: maskedSecret,
          clientIdLength: clientId.length,
          clientSecretLength: clientSecret.length
        },
        tokenReceived: true
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'PayPal authentication failed',
        mode,
        apiBase,
        credentials: {
          clientId: maskedClientId,
          clientSecret: maskedSecret,
          clientIdLength: clientId.length,
          clientSecretLength: clientSecret.length
        },
        statusCode: response.status,
        paypalResponse: responseData
      }, { status: 401 });
    }
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: 'Connection error',
      message: error.message,
      mode,
      apiBase
    }, { status: 500 });
  }
}
