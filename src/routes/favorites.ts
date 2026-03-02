import express from 'express';
import { getDB, saveDB } from '../db/sqlite';

const router = express.Router();

// Helper to read user id from header
function getUserId(req: express.Request) {
  return (req.header('x-user-id') || null) as string | null;
}

// GET / - list favorites for user
router.get('/', (_req, res): void => {
  const userId = getUserId(_req);
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized - x-user-id header required' });
    return;
  }

  const db = getDB();
  const result = db.exec('SELECT * FROM favorites WHERE user_id = ? ORDER BY created_at DESC', [userId]);
  
  const favorites = result.length > 0 ? result[0].values.map((row: any) => ({
    id: row[0],
    user_id: row[1],
    product_id: row[2],
    title: row[3],
    thumbnail: row[4],
    price: row[5],
    created_at: row[6]
  })) : [];

  res.json(favorites);
});

// POST / - add favorite
router.post('/', (req, res): void => {
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized - x-user-id header required' });
    return;
  }

  const { product_id, title, thumbnail, price } = req.body;
  if (!product_id) {
    res.status(400).json({ error: 'product_id is required' });
    return;
  }

  const db = getDB();
  
  // Check if already exists
  const existingResult = db.exec('SELECT * FROM favorites WHERE user_id = ? AND product_id = ?', [userId, String(product_id)]);
  if (existingResult.length > 0 && existingResult[0].values.length > 0) {
    const existing = {
      id: existingResult[0].values[0][0],
      user_id: existingResult[0].values[0][1],
      product_id: existingResult[0].values[0][2],
      title: existingResult[0].values[0][3],
      thumbnail: existingResult[0].values[0][4],
      price: existingResult[0].values[0][5],
      created_at: existingResult[0].values[0][6]
    };
    res.status(200).json(existing);
    return;
  }

  // Insert new favorite
  db.run('INSERT INTO favorites (user_id, product_id, title, thumbnail, price) VALUES (?, ?, ?, ?, ?)', 
    [userId, String(product_id), title || null, thumbnail || null, price || null]);
  
  saveDB();

  // Get the last inserted row
  const result = db.exec('SELECT * FROM favorites WHERE user_id = ? AND product_id = ? ORDER BY id DESC LIMIT 1', [userId, String(product_id)]);
  
  if (result.length > 0 && result[0].values.length > 0) {
    const favorite = {
      id: result[0].values[0][0],
      user_id: result[0].values[0][1],
      product_id: result[0].values[0][2],
      title: result[0].values[0][3],
      thumbnail: result[0].values[0][4],
      price: result[0].values[0][5],
      created_at: result[0].values[0][6]
    };
    res.status(201).json(favorite);
  } else {
    res.status(500).json({ error: 'Failed to create favorite' });
  }
});

// DELETE /:id - remove favorite (must belong to user)
router.delete('/:id', (req, res): void => {
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized - x-user-id header required' });
    return;
  }

  const id = req.params.id;
  const db = getDB();
  
  const result = db.exec('SELECT * FROM favorites WHERE id = ?', [id]);
  if (result.length === 0 || result[0].values.length === 0) {
    res.status(404).json({ error: 'Not found' });
    return;
  }

  const fav = {
    id: result[0].values[0][0],
    user_id: result[0].values[0][1]
  };

  if (fav.user_id !== userId) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  db.run('DELETE FROM favorites WHERE id = ?', [id]);
  saveDB();
  
  res.json({ success: true });
});

export default router;
