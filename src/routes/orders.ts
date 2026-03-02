import { Router, Request, Response } from 'express';
import wooCommerce from '../config/woocommerce';
import { WooCommerceOrder } from '../types';

const router = Router();

// POST /api/orders - Crear una nueva orden
router.post('/', async (req: Request, res: Response) => {
  try {
    const orderData: WooCommerceOrder = req.body;

    // Validación básica
    if (!orderData.billing || !orderData.line_items || orderData.line_items.length === 0) {
      return res.status(400).json({ 
        error: 'Datos de orden incompletos. Se requiere información de facturación y productos.' 
      });
    }

    const response = await wooCommerce.post('orders', orderData);
    
    return res.status(201).json({
      message: 'Orden creada exitosamente',
      order: response.data,
    });
  } catch (error: any) {
    console.error('Error creating order:', error.response?.data || error.message);
    return res.status(500).json({ 
      error: 'Error al crear la orden',
      details: error.response?.data || error.message 
    });
  }
});

// GET /api/orders/:id - Obtener una orden por ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const response = await wooCommerce.get(`orders/${id}`);
    return res.json(response.data);
  } catch (error: any) {
    console.error('Error fetching order:', error.response?.data || error.message);
    
    if (error.response?.status === 404) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }
    
    return res.status(500).json({ 
      error: 'Error al obtener la orden',
      details: error.response?.data || error.message 
    });
  }
});

// PUT /api/orders/:id - Actualizar una orden
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const response = await wooCommerce.put(`orders/${id}`, updateData);
    
    return res.json({
      message: 'Orden actualizada exitosamente',
      order: response.data,
    });
  } catch (error: any) {
    console.error('Error updating order:', error.response?.data || error.message);
    
    if (error.response?.status === 404) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }
    
    return res.status(500).json({ 
      error: 'Error al actualizar la orden',
      details: error.response?.data || error.message 
    });
  }
});

export default router;
