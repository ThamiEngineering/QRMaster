<script setup lang="ts">
import { useHead } from '#app';
import QRCode from 'qrcode';
import { onMounted, ref, watch } from 'vue';
import AnalyticsSection from '~/components/AnalyticsSection.vue';
import CampaignsSection from '~/components/CampaignsSection.vue';
import HelpSection from '~/components/HelpSection.vue';
import CampaignCreateModal from '~/components/Modal/CampaignCreateModal.vue';
import QRCodeGenerateModal from '~/components/Modal/QRCodeGenerateModal.vue';
import ProfilSection from '~/components/ProfilSection.vue';
import type { Database } from '~/types/supabase';

definePageMeta({
    middleware: 'auth'
})

const supabase = useSupabaseClient()
const router = useRouter()
const user = useSupabaseUser()
const toast = useToast()

useHead({
    title: 'QRMaster - Tableau de bord',
    meta: [
        { name: 'description', content: 'Gérez vos QR codes depuis votre tableau de bord QRMaster.' }
    ]
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

async function handleCreateQRCode(qrData: { name: string, type: 'statique' | 'dynamique', content: string, campaign_id: number | null }) {
    if (!user.value || !qrData.name || !qrData.content) {
        toast.add({
            title: 'Erreur',
            description: 'Veuillez remplir tous les champs.',
            color: 'error'
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
                campaign_id: qrData.campaign_id
            })
            .select()
            .single()

        if (insertError) throw insertError
        if (!newRecord) {
            throw new Error("Failed to create QR code record.")
        }

        const config = useRuntimeConfig()
        const baseUrl = config.public.baseUrl || window.location.origin
        const trackingUrl = `${baseUrl}/scan/${newRecord.id}`

        generatedQRCode.value = await QRCode.toDataURL(trackingUrl, {
            width: 256,
            margin: 2
        })

        toast.add({
            title: 'QR Code créé avec succès !',
            description: `Le QR code "${qrData.name}" a été généré.`,
            color: 'success',
            icon: 'i-heroicons-check-circle'
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
            icon: 'i-heroicons-exclamation-triangle'
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
            .select(`
                *,
                campaigns (
                    id,
                    name
                )
            `)
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
                created_at: new Date().toISOString()
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
                created_at: new Date().toISOString()
            }
        }
    }
}

async function handleCreateCampaign(campaignData: { name: string, description: string, status: 'active' | 'paused' | 'archived', start_date: string, end_date: string }) {
    if (!user.value || !campaignData.name) {
        toast.add({
            title: 'Erreur',
            description: 'Veuillez remplir le nom de la campagne.',
            color: 'error'
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
                end_date: campaignData.end_date || null
            })
            .select()
            .single()

        if (insertError) throw insertError

        toast.add({
            title: 'Campagne créée avec succès !',
            description: `La campagne "${campaignData.name}" a été créée.`,
            color: 'success',
            icon: 'i-heroicons-megaphone'
        })

        showCreateCampaignModal.value = false
        await fetchCampaigns()

    } catch (error) {
        console.error('Error creating campaign:', error)
        toast.add({
            title: 'Erreur lors de la création',
            description: 'Une erreur est survenue lors de la création de la campagne.',
            color: 'error',
            icon: 'i-heroicons-exclamation-triangle'
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
        'analytics': 'Analyses',
        'campaigns': 'Campagnes',
        'help': 'Centre d\'aide',
        'profile': 'Mon profil',
    }
    return titles[section] || section
}

const getQRCodeCountForCampaign = (campaignId: number) => {
    return qrcodes.value.filter(qr => qr.campaign_id === campaignId).length
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

watch(activeSection, (newSection, oldSection) => {
    if (oldSection === 'profile' && newSection !== 'profile') {
        fetchUserProfile()
    }
})
</script>

<template>
    <div>
        <div class="h-screen flex flex-col py-6 px-8" style="background-color: #f5f7fb">
            <header class="flex-shrink-0 z-40">
                <div class="pb-6">
                    <div class="flex justify-between items-center">
                        <div class="flex items-center">
                            <img src="/images/logo/logo.png" alt="QRMaster" class="h-8" />
                        </div>

                        <div class="flex items-center space-x-3">
                            <button @click="showCreateCampaignModal = true"
                                class="bg-white hover:bg-[#dde8fb] border border-[#dde8fb] text-[#001d4a] px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2">
                                <Icon name="heroicons:megaphone" class="w-5 h-5" />
                                <span>Nouvelle campagne</span>
                            </button>

                            <button @click="showGenerateModal = true"
                                class="bg-white hover:bg-[#dde8fb] border border-[#dde8fb] text-[#001d4a] px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2">
                                <Icon name="heroicons:plus" class="w-5 h-5" />
                                <span>Nouveau QR code</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div class="flex flex-1 overflow-hidden">
                <aside class="w-80 bg-white border border-gray-200 h-full flex flex-col overflow-y-auto rounded-3xl">
                    <nav class="flex-1 p-4">
                        <ul class="space-y-2">
                            <li>
                                <button @click="activeSection = 'dashboard'" :class="[
                                    'w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors',
                                    activeSection === 'dashboard' ? 'bg-[#ffeb99] text-[#001d4a] text-sm font-bold' : 'text-gray-700 hover:bg-[#ffeb99]'
                                ]">
                                    <Icon name="heroicons:home" class="w-5 h-5" />
                                    <span>Tableau de bord</span>
                                </button>
                            </li>
                            <li>
                                <button @click="activeSection = 'my-qrcodes'" :class="[
                                    'w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors',
                                    activeSection === 'my-qrcodes' ? 'bg-[#ffeb99] text-[#001d4a] text-sm font-bold' : 'text-gray-700 hover:bg-[#ffeb99]'
                                ]">
                                    <Icon name="heroicons:qr-code" class="w-5 h-5" />
                                    <span>Mes QR codes</span>
                                </button>
                            </li>
                            <li>
                                <button @click="activeSection = 'analytics'" :class="[
                                    'w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors',
                                    activeSection === 'analytics' ? 'bg-[#ffeb99] text-[#001d4a] text-sm font-bold' : 'text-gray-700 hover:bg-[#ffeb99]'
                                ]">
                                    <Icon name="heroicons:chart-bar" class="w-5 h-5" />
                                    <span>Analyses</span>
                                </button>
                            </li>
                            <li>
                                <button @click="activeSection = 'campaigns'" :class="[
                                    'w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors',
                                    activeSection === 'campaigns' ? 'bg-[#ffeb99] text-[#001d4a] text-sm font-bold' : 'text-gray-700 hover:bg-[#ffeb99]'
                                ]">
                                    <Icon name="heroicons:megaphone" class="w-5 h-5" />
                                    <span>Campagnes</span>
                                </button>
                            </li>
                        </ul>
                    </nav>

                    <div class="p-4">
                        <button v-if="user" @click="activeSection = 'profile'" :class="[
                            'w-full flex items-center space-x-3 mb-4 bg-[#f5f7fb] rounded-lg p-2 border border-[#dde8fb] transition-colors hover:bg-[#e8effc]',
                            activeSection === 'profile' ? 'ring-2 ring-yellow-400' : ''
                        ]">
                            <div class="w-10 h-10 bg-[#ff9472] rounded-lg flex items-center justify-center">
                                <Icon name="heroicons:user" class="w-5 h-5 text-white" />
                            </div>
                            <div class="text-left">
                                <div v-if="userProfile" class="font-medium text-gray-900">
                                    {{ userProfile.first_name }} {{ userProfile.last_name }}
                                </div>
                                <div v-else-if="user.user_metadata" class="font-medium text-gray-900">
                                    {{ user.user_metadata.first_name }} {{ user.user_metadata.last_name }}
                                </div>
                                <div v-if="userProfile" class="text-sm text-gray-600">
                                    {{ userProfile.company_name || 'Aucune entreprise' }}
                                </div>
                                <div v-else-if="user.user_metadata" class="text-sm text-gray-600">
                                    {{ user.user_metadata.company_name }}
                                </div>
                            </div>
                        </button>

                        <button @click="activeSection = 'help'"
                            class="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg flex items-center space-x-3 transition-colors">
                            <Icon name="heroicons:question-mark-circle" class="w-5 h-5" />
                            <span>Besoin d'aide ?</span>
                        </button>

                        <button @click="logout"
                            class="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg flex items-center space-x-3 transition-colors mt-2">
                            <Icon name="heroicons:arrow-right-on-rectangle" class="w-5 h-5" />
                            <span>Déconnexion</span>
                        </button>
                    </div>
                </aside>

                <main class="flex-1 pl-8 overflow-y-auto">
                    <div v-if="activeSection === 'dashboard'"
                        class="bg-white border border-gray-200 overflow-y-auto rounded-3xl p-4 h-full">
                        <div class="mb-8" v-if="user">
                            <h1 class="text-3xl font-bold text-gray-900 mb-2">
                                Bienvenue {{ userProfile?.first_name || user.user_metadata?.first_name || 'utilisateur'
                                }}
                            </h1>
                            <p class="text-gray-600">Découvrez le meilleur de QRMaster, en ligne</p>
                        </div>

                        <div
                            class="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl p-8 mb-8 relative overflow-hidden">
                            <div class="relative z-10">
                                <h2 class="text-2xl font-bold text-gray-900 mb-4">QRMaster vous propose des solutions
                                    rapides pour tous vos projets</h2>
                                <p class="text-gray-800 mb-6">De la création jusqu'à l'analyse des performances en temps
                                    réel.</p>
                                <button @click="showGenerateModal = true"
                                    class="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                                    Déposez une demande
                                </button>
                            </div>
                            <div class="absolute right-0 top-0 w-64 h-full">
                                <div class="w-32 h-32 bg-yellow-300 rounded-full absolute top-4 right-8 opacity-50">
                                </div>
                                <div class="w-24 h-24 bg-yellow-200 rounded-full absolute bottom-8 right-16 opacity-70">
                                </div>
                            </div>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div
                                class="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                                <Icon name="heroicons:qr-code" class="w-8 h-8 text-yellow-500 mb-4" />
                                <h3 class="font-semibold text-gray-900 mb-2">Créer un QR Code</h3>
                                <p class="text-gray-600 text-sm mb-4">Générez rapidement vos QR codes personnalisés</p>
                                <button class="text-yellow-600 hover:text-yellow-700 font-medium">Commencer →</button>
                            </div>

                            <div
                                class="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                                <Icon name="heroicons:chart-bar" class="w-8 h-8 text-blue-500 mb-4" />
                                <h3 class="font-semibold text-gray-900 mb-2">Analyser les performances</h3>
                                <p class="text-gray-600 text-sm mb-4">Suivez les scans et l'engagement en temps réel</p>
                                <button class="text-blue-600 hover:text-blue-700 font-medium">Voir les stats →</button>
                            </div>

                            <div
                                class="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                                <Icon name="heroicons:cog-6-tooth" class="w-8 h-8 text-green-500 mb-4" />
                                <h3 class="font-semibold text-gray-900 mb-2">Gérer vos campagnes</h3>
                                <p class="text-gray-600 text-sm mb-4">Organisez et optimisez vos campagnes QR</p>
                                <button class="text-green-600 hover:text-green-700 font-medium">Gérer →</button>
                            </div>
                        </div>
                    </div>

                    <div v-else-if="activeSection === 'my-qrcodes'">
                        <h1 class="text-3xl font-bold text-gray-900 mb-6">Mes QR codes</h1>

                        <div v-if="loadingQRCodes" class="text-center text-gray-500">
                            Chargement des QR codes...
                        </div>

                        <div v-else-if="qrcodes.length === 0"
                            class="bg-white rounded-lg border border-gray-200 p-8 text-center">
                            <Icon name="heroicons:qr-code" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 class="text-lg font-medium text-gray-900 mb-2">Aucun QR code créé</h3>
                            <p class="text-gray-600 mb-6">Commencez par créer votre premier QR code</p>
                            <button @click="showGenerateModal = true"
                                class="bg-yellow-400 hover:bg-yellow-500 text-gray-800 px-6 py-3 rounded-lg font-medium">
                                Créer mon premier QR code
                            </button>
                        </div>

                        <QRCodeSection v-else :qrcodes="qrcodes" :campaigns="campaigns" @edit="handleEditQRCode"
                            @delete="handleDeleteQRCode" />
                    </div>

                    <div v-else-if="activeSection === 'campaigns'">
                        <CampaignsSection :campaigns="campaigns" :qrcodes="qrcodes"
                            :loadingCampaigns="loadingCampaigns" />
                    </div>

                    <div v-else-if="activeSection === 'analytics'">
                        <AnalyticsSection :qrcodes="qrcodes" :campaigns="campaigns" />
                    </div>

                    <div v-else-if="activeSection === 'help'">
                        <HelpSection />
                    </div>

                    <div v-else-if="activeSection === 'profile'">
                        <ProfilSection />
                    </div>

                    <div v-else>
                        <h1 class="text-3xl font-bold text-gray-900 mb-6">{{ getSectionTitle(activeSection) }}</h1>
                        <div class="bg-white rounded-lg border border-gray-200 p-8">
                            <p class="text-gray-600">Le contenu de cette section sera bientôt disponible.</p>
                        </div>
                    </div>
                </main>
            </div>

            <QRCodeGenerateModal :is-open="showGenerateModal" :campaigns="campaigns" :is-creating="isCreatingQRCode"
                :generated-q-r-code="generatedQRCode" @update:is-open="showGenerateModal = $event"
                @create="handleCreateQRCode" @reset="generatedQRCode = null" />

            <CampaignCreateModal :is-open="showCreateCampaignModal" :is-creating="isCreatingCampaign"
                @update:is-open="showCreateCampaignModal = $event" @create="handleCreateCampaign" @reset="() => { }" />

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