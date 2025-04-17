// electron/database.js
import { app } from 'electron';
import { Sequelize } from 'sequelize';
import Member from './models/Member.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Sequelize instance
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(app.getPath('userData'), 'database.sqlite'),
  logging: false
});

const initializeDatabase = async () => {
  try {
    await sequelize.authenticate();
    
    Member.init(sequelize); 

    await sequelize.sync();
    console.log('Database connected and models synced');
  } catch (err) {
    console.error('Database init error:', err);
    throw err;
  }
};

// Automatically initialize on import
initializeDatabase().catch(console.error);

// Ensure cleanup on app quit
app.on('will-quit', async () => {
  try {
    await sequelize.close();
  } catch (err) {
    console.error('DB close error on app quit:', err);
  }
});

export { sequelize, Member };