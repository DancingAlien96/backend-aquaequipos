const TILOPAY_API_URL = process.env.TILOPAY_API_URL || 'https://app.tilopay.com/api/v1';
const TILOPAY_API_USER = process.env.TILOPAY_API_USER || '';
const TILOPAY_API_PASSWORD = process.env.TILOPAY_API_PASSWORD || '';
const TILOPAY_API_KEY = process.env.TILOPAY_API_KEY || '';

let cachedToken: string | null = null;
let tokenExpiry: number | null = null;

// Obtener token de TiloPay
export async function getTiloPayToken(): Promise<string> {
  // Si el token está en caché y no ha expirado, usarlo
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  try {
    console.log('🔐 Authenticating with TiloPay...');
    console.log('API URL:', TILOPAY_API_URL);
    console.log('API User:', TILOPAY_API_USER ? `${TILOPAY_API_USER.substring(0, 3)}***` : 'NOT SET');
    console.log('API Password:', TILOPAY_API_PASSWORD ? '***' : 'NOT SET');

    const authPayload = {
      apiuser: TILOPAY_API_USER,
      password: TILOPAY_API_PASSWORD,
    };

    console.log('Auth payload:', JSON.stringify(authPayload, null, 2));

    const response = await fetch(`${TILOPAY_API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(authPayload),
    });

    console.log('Response status:', response.status);
    const responseText = await response.text();
    console.log('Response body:', responseText);

    if (!response.ok) {
      throw new Error(`TiloPay auth failed: ${responseText}`);
    }

    const data: any = JSON.parse(responseText);
    cachedToken = data.access_token;
    // Token expira en 24 horas (86400 segundos) - guardar con 1 hora de margen
    tokenExpiry = Date.now() + (23 * 60 * 60 * 1000);

    if (!cachedToken) {
      throw new Error('No access token received from TiloPay');
    }

    console.log('✅ TiloPay authentication successful');

    return cachedToken;
  } catch (error: any) {
    console.error('Error obtaining TiloPay token:', error.message);
    throw new Error('Failed to authenticate with TiloPay');
  }
}

// Crear orden de pago en TiloPay
export async function createTiloPayOrder(orderData: {
  amount: number;
  currency: string;
  orderNumber: string;
  billToFirstName: string;
  billToLastName: string;
  billToAddress: string;
  billToAddress2?: string;
  billToCity: string;
  billToState: string;
  billToZipPostCode: string;
  billToCountry: string;
  billToTelephone: string;
  billToEmail: string;
  shipToFirstName?: string;
  shipToLastName?: string;
  shipToAddress?: string;
  shipToAddress2?: string;
  shipToCity?: string;
  shipToState?: string;
  shipToZipPostCode?: string;
  shipToCountry?: string;
  shipToTelephone?: string;
  redirectUrl: string;
  returnData?: string;
}) {
  try {
    const token = await getTiloPayToken();

    const payload = {
      redirect: orderData.redirectUrl,
      key: TILOPAY_API_KEY,
      amount: orderData.amount.toFixed(2),
      currency: orderData.currency,
      orderNumber: orderData.orderNumber,
      capture: "1",
      subscription: "0",
      platform: "custom",
      token_version: "v2",
      hashVersion: "V2",
      returnData: orderData.returnData || "",
      billToFirstName: orderData.billToFirstName,
      billToLastName: orderData.billToLastName,
      billToAddress: orderData.billToAddress,
      billToAddress2: orderData.billToAddress2 || "",
      billToCity: orderData.billToCity,
      billToState: orderData.billToState,
      billToZipPostCode: orderData.billToZipPostCode,
      billToCountry: orderData.billToCountry,
      billToTelephone: orderData.billToTelephone,
      billToEmail: orderData.billToEmail,
      shipToFirstName: orderData.shipToFirstName || orderData.billToFirstName,
      shipToLastName: orderData.shipToLastName || orderData.billToLastName,
      shipToAddress: orderData.shipToAddress || orderData.billToAddress,
      shipToAddress2: orderData.shipToAddress2 || orderData.billToAddress2 || "",
      shipToCity: orderData.shipToCity || orderData.billToCity,
      shipToState: orderData.shipToState || orderData.billToState,
      shipToZipPostCode: orderData.shipToZipPostCode || orderData.billToZipPostCode,
      shipToCountry: orderData.shipToCountry || orderData.billToCountry,
      shipToTelephone: orderData.shipToTelephone || orderData.billToTelephone,
    };

    const response = await fetch(`${TILOPAY_API_URL}/processPayment`, {
      method: 'POST',
      headers: {
        'Authorization': `bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`TiloPay order creation failed: ${error}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error creating TiloPay order:', error.message);
    throw new Error('Failed to create payment order in TiloPay');
  }
}

// Consultar transacción en TiloPay
export async function consultTiloPayTransaction(orderNumber: string) {
  try {
    const token = await getTiloPayToken();

    const response = await fetch(`${TILOPAY_API_URL}/consult`, {
      method: 'POST',
      headers: {
        'Authorization': `bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        key: TILOPAY_API_KEY,
        orderNumber: orderNumber,
        merchantId: "",
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`TiloPay consult failed: ${error}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error consulting TiloPay transaction:', error.message);
    throw new Error('Failed to consult transaction in TiloPay');
  }
}

export default {
  getTiloPayToken,
  createTiloPayOrder,
  consultTiloPayTransaction,
};
