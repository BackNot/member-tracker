<template>
     <div class="flex items-center justify-between mb-6 pb-3 border-b border-gray-200">
      <h1 class="text-2xl font-bold text-gray-900">
        <i class="pi pi-user-plus mr-2 text-blue-600"></i>
        {{  t("membermemberships.info") }}
      </h1>

       <div class="flex items-center gap-4">   
          <div class="flex space-x-2">
            <button class="px-3 py-1 bg-green-500 text-white rounded disabled:opacity-50 flex items-center cursor-pointer" @click="addMembership()">
              <i class="pi pi-plus mr-1"></i>
                {{ t("membermemberships.add") }}
            </button>
          </div>
      </div>
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

     <CreateMemberMembershipModal 
      ref="createMemberMembershipModal" 
      :options="options"
      :rawOptions="rawOptionsRef"
      :memberId="memberId"
      @confirmed="handleFormSubmission"
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
import CreateMemberMembershipModal from '@/components/members/CreateMemberMembershipModal.vue';
import type { MemberMembershipFormData, SelectOption } from '@/types/membermemberships';
import type { MembershipForm } from '@/types/memberships';

defineProps<{
  memberMemberships: MemberMembership[];
  memberId: number|null;
}>()

// @ts-ignore - Electron exposes this property in the preload script
const ipc: IpcRenderer | undefined = window.electron?.ipcRenderer;

const { t } = useI18n()

const itemToDelete = ref<MemberMembership|null>(null)
const deleteModal = ref<InstanceType<typeof DeleteModal> | null>(null)
const createMemberMembershipModal = ref<InstanceType<typeof CreateMemberMembershipModal> | null>(null)

const confirmDelete = (membership: MemberMembership) => {
  itemToDelete.value = membership
  deleteModal.value?.openModal()
}

const addMembership = () => {
  createMemberMembershipModal.value?.openModal()
}

const deleteDescription = computed(() => {
  return itemToDelete.value ? `${t("membermemberships.delete_confirm_text")} ${itemToDelete.value.membership.name} ${itemToDelete.value.member.firstName} ?` : "";
});


const emit = defineEmits<{
  deleteMemberMembership: [id: number];
  createMemberMembership: [id: MemberMembershipFormData];
}>();


const handleDeleteConfirmed = () => {
  if (itemToDelete !== null && itemToDelete.value) {
    emit("deleteMemberMembership", itemToDelete.value.id);
    itemToDelete.value = null;
  }
}

const options = ref<SelectOption[]>([])
const rawOptionsRef = ref<MembershipForm[]>([])

onMounted(async () => {
  try {
    const rawOptions: MembershipForm[] = await ipc?.invoke(IPC_CHANNELS.MEMBERSHIP.GET_ALL_ACTIVE) || [];

    // Extract only id and name
    const mappedOptions: SelectOption[] = rawOptions
    .filter(item => item.id !== null)       // keep only items with non-null id
    .map(item => ({
      value: item.id as number,             // now safe to cast as number
      label: item.name
    }));

    // Update the ref
    options.value = mappedOptions;
    rawOptionsRef.value = rawOptions;
    console.log('Loaded membership options:', mappedOptions.length);
  } catch (error) {
    console.error('Error loading membership options:', error);
  }
});


const handleFormSubmission = async (formData: MemberMembershipFormData) => {
  console.log('Original form data:', formData);

  try {
    // Transform form data to match the model structure (for backend/API)
    const membershipDataForAPI = {
      memberId: formData.memberId,           // number | null
      membershipId: formData.membershipId, 
      startDate: formData.startDate,
      endDate: formData.endDate
    };

    console.log('Transformed data for creation:', membershipDataForAPI);

    // Validate required fields
    if (!membershipDataForAPI.memberId || !membershipDataForAPI.membershipId || !membershipDataForAPI.startDate) {
      throw new Error('Missing required fields: memberId, membershipId, and startDate are required');
    }

    // Emit the original formData (matches the interface)
    emit("createMemberMembership", membershipDataForAPI);

  } catch (error) {
    console.error('Error creating member membership:', error);
  }
};
</script>
