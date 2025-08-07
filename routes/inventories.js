const router = require('express').Router();
const Inventory = require('../models/Inventory');

// GET /inventories/latest — последние инвентаризации (например, 10 штук)
router.get('/latest', async (req, res) => {
  const inventories = await Inventory.find()
    .sort({ createdAt: -1 })
    .limit(10)
    .populate('creator', 'name avatar');
  res.json(inventories);
});

// GET /inventories/top — топ-5 по количеству items
router.get('/top', async (req, res) => {
  const inventories = await Inventory.find()
    .sort({ itemsCount: -1 })
    .limit(5)
    .populate('creator', 'name avatar');
  res.json(inventories);
});

module.exports = router;
