<template>
  <div v-if="totalPages > 1" class="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200">
    <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
      <div>
        <p class="text-sm text-gray-700">
          {{ t("pagination.showing") }} <span class="font-medium">{{ paginationStart }}</span> {{ t("pagination.to") }} 
          <span class="font-medium">{{ paginationEnd }}</span> {{ t("pagination.of") }} 
          <span class="font-medium">{{ totalItems }}</span> {{ t("pagination.results") }}
        </p>
      </div>
      <div>
        <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
          <!-- First page button -->
          <button
            @click="$emit('update:currentPage', 1)"
            :disabled="currentPage === 1"
            class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span class="sr-only">{{ t("pagination.first") }}</span>
            <i class="pi pi-angle-double-left"></i>
          </button>
          
          <!-- Previous page button -->
          <button
            @click="$emit('update:currentPage', currentPage - 1)"
            :disabled="currentPage === 1"
            class="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span class="sr-only">{{ t("pagination.previous") }}</span>
            <i class="pi pi-angle-left"></i>
          </button>
          
          <!-- Page numbers -->
          <template v-for="page in displayedPages" :key="page">
            <button
              v-if="page !== '...'"
              @click="$emit('update:currentPage', Number(page))"
              :class="[
                currentPage === page ? 'z-10 bg-blue-50 border-blue-500 text-blue-600' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50',
                'relative inline-flex items-center px-4 py-2 border text-sm font-medium'
              ]"
            >
              {{ page }}
            </button>
            <span
              v-else
              class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
            >
              ...
            </span>
          </template>
          
          <!-- Next page button -->
          <button
            @click="$emit('update:currentPage', currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span class="sr-only">{{ t("pagination.next") }}</span>
            <i class="pi pi-angle-right"></i>
          </button>
          
          <!-- Last page button -->
          <button
            @click="$emit('update:currentPage', totalPages)"
            :disabled="currentPage === totalPages"
            class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span class="sr-only">{{ t("pagination.last") }}</span>
            <i class="pi pi-angle-double-right"></i>
          </button>
        </nav>
      </div>
    </div>
    
    <!-- Mobile pagination -->
    <div class="flex-1 flex justify-between sm:hidden">
      <button
        @click="$emit('update:currentPage', currentPage - 1)"
        :disabled="currentPage === 1"
        class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <i class="pi pi-angle-left mr-1"></i> {{ t("pagination.previous") }}
      </button>
      <span class="text-sm text-gray-700 px-4 py-2">
        {{ t("pagination.page") }} {{ currentPage }} {{ t("pagination.of") }} {{ totalPages }}
      </span>
      <button
        @click="$emit('update:currentPage', currentPage + 1)"
        :disabled="currentPage === totalPages"
        class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ t("pagination.next") }} <i class="pi pi-angle-right ml-1"></i>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const props = defineProps<{
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}>()

defineEmits<{
  'update:currentPage': [page: number];
}>()

const paginationStart = computed(() => {
  if (props.totalItems === 0) return 0;
  return ((props.currentPage - 1) * props.itemsPerPage) + 1;
});

const paginationEnd = computed(() => {
  return Math.min(props.currentPage * props.itemsPerPage, props.totalItems);
});

const displayedPages = computed(() => {
  if (props.totalPages <= 7) {
    return Array.from({ length: props.totalPages }, (_, i) => i + 1);
  }
  
  const pages: (number | string)[] = [];
  
  // Always show first page
  pages.push(1);
  
  // If current page is close to the beginning
  if (props.currentPage <= 4) {
    pages.push(2, 3, 4, 5, '...', props.totalPages);
  } 
  // If current page is close to the end
  else if (props.currentPage >= props.totalPages - 3) {
    pages.push(
      '...', 
      props.totalPages - 4, 
      props.totalPages - 3, 
      props.totalPages - 2, 
      props.totalPages - 1, 
      props.totalPages
    );
  } 
  // If current page is in the middle
  else {
    pages.push(
      '...', 
      props.currentPage - 1, 
      props.currentPage, 
      props.currentPage + 1, 
      '...', 
      props.totalPages
    );
  }
  
  return pages;
});
</script>