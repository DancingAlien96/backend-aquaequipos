import { Router, Request, Response } from 'express';
import wooCommerce from '../config/woocommerce';

const router = Router();

// GET /api/categories - Obtener todas las categorías
router.get('/', async (req: Request, res: Response) => {
  try {
    const { 
      page = 1, 
      per_page = 100,
      parent = '' 
    } = req.query;

    const params: Record<string, string | number | boolean> = {
      page: Number(page),
      per_page: Number(per_page),
      hide_empty: true,
    };

    if (parent) params.parent = Number(parent);

    const response = await wooCommerce.get('products/categories', params);
    
    res.json({
      categories: response.data,
      total: response.headers['x-wp-total'],
      totalPages: response.headers['x-wp-totalpages'],
    });
  } catch (error: any) {
    console.error('Error fetching categories:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Error al obtener categorías',
      details: error.response?.data || error.message 
    });
  }
});

// GET /api/categories/:id - Obtener una categoría por ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const response = await wooCommerce.get(`products/categories/${id}`);
    return res.json(response.data);
  } catch (error: any) {
    console.error('Error fetching category:', error.response?.data || error.message);
    
    if (error.response?.status === 404) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }
    
    return res.status(500).json({ 
      error: 'Error al obtener la categoría',
      details: error.response?.data || error.message 
    });
  }
});

export default router;
