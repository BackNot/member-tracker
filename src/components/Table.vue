<template>
  <div class="w-full overflow-hidden shadow-sm rounded-lg border border-gray-200">
    <!-- Table Header with optional filtering and actions -->
    <div class="bg-white border-b border-gray-200 px-6 py-4">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-medium text-gray-900">
          <slot name="header">{{ title }}</slot>
        </h3>
        <div class="flex items-center space-x-2">
          <!-- Search input -->
          <div v-if="searchable" class="relative">
            <input
              v-model="searchTerm"
              type="text"
              placeholder="Search..."
              class="pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              @input="handleSearch"
            />
            <div class="absolute left-3 top-2.5 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          
          <!-- Additional actions slot -->
          <slot name="actions"></slot>
        </div>
      </div>
    </div>
    
    <!-- Table content -->
    <div class="overflow-x-auto bg-white">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th 
              v-for="column in columns" 
              :key="column.key" 
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              :class="[column.class, column.sortable ? 'cursor-pointer select-none' : '']"
              @click="column.sortable ? sort(column.key) : null"
            >
              <div class="flex items-center space-x-1">
                <span>{{ column.label }}</span>
                <span v-if="column.sortable" class="inline-flex flex-col">
                  <svg 
                    :class="[
                      'w-3 h-3 transition-opacity', 
                      sortKey === column.key && sortOrder === 'asc' ? 'text-blue-600' : 'text-gray-400 opacity-70'
                    ]" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                  </svg>
                  <svg 
                    :class="[
                      'w-3 h-3 transition-opacity', 
                      sortKey === column.key && sortOrder === 'desc' ? 'text-blue-600' : 'text-gray-400 opacity-70'
                    ]" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </div>
            </th>
            <th v-if="$slots.actions" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        
        <tbody class="bg-white divide-y divide-gray-200">
          <template v-if="loadingData">
            <tr v-for="i in 3" :key="`skeleton-${i}`" class="animate-pulse">
              <td 
                v-for="column in columns" 
                :key="`skeleton-${i}-${column.key}`" 
                class="px-6 py-4 whitespace-nowrap"
              >
                <div class="h-4 bg-gray-200 rounded w-3/4"></div>
              </td>
              <td v-if="$slots.actions" class="px-6 py-4 whitespace-nowrap text-right">
                <div class="h-4 bg-gray-200 rounded w-16 ml-auto"></div>
              </td>
            </tr>
          </template>
          
          <template v-else-if="filteredData.length > 0">
            <tr 
              v-for="(item, index) in paginatedData" 
              :key="getItemKey(item, index)"
              class="hover:bg-gray-50 transition-colors"
            >
              <td 
                v-for="column in columns" 
                :key="`${getItemKey(item, index)}-${column.key}`"
                class="px-6 py-4 whitespace-nowrap"
                :class="column.class"
              >
                <slot :name="`cell:${column.key}`" :item="item" :value="getItemValue(item, column.key)">
                  <span :class="column.valueClass">{{ getItemValue(item, column.key) || '-' }}</span>
                </slot>
              </td>
              <td v-if="$slots.actions" class="px-6 py-4 whitespace-nowrap text-right">
                <slot name="actions" :item="item" :index="index"></slot>
              </td>
            </tr>
          </template>
          
          <tr v-else>
            <td :colspan="columns.length + ($slots.actions ? 1 : 0)" class="px-6 py-10 text-center text-gray-500">
              <div class="flex flex-col items-center justify-center">
                <svg class="w-12 h-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p class="font-medium">{{ emptyMessage }}</p>
                <p class="text-sm mt-1">{{ emptyDescription }}</p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- Pagination -->
    <div v-if="pagination && totalPages > 1" class="bg-white px-6 py-4 border-t border-gray-200">
      <div class="flex items-center justify-between">
        <div class="flex-1 flex justify-between sm:hidden">
          <button
            :disabled="currentPage === 1"
            @click="setPage(currentPage - 1)"
            class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            :disabled="currentPage === totalPages"
            @click="setPage(currentPage + 1)"
            class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
        <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-gray-700">
              Showing <span class="font-medium">{{ paginationStart }}</span> to <span class="font-medium">{{ paginationEnd }}</span> of <span class="font-medium">{{ filteredData.length }}</span> results
            </p>
          </div>
          <div>
            <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                @click="setPage(1)"
                :disabled="currentPage === 1"
                class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span class="sr-only">First</span>
                <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </button>
              <button
                @click="setPage(currentPage - 1)"
                :disabled="currentPage === 1"
                class="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span class="sr-only">Previous</span>
                <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </button>
              
              <template v-for="page in displayedPages" :key="page">
                <button
                  v-if="page !== '...'"
                  @click="setPage(Number(page))"
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
              
              <button
                @click="setPage(currentPage + 1)"
                :disabled="currentPage === totalPages"
                class="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span class="sr-only">Next</span>
                <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                </svg>
              </button>
              <button
                @click="setPage(totalPages)"
                :disabled="currentPage === totalPages"
                class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span class="sr-only">Last</span>
                <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watchEffect, watch } from 'vue';
import type { PropType } from 'vue';

// Define column interface
interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  class?: string;
  valueClass?: string;
}

