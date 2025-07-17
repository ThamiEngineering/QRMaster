<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Database } from '~/types/supabase'
import AccountDeleteModal from '~/components/Modal/AccountDeleteModal.vue'

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const toast = useToast()
const router = useRouter()

const profile = ref<Database['public']['Tables']['profiles']['Row'] | null>(null)
const editedProfile = ref({
    first_name: '',
    last_name: '',
    company_name: ''
})

const isEditing = ref(false)
const isLoading = ref(false)
const isSaving = ref(false)
const isDeleting = ref(false)
const showDeleteModal = ref(false)
const isOfflineMode = ref(false)

async function fetchProfile() {
    if (!user.value) return

    isLoading.value = true
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.value.id)
            .single()

        if (error) {
            console.log('Error fetching profile:', error)
            if (error.code === 'PGRST116' || error.message.includes('No rows found')) {
                profile.value = {
                    id: user.value.id,
                    first_name: user.value.user_metadata?.first_name || '',
                    last_name: user.value.user_metadata?.last_name || '',
                    company_name: user.value.user_metadata?.company_name || '',
                    created_at: new Date().toISOString()
                }
                updateEditedProfile()
                
                toast.add({
                    title: 'Profil local',
                    description: 'Utilisation des données du compte. Création de profil disponible.',
                    color: 'info'
                })
            } else {
                console.error('Supabase error details:', error)
                isOfflineMode.value = true
                profile.value = {
                    id: user.value.id,
                    first_name: user.value.user_metadata?.first_name || '',
                    last_name: user.value.user_metadata?.last_name || '',
                    company_name: user.value.user_metadata?.company_name || '',
                    created_at: new Date().toISOString()
                }
                updateEditedProfile()
                
                toast.add({
                    title: 'Mode hors ligne',
                    description: 'Connexion limitée. Certaines fonctions peuvent être indisponibles.',
                    color: 'warning'
                })
            }
        } else {
            profile.value = data
            updateEditedProfile()
        }
    } catch (error) {
        console.error('Error fetching profile:', error)
        if (user.value) {
            isOfflineMode.value = true
            profile.value = {
                id: user.value.id,
                first_name: user.value.user_metadata?.first_name || '',
                last_name: user.value.user_metadata?.last_name || '',
                company_name: user.value.user_metadata?.company_name || '',
                created_at: new Date().toISOString()
            }
            updateEditedProfile()
            
            toast.add({
                title: 'Mode hors ligne',
                description: 'Utilisation des données locales. Veuillez vérifier votre connexion.',
                color: 'warning'
            })
        }
    } finally {
        isLoading.value = false
    }
}

function updateEditedProfile() {
    if (profile.value) {
        editedProfile.value = {
            first_name: profile.value.first_name || '',
            last_name: profile.value.last_name || '',
            company_name: profile.value.company_name || ''
        }
    }
}

function startEditing() {
    isEditing.value = true
    updateEditedProfile()
}

function cancelEditing() {
    isEditing.value = false
    updateEditedProfile()
}

async function saveProfile() {
    if (!user.value || !profile.value) return

    if (!editedProfile.value.first_name.trim() || !editedProfile.value.last_name.trim()) {
        toast.add({
            title: 'Erreur',
            description: 'Le prénom et le nom sont obligatoires.',
            color: 'error'
        })
        return
    }

    isSaving.value = true
    try {
        const { data, error } = await supabase
            .from('profiles')
            .update({
                first_name: editedProfile.value.first_name.trim(),
                last_name: editedProfile.value.last_name.trim(),
                company_name: editedProfile.value.company_name.trim()
            })
            .eq('id', user.value.id)
            .select()
            .single()

        if (error && (error.code === 'PGRST116' || error.message.includes('No rows'))) {
            const { data: insertData, error: insertError } = await supabase
                .from('profiles')
                .insert({
                    id: user.value.id,
                    first_name: editedProfile.value.first_name.trim(),
                    last_name: editedProfile.value.last_name.trim(),
                    company_name: editedProfile.value.company_name.trim()
                })
                .select()
                .single()

            if (insertError) {
                console.error('Insert error:', insertError)
                isOfflineMode.value = true
                profile.value = {
                    ...profile.value,
                    first_name: editedProfile.value.first_name.trim(),
                    last_name: editedProfile.value.last_name.trim(),
                    company_name: editedProfile.value.company_name.trim()
                }
                isEditing.value = false
                
                toast.add({
                    title: 'Sauvegarde locale',
                    description: 'Modifications sauvegardées localement. Vérifiez votre connexion.',
                    color: 'warning'
                })
                return
            }
            
            profile.value = insertData
        } else if (error) {
            throw error
        } else {
            profile.value = data
        }

        isEditing.value = false

        toast.add({
            title: 'Profil mis à jour',
            description: 'Vos informations ont été sauvegardées avec succès.',
            color: 'success'
        })
    } catch (error) {
        console.error('Error updating profile:', error)
        
        isOfflineMode.value = true
        profile.value = {
            ...profile.value,
            first_name: editedProfile.value.first_name.trim(),
            last_name: editedProfile.value.last_name.trim(),
            company_name: editedProfile.value.company_name.trim()
        }
        isEditing.value = false
        
        toast.add({
            title: 'Sauvegarde locale',
            description: 'Modifications sauvegardées localement. Vérifiez votre connexion.',
            color: 'warning'
        })
    } finally {
        isSaving.value = false
    }
}

