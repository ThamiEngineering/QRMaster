<script setup lang="ts">
import type { Database } from '~/types/supabase'

interface Props {
  isOpen: boolean
  selectedCampaign: Database['public']['Tables']['campaigns']['Row'] | null
  isEditing: boolean
}

interface EditForm {
  name: string
  description: string | null
  status: 'active' | 'paused' | 'archived'
  start_date: string | null
  end_date: string | null
}

interface Emits {
  (e: 'update:isOpen', value: boolean): void
  (e: 'edit', form: EditForm): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const modalOpen = computed({
  get: () => props.isOpen,
  set: (value: boolean) => emit('update:isOpen', value),
})

const editForm = ref<EditForm>({
  name: '',
  description: '',
  status: 'active',
  start_date: '',
  end_date: '',
})

watch(
  () => props.selectedCampaign,
  (newCampaign) => {
    if (newCampaign) {
      editForm.value = {
        name: newCampaign.name,
        description: newCampaign.description || '',
        status: newCampaign.status,
        start_date: newCampaign.start_date || '',
        end_date: newCampaign.end_date || '',
      }
    }
  },
  { immediate: true }
)

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
      <div class="text-xl font-bold text-gray-900">Modifier la campagne</div>
    </template>

    <template #body>
      <form class="space-y-4" @submit.prevent="handleEdit">
        <div>
          <label for="edit-campaign-name" class="block text-sm font-medium text-gray-700 mb-1">
            Nom de la campagne
          </label>
          <UInput
            id="edit-campaign-name"
            v-model="editForm.name"
            placeholder="Ma campagne marketing"
            required
          />
        </div>

        <div>
          <label
            for="edit-campaign-description"
            class="block text-sm font-medium text-gray-700 mb-1"
          >
            Description (optionnel)
          </label>
          <UTextarea
            id="edit-campaign-description"
            v-model="editForm.description"
            placeholder="Description de la campagne..."
          />
        </div>

        <div>
          <label for="edit-campaign-status" class="block text-sm font-medium text-gray-700 mb-1">
            Statut
          </label>
          <USelect
            id="edit-campaign-status"
            v-model="editForm.status"
            :items="[
              { label: 'Active', value: 'active' },
              { label: 'En pause', value: 'paused' },
              { label: 'Archivée', value: 'archived' },
            ]"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="edit-campaign-start" class="block text-sm font-medium text-gray-700 mb-1">
              Date de début (optionnel)
            </label>
            <input
              id="edit-campaign-start"
              v-model="editForm.start_date"
              type="date"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            >
          </div>
          <div>
            <label for="edit-campaign-end" class="block text-sm font-medium text-gray-700 mb-1">
              Date de fin (optionnel)
            </label>
            <input
              id="edit-campaign-end"
              v-model="editForm.end_date"
              type="date"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            >
          </div>
        </div>
      </form>
    </template>

    <template #footer>
      <div class="flex justify-end gap-3">
        <UButton color="neutral" variant="soft" label="Annuler" @click="handleCancel" />
        <UButton
          color="primary"
          :loading="isEditing"
          :disabled="isEditing"
          :label="isEditing ? 'Modification...' : 'Modifier'"
          @click="handleEdit"
        />
      </div>
    </template>
  </UModal>
</template>
