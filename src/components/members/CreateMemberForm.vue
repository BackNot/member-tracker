<template>
  <div class="bg-white rounded-lg border border-gray-200 shadow-sm">
    <div class="px-6 py-4 border-b border-gray-200">
      <h2 class="text-lg font-medium text-gray-900">
            {{ t("members.information") }}
        </h2>
    </div>
    
    <!-- Status messages with clear visual feedback -->
    <AlertMessage
      :message="props.message"
      :type="messageType"
      :dismissible="false"
    />
    
    <form @submit.prevent="handleSubmit" class="p-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div>
          <label for="firstName" class="block text-sm font-medium text-gray-700 mb-1">
            {{ t("members.first_name") }} <span class="text-red-600">*</span>
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i class="pi pi-user text-gray-400"></i>
            </div>
            <input
              id="firstName"
              v-model="formData.firstName"
              type="text"
              required
              :placeholder="t('members.enter_first_name')"
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              :class="{'border-red-300 ring-1 ring-red-300': formErrors.firstName}"
              aria-describedby="firstName-error"
            />
          </div>
          <p v-if="formErrors.firstName" id="firstName-error" class="mt-1 text-sm text-red-600">
            <i class="pi pi-exclamation-circle mr-1"></i> {{ formErrors.firstName }}
          </p>
        </div>

        <div>
          <label for="lastName" class="block text-sm font-medium text-gray-700 mb-1">
            {{ t("members.last_name") }} <span class="text-red-600">*</span>
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i class="pi pi-user text-gray-400"></i>
            </div>
            <input
              id="lastName"
              v-model="formData.lastName"
              type="text"
              required
              :placeholder="t('members.enter_last_name')"
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              :class="{'border-red-300 ring-1 ring-red-300': formErrors.lastName}"
              aria-describedby="lastName-error"
            />
          </div>
          <p v-if="formErrors.lastName" id="lastName-error" class="mt-1 text-sm text-red-600">
            <i class="pi pi-exclamation-circle mr-1"></i> {{ formErrors.lastName }}
          </p>
        </div>

        <!-- Nickname -->
        <div>
          <label for="nickname" class="block text-sm font-medium text-gray-700 mb-1">
            {{ t("members.nickname") }} <span class="text-gray-400 font-normal">({{ t("members.optional") }})</span>
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i class="pi pi-id-card text-gray-400"></i>
            </div>
            <input
              id="nickname"
              v-model="formData.nickname"
              type="text"
              :placeholder="t('members.enter_nickname')"
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>
      </div>

      <!-- Description with character count -->
      <div class="mt-6">
        <div class="flex justify-between">
          <label for="description" class="block text-sm font-medium text-gray-700 mb-1">
            {{ t("members.description") }} <span class="text-gray-400 font-normal">({{ t("members.optional") }})</span>
          </label>
        </div>
        <div>
          <textarea
            id="description"
            v-model="formData.description"
            rows="4"
            maxlength="500"
            :placeholder="t('members.enter_description')"
            class="w-1/2 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          ></textarea>
        </div>
      </div>

      <div class="mt-8 flex items-center justify-end space-x-4">
        <button
          type="button"
          @click="$emit('cancel')"
          class="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
        >
          {{ t("members.cancel") }}
        </button>
        <button
          type="submit"
          class="px-5 py-2.5 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors flex items-center"
          :disabled="loading"
        >
          <i class="pi pi-save mr-2"></i>
          <span>
            {{ t("members.create_member") }}
          </span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n'
import AlertMessage from '@/components/AlertMessage.vue';
import type { MemberForm, MemberPayload, Props, Emits } from '@/types/members';

const { t } = useI18n()

interface FormErrors {
  firstName: string;
  lastName: string;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  message: '',
  submitButtonText: 'Create Member',
  messageType: 'success'
});



const emit = defineEmits<Emits>();

const formData = reactive<MemberForm>({
  id: null,
  firstName: '',
  lastName: '',
  nickname: '',
  description: '',
});


const formErrors = reactive<FormErrors>({
  firstName: '',
  lastName: ''
});

watch(() => props.initialData, (newData) => {
  if (newData) {
    Object.assign(formData, newData);
  }
}, { deep: true });

const validateForm = (): boolean => {
  let isValid = true;
  
  formErrors.firstName = '';
  formErrors.lastName = '';
  
  if (!formData.firstName.trim()) {
    formErrors.firstName = t("members.first_name_required");
    isValid = false;
  }
  
  if (!formData.lastName.trim()) {
    formErrors.lastName = t("members.last_name_required");
    isValid = false;
  }
  
  return isValid;
};

const handleSubmit = (): void => {
  if (!validateForm()) return;
  
  const memberData: MemberPayload = {
    firstName: formData.firstName.trim(),
    lastName: formData.lastName.trim(),
    nickname: formData.nickname.trim() || undefined,
    description: formData.description.trim() || undefined
  };
  
  emit('submit', memberData);
};
</script>