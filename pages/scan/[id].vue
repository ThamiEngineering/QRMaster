<script setup lang="ts">
import type { Database } from '~/types/supabase'

const route = useRoute()
const router = useRouter()
const supabase = useSupabaseClient()
const { recordScan, getClientIP } = useQRTracking()

const qrcodeId = parseInt(route.params.id as string)

const isLoading = ref(true)
const error = ref<string | null>(null)
const qrcode = ref<Database['public']['Tables']['qrcodes']['Row'] | null>(null)

const handleScan = async () => {
  try {
    const { data: qrcodeData, error: qrcodeError } = await supabase
      .from('qrcodes')
      .select('*')
      .eq('id', qrcodeId)
      .single()

    if (qrcodeError || !qrcodeData) {
      throw new Error('QR code non trouvé')
    }

    qrcode.value = qrcodeData

    const userAgent = navigator.userAgent
    const referrer = document.referrer || null

    let ipAddress = 'Unknown'
    try {
      const ipResponse = await fetch('https://api.ipify.org?format=json')
      const ipData = await ipResponse.json()
      ipAddress = ipData.ip
    } catch (ipError) {
      console.warn('Could not get IP address:', ipError)
    }

    recordScan(qrcodeId, userAgent, ipAddress, referrer).catch((error) =>
      console.error('Error recording scan:', error)
    )

    if (qrcodeData.content) {
      setTimeout(() => {
        window.location.href = qrcodeData.content
      }, 500)
    } else {
      throw new Error('Contenu du QR code invalide')
    }
  } catch (err) {
    console.error('Error handling scan:', err)
    error.value = (err as Error).message || 'Une erreur est survenue'
    isLoading.value = false
  }
}

onMounted(() => {
  if (!qrcodeId || isNaN(qrcodeId)) {
    error.value = 'QR code invalide'
    isLoading.value = false
    return
  }

  handleScan()
})

useHead({
  title: 'Redirection en cours...',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="max-w-md w-full mx-auto text-center p-8">
      <div v-if="isLoading" class="space-y-4">
        <div class="w-16 h-16 mx-auto">
          <Icon name="heroicons:arrow-path" class="w-16 h-16 text-blue-600 animate-spin" />
        </div>
        <h1 class="text-xl font-semibold text-gray-900">Redirection en cours...</h1>
        <p class="text-gray-600">Vous allez être redirigé vers votre destination.</p>

        <div class="w-full bg-gray-200 rounded-full h-2">
          <div class="bg-blue-600 h-2 rounded-full animate-pulse" style="width: 70%"/>
        </div>
      </div>

      <div v-else-if="error" class="space-y-4">
        <div class="w-16 h-16 mx-auto">
          <Icon name="heroicons:exclamation-triangle" class="w-16 h-16 text-red-500" />
        </div>
        <h1 class="text-xl font-semibold text-red-900">Erreur</h1>
        <p class="text-red-600">{{ error }}</p>

        <div class="space-y-2">
          <button
            class="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            @click="router.push('/')"
          >
            Retourner à l'accueil
          </button>

          <button
            class="w-full border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            @click="handleScan"
          >
            Réessayer
          </button>
        </div>
      </div>

      <div v-if="qrcode && !error" class="mt-8 p-4 bg-white rounded-lg border border-gray-200">
        <h3 class="text-sm font-medium text-gray-900 mb-2">QR Code: {{ qrcode.name }}</h3>
        <p class="text-xs text-gray-500">
          Si la redirection ne fonctionne pas,
          <a :href="qrcode.content" class="text-blue-600 underline">cliquez ici</a>
        </p>
      </div>

      <div class="mt-8 text-xs text-gray-400">
        Powered by <span class="font-medium">QRMaster</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }
}
</style>
