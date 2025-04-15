<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useSequelize } from '../composables/useSequelize';

interface DemoItem {
  id?: number;
  name: string;
  value: number;
}

const { create, findAll, destroy, isElectron } = useSequelize();
const results = ref<DemoItem[]>([]);
const loading = ref(false);
const message = ref('');
const electronStatus = ref('');

// Check if running in Electron
onMounted(() => {
  electronStatus.value = isElectron 
    ? 'Running in Electron' 
    : 'Not running in Electron - database operations will not work';
  
  console.log('Electron status:', isElectron);
  loadData();
});

// Add a sample record
const addItem = async () => {
  loading.value = true;
  message.value = 'Adding item...';
  
  try {
    const itemName = `Item ${Math.floor(Math.random() * 100)}`;
    const itemValue = Math.floor(Math.random() * 1000);
    
    console.log('Creating new item:', { name: itemName, value: itemValue });
    
    const result = await create<DemoItem>('Demo', {
      name: itemName,
      value: itemValue
    });
    
    console.log('Item created:', result);
    message.value = 'Item added successfully';
    await loadData(); // Refresh the data
  } catch (err) {
    console.error('Error adding item:', err);
    message.value = 'Error adding item: ' + (err instanceof Error ? err.message : String(err));
  } finally {
    loading.value = false;
  }
};

// Load all data from the demo table
const loadData = async () => {
  loading.value = true;
  message.value = 'Loading data...';
  
  try {
    console.log('Loading data...');
    const data = await findAll<DemoItem>('Demo', {
      order: [['id', 'DESC']]
    });
    
    console.log(`Loaded ${data.length} items`);
    results.value = data;
    message.value = `Loaded ${results.value.length} items`;
  } catch (err) {
    console.error('Error loading data:', err);
    message.value = 'Error loading data: ' + (err instanceof Error ? err.message : String(err));
    results.value = [];
  } finally {
    loading.value = false;
  }
};

// Clear all data
const clearData = async () => {
  loading.value = true;
  message.value = 'Clearing data...';
  
  try {
    console.log('Clearing data...');
    const result = await destroy('Demo', {
      where: {} // Empty where clause to delete all records
    });
    
    console.log(`Deleted ${result.count} items`);
    message.value = 'All data cleared';
    results.value = [];
  } catch (err) {
    console.error('Error clearing data:', err);
    message.value = 'Error clearing data: ' + (err instanceof Error ? err.message : String(err));
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="p-4">
    <h1 class="text-xl font-bold mb-4">SQLite Database Demo (with ORM)</h1>
    
    <div class="mb-2 p-2 bg-gray-100 rounded text-sm">
      <strong>Electron Status:</strong> {{ electronStatus }}
    </div>
    
    <div class="mb-4 text-sm p-2 border rounded" :class="{ 'bg-green-50 border-green-200': !message.includes('Error'), 'bg-red-50 border-red-200': message.includes('Error') }">
      <strong>Status:</strong> {{ message }}
    </div>
    
    <div class="flex space-x-2 mb-6">
      <button 
        @click="addItem" 
        class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        :disabled="loading"
      >
        Add Random Item
      </button>
      
      <button 
        @click="loadData" 
        class="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        :disabled="loading"
      >
        Refresh Data
      </button>
      
      <button 
        @click="clearData" 
        class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
        :disabled="loading"
      >
        Clear All Data
      </button>
    </div>
    
    <div v-if="loading" class="text-center py-4">
      Loading...
    </div>
    
    <div v-else class="border rounded overflow-hidden">
      <table class="min-w-full divide-y">
        <thead class="bg-gray-100">
          <tr>
            <th class="px-4 py-2 text-left">ID</th>
            <th class="px-4 py-2 text-left">Name</th>
            <th class="px-4 py-2 text-left">Value</th>
          </tr>
        </thead>
        <tbody class="divide-y">
          <tr v-for="item in results" :key="item.id" class="hover:bg-gray-50">
            <td class="px-4 py-2">{{ item.id }}</td>
            <td class="px-4 py-2">{{ item.name }}</td>
            <td class="px-4 py-2">{{ item.value }}</td>
          </tr>
          <tr v-if="results.length === 0">
            <td colspan="3" class="px-4 py-2 text-center text-gray-500">No data found</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>