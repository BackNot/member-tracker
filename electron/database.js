// electron/database.js
import { app } from 'electron';
import { Sequelize } from 'sequelize';
import Member from './models/Member.js';
import path from 'path';
import { fileURLToPath } from 'url';
import Membership from './models/Membership.js';
import Notification from './models/Notification.js';

import MemberMembership from './models/MemberMembership.js';
import TrainingLog from './models/TrainingLog.js';
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
      Notification: Notification.init(sequelize),
      TrainingLog: TrainingLog.init(sequelize)
    };

    setupAssociations();

    await sequelize.sync();

    // Add new columns if they don't exist (safe migration for existing databases)
    try {
      await sequelize.query(`ALTER TABLE memberships ADD COLUMN type VARCHAR(255) DEFAULT 'time'`);
    } catch (e) { /* Column might already exist */ }

    try {
      await sequelize.query(`ALTER TABLE memberships ADD COLUMN trainings INTEGER DEFAULT NULL`);
    } catch (e) { /* Column might already exist */ }

    try {
      await sequelize.query(`ALTER TABLE member_memberships ADD COLUMN total_trainings INTEGER DEFAULT NULL`);
    } catch (e) { /* Column might already exist */ }

    try {
      await sequelize.query(`ALTER TABLE member_memberships ADD COLUMN remaining_trainings INTEGER DEFAULT NULL`);
    } catch (e) { /* Column might already exist */ }

    try {
      await sequelize.query(`ALTER TABLE training_logs ADD COLUMN action VARCHAR(255) DEFAULT 'subtract'`);
    } catch (e) { /* Column might already exist */ }

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