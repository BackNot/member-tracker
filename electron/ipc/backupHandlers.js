// electron/ipc/backupHandlers.js
import { ipcMain, shell, app } from 'electron';
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import Store from 'electron-store';
import http from 'http';
import url from 'url';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });


// Initialize secure storage for tokens
const store = new Store({
  encryptionKey: process.env.ELECTRON_STORE_KEY
});

// Google OAuth2 configuration
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = 'http://localhost:8080/oauth/callback';

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

let oauthServer = null;
let authPromiseResolve = null;
let authPromiseReject = null;

// Check if user is authenticated
function isAuthenticated() {
  const tokens = store.get('google_tokens');
  if (tokens) {
    oauth2Client.setCredentials(tokens);
    return true;
  }
  return false;
}

// Get database path
function getDatabasePath() {
  return path.join(app.getPath('userData'), 'database.sqlite');
}

// Stop OAuth server
function stopOAuthServer() {
  if (oauthServer) {
    oauthServer.close();
    oauthServer = null;
  }
  if (authPromiseReject) {
    authPromiseReject(new Error('Server stopped'));
    authPromiseReject = null;
  }
  if (authPromiseResolve) {
    authPromiseResolve = null;
  }
}

export function registerBackupHandlers() {
    console.log(process.env.CLIENT_ID);
  // Check authentication status
  ipcMain.handle('backup:check-auth', async () => {
    return isAuthenticated();
  });

 // Start authentication flow with local server
ipcMain.handle('backup:authenticate', async () => {
  try {
    // Start local server first
    const serverPort = await startOAuthServer();
    
    // Update the redirect URI to match the actual server port
    const actualRedirectUri = `http://localhost:${serverPort}/oauth/callback`;
    
    // Create promise that will be resolved by the server callback
    const tokenPromise = new Promise((resolve, reject) => {
      authPromiseResolve = resolve;
      authPromiseReject = reject;
      
      // Timeout after 5 minutes
      setTimeout(() => {
        if (authPromiseReject === reject) {
          stopOAuthServer();
          reject(new Error('Authentication timeout'));
        }
      }, 5 * 60 * 1000);
    });
    
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/drive.file'],
      prompt: 'consent',
      redirect_uri: actualRedirectUri  // Explicitly specify redirect_uri
    });

    console.log('Opening auth URL:', authUrl);

    // Open the auth URL in the user's default browser
    await shell.openExternal(authUrl);
    
    // Wait for tokens from the callback
    const tokens = await tokenPromise;
    
    // Store tokens and setup client
    oauth2Client.setCredentials(tokens);
    store.set('google_tokens', tokens);
    
    // Clean up
    stopOAuthServer();
    
    return { success: true };
  } catch (error) {
    console.error('Authentication error:', error);
    stopOAuthServer();
    return { success: false, error: error.message };
  }
});

