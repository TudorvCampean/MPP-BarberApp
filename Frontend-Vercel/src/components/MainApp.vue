<template>
    <div class="relative min-h-screen" data-testid="main-app">
        <PresentationView v-if="currentPage === 'presentation'" @navigate="goTo" />
        <LoginView v-if="currentPage === 'login'" @navigate="goTo" />
        <RegisterView v-else-if="currentPage === 'register'" @navigate="goTo" />
        <TableView v-else-if="currentPage === 'table'" @navigate="goTo" />
        <StatisticsView v-else-if="currentPage === 'statistics'" @navigate="goTo" />

        <div
            v-if="browserState.lastAction"
            data-testid="browser-activity-badge"
            class="fixed bottom-4 right-4 z-50 max-w-xs rounded-xl border border-slate-700 bg-slate-950/90 px-4 py-3 shadow-2xl backdrop-blur-sm"
        >
            <p class="text-[10px] uppercase tracking-[0.35em] text-slate-500">Browser activity</p>
            <p class="mt-1 text-xs text-slate-200">
                {{ formatAction(browserState.lastAction, browserState.lastActionValue) }}
            </p>
            <p class="mt-1 text-[11px] text-slate-500">
                Page: <span class="text-slate-300">{{ browserState.lastPage }}</span> ·
                View: <span class="text-slate-300">{{ browserState.tableViewMode }}</span>
            </p>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import PresentationView from './PresentationView.vue';
import LoginView from './LoginView.vue';
import TableView from './TableView.vue';
import StatisticsView from './StatisticsView.vue';
import RegisterView from './RegisterView.vue'; // Asigură-te că ai acest import
import { readBrowserState, recordBrowserEvent } from '../domain/browserState';

const allowedPages = ['presentation', 'login', 'table', 'statistics', 'register'];
const normalizePage = (pageName) => (allowedPages.includes(pageName) ? pageName : 'presentation');

const browserState = ref(readBrowserState());
const currentPage = ref(normalizePage(browserState.value.lastPage));

const goTo = (pageName) => {
    currentPage.value = normalizePage(pageName);
    browserState.value = recordBrowserEvent('navigate', currentPage.value);
};

const formatAction = (action, value) => {
    if (!action) return 'No activity recorded yet.';
    const formattedValue = value ? `: ${value}` : '';
    return `${action.replaceAll('_', ' ')}${formattedValue}`;
};

onMounted(() => {
    browserState.value = recordBrowserEvent('app_open', currentPage.value);
});
</script>
