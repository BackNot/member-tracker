// types/electron.d.ts
export interface ElectronAPI {
  ipcRenderer: {
    invoke: (channel: string, ...args: any[]) => Promise<any>
  }
  backup: {
    checkAuth: () => Promise<boolean>
    authenticate: () => Promise<{ success: boolean; error?: string; authUrl?: string; method?: string }>
    completeAuth: (authCode: string) => Promise<{ success: boolean; error?: string }>
    create: () => Promise<{ success: boolean; error?: string; fileId?: string; fileName?: string }>
    list: () => Promise<{ success: boolean; error?: string; backups?: BackupItem[] }>
    restore: (fileId: string, fileName: string) => Promise<{ success: boolean; error?: string; message?: string }>
    delete: (fileId: string) => Promise<{ success: boolean; error?: string }>
    disconnect: () => Promise<{ success: boolean; error?: string }>
  }
}

export interface BackupItem {
  id: string
  name: string
  createdTime: string
  size: string
}

declare global {
  interface Window {
    electron: ElectronAPI
  }
}

export {}