// Also update your startOAuthServer function to handle dynamic ports better:
function startOAuthServer() {
  return new Promise((resolve, reject) => {
    if (oauthServer) {
      stopOAuthServer();
    }

    oauthServer = http.createServer((req, res) => {
      const parsedUrl = url.parse(req.url, true);
      
      if (parsedUrl.pathname === '/oauth/callback') {
        const code = parsedUrl.query.code;
        const error = parsedUrl.query.error;
        
        // Send response to browser
        if (error) {
          res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(`
            <!DOCTYPE html>
            <html>
              <head>
                <title> Error </title>
                <meta charset="utf-8">
                <style>
                  body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
                  .container { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 400px; margin: 0 auto; }
                  .success { color: #27ae60; }
                </style>
              </head>
              <body>
                <div class="container">
                <h1 class="error">❌ Error</h1>
                  <p>Go back to application</p>
                </div>
                <script>
                  setTimeout(() => window.close(), 3000);
                </script>
              </body>
            </html>
          `);
          
          
          if (authPromiseReject) {
            authPromiseReject(new Error(error));
            authPromiseReject = null;
          }
          return;
        }
        
        if (code) {
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
         res.end(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Authentication Successful</title>
              <meta charset="utf-8">
              <style>
                body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
                .container { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 400px; margin: 0 auto; }
                .success { color: #27ae60; }
              </style>
            </head>
            <body>
              <div class="container">
                <h1 class="success">✅ Authentication Successful!</h1>
                <p>Go back to application</p>
              </div>
              <script>
                setTimeout(() => window.close(), 3000);
              </script>
            </body>
          </html>
        `);
          
          // Exchange code for tokens
          oauth2Client.getToken(code)
            .then(({ tokens }) => {
              if (authPromiseResolve) {
                authPromiseResolve(tokens);
                authPromiseResolve = null;
              }
            })
            .catch((tokenError) => {
              console.error('Token exchange error:', tokenError);
              if (authPromiseReject) {
                authPromiseReject(tokenError);
                authPromiseReject = null;
              }
            });
        }
      } else {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end(t('drive.page_not_found'));
      }
    });
    
    // Try to start server on port 8080, if busy try other ports
    const tryPort = (port) => {
      oauthServer.listen(port, 'localhost', () => {
        console.log(`OAuth server listening on http://localhost:${port}`);
        resolve(port); // Return the actual port number
      });
      
      oauthServer.on('error', (err) => {
        if (err.code === 'EADDRINUSE' && port < 8090) {
          oauthServer.close();
          tryPort(port + 1);
        } else {
          reject(err);
        }
      });
    };
    
    tryPort(8080);
  });
}

  // Manual auth completion (fallback)
  ipcMain.handle('backup:complete-auth', async (event, authCode) => {
    try {
      const { tokens } = await oauth2Client.getToken(authCode);
      oauth2Client.setCredentials(tokens);
      
      // Store tokens securely
      store.set('google_tokens', tokens);
      
      return { success: true };
    } catch (error) {
      console.error('Token exchange error:', error);
      return { success: false, error: error.message };
    }
  });

  // Create backup
  ipcMain.handle('backup:create', async () => {
    try {
      if (!isAuthenticated()) {
        return { success: false, error: 'Not authenticated' };
      }

      const drive = google.drive({ version: 'v3', auth: oauth2Client });
      const dbPath = getDatabasePath();

      // Check if database file exists
      if (!fs.existsSync(dbPath)) {
        return { success: false, error: 'Database file not found' };
      }

      // Create backup filename with timestamp
      const timestamp = new Date().toISOString().replace(/[T:]/g, '-').split('.')[0];
      const backupName = `gym-backup-${timestamp}.db`;

      const response = await drive.files.create({
        requestBody: {
          name: backupName,
          description: 'Gym database backup',
        },
        media: {
          mimeType: 'application/octet-stream',
          body: fs.createReadStream(dbPath),
        },
      });

      return { 
        success: true, 
        fileId: response.data.id,
        fileName: backupName 
      };
    } catch (error) {
      console.error('Backup creation error:', error);
      return { success: false, error: error.message };
    }
  });

  // List backups
  ipcMain.handle('backup:list', async () => {
    try {
      if (!isAuthenticated()) {
        return { success: false, error: 'Not authenticated' };
      }

      const drive = google.drive({ version: 'v3', auth: oauth2Client });
      
      const response = await drive.files.list({
        q: "name contains 'gym-backup-' and trashed=false",
        orderBy: 'createdTime desc',
        fields: 'files(id,name,createdTime,size)',
      });

      const backups = response.data.files.map(file => ({
        id: file.id,
        name: file.name,
        createdTime: new Date(file.createdTime).toLocaleDateString(),
        size: file.size ? Math.round(file.size / 1024) + ' KB' : 'Unknown'
      }));

      return { success: true, backups };
    } catch (error) {
      console.error('List backups error:', error);
      return { success: false, error: error.message };
    }
  });

  // Disconnect (remove stored tokens)
  ipcMain.handle('backup:disconnect', async () => {
    try {
      stopOAuthServer(); // Stop any running server
      store.delete('google_tokens');
      oauth2Client.setCredentials({});
      return { success: true };
    } catch (error) {
      console.error('Disconnect error:', error);
      return { success: false, error: error.message };
    }
  });

  // Clean up server on app quit
  app.on('before-quit', () => {
    stopOAuthServer();
  });
}