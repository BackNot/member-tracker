<template>
  <div class="mx-auto py-6 px-4 sm:px-0">
    <!-- Page header with breadcrumbs for context -->
    <nav class="mb-4">
      <ol class="flex text-sm items-center text-gray-500">
        <li><router-link :to="ROUTES.HOME" class="hover:text-blue-600">Dashboard</router-link></li>
        <li class="mx-2"><i class="pi pi-angle-right text-xs"></i></li>
        <li><router-link :to="ROUTES.MEMBERS.LIST" class="hover:text-blue-600">Members</router-link></li>
        <li class="mx-2"><i class="pi pi-angle-right text-xs"></i></li>
        <li class="text-gray-700 font-medium">New Member</li>
      </ol>
    </nav>

    <!-- Page title with stronger visual hierarchy -->
    <div class="flex items-center justify-between mb-6 pb-3 border-b border-gray-200">
      <h1 class="text-2xl font-bold text-gray-900">
        <i class="pi pi-user-plus mr-2 text-blue-600"></i>
        Add New Member
      </h1>
      <router-link 
        :to="ROUTES.MEMBERS.LIST" 
        class="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors flex items-center"
      >
        <i class="pi pi-list mr-1"></i> Back to Members List
      </router-link>
    </div>

    <!-- Status messages with clear visual feedback -->
    <div v-if="message" 
         :class="['p-4 mb-6 rounded-md shadow-sm border-l-4', messageStyleClass]"
         role="alert"
    >
      <div class="flex">
        <div class="flex-shrink-0 mr-3">
          <i v-if="messageStyleClass.includes('green')" class="pi pi-check-circle text-green-500"></i>
          <i v-else-if="messageStyleClass.includes('red')" class="pi pi-times-circle text-red-500"></i>
          <i v-else class="pi pi-info-circle text-blue-500"></i>
        </div>
        <div>
          <p class="font-medium">{{ message }}</p>
        </div>
      </div>
    </div>

    <!-- Card with slight elevation for the form -->
    <div class="bg-white rounded-lg border border-gray-200 shadow-sm">
      <!-- Form header with helpful instructions -->
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 class="text-lg font-medium text-gray-900">Member Information</h2>
      </div>
      
      <!-- Main form with clear sections -->
      <form @submit.prevent="submitForm" class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <!-- First Name -->
          <div>
            <label for="firstName" class="block text-sm font-medium text-gray-700 mb-1">
              First Name <span class="text-red-600">*</span>
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i class="pi pi-user text-gray-400"></i>
              </div>
              <input
                id="firstName"
                v-model="form.firstName"
                type="text"
                required
                placeholder="Enter first name"
                class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                :class="{'border-red-300 ring-1 ring-red-300': errors.firstName}"
                aria-describedby="firstName-error"
              />
            </div>
            <p v-if="errors.firstName" id="firstName-error" class="mt-1 text-sm text-red-600">
              <i class="pi pi-exclamation-circle mr-1"></i> {{ errors.firstName }}
            </p>
          </div>

          <!-- Last Name -->
          <div>
            <label for="lastName" class="block text-sm font-medium text-gray-700 mb-1">
              Last Name <span class="text-red-600">*</span>
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i class="pi pi-user text-gray-400"></i>
              </div>
              <input
                id="lastName"
                v-model="form.lastName"
                type="text"
                required
                placeholder="Enter last name"
                class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                :class="{'border-red-300 ring-1 ring-red-300': errors.lastName}"
                aria-describedby="lastName-error"
              />
            </div>
            <p v-if="errors.lastName" id="lastName-error" class="mt-1 text-sm text-red-600">
              <i class="pi pi-exclamation-circle mr-1"></i> {{ errors.lastName }}
            </p>
          </div>

             <!-- Nickname -->
        <div>
          <label for="nickname" class="block text-sm font-medium text-gray-700 mb-1">
            Nickname <span class="text-gray-400 font-normal">(optional)</span>
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i class="pi pi-id-card text-gray-400"></i>
            </div>
            <input
              id="nickname"
              v-model="form.nickname"
              type="text"
              placeholder="Enter nickname or preferred name"
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>
        </div>

     

        <!-- Description with character count -->
        <div class="mt-6">
          <div class="flex justify-between">
            <label for="description" class="block text-sm font-medium text-gray-700 mb-1">
              Description <span class="text-gray-400 font-normal">(optional)</span>
            </label>
          </div>
          <div>
            <textarea
              id="description"
              v-model="form.description"
              rows="4"
              maxlength="500"
              placeholder="Enter a brief description about this member"
              class="w-1/2 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            ></textarea>
          </div>
        </div>

        <div class="mt-8 flex items-center justify-end space-x-4">
          <router-link 
            :to="ROUTES.MEMBERS.LIST" 
            class="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
          >
            Cancel
          </router-link>
          <button
            type="submit"
            class="px-5 py-2.5 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors flex items-center"
            :disabled="loading"
          >
             <i class="pi pi-save mr-2"></i>
              <span>Create Member</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ROUTES } from '../router/routerConst';
