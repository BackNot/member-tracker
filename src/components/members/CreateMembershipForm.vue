<template>
  <div class="bg-white rounded-lg border border-gray-200 shadow-sm">
    <div class="px-6 py-4 border-b border-gray-200">
      <h2 class="text-lg font-medium text-gray-900">
            {{ formData.id ? t("memberships.edit_information") : t("memberships.information") }}
        </h2>
    </div>
    
    <!-- Status messages with clear visual feedback -->
    <AlertMessage
      :message="props.message"
      :type="messageType"
      :dismissible="false"
    />
    
    <form @submit.prevent="handleSubmit" class="p-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
            {{ t("memberships.name") }} <span class="text-red-600">*</span>
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i class="pi pi-user text-gray-400"></i>
            </div>
            <input
              id="name"
              v-model="formData.name"
              type="text"
              required
              :placeholder="t('memberships.enter_name')"
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              :class="{'border-red-300 ring-1 ring-red-300': formErrors.name}"
              aria-describedby="name-error"
            />
          </div>
          <p v-if="formErrors.name" id="name-error" class="mt-1 text-sm text-red-600">
            <i class="pi pi-exclamation-circle mr-1"></i> {{ formErrors.name }}
          </p>
        </div>

        <div>
          <label for="type" class="block text-sm font-medium text-gray-700 mb-1">
            {{ t("memberships.type") }} <span class="text-red-600">*</span>
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i class="pi pi-tag text-gray-400"></i>
            </div>
            <select
              id="type"
              v-model="formData.type"
              required
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="time">{{ t("memberships.type_time") }}</option>
              <option value="training">{{ t("memberships.type_training") }}</option>
            </select>
          </div>
        </div>

        <div>
          <label for="days" class="block text-sm font-medium text-gray-700 mb-1">
            {{ t("memberships.days") }} <span class="text-red-600">*</span>
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i class="pi pi-calendar text-gray-400"></i>
            </div>
            <input
              id="days"
              v-model="formData.days"
              type="number"
              min="1"
              required
              :placeholder="t('memberships.enter_days')"
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              :class="{'border-red-300 ring-1 ring-red-300': formErrors.days}"
              aria-describedby="days-error"
            />
          </div>
          <p v-if="formErrors.days" id="days-error" class="mt-1 text-sm text-red-600">
            <i class="pi pi-exclamation-circle mr-1"></i> {{ formErrors.days }}
          </p>
        </div>

        <div v-if="formData.type === 'training'">
          <label for="trainings" class="block text-sm font-medium text-gray-700 mb-1">
            {{ t("memberships.trainings") }} <span class="text-red-600">*</span>
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i class="pi pi-ticket text-gray-400"></i>
            </div>
            <input
              id="trainings"
              v-model="formData.trainings"
              type="number"
              min="1"
              :required="formData.type === 'training'"
              :placeholder="t('memberships.enter_trainings')"
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              :class="{'border-red-300 ring-1 ring-red-300': formErrors.trainings}"
              aria-describedby="trainings-error"
            />
          </div>
          <p v-if="formErrors.trainings" id="trainings-error" class="mt-1 text-sm text-red-600">
            <i class="pi pi-exclamation-circle mr-1"></i> {{ formErrors.trainings }}
          </p>
        </div>
      </div>

      <!-- Description with character count -->
      <div class="mt-6">
        <div class="flex justify-between">
          <label for="description" class="block text-sm font-medium text-gray-700 mb-1">
            {{ t("memberships.description") }} <span class="text-red-600">*</span>
          </label>
        </div>
        <div>
          <textarea
            id="description"
            v-model="formData.description"
            rows="4"
            maxlength="500"
            required
            :placeholder="t('memberships.enter_description')"
            class="w-1/2 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            :class="{'border-red-300 ring-1 ring-red-300': formErrors.description}"
            aria-describedby="description-error"
          ></textarea>
        </div>
        <p v-if="formErrors.description" id="description-error" class="mt-1 text-sm text-red-600">
          <i class="pi pi-exclamation-circle mr-1"></i> {{ formErrors.description }}
        </p>
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
            {{ formData.id ? t("memberships.save_membership") : t("memberships.create_membership") }}
          </span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import AlertMessage from '@/components/AlertMessage.vue';
import type { MembershipPayload, Props, MembershipForm, Emits } from '@/types/memberships';

interface FormErrors {
  name: string;
  description: string;
  days: string;
  trainings: string;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  message: '',
  submitButtonText: 'Create Member',
  messageType: 'success'
});

const emit = defineEmits<Emits>();

const formData = reactive<MembershipForm>({
  id: null,
  name: '',
  description: '',
  days: 0,
  type: 'time',
  trainings: null,
});

const formErrors = reactive<FormErrors>({
  name: '',
  description: '',
  days: '',
  trainings: ''
});

watch(() => props.initialData, (newData) => {
  if (newData) {
    Object.assign(formData, newData);
  }
}, { deep: true });

const validateForm = (): boolean => {
  let isValid = true;

  formErrors.name = '';
  formErrors.days = '';
  formErrors.trainings = '';

  if (!formData.name.trim()) {
    formErrors.name = t("memberships.name_required");
    isValid = false;
  }

  if (formData.days <= 0) {
    formErrors.days = t("membership.days_required");
    isValid = false;
  }

  if (formData.type === 'training' && (!formData.trainings || formData.trainings <= 0)) {
    formErrors.trainings = t("memberships.trainings_required");
    isValid = false;
  }

  return isValid;
};

const handleSubmit = (): void => {
  if (!validateForm()) return;

  const membershipData: MembershipPayload = {
    name: formData.name.trim(),
    description: formData.description.trim(),
    days: formData.days,
    type: formData.type,
    trainings: formData.type === 'training' ? formData.trainings : null
  };

  emit('submit', membershipData);
};
</script>