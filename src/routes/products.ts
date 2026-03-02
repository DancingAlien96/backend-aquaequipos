import { Router, Request, Response } from 'express';
import wooCommerce from '../config/woocommerce';

const router = Router();

// GET /api/products - Obtener todos los productos
router.get('/', async (req: Request, res: Response) => {
  try {
    const { 
      page = 1, 
      per_page = 12, 
      search = '', 
      category = '',
      featured = '',
      on_sale = ''
    } = req.query;

    const params: Record<string, string | number | boolean> = {
      page: Number(page),
      per_page: Number(per_page),
      status: 'publish',
    };

    if (search) params.search = String(search);
    if (category) params.category = String(category);
    if (featured === 'true') params.featured = true;
    if (on_sale === 'true') params.on_sale = true;

    const response = await wooCommerce.get('products', params);
    
    res.json({
      products: response.data,
      total: response.headers['x-wp-total'],
      totalPages: response.headers['x-wp-totalpages'],
    });
  } catch (error: any) {
    console.error('Error fetching products:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Error al obtener productos',
      details: error.response?.data || error.message 
    });
  }
});

// GET /api/products/:slug - Obtener un producto por slug
router.get('/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    
    const response = await wooCommerce.get('products', { 
      slug,
      status: 'publish' 
    });

    if (!response.data || response.data.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    return res.json(response.data[0]);
  } catch (error: any) {
    console.error('Error fetching product:', error.response?.data || error.message);
    return res.status(500).json({ 
      error: 'Error al obtener el producto',
      details: error.response?.data || error.message 
    });
  }
});

// GET /api/products/id/:id - Obtener un producto por ID
router.get('/id/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const response = await wooCommerce.get(`products/${id}`);
    return res.json(response.data);
  } catch (error: any) {
    console.error('Error fetching product:', error.response?.data || error.message);
    
    if (error.response?.status === 404) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    return res.status(500).json({ 
      error: 'Error al obtener el producto',
      details: error.response?.data || error.message 
    });
  }
});

export default router;
