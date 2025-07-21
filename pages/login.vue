<script setup lang="ts">
import { useHead } from '#app'
import { ref } from 'vue'

const supabase = useSupabaseClient()
const router = useRouter()

useHead({
  title: 'QRMaster - Connexion',
  meta: [
    {
      name: 'description',
      content: 'Connectez-vous à votre espace QRMaster pour gérer vos QR codes.',
    },
  ],
})

const form = ref({
  email: '',
  password: '',
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
  <div class="relative min-h-screen bg-black text-white overflow-hidden">
    <div class="absolute inset-0 overflow-hidden pointer-events-none select-none">
      <div
        class="absolute -left-4 top-1/2 -translate-y-1/2 -rotate-180 text-white/[0.03] text-[20rem] font-bold tracking-tighter [writing-mode:vertical-rl] blur-[1px]"
      >
        QRMASTER
      </div>
      <div
        class="absolute -right-4 top-1/2 -translate-y-1/2 -rotate-180 text-white/[0.03] text-[20rem] font-bold tracking-tighter [writing-mode:vertical-rl] blur-[1px]"
      >
        CONNECT
      </div>
    </div>

    <nav class="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <NuxtLink
            to="/"
            class="text-xl font-medium tracking-tight flex items-center gap-2"
            aria-label="QRMaster Homepage"
          >
            <div class="relative w-8 h-8">
              <div class="absolute inset-0 bg-yellow-400/20 rounded-xl blur-sm" />
              <div
                class="relative w-full h-full rounded-xl bg-black border border-yellow-400/20 flex items-center justify-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="h-4 w-4 text-yellow-400"
                >
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
            <NuxtLink
              to="/register"
              class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-zinc-950 dark:focus-visible:ring-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 h-10 px-4 py-2 text-white/70 hover:text-white hover:bg-white/5"
              aria-label="Créer un compte"
            >
              Créer un compte
            </NuxtLink>
          </div>
        </div>
      </div>
    </nav>

    <div class="relative">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        <div class="text-center max-w-4xl mx-auto mb-20">
          <div style="opacity: 1; transform: none">
            <div
              class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-400/10 border border-yellow-400/20 mb-8 backdrop-blur-sm"
            >
              <span class="text-sm font-medium text-yellow-400 flex items-center gap-2">
                Connexion sécurisée
              </span>
            </div>

            <div class="space-y-8">
              <h1
                class="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tighter leading-[0.95]"
                style="opacity: 1; transform: none"
              >
                <span class="inline-block" style="opacity: 1; transform: none">Bienvenue sur</span>
                <span
                  class="block mt-4 text-yellow-400 relative"
                  style="opacity: 1; transform: none"
                >
                  <span class="relative z-10">QRMaster</span>
                  <div class="absolute inset-0 bg-yellow-400/10 blur-3xl -z-10 animate-pulse" />
                </span>
              </h1>
              <p
                class="text-xl text-white/60 max-w-2xl mx-auto leading-relaxed"
                style="opacity: 1; transform: none"
              >
                Connectez-vous à votre espace et gérez vos QR codes avec la technologie de nouvelle
                génération.
              </p>
            </div>
          </div>
        </div>

        <div class="flex justify-center">
          <div
            class="group relative w-full max-w-md p-8 rounded-2xl overflow-hidden bg-gradient-to-br from-white/[0.03] via-white/[0.05] to-white/[0.03] backdrop-blur-md border border-white/10 hover:border-white/20 shadow-2xl transition-all duration-500 ease-out"
          >
            <div
              class="absolute inset-0 bg-gradient-to-br opacity-20 from-yellow-500/10 via-amber-500/10 to-orange-500/10"
            />
            <div
              class="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-full transition-all duration-1000"
            />

            <div class="relative space-y-6">
              <div class="text-center space-y-2">
                <h2 class="text-2xl font-bold text-white tracking-tight">Se connecter</h2>
                <p class="text-white/60">Accédez à votre tableau de bord</p>
              </div>

              <div
                v-if="errorMessage"
                class="relative p-4 rounded-xl overflow-hidden bg-gradient-to-br from-red-500/10 via-red-500/5 to-red-500/10 backdrop-blur-md border border-red-500/20"
              >
                <div
                  class="absolute inset-0 bg-gradient-to-br opacity-20 from-red-500/20 via-red-500/10 to-red-500/20"
                />
                <div class="relative flex items-center gap-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="text-red-400 shrink-0"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" x2="9" y1="9" y2="15" />
                    <line x1="9" x2="15" y1="9" y2="15" />
                  </svg>
                  <span class="text-sm text-red-300">{{ errorMessage }}</span>
                </div>
              </div>

              <form class="space-y-6" @submit.prevent="handleLogin">
                <div class="space-y-2">
                  <label for="email" class="block text-sm font-medium text-white/90">
                    Adresse email <span class="text-yellow-400">*</span>
                  </label>
                  <div class="relative">
                    <input
                      id="email"
                      v-model="form.email"
                      type="email"
                      required
                      class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 transition-all duration-300 hover:border-white/20"
                      placeholder="votre@email.com"
                    >
                    <div
                      class="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent opacity-0 focus-within:opacity-100 transition-opacity duration-300"
                    />
                  </div>
                </div>

                <div class="space-y-2">
                  <label for="password" class="block text-sm font-medium text-white/90">
                    Mot de passe <span class="text-yellow-400">*</span>
                  </label>
                  <div class="relative">
                    <input
                      id="password"
                      v-model="form.password"
                      :type="showPassword ? 'text' : 'password'"
                      required
                      class="w-full px-4 py-3 pr-12 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 transition-all duration-300 hover:border-white/20"
                      placeholder="••••••••••••"
                    >
                    <button
                      type="button"
                      class="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors p-1"
                      @click="togglePassword"
                    >
                      <svg
                        v-if="showPassword"
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <path d="m15 18-.722-3.25" />
                        <path d="M2 8a10.645 10.645 0 0 0 20 0" />
                        <path d="m20 15-1.726-2.05" />
                        <path d="m4 15 1.726-2.05" />
                        <path d="m9 18 .722-3.25" />
                      </svg>
                      <svg
                        v-else
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </button>
                    <div
                      class="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent opacity-0 focus-within:opacity-100 transition-opacity duration-300"
                    />
                  </div>
                  <div class="text-right">
                    <a
                      href="#"
                      class="text-sm text-white/60 hover:text-yellow-400 transition-colors"
                    >
                      Mot de passe oublié ?
                    </a>
                  </div>
                </div>

                <button
                  type="submit"
                  :disabled="loading"
                  class="relative w-full h-12 px-8 group overflow-hidden bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 hover:from-yellow-500 hover:via-amber-500 hover:to-orange-500 text-black rounded-xl border border-yellow-400/20 shadow-lg hover:shadow-yellow-400/25 transition-all duration-500 ease-out disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div
                    class="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  />
                  <div
                    class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-full transition-all duration-1000"
                  />
                  <div class="relative flex items-center justify-center gap-3">
                    <span v-if="!loading" class="font-semibold">Se connecter</span>
                    <span v-else class="font-semibold">Connexion...</span>
                    <svg
                      v-if="!loading"
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="transition-transform group-hover:translate-x-1"
                    >
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                    <svg
                      v-else
                      class="animate-spin"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                  </div>
                </button>

                <div class="flex items-center my-8">
                  <div class="flex-1 border-t border-white/10" />
                  <span class="px-4 text-white/50 text-sm">ou</span>
                  <div class="flex-1 border-t border-white/10" />
                </div>

                <div class="text-center">
                  <span class="text-white/60">Vous n'avez pas de compte ? </span>
                  <NuxtLink
                    to="/register"
                    class="text-yellow-400 hover:text-yellow-300 font-medium transition-colors relative group"
                  >
                    Créer un compte
                    <span
                      class="absolute -bottom-1 left-0 w-0 h-px bg-yellow-400 transition-all group-hover:w-full"
                    />
                  </NuxtLink>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>

    <footer class="absolute bottom-0 right-0 p-6 z-10">
      <div class="flex flex-wrap gap-4 text-xs text-white/40">
        <a href="#" class="hover:text-white/70 transition-colors relative group">
          Protection des données
          <span
            class="absolute -bottom-1 left-0 w-0 h-px bg-white/50 transition-all group-hover:w-full"
          />
        </a>
        <a href="#" class="hover:text-white/70 transition-colors relative group">
          Besoin d'aide ?
          <span
            class="absolute -bottom-1 left-0 w-0 h-px bg-white/50 transition-all group-hover:w-full"
          />
        </a>
        <a href="#" class="hover:text-white/70 transition-colors relative group">
          Support technique
          <span
            class="absolute -bottom-1 left-0 w-0 h-px bg-white/50 transition-all group-hover:w-full"
          />
        </a>
        <a href="#" class="hover:text-white/70 transition-colors relative group">
          CGU
          <span
            class="absolute -bottom-1 left-0 w-0 h-px bg-white/50 transition-all group-hover:w-full"
          />
        </a>
        <a href="#" class="hover:text-white/70 transition-colors relative group">
          Mentions légales
          <span
            class="absolute -bottom-1 left-0 w-0 h-px bg-white/50 transition-all group-hover:w-full"
          />
        </a>
      </div>
    </footer>
  </div>
</template>
