<template>
  <div class="w-full">
    <div class="mb-4 flex">
      <h1 class="text-xl font-bold mb-4">Members <span class="text-sm text-gray-500">({{ filteredMembers.length }} total)</span></h1>

      <label class="text-xs text-gray-700 cursor-pointer ml-auto">
            <input 
              type="checkbox" 
              v-model="showDeleted" 
              class="form-checkbox h-3 w-3 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            >
            <span class="ml-1">Show deleted members</span>
          </label>
      </div>
      
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
      <!-- Search Box -->
      <div class="relative w-full md:w-64">
        <input
          v-model="searchTerm"
          type="text"
          placeholder="Search members..."
          class="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:border-gray-500 transition-colors duration-200"
          @input="currentPage = 1"
        />
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <i class="pi pi-search text-gray-400"></i>
        </div>
        <button 
          v-if="searchTerm" 
          @click="searchTerm = ''" 
          class="absolute inset-y-0 right-0 pr-3 flex items-center"
        >
          <i class="pi pi-times text-gray-400 hover:text-gray-600"></i>
        </button>
      </div>

      <div class="flex items-center gap-4">
       
        <div class="flex space-x-2">
        <router-link
          :to="ROUTES.MEMBERS.CREATE"
          class="px-3 py-1 bg-green-500 text-white rounded disabled:opacity-50 flex items-center cursor-pointer"
        >
          <i class="pi pi-plus mr-1"></i>
          Add Member
        </router-link>
        </div>
      </div>
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
            <th>Description</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="member in paginatedMembers" :key="member.id">
            <th>{{ member.id }}</th>
            <td>{{ member.firstName }} {{ member.lastName }} {{ member.nickname ? `(${member.nickname})` : '' }}</td>
            <td class="max-w-xs truncate">{{ member.description || '-' }}</td>
            <td>{{ formatDate(member.createdAt) }}</td>
            <td>
              <button
                @click="softDeleteMember(member.id)"
                v-if="!member.deletedAt"
                class="px-2 py-1 bg-red-100 text-red-800 rounded text-xs hover:bg-red-200 flex items-center"
              >
                <i class="pi pi-trash mr-1"></i> Delete
              </button>
              <button
                @click="restoreMember(member.id)"
                v-else
                class="px-2 py-1 bg-green-100 text-green-800 rounded text-xs hover:bg-green-200 flex items-center"
              >
                <i class="pi pi-undo mr-1"></i> Restore
              </button>
            </td>
          </tr>
          <tr v-if="filteredMembers.length === 0">
            <td colspan="5" class="text-center text-gray-500 py-4">
              {{ searchTerm ? 'No matching members found. Try a different search term.' : 'No members found' }}
            </td>
          </tr>
        </tbody>
      </table>
      
      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200">
        <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-gray-700">
              Showing <span class="font-medium">{{ paginationStart }}</span> to 
              <span class="font-medium">{{ paginationEnd }}</span> of 
              <span class="font-medium">{{ filteredMembers.length }}</span> results
            </p>
          </div>
          <div>
            <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <!-- First page button -->
              <button
                @click="currentPage = 1"
                :disabled="currentPage === 1"
                class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span class="sr-only">First</span>
                <i class="pi pi-angle-double-left"></i>
              </button>
              
              <!-- Previous page button -->
              <button
                @click="currentPage--"
                :disabled="currentPage === 1"
                class="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span class="sr-only">Previous</span>
                <i class="pi pi-angle-left"></i>
              </button>
              
              <!-- Page numbers -->
              <template v-for="page in displayedPages" :key="page">
                <button
                  v-if="page !== '...'"
                  @click="currentPage = Number(page)"
                  :class="[
                    currentPage === page ? 'z-10 bg-blue-50 border-blue-500 text-blue-600' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50',
                    'relative inline-flex items-center px-4 py-2 border text-sm font-medium'
                  ]"
                >
                  {{ page }}
                </button>
                <span
                  v-else
                  class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                >
                  ...
                </span>
              </template>
              
              <!-- Next page button -->
              <button
                @click="currentPage++"
                :disabled="currentPage === totalPages"
                class="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span class="sr-only">Next</span>
                <i class="pi pi-angle-right"></i>
              </button>
              
              <!-- Last page button -->
              <button
                @click="currentPage = totalPages"
                :disabled="currentPage === totalPages"
                class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span class="sr-only">Last</span>
                <i class="pi pi-angle-double-right"></i>
              </button>
            </nav>
          </div>
        </div>
        
        <!-- Mobile pagination -->
        <div class="flex-1 flex justify-between sm:hidden">
          <button
            @click="currentPage--"
            :disabled="currentPage === 1"
            class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i class="pi pi-angle-left mr-1"></i> Previous
          </button>
          <span class="text-sm text-gray-700 px-4 py-2">
            Page {{ currentPage }} of {{ totalPages }}
          </span>
          <button
            @click="currentPage++"
            :disabled="currentPage === totalPages"
            class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next <i class="pi pi-angle-right ml-1"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { ROUTES } from '../router/routerConst'

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

