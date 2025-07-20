<template>
  <div class="w-full">
    <div class="mb-4 flex">
      <h1 class="text-xl font-bold mb-4"> {{ t('members.members') }} <span class="text-sm text-gray-500">({{ filteredMembers.length }} {{ t('members.total') }})</span></h1>
    </div>
    
    <SearchBox
      v-model:searchTerm="searchTerm"
      :createUrl="ROUTES.MEMBERS.CREATE"
      :searchPlaceholder="t('members.search')"
      :createPlaceholder="t('members.add_member')"
      @update:searchTerm="currentPage = 1"
    />
    
    <MemberTable
      :members="paginatedMembers"
      :loading="loading"
      :searchTerm="searchTerm"
      @deleteMember="softDeleteMember"
      @restoreMember="restoreMember"
    />
    
    <Pagination
      v-model:currentPage="currentPage"
      :totalPages="totalPages"
      :totalItems="filteredMembers.length"
      :itemsPerPage="itemsPerPage"
    />
    
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import SearchBox from '@/components/shared/SearchBox.vue';
import MemberTable from '@/components/members/MemberTable.vue';
import Pagination from '@/components/members/Pagination.vue';
import { ROUTES } from '@/router/routerConst'
import { IPC_CHANNELS } from '@electron/ipc/ipcConstant.js';
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

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

// Search and pagination state
const searchTerm = ref('');
const currentPage = ref(1);
const itemsPerPage = 10;

// Get the ipcRenderer if available
// @ts-ignore - Electron exposes this property in the preload script
const ipc = window.electron.ipcRenderer;

// Check if running in Electron
onMounted(() => {
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

// Refresh members
const refreshMembers = async () => {  
  try {
    const data = await ipc.invoke(IPC_CHANNELS.MEMBER.GET_ALL_ACTIVE);
    members.value = data;
    
    // Reset to first page after refresh
    currentPage.value = 1;
  } catch (e: any) {
    console.error('Error loading members:', e);
    members.value = [];
  } finally {
    loading.value = false;
  }
};

// Soft delete a member
const softDeleteMember = async (id: number) => {  
  try {
    await ipc.invoke(IPC_CHANNELS.MEMBER.SOFT_DELETE, id);
    await refreshMembers();
  } catch (e: any) {
    console.error('Error deleting member:', e);
  } finally {
    loading.value = false;
  }
};

// Restore a member
const restoreMember = async (id: number) => {  
  loading.value = true;

  try {
    await ipc.invoke(IPC_CHANNELS.MEMBER.RESTORE, id);
    await refreshMembers();
  } catch (e: any) {
    console.error('Error restoring member:', e);
  } finally {
    loading.value = false;
  }
};
</script>