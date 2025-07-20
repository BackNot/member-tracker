<template>
  <div v-if="loading" class="text-center py-4">
    Loading...
  </div>
  <div v-else class="overflow-x-auto rounded-box border border-base-content/5 bg-base-100 w-full">
    <table class="table w-full">
      <thead>
        <tr>
          <th>{{ t("memberships.id") }}</th>
          <th>{{ t("memberships.name") }}</th>
          <th>{{ t("memberships.description") }}</th>
          <th>{{ t("memberships.days") }}</th>
          <th>{{ t("memberships.actions") }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="membership in memberships" :key="membership.id">
          <th>{{ membership.id }}</th>
          <td>{{ membership.name }} </td>
          <td class="max-w-xs truncate">{{ membership.description }}</td>
          <td>{{ membership.days }} </td>
          <td>
            <button
              @click="confirmDelete(membership)"
              class="px-2 py-1 bg-red-100 text-red-800 rounded text-xs hover:bg-red-200 flex items-center"
            >
              <i class="pi pi-trash mr-1"></i> {{ t("memberships.delete") }}
            </button>
          </td>
        </tr>
        <tr v-if="memberships.length === 0">
          <td colspan="5" class="text-center text-gray-500 py-4">
            {{ t("memberships.not_found") }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  
 <DeleteModal 
      ref="deleteModal" 
      :description="deleteDescription"
      :item="itemToDelete"
      :confirm-text="t('memberships.delete_confirm_button')" 
      :cancel-text="t('memberships.delete_cancel_button')" 
      :title="t('memberships.delete_confirm_title')" 
      @confirmed="handleDeleteConfirmed"
    />
    
    </template>

<script setup lang="ts">
import DeleteModal from '@/components/shared/DeleteModal.vue';
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

// Membership interface
interface Membership {
  id: number;
  name: string;
  description: string;
  days: number;
}

const props = defineProps<{
  memberships: Membership[];
  loading: boolean;
  searchTerm?: string;
}>()


const itemToDelete = ref<Membership|null>(null)
const deleteModal = ref<InstanceType<typeof DeleteModal> | null>(null)

const confirmDelete = (user: Membership) => {
  itemToDelete.value = user
  deleteModal.value?.openModal()
}

const deleteDescription = computed(() => {
  return itemToDelete.value ? `${t("memberships.delete_confirm_text")} ${itemToDelete.value.name} ?` : "";
});

const emit = defineEmits<{
  deleteMembership: [id: number];
}>();

const handleDeleteConfirmed = () => {
  if (itemToDelete !== null && itemToDelete.value) {
    emit("deleteMembership", itemToDelete.value.id);
    itemToDelete.value = null;
  }
}

const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString();
};
</script>