// Search and pagination state
const searchTerm = ref('');
const currentPage = ref(1);
const itemsPerPage = 10;
const showDeleted = ref(false);

// Get the ipcRenderer if available
// @ts-ignore - Electron exposes this property in the preload script
const ipc = window.electron.ipcRenderer;

// Check if running in Electron
onMounted(() => {
  // @ts-ignore - Electron exposes this property in the preload script
  electronStatus.value = window.electron ? 'Running in Electron' : 'Not running in Electron';
  refreshMembers();
});

// Filter members based on search term
const filteredMembers = computed(() => {
  if (!searchTerm.value) return members.value;
  
  const search = searchTerm.value.toLowerCase();
  return members.value.filter(member => {
    return member.firstName.toLowerCase().includes(search) ||
           member.lastName.toLowerCase().includes(search) ||
           (member.nickname && member.nickname.toLowerCase().includes(search)) ||
           (member.description && member.description.toLowerCase().includes(search)) ||
           `${member.firstName} ${member.lastName}`.toLowerCase().includes(search);
  });
});

// Reset to first page when search term changes
watch(searchTerm, () => {
  currentPage.value = 1;
});

// Pagination computed properties
const paginatedMembers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredMembers.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(filteredMembers.value.length / itemsPerPage));
});

const paginationStart = computed(() => {
  if (filteredMembers.value.length === 0) return 0;
  return ((currentPage.value - 1) * itemsPerPage) + 1;
});

const paginationEnd = computed(() => {
  return Math.min(currentPage.value * itemsPerPage, filteredMembers.value.length);
});

const displayedPages = computed(() => {
  if (totalPages.value <= 7) {
    return Array.from({ length: totalPages.value }, (_, i) => i + 1);
  }
  
  const pages: (number | string)[] = [];
  
  // Always show first page
  pages.push(1);
  
  // If current page is close to the beginning
  if (currentPage.value <= 4) {
    pages.push(2, 3, 4, 5, '...', totalPages.value);
  } 
  // If current page is close to the end
  else if (currentPage.value >= totalPages.value - 3) {
    pages.push(
      '...', 
      totalPages.value - 4, 
      totalPages.value - 3, 
      totalPages.value - 2, 
      totalPages.value - 1, 
      totalPages.value
    );
  } 
  // If current page is in the middle
  else {
    pages.push(
      '...', 
      currentPage.value - 1, 
      currentPage.value, 
      currentPage.value + 1, 
      '...', 
      totalPages.value
    );
  }
  
  return pages;
});

// Format date for display
const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString();
};

// Refresh members
const refreshMembers = async () => {  
  loading.value = true;
  message.value = 'Loading members...';

  try {
    const data = await ipc.invoke('member:getAll');
    members.value = data;
    message.value = `Loaded ${data.length} members`;
    
    // Reset to first page after refresh
    currentPage.value = 1;
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