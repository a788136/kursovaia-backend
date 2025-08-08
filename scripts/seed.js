require('dotenv').config();
const mongoose = require('mongoose');
const Inventory = require('../models/Inventory');

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB подключен');

    await Inventory.deleteMany();

    await Inventory.insertMany([
      {
        owner: new mongoose.Types.ObjectId(), // тестовый ID
        title: 'Склад инструментов',
        description: 'Инвентаризация склада инструментов',
        category: 'Склад',
        tags: ['инструменты', 'метал'],
        isPublic: true
      },
      {
        owner: new mongoose.Types.ObjectId(),
        title: 'Офисная техника',
        description: 'Компьютеры, принтеры, сканеры',
        category: 'Офис',
        tags: ['техника', 'офис'],
        isPublic: false
      }
    ]);

    console.log('Сиды добавлены');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
