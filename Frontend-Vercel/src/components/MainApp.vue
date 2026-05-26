<template>
    <div class="relative min-h-screen" data-testid="main-app">
        <PresentationView v-if="currentPage === 'presentation'" @navigate="goTo" />
        <LoginView v-if="currentPage === 'login'" @navigate="goTo" />
        <RegisterView v-else-if="currentPage === 'register'" @navigate="goTo" />
        <TableView v-else-if="currentPage === 'table'" @navigate="goTo" />
        <StatisticsView v-else-if="currentPage === 'statistics'" @navigate="goTo" />
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
