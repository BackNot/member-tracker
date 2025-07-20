<template>
  <nav class="mb-4">
    <ol class="flex text-sm items-center text-gray-500">
      <template v-for="(crumb, index) in items" :key="index">
        <li>
          <router-link 
            v-if="crumb.to" 
            :to="crumb.to" 
            class="hover:text-blue-600"
          >
            {{ crumb.text }}
          </router-link>
          <span v-else class="text-gray-700 font-medium">
            {{ crumb.text }}
          </span>
        </li>
        <li v-if="index < items.length - 1" class="mx-2">
          <i class="pi pi-angle-right text-xs"></i>
        </li>
      </template>
    </ol>
  </nav>
</template>
<script setup lang="ts">

interface BreadcrumbItem {
  text: string
  to?: string
}

defineProps<{
  items: BreadcrumbItem[]
}>()
</script>