// electron/database.js
import { app } from 'electron';
import { Sequelize } from 'sequelize';
import Member from './models/Member.js';
import path from 'path';
import { fileURLToPath } from 'url';
import Membership from './models/Membership.js';
import Notification from './models/Notification.js';

import MemberMembership from './models/MemberMembership.js';
import { setupAssociations } from './associations.js';

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

    const models = {
      Member: Member.init(sequelize),
      Membership: Membership.init(sequelize),
      MemberMembership: MemberMembership.init(sequelize),
      Notification: Notification.init(sequelize)
    };

    setupAssociations();

    await sequelize.sync();   

    console.log('Database connected and models synced');
  } catch (err) {
    console.error('Database init error:', err);
    throw err;
  }
};
// Export the initialization promise for external use
export const databaseReady = initializeDatabase();

// Ensure cleanup on app quit
app.on('will-quit', async () => {
  try {
    await sequelize.close();
  } catch (err) {
    console.error('DB close error on app quit:', err);
  }
});

export { sequelize, Member, Membership };