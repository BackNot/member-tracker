<template>
  <Transition
    enter-active-class="transition ease-out duration-300"
    enter-from-class="opacity-0 transform scale-95"
    enter-to-class="opacity-100 transform scale-100"
    leave-active-class="transition ease-in duration-200"
    leave-from-class="opacity-100 transform scale-100"
    leave-to-class="opacity-0 transform scale-95"
  >
    <div 
      v-if="message" 
      :class="alertClasses"
      role="alert"
      :aria-live="type === 'error' ? 'assertive' : 'polite'"
    >
      <div class="flex">
        <div class="flex-shrink-0 mr-3">
          <i :class="iconClasses"></i>
        </div>
        <div class="flex-1">
          <p class="font-medium">{{ message }}</p>
          <p v-if="description" class="text-sm mt-1 opacity-90">{{ description }}</p>
        </div>
        <div v-if="dismissible" class="ml-4">
          <button
            @click="handleDismiss"
            class="inline-flex text-current hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current rounded-md p-1"
            :aria-label="t ? t('common.dismiss') : 'Dismiss'"
          >
            <i class="pi pi-times text-sm"></i>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n'
import type { AlertType } from '@/types/alerts';
import type { AlertVariant } from '@/types/alerts';
import type { Props } from '@/types/alerts';

const { t } = useI18n()

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  variant: 'border-left',
  dismissible: false,
  customClasses: ''
});

interface Emits {
  dismiss: [];
}

const emit = defineEmits<Emits>();

// Computed classes based on type and variant
const alertClasses = computed(() => {
  const baseClasses = 'p-4 mb-6 rounded-md shadow-sm';
  const spacingClasses = 'mx-6 mt-4';
  
  let typeClasses = '';
  
  if (props.variant === 'border-left') {
    typeClasses = `border-l-4 ${getBorderLeftClasses()}`;
  } else if (props.variant === 'filled') {
    typeClasses = getFilledClasses();
  } else if (props.variant === 'outlined') {
    typeClasses = `border-2 ${getOutlinedClasses()}`;
  }
  
  return [
    baseClasses,
    spacingClasses,
    typeClasses,
    props.customClasses
  ].filter(Boolean).join(' ');
});

const iconClasses = computed(() => {
  const iconMap = {
    success: 'pi pi-check-circle text-green-500',
    error: 'pi pi-times-circle text-red-500',
    warning: 'pi pi-exclamation-triangle text-yellow-500',
    info: 'pi pi-info-circle text-blue-500'
  };
  
  return iconMap[props.type];
});

// Helper functions for different variants
const getBorderLeftClasses = (): string => {
  const classMap = {
    success: 'bg-green-50 border-green-400 text-green-800',
    error: 'bg-red-50 border-red-400 text-red-800',
    warning: 'bg-yellow-50 border-yellow-400 text-yellow-800',
    info: 'bg-blue-50 border-blue-400 text-blue-800'
  };
  
  return classMap[props.type];
};

const getFilledClasses = (): string => {
  const classMap = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    warning: 'bg-yellow-500 text-white',
    info: 'bg-blue-500 text-white'
  };
  
  return classMap[props.type];
};

const getOutlinedClasses = (): string => {
  const classMap = {
    success: 'bg-white border-green-400 text-green-800',
    error: 'bg-white border-red-400 text-red-800',
    warning: 'bg-white border-yellow-400 text-yellow-800',
    info: 'bg-white border-blue-400 text-blue-800'
  };
  
  return classMap[props.type];
};

const handleDismiss = (): void => {
  emit('dismiss');
};
</script>