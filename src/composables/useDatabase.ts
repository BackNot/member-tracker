export function useDatabase() {
  // Better check for running in Electron
  const isElectron = () => {
    // Renderer process
    if (typeof window !== 'undefined' && typeof window.process === 'object' && 
        (window.process as any).type === 'renderer') {
      return true;
    }
    
    // Main process
    if (typeof process !== 'undefined' && typeof process.versions === 'object' && 
        !!process.versions.electron) {
      return true;
    }
    
    // Detect the user agent when the `nodeIntegration` option is set to false
    if (typeof navigator === 'object' && typeof navigator.userAgent === 'string' && 
        navigator.userAgent.indexOf('Electron') >= 0) {
      return true;
    }
    
    return false;
  };
  
  const electronEnvironment = isElectron();
  
  // Get ipcRenderer safely
  let ipcRenderer: any = null;
  try {
    if (electronEnvironment) {
      const electron = window.require('electron');
      ipcRenderer = electron.ipcRenderer;
      console.log('IPC Renderer loaded successfully');
    }
  } catch (err) {
    console.error('Failed to load electron ipcRenderer:', err);
  }
  
  // Run a query that doesn't return data
  const run = async (sql: string, params: any[] = []) => {
    if (!electronEnvironment || !ipcRenderer) {
      console.warn('Database operations are only available in Electron');
      return null;
    }
    try {
      console.log('Calling db-run with:', { sql, params });
      const result = await ipcRenderer.invoke('db-run', sql, params);
      console.log('db-run result:', result);
      
      // Check if result contains an error
      if (result && result.error === true) {
        throw new Error(result.message || 'Unknown database error');
      }
      
      return result;
    } catch (err) {
      console.error('Error during db-run:', err);
      throw err;
    }
  };
  
  // Get a single row
  const get = async (sql: string, params: any[] = []) => {
    if (!electronEnvironment || !ipcRenderer) {
      console.warn('Database operations are only available in Electron');
      return null;
    }
    try {
      console.log('Calling db-get with:', { sql, params });
      const result = await ipcRenderer.invoke('db-get', sql, params);
      console.log('db-get result:', result);
      
      // Check if result contains an error
      if (result && result.error === true) {
        throw new Error(result.message || 'Unknown database error');
      }
      
      return result;
    } catch (err) {
      console.error('Error during db-get:', err);
      throw err;
    }
  };
  
  // Get multiple rows
  const all = async (sql: string, params: any[] = []) => {
    if (!electronEnvironment || !ipcRenderer) {
      console.warn('Database operations are only available in Electron');
      return [];
    }
    try {
      console.log('Calling db-all with:', { sql, params });
      const result = await ipcRenderer.invoke('db-all', sql, params);
      console.log('db-all result:', result);
      
      // Check if result contains an error
      if (result && result.error === true) {
        throw new Error(result.message || 'Unknown database error');
      }
      
      return result;
    } catch (err) {
      console.error('Error during db-all:', err);
      throw err;
    }
  };

  return {
    run,
    get,
    all,
    isElectron: electronEnvironment
  };
} 