<script setup lang="ts">
import QRCode from 'qrcode';
import { onMounted, ref, watch } from 'vue';
import type { Database } from '~/types/supabase';

type QRCodeType = Database['public']['Tables']['qrcodes']['Row']
type QRCodeWithImage = QRCodeType & { qr_code_image?: string };

const props = defineProps<{
    qrcodes: QRCodeType[]
    campaigns?: Database['public']['Tables']['campaigns']['Row'][]
}>()

const emit = defineEmits<{
    (e: 'edit', id: number): void
    (e: 'share', id: number): void
    (e: 'delete', id: number): void
}>()

const qrcodesWithImages = ref<QRCodeWithImage[]>([])
const showShareModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const selectedQR = ref<QRCodeWithImage | null>(null)
const isEditing = ref(false)
const isDeleting = ref(false)
const toast = useToast()

const editForm = ref({
    name: '',
    type: 'statique' as 'statique' | 'dynamique',
    content: '',
    campaign_id: null as number | null
})

const generateQrCodeImages = async () => {
    const promises = props.qrcodes.map(async (qr) => {
        if (!qr.content) {
            return { ...qr, qr_code_image: '' }
        }
        try {
            const imageUrl = await QRCode.toDataURL(qr.content, { width: 128, margin: 1 });
            return { ...qr, qr_code_image: imageUrl };
        } catch (err) {
            console.error('Failed to generate QR code image for:', qr.name, err);
            return { ...qr, qr_code_image: '' };
        }
    });
    qrcodesWithImages.value = await Promise.all(promises);
};

const openShareModal = (qr: QRCodeWithImage) => {
    selectedQR.value = qr;
    showShareModal.value = true;
}

const openEditModal = (qr: QRCodeWithImage) => {
    selectedQR.value = qr;
    editForm.value = {
        name: qr.name || '',
        type: (qr.type as 'statique' | 'dynamique') || 'statique',
        content: qr.content || '',
        campaign_id: qr.campaign_id || null
    };
    showEditModal.value = true;
}

const handleDeleteQRCode = (qr: QRCodeWithImage) => {
    selectedQR.value = qr;
    showDeleteModal.value = true;
}

const confirmDeleteQRCode = async () => {
    if (!selectedQR.value) return;

    isDeleting.value = true;
    try {
        const supabase = useSupabaseClient();
        const { error } = await supabase
            .from('qrcodes')
            .delete()
            .eq('id', selectedQR.value.id);

        if (error) throw error;

        const index = qrcodesWithImages.value.findIndex(qr => qr.id === selectedQR.value!.id);
        if (index !== -1) {
            qrcodesWithImages.value.splice(index, 1);
        }

        toast.add({
            title: 'QR Code supprimé !',
            description: `Le QR code "${selectedQR.value.name}" a été supprimé.`,
            color: 'success',
            icon: 'i-heroicons-trash'
        })

        showDeleteModal.value = false;
        emit('delete', selectedQR.value.id);
    } catch (error) {
        console.error('Error deleting QR code:', error);
        toast.add({
            title: 'Erreur lors de la suppression',
            description: 'Une erreur est survenue lors de la suppression du QR code.',
            color: 'error',
            icon: 'i-heroicons-exclamation-triangle'
        })
    } finally {
        isDeleting.value = false;
    }
}

const copyToClipboard = async (content: string | null | undefined) => {
    if (!content) return;
    try {
        await navigator.clipboard.writeText(content);
        toast.add({
            title: 'Lien copié !',
            description: 'Le lien du QR code a été copié dans le presse-papier.',
            color: 'success',
            icon: 'i-heroicons-check-circle'
        })
    } catch (err) {
        console.error('Failed to copy:', err);
        toast.add({
            title: 'Erreur de copie',
            description: 'Impossible de copier le lien.',
            color: 'error',
            icon: 'i-heroicons-exclamation-triangle'
        })
    }
}

const downloadQRCode = () => {
    if (!selectedQR.value?.qr_code_image) return;

    const link = document.createElement('a');
    link.download = `qrcode-${selectedQR.value.name}.png`;
    link.href = selectedQR.value.qr_code_image;
    link.click();

    toast.add({
        title: 'Téléchargement lancé !',
        description: `Le QR code "${selectedQR.value.name}" a été téléchargé.`,
        color: 'success',
        icon: 'i-heroicons-arrow-down-tray'
    })
}

const handleEditQRCode = async () => {
    if (!selectedQR.value) return;

    isEditing.value = true;
    try {
        const supabase = useSupabaseClient();
        const { data, error } = await supabase
            .from('qrcodes')
            .update({
                name: editForm.value.name,
                type: editForm.value.type,
                content: editForm.value.content,
                campaign_id: editForm.value.campaign_id
            })
            .eq('id', selectedQR.value.id)
            .select();

        if (error) throw error;

        const updatedQR = {
            ...selectedQR.value,
            name: editForm.value.name,
            type: editForm.value.type,
            content: editForm.value.content,
            campaign_id: editForm.value.campaign_id
        };

        if (editForm.value.content !== selectedQR.value.content) {
            try {
                updatedQR.qr_code_image = await QRCode.toDataURL(editForm.value.content, { width: 128, margin: 1 });
            } catch (err) {
                console.error('Failed to generate new QR code image:', err);
            }
        }

        const index = qrcodesWithImages.value.findIndex(qr => qr.id === selectedQR.value!.id);
        if (index !== -1) {
            qrcodesWithImages.value[index] = updatedQR;
        }

        toast.add({
            title: 'QR Code modifié avec succès !',
            description: `Le QR code "${editForm.value.name}" a été mis à jour.`,
            color: 'success',
            icon: 'i-heroicons-pencil-square'
        })

        showEditModal.value = false;
        emit('edit', selectedQR.value.id);
    } catch (error) {
        console.error('Error updating QR code:', error);
        toast.add({
            title: 'Erreur lors de la modification',
            description: 'Une erreur est survenue lors de la modification du QR code.',
            color: 'error',
            icon: 'i-heroicons-exclamation-triangle'
        })
    } finally {
        isEditing.value = false;
    }
}

