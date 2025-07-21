<script setup lang="ts">
import QRCode from 'qrcode'
import { onMounted, ref, watch } from 'vue'
import QRCodeDeleteModal from '~/components/Modal/QRCodeDeleteModal.vue'
import QRCodeEditModal from '~/components/Modal/QRCodeEditModal.vue'
import QRCodeShareModal from '~/components/Modal/QRCodeShareModal.vue'
import { useSelectionStore } from '~/stores/selection'
import type { Database } from '~/types/supabase'

type QRCodeType = Database['public']['Tables']['qrcodes']['Row']
type QRCodeWithImage = QRCodeType & { qr_code_image?: string }

const props = defineProps<{
  qrcodes: QRCodeType[]
  campaigns?: Database['public']['Tables']['campaigns']['Row'][]
}>()

const emit = defineEmits<{
  (e: 'edit', id: number): void
  (e: 'share', id: number): void
  (e: 'delete', id: number): void
}>()

const qrcodesWithImages = ref<QRCodeWithImage[]>([])
const showShareModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const selection = useSelectionStore()
const isEditing = ref(false)
const isDeleting = ref(false)
const toast = useToast()

const generateQrCodeImages = async () => {
  const config = useRuntimeConfig()
  const baseUrl =
    config.public.baseUrl || (import.meta.client ? window.location.origin : 'https://yourapp.com')

  const promises = props.qrcodes.map(async (qr) => {
    if (!qr.content) {
      return { ...qr, qr_code_image: '' }
    }
    try {
      const trackingUrl = `${baseUrl}/scan/${qr.id}`
      const imageUrl = await QRCode.toDataURL(trackingUrl, { width: 128, margin: 1 })
      return { ...qr, qr_code_image: imageUrl }
    } catch (err) {
      console.error('Failed to generate QR code image for:', qr.name, err)
      return { ...qr, qr_code_image: '' }
    }
  })
  qrcodesWithImages.value = await Promise.all(promises)
}

const openShareModal = (qr: QRCodeWithImage) => {
  selection.selectQRCode(qr)
  showShareModal.value = true
}

const openEditModal = (qr: QRCodeWithImage) => {
  selection.selectQRCode(qr)
  showEditModal.value = true
}

const handleDeleteQRCode = (qr: QRCodeWithImage) => {
  selection.selectQRCode(qr)
  showDeleteModal.value = true
}

const confirmDeleteQRCode = async () => {
  if (!selection.selectedQRCode) return

  isDeleting.value = true
  try {
    const supabase = useSupabaseClient()
    const { error } = await supabase.from('qrcodes').delete().eq('id', selection.selectedQRCode.id)

    if (error) throw error

    const index = qrcodesWithImages.value.findIndex((qr) => qr.id === selection.selectedQRCode!.id)
    if (index !== -1) {
      qrcodesWithImages.value.splice(index, 1)
    }

    toast.add({
      title: 'QR Code supprimé !',
      description: `Le QR code "${selection.selectedQRCode.name}" a été supprimé.`,
      color: 'success',
      icon: 'i-heroicons-trash',
    })

    showDeleteModal.value = false
    emit('delete', selection.selectedQRCode.id)
    selection.unselectQRCode()
  } catch (error) {
    console.error('Error deleting QR code:', error)
    toast.add({
      title: 'Erreur lors de la suppression',
      description: 'Une erreur est survenue lors de la suppression du QR code.',
      color: 'error',
      icon: 'i-heroicons-exclamation-triangle',
    })
  } finally {
    isDeleting.value = false
  }
}

const copyToClipboard = async (content: string | null | undefined) => {
  if (!content) return
  try {
    await navigator.clipboard.writeText(content)
    toast.add({
      title: 'Lien copié !',
      description: 'Le lien du QR code a été copié dans le presse-papier.',
      color: 'success',
      icon: 'i-heroicons-check-circle',
    })
  } catch (err) {
    console.error('Failed to copy:', err)
    toast.add({
      title: 'Erreur de copie',
      description: 'Impossible de copier le lien.',
      color: 'error',
      icon: 'i-heroicons-exclamation-triangle',
    })
  }
}

const downloadQRCode = () => {
  if (!selection.selectedQRCode?.qr_code_image) return

  const link = document.createElement('a')
  link.download = `qrcode-${selection.selectedQRCode.name}.png`
  link.href = selection.selectedQRCode.qr_code_image
  link.click()

  toast.add({
    title: 'Téléchargement lancé !',
    description: `Le QR code "${selection.selectedQRCode.name}" a été téléchargé.`,
    color: 'success',
    icon: 'i-heroicons-arrow-down-tray',
  })
}

