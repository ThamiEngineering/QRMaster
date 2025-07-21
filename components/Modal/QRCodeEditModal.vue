<script setup lang="ts">
import type { Database } from '~/types/supabase'

interface Props {
  isOpen: boolean
  selectedQR: Database['public']['Tables']['qrcodes']['Row'] | null
  campaigns: Database['public']['Tables']['campaigns']['Row'][]
  isEditing: boolean
}

interface EditForm {
  name: string
  type: string
  content: string
  campaign_id: number | null
}

interface Emits {
  (e: 'update:isOpen', value: boolean): void
  (e: 'edit', form: EditForm): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const modalOpen = computed({
  get: () => props.isOpen,
  set: (value: boolean) => emit('update:isOpen', value),
})

const editForm = ref<EditForm>({
  name: '',
  type: '',
  content: '',
  campaign_id: null,
})

watch(
  () => props.selectedQR,
  (newQR) => {
    if (newQR) {
      editForm.value = {
        name: newQR.name,
        type: newQR.type,
        content: newQR.content,
        campaign_id: newQR.campaign_id,
      }
    }
  },
  { immediate: true }
)

const handleEdit = () => {
  emit('edit', editForm.value)
}

const handleCancel = () => {
  modalOpen.value = false
}
</script>

<template>
  <div v-if="modalOpen" class="fixed inset-0 z-[60] flex items-center justify-center p-4">
    <!-- Backdrop -->
    <div
      class="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      @click="modalOpen = false"
    />

    <!-- Modal Container -->
    <div
      class="relative w-full max-w-2xl rounded-2xl overflow-hidden bg-black border border-white/20 shadow-2xl"
    >
      <!-- Background Effects -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute -top-4 -right-4 w-32 h-32 bg-blue-400/10 rounded-full blur-3xl"/>
        <div class="absolute -bottom-4 -left-4 w-24 h-24 bg-blue-400/5 rounded-full blur-2xl"/>
      </div>

      <!-- Header -->
      <div class="relative border-b border-white/10 p-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div
              class="w-12 h-12 bg-blue-400/10 border border-blue-400/20 rounded-xl flex items-center justify-center"
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
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                <path d="m15 5 4 4" />
              </svg>
            </div>
            <div>
              <h2 class="text-2xl font-bold text-white tracking-tight">Modifier le QR code</h2>
              <p class="text-white/60 text-sm">{{ selectedQR?.name }}</p>
            </div>
          </div>
          <button
            class="w-10 h-10 rounded-xl flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all duration-200"
            @click="modalOpen = false"
          >
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
              <path d="M18 6 6 18" />
              <path d="M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Body -->
      <div class="relative p-6 overflow-auto max-h-[70vh]">
        <form class="space-y-6" @submit.prevent="handleEdit">
          <!-- QR Code Name -->
          <div class="space-y-2">
            <label for="edit-name" class="block text-sm font-medium text-white/90">
              Nom du QR code <span class="text-yellow-400">*</span>
            </label>
            <div class="relative">
              <input
                id="edit-name"
                v-model="editForm.name"
                type="text"
                placeholder="Mon QR code"
                required
                class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-300 hover:border-white/20"
              >
              <div
                class="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent opacity-0 focus-within:opacity-100 transition-opacity duration-300"
              />
            </div>
          </div>

          <!-- Campaign Selection -->
          <div class="space-y-2">
            <label for="edit-campaign" class="block text-sm font-medium text-white/90">
              Campagne (optionnel)
            </label>
            <div class="relative">
              <select
                id="edit-campaign"
                v-model="editForm.campaign_id"
                class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-300 hover:border-white/20 appearance-none"
              >
                <option value="">Aucune campagne</option>
                <option
                  v-for="campaign in campaigns"
                  :key="campaign.id"
                  :value="campaign.id"
                  class="bg-gray-800 text-white"
                >
                  {{ campaign.name }}
                </option>
              </select>
              <div class="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
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
                  class="text-white/50"
                >
                  <path d="m7 15 5 5 5-5" />
                  <path d="m7 9 5-5 5 5" />
                </svg>
              </div>
              <div
                class="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent opacity-0 focus-within:opacity-100 transition-opacity duration-300"
              />
            </div>
          </div>

