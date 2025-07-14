<template>
  <div class="bg-white border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-14">
        <div class="flex items-center space-x-3">
          <div class="flex items-center space-x-2">
            <a href="#"
              class="w-8 h-8 bg-blue-800 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors">
              <Icon name="mdi:facebook" class="w-4 h-4" />
            </a>
            <a href="#"
              class="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white hover:bg-gray-800 transition-colors">
              <Icon name="mdi:twitter" class="w-4 h-4" />
            </a>
            <a href="#"
              class="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white hover:bg-red-500 transition-colors">
              <Icon name="mdi:youtube" class="w-4 h-4" />
            </a>
            <a href="#"
              class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-500 transition-colors">
              <Icon name="mdi:linkedin" class="w-4 h-4" />
            </a>
            <a href="#"
              class="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white hover:bg-purple-500 transition-colors">
              <Icon name="mdi:instagram" class="w-4 h-4" />
            </a>
          </div>
        </div>

        <div class="flex items-center space-x-6 text-sm">
          <a href="#" class="text-gray-700 hover:text-gray-900 transition-colors">Blog</a>
          <a href="#" class="text-gray-700 hover:text-gray-900 transition-colors">Presse</a>
          <button class="text-gray-700 hover:text-gray-900 transition-colors">
            <Icon name="heroicons:magnifying-glass" class="w-4 h-4" />
          </button>
          <NuxtLink to="/login">
            <button class="text-gray-700 hover:text-gray-900 transition-colors font-medium">
              Me connecter
            </button>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>

  <header class="bg-white relative z-20" style="background-color: #ffcd00">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <div class="flex items-center space-x-3">
          <div class="flex items-center space-x-2">
            <span class="text-xl font-bold text-gray-800">QRMaster</span>
            <span class="text-sm text-gray-600 font-medium hidden md:block">| GÉRER L'AVENIR</span>
          </div>
        </div>

        <div class="hidden lg:flex items-center space-x-8">
          <a href="#" class="text-gray-800 hover:text-gray-900 font-medium transition-colors">Nous découvrir</a>
          <a href="#" class="text-gray-800 hover:text-gray-900 font-medium transition-colors">Nos solutions</a>
          <a href="#" class="text-gray-800 hover:text-gray-900 font-medium transition-colors">Nos tarifs</a>
          <a href="#" class="text-gray-800 hover:text-gray-900 font-medium transition-colors">Support</a>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
header {
  position: relative;
  z-index: 20;
}
</style>