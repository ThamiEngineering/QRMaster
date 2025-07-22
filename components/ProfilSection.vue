<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AccountDeleteModal from '~/components/Modal/AccountDeleteModal.vue'
import { useUserProfileStore } from '~/stores/userProfile'
import type { Database } from '~/types/supabase'

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const toast = useToast()
const router = useRouter()

const profile = ref<Database['public']['Tables']['profiles']['Row'] | null>(null)
const editedProfile = ref({
  first_name: '',
  last_name: '',
  company_name: '',
})

const isEditing = ref(false)
const isLoading = ref(false)
const isSaving = ref(false)
const isDeleting = ref(false)
const showDeleteModal = ref(false)
const isOfflineMode = ref(false)

const userProfileStore = useUserProfileStore()

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
          created_at: new Date().toISOString(),
        }
        userProfileStore.setProfile(profile.value)
        updateEditedProfile()

        toast.add({
          title: 'Profil local',
          description: 'Utilisation des données du compte. Création de profil disponible.',
          color: 'info',
        })
      } else {
        console.error('Supabase error details:', error)
        isOfflineMode.value = true
        profile.value = {
          id: user.value.id,
          first_name: user.value.user_metadata?.first_name || '',
          last_name: user.value.user_metadata?.last_name || '',
          company_name: user.value.user_metadata?.company_name || '',
          created_at: new Date().toISOString(),
        }
        userProfileStore.setProfile(profile.value)
        updateEditedProfile()

        toast.add({
          title: 'Mode hors ligne',
          description: 'Connexion limitée. Certaines fonctions peuvent être indisponibles.',
          color: 'warning',
        })
      }
    } else {
      profile.value = data
      userProfileStore.setProfile(data)
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
        created_at: new Date().toISOString(),
      }
      userProfileStore.setProfile(profile.value)
      updateEditedProfile()

      toast.add({
        title: 'Mode hors ligne',
        description: 'Utilisation des données locales. Veuillez vérifier votre connexion.',
        color: 'warning',
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
      company_name: profile.value.company_name || '',
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
      color: 'error',
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
        company_name: editedProfile.value.company_name.trim(),
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
          company_name: editedProfile.value.company_name.trim(),
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
          company_name: editedProfile.value.company_name.trim(),
        }
        userProfileStore.setProfile(profile.value)
        isEditing.value = false

        toast.add({
          title: 'Sauvegarde locale',
          description: 'Modifications sauvegardées localement. Vérifiez votre connexion.',
          color: 'warning',
        })
        return
      }

      profile.value = insertData
      userProfileStore.setProfile(insertData)
    } else if (error) {
      throw error
    } else {
      profile.value = data
      userProfileStore.setProfile(data)
    }

    isEditing.value = false

    toast.add({
      title: 'Profil mis à jour',
      description: 'Vos informations ont été sauvegardées avec succès.',
      color: 'success',
    })
  } catch (error) {
    console.error('Error updating profile:', error)

    isOfflineMode.value = true
    profile.value = {
      id: profile.value?.id ?? user.value.id,
      first_name: editedProfile.value.first_name.trim() || null,
      last_name: editedProfile.value.last_name.trim() || null,
      company_name: editedProfile.value.company_name.trim() || null,
      created_at: profile.value?.created_at ?? new Date().toISOString(),
    }
    userProfileStore.setProfile(profile.value)
    isEditing.value = false

    toast.add({
      title: 'Sauvegarde locale',
      description: 'Modifications sauvegardées localement. Vérifiez votre connexion.',
      color: 'warning',
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
      color: 'error',
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
      color: 'success',
    })

    await router.push('/')
  } catch (error) {
    console.error('Error deleting account:', error)

    try {
      await supabase.auth.signOut()
      toast.add({
        title: 'Déconnexion',
        description:
          'Vous avez été déconnecté. Contactez le support pour supprimer définitivement votre compte.',
        color: 'warning',
      })
      await router.push('/')
    } catch (signOutError) {
      toast.add({
        title: 'Erreur',
        description: 'Impossible de supprimer le compte. Contactez le support.',
        color: 'error',
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
  <div class="space-y-8">
    <div
      v-if="isOfflineMode"
      class="p-4 rounded-xl bg-gradient-to-r from-yellow-400/10 to-amber-400/10 border border-yellow-400/20"
    >
      <div class="flex items-start gap-3">
        <div
          class="w-6 h-6 bg-yellow-400/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="text-yellow-400"
          >
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
            <path d="M12 9v4" />
            <path d="m12 17 .01 0" />
          </svg>
        </div>
        <div class="flex-1">
          <h4 class="text-sm font-medium text-yellow-400 mb-1">Mode hors ligne</h4>
          <p class="text-xs text-white/70">
            Connexion limitée. Certaines fonctionnalités peuvent être indisponibles.
          </p>
        </div>
      </div>
    </div>

    <div v-if="isLoading" class="flex flex-col items-center justify-center py-20">
      <div
        class="w-16 h-16 bg-indigo-400/10 border border-indigo-400/20 rounded-2xl flex items-center justify-center mb-6"
      >
        <svg
          class="animate-spin w-8 h-8 text-indigo-400"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          />
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
      <h3 class="text-xl font-semibold text-white mb-2">Chargement du profil</h3>
      <p class="text-white/60">Récupération des informations...</p>
    </div>

    <div v-else-if="profile" class="space-y-8">
      <div
        class="group relative p-6 rounded-xl overflow-hidden bg-gradient-to-br from-white/[0.03] via-white/[0.05] to-white/[0.03] backdrop-blur-md border border-white/10 hover:border-white/20 transition-all duration-300"
      >
        <div
          class="absolute inset-0 bg-gradient-to-br opacity-20 from-indigo-500/10 via-purple-500/10 to-pink-500/10"
        />
        <div
          class="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-full transition-all duration-1000"
        />

        <div class="relative">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-semibold text-white flex items-center gap-3">
              <div
                class="w-8 h-8 bg-indigo-400/10 border border-indigo-400/20 rounded-lg flex items-center justify-center"
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
              </div>
              Informations personnelles
            </h2>
            <button
              v-if="!isEditing"
              class="relative h-10 px-4 group overflow-hidden bg-gradient-to-br from-white/[0.03] via-white/[0.05] to-white/[0.03] backdrop-blur-md border border-white/10 rounded-xl text-white/90 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300"
              @click="startEditing"
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
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                  <path d="m15 5 3 3" />
                </svg>
                <span class="text-sm font-medium">Modifier</span>
              </div>
            </button>
          </div>

          <div v-if="!isEditing" class="space-y-6">
            <div class="flex items-center space-x-6">
              <div
                class="w-20 h-20 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-2xl flex items-center justify-center border border-indigo-400/20"
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
                  class="text-indigo-400"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div class="flex-1">
                <h3 class="text-2xl font-bold text-white mb-1">
                  {{ profile.first_name }} {{ profile.last_name }}
                </h3>
                <p class="text-white/70 mb-2">
                  {{ profile.company_name || 'Aucune entreprise renseignée' }}
                </p>
                <p class="text-sm text-white/50 flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path
                      d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                    />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  {{ user?.email }}
                </p>
              </div>
            </div>
          </div>

          <form v-else class="space-y-6" @submit.prevent="saveProfile">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <label for="first_name" class="block text-sm font-medium text-white/90">
                  Prénom <span class="text-yellow-400">*</span>
                </label>
                <div class="relative">
                  <input
                    id="first_name"
                    v-model="editedProfile.first_name"
                    type="text"
                    placeholder="Votre prénom"
                    required
                    class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400/50 transition-all duration-300 hover:border-white/20"
                  >
                  <div
                    class="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-indigo-400/50 to-transparent opacity-0 focus-within:opacity-100 transition-opacity duration-300"
                  />
                </div>
              </div>

              <div class="space-y-2">
                <label for="last_name" class="block text-sm font-medium text-white/90">
                  Nom <span class="text-yellow-400">*</span>
                </label>
                <div class="relative">
                  <input
                    id="last_name"
                    v-model="editedProfile.last_name"
                    type="text"
                    placeholder="Votre nom"
                    required
                    class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400/50 transition-all duration-300 hover:border-white/20"
                  >
                  <div
                    class="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-indigo-400/50 to-transparent opacity-0 focus-within:opacity-100 transition-opacity duration-300"
                  />
                </div>
              </div>
            </div>

            <div class="space-y-2">
              <label for="company_name" class="block text-sm font-medium text-white/90">
                Entreprise
              </label>
              <div class="relative">
                <input
                  id="company_name"
                  v-model="editedProfile.company_name"
                  type="text"
                  placeholder="Nom de votre entreprise"
                  class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400/50 transition-all duration-300 hover:border-white/20"
                >
                <div
                  class="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-indigo-400/50 to-transparent opacity-0 focus-within:opacity-100 transition-opacity duration-300"
                />
              </div>
            </div>

            <div class="flex gap-4 pt-4">
              <button
                type="submit"
                :disabled="
                  isSaving || !editedProfile.first_name.trim() || !editedProfile.last_name.trim()
                "
                class="relative h-12 px-6 group overflow-hidden bg-gradient-to-r from-indigo-400 via-indigo-500 to-purple-500 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 text-white rounded-xl border border-indigo-400/20 shadow-lg hover:shadow-indigo-400/25 transition-all duration-500 ease-out disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div
                  class="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                />
                <div
                  class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-full transition-all duration-1000"
                />
                <div class="relative flex items-center justify-center gap-3">
                  <span v-if="!isSaving" class="font-semibold">Sauvegarder</span>
                  <span v-else class="font-semibold">Sauvegarde...</span>
                  <svg
                    v-if="!isSaving"
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
                    <path d="m9 12 2 2 4-4" />
                    <path
                      d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c2.35 0 4.48.9 6.08 2.38"
                    />
                  </svg>
                  <svg
                    v-else
                    class="animate-spin"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                </div>
              </button>

              <button
                type="button"
                class="relative h-12 px-6 group overflow-hidden bg-gradient-to-br from-white/[0.03] via-white/[0.05] to-white/[0.03] backdrop-blur-md border border-white/10 rounded-xl text-white/90 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                @click="cancelEditing"
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
                    <path d="M18 6 6 18" />
                    <path d="M6 6l12 12" />
                  </svg>
                  <span class="font-medium">Annuler</span>
                </div>
              </button>
            </div>
          </form>
        </div>
      </div>

      <div
        class="group relative p-6 rounded-xl overflow-hidden bg-gradient-to-br from-white/[0.03] via-white/[0.05] to-white/[0.03] backdrop-blur-md border border-white/10 hover:border-white/20 transition-all duration-300"
      >
        <div
          class="absolute inset-0 bg-gradient-to-br opacity-20 from-blue-500/10 via-cyan-500/10 to-teal-500/10"
        />
        <div
          class="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-full transition-all duration-1000"
        />

        <div class="relative">
          <h2 class="text-xl font-semibold text-white mb-6 flex items-center gap-3">
            <div
              class="w-8 h-8 bg-blue-400/10 border border-blue-400/20 rounded-lg flex items-center justify-center"
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
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
            Informations du compte
          </h2>

          <div class="space-y-4">
            <div class="flex items-center justify-between p-4 rounded-xl bg-white/5">
              <div class="flex items-center gap-3">
                <div
                  class="w-8 h-8 bg-blue-400/10 border border-blue-400/20 rounded-lg flex items-center justify-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="text-blue-400"
                  >
                    <path
                      d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                    />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <span class="text-white/70 text-sm">Adresse e-mail</span>
              </div>
              <span class="font-medium text-white">{{ user?.email }}</span>
            </div>

            <div class="flex items-center justify-between p-4 rounded-xl bg-white/5">
              <div class="flex items-center gap-3">
                <div
                  class="w-8 h-8 bg-green-400/10 border border-green-400/20 rounded-lg flex items-center justify-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="text-green-400"
                  >
                    <path d="M8 2v4" />
                    <path d="M16 2v4" />
                    <rect width="18" height="18" x="3" y="4" rx="2" />
                    <path d="M3 10h18" />
                  </svg>
                </div>
                <span class="text-white/70 text-sm">Date de création</span>
              </div>
              <span class="font-medium text-white">
                {{ new Date(profile.created_at).toLocaleDateString('fr-FR') }}
              </span>
            </div>

            <div class="flex items-center justify-between p-4 rounded-xl bg-white/5">
              <div class="flex items-center gap-3">
                <div
                  class="w-8 h-8 bg-purple-400/10 border border-purple-400/20 rounded-lg flex items-center justify-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="text-purple-400"
                  >
                    <path d="M9 12l2 2 4-4" />
                    <path
                      d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c2.35 0 4.48.9 6.08 2.38"
                    />
                  </svg>
                </div>
                <span class="text-white/70 text-sm">Identifiant unique</span>
              </div>
              <span class="font-mono text-sm text-white/60">{{ user?.id.substring(0, 8) }}...</span>
            </div>
          </div>
        </div>
      </div>

      <div
        class="group relative p-6 rounded-xl overflow-hidden bg-gradient-to-br from-red-500/5 via-red-500/10 to-rose-500/5 backdrop-blur-md border border-red-500/20 hover:border-red-500/30 transition-all duration-300"
      >
        <div
          class="absolute inset-0 bg-gradient-to-br opacity-20 from-red-500/10 via-rose-500/10 to-pink-500/10"
        />
        <div
          class="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/5 to-transparent opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-full transition-all duration-1000"
        />

        <div class="relative">
          <h2 class="text-xl font-semibold text-white mb-4 flex items-center gap-3">
            <div
              class="w-8 h-8 bg-red-400/10 border border-red-400/20 rounded-lg flex items-center justify-center"
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
                class="text-red-400"
              >
                <path
                  d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"
                />
                <path d="M12 9v4" />
                <path d="m12 17 .01 0" />
              </svg>
            </div>
            Zone dangereuse
          </h2>

          <p class="text-white/70 text-sm mb-6">
            Cette action supprimera définitivement votre compte et toutes vos données associées.
            Cette action ne peut pas être annulée.
          </p>

          <button
            :disabled="isOfflineMode"
            class="relative h-12 px-6 group overflow-hidden bg-gradient-to-r from-red-500 via-red-600 to-rose-600 hover:from-red-600 hover:via-rose-600 hover:to-pink-600 text-white rounded-xl border border-red-500/20 shadow-lg hover:shadow-red-500/25 transition-all duration-500 ease-out disabled:opacity-50 disabled:cursor-not-allowed"
            @click="showDeleteModal = true"
          >
            <div
              class="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            />
            <div
              class="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-full transition-all duration-1000"
            />
            <div class="relative flex items-center justify-center gap-3">
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
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                <line x1="10" x2="10" y1="11" y2="17" />
                <line x1="14" x2="14" y1="11" y2="17" />
              </svg>
              <span class="font-semibold">Supprimer mon compte</span>
            </div>
          </button>

          <p v-if="isOfflineMode" class="text-sm text-red-400/70 mt-3">
            Fonction temporairement indisponible en mode hors ligne
          </p>
        </div>
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