import { IPC_CHANNELS } from '../../electron/ipc/ipcConstant.js';

// Define interfaces to match the Sequelize model
interface MemberForm {
  firstName: string;
  lastName: string;
  nickname: string;
  description: string;
}

interface FormErrors {
  firstName: string;
  lastName: string;
}

// Interface for the payload sent to backend
interface MemberPayload {
  firstName: string;
  lastName: string;
  nickname?: string;
  description?: string;
}

// Interface for any IPC error
interface IpcError extends Error {
  code?: string;
  errno?: number;
}

const router = useRouter();

// Form state with proper type that matches the entity
const form = reactive<MemberForm>({
  firstName: '',
  lastName: '',
  nickname: '',
  description: ''
});

// UI state with proper types
const loading = ref<boolean>(false);
const message = ref<string>('');

// Computed property for message styling
const messageStyleClass = computed(() => {
  if (message.value.includes('success')) {
    return 'bg-green-50 border-green-400 text-green-800';
  } else if (message.value.includes('Error')) {
    return 'bg-red-50 border-red-400 text-red-800';
  }
  return 'bg-blue-50 border-blue-400 text-blue-800';
});

const errors = reactive<FormErrors>({
  firstName: '',
  lastName: ''
});

// Define a type for the Electron IPC renderer
interface IpcRenderer {
  invoke: (channel: string, ...args: any[]) => Promise<any>;
}

// Get the ipcRenderer if available
// @ts-ignore - Electron exposes this property in the preload script
const ipc: IpcRenderer | undefined = window.electron?.ipcRenderer;

// Validate the form
const validateForm = (): boolean => {
  let isValid = true;
  
  // Reset errors
  errors.firstName = '';
  errors.lastName = '';
  
  // Validate required fields
  if (!form.firstName.trim()) {
    errors.firstName = 'First name is required';
    isValid = false;
  }
  
  if (!form.lastName.trim()) {
    errors.lastName = 'Last name is required';
    isValid = false;
  }
  
  return isValid;
};

// Submit the form
const submitForm = async (): Promise<void> => {
  if (!validateForm()) return;
  
  loading.value = true;
  message.value = '';
  
  try {
    // Create member payload with proper typing, matching the entity
    const memberData: MemberPayload = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      nickname: form.nickname.trim() || undefined,
      description: form.description.trim() || undefined
    };
    
    // Send to Electron backend
    await ipc.invoke(IPC_CHANNELS.MEMBER.CREATE, memberData);
    
    // Show success message
    message.value = 'Member created successfully! Redirecting to members list...';
    
    // Redirect after a short delay
    setTimeout(() => {
      router.push(ROUTES.MEMBERS.LIST);
    }, 1500);
    
  } catch (e: unknown) {
    // Type guard to handle error properly
    const error = e as IpcError;
    console.error('Error creating member:', error);
    message.value = `Error creating member: ${error.message}`;
  } finally {
    loading.value = false;
  }
};
</script>