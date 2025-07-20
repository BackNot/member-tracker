<template>
  <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
    <!-- Search Box -->
    <div class="relative w-full md:w-64">
      <input
        :value="searchTerm"
        @input="$emit('update:searchTerm', $event.target.value)"
        type="text"
        :placeholder="$t('members.search')"
        class="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:border-gray-500 transition-colors duration-200"
      />
      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <i class="pi pi-search text-gray-400"></i>
      </div>
      <button 
        v-if="searchTerm" 
        @click="$emit('update:searchTerm', '')" 
        class="absolute inset-y-0 right-0 pr-3 flex items-center"
      >
        <i class="pi pi-times text-gray-400 hover:text-gray-600"></i>
      </button>
    </div>

    <div class="flex items-center gap-4">   
      <div class="flex space-x-2">
        <router-link
          :to="ROUTES.MEMBERS.CREATE"
          class="px-3 py-1 bg-green-500 text-white rounded disabled:opacity-50 flex items-center cursor-pointer"
        >
          <i class="pi pi-plus mr-1"></i>
          {{ t('members.add_member') }}
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ROUTES } from '../../router/routerConst'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

defineProps<{
  searchTerm: string;
}>()

defineEmits<{
  'update:searchTerm': [value: string];
}>()
</script>