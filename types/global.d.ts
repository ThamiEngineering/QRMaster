declare global {
    const definePageMeta: typeof import('#app')['definePageMeta']
    const navigateTo: typeof import('#app')['navigateTo']
    const useRoute: typeof import('#app')['useRoute']
    const useRouter: typeof import('#app')['useRouter']
    const useHead: typeof import('#app')['useHead']
    const useSeoMeta: typeof import('#app')['useSeoMeta']
    const useState: typeof import('#app')['useState']
    const useRuntimeConfig: typeof import('#app')['useRuntimeConfig']
    const useCookie: typeof import('#app')['useCookie']
    const useRequestHeaders: typeof import('#app')['useRequestHeaders']
    const useSupabaseClient: typeof import('#supabase/nuxt')['useSupabaseClient']
    const useSupabaseUser: typeof import('#supabase/nuxt')['useSupabaseUser']
    const useToast: typeof import('#ui/types')['useToast']
}

export { }
