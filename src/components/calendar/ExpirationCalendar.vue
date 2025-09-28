<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-semibold text-gray-800">📅 {{ $t("calendar.title") }}</h2>
      <div class="flex gap-2">
        <button 
          @click="previousMonth"
          class="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <i class="pi pi-chevron-left"></i>
        </button>
        <span class="px-4 py-2 text-gray-800 font-medium">{{ currentMonthYear }}</span>
        <button 
          @click="nextMonth"
          class="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <i class="pi pi-chevron-right"></i>
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
      <p class="text-gray-600 mt-2">{{ $t("calendar.loading") }}</p>
    </div>

    <!-- Calendar Grid -->
    <div v-else class="calendar-grid">
      <!-- Weekday Headers -->
      <div class="grid grid-cols-7 gap-1 mb-2">
        <div 
          v-for="day in weekDays" 
          :key="day"
          class="text-center text-sm font-medium text-gray-500 py-2"
        >
          {{ day }}
        </div>
      </div>

      <!-- Calendar Days -->
      <div class="grid grid-cols-7 gap-1">
        <div 
          v-for="day in calendarDays" 
          :key="day.date"
          class="relative min-h-[80px] p-2 border border-gray-200 rounded-lg transition-colors"
          :class="{
            'bg-gray-50 text-gray-400': !day.isCurrentMonth,
            'bg-white hover:bg-gray-50': day.isCurrentMonth,
            'bg-blue-50 border-blue-200': day.hasExpirations
          }"
        >
          <!-- Day Number -->
          <div class="text-sm font-medium mb-1">
            {{ day.dayNumber }}
          </div>

          <!-- Expiration Indicators -->
          <div v-if="day.expirations && day.expirations.length > 0" class="space-y-1">
            <div 
              v-for="expiration in day.expirations.slice(0, 3)" 
              :key="expiration.id"
              class="text-xs bg-red-100 text-red-800 px-2 py-1 rounded truncate cursor-pointer hover:bg-red-200 transition-colors"
              :title="expiration.member.firstName + ' ' + expiration.member.lastName"
              @click="showDayDetails(day)"
            >
              {{ expiration.member.firstName }} {{ expiration.member.lastName }}
            </div>
            <div 
              v-if="day.expirations.length > 3"
              class="text-xs text-gray-500 cursor-pointer hover:text-gray-700 transition-colors"
              @click="showDayDetails(day)"
            >
              +{{ day.expirations.length - 3 }} {{ $t("calendar.more") }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Legend -->
    <div class="mt-6 flex items-center justify-center space-x-4 text-sm">
      <div class="flex items-center">
        <div class="w-3 h-3 bg-red-100 border border-red-200 rounded mr-2"></div>
        <span class="text-gray-600">{{ $t("calendar.expires_today") }}</span>
      </div>
    </div>

    <!-- Day Details Modal -->
    <div 
      v-if="selectedDay" 
      class="fixed inset-0 flex items-center justify-center z-50"
      @click="closeDayDetails"
    >
      <div 
        class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[80vh] overflow-hidden"
        @click.stop
      >
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-800">
              {{ $t("calendar.expirations_on") }} {{ formatSelectedDate(selectedDay.date) }}
            </h3>
            <button 
              @click="closeDayDetails"
              class="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <i class="pi pi-times text-xl"></i>
            </button>
          </div>
        </div>
        
        <div class="px-6 py-4 max-h-96 overflow-y-auto">
          <div v-if="selectedDay.expirations.length === 0" class="text-center text-gray-500 py-8">
            {{ $t("calendar.no_expirations") }}
          </div>
          <div v-else class="space-y-3">
            <div 
              v-for="expiration in selectedDay.expirations" 
              :key="expiration.id"
              class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div class="flex-1">
                <div class="font-medium text-gray-800">
                  {{ expiration.member.firstName }} {{ expiration.member.lastName }}
                </div>
                <div class="text-sm text-gray-600">
                  {{ $t("calendar.membership_expires") }}
                </div>
              </div>
              <div class="text-sm text-red-600 font-medium">
                {{ formatDate(expiration.endDate) }}
              </div>
            </div>
          </div>
        </div>
        
        <div class="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div class="text-center text-sm text-gray-600">
            {{ selectedDay.expirations.length }} {{ $t("calendar.total_expirations") }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// Reactive state
const currentDate = ref(new Date())
const isLoading = ref(false)
const expirationsByDate = ref<Record<string, any[]>>({})
const selectedDay = ref<any>(null)

// Computed properties
const currentMonthYear = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  const monthNames = [
    t('calendar.months.january'),
    t('calendar.months.february'),
    t('calendar.months.march'),
    t('calendar.months.april'),
    t('calendar.months.may'),
    t('calendar.months.june'),
    t('calendar.months.july'),
    t('calendar.months.august'),
    t('calendar.months.september'),
    t('calendar.months.october'),
    t('calendar.months.november'),
    t('calendar.months.december')
  ]
  return `${monthNames[month]} ${year}`
})

