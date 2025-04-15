// electron/database.js
const { Sequelize } = require('sequelize');
const path = require('path');
const { app } = require('electron');
const { Demo } = require('./models/Demo');
require('reflect-metadata');

// Get the app data directory for the database
const dbPath = path.join(app.getPath('userData'), 'database.sqlite');
console.log(`Using database at: ${dbPath}`);

// Initialize Sequelize
let sequelize = null;

const initializeDatabase = async () => {
  try {
    // Create Sequelize instance
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: dbPath,
      logging: console.log
    });

    // Initialize models
    Demo.init(sequelize);

    // Test the connection
    await sequelize.authenticate();
    console.log('Database connection established successfully');

    // Sync the models (create tables if they don't exist)
    await sequelize.sync();
    console.log('Database models synchronized');

    return sequelize;
  } catch (err) {
    console.error('Failed to initialize database:', err);
    throw err;
  }
};

// Database operations for IPC
const dbOperations = {
  // Initialize database
  init: async () => {
    try {
      await initializeDatabase();
      return { success: true };
    } catch (err) {
      console.error('Database initialization failed:', err);
      return { success: false, error: err.message || String(err) };
    }
  },

  // Create a new record
  create: async (modelName, data) => {
    try {
      if (!sequelize) {
        throw new Error('Database not initialized');
      }

      console.log(`Creating ${modelName} with data:`, data);
      
      let result;
      if (modelName === 'Demo') {
        result = await Demo.create(data);
      } else {
        throw new Error(`Unknown model: ${modelName}`);
      }
      
      return result.toJSON();
    } catch (err) {
      console.error(`Error creating ${modelName}:`, err);
      throw err;
    }
  },

  // Find all records
  findAll: async (modelName, options = {}) => {
    try {
      if (!sequelize) {
        throw new Error('Database not initialized');
      }

      console.log(`Finding all ${modelName} with options:`, options);
      
      let results;
      if (modelName === 'Demo') {
        results = await Demo.findAll(options);
      } else {
        throw new Error(`Unknown model: ${modelName}`);
      }
      
      return results.map(item => item.toJSON());
    } catch (err) {
      console.error(`Error finding all ${modelName}:`, err);
      throw err;
    }
  },

  // Find one record
  findOne: async (modelName, options = {}) => {
    try {
      if (!sequelize) {
        throw new Error('Database not initialized');
      }

      console.log(`Finding one ${modelName} with options:`, options);
      
      let result;
      if (modelName === 'Demo') {
        result = await Demo.findOne(options);
      } else {
        throw new Error(`Unknown model: ${modelName}`);
      }
      
      return result ? result.toJSON() : null;
    } catch (err) {
      console.error(`Error finding one ${modelName}:`, err);
      throw err;
    }
  },

  // Delete records
  destroy: async (modelName, options = {}) => {
    try {
      if (!sequelize) {
        throw new Error('Database not initialized');
      }

      console.log(`Deleting ${modelName} with options:`, options);
      
      let count;
      if (modelName === 'Demo') {
        count = await Demo.destroy(options);
      } else {
        throw new Error(`Unknown model: ${modelName}`);
      }
      
      return { count };
    } catch (err) {
      console.error(`Error deleting ${modelName}:`, err);
      throw err;
    }
  },

  // Close the database
  close: async () => {
    if (!sequelize) {
      return true;
    }
    
    try {
      await sequelize.close();
      console.log('Database closed successfully');
      sequelize = null;
      return true;
    } catch (err) {
      console.error('Error closing database:', err);
      throw err;
    }
  }
};

// Initialize the database when this module is imported
initializeDatabase()
  .then(() => console.log('Database ready to use with Sequelize'))
  .catch(err => console.error('Failed to initialize database on import:', err));

// Handle Electron app quit to ensure database is closed properly
app.on('will-quit', async () => {
  try {
    await dbOperations.close();
  } catch (err) {
    console.error('Error closing database on app quit:', err);
  }
});

module.exports = dbOperations; 