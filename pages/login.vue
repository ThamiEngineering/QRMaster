<script setup lang="ts">
import { useHead } from '#app'
import { ref } from 'vue'

const supabase = useSupabaseClient()
const router = useRouter()

useHead({
    title: 'QRMaster - Connexion',
    meta: [
        { name: 'description', content: 'Connectez-vous à votre espace QRMaster pour gérer vos QR codes.' }
    ]
})

const form = ref({
    email: '',
    password: ''
})

const showPassword = ref(false)
const errorMessage = ref<string | null>(null)
const loading = ref(false)

const togglePassword = () => {
    showPassword.value = !showPassword.value
}

const handleLogin = async () => {
    loading.value = true
    errorMessage.value = null
    try {
        const { error } = await supabase.auth.signInWithPassword({
            email: form.value.email,
            password: form.value.password,
        })
        if (error) throw error
        router.push('/dashboard')
    } catch (error: any) {
        errorMessage.value = error.message
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <div class="min-h-screen relative overflow-hidden" style="background-color: #ffcd00">
        <AppHeader />

        <main class="relative z-10 flex items-center justify-center px-4 py-16 min-h-[calc(100vh-7rem)]">
            <div class="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2">
                <div class="w-96 h-96 bg-yellow-300 rounded-full opacity-60"></div>
            </div>

            <div class="w-full max-w-md relative z-10">

                <div class="mb-8">
                    <h1 class="text-3xl font-bold text-gray-800 mb-2">Bienvenue</h1>
                    <p class="text-gray-700">Connectez-vous à votre espace</p>
                </div>

                <div v-if="errorMessage"
                    class="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative"
                    role="alert">
                    <span class="block sm:inline">{{ errorMessage }}</span>
                </div>
                <div v-if="loading" class="mb-4 text-center">
                    <p class="text-gray-700">Connexion en cours...</p>
                </div>

                <form @submit.prevent="handleLogin" class="space-y-6">
                    <p class="text-sm text-gray-600 italic">
                        Les champs suivis d'un <span class="text-red-500">*</span> sont obligatoires
                    </p>

                    <div>
                        <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
                            Adresse email <span class="text-red-500">*</span>
                        </label>
                        <input type="email" id="email" v-model="form.email" required
                            class="w-full px-3 py-3 border-2 border-blue-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="votre@email.com" />
                    </div>

                    <div>
                        <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
                            Mot de passe <span class="text-red-500">*</span>
                        </label>
                        <div class="relative">
                            <input :type="showPassword ? 'text' : 'password'" id="password" v-model="form.password"
                                required
                                class="w-full px-3 py-3 pr-12 border-2 border-blue-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="••••••••••••" />
                            <button type="button" @click="togglePassword"
                                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700">
                                <Icon :name="showPassword ? 'heroicons:eye-slash' : 'heroicons:eye'" class="w-5 h-5" />
                            </button>
                        </div>
                        <div class="text-right mt-2">
                            <a href="#" class="text-sm text-gray-700 underline hover:text-gray-900">
                                Mot de passe oublié
                            </a>
                        </div>
                    </div>

                    <div class="flex items-center space-x-3">
                        <div class="w-6 h-6 bg-yellow-400 rounded flex items-center justify-center">
                            <Icon name="heroicons:check" class="w-4 h-4 text-gray-800" />
                        </div>
                        <span class="text-sm text-gray-700">Je ne suis pas un robot</span>
                    </div>

                    <button type="submit" :disabled="loading"
                        class="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-3 px-4 rounded-full transition-colors disabled:opacity-50">
                        <span v-if="!loading">Se connecter</span>
                        <span v-else>Connexion...</span>
                    </button>

                    <div class="flex items-center my-6">
                        <div class="flex-1 border-t border-gray-400"></div>
                        <span class="px-4 text-gray-600 text-sm">ou</span>
                        <div class="flex-1 border-t border-gray-400"></div>
                    </div>

                    <div class="text-center">
                        <span class="text-gray-700">Vous n'avez pas de compte ? </span>
                        <NuxtLink to="/register" class="text-blue-600 underline hover:text-blue-700">
                            Créer un compte
                        </NuxtLink>
                    </div>
                </form>
            </div>
        </main>

        <footer class="absolute bottom-0 right-0 p-4">
            <div class="flex space-x-4 text-xs text-gray-700">
                <a href="#" class="underline hover:text-gray-900">Protection des données</a>
                <a href="#" class="underline hover:text-gray-900">Besoin d'aide ?</a>
                <a href="#" class="underline hover:text-gray-900">Assistance technique</a>
                <a href="#" class="underline hover:text-gray-900">CGU</a>
                <a href="#" class="underline hover:text-gray-900">Mentions légales</a>
                <a href="#" class="underline hover:text-gray-900">Accessibilité : non conforme</a>
            </div>
        </footer>
    </div>
</template>