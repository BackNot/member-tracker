<template>
  <div class="w-full">
    <div class="mb-4 flex">
      <h1 class="text-xl font-bold mb-4"> {{ t('memberships.memberships') }} <span class="text-sm text-gray-500">({{ filteredMemberships.length }} {{ t('members.total') }})</span></h1>
    </div>
    
    <SearchBox
      v-model:searchTerm="searchTerm"
      :createUrl="ROUTES.MEMBERSHIPS.CREATE"
      :searchPlaceholder="t('memberships.search')"
      :createPlaceholder="t('memberships.add_membership')"
      @update:searchTerm="currentPage = 1"
    />
    
    <MembershipTable
      :memberships="paginatedMemberships"
      :loading="loading"
      :searchTerm="searchTerm"
      @deleteMembership="softDeleteMembership"
    />
    
    <Pagination
      v-model:currentPage="currentPage"
      :totalPages="totalPages"
      :totalItems="filteredMemberships.length"
      :itemsPerPage="itemsPerPage"
    />
    
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import SearchBox from '@/components/shared/SearchBox.vue';
import MembershipTable from '@/components/memberships/MembershipTable.vue';
import Pagination from '@/components/members/Pagination.vue';
import { IPC_CHANNELS } from '@electron/ipc/ipcConstant.js';
import { ROUTES } from '@/router/routerConst'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

// Member interface
interface Membership {
  id: number;
  name: string;
  description: string;
  days: number;
}

const memberships = ref<Membership[]>([]);
const loading = ref(false);

const searchTerm = ref('');
const currentPage = ref(1);
const itemsPerPage = 10;

// Get the ipcRenderer if available
// @ts-ignore - Electron exposes this property in the preload script
const ipc = window.electron.ipcRenderer;

// Check if running in Electron
onMounted(() => {
  refreshMemberships();
});

// Filter members based on search term
const filteredMemberships = computed(() => {
  if (!searchTerm.value) return memberships.value;
  
  const search = searchTerm.value.toLowerCase();
  return memberships.value.filter(membership => {
    return membership.name.toLowerCase().includes(search) ||
           membership.description.toLowerCase().includes(search) ||
           membership.days.toString().toLowerCase().includes(search)
  });
});

// Reset to first page when search term changes
watch(searchTerm, () => {
  currentPage.value = 1;
});

// Pagination computed properties
const paginatedMemberships = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredMemberships.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(filteredMemberships.value.length / itemsPerPage));
});

const refreshMemberships = async () => {  
  try {
    const data = await ipc.invoke(IPC_CHANNELS.MEMBERSHIP.GET_ALL_ACTIVE);
    memberships.value = data;
    
    currentPage.value = 1;
  } catch (e: any) {
    console.error('Error loading memberships:', e);
    memberships.value = [];
  } finally {
    loading.value = false;
  }
};

const softDeleteMembership = async (id: number) => {  
  try {
    await ipc.invoke(IPC_CHANNELS.MEMBERSHIP.SOFT_DELETE, id);
    await refreshMemberships();
  } catch (e: any) {
    console.error('Error deleting membership:', e);
  } finally {
    loading.value = false;
  }
};
</script>