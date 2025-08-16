<template>
  <div class="mx-auto py-6 px-4 sm:px-0">
    <div class="flex items-center justify-between mb-6">
      <router-link 
        :to="ROUTES.MEMBERSHIPS.LIST" 
        class="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors flex items-center"
      >
        <i class="pi pi-arrow-left mr-2"></i> {{ t("memberships.back_to_memberships_list") }}
      </router-link>
    </div>  
    
    <Breadcrumbs :items="breadcrumbItems" />

    <!-- Page title with stronger visual hierarchy -->
    <div class="flex items-center justify-between mb-6 pb-3 border-b border-gray-200">
      <h1 class="text-2xl font-bold text-gray-900">
        <i class="pi pi-user-plus mr-2 text-blue-600"></i>
        {{ isEditMode ? t("memberships.edit_information") : t("memberships.add_new_membership") }}
      </h1>
    </div>

    <CreateMembershipForm
      :loading="loading"
      :messageType="messageType"
      :message="message"
      :initialData="editMembershipData"
      @submit="handleFormSubmit"
      @cancel="handleCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ROUTES } from '../router/routerConst';
import type { MembershipForm } from '@/types/memberships';
import { IPC_CHANNELS } from '@/../electron/ipc/ipcConstant.js';
import Breadcrumbs from '@/components/shared/Breadcrumbs.vue';
import { useI18n } from 'vue-i18n';
import CreateMembershipForm from '@/components/members/CreateMembershipForm.vue';
import { useRoute } from 'vue-router'
import type { AlertType } from '@/types/alerts.js';
import type { MembershipPayload } from '@/types/memberships';

// Interface for any IPC error
interface IpcError extends Error {
  code?: string;
  errno?: number;
}

// Define a type for the Electron IPC renderer
interface IpcRenderer {
  invoke: (channel: string, ...args: any[]) => Promise<any>;
}

const route = useRoute()
const { t } = useI18n();
const router = useRouter();

// UI state
const loading = ref<boolean>(false);
const message = ref<string>('');
const messageType = ref<AlertType>('success');
const editMembershipData = ref<MembershipForm|null>(null);

const isEditMode = computed(() => {
  const id = Number(route.params.id);
  return !isNaN(id) && id > 0;
});

const breadcrumbItems = computed(() => [
  { text: t('memberships.memberships'), to: ROUTES.MEMBERSHIPS.LIST },
  { text: isEditMode.value ? t('memberships.edit_membership')  : t('memberships.new_membership') }
]);

// Get the ipcRenderer if available
// @ts-ignore - Electron exposes this property in the preload script
const ipc: IpcRenderer | undefined = window.electron?.ipcRenderer;


onMounted(async () => {
  if (isEditMode.value) {
    const id = route.params.id
    console.log(route.params.id);
    editMembershipData.value = await ipc?.invoke(IPC_CHANNELS.MEMBERSHIP.GET_BY_ID, id)
  }
})

// Handle form submission
const handleFormSubmit = async (membershipData: MembershipPayload): Promise<void> => {
  loading.value = true;
  message.value = '';
  
  try {
    if (isEditMode.value) {
      await ipc?.invoke(IPC_CHANNELS.MEMBERSHIP.UPDATE, membershipData, {
        where: { id: route.params.id }
      });
    } else {
      await ipc?.invoke(IPC_CHANNELS.MEMBERSHIP.CREATE, membershipData);
    }
    
    message.value = t("memberships.membership_create_success");
    messageType.value = "success"

    setTimeout(() => {
      router.push(ROUTES.MEMBERSHIPS.LIST);
    }, 1500);
    
  } catch (e: unknown) {
    const error = e as IpcError;
    message.value = t("memberships.memberhip_create_error") + " " + error.message;
    messageType.value = "error"
  } finally {
    loading.value = false;
  }
};

const handleCancel = (): void => {
  router.push(ROUTES.MEMBERSHIPS.LIST);
};
</script>