const handleEditQRCode = async (formData: {
  name: string
  type: string
  content: string
  campaign_id: number | null
}) => {
  if (!selection.selectedQRCode) return

  isEditing.value = true
  try {
    const supabase = useSupabaseClient()
    const { data, error } = await supabase
      .from('qrcodes')
      .update({
        name: formData.name,
        type: formData.type,
        content: formData.content,
        campaign_id: formData.campaign_id,
      })
      .eq('id', selection.selectedQRCode.id)
      .select()

    if (error) throw error

    const updatedQR = {
      ...selection.selectedQRCode,
      name: formData.name,
      type: formData.type,
      content: formData.content,
      campaign_id: formData.campaign_id,
    }

    if (formData.content !== selection.selectedQRCode.content) {
      try {
        updatedQR.qr_code_image = await QRCode.toDataURL(formData.content, {
          width: 128,
          margin: 1,
        })
      } catch (err) {
        console.error('Failed to generate new QR code image:', err)
      }
    }

    const index = qrcodesWithImages.value.findIndex((qr) => qr.id === selection.selectedQRCode!.id)
    if (index !== -1) {
      qrcodesWithImages.value[index] = updatedQR
    }

    toast.add({
      title: 'QR Code modifié avec succès !',
      description: `Le QR code "${formData.name}" a été mis à jour.`,
      color: 'success',
      icon: 'i-heroicons-pencil-square',
    })

    showEditModal.value = false
    emit('edit', selection.selectedQRCode.id)
  } catch (error) {
    console.error('Error updating QR code:', error)
    toast.add({
      title: 'Erreur lors de la modification',
      description: 'Une erreur est survenue lors de la modification du QR code.',
      color: 'error',
      icon: 'i-heroicons-exclamation-triangle',
    })
  } finally {
    isEditing.value = false
  }
}

onMounted(generateQrCodeImages)
watch(() => props.qrcodes, generateQrCodeImages, { deep: true })
</script>

