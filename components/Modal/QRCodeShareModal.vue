<script setup lang="ts">
import type { Database } from '~/types/supabase';

interface Props {
    isOpen: boolean
    selectedQR: Database['public']['Tables']['qrcodes']['Row'] | null
    qrCodeImage: string | null
}

interface Emits {
    (e: 'update:isOpen', value: boolean): void
    (e: 'copyToClipboard', content: string): void
    (e: 'downloadQRCode'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const modalOpen = computed({
    get: () => props.isOpen,
    set: (value: boolean) => emit('update:isOpen', value)
})

const handleCopyToClipboard = () => {
    if (props.selectedQR?.content) {
        emit('copyToClipboard', props.selectedQR.content)
    }
}

const handleDownload = () => {
    emit('downloadQRCode')
}
</script>

<template>
    <UModal v-model:open="modalOpen" :ui="{ wrapper: 'z-50' }">
        <template #header>
            <div class="text-xl font-bold text-gray-900">Partager le QR code</div>
        </template>

        <template #body>
            <div class="space-y-4">
                <div v-if="selectedQR && qrCodeImage" class="flex justify-center">
                    <img :src="qrCodeImage" alt="QR Code" class="w-48 h-48" />
                </div>
                <div class="space-y-2">
                    <p class="text-sm text-gray-600">Partagez ce QR code via :</p>
                    <div class="flex gap-2">
                        <UButton color="primary" variant="soft" icon="i-heroicons-link" label="Copier le lien"
                            @click="handleCopyToClipboard" />
                        <UButton color="primary" variant="soft" icon="i-heroicons-arrow-down-tray"
                            label="Télécharger" @click="handleDownload" />
                    </div>
                </div>
            </div>
        </template>
    </UModal>
</template> 