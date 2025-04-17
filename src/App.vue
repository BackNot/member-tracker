<script setup lang="ts">
import HelloWorld from './components/HelloWorld.vue'
import TheWelcome from './components/TheWelcome.vue'
import TailwindTest from './components/TailwindTest.vue'
import Sidebar from './components/Sidebar.vue'
</script>

<template>
  <div class="flex flex-col min-h-screen w-full m-0 p-0 overflow-x-hidden bg-neutral-50">
    <header class="bg-gradient-to-r from-slate-50 to-gray-100 border-b border-slate-200 w-full shadow-sm">
      <div class="w-full flex justify-between items-center">
        <!-- Left side - minimal logo -->
        <div class="pl-4 py-5 flex items-center">
          <button class="p-2 mr-2 text-slate-400 lg:hidden">
            <i class="pi pi-bars"></i>
          </button>
          <h1 class="text-xl font-light text-slate-800">member<span class="font-medium text-slate-700">track</span></h1>
        </div>
        
        <!-- Right side - minimal controls -->
        <div class="pr-4 py-5 flex items-center space-x-5">
          <button class="text-slate-400 hover:text-slate-600 relative">
            <i class="pi pi-bell text-lg"></i>
            <span class="absolute top-0 right-0 w-1.5 h-1.5 bg-slate-400 rounded-full"></span>
          </button>
          
          <div class="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-700">
            <span class="text-sm font-medium">A</span>
          </div>
        </div>
      </div>
    </header>
    
    <div class="flex flex-1 w-full">
      <Sidebar />
      <main class="flex-1 p-8 bg-neutral-50 w-full">
        <div class="max-w-5xl">
          <router-view></router-view>
        </div>
      </main>
    </div>
  </div>
</template>

<style>
body {
  margin: 0;
  padding: 0;
  width: 100%;
  overflow-x: hidden;
}
</style>

<style scoped>
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