onMounted(generateQrCodeImages);
watch(() => props.qrcodes, generateQrCodeImages, { deep: true });
</script>

<template>
    <div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <div v-for="qr in qrcodesWithImages" :key="qr.id"
                class="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col hover:shadow-lg transition-all duration-200 relative">

                <button @click="handleDeleteQRCode(qr)"
                    class="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    title="Supprimer ce QR code">
                    <Icon name="heroicons:trash" class="w-4 h-4" />
                </button>

                <div class="bg-gray-100 rounded-lg mb-4 flex items-center justify-center p-4">
                    <img v-if="qr.qr_code_image" :src="qr.qr_code_image" alt="QR Code" class="w-24 h-24" />
                    <div v-else class="w-24 h-24 flex items-center justify-center">
                        <Icon name="heroicons:arrow-path" class="w-12 h-12 text-gray-300 animate-spin" />
                    </div>
                </div>

                <div class="flex-grow">
                    <span class="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-800">
                        Actif
                    </span>
                    <h3 class="font-bold text-lg text-gray-900 mt-3">{{ qr.name }}</h3>
                    <p class="text-sm text-gray-500 mt-1 truncate" :title="qr.content || ''">{{ qr.content }}</p>

                    <div class="mt-3 flex flex-wrap gap-2">
                        <span class="text-xs font-medium px-2 py-1 rounded-full" :class="{
                            'bg-blue-100 text-blue-800': qr.type === 'dynamique',
                            'bg-purple-100 text-purple-800': qr.type === 'statique'
                        }">
                            {{ qr.type }}
                        </span>

                        <span v-if="qr.campaign_id && campaigns"
                            class="text-xs font-medium px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
                            {{campaigns.find(c => c.id === qr.campaign_id)?.name}}
                        </span>
                    </div>
                </div>

                <div class="border-t border-gray-100 pt-4 mt-4">
                    <div class="flex justify-between items-center text-xs text-gray-500 mb-4">
                        <span>
                            <Icon name="heroicons:chart-bar" class="w-4 h-4 inline -mt-0.5" />
                            {{ qr.scan_count }} scans
                        </span>
                        <span>
                            <Icon name="heroicons:calendar" class="w-4 h-4 inline -mt-0.5" />
                            {{ new Date(qr.created_at).toLocaleDateString() }}
                        </span>
                    </div>
                    <div class="flex gap-2">
                        <button @click="openShareModal(qr)"
                            class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium py-2 px-2 rounded-lg flex items-center justify-center gap-1 transition-colors">
                            <Icon name="heroicons:share" class="w-3 h-3" />
                            <span class="hidden sm:inline">Partager</span>
                        </button>
                        <button @click="openEditModal(qr)"
                            class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium py-2 px-2 rounded-lg flex items-center justify-center gap-1 transition-colors">
                            <Icon name="heroicons:pencil" class="w-3 h-3" />
                            <span class="hidden sm:inline">Modifier</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <UModal v-model:open="showShareModal" :ui="{ wrapper: 'z-50' }">
            <template #header>
                <div class="text-xl font-bold text-gray-900">Partager le QR code</div>
            </template>

            <template #body>
                <div class="space-y-4">
                    <div v-if="selectedQR" class="flex justify-center">
                        <img :src="selectedQR.qr_code_image" alt="QR Code" class="w-48 h-48" />
                    </div>
                    <div class="space-y-2">
                        <p class="text-sm text-gray-600">Partagez ce QR code via :</p>
                        <div class="flex gap-2">
                            <UButton color="primary" variant="soft" icon="i-heroicons-link" label="Copier le lien"
                                @click="copyToClipboard(selectedQR?.content)" />
                            <UButton color="primary" variant="soft" icon="i-heroicons-arrow-down-tray"
                                label="Télécharger" @click="downloadQRCode" />
                        </div>
                    </div>
                </div>
            </template>
        </UModal>

        <UModal v-model:open="showEditModal" :ui="{ wrapper: 'z-50' }">
            <template #header>
                <div class="text-xl font-bold text-gray-900">Modifier le QR code</div>
            </template>

            <template #body>
                <form @submit.prevent="handleEditQRCode" class="space-y-4">
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
                            ...(campaigns?.map(c => ({ label: c.name, value: c.id })) || [])
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
                    <UButton color="neutral" variant="soft" label="Annuler" @click="showEditModal = false" />
                    <UButton color="primary" :loading="isEditing" :disabled="isEditing"
                        :label="isEditing ? 'Modification...' : 'Modifier'" @click="handleEditQRCode" />
                </div>
            </template>
        </UModal>

        <UModal v-model:open="showDeleteModal" :ui="{ wrapper: 'z-50' }">
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
                    <UButton color="neutral" variant="soft" label="Annuler" @click="showDeleteModal = false" />
                    <UButton color="error" :loading="isDeleting" :disabled="isDeleting"
                        :label="isDeleting ? 'Suppression...' : 'Supprimer'" @click="confirmDeleteQRCode" />
                </div>
            </template>
        </UModal>
    </div>
</template>