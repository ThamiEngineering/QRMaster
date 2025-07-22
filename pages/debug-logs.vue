<template>
  <div class="p-8 bg-black text-white min-h-screen">
    <div v-if="!isAuthenticated" class="flex items-center justify-center min-h-screen">
      <div class="max-w-md w-full">
        <h1 class="text-2xl font-bold mb-6 text-center">🔐 Accès protégé</h1>
        <form class="space-y-4" @submit.prevent="authenticate">
          <input
            v-model="password"
            type="password"
            placeholder="Mot de passe"
            class="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:border-blue-400 outline-none"
          >
          <button
            type="submit"
            class="w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
            :disabled="!password"
          >
            Accéder
          </button>
        </form>
        <p v-if="error" class="text-red-400 text-sm mt-2 text-center">{{ error }}</p>
      </div>
    </div>

    <div v-else>
      <h1 class="text-2xl font-bold mb-4">🔍 Debug Logs</h1>

      <div class="mb-4">
        <button
          class="px-4 py-2 bg-blue-500 text-white rounded"
          :disabled="loading"
          @click="refreshLogs"
        >
          {{ loading ? 'Chargement...' : 'Actualiser' }}
        </button>
      </div>

      <div class="space-y-4">
        <div class="bg-gray-800 p-4 rounded">
          <h3 class="text-lg font-semibold mb-2">Derniers Scans (qr_scans)</h3>
          <div v-for="scan in recentScans" :key="scan.id" class="text-sm mb-2">
            <span class="text-green-400">ID {{ scan.id }}</span> - QR {{ scan.qrcode_id }} -
            <span class="text-blue-400">{{ new Date(scan.scanned_at).toLocaleString() }}</span> -
            {{ scan.device_type }} {{ scan.browser }}
          </div>
        </div>

        <div class="bg-gray-800 p-4 rounded">
          <h3 class="text-lg font-semibold mb-2">Compteurs QR (qrcodes)</h3>
          <div v-for="qr in qrcodes" :key="qr.id" class="text-sm mb-2">
            <span class="text-yellow-400">{{ qr.name }}</span> - ID {{ qr.id }} -
            <span class="text-red-400">{{ qr.scan_count }} scans</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const config = useRuntimeConfig()
const supabase = useSupabaseClient()
const loading = ref(false)
const recentScans = ref([])
const qrcodes = ref([])
const isAuthenticated = ref(false)
const password = ref('')
const error = ref('')

const authenticate = () => {
  const debugPassword = config.public.debugPassword || 'debug123'
  if (password.value === debugPassword) {
    isAuthenticated.value = true
    error.value = ''
  } else {
    error.value = 'Mot de passe incorrect'
  }
}

const refreshLogs = async () => {
  loading.value = true

  try {
    const { data: scansData } = await supabase
      .from('qr_scans')
      .select('*')
      .order('scanned_at', { ascending: false })
      .limit(10)

    recentScans.value = scansData || []

    const { data: qrData } = await supabase
      .from('qrcodes')
      .select('id, name, scan_count')
      .order('id')

    qrcodes.value = qrData || []
  } catch (error) {
    console.error('Error loading debug data:', error)
  } finally {
    loading.value = false
  }
}

onMounted(refreshLogs)

const interval = setInterval(refreshLogs, 5000)
onBeforeUnmount(() => clearInterval(interval))
</script>
