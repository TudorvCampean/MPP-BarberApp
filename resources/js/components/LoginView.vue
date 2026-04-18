<template>
    <div class="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <div class="max-w-md w-full">
            <div class="bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl p-8 transition-all duration-500">

                <div class="mb-8 flex justify-center">
                    <div class="relative">
                        <div class="absolute inset-0 bg-amber-500/20 blur-2xl rounded-full"></div>
                        <div class="relative bg-slate-900 rounded-full p-6 border-2 border-amber-500">
                            <Scissors class="w-12 h-12 text-amber-500" />
                        </div>
                    </div>
                </div>

                <div class="text-center mb-8">
                    <h1 class="text-3xl font-bold text-white mb-2">Elite Cuts</h1>
                    <p class="text-slate-400">
                        {{ isLogin ? "Sign in to your account" : "Create new account" }}
                    </p>
                </div>

                <form @submit.prevent="handleSubmit" class="space-y-6">
                    <div class="space-y-4">

                        <div>
                            <label for="email" class="text-slate-300 mb-2 block text-sm font-medium">Email</label>
                            <div class="relative">
                                <Mail class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input
                                    id="email"
                                    type="email"
                                    v-model="email"
                                    placeholder="barber@elitecuts.ro"
                                    class="flex h-10 w-full rounded-md bg-slate-900 border border-slate-700 text-white pl-11 px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label for="password" class="text-slate-300 mb-2 block text-sm font-medium">Password</label>
                            <div class="relative">
                                <Lock class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input
                                    id="password"
                                    type="password"
                                    v-model="password"
                                    placeholder="••••••••"
                                    class="flex h-10 w-full rounded-md bg-slate-900 border border-slate-700 text-white pl-11 px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        data-testid="login-submit"
                        class="w-full inline-flex items-center justify-center rounded-md text-sm transition-colors focus-visible:outline-none disabled:opacity-50 bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold py-3"
                    >
                        {{ isLogin ? "Sign In" : "Create Account" }}
                    </button>

                    <div class="text-center">
                        <button
                            type="button"
                            @click="isLogin = !isLogin"
                            data-testid="login-toggle-mode"
                            class="text-slate-400 hover:text-amber-500 transition-colors text-sm focus:outline-none"
                        >
                            <template v-if="isLogin">
                                Don't have an account? <span class="text-amber-500 font-semibold">Register</span>
                            </template>
                            <template v-else>
                                Already have an account? <span class="text-amber-500 font-semibold">Sign In</span>
                            </template>
                        </button>
                    </div>
                </form>

                <div class="my-6 flex items-center">
                    <div class="flex-1 h-px bg-slate-700"></div>
                    <span class="px-4 text-slate-500 text-sm">or</span>
                    <div class="flex-1 h-px bg-slate-700"></div>
                </div>

                <button
                    type="button"
                    @click="$emit('navigate', 'table')"
                    data-testid="login-continue-guest"
                    class="w-full inline-flex items-center justify-center rounded-md text-sm transition-colors border border-slate-700 text-slate-300 hover:bg-slate-700 py-3 font-medium"
                >
                    Continue as Guest
                </button>

            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';

import { Scissors, Mail, Lock } from 'lucide-vue-next';

const emit = defineEmits(['navigate']);


const isLogin = ref(true);
const email = ref('');
const password = ref('');


const handleSubmit = () => {
    emit('navigate', 'table');
};
</script>