const weekDays = computed(() => {
  return [
    t('calendar.weekdays.mon'),
    t('calendar.weekdays.tue'),
    t('calendar.weekdays.wed'),
    t('calendar.weekdays.thu'),
    t('calendar.weekdays.fri'),
    t('calendar.weekdays.sat'),
    t('calendar.weekdays.sun')
  ]
})

const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  
  // First day of the month
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  
  // Start from Monday (1) instead of Sunday (0)
  const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1
  const daysInMonth = lastDay.getDate()
  
  const days = []
  
  // Previous month days
  const prevMonth = new Date(year, month - 1, 0)
  for (let i = startDay - 1; i >= 0; i--) {
    const dayNumber = prevMonth.getDate() - i
    days.push({
      date: `${year}-${month}-${dayNumber}`,
      dayNumber,
      isCurrentMonth: false,
      hasExpirations: false,
      expirations: []
    })
  }
  
  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const expirations = expirationsByDate.value[dateStr] || []
    
    days.push({
      date: dateStr,
      dayNumber: day,
      isCurrentMonth: true,
      hasExpirations: expirations.length > 0,
      expirations
    })
  }
  
  // Next month days to fill the grid
  const remainingDays = 42 - days.length // 6 rows × 7 days
  for (let day = 1; day <= remainingDays; day++) {
    days.push({
      date: `${year}-${month + 2}-${day}`,
      dayNumber: day,
      isCurrentMonth: false,
      hasExpirations: false,
      expirations: []
    })
  }
  
  return days
})

// Methods
const previousMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
  loadExpirations()
}

const nextMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
  loadExpirations()
}

const loadExpirations = async () => {
  isLoading.value = true
  try {
    const year = currentDate.value.getFullYear()
    const month = currentDate.value.getMonth() + 1
    
    const result = await window.electron.memberMembership.getExpirationsByMonth(year, month)
    
    // Group expirations by date
    const grouped: Record<string, any[]> = {}
    result.forEach((expiration: any) => {
      const dateStr = expiration.endDate
      if (!grouped[dateStr]) {
        grouped[dateStr] = []
      }
      grouped[dateStr].push(expiration)
    })
    
    expirationsByDate.value = grouped
  } catch (error) {
    console.error('Error loading expirations:', error)
  } finally {
    isLoading.value = false
  }
}

// Modal methods
const showDayDetails = (day: any) => {
  selectedDay.value = day
}

const closeDayDetails = () => {
  selectedDay.value = null
}

const formatDate = (dateString: string) => {
  if (!dateString) {
    return 'N/A'
  }
  
  const date = new Date(dateString)
  if (isNaN(date.getTime())) {
    return 'N/A'
  }
  
  const year = date.getFullYear()
  const month = date.getMonth()
  const day = date.getDate()
  const monthNames = [
    t('calendar.months.january'),
    t('calendar.months.february'),
    t('calendar.months.march'),
    t('calendar.months.april'),
    t('calendar.months.may'),
    t('calendar.months.june'),
    t('calendar.months.july'),
    t('calendar.months.august'),
    t('calendar.months.september'),
    t('calendar.months.october'),
    t('calendar.months.november'),
    t('calendar.months.december')
  ]
  return `${day} ${monthNames[month].substring(0, 3)} ${year}`
}

const formatSelectedDate = (dateStr: string) => {
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = date.getMonth()
  const day = date.getDate()
  const monthNames = [
    t('calendar.months.january'),
    t('calendar.months.february'),
    t('calendar.months.march'),
    t('calendar.months.april'),
    t('calendar.months.may'),
    t('calendar.months.june'),
    t('calendar.months.july'),
    t('calendar.months.august'),
    t('calendar.months.september'),
    t('calendar.months.october'),
    t('calendar.months.november'),
    t('calendar.months.december')
  ]
  return `${day} ${monthNames[month]} ${year}`
}

// Initialize
onMounted(() => {
  loadExpirations()
})
</script>

<style scoped>
.calendar-grid {
  font-family: 'Inter', sans-serif;
}
</style>
