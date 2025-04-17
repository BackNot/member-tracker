// Create this file if it doesn't exist
declare interface Window {
  require: (module: string) => any;
  electron: ElectronAPI;
}

// TypeScript declaration for Electron APIs exposed through preload script
interface ElectronAPI {
  ipcRenderer: {
    invoke: (channel: string, ...args: any[]) => Promise<any>;
  };
} 