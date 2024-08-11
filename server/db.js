// db.js
const { Sequelize } = require('sequelize');
require('dotenv').config(); 

const sequelize = new Sequelize
(
  process.env.DB_NAME, 
  process.env.DB_USER, 
  process.env.DB_PASSWORD, 
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
);

const connectToDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Połączono z bazą danych!');
    await sequelize.sync();
    console.log('Synchronizacja modeli z bazą danych przebiegła pomyślnie!');
  } catch (error) {
    console.error('Nie udało się połączyć z bazą danych:', error);
  }
};

module.exports = { sequelize, connectToDatabase };