<template>
  <div class="space-y-8">
    <!--
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold text-white mb-2">Collection QR Codes</h2>
        <p class="text-white/60">{{ qrcodesWithImages.length }} QR codes actifs</p>
      </div>
      <div class="flex items-center gap-4">
        <div class="flex items-center bg-white/5 border border-white/10 rounded-xl p-1">
          <button class="px-3 py-2 rounded-lg bg-yellow-400/20 text-yellow-400 text-sm font-medium transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect width="7" height="7" x="3" y="3" rx="1"/>
              <rect width="7" height="7" x="14" y="3" rx="1"/>
              <rect width="7" height="7" x="14" y="14" rx="1"/>
              <rect width="7" height="7" x="3" y="14" rx="1"/>
            </svg>
          </button>
          <button class="px-3 py-2 rounded-lg text-white/50 hover:text-white/80 text-sm font-medium transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="3" x2="21" y1="6" y2="6"/>
              <line x1="3" x2="21" y1="12" y2="12"/>
              <line x1="3" x2="21" y1="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
    -->

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
      <div class="group relative p-6 rounded-2xl overflow-hidden bg-gradient-to-br from-white/[0.03] via-white/[0.05] to-white/[0.03] backdrop-blur-md border border-white/10 hover:border-white/20 transition-all duration-300">
        <div class="absolute inset-0 bg-gradient-to-br opacity-20 from-green-500/10 via-emerald-500/10 to-teal-500/10"></div>
        <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-full transition-all duration-1000"></div>
        <div class="relative">
          <div class="flex items-center gap-4 mb-4">
            <div class="w-12 h-12 bg-green-400/10 border border-green-400/20 rounded-xl flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-green-400">
                <path d="M3 3v18h18"/>
                <path d="m19 9-5 5-4-4-3 3"/>
              </svg>
            </div>
            <div>
              <p class="text-2xl font-bold text-white">{{ qrcodesWithImages.reduce((sum, qr) => sum + (qr.scan_count || 0), 0) }}</p>
              <p class="text-sm text-white/60">Total des scans</p>
            </div>
          </div>
        </div>
      </div>

      <div class="group relative p-6 rounded-2xl overflow-hidden bg-gradient-to-br from-white/[0.03] via-white/[0.05] to-white/[0.03] backdrop-blur-md border border-white/10 hover:border-white/20 transition-all duration-300">
        <div class="absolute inset-0 bg-gradient-to-br opacity-20 from-blue-500/10 via-indigo-500/10 to-purple-500/10"></div>
        <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-full transition-all duration-1000"></div>
        <div class="relative">
          <div class="flex items-center gap-4 mb-4">
            <div class="w-12 h-12 bg-blue-400/10 border border-blue-400/20 rounded-xl flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-400">
                <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                <path d="M3 3v5h5"/>
                <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
                <path d="M16 16h5v5"/>
              </svg>
            </div>
            <div>
              <p class="text-2xl font-bold text-white">{{ qrcodesWithImages.filter(qr => qr.type === 'dynamique').length }}</p>
              <p class="text-sm text-white/60">QR codes dynamiques</p>
            </div>
          </div>
        </div>
      </div>

      <div class="group relative p-6 rounded-2xl overflow-hidden bg-gradient-to-br from-white/[0.03] via-white/[0.05] to-white/[0.03] backdrop-blur-md border border-white/10 hover:border-white/20 transition-all duration-300">
        <div class="absolute inset-0 bg-gradient-to-br opacity-20 from-yellow-500/10 via-amber-500/10 to-orange-500/10"></div>
        <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-full transition-all duration-1000"></div>
        <div class="relative">
          <div class="flex items-center gap-4 mb-4">
            <div class="w-12 h-12 bg-yellow-400/10 border border-yellow-400/20 rounded-xl flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-yellow-400">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="m22 2-5 5"/>
                <path d="m17 7 5-5"/>
              </svg>
            </div>
            <div>
              <p class="text-2xl font-bold text-white">{{ qrcodesWithImages.length > 0 ? Math.round(qrcodesWithImages.reduce((sum, qr) => sum + (qr.scan_count || 0), 0) / qrcodesWithImages.length) : 0 }}</p>
              <p class="text-sm text-white/60">Moyenne par QR code</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="qr in qrcodesWithImages" :key="qr.id" class="group relative rounded-2xl overflow-hidden bg-gradient-to-br from-white/[0.03] via-white/[0.05] to-white/[0.03] backdrop-blur-md border border-white/10 hover:border-white/20 shadow-lg hover:shadow-white/10 transition-all duration-500 ease-out">

        <div class="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-20 transition-opacity duration-500" :class="{
                    'from-blue-500/20 via-indigo-500/20 to-purple-500/20': qr.type === 'dynamique',
                    'from-gray-500/20 via-slate-500/20 to-zinc-500/20': qr.type === 'statique'
                }"></div>

        <!-- Shimmer Effect -->
        <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-full transition-all duration-1000"></div>

        <div class="relative p-6 flex flex-col h-full">
          <!-- QR Code Image -->
          <div class="mb-6 flex justify-center">
            <div class="relative">
              <div class="p-4 bg-white rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <div v-if="qr.qr_code_image" class="w-24 h-24">
                  <img :src="qr.qr_code_image" alt="QR Code" class="w-full h-full" />
                </div>
                <div v-else class="w-24 h-24 flex items-center justify-center bg-gray-100 rounded-lg">
                  <svg class="w-8 h-8 text-gray-400 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              </div>

            </div>
            <div class="absolute top-2 right-2 px-2 py-1 text-xs font-semibold rounded-full bg-green-400/20 text-green-400 border border-green-400/30">
              Actif
            </div>
          </div>

          <!-- Content -->
          <div class="flex-grow space-y-4">
            <!-- Title -->
            <div>
              <h3 class="font-bold text-lg text-white group-hover:text-yellow-400 transition-colors duration-300 line-clamp-2">
                {{ qr.name }}
              </h3>
              <p class="text-sm text-white/60 mt-1 line-clamp-2" :title="qr.content || ''">
                {{ qr.content }}
              </p>
            </div>

            <!-- Tags -->
            <div class="flex flex-wrap gap-2">
                            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border" :class="{
                                'bg-blue-400/10 text-blue-400 border-blue-400/20': qr.type === 'dynamique',
                                'bg-gray-400/10 text-gray-400 border-gray-400/20': qr.type === 'statique'
                            }">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1">
                                    <rect width="5" height="5" x="3" y="3" rx="1" v-if="qr.type === 'statique'"/>
                                    <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" v-else/>
                                    <path d="M3 3v5h5" v-if="qr.type === 'dynamique'"/>
                                    <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" v-if="qr.type === 'dynamique'"/>
                                    <path d="M16 16h5v5" v-if="qr.type === 'dynamique'"/>
                                </svg>
                                {{ qr.type }}
                            </span>

              <span v-if="qr.campaign_id && campaigns" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-400/10 text-yellow-400 border border-yellow-400/20">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1">
                                    <path d="m3 11 18-5v12L3 14v-3z"/>
                                    <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>
                                </svg>
                                {{ campaigns.find(c => c.id === qr.campaign_id)?.name }}
                            </span>
            </div>

            <!-- Stats -->
            <div class="flex justify-between items-center text-xs text-white/50 border-t border-white/10 pt-4">
              <div class="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 3v18h18"/>
                  <path d="m19 9-5 5-4-4-3 3"/>
                </svg>
                <span class="font-medium">{{ qr.scan_count || 0 }} scans</span>
              </div>
              <div class="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M8 2v4"/>
                  <path d="M16 2v4"/>
                  <rect width="18" height="18" x="3" y="4" rx="2"/>
                  <path d="M3 10h18"/>
                </svg>
                <span>{{ new Date(qr.created_at).toLocaleDateString('fr-FR') }}</span>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-2 mt-6 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
            <!-- Share Button -->
            <button @click="openShareModal(qr)" class="flex-1 relative overflow-hidden bg-gradient-to-r from-indigo-400/20 to-purple-400/20 border border-indigo-400/30 text-indigo-400 text-xs font-medium py-2.5 px-3 rounded-xl hover:from-indigo-400/30 hover:to-purple-400/30 hover:border-indigo-400/40 transition-all duration-300 group/btn">
              <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover/btn:opacity-100 -translate-x-full group-hover/btn:translate-x-full transition-all duration-700"></div>
              <div class="relative flex items-center justify-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                </svg>
                <span class="hidden sm:inline">Partager</span>
              </div>
            </button>

            <!-- Edit Button -->
            <button @click="openEditModal(qr)" class="flex-1 relative overflow-hidden bg-gradient-to-r from-blue-400/20 to-cyan-400/20 border border-blue-400/30 text-blue-400 text-xs font-medium py-2.5 px-3 rounded-xl hover:from-blue-400/30 hover:to-cyan-400/30 hover:border-blue-400/40 transition-all duration-300 group/btn">
              <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover/btn:opacity-100 -translate-x-full group-hover/btn:translate-x-full transition-all duration-700"></div>
              <div class="relative flex items-center justify-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                  <path d="m15 5 4 4"/>
                </svg>
                <span class="hidden sm:inline">Modifier</span>
              </div>
            </button>

            <!-- Delete Button -->
            <button @click="handleDeleteQRCode(qr)" class="relative overflow-hidden bg-gradient-to-r from-red-400/20 to-rose-400/20 border border-red-400/30 text-red-400 text-xs font-medium py-2.5 px-3 rounded-xl hover:from-red-400/30 hover:to-rose-400/30 hover:border-red-400/40 transition-all duration-300 group/btn">
              <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover/btn:opacity-100 -translate-x-full group-hover/btn:translate-x-full transition-all duration-700"></div>
              <div class="relative flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 6h18"/>
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                  <line x1="10" x2="10" y1="11" y2="17"/>
                  <line x1="14" x2="14" y1="11" y2="17"/>
                </svg>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>


    <QRCodeShareModal
        :is-open="showShareModal"
        :selected-q-r="selection.selectedQRCode"
        :qr-code-image="selection.selectedQRCode?.qr_code_image || null"
        @update:is-open="showShareModal = $event"
        @copy-to-clipboard="copyToClipboard"
        @download-q-r-code="downloadQRCode"
    />

    <QRCodeEditModal
        :is-open="showEditModal"
        :selected-q-r="selection.selectedQRCode"
        :campaigns="campaigns || []"
        :is-editing="isEditing"
        @update:is-open="showEditModal = $event"
        @edit="handleEditQRCode"
    />

    <QRCodeDeleteModal
        :is-open="showDeleteModal"
        :selected-q-r="selection.selectedQRCode"
        :is-deleting="isDeleting"
        @update:is-open="showDeleteModal = $event"
        @confirm-delete="confirmDeleteQRCode"
    />
  </div>
</template>
