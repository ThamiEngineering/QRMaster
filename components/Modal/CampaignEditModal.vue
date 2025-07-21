<script setup lang="ts">
import type { Database } from '~/types/supabase'

interface Props {
  isOpen: boolean
  selectedCampaign: Database['public']['Tables']['campaigns']['Row'] | null
  isEditing: boolean
}

interface EditForm {
  name: string
  description: string | null
  status: 'active' | 'paused' | 'archived'
  start_date: string | null
  end_date: string | null
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
  description: '',
  status: 'active',
  start_date: '',
  end_date: '',
})

watch(
  () => props.selectedCampaign,
  (newCampaign) => {
    if (newCampaign) {
      editForm.value = {
        name: newCampaign.name,
        description: newCampaign.description || '',
        status: newCampaign.status,
        start_date: newCampaign.start_date || '',
        end_date: newCampaign.end_date || '',
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
    <div
      class="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      @click="handleCancel"
    />

    <div
      class="relative w-full max-w-2xl rounded-2xl overflow-hidden bg-black border border-white/20 shadow-2xl"
    >
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute -top-4 -right-4 w-32 h-32 bg-amber-400/10 rounded-full blur-3xl"/>
        <div
          class="absolute -bottom-4 -left-4 w-24 h-24 bg-amber-400/5 rounded-full blur-2xl"
        />
      </div>

      <div class="relative border-b border-white/10 p-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div
              class="w-12 h-12 bg-amber-400/10 border border-amber-400/20 rounded-xl flex items-center justify-center"
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
                class="text-amber-400"
              >
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                <path d="m15 5 3 3" />
              </svg>
            </div>
            <div>
              <h2 class="text-2xl font-bold text-white tracking-tight">Modifier la campagne</h2>
              <p class="text-white/60 text-sm">{{ selectedCampaign?.name }}</p>
            </div>
          </div>
          <button
            class="w-10 h-10 rounded-xl flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all duration-200"
            @click="handleCancel"
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

      <div class="relative p-6 overflow-auto max-h-[70vh]">
        <form class="space-y-6" @submit.prevent="handleEdit">
          <div class="space-y-2">
            <label for="edit-campaign-name" class="block text-sm font-medium text-white/90">
              Nom de la campagne <span class="text-yellow-400">*</span>
            </label>
            <div class="relative">
              <input
                id="edit-campaign-name"
                v-model="editForm.name"
                type="text"
                placeholder="Ma campagne marketing"
                required
                class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/50 transition-all duration-300 hover:border-white/20"
              >
              <div
                class="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent opacity-0 focus-within:opacity-100 transition-opacity duration-300"
              />
            </div>
          </div>

          <div class="space-y-2">
            <label for="edit-campaign-description" class="block text-sm font-medium text-white/90">
              Description (optionnel)
            </label>
            <div class="relative">
              <textarea
                id="edit-campaign-description"
                v-model="editForm.description"
                placeholder="Description de la campagne..."
                rows="3"
                class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/50 transition-all duration-300 hover:border-white/20 resize-none"
              />
              <div
                class="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent opacity-0 focus-within:opacity-100 transition-opacity duration-300"
              />
            </div>
          </div>

          <div class="space-y-3">
            <label class="block text-sm font-medium text-white/90">
              Statut de la campagne <span class="text-yellow-400">*</span>
            </label>
            <div class="grid grid-cols-3 gap-3">
              <label class="relative cursor-pointer">
                <input
                  v-model="editForm.status"
                  type="radio"
                  name="edit-campaign-status"
                  value="active"
                  class="sr-only"
                >
                <div
                  :class="[
                    'p-4 rounded-xl border-2 transition-all duration-300 text-center',
                    editForm.status === 'active'
                      ? 'bg-green-400/10 border-green-400/30 text-green-400'
                      : 'bg-white/5 border-white/10 text-white/70 hover:border-white/20 hover:bg-white/10',
                  ]"
                >
                  <div
                    class="w-8 h-8 mx-auto mb-2 rounded-lg flex items-center justify-center"
                    :class="editForm.status === 'active' ? 'bg-green-400/20' : 'bg-white/10'"
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
                    >
                      <path d="M8 2v4" />
                      <path d="M16 2v4" />
                      <rect width="18" height="18" x="3" y="4" rx="2" />
                      <path d="M3 10h18" />
                      <path d="m9 16 2 2 4-4" />
                    </svg>
                  </div>
                  <span class="text-sm font-medium">Active</span>
                </div>
              </label>

              <label class="relative cursor-pointer">
                <input
                  v-model="editForm.status"
                  type="radio"
                  name="edit-campaign-status"
                  value="paused"
                  class="sr-only"
                >
                <div
                  :class="[
                    'p-4 rounded-xl border-2 transition-all duration-300 text-center',
                    editForm.status === 'paused'
                      ? 'bg-yellow-400/10 border-yellow-400/30 text-yellow-400'
                      : 'bg-white/5 border-white/10 text-white/70 hover:border-white/20 hover:bg-white/10',
                  ]"
                >
                  <div
                    class="w-8 h-8 mx-auto mb-2 rounded-lg flex items-center justify-center"
                    :class="editForm.status === 'paused' ? 'bg-yellow-400/20' : 'bg-white/10'"
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
                    >
                      <rect x="14" y="4" width="4" height="16" rx="1" />
                      <rect x="6" y="4" width="4" height="16" rx="1" />
                    </svg>
                  </div>
                  <span class="text-sm font-medium">En pause</span>
                </div>
              </label>

              <label class="relative cursor-pointer">
                <input
                  v-model="editForm.status"
                  type="radio"
                  name="edit-campaign-status"
                  value="archived"
                  class="sr-only"
                >
                <div
                  :class="[
                    'p-4 rounded-xl border-2 transition-all duration-300 text-center',
                    editForm.status === 'archived'
                      ? 'bg-gray-400/10 border-gray-400/30 text-gray-400'
                      : 'bg-white/5 border-white/10 text-white/70 hover:border-white/20 hover:bg-white/10',
                  ]"
                >
                  <div
                    class="w-8 h-8 mx-auto mb-2 rounded-lg flex items-center justify-center"
                    :class="editForm.status === 'archived' ? 'bg-gray-400/20' : 'bg-white/10'"
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
                    >
                      <rect width="20" height="5" x="2" y="3" rx="1" />
                      <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" />
                      <path d="m10 12 4 4 4-4" />
                    </svg>
                  </div>
                  <span class="text-sm font-medium">Archivée</span>
                </div>
              </label>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <label for="edit-campaign-start" class="block text-sm font-medium text-white/90">
                Date de début (optionnel)
              </label>
              <div class="relative">
                <input
                  id="edit-campaign-start"
                  v-model="editForm.start_date"
                  type="date"
                  class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/50 transition-all duration-300 hover:border-white/20"
                >
                <div
                  class="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent opacity-0 focus-within:opacity-100 transition-opacity duration-300"
                />
              </div>
            </div>

            <div class="space-y-2">
              <label for="edit-campaign-end" class="block text-sm font-medium text-white/90">
                Date de fin (optionnel)
              </label>
              <div class="relative">
                <input
                  id="edit-campaign-end"
                  v-model="editForm.end_date"
                  type="date"
                  class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/50 transition-all duration-300 hover:border-white/20"
                >
                <div
                  class="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent opacity-0 focus-within:opacity-100 transition-opacity duration-300"
                />
              </div>
            </div>
          </div>

          <div
            class="p-4 rounded-xl bg-gradient-to-r from-amber-400/5 to-orange-400/5 border border-amber-400/20"
          >
            <div class="flex items-start gap-3">
              <div
                class="w-6 h-6 bg-amber-400/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
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
                  class="text-amber-400"
                >
                  <path
                    d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                  />
                </svg>
              </div>
              <div class="flex-1">
                <h4 class="text-sm font-medium text-amber-400 mb-1">Informations de la campagne</h4>
                <div class="text-xs text-white/70 space-y-1">
                  <p>• Les modifications prendront effet immédiatement</p>
                  <p>• Les QR codes associés garderont leurs statistiques</p>
                  <p>• Le changement de statut affecte la visibilité</p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

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
            :disabled="isEditing || !editForm.name"
            class="relative h-12 px-8 group overflow-hidden bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-500 hover:via-orange-500 hover:to-red-500 text-black rounded-xl border border-amber-400/20 shadow-lg hover:shadow-amber-400/25 transition-all duration-500 ease-out disabled:opacity-50 disabled:cursor-not-allowed"
            @click="handleEdit"
          >
            <div
              class="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            />
            <div
              class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-full transition-all duration-1000"
            />
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
                class="transition-transform group-hover:translate-x-1"
              >
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                <path d="m15 5 3 3" />
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
