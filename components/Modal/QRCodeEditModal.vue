<script setup lang="ts">
import type { Database } from '~/types/supabase';

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
    set: (value: boolean) => emit('update:isOpen', value)
})

const editForm = ref<EditForm>({
    name: '',
    type: '',
    content: '',
    campaign_id: null
})

watch(() => props.selectedQR, (newQR) => {
    if (newQR) {
        editForm.value = {
            name: newQR.name,
            type: newQR.type,
            content: newQR.content,
            campaign_id: newQR.campaign_id
        }
    }
}, { immediate: true })

const handleEdit = () => {
    emit('edit', editForm.value)
}

const handleCancel = () => {
    modalOpen.value = false
}
</script>

<template>
    <UModal v-model:open="modalOpen" :ui="{ wrapper: 'z-50' }">
        <template #header>
            <div class="text-xl font-bold text-gray-900">Modifier le QR code</div>
        </template>

        <template #body>
            <form @submit.prevent="handleEdit" class="space-y-4">
                <div>
                    <label for="edit-name" class="block text-sm font-medium text-gray-700 mb-1">
                        Nom du QR code
                    </label>
                    <UInput id="edit-name" v-model="editForm.name" placeholder="Mon QR code" required />
                </div>

                <div>
                    <label for="edit-campaign" class="block text-sm font-medium text-gray-700 mb-1">
                        Campagne (optionnel)
                    </label>
                    <USelect id="edit-campaign" v-model="editForm.campaign_id" :items="[
                        { label: 'Aucune campagne', value: null },
                        ...campaigns.map(c => ({ label: c.name, value: c.id }))
                    ]" placeholder="Sélectionnez une campagne" />
                </div>

                <div>
                    <label for="edit-type" class="block text-sm font-medium text-gray-700 mb-1">
                        Type de QR code
                    </label>
                    <USelect id="edit-type" v-model="editForm.type" :items="[
                        { label: 'Statique', value: 'statique', icon: 'i-heroicons-qr-code' },
                        { label: 'Dynamique', value: 'dynamique', icon: 'i-heroicons-arrow-path' }
                    ]" required />
                </div>

                <div>
                    <label for="edit-content" class="block text-sm font-medium text-gray-700 mb-1">
                        Contenu
                    </label>
                    <UTextarea id="edit-content" v-model="editForm.content" placeholder="https://example.com"
                        required />
                </div>
            </form>
        </template>

        <template #footer>
            <div class="flex justify-end gap-3">
                <UButton color="neutral" variant="soft" label="Annuler" @click="handleCancel" />
                <UButton color="primary" :loading="isEditing" :disabled="isEditing"
                    :label="isEditing ? 'Modification...' : 'Modifier'" @click="handleEdit" />
            </div>
        </template>
    </UModal>
</template> 