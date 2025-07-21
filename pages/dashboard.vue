<script setup lang="ts">
import { useHead } from '#app'
import QRCode from 'qrcode'
import { onMounted, ref, watch } from 'vue'
import AnalyticsSection from '~/components/AnalyticsSection.vue'
import CampaignsSection from '~/components/CampaignsSection.vue'
import HelpSection from '~/components/HelpSection.vue'
import CampaignCreateModal from '~/components/Modal/CampaignCreateModal.vue'
import QRCodeGenerateModal from '~/components/Modal/QRCodeGenerateModal.vue'
import ProfilSection from '~/components/ProfilSection.vue'
import type { Database } from '~/types/supabase'

definePageMeta({
  middleware: 'auth',
})

const supabase = useSupabaseClient()
const router = useRouter()
const user = useSupabaseUser()
const toast = useToast()

useHead({
  title: 'QRMaster - Tableau de bord',
  meta: [
    { name: 'description', content: 'Gérez vos QR codes depuis votre tableau de bord QRMaster.' },
  ],
})

const activeSection = ref('dashboard')
const showGenerateModal = ref(false)
const qrcodes = ref<Database['public']['Tables']['qrcodes']['Row'][]>([])
const campaigns = ref<Database['public']['Tables']['campaigns']['Row'][]>([])
const loadingQRCodes = ref(false)
const loadingCampaigns = ref(false)
const generatedQRCode = ref<string | null>(null)
const isCreatingQRCode = ref(false)
const isCreatingCampaign = ref(false)
const showCreateCampaignModal = ref(false)
const userProfile = ref<Database['public']['Tables']['profiles']['Row'] | null>(null)

async function handleCreateQRCode(qrData: {
  name: string
  type: 'statique' | 'dynamique'
  content: string
  campaign_id: number | null
}) {
  if (!user.value || !qrData.name || !qrData.content) {
    toast.add({
      title: 'Erreur',
      description: 'Veuillez remplir tous les champs.',
      color: 'error',
    })
    return
  }

  isCreatingQRCode.value = true
  generatedQRCode.value = null

  try {
    const { data: newRecord, error: insertError } = await supabase
      .from('qrcodes')
      .insert({
        user_id: user.value.id,
        name: qrData.name,
        type: qrData.type,
        content: qrData.content,
        campaign_id: qrData.campaign_id,
      })
      .select()
      .single()

    if (insertError) throw insertError
    if (!newRecord) {
      throw new Error('Failed to create QR code record.')
    }

    const config = useRuntimeConfig()
    const baseUrl = config.public.baseUrl || window.location.origin
    const trackingUrl = `${baseUrl}/scan/${newRecord.id}`

    generatedQRCode.value = await QRCode.toDataURL(trackingUrl, {
      width: 256,
      margin: 2,
    })

    toast.add({
      title: 'QR Code créé avec succès !',
      description: `Le QR code "${qrData.name}" a été généré.`,
      color: 'success',
      icon: 'i-heroicons-check-circle',
    })

    showGenerateModal.value = false
    activeSection.value = 'my-qrcodes'
    await fetchQrCodes()
  } catch (error) {
    console.error('Error creating QR code:', error)
    toast.add({
      title: 'Erreur lors de la création',
      description: 'Une erreur est survenue lors de la création du QR code.',
      color: 'error',
      icon: 'i-heroicons-exclamation-triangle',
    })
  } finally {
    isCreatingQRCode.value = false
  }
}

async function fetchQrCodes() {
  if (!user.value) return

  loadingQRCodes.value = true
  try {
    const { data, error } = await supabase
      .from('qrcodes')
      .select(
        `
                *,
                campaigns (
                    id,
                    name
                )
            `
      )
      .eq('user_id', user.value.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    qrcodes.value = data
  } catch (error) {
    console.error('Error fetching QR codes:', error)
  } finally {
    loadingQRCodes.value = false
  }
}

async function fetchCampaigns() {
  if (!user.value) return

  loadingCampaigns.value = true
  try {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('user_id', user.value.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    campaigns.value = data
  } catch (error) {
    console.error('Error fetching campaigns:', error)
  } finally {
    loadingCampaigns.value = false
  }
}

async function fetchUserProfile() {
  if (!user.value) return

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.value.id)
      .single()

    if (error) {
      userProfile.value = {
        id: user.value.id,
        first_name: user.value.user_metadata?.first_name || '',
        last_name: user.value.user_metadata?.last_name || '',
        company_name: user.value.user_metadata?.company_name || '',
        created_at: new Date().toISOString(),
      }
    } else {
      userProfile.value = data
    }
  } catch (error) {
    console.error('Error fetching user profile:', error)
    if (user.value) {
      userProfile.value = {
        id: user.value.id,
        first_name: user.value.user_metadata?.first_name || '',
        last_name: user.value.user_metadata?.last_name || '',
        company_name: user.value.user_metadata?.company_name || '',
        created_at: new Date().toISOString(),
      }
    }
  }
}

