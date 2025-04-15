// electron/main.js
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const dbOperations = require('./database');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  if (app.isPackaged) {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  } else {
    win.loadURL('http://localhost:5173/');
  }

  if (!app.isPackaged) {
    win.webContents.openDevTools();
  }
  
  return win;
}

// Set up IPC handlers for database operations
function setupIpcHandlers() {
  console.log('Setting up IPC handlers for database operations');
  
  // Create a new record
  ipcMain.handle('db-create', async (event, modelName, data) => {
    console.log('IPC: db-create called with:', { modelName, data });
    try {
      const result = await dbOperations.create(modelName, data);
      console.log('IPC: db-create result:', result);
      return result;
    } catch (error) {
      console.error('IPC: db-create error:', error);
      return { error: true, message: error.message };
    }
  });

  // Find all records
  ipcMain.handle('db-findAll', async (event, modelName, options) => {
    console.log('IPC: db-findAll called with:', { modelName, options });
    try {
      const result = await dbOperations.findAll(modelName, options);
      console.log('IPC: db-findAll result count:', result.length);
      return result;
    } catch (error) {
      console.error('IPC: db-findAll error:', error);
      return { error: true, message: error.message };
    }
  });

  // Find one record
  ipcMain.handle('db-findOne', async (event, modelName, options) => {
    console.log('IPC: db-findOne called with:', { modelName, options });
    try {
      const result = await dbOperations.findOne(modelName, options);
      console.log('IPC: db-findOne result:', result);
      return result;
    } catch (error) {
      console.error('IPC: db-findOne error:', error);
      return { error: true, message: error.message };
    }
  });

  // Delete records
  ipcMain.handle('db-destroy', async (event, modelName, options) => {
    console.log('IPC: db-destroy called with:', { modelName, options });
    try {
      const result = await dbOperations.destroy(modelName, options);
      console.log('IPC: db-destroy result:', result);
      return result;
    } catch (error) {
      console.error('IPC: db-destroy error:', error);
      return { error: true, message: error.message };
    }
  });
}

app.whenReady().then(() => {
  const mainWindow = createWindow();
  setupIpcHandlers();
  
  console.log('Electron app is ready');
  console.log('Database path:', path.join(app.getPath('userData'), 'database.sqlite'));

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
}); 