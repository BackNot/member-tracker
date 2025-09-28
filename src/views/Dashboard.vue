<template>
  <div class="max-w-4xl mx-auto mt-10 p-6 space-y-6">
    <!-- Welcome Section -->
    <div class="bg-gray-100 rounded-lg shadow-md p-6 text-gray-800 text-center">
      <h1 class="text-xl font-semibold mb-3">{{ $t("dashboard.dont_forget") }} </h1>
      <p class="text-base">
        {{ $t("dashboard.hello") }} 
        <span class="font-medium text-gray-700">{{ formattedDate }}</span>
      </p>
    </div>

    <!-- Backup Section -->
    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-lg font-semibold mb-4 text-gray-800">🔒 {{ $t("dashboard.cloud_backups") }} </h2>
      
      <!-- Not Connected State -->
      <div v-if="!isConnected" class="text-center">
        <p class="text-gray-600 mb-4">
          {{ $t("dashboard.connect_drive") }}
        </p>
        <button 
          @click="connectToGoogleDrive"
          :disabled="isLoading"
          class="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-6 py-2 rounded-lg transition-colors"
        >
          {{ isLoading ? $t("dashboard.connecting")  : '🔗' + $t("dashboard.connect_google_drive") }}
        </button>
        
        <!-- Authentication Status -->
        <div v-if="authInProgress" class="mt-4 p-4 bg-blue-50 rounded-lg">
          <div class="flex items-center justify-center space-x-2">
            <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
            <span class="text-blue-700">{{ $t("dashboard.wait_browser")}}</span>
          </div>
          <p class="text-sm text-blue-600 mt-2">
            {{ $t("dashboard.go_into_account") }}
          </p>
        </div>
      </div>

      <!-- Connected State -->
      <div v-else class="space-y-4">
        <!-- Action Buttons -->
        <div class="flex flex-wrap gap-3">
          <button 
            @click="createBackup"
            :disabled="isLoading"
            class="bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white px-4 py-2 rounded-lg transition-colors"
          >
            {{ isLoading ? $t("dashboard.creating") : '💾' + $t("dashboard.create_backup")}}
          </button>
          
          <button 
            @click="loadBackups"
            :disabled="isLoading"
            class="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg transition-colors"
          >
            {{ isLoading ? $t("dashboard.loading") : '📋' + $t("dashboard.show_backup") }}
          </button>
          
          <button 
            @click="disconnect"
            class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            🔌 {{ $t("dashboard.terminate_connection") }}
          </button>
        </div>

        <!-- Success/Error Messages -->
        <div v-if="message" :class="messageClass" class="p-3 rounded-lg">
          {{ message }}
        </div>

        <!-- Backups List -->
        <div v-if="backups.length > 0" class="border-t pt-4">
          <h3 class="font-medium text-gray-800 mb-3">{{$t("dashboard.available_backups")}}:</h3>
          <div class="space-y-2">
            <div 
              v-for="backup in backups" 
              :key="backup.id"
              class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div class="flex-1">
                <div class="font-medium text-gray-800">{{ backup.name }}</div>
                <div class="text-sm text-gray-600">{{ backup.createdTime }} • {{ backup.size }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Notifications Section -->
    <NotificationList ref="notificationListRef" />

    <!-- Calendar Section -->
    <ExpirationCalendar />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import NotificationList from '../components/notifications/NotificationList.vue'
import ExpirationCalendar from '../components/calendar/ExpirationCalendar.vue'

const { t } = useI18n();

const formattedDate = ref('')
const isConnected = ref(false)
const isLoading = ref(false)
const authInProgress = ref(false)
const message = ref('')
const messageType = ref<'success' | 'error'>('success')
const backups = ref<any[]>([])
const notificationListRef = ref<InstanceType<typeof NotificationList>>()

// Computed property for message styling
const messageClass = computed(() => ({
  'bg-green-100 text-green-800': messageType.value === 'success',
  'bg-red-100 text-red-800': messageType.value === 'error'
}))

onMounted(async () => {
  const now = new Date()
  formattedDate.value = now.toLocaleDateString('bg-BG')
  
  // Check if already connected to Google Drive
  await checkAuthStatus()
})

async function checkAuthStatus() {
  try {
    const result = await window.electron.backup.checkAuth()
    isConnected.value = result
    if (result) {
      await loadBackups()
    }
  } catch (error) {
    console.error('Error checking auth status:', error)
  }
}

async function connectToGoogleDrive() {
  isLoading.value = true
  authInProgress.value = true
  
  try {
    const result = await window.electron.backup.authenticate()
    
    if (result.success) {
      // Authentication successful
      isConnected.value = true
      authInProgress.value = false
      showMessage(t("dashboard.connect_success"), 'success')
      await loadBackups()
    } else {
      authInProgress.value = false
      showMessage(t("dashboard.connect_error") + ":" + result.error, 'error')
    }
  } catch (error) {
    authInProgress.value = false
    showMessage(t("dashboard.connect_error"), 'error')
    console.error('Connect error:', error)
  } finally {
    isLoading.value = false
  }
}

async function createBackup() {
  isLoading.value = true
  try {
    const result = await window.electron.backup.create()
    if (result.success) {
      showMessage(t("dashboard.backup_success") + ":" + result.fileName, 'success')
      await loadBackups()
    } else {
      showMessage(t("dashboard.backup_error") + ":" + result.fileName, 'success')
    }
  } catch (error) {
      showMessage(t("dashboard.backup_error"), 'success')
    console.error('Create backup error:', error)
  } finally {
    isLoading.value = false
  }
}

async function loadBackups() {
  isLoading.value = true
  try {
    const result = await window.electron.backup.list()
    if (result.success) {
      backups.value = result.backups || []
      if (result.backups?.length === 0) {
        showMessage(t("dashboard.no_backup"), 'success')
      }
    } else {
      showMessage(t("dashboard.backup_load_error") + ":" + result.error, 'error')
    }
  } catch (error) {
    showMessage(t("dashboard.backup_load_error"), 'error')
    console.error('Load backups error:', error)
  } finally {
    isLoading.value = false
  }
}

async function disconnect() {
  if (!confirm(t("dashboard.stop_confirm"))) {
    return
  }
  
  try {
    const result = await window.electron.backup.disconnect()
    if (result.success) {
      isConnected.value = false
      backups.value = []
      authInProgress.value = false
      showMessage(t("dashboard.connection_stopped"), 'success')
    } else {
      showMessage(t("dashboard.connection_error_stopped") + ":" + result.error, 'error')
    }
  } catch (error) {
    showMessage(t("dashboard.connection_error_stopped"), 'error')
    console.error('Disconnect error:', error)
  }
}

function showMessage(text: string, type: 'success' | 'error') {
  message.value = text
  messageType.value = type
  setTimeout(() => {
    message.value = ''
  }, 5000)
}
</script>