async function handleCreateCampaign(campaignData: {
  name: string
  description: string
  status: 'active' | 'paused' | 'archived'
  start_date: string
  end_date: string
}) {
  if (!user.value || !campaignData.name) {
    toast.add({
      title: 'Erreur',
      description: 'Veuillez remplir le nom de la campagne.',
      color: 'error',
    })
    return
  }

  isCreatingCampaign.value = true

  try {
    const { data: newRecord, error: insertError } = await supabase
      .from('campaigns')
      .insert({
        user_id: user.value.id,
        name: campaignData.name,
        description: campaignData.description,
        status: campaignData.status,
        start_date: campaignData.start_date || null,
        end_date: campaignData.end_date || null,
      })
      .select()
      .single()

    if (insertError) throw insertError

    toast.add({
      title: 'Campagne créée avec succès !',
      description: `La campagne "${campaignData.name}" a été créée.`,
      color: 'success',
      icon: 'i-heroicons-megaphone',
    })

    showCreateCampaignModal.value = false
    await fetchCampaigns()
  } catch (error) {
    console.error('Error creating campaign:', error)
    toast.add({
      title: 'Erreur lors de la création',
      description: 'Une erreur est survenue lors de la création de la campagne.',
      color: 'error',
      icon: 'i-heroicons-exclamation-triangle',
    })
  } finally {
    isCreatingCampaign.value = false
  }
}

onMounted(() => {
  fetchQrCodes()
  fetchCampaigns()
  fetchUserProfile()
})

const getSectionTitle = (section: string) => {
  const titles: Record<string, string> = {
    'my-qrcodes': 'Mes QR codes',
    analytics: 'Analyses',
    campaigns: 'Campagnes',
    help: "Centre d'aide",
    profile: 'Mon profil',
  }
  return titles[section] || section
}

const getQRCodeCountForCampaign = (campaignId: number) => {
  return qrcodes.value.filter((qr) => qr.campaign_id === campaignId).length
}

const logout = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error('Error logging out:', error)
    return
  }
  await router.push('/')
}

function handleEditQRCode(id: number) {
  fetchQrCodes()
}

function handleDeleteQRCode(id: number) {
  fetchQrCodes()
}

async function handleEditCampaign(
  campaignId: number,
  form: {
    name: string
    description: string | null
    status: 'active' | 'paused' | 'archived'
    start_date: string | null
    end_date: string | null
  }
) {
  if (!user.value) return

  try {
    const { error } = await supabase
      .from('campaigns')
      .update({
        name: form.name,
        description: form.description,
        status: form.status,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
      })
      .eq('id', campaignId)
      .eq('user_id', user.value.id)

    if (error) throw error

    toast.add({
      title: 'Campagne modifiée avec succès !',
      description: `La campagne "${form.name}" a été mise à jour.`,
      color: 'success',
      icon: 'i-heroicons-check-circle',
    })

    await fetchCampaigns()
  } catch (error) {
    console.error('Error editing campaign:', error)
    toast.add({
      title: 'Erreur lors de la modification',
      description: 'Une erreur est survenue lors de la modification de la campagne.',
      color: 'error',
      icon: 'i-heroicons-exclamation-triangle',
    })
  }
}

async function handleDeleteCampaign(campaignId: number) {
  if (!user.value) return

  try {
    const { error } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', campaignId)
      .eq('user_id', user.value.id)

    if (error) throw error

    toast.add({
      title: 'Campagne supprimée avec succès !',
      description: 'La campagne a été définitivement supprimée.',
      color: 'success',
      icon: 'i-heroicons-trash',
    })

    await fetchCampaigns()
  } catch (error) {
    console.error('Error deleting campaign:', error)
    toast.add({
      title: 'Erreur lors de la suppression',
      description: 'Une erreur est survenue lors de la suppression de la campagne.',
      color: 'error',
      icon: 'i-heroicons-exclamation-triangle',
    })
  }
}

