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
    <div class="relative min-h-screen bg-black text-white overflow-hidden">
        <!-- Background Effects -->
        <div class="absolute inset-0 overflow-hidden pointer-events-none select-none">
            <div
                class="absolute -left-4 top-1/2 -translate-y-1/2 -rotate-180 text-white/[0.03] text-[20rem] font-bold tracking-tighter [writing-mode:vertical-rl] blur-[1px]">
                QRMASTER
            </div>
            <div
                class="absolute -right-4 top-1/2 -translate-y-1/2 -rotate-180 text-white/[0.03] text-[20rem] font-bold tracking-tighter [writing-mode:vertical-rl] blur-[1px]">
                REGISTER
            </div>
        </div>

        <!-- Navigation -->
        <nav class="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex items-center justify-between h-16">
                    <NuxtLink to="/" class="text-xl font-medium tracking-tight flex items-center gap-2"
                        aria-label="QRMaster Homepage">
                        <div class="relative w-8 h-8">
                            <div class="absolute inset-0 bg-yellow-400/20 rounded-xl blur-sm"></div>
                            <div
                                class="relative w-full h-full rounded-xl bg-black border border-yellow-400/20 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                    stroke-linejoin="round" class="h-4 w-4 text-yellow-400">
                                    <rect width="5" height="5" x="3" y="3" rx="1" />
                                    <rect width="5" height="5" x="16" y="3" rx="1" />
                                    <rect width="5" height="5" x="3" y="16" rx="1" />
                                    <path d="m21 16-3.5-3.5-1 1-1.5-1.5" />
                                    <path d="m21 21-3.5-3.5-1 1-1.5-1.5" />
                                    <path d="M13 13l1.5 1.5L16 13" />
                                </svg>
                            </div>
                        </div>
                        QRMaster
                    </NuxtLink>

                    <div class="hidden md:flex items-center gap-4">
                        <NuxtLink to="/login"
                            class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-zinc-950 dark:focus-visible:ring-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 h-10 px-4 py-2 text-white/70 hover:text-white hover:bg-white/5"
                            aria-label="Se connecter">
                            Se connecter
                        </NuxtLink>
                    </div>
                </div>
            </div>
        </nav>

        <!-- Main Content -->
        <div class="relative">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
                <div class="text-center max-w-4xl mx-auto mb-16">
                    <div style="opacity: 1; transform: none;">
                        <!-- Beta Badge -->
                        <div
                            class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-400/10 border border-yellow-400/20 mb-8 backdrop-blur-sm">
                            <span class="text-sm font-medium text-yellow-400 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                    stroke-linejoin="round">
                                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                    <circle cx="9" cy="7" r="4" />
                                    <path d="m22 2-5 5" />
                                    <path d="m17 7 5-5" />
                                </svg>
                                Rejoignez QRMaster
                            </span>
                        </div>

                        <!-- Title -->
                        <div class="space-y-6">
                            <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tighter leading-[0.95]"
                                style="opacity: 1; transform: none;">
                                <span class="inline-block" style="opacity: 1; transform: none;">Créez votre</span>
                                <span class="block mt-3 text-yellow-400 relative" style="opacity: 1; transform: none;">
                                    <span class="relative z-10">compte QRMaster</span>
                                    <div class="absolute inset-0 bg-yellow-400/10 blur-3xl -z-10 animate-pulse"></div>
                                </span>
                            </h1>
                            <p class="text-lg text-white/60 max-w-2xl mx-auto leading-relaxed"
                                style="opacity: 1; transform: none;">
                                Rejoignez des milliers d'utilisateurs qui font confiance à QRMaster pour gérer leurs QR
                                codes professionnels.
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Register Form Container -->
                <div class="flex justify-center">
                    <div
                        class="group relative w-full max-w-lg p-8 rounded-2xl overflow-hidden bg-gradient-to-br from-white/[0.03] via-white/[0.05] to-white/[0.03] backdrop-blur-md border border-white/10 hover:border-white/20 shadow-2xl transition-all duration-500 ease-out">

                        <!-- Form Background Effect -->
                        <div
                            class="absolute inset-0 bg-gradient-to-br opacity-20 from-yellow-500/10 via-amber-500/10 to-orange-500/10">
                        </div>
                        <div
                            class="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-full transition-all duration-1000">
                        </div>

                        <div class="relative space-y-6">
                            <!-- Form Header -->
                            <div class="text-center space-y-2">
                                <h2 class="text-2xl font-bold text-white tracking-tight">Créer un compte</h2>
                                <p class="text-white/60">Commencez votre aventure QRMaster</p>
                            </div>

                            <!-- Error Message -->
                            <div v-if="errorMessage"
                                class="relative p-4 rounded-xl overflow-hidden bg-gradient-to-br from-red-500/10 via-red-500/5 to-red-500/10 backdrop-blur-md border border-red-500/20">
                                <div
                                    class="absolute inset-0 bg-gradient-to-br opacity-20 from-red-500/20 via-red-500/10 to-red-500/20">
                                </div>
                                <div class="relative flex items-center gap-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
                                        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                        stroke-linejoin="round" class="text-red-400 shrink-0">
                                        <circle cx="12" cy="12" r="10" />
                                        <line x1="15" x2="9" y1="9" y2="15" />
                                        <line x1="9" x2="15" y1="9" y2="15" />
                                    </svg>
                                    <span class="text-sm text-red-300">{{ errorMessage }}</span>
                                </div>
                            </div>

                            <!-- Register Form -->
                            <form @submit.prevent="handleRegister" class="space-y-5">
                                <!-- Required Fields Notice -->
                                <p class="text-xs text-white/50 italic text-center">
                                    Les champs suivis d'un <span class="text-yellow-400">*</span> sont obligatoires
                                </p>

                                <!-- Name Fields Row -->
                                <div class="grid grid-cols-2 gap-4">
                                    <div class="space-y-2">
                                        <label for="firstName" class="block text-sm font-medium text-white/90">
                                            Prénom <span class="text-yellow-400">*</span>
                                        </label>
                                        <div class="relative">
                                            <input type="text" id="firstName" v-model="form.firstName" required
                                                class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 transition-all duration-300 hover:border-white/20"
                                                placeholder="Prénom" />
                                            <div
                                                class="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent opacity-0 focus-within:opacity-100 transition-opacity duration-300">
                                            </div>
                                        </div>
                                    </div>

                                    <div class="space-y-2">
                                        <label for="lastName" class="block text-sm font-medium text-white/90">
                                            Nom <span class="text-yellow-400">*</span>
                                        </label>
                                        <div class="relative">
                                            <input type="text" id="lastName" v-model="form.lastName" required
                                                class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 transition-all duration-300 hover:border-white/20"
                                                placeholder="Nom" />
                                            <div
                                                class="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent opacity-0 focus-within:opacity-100 transition-opacity duration-300">
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Email Field -->
                                <div class="space-y-2">
                                    <label for="email" class="block text-sm font-medium text-white/90">
                                        Adresse email <span class="text-yellow-400">*</span>
                                    </label>
                                    <div class="relative">
                                        <input type="email" id="email" v-model="form.email" required
                                            class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 transition-all duration-300 hover:border-white/20"
                                            placeholder="votre@email.com" />
                                        <div
                                            class="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent opacity-0 focus-within:opacity-100 transition-opacity duration-300">
                                        </div>
                                    </div>
                                </div>

                                <!-- Company Field -->
                                <div class="space-y-2">
                                    <label for="company" class="block text-sm font-medium text-white/90">
                                        Entreprise
                                    </label>
                                    <div class="relative">
                                        <input type="text" id="company" v-model="form.company"
                                            class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 transition-all duration-300 hover:border-white/20"
                                            placeholder="Nom de votre entreprise" />
                                        <div
                                            class="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent opacity-0 focus-within:opacity-100 transition-opacity duration-300">
                                        </div>
                                    </div>
                                </div>

                                <!-- Password Field -->
                                <div class="space-y-2">
                                    <label for="password" class="block text-sm font-medium text-white/90">
                                        Mot de passe <span class="text-yellow-400">*</span>
                                    </label>
                                    <div class="relative">
                                        <input :type="showPassword ? 'text' : 'password'" id="password"
                                            v-model="form.password" required
                                            class="w-full px-4 py-3 pr-12 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 transition-all duration-300 hover:border-white/20"
                                            placeholder="••••••••••••" />
                                        <button type="button" @click="togglePassword"
                                            class="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors p-1">
                                            <svg v-if="showPassword" xmlns="http://www.w3.org/2000/svg" width="20"
                                                height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                                stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                <path d="m15 18-.722-3.25" />
                                                <path d="M2 8a10.645 10.645 0 0 0 20 0" />
                                                <path d="m20 15-1.726-2.05" />
                                                <path d="m4 15 1.726-2.05" />
                                                <path d="m9 18 .722-3.25" />
                                            </svg>
                                            <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                                                viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                                                stroke-linecap="round" stroke-linejoin="round">
                                                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                                                <circle cx="12" cy="12" r="3" />
                                            </svg>
                                        </button>
                                        <div
                                            class="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent opacity-0 focus-within:opacity-100 transition-opacity duration-300">
                                        </div>
                                    </div>
                                </div>

                                <!-- Confirm Password Field -->
                                <div class="space-y-2">
                                    <label for="confirmPassword" class="block text-sm font-medium text-white/90">
                                        Confirmer le mot de passe <span class="text-yellow-400">*</span>
                                    </label>
                                    <div class="relative">
                                        <input :type="showConfirmPassword ? 'text' : 'password'" id="confirmPassword"
                                            v-model="form.confirmPassword" required
                                            class="w-full px-4 py-3 pr-12 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 transition-all duration-300 hover:border-white/20"
                                            placeholder="••••••••••••" />
                                        <button type="button" @click="toggleConfirmPassword"
                                            class="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors p-1">
                                            <svg v-if="showConfirmPassword" xmlns="http://www.w3.org/2000/svg"
                                                width="20" height="20" viewBox="0 0 24 24" fill="none"
                                                stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                                stroke-linejoin="round">
                                                <path d="m15 18-.722-3.25" />
                                                <path d="M2 8a10.645 10.645 0 0 0 20 0" />
                                                <path d="m20 15-1.726-2.05" />
                                                <path d="m4 15 1.726-2.05" />
                                                <path d="m9 18 .722-3.25" />
                                            </svg>
                                            <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                                                viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                                                stroke-linecap="round" stroke-linejoin="round">
                                                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                                                <circle cx="12" cy="12" r="3" />
                                            </svg>
                                        </button>
                                        <div
                                            class="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent opacity-0 focus-within:opacity-100 transition-opacity duration-300">
                                        </div>
                                    </div>
                                </div>

                                <!-- Terms Checkbox -->
                                <div
                                    class="flex items-start space-x-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                                    <div class="relative">
                                        <input type="checkbox" id="terms" v-model="form.acceptTerms" required
                                            class="sr-only" />
                                        <div @click="form.acceptTerms = !form.acceptTerms"
                                            class="w-5 h-5 rounded-md border-2 border-white/20 flex items-center justify-center cursor-pointer transition-all duration-300"
                                            :class="form.acceptTerms ? 'bg-yellow-400 border-yellow-400' : 'hover:border-yellow-400/50'">
                                            <svg v-if="form.acceptTerms" xmlns="http://www.w3.org/2000/svg" width="14"
                                                height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                                stroke-width="3" stroke-linecap="round" stroke-linejoin="round"
                                                class="text-black">
                                                <polyline points="20,6 9,17 4,12" />
                                            </svg>
                                        </div>
                                    </div>
                                    <label for="terms" class="text-sm text-white/80 cursor-pointer">
                                        J'accepte les
                                        <a href="#"
                                            class="text-yellow-400 hover:text-yellow-300 transition-colors font-medium relative group">
                                            conditions d'utilisation
                                            <span
                                                class="absolute -bottom-0.5 left-0 w-0 h-px bg-yellow-400 transition-all group-hover:w-full"></span>
                                        </a>
                                        et la
                                        <a href="#"
                                            class="text-yellow-400 hover:text-yellow-300 transition-colors font-medium relative group">
                                            politique de confidentialité
                                            <span
                                                class="absolute -bottom-0.5 left-0 w-0 h-px bg-yellow-400 transition-all group-hover:w-full"></span>
                                        </a>
                                        <span class="text-yellow-400">*</span>
                                    </label>
                                </div>

                                <!-- Captcha-like -->
                                <div
                                    class="flex items-center space-x-3 p-4 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
                                    <div class="w-6 h-6 bg-green-400 rounded-md flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                                            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                                            stroke-linecap="round" stroke-linejoin="round" class="text-green-900">
                                            <polyline points="20,6 9,17 4,12" />
                                        </svg>
                                    </div>
                                    <span class="text-sm text-green-300 font-medium">Je ne suis pas un robot</span>
                                </div>

                                <!-- Submit Button -->
                                <button type="submit" :disabled="!form.acceptTerms || loading"
                                    class="relative w-full h-12 px-8 group overflow-hidden bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 hover:from-yellow-500 hover:via-amber-500 hover:to-orange-500 text-black rounded-xl border border-yellow-400/20 shadow-lg hover:shadow-yellow-400/25 transition-all duration-500 ease-out disabled:opacity-50 disabled:cursor-not-allowed">
                                    <div
                                        class="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                    </div>
                                    <div
                                        class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-full transition-all duration-1000">
                                    </div>
                                    <div class="relative flex items-center justify-center gap-3">
                                        <span v-if="!loading" class="font-semibold">Créer mon compte</span>
                                        <span v-else class="font-semibold">Création en cours...</span>
                                        <svg v-if="!loading" xmlns="http://www.w3.org/2000/svg" width="18" height="18"
                                            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                                            stroke-linecap="round" stroke-linejoin="round"
                                            class="transition-transform group-hover:translate-x-1">
                                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                            <circle cx="9" cy="7" r="4" />
                                            <path d="m22 2-5 5" />
                                            <path d="m17 7 5-5" />
                                        </svg>
                                        <svg v-else class="animate-spin" width="18" height="18" viewBox="0 0 24 24"
                                            fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                            stroke-linejoin="round">
                                            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                                        </svg>
                                    </div>
                                </button>

                                <!-- Login Link -->
                                <div class="text-center pt-4">
                                    <span class="text-white/60">Vous avez déjà un compte ? </span>
                                    <NuxtLink to="/login"
                                        class="text-yellow-400 hover:text-yellow-300 font-medium transition-colors relative group">
                                        Se connecter
                                        <span
                                            class="absolute -bottom-1 left-0 w-0 h-px bg-yellow-400 transition-all group-hover:w-full"></span>
                                    </NuxtLink>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <footer class="absolute bottom-0 right-0 p-6 z-10">
            <div class="flex flex-wrap gap-4 text-xs text-white/40">
                <a href="#" class="hover:text-white/70 transition-colors relative group">
                    Protection des données
                    <span
                        class="absolute -bottom-1 left-0 w-0 h-px bg-white/50 transition-all group-hover:w-full"></span>
                </a>
                <a href="#" class="hover:text-white/70 transition-colors relative group">
                    Besoin d'aide ?
                    <span
                        class="absolute -bottom-1 left-0 w-0 h-px bg-white/50 transition-all group-hover:w-full"></span>
                </a>
                <a href="#" class="hover:text-white/70 transition-colors relative group">
                    Support technique
                    <span
                        class="absolute -bottom-1 left-0 w-0 h-px bg-white/50 transition-all group-hover:w-full"></span>
                </a>
                <a href="#" class="hover:text-white/70 transition-colors relative group">
                    CGU
                    <span
                        class="absolute -bottom-1 left-0 w-0 h-px bg-white/50 transition-all group-hover:w-full"></span>
                </a>
                <a href="#" class="hover:text-white/70 transition-colors relative group">
                    Mentions légales
                    <span
                        class="absolute -bottom-1 left-0 w-0 h-px bg-white/50 transition-all group-hover:w-full"></span>
                </a>
            </div>
        </footer>
    </div>
</template>