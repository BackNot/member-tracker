import { ref } from 'vue';

export function useMember() {
  const members = ref([]);
  const loading = ref(false);
  const message = ref('');
  
  // Get the ipcRenderer if available
  // @ts-ignore - Electron exposes this property in the preload script
  const ipc = window?.electron?.ipcRenderer;
  
  // Check if we have access to IPC
  const checkIpc = () => {
    if (!ipc) {
      message.value = 'Error: Electron IPC not available';
      return false;
    }
    return true;
  };

  const getAll = async () => {
    if (!checkIpc()) return;
    
    loading.value = true;
    message.value = 'Loading members...';

    try {
      const data = await ipc.invoke('member:getAll');
      members.value = data;
      message.value = `Loaded ${data.length} members`;
    } catch (e: any) {
      console.error('Error loading members:', e);
      message.value = 'Error loading members: ' + e.message;
      members.value = [];
    } finally {
      loading.value = false;
    }
  };

  const create = async (data: any) => {
    if (!checkIpc()) return null;
    
    loading.value = true;
    message.value = 'Creating member...';

    try {
      const result = await ipc.invoke('member:create', data);
      message.value = 'Member created successfully';
      return result;
    } catch (e: any) {
      console.error('Error creating member:', e);
      message.value = 'Error creating member: ' + e.message;
      return null;
    } finally {
      loading.value = false;
    }
  };

  const softDelete = async (id: number) => {
    if (!checkIpc()) return null;
    
    loading.value = true;
    message.value = 'Deleting member...';

    try {
      const result = await ipc.invoke('member:softDelete', id);
      message.value = 'Member deleted successfully';
      return result;
    } catch (e: any) {
      console.error('Error deleting member:', e);
      message.value = 'Error deleting member: ' + e.message;
      return null;
    } finally {
      loading.value = false;
    }
  };

  const restore = async (id: number) => {
    if (!checkIpc()) return null;
    
    loading.value = true;
    message.value = 'Restoring member...';

    try {
      const result = await ipc.invoke('member:restore', id);
      message.value = 'Member restored successfully';
      return result;
    } catch (e: any) {
      console.error('Error restoring member:', e);
      message.value = 'Error restoring member: ' + e.message;
      return null;
    } finally {
      loading.value = false;
    }
  };

  return {
    members,
    loading,
    message,
    getAll,
    create,
    softDelete,
    restore
  };
}