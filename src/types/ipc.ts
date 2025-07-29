export interface IpcRenderer {
  invoke: (channel: string, ...args: any[]) => Promise<any>;
}

export interface IpcError extends Error {
  code?: string;
  errno?: number;
}