async function deleteAccount() {
    if (!user.value) return

    if (isOfflineMode.value) {
        toast.add({
            title: 'Fonction indisponible',
            description: 'Suppression de compte non disponible en mode hors ligne.',
            color: 'error'
        })
        showDeleteModal.value = false
        return
    }

    isDeleting.value = true
    try {
        const { error: authError } = await supabase.auth.admin.deleteUser(user.value.id)
        
        if (authError) {
            console.log('Admin delete failed, doing signOut:', authError)
            await supabase.auth.signOut()
        }
        
        toast.add({
            title: 'Compte supprimé',
            description: 'Votre compte a été supprimé définitivement.',
            color: 'success'
        })

        await router.push('/')
    } catch (error) {
        console.error('Error deleting account:', error)
        
        try {
            await supabase.auth.signOut()
            toast.add({
                title: 'Déconnexion',
                description: 'Vous avez été déconnecté. Contactez le support pour supprimer définitivement votre compte.',
                color: 'warning'
            })
            await router.push('/')
        } catch (signOutError) {
            toast.add({
                title: 'Erreur',
                description: 'Impossible de supprimer le compte. Contactez le support.',
                color: 'error'
            })
        }
    } finally {
        isDeleting.value = false
        showDeleteModal.value = false
    }
}

onMounted(() => {
    fetchProfile()
})
</script>

<template>
    <div class="bg-white border border-gray-200 rounded-3xl p-6 h-full overflow-y-auto">
        <div class="mb-8">
            <h1 class="text-3xl font-bold text-gray-900 mb-2">Mon profil</h1>
            <p class="text-gray-600">Gérez vos informations personnelles et paramètres de compte</p>
            <div v-if="isOfflineMode" 
                 class="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div class="flex items-center">
                    <Icon name="heroicons:exclamation-triangle" class="w-5 h-5 text-yellow-600 mr-2" />
                    <p class="text-sm text-yellow-800">
                        Mode hors ligne : Connexion limitée. Certaines fonctionnalités peuvent être indisponibles.
                    </p>
                </div>
            </div>
        </div>

        <div v-if="isLoading" class="text-center py-8">
            <div class="animate-spin w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full mx-auto"></div>
            <p class="text-gray-600 mt-4">Chargement des informations...</p>
        </div>

        <div v-else-if="profile" class="space-y-8">
            <div class="bg-gray-50 rounded-xl p-6">
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-xl font-semibold text-gray-900">Informations personnelles</h2>
                    <UButton v-if="!isEditing" @click="startEditing" variant="outline" icon="i-heroicons-pencil">
                        Modifier
                    </UButton>
                </div>

                <div v-if="!isEditing" class="space-y-4">
                    <div class="flex items-center space-x-4">
                        <div class="w-16 h-16 bg-[#ff9472] rounded-xl flex items-center justify-center">
                            <Icon name="heroicons:user" class="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h3 class="text-lg font-medium text-gray-900">
                                {{ profile.first_name }} {{ profile.last_name }}
                            </h3>
                            <p class="text-gray-600">{{ profile.company_name || 'Aucune entreprise renseignée' }}</p>
                            <p class="text-sm text-gray-500">{{ user?.email }}</p>
                        </div>
                    </div>
                </div>

                <form v-else @submit.prevent="saveProfile" class="space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Prénom *</label>
                            <UInput
                                v-model="editedProfile.first_name"
                                placeholder="Votre prénom"
                                size="lg"
                                required
                            />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
                            <UInput
                                v-model="editedProfile.last_name"
                                placeholder="Votre nom"
                                size="lg"
                                required
                            />
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Entreprise</label>
                        <UInput
                            v-model="editedProfile.company_name"
                            placeholder="Nom de votre entreprise"
                            size="lg"
                        />
                    </div>

                    <div class="flex space-x-3 pt-4">
                        <UButton 
                            type="submit" 
                            :loading="isSaving"
                            icon="i-heroicons-check"
                            class="bg-yellow-400 hover:bg-yellow-500 text-gray-800"
                        >
                            Sauvegarder
                        </UButton>
                        <UButton @click="cancelEditing" variant="outline" icon="i-heroicons-x-mark">
                            Annuler
                        </UButton>
                    </div>
                </form>
            </div>

            <div class="bg-gray-50 rounded-xl p-6">
                <h2 class="text-xl font-semibold text-gray-900 mb-4">Informations du compte</h2>
                <div class="space-y-3">
                    <div class="flex justify-between items-center">
                        <span class="text-gray-600">Adresse e-mail</span>
                        <span class="font-medium">{{ user?.email }}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-gray-600">Date de création</span>
                        <span class="font-medium">{{ new Date(profile.created_at).toLocaleDateString('fr-FR') }}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-gray-600">Identifiant unique</span>
                        <span class="font-mono text-sm text-gray-500">{{ user?.id.substring(0, 8) }}...</span>
                    </div>
                </div>
            </div>

            <div class="rounded-xl">
                <UButton 
                    @click="showDeleteModal = true"
                    color="error"
                    variant="outline"
                    icon="i-heroicons-trash"
                    :disabled="isOfflineMode"
                >
                    Supprimer mon compte
                </UButton>
                <p v-if="isOfflineMode" class="text-sm text-gray-500 mt-2">
                    Fonction temporairement indisponible en mode hors ligne
                </p>
            </div>
        </div>

        <AccountDeleteModal
            :is-open="showDeleteModal"
            :is-deleting="isDeleting"
            @update:is-open="showDeleteModal = $event"
            @confirm-delete="deleteAccount"
        />
    </div>
</template>

<style scoped>
.overflow-y-auto {
    scrollbar-width: thin;
    scrollbar-color: #e5e7eb transparent;
}

.overflow-y-auto::-webkit-scrollbar {
    width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
    background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
    background-color: #e5e7eb;
    border-radius: 3px;
}
</style> 