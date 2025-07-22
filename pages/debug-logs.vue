<template>
  <div class="p-8 bg-black text-white min-h-screen">
    <h1 class="text-2xl font-bold mb-4">🔍 Debug Logs</h1>
    
    <div class="mb-4">
      <button 
        @click="refreshLogs" 
        class="px-4 py-2 bg-blue-500 text-white rounded"
        :disabled="loading"
      >
        {{ loading ? 'Chargement...' : 'Actualiser' }}
      </button>
    </div>

    <div class="space-y-4">
      <div class="bg-gray-800 p-4 rounded">
        <h3 class="text-lg font-semibold mb-2">Derniers Scans (qr_scans)</h3>
        <div v-for="scan in recentScans" :key="scan.id" class="text-sm mb-2">
          <span class="text-green-400">ID {{ scan.id }}</span> - 
          QR {{ scan.qrcode_id }} - 
          <span class="text-blue-400">{{ new Date(scan.scanned_at).toLocaleString() }}</span> -
          {{ scan.device_type }} {{ scan.browser }}
        </div>
      </div>

      <div class="bg-gray-800 p-4 rounded">
        <h3 class="text-lg font-semibold mb-2">Compteurs QR (qrcodes)</h3>
        <div v-for="qr in qrcodes" :key="qr.id" class="text-sm mb-2">
          <span class="text-yellow-400">{{ qr.name }}</span> - 
          ID {{ qr.id }} - 
          <span class="text-red-400">{{ qr.scan_count }} scans</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const supabase = useSupabaseClient()
const loading = ref(false)
const recentScans = ref([])
const qrcodes = ref([])

const refreshLogs = async () => {
  loading.value = true
  
  try {
    // Get recent scans
    const { data: scansData } = await supabase
      .from('qr_scans')
      .select('*')
      .order('scanned_at', { ascending: false })
      .limit(10)
    
    recentScans.value = scansData || []

    // Get QR codes with scan counts
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

// Auto refresh every 5 seconds
const interval = setInterval(refreshLogs, 5000)
onBeforeUnmount(() => clearInterval(interval))
</script> 