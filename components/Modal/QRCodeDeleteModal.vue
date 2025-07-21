<script setup lang="ts">
import type { Database } from '~/types/supabase'

interface Props {
  isOpen: boolean
  selectedQR: Database['public']['Tables']['qrcodes']['Row'] | null
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
  set: (value: boolean) => emit('update:isOpen', value),
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
    <div
      class="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      @click="handleCancel"
    />

    <div
      class="relative w-full max-w-md rounded-2xl overflow-hidden bg-black border border-white/20 shadow-2xl"
    >
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute -top-4 -right-4 w-24 h-24 bg-red-400/10 rounded-full blur-3xl" />
        <div class="absolute -bottom-4 -left-4 w-16 h-16 bg-red-400/5 rounded-full blur-2xl" />
      </div>

      <div class="relative border-b border-white/10 p-6">
        <div class="flex items-center gap-4">
          <div
            class="w-12 h-12 bg-red-400/10 border border-red-400/20 rounded-xl flex items-center justify-center"
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
              class="text-red-400"
            >
              <path d="M3 6h18" />
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              <line x1="10" x2="10" y1="11" y2="17" />
              <line x1="14" x2="14" y1="11" y2="17" />
            </svg>
          </div>
          <div>
            <h2 class="text-xl font-bold text-white tracking-tight">Supprimer le QR code</h2>
            <p class="text-white/60 text-sm">Cette action est irréversible</p>
          </div>
        </div>
      </div>

      <div class="relative p-6 space-y-6">
        <div class="text-center">
          <p class="text-white/80 mb-2">Êtes-vous sûr de vouloir supprimer le QR code</p>
          <p class="text-xl font-semibold text-white mb-4">"{{ selectedQR?.name }}"</p>
        </div>

        <div
          class="p-4 rounded-xl bg-gradient-to-r from-red-400/10 to-rose-400/10 border border-red-400/20"
        >
          <div class="flex items-start gap-3">
            <div
              class="w-6 h-6 bg-red-400/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
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
                class="text-red-400"
              >
                <path
                  d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"
                />
                <path d="M12 9v4" />
                <path d="m12 17 .01 0" />
              </svg>
            </div>
            <div class="flex-1">
              <p class="text-sm font-medium text-red-400 mb-1">Action irréversible</p>
              <p class="text-xs text-white/70">
                Ce QR code sera définitivement supprimé. Toutes ses données et statistiques seront
                perdues.
              </p>
            </div>
          </div>
        </div>

        <div class="p-4 rounded-xl bg-white/5 border border-white/10">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <p class="text-sm font-medium text-white/90 mb-1">{{ selectedQR?.name }}</p>
              <p class="text-xs text-white/60 break-all mb-2">{{ selectedQR?.content }}</p>
              <div class="flex items-center gap-4">
                <span
                  class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                  :class="{
                    'bg-blue-400/10 text-blue-400 border border-blue-400/20':
                      selectedQR?.type === 'dynamique',
                    'bg-gray-400/10 text-gray-400 border border-gray-400/20':
                      selectedQR?.type === 'statique',
                  }"
                >
                  {{ selectedQR?.type }}
                </span>
                <span class="text-xs text-white/50"> {{ selectedQR?.scan_count || 0 }} scans </span>
              </div>
            </div>
            <div
              class="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0 ml-4"
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
                class="text-white/60"
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
        </div>

        <div class="p-3 rounded-xl bg-yellow-400/5 border border-yellow-400/10">
          <div class="flex items-center gap-2">
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
              class="text-yellow-400 flex-shrink-0"
            >
              <path
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
            <p class="text-xs text-yellow-400">
              Les liens existants vers ce QR code ne fonctionneront plus après suppression.
            </p>
          </div>
        </div>
      </div>

      <div class="relative border-t border-white/10 p-6">
        <div class="flex justify-end gap-4">
          <button
            :disabled="isDeleting"
            class="relative h-12 px-6 group overflow-hidden bg-gradient-to-br from-white/[0.03] via-white/[0.05] to-white/[0.03] backdrop-blur-md border border-white/10 rounded-xl text-white/90 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            @click="handleCancel"
          >
            <div
              class="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-full transition-all duration-1000"
            />
            <span class="relative font-medium">Annuler</span>
          </button>

          <button
            :disabled="isDeleting"
            class="relative h-12 px-8 group overflow-hidden bg-gradient-to-r from-red-500 via-red-600 to-rose-600 hover:from-red-600 hover:via-rose-600 hover:to-pink-600 text-white rounded-xl border border-red-500/20 shadow-lg hover:shadow-red-500/25 transition-all duration-500 ease-out disabled:opacity-50 disabled:cursor-not-allowed"
            @click="handleConfirmDelete"
          >
            <div
              class="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            />
            <div
              class="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-full transition-all duration-1000"
            />
            <div class="relative flex items-center justify-center gap-3">
              <span v-if="!isDeleting" class="font-semibold">Supprimer</span>
              <span v-else class="font-semibold">Suppression...</span>
              <svg
                v-if="!isDeleting"
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
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                <line x1="10" x2="10" y1="11" y2="17" />
                <line x1="14" x2="14" y1="11" y2="17" />
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
