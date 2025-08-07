const { Schema, model } = require('mongoose');

const InventorySchema = new Schema({
  title: { type: String, required: true },
  description: String,
  creator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  tags: [{ type: String }],
  image: String,
  category: String,
  itemsCount: { type: Number, default: 0 }, // количество элементов
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

InventorySchema.index({ title: 'text', description: 'text', tags: 'text' }); // Для поиска

module.exports = model('Inventory', InventorySchema);
