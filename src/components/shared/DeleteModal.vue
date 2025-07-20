<template>
    <dialog 
        ref="modal" 
        id="modal" 
        class="backdrop:bg-gray-900 backdrop:bg-opacity-50 bg-white rounded-xl shadow-2xl border-0 p-0 max-w-md w-full mx-auto"
    >
        <button 
            @click="closeModal" 
            id="closeModal" 
            class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
        </button>

        <div class="p-6 relative">
            <div :class="iconClasses">
                <svg v-if="props.iconType === 'warning'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" :class="iconColor">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                
                <svg v-else-if="props.iconType === 'danger'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" :class="iconColor">
                    <path d="M3 6h18"/>
                    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                    <line x1="10" y1="11" x2="10" y2="17"/>
                    <line x1="14" y1="11" x2="14" y2="17"/>
                </svg>
                
                <svg v-else-if="props.iconType === 'info'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" :class="iconColor">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 16v-4"/>
                    <path d="M12 8h.01"/>
                </svg>
                
                <svg v-else-if="props.iconType === 'success'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" :class="iconColor">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <path d="M9 11l3 3L22 4"/>
                </svg>
            </div>

            <h3 class="text-lg font-semibold text-gray-900 text-center mb-2">
                {{ props.title }}
            </h3>

            <p class="text-gray-600 text-center mb-6">
                {{ props.description }}
            </p>

            <!-- Buttons -->
            <div class="flex gap-3">
                <button 
                    @click="closeModal"
                    id="cancelBtn"
                    class="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                    {{ props.cancelText }}
                </button>
                <button 
                    @click="handleConfirm"
                    id="confirmBtn"
                    :class="confirmButtonClasses"
                >
                    {{ props.confirmText }}
                </button>
            </div>
        </div>
    </dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// Define the item interface (adjust based on your actual Member type)
interface Item {
  id: number | string
  name?: string
  email?: string
  [key: string]: any  // Allow additional properties
}

// Props with TypeScript
const props = withDefaults(defineProps<{
  item?: any | null
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  iconType?: 'warning' | 'danger' | 'info' | 'success'
  confirmVariant?: 'danger' | 'primary' | 'success'
}>(), {
  title: 'Confirm Action',
  description: 'Are you sure you want to perform this action? This action cannot be undone.',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  iconType: 'warning',
  confirmVariant: 'danger'
})

// Emits with TypeScript
const emit = defineEmits<{
  close: []
  confirmed: [item?: any]
}>()

// Template ref with proper typing
const modal = ref<HTMLDialogElement | null>(null)

// Computed properties for styling
const iconClasses = computed(() => {
  const baseClasses = "flex items-center justify-center w-12 h-12 mx-auto rounded-full mb-4"
  const variants = {
    warning: "bg-yellow-100",
    danger: "bg-red-100", 
    info: "bg-blue-100",
    success: "bg-green-100"
  }
  return `${baseClasses} ${variants[props.iconType]}`
})

const iconColor = computed(() => {
  const colors = {
    warning: "text-yellow-600",
    danger: "text-red-600",
    info: "text-blue-600", 
    success: "text-green-600"
  }
  return colors[props.iconType]
})

const confirmButtonClasses = computed(() => {
  const baseClasses = "flex-1 px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
  const variants = {
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500"
  }
  return `${baseClasses} ${variants[props.confirmVariant]}`
})

// Methods
const openModal = (): void => {
  modal.value?.showModal()
}

const closeModal = (): void => {
  modal.value?.close()
  emit('close')
}

const handleConfirm = (): void => {
  emit('confirmed', props.item)
  closeModal()
}

// Expose methods to parent component
defineExpose({
  openModal,
  closeModal
})
</script>

<style scoped>
dialog {
  margin: auto;
}

dialog::backdrop {
  background-color: rgba(0, 0, 0, 0.5);
}

dialog[open] {
  animation: show 0.2s ease-out;
}

@keyframes show {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>