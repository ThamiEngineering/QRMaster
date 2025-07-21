import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Database } from '~/types/supabase'

type QRCodeWithImage = Database['public']['Tables']['qrcodes']['Row'] & { qr_code_image?: string }

export const useSelectionStore = defineStore('selection', () => {
  const selectedQRCode = ref<QRCodeWithImage | null>(null)
  const selectedCampaign = ref<Database['public']['Tables']['campaigns']['Row'] | null>(null)

  function selectQRCode(qr: QRCodeWithImage) {
    selectedQRCode.value = qr
  }
  function unselectQRCode() {
    selectedQRCode.value = null
  }
  function selectCampaign(campaign: Database['public']['Tables']['campaigns']['Row']) {
    selectedCampaign.value = campaign
  }
  function unselectCampaign() {
    selectedCampaign.value = null
  }

  return {
    selectedQRCode,
    selectedCampaign,
    selectQRCode,
    unselectQRCode,
    selectCampaign,
    unselectCampaign,
  }
})