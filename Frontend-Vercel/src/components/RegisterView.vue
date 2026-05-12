<template>
    <div class="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <div class="max-w-md w-full">
            <div class="bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl p-8">

                <div class="text-center mb-8">
                    <h1 class="text-3xl font-bold text-white mb-2">Create Account</h1>
                    <p class="text-slate-400">Join Elite Cuts today</p>
                </div>

                <div v-if="authError" class="mb-6 p-3 rounded bg-red-500/10 border border-red-500/50 text-red-500 text-sm text-center">
                    {{ authError }}
                </div>

                <form @submit.prevent="handleRegister" class="space-y-6">
                    <div class="space-y-4">
                        <div>
                            <label class="text-slate-300 mb-2 block text-sm font-medium">Full Name</label>
                            <input v-model="name" type="text" class="input-field" required />
                        </div>
                        <div>
                            <label class="text-slate-300 mb-2 block text-sm font-medium">Email</label>
                            <input v-model="email" type="email" class="input-field" required />
                        </div>
                        <div>
                            <label class="text-slate-300 mb-2 block text-sm font-medium">Password</label>
                            <input v-model="password" type="password" class="input-field" required />
                        </div>
                        <div>
                            <label class="text-slate-300 mb-2 block text-sm font-medium">Confirm Password</label>
                            <input v-model="passwordConfirmation" type="password" class="input-field" required />
                        </div>
                    </div>

                    <button type="submit" :disabled="isLoading" class="w-full bg-amber-500 text-slate-900 font-semibold py-3 rounded-md">
                        {{ isLoading ? "Creating Account..." : "Register" }}
                    </button>

                    <div class="text-center mt-4">
                        <button type="button" @click="$emit('navigate', 'login')" class="text-slate-400 hover:text-amber-500 text-sm">
                            Already have an account? Sign In
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { register, authError, isLoading } from '../domain/authStore';

const emit = defineEmits(['navigate']);

const name = ref('');
const email = ref('');
const password = ref('');
const passwordConfirmation = ref('');

const handleRegister = async () => {
    const success = await register(name.value, email.value, password.value, passwordConfirmation.value);
    if (success) {
        emit('navigate', 'table');
    }
};
</script>

<style scoped>
.input-field {
    @apply flex h-10 w-full rounded-md bg-slate-900 border border-slate-700 text-white px-3 py-2 text-sm focus:outline-none focus:border-amber-500;
}
</style>
