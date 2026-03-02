import express from 'express';
import { getDB, saveDB } from '../db/sqlite';

const router = express.Router();

// Helper to read user id from header
function getUserId(req: express.Request) {
  return (req.header('x-user-id') || null) as string | null;
}

// GET / - get cart items for user
router.get('/', (_req, res): void => {
  const userId = getUserId(_req);
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized - x-user-id header required' });
    return;
  }

  const db = getDB();
  const result = db.exec('SELECT * FROM cart WHERE user_id = ? ORDER BY created_at DESC', [userId]);
  
  const items = result.length > 0 ? result[0].values.map((row: any) => ({
    id: row[0],
    user_id: row[1],
    product_id: row[2],
    quantity: row[3],
    product_data: row[4] ? JSON.parse(String(row[4])) : null,
    created_at: row[5],
    updated_at: row[6]
  })) : [];

  res.json(items);
});

// POST / - add item to cart (or update quantity if exists)
router.post('/', (req, res): void => {
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized - x-user-id header required' });
    return;
  }

  const { product_id, quantity, product_data } = req.body;
  
  if (!product_id || !quantity || quantity < 1) {
    res.status(400).json({ error: 'product_id and quantity (>0) are required' });
    return;
  }

  const db = getDB();
  
  // Check if item already exists in cart
  const existingResult = db.exec('SELECT * FROM cart WHERE user_id = ? AND product_id = ?', [userId, product_id]);
  
  if (existingResult.length > 0 && existingResult[0].values.length > 0) {
    // Update existing item quantity
    const currentQuantity = existingResult[0].values[0][3] as number;
    const newQuantity = currentQuantity + quantity;
    const itemId = existingResult[0].values[0][0];
    
    db.run(
      'UPDATE cart SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [newQuantity, itemId]
    );
    saveDB();
    
    // Return updated item
    const updated = db.exec('SELECT * FROM cart WHERE id = ?', [itemId]);
    if (updated.length > 0 && updated[0].values.length > 0) {
      const row = updated[0].values[0];
      const item = {
        id: row[0],
        user_id: row[1],
        product_id: row[2],
        quantity: row[3],
        product_data: row[4] ? JSON.parse(String(row[4])) : null,
        created_at: row[5],
        updated_at: row[6]
      };
      res.status(200).json(item);
      return;
    }
  }

  // Insert new item
  const productDataStr = product_data ? JSON.stringify(product_data) : null;
  db.run(
    'INSERT INTO cart (user_id, product_id, quantity, product_data) VALUES (?, ?, ?, ?)',
    [userId, product_id, quantity, productDataStr]
  );
  saveDB();

  // Get the inserted item
  const result = db.exec('SELECT * FROM cart WHERE user_id = ? AND product_id = ?', [userId, product_id]);
  
  if (result.length > 0 && result[0].values.length > 0) {
    const row = result[0].values[0];
    const item = {
      id: row[0],
      user_id: row[1],
      product_id: row[2],
      quantity: row[3],
      product_data: row[4] ? JSON.parse(String(row[4])) : null,
      created_at: row[5],
      updated_at: row[6]
    };
    res.status(201).json(item);
  } else {
    res.status(500).json({ error: 'Failed to add item to cart' });
  }
});

// PUT /:id - update item quantity
router.put('/:id', (req, res): void => {
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized - x-user-id header required' });
    return;
  }

  const { quantity } = req.body;
  const itemId = req.params.id;

  if (!quantity || quantity < 0) {
    res.status(400).json({ error: 'quantity (>=0) is required' });
    return;
  }

  const db = getDB();
  
  // Check if item exists and belongs to user
  const result = db.exec('SELECT * FROM cart WHERE id = ?', [itemId]);
  if (result.length === 0 || result[0].values.length === 0) {
    res.status(404).json({ error: 'Cart item not found' });
    return;
  }

  const item = {
    id: result[0].values[0][0],
    user_id: result[0].values[0][1]
  };

  if (item.user_id !== userId) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  // If quantity is 0, delete the item
  if (quantity === 0) {
    db.run('DELETE FROM cart WHERE id = ?', [itemId]);
    saveDB();
    res.json({ success: true, deleted: true });
    return;
  }

  // Update quantity
  db.run(
    'UPDATE cart SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [quantity, itemId]
  );
  saveDB();

  // Return updated item
  const updated = db.exec('SELECT * FROM cart WHERE id = ?', [itemId]);
  if (updated.length > 0 && updated[0].values.length > 0) {
    const row = updated[0].values[0];
    const updatedItem = {
      id: row[0],
      user_id: row[1],
      product_id: row[2],
      quantity: row[3],
      product_data: row[4] ? JSON.parse(String(row[4])) : null,
      created_at: row[5],
      updated_at: row[6]
    };
    res.json(updatedItem);
  } else {
    res.status(500).json({ error: 'Failed to update item' });
  }
});

// DELETE /:id - remove item from cart
router.delete('/:id', (req, res): void => {
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized - x-user-id header required' });
    return;
  }

  const itemId = req.params.id;
  const db = getDB();
  
  // Check if item exists and belongs to user
  const result = db.exec('SELECT * FROM cart WHERE id = ?', [itemId]);
  if (result.length === 0 || result[0].values.length === 0) {
    res.status(404).json({ error: 'Cart item not found' });
    return;
  }

  const item = {
    id: result[0].values[0][0],
    user_id: result[0].values[0][1]
  };

  if (item.user_id !== userId) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  db.run('DELETE FROM cart WHERE id = ?', [itemId]);
  saveDB();
  
  res.json({ success: true });
});

// DELETE / - clear entire cart for user
router.delete('/', (req, res): void => {
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized - x-user-id header required' });
    return;
  }

  const db = getDB();
  db.run('DELETE FROM cart WHERE user_id = ?', [userId]);
  saveDB();
  
  res.json({ success: true, message: 'Cart cleared' });
});

export default router;
