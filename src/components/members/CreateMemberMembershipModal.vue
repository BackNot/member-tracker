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
            <div class="flex items-center justify-center w-12 h-12 mx-auto rounded-full mb-4 bg-green-100">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-green-600">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <path d="M9 11l3 3L22 4"/>
                </svg>
            </div>

            <!-- FORM -->
            <form @submit.prevent="handleConfirm" class="space-y-4 mb-6">
                <!-- Select Dropdown -->
                <div>
                    <label for="selectField" class="block text-sm font-medium text-gray-700 mb-2">
                        {{ t("membermemberships.selectOption") }}
                    </label>
                    <div class="relative">
                        <select 
                            id="selectField"
                            v-model="formData.membershipId" 
                            :disabled="optionsLoading"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                            required
                        >
                            <option value="">
                                {{ optionsLoading ? t("membermemberships.loading") : t("membermemberships.chooseOption") }}
                            </option>
                            <option 
                                v-for="option in options" 
                                :key="option.value" 
                                :value="option.value"
                            >
                                {{ option.label }}
                            </option>
                        </select>
                        <!-- Loading spinner -->
                        <div 
                            v-if="optionsLoading" 
                            class="absolute right-3 top-1/2 transform -translate-y-1/2"
                        >
                            <svg class="animate-spin h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </div>
                    </div>
                </div>

                <!-- Start Date -->
                <div>
                    <label for="startDate" class="block text-sm font-medium text-gray-700 mb-2">
                        {{ t("membermemberships.startDate") }}
                    </label>
                    <input 
                        id="startDate"
                        type="date" 
                        v-model="formData.startDate"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                    />
                </div>

                <!-- End Date -->
                <div>
                    <label for="endDate" class="block text-sm font-medium text-gray-700 mb-2">
                        {{ t("membermemberships.endDate") }}
                    </label>
                    <input 
                        id="endDate"
                        type="date" 
                        v-model="formData.endDate"
                        :min="formData.startDate"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                    />
                </div>
            </form>

            <!-- Buttons -->
            <div class="flex gap-3">    
                <button 
                    @click="closeModal"
                    type="button"
                    class="flex-1 px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500"
                >
                    {{ t("membermemberships.cancel") }}
                </button>
                <button 
                    @click="handleConfirm"
                    id="confirmBtn"
                    :disabled="!isFormValid"
                    class="flex-1 px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {{ t("membermemberships.add") }}
                </button>
            </div>
        </div>
    </dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { MemberMembershipFormData, SelectOption } from '@/types/membermemberships';
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = withDefaults(defineProps<{
  options?: SelectOption[]
  optionsLoading?: boolean
  memberId: number|null
}>(), {
  options: () => [],
  optionsLoading: false
})

const emit = defineEmits<{
  close: []
  confirmed: [data: MemberMembershipFormData]
}>()

const modal = ref<HTMLDialogElement | null>(null)

const formData = ref<MemberMembershipFormData>({
  memberId: props.memberId,
  membershipId: 0,
  startDate: '',
  endDate: ''
})

watch(() => formData.value.startDate, (newStartDate) => {
  if (formData.value.endDate && newStartDate && formData.value.endDate < newStartDate) {
    formData.value.endDate = newStartDate
  }
})

// Form validation
const isFormValid = computed(() => {
  return !props.optionsLoading &&
         formData.value.membershipId !== 0 &&
         formData.value.startDate !== '' &&
         formData.value.endDate !== ''
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
  if (isFormValid.value) {
    emit('confirmed', formData.value)
    closeModal()
    resetForm()
  }
}

const resetForm = (): void => {
  formData.value = {
    memberId: null,
    membershipId: 0,
    startDate: '',
    endDate: ''
  }
}

// Expose methods to parent component
defineExpose({
  openModal,
  closeModal,
  resetForm
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