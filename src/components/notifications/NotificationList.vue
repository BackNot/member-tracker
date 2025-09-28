<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold text-gray-800">🔔 {{ $t("notifications.title") }}</h2>
      <div class="flex gap-2">
        <button 
          @click="loadNotifications"
          :disabled="isLoading"
          class="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-3 py-1 rounded text-sm transition-colors"
        >
          {{ isLoading ? $t("notifications.refreshing") : '🔄 ' + $t("notifications.refresh") }}
        </button>
        <span v-if="unreadCount > 0" class="bg-red-500 text-white px-2 py-1 rounded-full text-xs">
          {{ unreadCount }} {{ $t("notifications.unread") }}
        </span>
        <button
          v-if="unreadCount > 0"
          @click="markAllAsRead"
          :disabled="isLoading"
          class="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-3 py-1 rounded text-sm transition-colors"
        >
          {{ $t("notifications.mark_all_read") }}
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading && notifications.length === 0" class="text-center py-4">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
      <p class="text-gray-600 mt-2">{{ $t("notifications.loading") }}</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="unreadNotifications.length === 0" class="text-center py-8 text-gray-500">
      <div class="text-4xl mb-2">📭</div>
      <p>{{ $t("notifications.no_notifications") }}</p>
    </div>

    <!-- Notifications List -->
    <div v-else class="space-y-3">
      <div
        v-for="notification in unreadNotifications"
        :key="notification.id"
        class="p-4 rounded-lg border transition-all duration-200 bg-blue-50 border-blue-200 shadow-sm"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-2 h-2 rounded-full bg-red-500"></div>
              <span class="text-sm text-gray-500">
                {{ $t("notifications.expired_on") }}: {{ formatDate(notification.memberMembership?.endDate) }}
              </span>
            </div>
            <p 
              @click="onNotificationClick(notification)"
              class="text-gray-800 font-semibold cursor-pointer hover:text-blue-600 transition-colors"
            >
              {{ notification.message }}
            </p>
          </div>
          <button
            @click="markAsRead(notification.id)"
            :disabled="isLoading"
            class="bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white px-3 py-1 rounded text-sm transition-colors ml-4"
          >
            {{ $t("notifications.mark_read") }}
          </button>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="error" class="mt-4 p-3 bg-red-100 text-red-800 rounded-lg">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ROUTES, ROUTE_NAMES } from '@/router/routerConst'
import { IPC_CHANNELS } from '@/../electron/ipc/ipcConstant.js';
import { useRouter } from 'vue-router'

const { t } = useI18n()
const router = useRouter()

// Reactive state
const notifications = ref<any[]>([])
const isLoading = ref(false)
const error = ref('')

// Computed properties
const unreadCount = computed(() => 
  notifications.value.filter(n => !n.isRead).length
)

const unreadNotifications = computed(() =>
  notifications.value.filter(n => !n.isRead)
)

// Format date helper
const formatDate = (dateString: string) => {
  if (!dateString) {
    return 'N/A'
  }
  
  const date = new Date(dateString)
  if (isNaN(date.getTime())) {
    return 'N/A'
  }
  
  return date.toLocaleDateString('bg-BG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// @ts-ignore - Electron exposes this property in the preload script
const ipc = window.electron.ipcRenderer;

// Handle notification message click
const onNotificationClick = async (notification: any) => {
    const result = await ipc.invoke(IPC_CHANNELS.MEMBER_MEMBERSHIP.FIND_ONE, notification.memberMembershipId);
    await router.push({ 
        name: ROUTE_NAMES.MEMBERS.CREATE,
        params: { 
          id: result.member.id.toString() 
        }
      })
}

// Load notifications
const loadNotifications = async () => {
  isLoading.value = true
  error.value = ''
  
  try {
    const result = await window.electron.notification.getAll()
    notifications.value = result || []
  } catch (err: any) {
    error.value = t('notifications.load_error')
    console.error('Error loading notifications:', err)
  } finally {
    isLoading.value = false
  }
}

// Mark single notification as read
const markAsRead = async (notificationId: number) => {
  try {
    await window.electron.notification.markAsRead(notificationId)
    
    // Remove from local state (since we only show unread notifications)
    notifications.value = notifications.value.filter(n => n.id !== notificationId)
  } catch (err: any) {
    error.value = t('notifications.mark_read_error')
    console.error('Error marking notification as read:', err)
  }
}

// Mark all notifications as read
const markAllAsRead = async () => {
  try {
    await window.electron.notification.markAllAsRead()
    
    // Clear local state (since we only show unread notifications)
    notifications.value = []
  } catch (err: any) {
    error.value = t('notifications.mark_all_read_error')
    console.error('Error marking all notifications as read:', err)
  }
}

// Initialize component
onMounted(() => {
  loadNotifications()
})

// Expose refresh method for parent component
defineExpose({
  refresh: loadNotifications
})
</script>