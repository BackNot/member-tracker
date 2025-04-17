<template>
  <div class="w-full">
    <h1 class="text-xl font-bold mb-4">Members <span class="text-sm text-gray-500">({{ members.length }} total)</span></h1>

    <div class="flex space-x-2 mb-6">
      <button
        @click="refreshMembers"
        class="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        :disabled="loading"
      >
        Refresh Members
      </button>

      <button
        @click="addSampleMember"
        class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        :disabled="loading"
      >
        Add Sample Member
      </button>
    </div>

    <div v-if="loading" class="text-center py-4">
      Loading...
    </div>
    <div v-else class="overflow-x-auto rounded-box border border-base-content/5 bg-base-100 w-full">
      <table class="table w-full">
        <!-- head -->
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Nickname</th>
            <th>Description</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="member in members" :key="member.id">
            <th>{{ member.id }}</th>
            <td>{{ member.firstName }} {{ member.lastName }}</td>
            <td>{{ member.nickname || '-' }}</td>
            <td class="max-w-xs truncate">{{ member.description || '-' }}</td>
            <td>{{ formatDate(member.createdAt) }}</td>
            <td>
              <button
                @click="softDeleteMember(member.id)"
                v-if="!member.deletedAt"
                class="px-2 py-1 bg-red-100 text-red-800 rounded text-xs hover:bg-red-200"
              >
                Delete
              </button>
              <button
                @click="restoreMember(member.id)"
                v-else
                class="px-2 py-1 bg-green-100 text-green-800 rounded text-xs hover:bg-green-200"
              >
                Restore
              </button>
            </td>
          </tr>
          <tr v-if="members.length === 0">
            <td colspan="6" class="text-center text-gray-500 py-4">
              No members found
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

// Member interface
interface Member {
  id: number;
  firstName: string;
  lastName: string;
  nickname?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

// Component state
const members = ref<Member[]>([]);
const loading = ref(false);
const message = ref('');
const electronStatus = ref('');

// Get the ipcRenderer if available
// @ts-ignore - Electron exposes this property in the preload script
const ipc = window.electron.ipcRenderer;

// Check if running in Electron
onMounted(() => {
  // @ts-ignore - Electron exposes this property in the preload script
  electronStatus.value = window.electron ? 'Running in Electron' : 'Not running in Electron';
  refreshMembers();
});

// Format date for display
const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString();
};

// Check if we have access to IPC
const checkIpc = () => {
  if (!ipc) {
    message.value = 'Error: Electron IPC not available';
    return false;
  }
  return true;
};

// Refresh members
const refreshMembers = async () => {
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

// Add a sample member
const addSampleMember = async () => {
  if (!checkIpc()) return;
  
  loading.value = true;
  message.value = 'Creating sample member...';
  
  try {
    const firstNames = ['John', 'Jane', 'Bob', 'Alice', 'David', 'Sarah', 'Michael', 'Emily'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Jones', 'Brown', 'Davis', 'Miller', 'Wilson'];
    const nicknames = ['', 'Doc', 'Chief', 'Buddy', 'Ace', 'Champ', 'Skip', 'Coach'];

    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const nickname = nicknames[Math.floor(Math.random() * nicknames.length)];
    const description = nickname
      ? `${firstName} "${nickname}" ${lastName} is a valued member of our organization.`
      : `${firstName} ${lastName} is a valued member of our organization.`;

    await ipc.invoke('member:create', {
      firstName,
      lastName,
      nickname: nickname || undefined,
      description
    });
    
    message.value = 'Member created successfully';
    await refreshMembers();
  } catch (e: any) {
    console.error('Error creating member:', e);
    message.value = 'Error creating member: ' + e.message;
  } finally {
    loading.value = false;
  }
};

// Soft delete a member
const softDeleteMember = async (id: number) => {
  if (!checkIpc() || !id) return;
  
  loading.value = true;
  message.value = 'Deleting member...';

  try {
    await ipc.invoke('member:softDelete', id);
    message.value = 'Member deleted successfully';
    await refreshMembers();
  } catch (e: any) {
    console.error('Error deleting member:', e);
    message.value = 'Error deleting member: ' + e.message;
  } finally {
    loading.value = false;
  }
};

// Restore a member
const restoreMember = async (id: number) => {
  if (!checkIpc() || !id) return;
  
  loading.value = true;
  message.value = 'Restoring member...';

  try {
    await ipc.invoke('member:restore', id);
    message.value = 'Member restored successfully';
    await refreshMembers();
  } catch (e: any) {
    console.error('Error restoring member:', e);
    message.value = 'Error restoring member: ' + e.message;
  } finally {
    loading.value = false;
  }
};
</script>