          <!-- QR Type -->
          <div class="space-y-3">
            <label class="block text-sm font-medium text-white/90">
              Type de QR code <span class="text-yellow-400">*</span>
            </label>
            <div class="grid grid-cols-2 gap-4">
              <label class="relative cursor-pointer">
                <input
                  v-model="editForm.type"
                  type="radio"
                  name="edit-type"
                  value="statique"
                  class="sr-only"
                >
                <div
                  :class="[
                    'p-4 rounded-xl border-2 transition-all duration-300 group',
                    editForm.type === 'statique'
                      ? 'bg-blue-400/10 border-blue-400/30 text-blue-400'
                      : 'bg-white/5 border-white/10 text-white/70 hover:border-white/20 hover:bg-white/10',
                  ]"
                >
                  <div class="flex items-center gap-3 mb-2">
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
                    <span class="font-medium">Statique</span>
                  </div>
                  <p class="text-xs opacity-80">Contenu fixe, idéal pour des URL permanentes</p>
                </div>
              </label>

              <label class="relative cursor-pointer">
                <input
                  v-model="editForm.type"
                  type="radio"
                  name="edit-type"
                  value="dynamique"
                  class="sr-only"
                >
                <div
                  :class="[
                    'p-4 rounded-xl border-2 transition-all duration-300 group',
                    editForm.type === 'dynamique'
                      ? 'bg-blue-400/10 border-blue-400/30 text-blue-400'
                      : 'bg-white/5 border-white/10 text-white/70 hover:border-white/20 hover:bg-white/10',
                  ]"
                >
                  <div class="flex items-center gap-3 mb-2">
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
                      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                      <path d="M3 3v5h5" />
                      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                      <path d="M16 16h5v5" />
                    </svg>
                    <span class="font-medium">Dynamique</span>
                  </div>
                  <p class="text-xs opacity-80">
                    Modifiable après création, avec analytics avancés
                  </p>
                </div>
              </label>
            </div>
          </div>

          <!-- Content -->
          <div class="space-y-2">
            <label for="edit-content" class="block text-sm font-medium text-white/90">
              Contenu <span class="text-yellow-400">*</span>
            </label>
            <div class="relative">
              <textarea
                id="edit-content"
                v-model="editForm.content"
                placeholder="https://example.com"
                required
                rows="3"
                class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-300 hover:border-white/20 resize-none"
              />
              <div
                class="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent opacity-0 focus-within:opacity-100 transition-opacity duration-300"
              />
            </div>
            <p class="text-xs text-white/50">URL, texte, email, téléphone, WiFi, etc.</p>
          </div>

          <!-- Current QR Info -->
          <div
            class="p-4 rounded-xl bg-gradient-to-r from-blue-400/5 to-indigo-400/5 border border-blue-400/20"
          >
            <div class="flex items-start gap-3">
              <div
                class="w-6 h-6 bg-blue-400/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
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
                  <path d="M12 16v-4" />
                  <path d="M12 8h.01" />
                  <circle cx="12" cy="12" r="10" />
                </svg>
              </div>
              <div class="flex-1">
                <h4 class="text-sm font-medium text-blue-400 mb-1">Informations actuelles</h4>
                <div class="space-y-1 text-xs text-white/70">
                  <div class="flex items-center justify-between">
                    <span>Scans enregistrés :</span>
                    <span class="font-medium text-white/90">{{ selectedQR?.scan_count || 0 }}</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span>Créé le :</span>
                    <span class="font-medium text-white/90">{{
                      selectedQR ? new Date(selectedQR.created_at).toLocaleDateString('fr-FR') : ''
                    }}</span>
                  </div>
                  <div
                    v-if="editForm.content !== selectedQR?.content"
                    class="flex items-center gap-2 mt-2 p-2 bg-yellow-400/10 border border-yellow-400/20 rounded-lg"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="text-yellow-400"
                    >
                      <path
                        d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"
                      />
                      <path d="M12 9v4" />
                      <path d="m12 17 .01 0" />
                    </svg>
                    <span class="text-yellow-400 text-xs"
                      >Le contenu a été modifié - un nouveau QR code sera généré</span
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Modification Tips -->
          <div
            class="p-4 rounded-xl bg-gradient-to-r from-green-400/5 to-emerald-400/5 border border-green-400/20"
          >
            <div class="flex items-start gap-3">
              <div
                class="w-6 h-6 bg-green-400/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
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
                  <path
                    d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                  />
                </svg>
              </div>
              <div class="flex-1">
                <h4 class="text-sm font-medium text-green-400 mb-1">Conseils de modification</h4>
                <ul class="text-xs text-white/70 space-y-1">
                  <li>• Les QR codes dynamiques conservent leurs statistiques</li>
                  <li>• Testez votre nouveau contenu avant de sauvegarder</li>
                  <li>• Les liens existants resteront fonctionnels</li>
                </ul>
              </div>
            </div>
          </div>
        </form>
      </div>

      <!-- Footer -->
      <div class="relative border-t border-white/10 p-6">
        <div class="flex justify-end gap-4">
          <button
            :disabled="isEditing"
            class="relative h-12 px-6 group overflow-hidden bg-gradient-to-br from-white/[0.03] via-white/[0.05] to-white/[0.03] backdrop-blur-md border border-white/10 rounded-xl text-white/90 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            @click="handleCancel"
          >
            <div
              class="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-full transition-all duration-1000"
            />
            <span class="relative font-medium">Annuler</span>
          </button>

          <button
            :disabled="isEditing || !editForm.name || !editForm.content"
            class="relative h-12 px-8 group overflow-hidden bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 hover:from-yellow-500 hover:via-amber-500 hover:to-orange-500 text-black rounded-xl border border-yellow-400/20 shadow-lg hover:shadow-yellow-400/25 transition-all duration-500 ease-out disabled:opacity-50 disabled:cursor-not-allowed"
            @click="handleEdit"
          >
            <div class="relative flex items-center justify-center gap-3">
              <span v-if="!isEditing" class="font-semibold">Modifier</span>
              <span v-else class="font-semibold">Modification...</span>
              <svg
                v-if="!isEditing"
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="transition-transform group-hover:scale-110"
              >
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                <path d="m15 5 4 4" />
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
        </div>
      </div>
    </div>
  </div>
</template>
