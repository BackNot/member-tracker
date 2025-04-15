export function useSequelize() {
    // Check if running in Electron
    const isElectron = () => {
      if (typeof window !== 'undefined' && typeof window.process === 'object' && 
          (window.process as any).type === 'renderer') {
        return true;
      }
      
      if (typeof process !== 'undefined' && typeof process.versions === 'object' && 
          !!process.versions.electron) {
        return true;
      }
      
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
    
    // Create a record
    const create = async <T>(modelName: string, data: Partial<T>): Promise<T | null> => {
      if (!electronEnvironment || !ipcRenderer) {
        console.warn('Database operations are only available in Electron');
        return null;
      }
      try {
        console.log(`Creating ${modelName} with:`, data);
        const result = await ipcRenderer.invoke('db-create', modelName, data);
        
        if (result && result.error === true) {
          throw new Error(result.message || 'Unknown database error');
        }
        
        return result;
      } catch (err) {
        console.error(`Error creating ${modelName}:`, err);
        throw err;
      }
    };
    
    // Find all records
    const findAll = async <T>(modelName: string, options: any = {}): Promise<T[]> => {
      if (!electronEnvironment || !ipcRenderer) {
        console.warn('Database operations are only available in Electron');
        return [];
      }
      try {
        console.log(`Finding all ${modelName} with options:`, options);
        const result = await ipcRenderer.invoke('db-findAll', modelName, options);
        
        if (result && result.error === true) {
          throw new Error(result.message || 'Unknown database error');
        }
        
        return result;
      } catch (err) {
        console.error(`Error finding all ${modelName}:`, err);
        throw err;
      }
    };
    
    // Find one record
    const findOne = async <T>(modelName: string, options: any = {}): Promise<T | null> => {
      if (!electronEnvironment || !ipcRenderer) {
        console.warn('Database operations are only available in Electron');
        return null;
      }
      try {
        console.log(`Finding one ${modelName} with options:`, options);
        const result = await ipcRenderer.invoke('db-findOne', modelName, options);
        
        if (result && result.error === true) {
          throw new Error(result.message || 'Unknown database error');
        }
        
        return result;
      } catch (err) {
        console.error(`Error finding one ${modelName}:`, err);
        throw err;
      }
    };
    
    // Delete records
    const destroy = async (modelName: string, options: any = {}): Promise<{ count: number }> => {
      if (!electronEnvironment || !ipcRenderer) {
        console.warn('Database operations are only available in Electron');
        return { count: 0 };
      }
      try {
        console.log(`Deleting ${modelName} with options:`, options);
        const result = await ipcRenderer.invoke('db-destroy', modelName, options);
        
        if (result && result.error === true) {
          throw new Error(result.message || 'Unknown database error');
        }
        
        return result;
      } catch (err) {
        console.error(`Error deleting ${modelName}:`, err);
        throw err;
      }
    };
  
    return {
      create,
      findAll,
      findOne,
      destroy,
      isElectron: electronEnvironment
    };
  }