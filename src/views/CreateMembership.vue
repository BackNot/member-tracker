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
        {{ t("memberships.add_new_membership") }}
      </h1>
    </div>

    <CreateMembershipForm
      :loading="loading"
      :messageType="messageType"
      :message="message"
      @submit="handleFormSubmit"
      @cancel="handleCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ROUTES } from '../router/routerConst';
import { IPC_CHANNELS } from '../../electron/ipc/ipcConstant.js';
import Breadcrumbs from '@/components/shared/Breadcrumbs.vue';
import { useI18n } from 'vue-i18n';
import CreateMembershipForm from '@/components/members/CreateMembershipForm.vue';

const { t } = useI18n();

// Interface for the payload sent to backend
interface MembershipPayload {
  name: string;
  description: string;
  days: number;
}

// Interface for any IPC error
interface IpcError extends Error {
  code?: string;
  errno?: number;
}

const router = useRouter();

// UI state
const loading = ref<boolean>(false);
const message = ref<string>('');
const messageType = ref<string>('');

const breadcrumbItems = computed(() => [
  { text: t('memberships.memberships'), to: ROUTES.MEMBERSHIPS.LIST },
  { text: t('memberships.new_membership') }
]);

// Define a type for the Electron IPC renderer
interface IpcRenderer {
  invoke: (channel: string, ...args: any[]) => Promise<any>;
}

// Get the ipcRenderer if available
// @ts-ignore - Electron exposes this property in the preload script
const ipc: IpcRenderer | undefined = window.electron?.ipcRenderer;

// Handle form submission
const handleFormSubmit = async (membershipData: MembershipPayload): Promise<void> => {
  loading.value = true;
  message.value = '';
  
  try {
    // Send to Electron backend
    await ipc?.invoke(IPC_CHANNELS.MEMBERSHIP.CREATE, membershipData);
    
    // Show success message
    message.value = t("memberships.membership_create_success");
    messageType.value = "success"

    // Redirect after a short delay
    setTimeout(() => {
      router.push(ROUTES.MEMBERSHIPS.LIST);
    }, 1500);
    
  } catch (e: unknown) {
    // Type guard to handle error properly
    const error = e as IpcError;
    message.value = t("memberships.memberhip_create_error") + " " + error.message;
    messageType.value = "error"
  } finally {
    loading.value = false;
  }
};

// Handle form cancellation
const handleCancel = (): void => {
  router.push(ROUTES.MEMBERSHIPS.LIST);
};
</script>