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
          <th>{{ t("membermemberships.trainings") }}</th>
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
            <template v-if="memberMembership.totalTrainings !== null">
              <div class="flex items-center gap-2">
                <button
                  v-if="memberMembership.remainingTrainings < memberMembership.totalTrainings"
                  @click="addTraining(memberMembership)"
                  class="px-2 py-1 bg-green-100 text-green-800 rounded text-xs hover:bg-green-200 flex items-center"
                  :title="t('membermemberships.add_training')"
                >
                  <i class="pi pi-plus"></i>
                </button>
                <span :class="getTrainingsClass(memberMembership)">
                  {{ memberMembership.remainingTrainings }} / {{ memberMembership.totalTrainings }}
                </span>
                <button
                  v-if="memberMembership.remainingTrainings > 0 && !isExpired(memberMembership)"
                  @click="subtractTraining(memberMembership)"
                  class="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs hover:bg-blue-200 flex items-center"
                  :title="t('membermemberships.use_training')"
                >
                  <i class="pi pi-minus"></i>
                </button>
                <button
                  @click="showTrainingHistory(memberMembership)"
                  class="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200 flex items-center"
                  :title="t('membermemberships.view_history')"
                >
                  <i class="pi pi-history"></i>
                </button>
              </div>
            </template>
            <template v-else>
              <span class="text-gray-400">-</span>
            </template>
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
          <td colspan="6" class="text-center text-gray-500 py-4">
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

    <!-- Training History Modal -->
    <dialog ref="historyModal" class="backdrop:bg-gray-900 backdrop:bg-opacity-50 bg-white rounded-xl shadow-2xl border-0 p-0 max-w-md w-full mx-auto">
      <div class="p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">
            <i class="pi pi-history mr-2 text-blue-600"></i>
            {{ t("membermemberships.training_history") }}
          </h3>
          <button @click="closeHistoryModal" class="text-gray-400 hover:text-gray-600">
            <i class="pi pi-times"></i>
          </button>
        </div>

        <div v-if="historyLoading" class="text-center py-4">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        </div>

        <div v-else-if="trainingLogs.length === 0" class="text-center py-4 text-gray-500">
          {{ t("membermemberships.no_history") }}
        </div>

        <div v-else class="max-h-80 overflow-y-auto">
          <ul class="space-y-2">
            <li v-for="log in trainingLogs" :key="log.id" class="flex items-center gap-3 p-2 rounded"
                :class="log.action === 'add' ? 'bg-green-50' : 'bg-red-50'">
              <i :class="log.action === 'add' ? 'pi pi-plus-circle text-green-600' : 'pi pi-minus-circle text-red-600'"></i>
              <span class="text-gray-700">{{ formatDateTime(log.usedAt) }}</span>
              <span :class="log.action === 'add' ? 'text-green-600 text-xs' : 'text-red-600 text-xs'">
                {{ log.action === 'add' ? t("membermemberships.added") : t("membermemberships.used") }}
              </span>
            </li>
          </ul>
        </div>

        <div class="mt-4 pt-4 border-t">
          <button @click="closeHistoryModal" class="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
            {{ t("membermemberships.close") }}
          </button>
        </div>
      </div>
    </dialog>

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
const historyModal = ref<HTMLDialogElement | null>(null)
const trainingLogs = ref<any[]>([])
const historyLoading = ref(false)

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
  subtractTraining: [id: number];
  addTraining: [id: number];
}>();

// Helper function to get color class for trainings count
const getTrainingsClass = (mm: MemberMembership) => {
  if (mm.remainingTrainings === null) return '';
  if (mm.remainingTrainings === 0) return 'text-red-600 font-bold';
  if (mm.remainingTrainings <= 3) return 'text-orange-600 font-semibold';
  return 'text-green-600';
};

// Check if membership is expired
const isExpired = (mm: MemberMembership) => {
  const endDateExpired = new Date(mm.endDate) < new Date();
  const trainingsExpired = mm.remainingTrainings === 0 && mm.totalTrainings !== null;
  return endDateExpired || trainingsExpired;
};

// Subtract one training
const subtractTraining = (mm: MemberMembership) => {
  emit('subtractTraining', mm.id);
};

// Add one training back
const addTraining = (mm: MemberMembership) => {
  emit('addTraining', mm.id);
};

// Show training history modal
const showTrainingHistory = async (mm: MemberMembership) => {
  historyLoading.value = true;
  trainingLogs.value = [];
  historyModal.value?.showModal();

  try {
    trainingLogs.value = await window.electron.memberMembership.getTrainingLogs(mm.id);
  } catch (error) {
    console.error('Error loading training logs:', error);
  } finally {
    historyLoading.value = false;
  }
};

// Close training history modal
const closeHistoryModal = () => {
  historyModal.value?.close();
};

// Format date time for display
const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('bg-BG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};


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
