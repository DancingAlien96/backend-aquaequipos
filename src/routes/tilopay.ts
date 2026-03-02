import { Router, Request, Response } from 'express';
import { createTiloPayOrder, consultTiloPayTransaction } from '../config/tilopay';

const router = Router();

interface TiloPayData {
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
}

// POST /api/tilopay/create-payment - Crear orden de pago en TiloPay
router.post('/create-payment', async (req: Request, res: Response) => {
  try {
    const { 
      amount, 
      currency, 
      orderNumber,
      billing,
      shipping,
      redirectUrl,
      returnData 
    } = req.body;

    // Validación básica
    if (!amount || !currency || !orderNumber || !billing || !redirectUrl) {
      return res.status(400).json({ 
        error: 'Datos incompletos. Se requiere amount, currency, orderNumber, billing y redirectUrl' 
      });
    }

    // Preparar datos para TiloPay
    const tiloPayData: TiloPayData = {
      amount: parseFloat(amount),
      currency: currency,
      orderNumber: String(orderNumber),
      redirectUrl: redirectUrl,
      returnData: returnData || "",
      billToFirstName: billing.first_name,
      billToLastName: billing.last_name,
      billToAddress: billing.address_1,
      billToAddress2: billing.address_2 || "",
      billToCity: billing.city,
      billToState: billing.state || "GT",
      billToZipPostCode: billing.postcode || "00000",
      billToCountry: billing.country || "GT",
      billToTelephone: billing.phone,
      billToEmail: billing.email,
    };

    // Agregar datos de envío si existen
    if (shipping) {
      tiloPayData.shipToFirstName = shipping.first_name;
      tiloPayData.shipToLastName = shipping.last_name;
      tiloPayData.shipToAddress = shipping.address_1;
      tiloPayData.shipToAddress2 = shipping.address_2 || "";
      tiloPayData.shipToCity = shipping.city;
      tiloPayData.shipToState = shipping.state || "GT";
      tiloPayData.shipToZipPostCode = shipping.postcode || "00000";
      tiloPayData.shipToCountry = shipping.country || "GT";
      tiloPayData.shipToTelephone = shipping.phone || billing.phone;
    }

    const result: any = await createTiloPayOrder(tiloPayData);
    
    return res.status(200).json({
      success: true,
      paymentUrl: result.url,
      type: result.type,
      data: result,
    });
  } catch (error: any) {
    console.error('Error creating TiloPay payment:', error.message);
    return res.status(500).json({ 
      error: 'Error al crear el pago en TiloPay',
      details: error.message 
    });
  }
});

// GET /api/tilopay/consult/:orderNumber - Consultar estado de transacción
router.get('/consult/:orderNumber', async (req: Request, res: Response) => {
  try {
    const { orderNumber } = req.params;
    
    if (!orderNumber) {
      return res.status(400).json({ error: 'orderNumber es requerido' });
    }

    const result = await consultTiloPayTransaction(orderNumber);
    
    return res.json(result);
  } catch (error: any) {
    console.error('Error consulting TiloPay transaction:', error.message);
    return res.status(500).json({ 
      error: 'Error al consultar la transacción',
      details: error.message 
    });
  }
});

export default router;
