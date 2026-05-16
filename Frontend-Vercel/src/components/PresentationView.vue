<template>
    <div class="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <div class="max-w-2xl w-full text-center">
            <div class="animate-fade-in-up">

                <div class="mb-8 flex justify-center">
                    <div class="relative">
                        <div class="absolute inset-0 bg-amber-500/20 blur-3xl rounded-full"></div>
                        <div class="relative bg-slate-800 rounded-full p-8 border-2 border-amber-500">
                            <Scissors class="w-16 h-16 text-amber-500" />
                        </div>
                    </div>
                </div>

                <h1 class="text-6xl font-bold text-white mb-4 tracking-tight">
                    Elite Cuts
                </h1>

                <p class="text-xl text-amber-500 mb-12 font-light tracking-wide">
                    Your Style, Our Craft
                </p>

                <div class="w-24 h-px bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto mb-12"></div>

                <p class="text-slate-400 mb-12 max-w-md mx-auto leading-relaxed">
                    Professional appointment management system designed for modern barber shops.
                    Schedule, manage, and track your clients with ease.
                </p>

                <div class="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        @click="$emit('navigate', 'login')"
                        data-testid="presentation-sign-in"
                        class="inline-flex items-center justify-center bg-amber-500 hover:bg-amber-600 text-slate-900 px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-300 shadow-lg shadow-amber-500/20"
                    >
                        <LogIn class="mr-2 w-5 h-5" />
                        Log In
                    </button>

                    <button
                        @click="$emit('navigate', 'register')"
                        data-testid="presentation-register"
                        class="inline-flex items-center justify-center border border-slate-700 text-slate-300 hover:bg-slate-800 px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-300"
                    >
                        Create Account
                    </button>
                </div>
            </div>

            <div class="mt-16 text-slate-600 text-sm animate-fade-in">
                © 2026 Elite Cuts. All rights reserved.
            </div>
        </div>
    </div>
</template>

<script setup>
import { Scissors, LogIn } from 'lucide-vue-next';

const emit = defineEmits(['navigate']);
</script>

<style scoped>

.animate-fade-in-up {
    animation: fadeInUp 0.6s ease-out forwards;
}

.animate-fade-in {
    animation: fadeIn 0.6s ease-out 0.8s forwards;
    opacity: 0;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}
</style>
