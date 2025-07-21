<script setup lang="ts">
import CampaignAnalyticsModal from '~/components/Modal/CampaignAnalyticsModal.vue'
import CampaignDeleteModal from '~/components/Modal/CampaignDeleteModal.vue'
import CampaignEditModal from '~/components/Modal/CampaignEditModal.vue'
import { useSelectionStore } from '~/stores/selection'
import type { Database } from '~/types/supabase'

interface Props {
  campaigns: Database['public']['Tables']['campaigns']['Row'][]
  qrcodes: Database['public']['Tables']['qrcodes']['Row'][]
  loadingCampaigns: boolean
}

interface EditForm {
  name: string
  description: string | null
  status: 'active' | 'paused' | 'archived'
  start_date: string | null
  end_date: string | null
}

interface Emits {
  (e: 'editCampaign', campaignId: number, form: EditForm): void
  (e: 'deleteCampaign', campaignId: number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const isEditModalOpen = ref(false)
const isEditing = ref(false)

const isDeleteModalOpen = ref(false)
const isDeleting = ref(false)

const isAnalyticsModalOpen = ref(false)

const selection = useSelectionStore()

const getQRCodeCountForCampaign = (campaignId: number) => {
  return props.qrcodes.filter((qr) => qr.campaign_id === campaignId).length
}

const openEditModal = (campaign: Database['public']['Tables']['campaigns']['Row']) => {
  selection.selectCampaign(campaign)
  isEditModalOpen.value = true
}

const handleEditCampaign = async (form: EditForm) => {
  if (!selection.selectedCampaign) return

  isEditing.value = true
  try {
    emit('editCampaign', selection.selectedCampaign.id, form)
    isEditModalOpen.value = false
    selection.unselectCampaign()
  } finally {
    isEditing.value = false
  }
}

const openDeleteModal = (campaign: Database['public']['Tables']['campaigns']['Row']) => {
  selection.selectCampaign(campaign)
  isDeleteModalOpen.value = true
}

const handleDeleteCampaign = async () => {
  if (!selection.selectedCampaign) return

  isDeleting.value = true
  try {
    emit('deleteCampaign', selection.selectedCampaign.id)
    isDeleteModalOpen.value = false
    selection.unselectCampaign()
  } finally {
    isDeleting.value = false
  }
}

const openAnalyticsModal = (campaign: Database['public']['Tables']['campaigns']['Row']) => {
  selection.selectCampaign(campaign)
  isAnalyticsModalOpen.value = true
}
</script>
<template>
  <div class="space-y-8">

    <div v-if="campaigns.length > 0" class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
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
              <p class="text-2xl font-bold text-white">{{ campaigns.reduce((sum, campaign) => sum + qrcodes.filter(qr => qr.campaign_id === campaign.id).reduce((qrSum, qr) => qrSum + (qr.scan_count || 0), 0), 0) }}</p>
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
                <path d="m3 11 18-5v12L3 14v-3z"/>
                <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>
              </svg>
            </div>
            <div>
              <p class="text-2xl font-bold text-white">{{ campaigns.filter(c => c.status === 'active').length }}</p>
              <p class="text-sm text-white/60">Campagnes actives</p>
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
                <rect width="5" height="5" x="3" y="3" rx="1"/>
                <rect width="5" height="5" x="16" y="3" rx="1"/>
                <rect width="5" height="5" x="3" y="16" rx="1"/>
                <path d="m21 16-3.5-3.5-1 1-1.5-1.5"/>
                <path d="m21 21-3.5-3.5-1 1-1.5-1.5"/>
                <path d="M13 13l1.5 1.5L16 13"/>
              </svg>
            </div>
            <div>
              <p class="text-2xl font-bold text-white">{{ campaigns.reduce((sum, campaign) => sum + getQRCodeCountForCampaign(campaign.id), 0) }}</p>
              <p class="text-sm text-white/60">QR codes associés</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="loadingCampaigns" class="flex items-center justify-center py-20">
      <div class="flex items-center gap-4">
        <div class="animate-spin rounded-full h-8 w-8 border-2 border-green-400 border-t-transparent"></div>
        <span class="text-white/60">Chargement des campagnes...</span>
      </div>
    </div>

    <div v-else-if="campaigns.length === 0" class="flex flex-col items-center justify-center py-20">
      <div class="relative mb-8">
        <div class="w-24 h-24 bg-green-400/10 border border-green-400/20 rounded-2xl flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-green-400">
            <path d="m3 11 18-5v12L3 14v-3z"/>
            <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>
          </svg>
        </div>
        <div class="absolute -top-2 -right-2 w-6 h-6 bg-green-400/20 rounded-full animate-pulse"></div>
      </div>
      <h3 class="text-2xl font-bold text-white mb-4">Aucune campagne créée</h3>
      <p class="text-white/60 mb-8 text-center max-w-md">Créez votre première campagne pour organiser et structurer vos QR codes par thématique ou objectif.</p>
      <div class="p-4 rounded-xl bg-gradient-to-r from-green-400/5 to-emerald-400/5 border border-green-400/20 max-w-md">
        <p class="text-sm text-green-400 text-center">💡 Utilisez le bouton "Nouvelle campagne" dans le header pour commencer</p>
      </div>
    </div>
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="campaign in campaigns" :key="campaign.id" class="group relative rounded-2xl overflow-hidden bg-gradient-to-br from-white/[0.03] via-white/[0.05] to-white/[0.03] backdrop-blur-md border border-white/10 hover:border-white/20 shadow-lg hover:shadow-white/10 transition-all duration-500 ease-out">

        <div class="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-20 transition-opacity duration-500" :class="{
                    'from-green-500/20 via-emerald-500/20 to-teal-500/20': campaign.status === 'active',
                    'from-yellow-500/20 via-amber-500/20 to-orange-500/20': campaign.status === 'paused',
                    'from-gray-500/20 via-slate-500/20 to-zinc-500/20': campaign.status === 'archived'
                }"></div>