// Props definition
const props = defineProps({
  // Table data and configuration
  data: {
    type: Array as PropType<Record<string, any>[]>,
    required: true
  },
  columns: {
    type: Array as PropType<TableColumn[]>,
    required: true
  },
  title: {
    type: String,
    default: 'Table'
  },
  keyField: {
    type: String,
    default: 'id'
  },
  
  // Loading state
  loadingData: {
    type: Boolean,
    default: false
  },
  
  // Sorting
  initialSortKey: {
    type: String,
    default: ''
  },
  initialSortOrder: {
    type: String as PropType<'asc' | 'desc'>,
    default: 'asc'
  },
  
  // Search
  searchable: {
    type: Boolean,
    default: false
  },
  searchKeys: {
    type: Array as PropType<string[]>,
    default: () => []
  },
  
  // Pagination
  pagination: {
    type: Boolean,
    default: true
  },
  itemsPerPage: {
    type: Number,
    default: 10
  },
  
  // Empty state
  emptyMessage: {
    type: String,
    default: 'No data available'
  },
  emptyDescription: {
    type: String,
    default: 'There are no items to display at this time.'
  }
});

// Emits
const emit = defineEmits(['sort', 'search', 'page-change']);

// Sorting state
const sortKey = ref(props.initialSortKey);
const sortOrder = ref<'asc' | 'desc'>(props.initialSortOrder as 'asc' | 'desc');

// Search state
const searchTerm = ref('');

// Pagination state
const currentPage = ref(1);

// Handle sorting
const sort = (key: string) => {
  if (sortKey.value === key) {
    // Toggle sort order if same key
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    // Set new sort key and default to ascending
    sortKey.value = key;
    sortOrder.value = 'asc';
  }
  
  emit('sort', { key: sortKey.value, order: sortOrder.value });
};

// Filter data based on search term
const filteredData = computed(() => {
  let result = [...props.data];
  
  // Apply search filter if needed
  if (props.searchable && searchTerm.value) {
    const searchString = searchTerm.value.toLowerCase();
    const keysToSearch = props.searchKeys.length > 0 
      ? props.searchKeys 
      : props.columns.map(col => col.key);
      
    result = result.filter(item => {
      return keysToSearch.some(key => {
        const value = getItemValue(item, key);
        return value && String(value).toLowerCase().includes(searchString);
      });
    });
  }
  
  // Apply sorting if needed
  if (sortKey.value) {
    result.sort((a, b) => {
      const aValue = getItemValue(a, sortKey.value);
      const bValue = getItemValue(b, sortKey.value);
      
      // Handle string comparison
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder.value === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      // Handle number comparison
      return sortOrder.value === 'asc'
        ? (aValue > bValue ? 1 : -1)
        : (aValue < bValue ? 1 : -1);
    });
  }
  
  return result;
});

// Handle search
const handleSearch = () => {
  currentPage.value = 1; // Reset to first page on search
  emit('search', searchTerm.value);
};

// Pagination logic
const totalPages = computed(() => {
  return Math.max(1, Math.ceil(filteredData.value.length / props.itemsPerPage));
});

const paginatedData = computed(() => {
  if (!props.pagination) return filteredData.value;
  
  const start = (currentPage.value - 1) * props.itemsPerPage;
  const end = start + props.itemsPerPage;
  return filteredData.value.slice(start, end);
});

const paginationStart = computed(() => {
  if (filteredData.value.length === 0) return 0;
  return ((currentPage.value - 1) * props.itemsPerPage) + 1;
});

const paginationEnd = computed(() => {
  return Math.min(currentPage.value * props.itemsPerPage, filteredData.value.length);
});

// Generate pagination range
const displayedPages = computed(() => {
  if (totalPages.value <= 7) {
    return Array.from({ length: totalPages.value }, (_, i) => i + 1);
  }
  
  const pages: (number | string)[] = [];
  
  // Always show first page
  pages.push(1);
  
  // If current page is close to the beginning
  if (currentPage.value <= 4) {
    pages.push(2, 3, 4, 5, '...', totalPages.value);
  } 
  // If current page is close to the end
  else if (currentPage.value >= totalPages.value - 3) {
    pages.push(
      '...', 
      totalPages.value - 4, 
      totalPages.value - 3, 
      totalPages.value - 2, 
      totalPages.value - 1, 
      totalPages.value
    );
  } 
  // If current page is in the middle
  else {
    pages.push(
      '...', 
      currentPage.value - 1, 
      currentPage.value, 
      currentPage.value + 1, 
      '...', 
      totalPages.value
    );
  }
  
  return pages;
});

// Set page
const setPage = (page: number) => {
  const pageNumber = typeof page === 'string' ? parseInt(page, 10) : page;
  if (pageNumber >= 1 && pageNumber <= totalPages.value) {
    currentPage.value = pageNumber;
    emit('page-change', pageNumber);
  }
};

// Reset pagination when data changes
watch(() => props.data, () => {
  if (currentPage.value > totalPages.value) {
    currentPage.value = 1;
  }
}, { deep: true });

// Utility function to access nested properties (e.g. "user.name")
const getItemValue = (item: any, key: string) => {
  if (!item || !key) return null;
  if (!key.includes('.')) return item[key];
  
  return key.split('.').reduce((obj, k) => {
    return obj && obj[k] !== undefined ? obj[k] : null;
  }, item);
};

// Get unique key for items
const getItemKey = (item: any, index: number) => {
  return (item && item[props.keyField]) ? item[props.keyField] : `item-${index}`;
};
</script> 