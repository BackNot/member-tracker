<template>
     <div class="flex items-center justify-between mb-6 pb-3 border-b border-gray-200">
      <h1 class="text-2xl font-bold text-gray-900">
        <i class="pi pi-user-plus mr-2 text-blue-600"></i>
        {{  t("membermemberships.info") }}
      </h1>
    </div>

    <div class="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div class="px-6 py-4 border-b border-gray-200">
        <h2 class="text-lg font-medium text-gray-900">
            </h2>
        </div>
         <table class="table w-full">
      <thead>
        <tr>
          <th>{{ t("membermemberships.id") }}</th>
          <th>{{ t("membermemberships.name") }}</th>
          <th>{{ t("membermemberships.start_date") }}</th>
        <th>{{ t("membermemberships.end_date") }}</th>
          <th>{{ t("members.actions") }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="memberMembership in memberMemberships" :key="memberMembership.id">
          <th>{{ memberMembership.id }}</th>
          <td>
            {{ memberMembership.membership.name }}
          </td>
          <td>
            {{ formatDate(memberMembership.startDate) }}
          </td>
          <td>
            {{ formatDate(memberMembership.endDate) }}
          </td>
          <td>
            <!-- <button
              @click="edit(member)"
              class="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs hover:bg-blue-200 flex items-center inline-block"
            >
              <i class="pi pi-pencil mr-1"></i> {{ t("members.edit") }}
            </button> -->

            <button
              @click="confirmDelete(memberMembership)"
              class="px-2 py-1 bg-red-100 text-red-800 rounded text-xs hover:bg-red-200 flex items-center ml-2 inline-block"
            >
              <i class="pi pi-trash mr-1"></i> {{ t("membermemberships.delete") }}
            </button>
          </td>
        </tr>
        <tr v-if="memberMemberships.length === 0">
          <td colspan="5" class="text-center text-gray-500 py-4">
            {{ t("membermemberships.not_found") }}
          </td>
        </tr>
      </tbody>
    </table>
    </div>

     <DeleteModal 
      ref="deleteModal" 
      :description="deleteDescription"
      :item="itemToDelete"
      :confirm-text="t('members.delete_confirm_button')" 
      :cancel-text="t('members.delete_cancel_button')" 
      :title="t('members.delete_confirm_title')" 
      @confirmed="handleDeleteConfirmed"
    />
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n'
import { IPC_CHANNELS } from '@/../electron/ipc/ipcConstant.js';
import { formatDate } from '@/utils/date';
import type { MemberMembership } from '@/types/memberships';
import type { IpcRenderer } from '@/types/ipc.js';
import DeleteModal from '@/components/shared/DeleteModal.vue';

defineProps<{
  memberMemberships: MemberMembership[];
}>()

// @ts-ignore - Electron exposes this property in the preload script
const ipc: IpcRenderer | undefined = window.electron?.ipcRenderer;

const { t } = useI18n()

const itemToDelete = ref<MemberMembership|null>(null)
const deleteModal = ref<InstanceType<typeof DeleteModal> | null>(null)

const confirmDelete = (membership: MemberMembership) => {
  itemToDelete.value = membership
  deleteModal.value?.openModal()
}

const deleteDescription = computed(() => {
  return itemToDelete.value ? `${t("membermemberships.delete_confirm_text")} ${itemToDelete.value.membership.name} ${itemToDelete.value.member.firstName} ?` : "";
});


const emit = defineEmits<{
  deleteMemberMembership: [id: number];
}>();


const handleDeleteConfirmed = () => {
  if (itemToDelete !== null && itemToDelete.value) {
    emit("deleteMemberMembership", itemToDelete.value.id);
    itemToDelete.value = null;
  }
}

</script>
