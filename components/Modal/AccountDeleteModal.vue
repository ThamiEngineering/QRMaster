<script setup lang="ts">
interface Props {
    isOpen: boolean
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
                <div class="text-xl font-bold text-gray-900">Confirmer la suppression</div>
            </div>
        </template>

        <template #body>
            <div class="space-y-4">
                <p class="text-gray-600">
                    Êtes-vous absolument sûr de vouloir supprimer votre compte ? Cette action est <strong>irréversible</strong> et supprimera définitivement :
                </p>
                
                <ul class="list-disc list-inside text-gray-600 space-y-1 ml-4">
                    <li>Toutes vos informations personnelles</li>
                    <li>Tous vos QR codes créés</li>
                    <li>Toutes vos campagnes</li>
                    <li>Toutes vos statistiques et données de scan</li>
                </ul>

                <div class="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p class="text-sm text-red-800 font-medium">
                        ⚠️ Cette action ne peut pas être annulée
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
                    :label="isDeleting ? 'Suppression en cours...' : 'Oui, supprimer définitivement'" 
                    @click="handleConfirmDelete" 
                />
            </div>
        </template>
    </UModal>
</template> 