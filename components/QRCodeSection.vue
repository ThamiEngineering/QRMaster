<script setup lang="ts">
import QRCode from 'qrcode'
import { onMounted, ref, watch } from 'vue'
import QRCodeDeleteModal from '~/components/Modal/QRCodeDeleteModal.vue'
import QRCodeEditModal from '~/components/Modal/QRCodeEditModal.vue'
import QRCodeShareModal from '~/components/Modal/QRCodeShareModal.vue'
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
const selectedQR = ref<QRCodeWithImage | null>(null)
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
  selectedQR.value = qr
  showShareModal.value = true
}

const openEditModal = (qr: QRCodeWithImage) => {
  selectedQR.value = qr
  showEditModal.value = true
}

const handleDeleteQRCode = (qr: QRCodeWithImage) => {
  selectedQR.value = qr
  showDeleteModal.value = true
}

const confirmDeleteQRCode = async () => {
  if (!selectedQR.value) return

  isDeleting.value = true
  try {
    const supabase = useSupabaseClient()
    const { error } = await supabase.from('qrcodes').delete().eq('id', selectedQR.value.id)

    if (error) throw error

    const index = qrcodesWithImages.value.findIndex((qr) => qr.id === selectedQR.value!.id)
    if (index !== -1) {
      qrcodesWithImages.value.splice(index, 1)
    }

    toast.add({
      title: 'QR Code supprimé !',
      description: `Le QR code "${selectedQR.value.name}" a été supprimé.`,
      color: 'success',
      icon: 'i-heroicons-trash',
    })

    showDeleteModal.value = false
    emit('delete', selectedQR.value.id)
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
  if (!selectedQR.value?.qr_code_image) return

  const link = document.createElement('a')
  link.download = `qrcode-${selectedQR.value.name}.png`
  link.href = selectedQR.value.qr_code_image
  link.click()

  toast.add({
    title: 'Téléchargement lancé !',
    description: `Le QR code "${selectedQR.value.name}" a été téléchargé.`,
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
  if (!selectedQR.value) return

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
      .eq('id', selectedQR.value.id)
      .select()

    if (error) throw error

    const updatedQR = {
      ...selectedQR.value,
      name: formData.name,
      type: formData.type,
      content: formData.content,
      campaign_id: formData.campaign_id,
    }

    if (formData.content !== selectedQR.value.content) {
      try {
        updatedQR.qr_code_image = await QRCode.toDataURL(formData.content, {
          width: 128,
          margin: 1,
        })
      } catch (err) {
        console.error('Failed to generate new QR code image:', err)
      }
    }

    const index = qrcodesWithImages.value.findIndex((qr) => qr.id === selectedQR.value!.id)
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
    emit('edit', selectedQR.value.id)
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
  <div>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div
        v-for="qr in qrcodesWithImages"
        :key="qr.id"
        class="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col hover:shadow-lg transition-all duration-200"
      >
        <div class="bg-gray-100 rounded-lg mb-4 flex items-center justify-center p-4">
          <img v-if="qr.qr_code_image" :src="qr.qr_code_image" alt="QR Code" class="w-24 h-24" >
          <div v-else class="w-24 h-24 flex items-center justify-center">
            <Icon name="heroicons:arrow-path" class="w-12 h-12 text-gray-300 animate-spin" />
          </div>
        </div>

        <div class="flex-grow">
          <span class="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-800">
            Actif
          </span>
          <h3 class="font-bold text-lg text-gray-900 mt-3">{{ qr.name }}</h3>
          <p class="text-sm text-gray-500 mt-1 truncate" :title="qr.content || ''">
            {{ qr.content }}
          </p>

          <div class="mt-3 flex flex-wrap gap-2">
            <span
              class="text-xs font-medium px-2 py-1 rounded-full"
              :class="{
                'bg-blue-100 text-blue-800': qr.type === 'dynamique',
                'bg-purple-100 text-purple-800': qr.type === 'statique',
              }"
            >
              {{ qr.type }}
            </span>

            <span
              v-if="qr.campaign_id && campaigns"
              class="text-xs font-medium px-2 py-1 rounded-full bg-yellow-100 text-yellow-800"
            >
              {{ campaigns.find((c) => c.id === qr.campaign_id)?.name }}
            </span>
          </div>
        </div>

        <div class="border-t border-gray-100 pt-4 mt-4">
          <div class="flex justify-between items-center text-xs text-gray-500 mb-4">
            <span>
              <Icon name="heroicons:chart-bar" class="w-4 h-4 inline -mt-0.5" />
              {{ qr.scan_count }} scans
            </span>
            <span>
              <Icon name="heroicons:calendar" class="w-4 h-4 inline -mt-0.5" />
              {{ new Date(qr.created_at).toLocaleDateString() }}
            </span>
          </div>
          <div class="flex gap-2">
            <button
              class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium py-2 px-2 rounded-lg flex items-center justify-center gap-1 transition-colors"
              @click="openShareModal(qr)"
            >
              <Icon name="heroicons:share" class="w-3 h-3" />
              <span class="hidden sm:inline">Partager</span>
            </button>
            <button
              class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium py-2 px-2 rounded-lg flex items-center justify-center gap-1 transition-colors"
              @click="openEditModal(qr)"
            >
              <Icon name="heroicons:pencil" class="w-3 h-3" />
              <span class="hidden sm:inline">Modifier</span>
            </button>
            <button
              class="bg-red-100 hover:bg-red-200 text-red-700 text-xs font-medium py-2 px-2 rounded-lg flex items-center justify-center transition-colors"
              @click="handleDeleteQRCode(qr)"
            >
              <Icon name="heroicons:trash" class="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <QRCodeShareModal
      :is-open="showShareModal"
      :selected-q-r="selectedQR"
      :qr-code-image="selectedQR?.qr_code_image || null"
      @update:is-open="showShareModal = $event"
      @copy-to-clipboard="copyToClipboard"
      @download-q-r-code="downloadQRCode"
    />

    <QRCodeEditModal
      :is-open="showEditModal"
      :selected-q-r="selectedQR"
      :campaigns="campaigns || []"
      :is-editing="isEditing"
      @update:is-open="showEditModal = $event"
      @edit="handleEditQRCode"
    />

    <QRCodeDeleteModal
      :is-open="showDeleteModal"
      :selected-q-r="selectedQR"
      :is-deleting="isDeleting"
      @update:is-open="showDeleteModal = $event"
      @confirm-delete="confirmDeleteQRCode"
    />
  </div>
</template>
