<script setup lang="ts">
import type { Database } from '~/types/supabase';

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
    <UModal v-model:open="modalOpen" :ui="{ wrapper: 'z-50' }">
        <template #header>
            <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <Icon name="heroicons:exclamation-triangle" class="w-5 h-5 text-red-600" />
                </div>
                <div class="text-xl font-bold text-gray-900">Supprimer la campagne</div>
            </div>
        </template>

        <template #body>
            <div class="space-y-4">
                <p class="text-gray-600">
                    Êtes-vous sûr de vouloir supprimer la campagne
                    <span class="font-semibold">"{{ selectedCampaign?.name }}"</span> ?
                </p>
                
                <div class="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p class="text-sm text-yellow-800">
                        <Icon name="heroicons:information-circle" class="w-4 h-4 inline mr-1" />
                        Tous les QR codes associés à cette campagne seront également supprimés.
                    </p>
                </div>

                <div class="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p class="text-sm text-red-800 font-medium">
                        ⚠️ Cette action est irréversible
                    </p>
                </div>
            </div>
        </template>

        <template #footer>
            <div class="flex justify-end gap-3">
                <UButton 
                    color="neutral" 
                    variant="soft" 
                    label="Annuler" 
                    @click="handleCancel"
                    :disabled="isDeleting"
                />
                <UButton 
                    color="error" 
                    :loading="isDeleting" 
                    :disabled="isDeleting"
                    icon="i-heroicons-trash"
                    :label="isDeleting ? 'Suppression...' : 'Supprimer définitivement'" 
                    @click="handleConfirmDelete" 
                />
            </div>
        </template>
    </UModal>
</template> 