watch(activeSection, (newSection, oldSection) => {
  if (oldSection === 'profile' && newSection !== 'profile') {
    fetchUserProfile()
  }
})
</script>

<template>
  <div class="relative min-h-screen bg-black text-white overflow-hidden">
    <div class="absolute inset-0 overflow-hidden pointer-events-none select-none">
      <div
        class="absolute -left-4 top-1/2 -translate-y-1/2 -rotate-180 text-white/[0.03] text-[20rem] font-bold tracking-tighter [writing-mode:vertical-rl] blur-[1px]"
      >
        QRMASTER
      </div>
      <div
        class="absolute -right-4 top-1/2 -translate-y-1/2 -rotate-180 text-white/[0.03] text-[20rem] font-bold tracking-tighter [writing-mode:vertical-rl] blur-[1px]"
      >
        DASHBOARD
      </div>
    </div>

    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        class="absolute top-1/4 left-1/4 w-2 h-2 bg-yellow-400/30 rounded-full animate-pulse"
      />
      <div
        class="absolute top-1/3 right-1/3 w-1 h-1 bg-yellow-400/20 rounded-full animate-ping"
        style="animation-delay: 1s"
      />
      <div
        class="absolute bottom-1/4 left-1/3 w-3 h-3 bg-yellow-400/20 rounded-full animate-pulse"
        style="animation-delay: 2s"
      />
      <div
        class="absolute top-1/2 right-1/4 w-1.5 h-1.5 bg-yellow-400/30 rounded-full animate-ping"
        style="animation-delay: 3s"
      />
    </div>

    <div class="flex flex-col h-screen relative z-10">
      <header class="flex-shrink-0 border-b border-white/10 backdrop-blur-xl bg-black/50">
        <div class="px-6 py-4">
          <div class="flex justify-between items-center">
            <div class="flex items-center gap-3">
              <div class="relative w-10 h-10">
                <div class="absolute inset-0 bg-yellow-400/20 rounded-xl blur-sm"/>
                <div
                  class="relative w-full h-full rounded-xl bg-black border border-yellow-400/20 flex items-center justify-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="w-5 h-5 text-yellow-400"
                  >
                    <rect width="5" height="5" x="3" y="3" rx="1" />
                    <rect width="5" height="5" x="16" y="3" rx="1" />
                    <rect width="5" height="5" x="3" y="16" rx="1" />
                    <path d="m21 16-3.5-3.5-1 1-1.5-1.5" />
                    <path d="m21 21-3.5-3.5-1 1-1.5-1.5" />
                    <path d="M13 13l1.5 1.5L16 13" />
                  </svg>
                </div>
              </div>
              <div class="flex flex-col">
                <span class="text-xl font-bold text-white tracking-tight">QRMaster</span>
                <span class="text-xs text-white/50 font-medium">Dashboard Pro</span>
              </div>
            </div>

            <div class="flex items-center gap-4">
              <button
                class="relative h-10 px-6 group overflow-hidden bg-gradient-to-br from-white/[0.03] via-white/[0.05] to-white/[0.03] backdrop-blur-md border border-white/10 rounded-xl text-white/90 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                @click="showCreateCampaignModal = true"
              >
                <div
                  class="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-full transition-all duration-1000"
                />
                <div class="relative flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="m3 11 18-5v12L3 14v-3z" />
                    <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
                  </svg>
                  <span class="text-sm font-medium">Nouvelle campagne</span>
                </div>
              </button>

              <button
                class="relative h-10 px-6 group overflow-hidden bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 hover:from-yellow-500 hover:via-amber-500 hover:to-orange-500 text-black rounded-xl border border-yellow-400/20 transition-all duration-300"
                @click="showGenerateModal = true"
              >
                <div
                  class="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                />
                <div
                  class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-full transition-all duration-1000"
                />
                <div class="relative flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M5 12h14" />
                    <path d="M12 5v14" />
                  </svg>
                  <span class="text-sm font-semibold">Nouveau QR code</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div class="flex flex-1 overflow-hidden">
        <aside
          class="w-80 border-r border-white/10 backdrop-blur-xl bg-black/50 flex flex-col overflow-y-auto"
        >
          <nav class="flex-1 p-6">
            <ul class="space-y-3">
              <li>
                <button
                  :class="[
                    'w-full text-left px-4 py-3 rounded-xl flex items-center space-x-3 transition-all duration-300 group relative overflow-hidden',
                    activeSection === 'dashboard'
                      ? 'bg-gradient-to-r from-yellow-400/10 to-amber-400/10 text-yellow-400 border border-yellow-400/20'
                      : 'text-white/70 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10',
                  ]"
                  @click="activeSection = 'dashboard'"
                >
                  <div
                    v-if="activeSection === 'dashboard'"
                    class="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/5 to-transparent opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-full transition-all duration-1000"
                  />
                  <div class="relative flex items-center space-x-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      <polyline points="9,22 9,12 15,12 15,22" />
                    </svg>
                    <span class="font-medium">Tableau de bord</span>
                  </div>
                </button>
              </li>
              <li>
                <button
                  :class="[
                    'w-full text-left px-4 py-3 rounded-xl flex items-center space-x-3 transition-all duration-300 group relative overflow-hidden',
                    activeSection === 'my-qrcodes'
                      ? 'bg-gradient-to-r from-yellow-400/10 to-amber-400/10 text-yellow-400 border border-yellow-400/20'
                      : 'text-white/70 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10',
                  ]"
                  @click="activeSection = 'my-qrcodes'"
                >
                  <div
                    v-if="activeSection === 'my-qrcodes'"
                    class="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/5 to-transparent opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-full transition-all duration-1000"
                  />
                  <div class="relative flex items-center space-x-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <rect width="5" height="5" x="3" y="3" rx="1" />
                      <rect width="5" height="5" x="16" y="3" rx="1" />
                      <rect width="5" height="5" x="3" y="16" rx="1" />
                      <path d="m21 16-3.5-3.5-1 1-1.5-1.5" />
                      <path d="m21 21-3.5-3.5-1 1-1.5-1.5" />
                      <path d="M13 13l1.5 1.5L16 13" />
                    </svg>
                    <span class="font-medium">Mes QR codes</span>
                  </div>
                </button>
              </li>
              <li>
                <button
                  :class="[
                    'w-full text-left px-4 py-3 rounded-xl flex items-center space-x-3 transition-all duration-300 group relative overflow-hidden',
                    activeSection === 'analytics'
                      ? 'bg-gradient-to-r from-yellow-400/10 to-amber-400/10 text-yellow-400 border border-yellow-400/20'
                      : 'text-white/70 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10',
                  ]"
                  @click="activeSection = 'analytics'"
                >
                  <div
                    v-if="activeSection === 'analytics'"
                    class="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/5 to-transparent opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-full transition-all duration-1000"
                  />
                  <div class="relative flex items-center space-x-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path d="M3 3v18h18" />
                      <path d="m19 9-5 5-4-4-3 3" />
                    </svg>
                    <span class="font-medium">Analyses</span>
                  </div>
                </button>
              </li>
              <li>
                <button
                  :class="[
                    'w-full text-left px-4 py-3 rounded-xl flex items-center space-x-3 transition-all duration-300 group relative overflow-hidden',
                    activeSection === 'campaigns'
                      ? 'bg-gradient-to-r from-yellow-400/10 to-amber-400/10 text-yellow-400 border border-yellow-400/20'
                      : 'text-white/70 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10',
                  ]"
                  @click="activeSection = 'campaigns'"
                >
                  <div
                    v-if="activeSection === 'campaigns'"
                    class="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/5 to-transparent opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-full transition-all duration-1000"
                  />
                  <div class="relative flex items-center space-x-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path d="m3 11 18-5v12L3 14v-3z" />
                      <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
                    </svg>
                    <span class="font-medium">Campagnes</span>
                  </div>
                </button>
              </li>
            </ul>
          </nav>

          <div class="p-6 border-t border-white/10">
            <button
              v-if="user"
              :class="[
                'w-full flex items-center space-x-3 p-4 rounded-xl transition-all duration-300 group relative overflow-hidden',
                activeSection === 'profile'
                  ? 'bg-gradient-to-r from-yellow-400/10 to-amber-400/10 text-yellow-400 border border-yellow-400/20'
                  : 'text-white/70 hover:text-white hover:bg-white/5 border border-white/10 hover:border-white/20',
              ]"
              @click="activeSection = 'profile'"
            >
              <div
                v-if="activeSection === 'profile'"
                class="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/5 to-transparent opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-full transition-all duration-1000"
              />
              <div class="relative flex items-center space-x-3 w-full">
                <div
                  class="w-10 h-10 bg-gradient-to-r from-yellow-400/20 to-amber-400/20 rounded-full flex items-center justify-center border border-yellow-400/20"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="text-yellow-400"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <div class="flex-1 text-left">
                  <p class="text-sm font-medium">
                    {{ userProfile?.first_name || user.user_metadata?.first_name || 'Utilisateur' }}
                  </p>
                  <p class="text-xs text-white/50">
                    {{ userProfile?.company_name || 'Mon profil' }}
                  </p>
                </div>
              </div>
            </button>

            <button
              class="w-full flex items-center space-x-3 mt-4 px-4 py-3 rounded-xl text-white/70 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-300 group"
              @click="logout"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16,17 21,12 16,7" />
                <line x1="21" x2="9" y1="12" y2="12" />
              </svg>
              <span class="font-medium">Déconnexion</span>
            </button>
          </div>
        </aside>

        <main class="flex-1 overflow-y-auto">
          <div v-if="activeSection === 'dashboard'" class="p-8">
            <div class="mb-12">
              <div
                class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-400/10 border border-yellow-400/20 mb-6 backdrop-blur-sm"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="text-yellow-400"
                >
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                </svg>
                <span class="text-sm font-medium text-yellow-400">Dashboard Pro</span>
              </div>

              <h1 class="text-4xl font-bold text-white mb-4 tracking-tight">
                Bienvenue
                {{ userProfile?.first_name || user.user_metadata?.first_name || 'utilisateur' }}
              </h1>
              <p class="text-xl text-white/60 leading-relaxed">
                Découvrez le meilleur de QRMaster avec des outils de nouvelle génération
              </p>
            </div>

            <div
              class="group relative mb-12 p-8 rounded-2xl overflow-hidden bg-gradient-to-r from-yellow-400/10 via-amber-400/10 to-orange-400/10 backdrop-blur-md border border-yellow-400/20 hover:border-yellow-400/30 transition-all duration-500"
            >
              <div
                class="absolute inset-0 bg-gradient-to-br opacity-20 from-yellow-500/20 via-amber-500/20 to-orange-500/20"
              />
              <div
                class="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/5 to-transparent opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-full transition-all duration-1000"
              />

              <div class="relative">
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <h2 class="text-2xl font-bold text-white mb-4">
                      QRMaster vous propose des solutions rapides pour tous vos projets
                    </h2>
                    <p class="text-white/80 mb-8 text-lg">
                      De la création jusqu'à l'analyse des performances en temps réel avec des
                      outils d'intelligence artificielle intégrés.
                    </p>

                    <button
                      class="relative h-12 px-8 group overflow-hidden bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 hover:from-yellow-500 hover:via-amber-500 hover:to-orange-500 text-black rounded-xl border border-yellow-400/20 shadow-lg hover:shadow-yellow-400/25 transition-all duration-500 ease-out"
                      @click="showGenerateModal = true"
                    >
                      <div
                        class="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      />
                      <div
                        class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-full transition-all duration-1000"
                      />
                      <div class="relative flex items-center justify-center gap-3">
                        <span class="font-semibold">Commencer maintenant</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          class="transition-transform group-hover:translate-x-1"
                        >
                          <path d="m9 18 6-6-6-6" />
                        </svg>
                      </div>
                    </button>
                  </div>

                  <div class="relative w-64 h-32 hidden lg:block">
                    <div
                      class="absolute top-4 right-8 w-16 h-16 bg-yellow-400/20 rounded-full animate-pulse"
                    />
                    <div
                      class="absolute bottom-8 right-16 w-10 h-10 bg-yellow-400/30 rounded-full animate-pulse"
                      style="animation-delay: 1s"
                    />
                    <div
                      class="absolute top-12 right-24 w-6 h-6 bg-yellow-400/40 rounded-full animate-pulse"
                      style="animation-delay: 2s"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div
                class="group relative p-6 rounded-2xl overflow-hidden bg-gradient-to-br from-white/[0.03] via-white/[0.05] to-white/[0.03] backdrop-blur-md border border-white/10 hover:border-white/20 shadow-lg hover:shadow-white/10 transition-all duration-500 cursor-pointer"
                @click="showGenerateModal = true"
              >
                <div
                  class="absolute inset-0 bg-gradient-to-br opacity-20 from-yellow-500/10 via-amber-500/10 to-orange-500/10"
                />
                <div
                  class="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-full transition-all duration-1000"
                />
                <div class="relative">
                  <div
                    class="w-12 h-12 bg-yellow-400/10 border border-yellow-400/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-yellow-400/20 group-hover:border-yellow-400/30 transition-all duration-300"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="text-yellow-400"
                    >
                      <rect width="5" height="5" x="3" y="3" rx="1" />
                      <rect width="5" height="5" x="16" y="3" rx="1" />
                      <rect width="5" height="5" x="3" y="16" rx="1" />
                      <path d="m21 16-3.5-3.5-1 1-1.5-1.5" />
                      <path d="m21 21-3.5-3.5-1 1-1.5-1.5" />
                      <path d="M13 13l1.5 1.5L16 13" />
                    </svg>
                  </div>
                  <h3
                    class="font-semibold text-white mb-2 group-hover:text-yellow-400 transition-colors"
                  >
                    Créer un QR Code
                  </h3>
                  <p class="text-white/60 text-sm mb-4">
                    Générez rapidement vos QR codes personnalisés avec tracking avancé
                  </p>
                  <div
                    class="flex items-center text-yellow-400 font-medium text-sm group-hover:gap-2 transition-all"
                  >
                    <span>Commencer</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="transition-transform group-hover:translate-x-1"
                    >
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </div>
                </div>
              </div>

              <div
                class="group relative p-6 rounded-2xl overflow-hidden bg-gradient-to-br from-white/[0.03] via-white/[0.05] to-white/[0.03] backdrop-blur-md border border-white/10 hover:border-white/20 shadow-lg hover:shadow-white/10 transition-all duration-500 cursor-pointer"
                @click="activeSection = 'analytics'"
              >
                <div
                  class="absolute inset-0 bg-gradient-to-br opacity-20 from-blue-500/10 via-indigo-500/10 to-purple-500/10"
                />
                <div
                  class="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-full transition-all duration-1000"
                />
                <div class="relative">
                  <div
                    class="w-12 h-12 bg-blue-400/10 border border-blue-400/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-400/20 group-hover:border-blue-400/30 transition-all duration-300"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="text-blue-400"
                    >
                      <path d="M3 3v18h18" />
                      <path d="m19 9-5 5-4-4-3 3" />
                    </svg>
                  </div>
                  <h3
                    class="font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors"
                  >
                    Analyser les performances
                  </h3>
                  <p class="text-white/60 text-sm mb-4">
                    Suivez les scans et l'engagement en temps réel avec IA
                  </p>
                  <div
                    class="flex items-center text-blue-400 font-medium text-sm group-hover:gap-2 transition-all"
                  >
                    <span>Voir les stats</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="transition-transform group-hover:translate-x-1"
                    >
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </div>
                </div>
              </div>

              <div
                class="group relative p-6 rounded-2xl overflow-hidden bg-gradient-to-br from-white/[0.03] via-white/[0.05] to-white/[0.03] backdrop-blur-md border border-white/10 hover:border-white/20 shadow-lg hover:shadow-white/10 transition-all duration-500 cursor-pointer"
                @click="activeSection = 'campaigns'"
              >
                <div
                  class="absolute inset-0 bg-gradient-to-br opacity-20 from-green-500/10 via-emerald-500/10 to-teal-500/10"
                />
                <div
                  class="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-full transition-all duration-1000"
                />
                <div class="relative">
                  <div
                    class="w-12 h-12 bg-green-400/10 border border-green-400/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green-400/20 group-hover:border-green-400/30 transition-all duration-300"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="text-green-400"
                    >
                      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                    </svg>
                  </div>
                  <h3
                    class="font-semibold text-white mb-2 group-hover:text-green-400 transition-colors"
                  >
                    Gérer vos campagnes
                  </h3>
                  <p class="text-white/60 text-sm mb-4">
                    Organisez et optimisez vos campagnes QR avec IA
                  </p>
                  <div
                    class="flex items-center text-green-400 font-medium text-sm group-hover:gap-2 transition-all"
                  >
                    <span>Gérer</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="transition-transform group-hover:translate-x-1"
                    >
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else-if="activeSection === 'my-qrcodes'" class="p-8">
            <div class="mb-8">
              <div
                class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-400/10 border border-yellow-400/20 mb-6 backdrop-blur-sm"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="text-yellow-400"
                >
                  <rect width="5" height="5" x="3" y="3" rx="1" />
                  <rect width="5" height="5" x="16" y="3" rx="1" />
                  <rect width="5" height="5" x="3" y="16" rx="1" />
                  <path d="m21 16-3.5-3.5-1 1-1.5-1.5" />
                  <path d="m21 21-3.5-3.5-1 1-1.5-1.5" />
                  <path d="M13 13l1.5 1.5L16 13" />
                </svg>
                <span class="text-sm font-medium text-yellow-400">QR Codes Collection</span>
              </div>
              <h1 class="text-4xl font-bold text-white mb-4 tracking-tight">Mes QR codes</h1>
              <p class="text-white/60 text-lg">
                Gérez et analysez tous vos QR codes en un seul endroit
              </p>
            </div>

            <div v-if="loadingQRCodes" class="flex items-center justify-center py-20">
              <div class="flex items-center gap-4">
                <div
                  class="animate-spin rounded-full h-8 w-8 border-2 border-yellow-400 border-t-transparent"
                />
                <span class="text-white/60">Chargement des QR codes...</span>
              </div>
            </div>

            <div
              v-else-if="qrcodes.length === 0"
              class="flex flex-col items-center justify-center py-20"
            >
              <div class="relative mb-8">
                <div
                  class="w-24 h-24 bg-yellow-400/10 border border-yellow-400/20 rounded-2xl flex items-center justify-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="text-yellow-400"
                  >
                    <rect width="5" height="5" x="3" y="3" rx="1" />
                    <rect width="5" height="5" x="16" y="3" rx="1" />
                    <rect width="5" height="5" x="3" y="16" rx="1" />
                    <path d="m21 16-3.5-3.5-1 1-1.5-1.5" />
                    <path d="m21 21-3.5-3.5-1 1-1.5-1.5" />
                    <path d="M13 13l1.5 1.5L16 13" />
                  </svg>
                </div>
                <div
                  class="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400/20 rounded-full animate-pulse"
                />
              </div>
              <h3 class="text-2xl font-bold text-white mb-4">Aucun QR code créé</h3>
              <p class="text-white/60 mb-8 text-center max-w-md">
                Commencez par créer votre premier QR code et découvrez la puissance de QRMaster
              </p>
              <button
                class="relative h-12 px-8 group overflow-hidden bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 hover:from-yellow-500 hover:via-amber-500 hover:to-orange-500 text-black rounded-xl border border-yellow-400/20 shadow-lg hover:shadow-yellow-400/25 transition-all duration-500 ease-out"
                @click="showGenerateModal = true"
              >
                <div
                  class="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                />
                <div
                  class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-full transition-all duration-1000"
                />
                <div class="relative flex items-center justify-center gap-3">
                  <span class="font-semibold">Créer mon premier QR code</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="transition-transform group-hover:translate-x-1"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </div>
              </button>
            </div>

            <QRCodeSection
              v-else
              :qrcodes="qrcodes"
              :campaigns="campaigns"
              @edit="handleEditQRCode"
              @delete="handleDeleteQRCode"
            />
          </div>

          <div v-else-if="activeSection === 'campaigns'" class="p-8">
            <div class="mb-8">
              <div
                class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-400/10 border border-green-400/20 mb-6 backdrop-blur-sm"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="text-green-400"
                >
                  <path d="m3 11 18-5v12L3 14v-3z" />
                  <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
                </svg>
                <span class="text-sm font-medium text-green-400">Campaign Manager</span>
              </div>
              <h1 class="text-4xl font-bold text-white mb-4 tracking-tight">Mes Campagnes</h1>
              <p class="text-white/60 text-lg">Organisez et optimisez vos campagnes marketing QR</p>
            </div>

            <CampaignsSection
              :campaigns="campaigns"
              :qrcodes="qrcodes"
              :loading-campaigns="loadingCampaigns"
              @edit-campaign="handleEditCampaign"
              @delete-campaign="handleDeleteCampaign"
            />
          </div>

          <div v-else-if="activeSection === 'analytics'" class="p-8">
            <div class="mb-8">
              <div
                class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-400/10 border border-blue-400/20 mb-6 backdrop-blur-sm"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="text-blue-400"
                >
                  <path d="M3 3v18h18" />
                  <path d="m19 9-5 5-4-4-3 3" />
                </svg>
                <span class="text-sm font-medium text-blue-400">Analytics Pro</span>
              </div>
              <h1 class="text-4xl font-bold text-white mb-4 tracking-tight">Analyses</h1>
              <p class="text-white/60 text-lg">
                Suivez les performances de vos QR codes en temps réel
              </p>
            </div>

            <AnalyticsSection :qrcodes="qrcodes" :campaigns="campaigns" />
          </div>

          <div v-else-if="activeSection === 'help'" class="p-8">
            <div class="mb-8">
              <div
                class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-400/10 border border-purple-400/20 mb-6 backdrop-blur-sm"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="text-purple-400"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <path d="M12 17h.01" />
                </svg>
                <span class="text-sm font-medium text-purple-400">Support Center</span>
              </div>
              <h1 class="text-4xl font-bold text-white mb-4 tracking-tight">Centre d'aide</h1>
              <p class="text-white/60 text-lg">Trouvez des réponses à toutes vos questions</p>
            </div>

            <HelpSection />
          </div>

          <div v-else-if="activeSection === 'profile'" class="p-8">
            <div class="mb-8">
              <div
                class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-400/10 border border-indigo-400/20 mb-6 backdrop-blur-sm"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="text-indigo-400"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <span class="text-sm font-medium text-indigo-400">Mon Profil</span>
              </div>
              <h1 class="text-4xl font-bold text-white mb-4 tracking-tight">Profil utilisateur</h1>
              <p class="text-white/60 text-lg">
                Gérez vos informations personnelles et préférences
              </p>
            </div>

            <ProfilSection />
          </div>

          <div v-else class="p-8">
            <div class="mb-8">
              <div
                class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-400/10 border border-gray-400/20 mb-6 backdrop-blur-sm"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="text-gray-400"
                >
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                </svg>
                <span class="text-sm font-medium text-gray-400">En développement</span>
              </div>
              <h1 class="text-4xl font-bold text-white mb-4 tracking-tight">
                {{ getSectionTitle(activeSection) }}
              </h1>
              <p class="text-white/60 text-lg mb-8">Cette section sera bientôt disponible</p>
            </div>

            <div
              class="group relative p-12 rounded-2xl overflow-hidden bg-gradient-to-br from-white/[0.03] via-white/[0.05] to-white/[0.03] backdrop-blur-md border border-white/10 text-center"
            >
              <div
                class="absolute inset-0 bg-gradient-to-br opacity-20 from-gray-500/10 via-slate-500/10 to-zinc-500/10"
              />
              <div class="relative">
                <div
                  class="w-16 h-16 bg-gray-400/10 border border-gray-400/20 rounded-2xl flex items-center justify-center mx-auto mb-6"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="text-gray-400"
                  >
                    <path
                      d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
                    />
                    <circle cx="12" cy="12" r="4" />
                  </svg>
                </div>
                <h3 class="text-xl font-semibold text-white mb-4">
                  Fonctionnalité en développement
                </h3>
                <p class="text-white/60 max-w-md mx-auto">
                  Notre équipe travaille activement sur cette section. Elle sera disponible dans une
                  prochaine mise à jour.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>

      <QRCodeGenerateModal
        :is-open="showGenerateModal"
        :campaigns="campaigns"
        :is-creating="isCreatingQRCode"
        :generated-q-r-code="generatedQRCode"
        @update:is-open="showGenerateModal = $event"
        @create="handleCreateQRCode"
        @reset="generatedQRCode = null"
      />
      <CampaignCreateModal
        :is-open="showCreateCampaignModal"
        :is-creating="isCreatingCampaign"
        @update:is-open="showCreateCampaignModal = $event"
        @create="handleCreateCampaign"
        @reset="() => {}"
      />
    </div>
  </div>
</template>

<style scoped>
aside {
  scrollbar-width: thin;
  scrollbar-color: #e5e7eb transparent;
}

aside::-webkit-scrollbar {
  width: 6px;
}

aside::-webkit-scrollbar-track {
  background: transparent;
}

aside::-webkit-scrollbar-thumb {
  background-color: #e5e7eb;
  border-radius: 3px;
}
</style>
