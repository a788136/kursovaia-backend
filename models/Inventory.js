const mongoose = require('mongoose');

const fieldSchema = new mongoose.Schema({
  name: String,           // Название поля
  type: String,           // Тип (text, textarea, number, checkbox, link, etc.)
  description: String,    // Подсказка
  showInTable: Boolean    // Флаг отображения в таблице
}, { _id: false });

const inventorySchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // связь с пользователем
  title: { type: String, required: true },
  description: String,
  category: String, // строка — можно сделать enum
  image: String, // URL изображения
  tags: [String],
  isPublic: { type: Boolean, default: false },
  fields: [fieldSchema],
  customIdFormat: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Inventory', inventorySchema);
