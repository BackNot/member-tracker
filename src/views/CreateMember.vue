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
        {{ isEditMode ? t("members.edit_old_member") : t("members.add_new_member") }}
      </h1>
    </div>

    <!-- Use the standalone form component -->
    <CreateMemberForm
      :loading="loading"
      :messageType="messageType"
      :message="message"
      :initialData="editMemberData"
      @submit="handleFormSubmit"
      @cancel="handleCancel"
    />
  </div>
    
  
<MemberMembershipTable 
  :memberId="editMemberData?.id" 
  v-if="isEditMode && editMemberData?.id" 
/>

</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ROUTES } from '../router/routerConst';
import { IPC_CHANNELS } from '../../electron/ipc/ipcConstant.js';
import Breadcrumbs from '@/components/shared/Breadcrumbs.vue';
import MemberMembershipTable from '@/components/members/MemberMembershipTable.vue';
import CreateMemberForm from '@/components/members/CreateMemberForm.vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router'
import type { MemberPayload, MemberForm } from '@/types/members';
import type { AlertType } from '@/types/alerts.js';
import type { IpcRenderer, IpcError } from '@/types/ipc.js';

const { t } = useI18n();

const router = useRouter();
const route = useRoute()

const loading = ref<boolean>(false);
const message = ref<string>('');
const messageType = ref<AlertType>('success');
const editMemberData = ref<MemberForm|null>(null);


const isEditMode = computed(() => {
  const id = Number(route.params.id);
  return !isNaN(id) && id > 0;
});

const breadcrumbItems = computed(() => [
  { text: t('members.members'), to: ROUTES.MEMBERS.LIST },
  { text: isEditMode.value ? t('members.edit_member') : t('members.new_member') }
]);

// Get the ipcRenderer if available
// @ts-ignore - Electron exposes this property in the preload script
const ipc: IpcRenderer | undefined = window.electron?.ipcRenderer;

const handleFormSubmit = async (memberData: MemberPayload): Promise<void> => {
  loading.value = true;
  message.value = '';
  
  try {
    if (isEditMode.value) {
      await ipc?.invoke(IPC_CHANNELS.MEMBER.UPDATE, memberData, {
        where: { id: route.params.id }
      });
    } else {
      await ipc?.invoke(IPC_CHANNELS.MEMBER.CREATE, memberData);
    }
    message.value = t("members.member_create_success");
    messageType.value = "success"

    setTimeout(() => {
      router.push(ROUTES.MEMBERS.LIST);
    }, 1500);
    
  } catch (e: unknown) {
    const error = e as IpcError;
    message.value = t("members.member_create_error") + " " + error.message;
    messageType.value = "error"
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  if (isEditMode.value) {
    const id = route.params.id
    editMemberData.value = await ipc?.invoke(IPC_CHANNELS.MEMBER.GET_BY_ID, id)
  }
})

const handleCancel = (): void => {
  router.push(ROUTES.MEMBERS.LIST);
};
</script>