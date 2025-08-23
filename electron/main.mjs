// electron/main.mjs
import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { registerMemberHandlers } from './ipc/memberHandlers.js';
import { registerMembershipHandlers } from './ipc/membershipHandlers.js';
import { registerMemberMembershipHandlers } from './ipc/memberMembershipHandlers.js';
import { registerNotificationHandlers } from './ipc/notificationHandlers.js';
import { registerBackupHandlers } from './ipc/backupHandlers.js';
import { NotificationService } from './services/notificationService.js';

import { databaseReady } from './database.js';
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


app.whenReady().then(async () => {
  createWindow();
  
  // Wait for database to be ready before registering handlers and checking memberships
  await databaseReady;
  
  registerMemberHandlers();
  registerMembershipHandlers();
  registerMemberMembershipHandlers();
  registerNotificationHandlers();
  registerBackupHandlers();
  
  // Check for expired memberships and create notifications on startup
  try {
    await NotificationService.checkExpiredMembershipsAndCreateNotifications();
  } catch (error) {
    console.error('Error checking expired memberships on startup:', error);
  }
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

