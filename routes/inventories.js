const router = require('express').Router();
const Inventory = require('../models/Inventory');

// Middleware для проверки авторизации
function ensureAuth(req, res, next) {
  if (req.isAuthenticated()) return next();
  return res.status(401).json({ error: 'Не авторизован' });
}

// GET /inventories — список всех
router.get('/', async (req, res) => {
  try {
    const inventories = await Inventory.find().populate('owner', 'name avatar');
    res.json(inventories);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка при получении инвентаризаций' });
  }
});

// GET /inventories/:id
router.get('/:id', async (req, res) => {
  try {
    const inventory = await Inventory.findById(req.params.id).populate('owner', 'name avatar');
    if (!inventory) return res.status(404).json({ error: 'Инвентаризация не найдена' });
    res.json(inventory);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка при получении инвентаризации' });
  }
});

// POST /inventories — создать (только авторизованным)
router.post('/', ensureAuth, async (req, res) => {
  try {
    const inventory = new Inventory({
      owner: req.user._id, // берём из авторизации
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      image: req.body.image,
      tags: req.body.tags || [],
      isPublic: req.body.isPublic || false,
      fields: req.body.fields || [],
      customIdFormat: req.body.customIdFormat
    });
    await inventory.save();
    res.status(201).json(inventory);
  } catch (err) {
    console.error('Ошибка при создании:', err);
    res.status(500).json({ error: 'Ошибка при создании инвентаризации' });
  }
});

// PUT /inventories/:id
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
    res.status(500).json({ error: 'Ошибка при обновлении инвентаризации' });
  }
});

// DELETE /inventories/:id
router.delete('/:id', ensureAuth, async (req, res) => {
  try {
    const deleted = await Inventory.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!deleted) return res.status(404).json({ error: 'Инвентаризация не найдена или нет прав' });
    res.json({ message: 'Инвентаризация удалена' });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка при удалении инвентаризации' });
  }
});

module.exports = router;
