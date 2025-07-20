<template>
  <div class="mx-auto py-6 px-4 sm:px-0">
    <div class="flex items-center justify-between mb-6">
      <router-link 
        :to="ROUTES.MEMBERS.LIST" 
        class="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors flex items-center"
      >
        <i class="pi pi-arrow-left mr-2"></i> {{ t("members.back_to_members_list") }}
      </router-link>
    </div>  
    
    <Breadcrumbs :items="breadcrumbItems" />

    <!-- Page title with stronger visual hierarchy -->
    <div class="flex items-center justify-between mb-6 pb-3 border-b border-gray-200">
      <h1 class="text-2xl font-bold text-gray-900">
        <i class="pi pi-user-plus mr-2 text-blue-600"></i>
        {{ t("members.add_new_member") }}
      </h1>
    </div>

    <!-- Use the standalone form component -->
    <MemberForm
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
import MemberForm from '@/components/members/CreateMemberForm.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

// Interface for the payload sent to backend
interface MemberPayload {
  firstName: string;
  lastName: string;
  nickname?: string;
  description?: string;
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
  { text: t('members.members'), to: ROUTES.MEMBERS.LIST },
  { text: t('members.new_member') }
]);

// Define a type for the Electron IPC renderer
interface IpcRenderer {
  invoke: (channel: string, ...args: any[]) => Promise<any>;
}

// Get the ipcRenderer if available
// @ts-ignore - Electron exposes this property in the preload script
const ipc: IpcRenderer | undefined = window.electron?.ipcRenderer;

// Handle form submission
const handleFormSubmit = async (memberData: MemberPayload): Promise<void> => {
  loading.value = true;
  message.value = '';
  
  try {
    // Send to Electron backend
    await ipc?.invoke(IPC_CHANNELS.MEMBER.CREATE, memberData);
    
    // Show success message
    message.value = t("members.member_create_success");
    messageType.value = "success"

    // Redirect after a short delay
    setTimeout(() => {
      router.push(ROUTES.MEMBERS.LIST);
    }, 1500);
    
  } catch (e: unknown) {
    // Type guard to handle error properly
    const error = e as IpcError;
    message.value = t("members.member_create_error") + " " + error.message;
    messageType.value = "error"
  } finally {
    loading.value = false;
  }
};

// Handle form cancellation
const handleCancel = (): void => {
  router.push(ROUTES.MEMBERS.LIST);
};
</script>