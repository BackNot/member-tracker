<template>
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
            </button>

            <button
              @click="confirmDelete(member)"
              class="px-2 py-1 bg-red-100 text-red-800 rounded text-xs hover:bg-red-200 flex items-center ml-2 inline-block"
            >
              <i class="pi pi-trash mr-1"></i> {{ t("members.delete") }}
            </button> -->
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
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n'
import { IPC_CHANNELS } from '@/../electron/ipc/ipcConstant.js';
import { formatDate } from '@/utils/date';
import type { MemberMembership } from '@/types/memberships';
import type { IpcRenderer } from '@/types/ipc.js';

const props = defineProps<{
  memberId: number|undefined|null;
}>()

// @ts-ignore - Electron exposes this property in the preload script
const ipc: IpcRenderer | undefined = window.electron?.ipcRenderer;

const { t } = useI18n()
const memberMemberships = ref<MemberMembership[]>([]);

onMounted(async () => {
    memberMemberships.value = await ipc?.invoke(IPC_CHANNELS.MEMBER_MEMBERSHIP.FIND_ALL, {
    where: {
    memberId: props.memberId
  }});
})

</script>
