<script setup lang="ts">
import type { Database } from '~/types/supabase';

interface Props {
    isOpen: boolean
    campaigns: Database['public']['Tables']['campaigns']['Row'][]
    isCreating: boolean
    generatedQRCode: string | null
}

interface QRCodeData {
    name: string
    type: 'statique' | 'dynamique'
    content: string
    campaign_id: number | null
}

interface Emits {
    (e: 'update:isOpen', value: boolean): void
    (e: 'create', data: QRCodeData): void
    (e: 'reset'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Computed pour gérer l'ouverture/fermeture de la modal
const modalOpen = computed({
    get: () => props.isOpen,
    set: (value: boolean) => emit('update:isOpen', value)
})

const qrCodeData = ref<QRCodeData>({
    name: '',
    type: 'statique',
    content: '',
    campaign_id: null
})

const handleCreate = () => {
    emit('create', qrCodeData.value)
}

const handleReset = () => {
    qrCodeData.value = {
        name: '',
        type: 'statique',
        content: '',
        campaign_id: null
    }
    emit('reset')
}

watch(() => props.isOpen, (newValue) => {
    if (!newValue) {
        handleReset()
    }
})
</script>

<template>
    <UModal v-model:open="modalOpen" :ui="{ wrapper: 'z-50' }">
        <template #header>
            <div class="text-xl font-bold text-gray-900">Générer un QR code</div>
        </template>

        <template #body>
            <form @submit.prevent="handleCreate" class="space-y-4">
                <div>
                    <label for="qr-name" class="block text-sm font-medium text-gray-700 mb-1">
                        Nom du QR code
                    </label>
                    <UInput id="qr-name" v-model="qrCodeData.name" placeholder="Mon QR code" required />
                </div>

                <div>
                    <label for="qr-campaign" class="block text-sm font-medium text-gray-700 mb-1">
                        Campagne (optionnel)
                    </label>
                    <USelect id="qr-campaign" v-model="qrCodeData.campaign_id" :items="[
                        { label: 'Aucune campagne', value: null },
                        ...campaigns.map(c => ({ label: c.name, value: c.id }))
                    ]" placeholder="Sélectionnez une campagne" />
                </div>

                <div>
                    <label for="qr-type" class="block text-sm font-medium text-gray-700 mb-1">
                        Type de QR code
                    </label>
                    <USelect id="qr-type" v-model="qrCodeData.type" :items="[
                        { label: 'Statique', value: 'statique', icon: 'i-heroicons-qr-code' },
                        { label: 'Dynamique', value: 'dynamique', icon: 'i-heroicons-arrow-path' }
                    ]" placeholder="Sélectionnez un type" color="primary" required />
                </div>

                <div>
                    <label for="qr-content" class="block text-sm font-medium text-gray-700 mb-1">
                        Contenu
                    </label>
                    <UTextarea id="qr-content" v-model="qrCodeData.content" placeholder="https://example.com" required />
                </div>

                <div v-if="generatedQRCode" class="flex justify-center py-4">
                    <img :src="generatedQRCode" alt="Generated QR Code" class="w-48 h-48" />
                </div>
            </form>
        </template>

        <template #footer>
            <div class="flex justify-end gap-3">
                <UButton color="neutral" variant="soft" label="Annuler" @click="handleReset" />
                <UButton color="primary" :loading="isCreating" :disabled="isCreating"
                    :label="isCreating ? 'Génération...' : 'Générer'" @click="handleCreate" />
            </div>
        </template>
    </UModal>
</template> 