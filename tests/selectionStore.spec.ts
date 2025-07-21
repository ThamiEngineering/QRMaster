import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { useSelectionStore } from '../stores/selection'

describe('selection store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('sélectionne et désélectionne un QR code', () => {
    const store = useSelectionStore()
    expect(store.selectedQRCode).toBeNull()
    store.selectQRCode({ id: 1, user_id: 'u', name: 'Test', type: 'statique', content: 'url', scan_count: 0, created_at: '', campaign_id: null })
    expect(store.selectedQRCode?.id).toBe(1)
    store.unselectQRCode()
    expect(store.selectedQRCode).toBeNull()
  })

  it('sélectionne et désélectionne une campagne', () => {
    const store = useSelectionStore()
    expect(store.selectedCampaign).toBeNull()
    store.selectCampaign({ id: 1, user_id: 'u', name: 'Campagne', description: '', status: 'active', start_date: '', end_date: '', created_at: '', updated_at: '' })
    expect(store.selectedCampaign?.id).toBe(1)
    store.unselectCampaign()
    expect(store.selectedCampaign).toBeNull()
  })
})