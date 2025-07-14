<script setup lang="ts">
import { useHead } from '#app'
import { ref } from 'vue'

const supabase = useSupabaseClient()
const router = useRouter()

useHead({
    title: 'QRMaster - Créer un compte',
    meta: [
        { name: 'description', content: 'Créez votre compte QRMaster et commencez à gérer vos QR codes.' }
    ]
})

const form = ref({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
})

const showPassword = ref(false)
const showConfirmPassword = ref(false)
const errorMessage = ref<string | null>(null)
const loading = ref(false)

const togglePassword = () => {
    showPassword.value = !showPassword.value
}

const toggleConfirmPassword = () => {
    showConfirmPassword.value = !showConfirmPassword.value
}

const handleRegister = async () => {
    if (form.value.password.length < 6) {
        errorMessage.value = 'Le mot de passe doit contenir au moins 6 caractères.'
        return
    }
    if (form.value.password !== form.value.confirmPassword) {
        errorMessage.value = 'Les mots de passe ne correspondent pas.'
        return
    }

    loading.value = true
    errorMessage.value = null

    try {
        const { error } = await supabase.auth.signUp({
            email: form.value.email,
            password: form.value.password,
            options: {
                data: {
                    first_name: form.value.firstName,
                    last_name: form.value.lastName,
                    company_name: form.value.company,
                }
            }
        })
        if (error) throw error
        router.push('/login')
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
                    <h1 class="text-3xl font-bold text-gray-800 mb-2">Créer un compte</h1>
                    <p class="text-gray-700">Rejoignez QRMaster et gérez vos QR codes</p>
                </div>

                <div v-if="errorMessage" class="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md"
                    role="alert">
                    {{ errorMessage }}
                </div>

                <form @submit.prevent="handleRegister" class="space-y-6">
                    <p class="text-sm text-gray-600 italic">
                        Les champs suivis d'un <span class="text-red-500">*</span> sont obligatoires
                    </p>

                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label for="firstName" class="block text-sm font-medium text-gray-700 mb-2">
                                Prénom <span class="text-red-500">*</span>
                            </label>
                            <input type="text" id="firstName" v-model="form.firstName" required
                                class="w-full px-3 py-3 border-2 border-blue-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Prénom" />
                        </div>
                        <div>
                            <label for="lastName" class="block text-sm font-medium text-gray-700 mb-2">
                                Nom <span class="text-red-500">*</span>
                            </label>
                            <input type="text" id="lastName" v-model="form.lastName" required
                                class="w-full px-3 py-3 border-2 border-blue-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Nom" />
                        </div>
                    </div>

                    <div>
                        <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
                            Adresse email <span class="text-red-500">*</span>
                        </label>
                        <input type="email" id="email" v-model="form.email" required
                            class="w-full px-3 py-3 border-2 border-blue-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="votre@email.com" />
                    </div>

                    <div>
                        <label for="company" class="block text-sm font-medium text-gray-700 mb-2">
                            Entreprise
                        </label>
                        <input type="text" id="company" v-model="form.company"
                            class="w-full px-3 py-3 border-2 border-blue-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Nom de votre entreprise" />
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
                    </div>

                    <div>
                        <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-2">
                            Confirmer le mot de passe <span class="text-red-500">*</span>
                        </label>
                        <div class="relative">
                            <input :type="showConfirmPassword ? 'text' : 'password'" id="confirmPassword"
                                v-model="form.confirmPassword" required
                                class="w-full px-3 py-3 pr-12 border-2 border-blue-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="••••••••••••" />
                            <button type="button" @click="toggleConfirmPassword"
                                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700">
                                <Icon :name="showConfirmPassword ? 'heroicons:eye-slash' : 'heroicons:eye'"
                                    class="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div class="flex items-start space-x-3">
                        <input type="checkbox" id="terms" v-model="form.acceptTerms" required
                            class="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                        <label for="terms" class="text-sm text-gray-700">
                            J'accepte les
                            <a href="#" class="text-blue-600 underline hover:text-blue-700">conditions d'utilisation</a>
                            et la
                            <a href="#" class="text-blue-600 underline hover:text-blue-700">politique de
                                confidentialité</a>
                            <span class="text-red-500">*</span>
                        </label>
                    </div>

                    <div class="flex items-center space-x-3">
                        <div class="w-6 h-6 bg-yellow-400 rounded flex items-center justify-center">
                            <Icon name="heroicons:check" class="w-4 h-4 text-gray-800" />
                        </div>
                        <span class="text-sm text-gray-700">Je ne suis pas un robot</span>
                    </div>

                    <button type="submit" :disabled="!form.acceptTerms || loading"
                        class="w-full bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 disabled:cursor-not-allowed text-gray-800 font-medium py-3 px-4 rounded-full transition-colors">
                        <span v-if="!loading">Créer mon compte</span>
                        <span v-else>Création en cours...</span>
                    </button>

                    <div class="text-center">
                        <span class="text-gray-700">Vous avez déjà un compte ? </span>
                        <NuxtLink to="/login" class="text-blue-600 underline hover:text-blue-700">
                            Se connecter
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