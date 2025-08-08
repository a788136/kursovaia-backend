const router = require('express').Router();
const Inventory = require('../models/Inventory');

// Только если нужна защита для изменений
function ensureAuth(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) return next();
  return res.status(401).json({ error: 'Не авторизован' });
}

// GET /inventories — список всех
router.get('/', async (req, res) => {
  try {
    const inventories = await Inventory
      .find()
      .populate('owner', 'name avatar');
    res.json(inventories);
  } catch (err) {
    console.error('GET /inventories error:', err);
    res.status(500).json({ error: 'Ошибка при получении инвентаризаций' });
  }
});

// GET /inventories/:id — одна
router.get('/:id', async (req, res) => {
  try {
    const inventory = await Inventory
      .findById(req.params.id)
      .populate('owner', 'name avatar');
    if (!inventory) return res.status(404).json({ error: 'Инвентаризация не найдена' });
    res.json(inventory);
  } catch (err) {
    console.error('GET /inventories/:id error:', err);
    res.status(500).json({ error: 'Ошибка при получении инвентаризации' });
  }
});

// POST /inventories — создать (авторизованным, owner из сессии)
router.post('/', ensureAuth, async (req, res) => {
  try {
    const inventory = await Inventory.create({
      owner: req.user._id,
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      image: req.body.image,
      tags: req.body.tags || [],
      isPublic: req.body.isPublic || false,
      fields: req.body.fields || [],
      customIdFormat: req.body.customIdFormat
    });
    res.status(201).json(inventory);
  } catch (err) {
    console.error('POST /inventories error:', err);
    res.status(500).json({ error: 'Ошибка при создании инвентаризации' });
  }
});

// PUT /inventories/:id — обновить (только владелец)
router.put('/:id', ensureAuth, async (req, res) => {
  try {
    const updated = await Inventory.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { $set: req.body },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Инвентаризация не найдена или нет прав' });
    res.json(updated);
  } catch (err) {
    console.error('PUT /inventories/:id error:', err);
    res.status(500).json({ error: 'Ошибка при обновлении инвентаризации' });
  }
});

// DELETE /inventories/:id — удалить (только владелец)
router.delete('/:id', ensureAuth, async (req, res) => {
  try {
    const deleted = await Inventory.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!deleted) return res.status(404).json({ error: 'Инвентаризация не найдена или нет прав' });
    res.json({ message: 'Инвентаризация удалена' });
  } catch (err) {
    console.error('DELETE /inventories/:id error:', err);
    res.status(500).json({ error: 'Ошибка при удалении инвентаризации' });
  }
});

module.exports = router;
