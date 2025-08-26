// src/types/global.d.ts
export {};

declare global {
  interface Window {
    electron: ElectronAPI;
  }

  interface ElectronAPI {
    ipcRenderer: {
      invoke: (channel: string, ...args: any[]) => Promise<any>;
    };
    backup: {
      checkAuth: () => Promise<any>;
      authenticate: () => Promise<any>;
      completeAuth: (authCode: string) => Promise<any>;
      create: () => Promise<any>;
      list: () => Promise<any>;
      restore: (fileId: string, fileName: string) => Promise<any>;
      delete: (fileId: string) => Promise<any>;
      disconnect: () => Promise<any>;
    };
    notification: {
      getAll: () => Promise<any[]>;
      getAllActive: (options?: any) => Promise<any[]>;
      getUnread: (options?: any) => Promise<any[]>;
      getById: (id: string) => Promise<any>;
      getByMemberMembership: (memberMembershipId: string, options?: any) => Promise<any[]>;
      create: (data: any) => Promise<any>;
      update: (values: any, options?: any) => Promise<any>;
      markAsRead: (id: number) => Promise<void>;
      markAllAsRead: (memberMembershipId?: string) => Promise<void>;
      softDelete: (id: string) => Promise<void>;
      restore: (id: string) => Promise<void>;
    };
  }
}