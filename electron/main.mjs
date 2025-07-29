// electron/main.mjs
import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { registerMemberHandlers } from './ipc/memberHandlers.js';
import { registerMembershipHandlers } from './ipc/membershipHandlers.js';
import { registerMemberMembershipHandlers } from './ipc/memberMembershipHandlers.js';
import { registerBackupHandlers } from './ipc/backupHandlers.js';

import './database.js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    }
  });

  if (app.isPackaged) {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  } else {
    win.loadURL('http://localhost:5173/');
    win.webContents.openDevTools();
  }
}


app.whenReady().then(() => {
  createWindow();
  registerMemberHandlers();
  registerMembershipHandlers();
  registerMemberMembershipHandlers();

  registerBackupHandlers();
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

