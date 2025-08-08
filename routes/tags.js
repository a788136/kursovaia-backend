// routes/tags.js
const router = require('express').Router();
const Inventory = require('../models/Inventory');

// GET /tags — все уникальные теги
router.get('/', async (req, res) => {
  const allInventories = await Inventory.find({}, 'tags');
  const tagsSet = new Set();
  allInventories.forEach(inv => (inv.tags || []).forEach(tag => tagsSet.add(tag)));
  res.json(Array.from(tagsSet));
});

module.exports = router;

