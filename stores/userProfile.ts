import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Database } from '~/types/supabase'

export const useUserProfileStore = defineStore('userProfile', () => {
  const profile = ref<Database['public']['Tables']['profiles']['Row'] | null>(null)

  function setProfile(newProfile: Database['public']['Tables']['profiles']['Row']) {
    profile.value = newProfile
  }

  function updateProfileFields(fields: Partial<Database['public']['Tables']['profiles']['Row']>) {
    if (profile.value) {
      profile.value = { ...profile.value, ...fields }
    }
  }

  return { profile, setProfile, updateProfileFields }
})