        <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-full transition-all duration-1000"></div>

        <div class="relative p-6 flex flex-col h-full">
          <div class="flex items-start justify-between mb-6">
            <div class="flex-1">
              <h3 class="font-bold text-xl text-white group-hover:text-green-400 transition-colors duration-300 line-clamp-2 mb-2">
                {{ campaign.name }}
              </h3>
              <p v-if="campaign.description" class="text-sm text-white/60 line-clamp-3">
                {{ campaign.description }}
              </p>
            </div>

            <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ml-4 flex-shrink-0" :class="{
                            'bg-green-400/10 text-green-400 border-green-400/30': campaign.status === 'active',
                            'bg-yellow-400/10 text-yellow-400 border-yellow-400/30': campaign.status === 'paused',
                            'bg-gray-400/10 text-gray-400 border-gray-400/30': campaign.status === 'archived'
                        }">
                            <div class="w-2 h-2 rounded-full mr-2" :class="{
                                'bg-green-400': campaign.status === 'active',
                                'bg-yellow-400': campaign.status === 'paused',
                                'bg-gray-400': campaign.status === 'archived'
                            }"></div>
                            <span v-if="campaign.status === 'active'">Active</span>
                            <span v-else-if="campaign.status === 'paused'">En pause</span>
                            <span v-else>Archivée</span>
                        </span>
          </div>

          <div class="flex-grow space-y-4">
            <div class="space-y-3 text-sm text-white/60">
              <div v-if="campaign.start_date" class="flex items-center gap-3">
                <div class="w-5 h-5 rounded-lg bg-blue-400/10 border border-blue-400/20 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-400">
                    <path d="M8 2v4"/>
                    <path d="M16 2v4"/>
                    <rect width="18" height="18" x="3" y="4" rx="2"/>
                    <path d="M3 10h18"/>
                  </svg>
                </div>
                <span>Début : {{ new Date(campaign.start_date).toLocaleDateString('fr-FR') }}</span>
              </div>

              <div v-if="campaign.end_date" class="flex items-center gap-3">
                <div class="w-5 h-5 rounded-lg bg-red-400/10 border border-red-400/20 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-red-400">
                    <path d="M8 2v4"/>
                    <path d="M16 2v4"/>
                    <rect width="18" height="18" x="3" y="4" rx="2"/>
                    <path d="M3 10h18"/>
                    <path d="m9 16 2 2 4-4"/>
                  </svg>
                </div>
                <span>Fin : {{ new Date(campaign.end_date).toLocaleDateString('fr-FR') }}</span>
              </div>

              <div class="flex items-center gap-3">
                <div class="w-5 h-5 rounded-lg bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-yellow-400">
                    <rect width="5" height="5" x="3" y="3" rx="1"/>
                    <rect width="5" height="5" x="16" y="3" rx="1"/>
                    <rect width="5" height="5" x="3" y="16" rx="1"/>
                    <path d="m21 16-3.5-3.5-1 1-1.5-1.5"/>
                    <path d="m21 21-3.5-3.5-1 1-1.5-1.5"/>
                    <path d="M13 13l1.5 1.5L16 13"/>
                  </svg>
                </div>
                <span class="font-medium text-white/90">{{ getQRCodeCountForCampaign(campaign.id) }} QR code{{ getQRCodeCountForCampaign(campaign.id) > 1 ? 's' : '' }}</span>
              </div>
            </div>

            <div class="p-4 rounded-xl bg-white/5 border border-white/10">
              <div class="flex items-center justify-between">
                <div class="text-center">
                  <p class="text-2xl font-bold text-white">{{ qrcodes.filter(qr => qr.campaign_id === campaign.id).reduce((sum, qr) => sum + (qr.scan_count || 0), 0) }}</p>
                  <p class="text-xs text-white/50">Total scans</p>
                </div>
                <div class="w-px h-10 bg-white/10"></div>
                <div class="text-center">
                  <p class="text-2xl font-bold text-white">{{ qrcodes.filter(qr => qr.campaign_id === campaign.id && qr.type === 'dynamique').length }}</p>
                  <p class="text-xs text-white/50">QR dynamiques</p>
                </div>
                <div class="w-px h-10 bg-white/10"></div>
                <div class="text-center">
                  <p class="text-2xl font-bold text-white">{{ getQRCodeCountForCampaign(campaign.id) > 0 ? Math.round(qrcodes.filter(qr => qr.campaign_id === campaign.id).reduce((sum, qr) => sum + (qr.scan_count || 0), 0) / getQRCodeCountForCampaign(campaign.id)) : 0 }}</p>
                  <p class="text-xs text-white/50">Moy. par QR</p>
                </div>
              </div>
            </div>
          </div>

          <div class="flex gap-2 mt-6 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
            <button @click="openAnalyticsModal(campaign)" class="flex-1 relative overflow-hidden bg-gradient-to-r from-blue-400/20 to-indigo-400/20 border border-blue-400/30 text-blue-400 text-xs font-medium py-2.5 px-3 rounded-xl hover:from-blue-400/30 hover:to-indigo-400/30 hover:border-blue-400/40 transition-all duration-300 group/btn">
              <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover/btn:opacity-100 -translate-x-full group-hover/btn:translate-x-full transition-all duration-700"></div>
              <div class="relative flex items-center justify-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 3v18h18"/>
                  <path d="m19 9-5 5-4-4-3 3"/>
                </svg>
                <span class="hidden sm:inline">Analytics</span>
              </div>
            </button>

            <button @click="openEditModal(campaign)" class="flex-1 relative overflow-hidden bg-gradient-to-r from-green-400/20 to-emerald-400/20 border border-green-400/30 text-green-400 text-xs font-medium py-2.5 px-3 rounded-xl hover:from-green-400/30 hover:to-emerald-400/30 hover:border-green-400/40 transition-all duration-300 group/btn">
              <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover/btn:opacity-100 -translate-x-full group-hover/btn:translate-x-full transition-all duration-700"></div>
              <div class="relative flex items-center justify-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                  <path d="m15 5 4 4"/>
                </svg>
                <span class="hidden sm:inline">Modifier</span>
              </div>
            </button>

            <button @click="openDeleteModal(campaign)" class="relative overflow-hidden bg-gradient-to-r from-red-400/20 to-rose-400/20 border border-red-400/30 text-red-400 text-xs font-medium py-2.5 px-3 rounded-xl hover:from-red-400/30 hover:to-rose-400/30 hover:border-red-400/40 transition-all duration-300 group/btn">
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

    <CampaignEditModal
        v-model:is-open="isEditModalOpen"
        :selected-campaign="selection.selectedCampaign"
        :is-editing="isEditing"
        @edit="handleEditCampaign"
    />

    <CampaignDeleteModal
        v-model:is-open="isDeleteModalOpen"
        :selected-campaign="selection.selectedCampaign"
        :is-deleting="isDeleting"
        @confirm-delete="handleDeleteCampaign"
    />

    <CampaignAnalyticsModal
        v-model:is-open="isAnalyticsModalOpen"
        :selected-campaign="selection.selectedCampaign"
        :qrcodes="qrcodes"
    />
  </div>
</template>
