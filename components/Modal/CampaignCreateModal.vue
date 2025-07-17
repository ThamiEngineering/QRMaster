<script setup lang="ts">
interface Props {
    isOpen: boolean
    isCreating: boolean
}

interface CampaignData {
    name: string
    description: string
    status: 'active' | 'paused' | 'archived'
    start_date: string
    end_date: string
}

interface Emits {
    (e: 'update:isOpen', value: boolean): void
    (e: 'create', data: CampaignData): void
    (e: 'reset'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const modalOpen = computed({
    get: () => props.isOpen,
    set: (value: boolean) => emit('update:isOpen', value)
})

const campaignData = ref<CampaignData>({
    name: '',
    description: '',
    status: 'active',
    start_date: '',
    end_date: ''
})

const handleCreate = () => {
    emit('create', campaignData.value)
}

const handleReset = () => {
    campaignData.value = {
        name: '',
        description: '',
        status: 'active',
        start_date: '',
        end_date: ''
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
            <div class="text-xl font-bold text-gray-900">Créer une campagne</div>
        </template>

        <template #body>
            <form @submit.prevent="handleCreate" class="space-y-4">
                <div>
                    <label for="campaign-name" class="block text-sm font-medium text-gray-700 mb-1">
                        Nom de la campagne
                    </label>
                    <UInput id="campaign-name" v-model="campaignData.name" placeholder="Ma campagne marketing" required />
                </div>

                <div>
                    <label for="campaign-description" class="block text-sm font-medium text-gray-700 mb-1">
                        Description (optionnel)
                    </label>
                    <UTextarea id="campaign-description" v-model="campaignData.description"
                        placeholder="Description de la campagne..." />
                </div>

                <div>
                    <label for="campaign-status" class="block text-sm font-medium text-gray-700 mb-1">
                        Statut
                    </label>
                    <USelect id="campaign-status" v-model="campaignData.status" :items="[
                        { label: 'Active', value: 'active' },
                        { label: 'En pause', value: 'paused' },
                        { label: 'Archivée', value: 'archived' }
                    ]" />
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label for="campaign-start" class="block text-sm font-medium text-gray-700 mb-1">
                            Date de début (optionnel)
                        </label>
                        <input type="date" id="campaign-start" v-model="campaignData.start_date"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent" />
                    </div>
                    <div>
                        <label for="campaign-end" class="block text-sm font-medium text-gray-700 mb-1">
                            Date de fin (optionnel)
                        </label>
                        <input type="date" id="campaign-end" v-model="campaignData.end_date"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent" />
                    </div>
                </div>
            </form>
        </template>

        <template #footer>
            <div class="flex justify-end gap-3">
                <UButton color="neutral" variant="soft" label="Annuler" @click="handleReset" />
                <UButton color="primary" :loading="isCreating" :disabled="isCreating"
                    :label="isCreating ? 'Création...' : 'Créer'" @click="handleCreate" />
            </div>
        </template>
    </UModal>
</template> 