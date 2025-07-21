<script setup lang="ts">
import type {Database} from '~/types/supabase';

interface Props {
  isOpen: boolean
  selectedCampaign: Database['public']['Tables']['campaigns']['Row'] | null
  isDeleting: boolean
}

interface Emits {
  (e: 'update:isOpen', value: boolean): void

  (e: 'confirmDelete'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const modalOpen = computed({
  get: () => props.isOpen,
  set: (value: boolean) => emit('update:isOpen', value)
})

const handleConfirmDelete = () => {
  emit('confirmDelete')
}

const handleCancel = () => {
  modalOpen.value = false
}
</script>

<template>
  <div v-if="modalOpen" class="fixed inset-0 z-[60] flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" @click="handleCancel"></div>

    <div class="relative w-full max-w-md rounded-2xl overflow-hidden bg-black border border-white/20 shadow-2xl">
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute -top-4 -right-4 w-24 h-24 bg-red-400/10 rounded-full blur-3xl"></div>
        <div class="absolute -bottom-4 -left-4 w-16 h-16 bg-red-400/5 rounded-full blur-2xl"></div>
      </div>

      <div class="relative border-b border-white/10 p-6">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-red-400/10 border border-red-400/20 rounded-xl flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                 class="text-red-400">
              <path d="M3 6h18"/>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
              <line x1="10" x2="10" y1="11" y2="17"/>
              <line x1="14" x2="14" y1="11" y2="17"/>
            </svg>
          </div>
          <div>
            <h2 class="text-xl font-bold text-white tracking-tight">Supprimer la campagne</h2>
            <p class="text-white/60 text-sm">Cette action est irréversible</p>
          </div>
        </div>
      </div>

      <div class="relative p-6 space-y-6">
        <div class="text-center">
          <p class="text-white/80 mb-2">
            Êtes-vous sûr de vouloir supprimer la campagne
          </p>
          <p class="text-xl font-semibold text-white mb-4">
            "{{ selectedCampaign?.name }}"
          </p>
        </div>

        <div class="space-y-3">
          <div class="p-4 rounded-xl bg-gradient-to-r from-yellow-400/10 to-amber-400/10 border border-yellow-400/20">
            <div class="flex items-start gap-3">
              <div class="w-6 h-6 bg-yellow-400/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                     class="text-yellow-400">
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                  <path d="M12 9v4"/>
                  <path d="m12 17 .01 0"/>
                </svg>
              </div>
              <div class="flex-1">
                <p class="text-sm font-medium text-yellow-400 mb-1">Impact sur les QR codes</p>
                <p class="text-xs text-white/70">Tous les QR codes associés à cette campagne seront également
                  supprimés.</p>
              </div>
            </div>
          </div>

          <div class="p-4 rounded-xl bg-gradient-to-r from-red-400/10 to-rose-400/10 border border-red-400/20">
            <div class="flex items-start gap-3">
              <div class="w-6 h-6 bg-red-400/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                     class="text-red-400">
                  <path d="M3 6h18"/>
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                </svg>
              </div>
              <div class="flex-1">
                <p class="text-sm font-medium text-red-400 mb-1">Action irréversible</p>
                <p class="text-xs text-white/70">Cette action ne peut pas être annulée. Toutes les données seront
                  perdues.</p>
              </div>
            </div>
          </div>
        </div>

        <div class="p-4 rounded-xl bg-white/5 border border-white/10">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-white/90">Campagne sélectionnée</p>
              <p class="text-xs text-white/60">{{ selectedCampaign?.name }}</p>
            </div>
            <div class="text-right">
              <p class="text-xs text-white/60">Statut</p>
              <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium" :class="{
                    'bg-green-400/10 text-green-400 border border-green-400/20': selectedCampaign?.status === 'active',
                    'bg-yellow-400/10 text-yellow-400 border border-yellow-400/20': selectedCampaign?.status === 'paused',
                    'bg-gray-400/10 text-gray-400 border border-gray-400/20': selectedCampaign?.status === 'archived'
                }">
                    <span v-if="selectedCampaign?.status === 'active'">Active</span>
                    <span v-else-if="selectedCampaign?.status === 'paused'">En pause</span>
                    <span v-else>Archivée</span>
                </span>
            </div>
          </div>
        </div>
      </div>

      <div class="relative border-t border-white/10 p-6">
        <div class="flex justify-end gap-4">
          <button @click="handleCancel" :disabled="isDeleting"
                  class="relative h-12 px-6 group overflow-hidden bg-gradient-to-br from-white/[0.03] via-white/[0.05] to-white/[0.03] backdrop-blur-md border border-white/10 rounded-xl text-white/90 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
            <div
                class="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-full transition-all duration-1000"></div>
            <span class="relative font-medium">Annuler</span>
          </button>

          <button @click="handleConfirmDelete" :disabled="isDeleting"
                  class="relative h-12 px-8 group overflow-hidden bg-gradient-to-r from-red-500 via-red-600 to-rose-600 hover:from-red-600 hover:via-rose-600 hover:to-pink-600 text-white rounded-xl border border-red-500/20 shadow-lg hover:shadow-red-500/25 transition-all duration-500 ease-out disabled:opacity-50 disabled:cursor-not-allowed">
            <div
                class="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div
                class="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-full transition-all duration-1000"></div>
            <div class="relative flex items-center justify-center gap-3">
              <span v-if="!isDeleting" class="font-semibold">Supprimer</span>
              <span v-else class="font-semibold">Suppression...</span>
              <svg v-if="!isDeleting" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                   fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                   class="transition-transform group-hover:scale-110">
                <path d="M3 6h18"/>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                <line x1="10" x2="10" y1="11" y2="17"/>
                <line x1="14" x2="14" y1="11" y2="17"/>
              </svg>
              <svg v-else class="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>