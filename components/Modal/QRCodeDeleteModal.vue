<script setup lang="ts">
import type { Database } from '~/types/supabase';

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
    <UModal v-model:open="modalOpen" :ui="{ wrapper: 'z-50' }">
        <template #header>
            <div class="text-xl font-bold text-gray-900">Supprimer le QR code</div>
        </template>

        <template #body>
            <div class="space-y-4">
                <p class="text-gray-600">
                    Êtes-vous sûr de vouloir supprimer le QR code
                    <span class="font-semibold">"{{ selectedQR?.name }}"</span> ?
                </p>
                <p class="text-sm text-red-600">
                    Cette action est irréversible.
                </p>
            </div>
        </template>

        <template #footer>
            <div class="flex justify-end gap-3">
                <UButton color="neutral" variant="soft" label="Annuler" @click="handleCancel" />
                <UButton color="error" :loading="isDeleting" :disabled="isDeleting"
                    :label="isDeleting ? 'Suppression...' : 'Supprimer'" @click="handleConfirmDelete" />
            </div>
        </template>
    </UModal>
</template> 