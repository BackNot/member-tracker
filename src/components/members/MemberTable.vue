<template>
  <div v-if="loading" class="text-center py-4">
    Loading...
  </div>
  <div v-else class="overflow-x-auto rounded-box border border-base-content/5 bg-base-100 w-full">
    <table class="table w-full">
      <thead>
        <tr>
          <th>{{ t("members.id") }}</th>
          <th>{{ t("members.name") }}</th>
          <th>{{ t("members.description") }}</th>
          <th>{{ t("members.created_at") }}</th>
          <th>{{ t("members.actions") }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="member in members" :key="member.id">
          <th>{{ member.id }}</th>
          <td>{{ member.firstName }} {{ member.lastName }} {{ member.nickname ? `(${member.nickname})` : '' }}</td>
          <td class="max-w-xs truncate">{{ member.description || '-' }}</td>
          <td>{{ formatDate(member.createdAt) }}</td>
          <td>
            <button
              @click="edit(member)"
              class="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs hover:bg-blue-200 flex items-center inline-block"
            >
              <i class="pi pi-pencil mr-1"></i> {{ t("members.edit") }}
            </button>

            <button
              @click="confirmDelete(member)"
              class="px-2 py-1 bg-red-100 text-red-800 rounded text-xs hover:bg-red-200 flex items-center ml-2 inline-block"
            >
              <i class="pi pi-trash mr-1"></i> {{ t("members.delete") }}
            </button>
          </td>
        </tr>
        <tr v-if="members.length === 0">
          <td colspan="5" class="text-center text-gray-500 py-4">
            {{ t("members.not_found") }}
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
import DeleteModal from '@/components/shared/DeleteModal.vue';
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { ROUTE_NAMES } from '@/router/routerConst';
import type { Member } from '@/types/members'
import { formatDate } from '@/utils/date';

const router = useRouter()

const { t } = useI18n()

const props = defineProps<{
  members: Member[];
  loading: boolean;
  searchTerm?: string;
}>()


const itemToDelete = ref<Member|null>(null)
const deleteModal = ref<InstanceType<typeof DeleteModal> | null>(null)

const confirmDelete = (user: Member) => {
  itemToDelete.value = user
  deleteModal.value?.openModal()
}

const deleteDescription = computed(() => {
  return itemToDelete.value ? `${t("members.delete_confirm_text")} ${itemToDelete.value.firstName} ${itemToDelete.value.lastName} ?` : "";
});

const emit = defineEmits<{
  deleteMember: [id: number];
  restoreMember: [id: number];
}>();

const handleDeleteConfirmed = () => {
  if (itemToDelete !== null && itemToDelete.value) {
    emit("deleteMember", itemToDelete.value.id);
    itemToDelete.value = null;
  }
}

const edit = (user: Member) => {
  router.push({ name: ROUTE_NAMES.MEMBERS.CREATE, params: { id: user.id } })
}
</script>