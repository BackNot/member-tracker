<template>
  <aside class="w-60 bg-gradient-to-br from-slate-50 to-gray-100 border-r border-slate-200 h-100vh overflow-y-auto">
    <div class="h-full flex flex-col py-6">
      <!-- Navigation -->
      <div class="px-8 mb-1">
        <h3 class="text-xs uppercase tracking-wide text-slate-500 font-medium">Main</h3>
      </div>
      <nav class="px-8 mb-4">
        <ul class="space-y-1">
          <li v-for="(item, index) in mainMenuItems" :key="index">
            <router-link 
              :to="item.path" 
              class="flex items-center px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-800 hover:bg-slate-200/50 transition-all duration-200"
              :class="{ 'text-slate-800 bg-slate-200 font-medium': isActive(item.path) }"
            >
              <i :class="`pi ${item.icon} text-lg mr-3`"></i>
              <span class="font-light" :class="{ 'font-medium': isActive(item.path) }">{{ item.name }}</span>
            </router-link>
          </li>
        </ul>
      </nav>
      
      <!-- Management Section -->
      <div class="px-8 mb-1 mt-3">
        <h3 class="text-xs uppercase tracking-wide text-slate-500 font-medium">Management</h3>
      </div>
      <nav class="px-8 mb-4">
        <ul class="space-y-1">
          <li v-for="(item, index) in managementItems" :key="index">
            <router-link 
              :to="item.path" 
              class="flex items-center px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-800 hover:bg-slate-200/50 transition-all duration-200"
              :class="{ 'text-slate-800 bg-slate-200 font-medium': isActive(item.path) }"
            >
              <i :class="`pi ${item.icon} text-lg mr-3`"></i>
              <span class="font-light" :class="{ 'font-medium': isActive(item.path) }">{{ item.name }}</span>
            </router-link>
          </li>
        </ul>
      </nav>

      <!-- Favorites Section with cards -->
      <div class="px-8 mb-2 mt-3">
        <h3 class="text-xs uppercase tracking-wide text-slate-500 font-medium">Favorites</h3>
      </div>
      <div class="px-8">
        <div class="bg-slate-100 rounded-lg p-2 mb-2 border border-slate-200">
          <div class="flex items-center">
            <span class="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-slate-700">
              <i class="pi pi-users text-xs"></i>
            </span>
            <div class="ml-2">
              <p class="text-sm text-slate-800 font-medium">New Members</p>
              <p class="text-xs text-slate-600">12 new this week</p>
            </div>
          </div>
        </div>
        <div class="bg-slate-100 rounded-lg p-2 mb-3 border border-slate-200">
          <div class="flex items-center">
            <span class="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-slate-700">
              <i class="pi pi-calendar text-xs"></i>
            </span>
            <div class="ml-2">
              <p class="text-sm text-slate-800 font-medium">Events</p>
              <p class="text-xs text-slate-600">2 upcoming</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Divider -->
      <div class="w-12 h-px bg-slate-200 mx-8 mt-2 mb-4"></div>
      
      <!-- System Section -->
      <div class="px-8 mb-1">
        <h3 class="text-xs uppercase tracking-wide text-slate-500 font-medium">System</h3>
      </div>
      <nav class="px-8 mb-4">
        <ul class="space-y-1">
          <li v-for="(item, index) in systemItems" :key="index">
            <router-link 
              :to="item.path" 
              class="flex items-center px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-800 hover:bg-slate-200/50 transition-all duration-200"
              :class="{ 'text-slate-800 bg-slate-200 font-medium': isActive(item.path) }"
            >
              <i :class="`pi ${item.icon} text-lg mr-3`"></i>
              <span class="font-light" :class="{ 'font-medium': isActive(item.path) }">{{ item.name }}</span>
            </router-link>
          </li>
        </ul>
      </nav>
      
      <!-- Bottom section -->
      <div class="mt-auto px-8 pt-4 border-t border-slate-200 bg-slate-100/70">
        <div class="flex items-center mb-3">
          <span class="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-700">
            <span class="text-sm font-medium">A</span>
          </span>
          <div class="ml-3">
            <p class="text-sm text-slate-800 font-medium">Admin User</p>
            <p class="text-xs text-slate-500 font-light">Administrator</p>
          </div>
        </div>
        
        <a href="#" class="flex items-center text-slate-600 hover:text-slate-800 px-3 py-1.5 rounded-lg hover:bg-slate-200/50 transition-all duration-200">
          <i class="pi pi-sign-out text-sm mr-3"></i>
          <span class="text-sm font-light">Sign out</span>
        </a>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const mainMenuItems = ref([
  {
    name: 'Dashboard',
    path: '/',
    icon: 'pi-home'
  },
  {
    name: 'Members',
    path: '/members',
    icon: 'pi-users'
  },
  {
    name: 'Statistics',
    path: '/statistics',
    icon: 'pi-chart-bar'
  }
])

const managementItems = ref([
  {
    name: 'Teams',
    path: '/teams',
    icon: 'pi-users'
  },
  {
    name: 'Projects',
    path: '/projects',
    icon: 'pi-folder'
  },
  {
    name: 'Calendar',
    path: '/calendar',
    icon: 'pi-calendar'
  }
])

const systemItems = ref([
  {
    name: 'Settings',
    path: '/settings',
    icon: 'pi-cog'
  },
  {
    name: 'Database Demo',
    path: '/database-demo',
    icon: 'pi-database'
  },
  {
    name: 'Help',
    path: '/help',
    icon: 'pi-question-circle'
  }
])

const isActive = (path: string): boolean => {
  return route.path === path
}
</script> 