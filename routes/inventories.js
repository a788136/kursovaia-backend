const router = require('express').Router();
const Inventory = require('../models/Inventory');

// GET /inventories — список всех (позже можно фильтровать по владельцу или публичности)
router.get('/', async (req, res) => {
  try {
    const inventories = await Inventory.find().populate('owner', 'name avatar');
    res.json(inventories);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка при получении инвентаризаций' });
  }
});

// GET /inventories/:id — одна инвентаризация
router.get('/:id', async (req, res) => {
  try {
    const inventory = await Inventory.findById(req.params.id).populate('owner', 'name avatar');
    if (!inventory) return res.status(404).json({ error: 'Инвентаризация не найдена' });
    res.json(inventory);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка при получении инвентаризации' });
  }
});

// POST /inventories — создать
router.post('/', async (req, res) => {
  try {
    const inventory = new Inventory({
      owner: req.body.owner, // ID пользователя
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
    res.status(500).json({ error: 'Ошибка при создании инвентаризации' });
  }
});

// PUT /inventories/:id — обновить
router.put('/:id', async (req, res) => {
  try {
    const updated = await Inventory.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Инвентаризация не найдена' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка при обновлении инвентаризации' });
  }
});

// DELETE /inventories/:id — удалить
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Inventory.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Инвентаризация не найдена' });
    res.json({ message: 'Инвентаризация удалена' });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка при удалении инвентаризации' });
  }
});

module.exports = router;
