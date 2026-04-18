<template>
    <div class="min-h-screen bg-slate-900 p-6 font-sans">
        <div class="max-w-7xl mx-auto animate-in fade-in duration-500">

            <div class="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div class="flex items-center gap-4">
                    <button
                        @click="$emit('navigate', 'table')"
                        data-testid="statistics-home"
                        class="p-2 text-slate-400 hover:text-amber-500 transition-colors bg-transparent rounded-md hover:bg-slate-800"
                    >
                        <Home class="w-5 h-5" />
                    </button>
                    <div class="flex items-center gap-3">
                        <div class="bg-slate-800 rounded-full p-3 border border-amber-500/30">
                            <TrendingUp class="w-6 h-6 text-amber-500" />
                        </div>
                        <div>
                            <h1 class="text-2xl font-bold text-white">Insights</h1>
                            <p data-testid="statistics-current-month" class="text-sm text-slate-400">{{ monthName }} {{ currentDate.getFullYear() }}</p>
                        </div>
                    </div>
                </div>

                <div class="flex items-center gap-2 self-start md:self-auto">
                    <label for="statistics-month" class="text-xs uppercase tracking-wider text-slate-400">Month</label>
                    <select
                        id="statistics-month"
                        v-model.number="selectedMonth"
                        data-testid="statistics-month-select"
                        class="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100"
                    >
                        <option v-for="(name, index) in monthNames" :key="name" :value="index">{{ name }}</option>
                    </select>

                    <label for="statistics-year" class="text-xs uppercase tracking-wider text-slate-400">Year</label>
                    <select
                        id="statistics-year"
                        v-model.number="selectedYear"
                        data-testid="statistics-year-select"
                        class="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100"
                    >
                        <option v-for="year in availableYears" :key="year" :value="year">{{ year }}</option>
                    </select>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div class="bg-slate-800 rounded-2xl border border-slate-700 p-6 shadow-xl">
                    <div class="flex items-center justify-between mb-4">
                        <div class="bg-blue-500/10 rounded-full p-3">
                            <Users class="w-6 h-6 text-blue-500" />
                        </div>
                        <span class="text-xs text-slate-400 uppercase tracking-wider">This Month</span>
                    </div>
                    <h3 class="text-3xl font-bold text-white mb-1">
                        {{ monthlyStats.totalClients }}
                    </h3>
                    <p class="text-slate-400">Total Clients</p>
                </div>

                <div class="bg-slate-800 rounded-2xl border border-slate-700 p-6 shadow-xl">
                    <div class="flex items-center justify-between mb-4">
                        <div class="bg-amber-500/10 rounded-full p-3">
                            <DollarSign class="w-6 h-6 text-amber-500" />
                        </div>
                        <span class="text-xs text-slate-400 uppercase tracking-wider">Revenue</span>
                    </div>
                    <h3 class="text-3xl font-bold text-white mb-1">
                        {{ monthlyStats.estimatedRevenue }} RON
                    </h3>
                    <p class="text-slate-400">
                        Estimated at {{ PRICE_PER_CUT }} RON/cut
                    </p>
                </div>

                <div class="bg-slate-800 rounded-2xl border border-slate-700 p-6 shadow-xl">
                    <div class="flex items-center justify-between mb-4">
                        <div class="bg-green-500/10 rounded-full p-3">
                            <Calendar class="w-6 h-6 text-green-500" />
                        </div>
                        <span class="text-xs text-slate-400 uppercase tracking-wider">Average</span>
                    </div>
                    <h3 class="text-3xl font-bold text-white mb-1">
                        {{ Math.round(monthlyStats.totalClients / 4) }}
                    </h3>
                    <p class="text-slate-400">Clients per Week</p>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

                <div class="bg-slate-800 rounded-2xl border border-slate-700 p-6 shadow-xl flex flex-col">
                    <div class="flex items-center gap-3 mb-6">
                        <div class="bg-blue-500/10 rounded-lg p-2">
                            <BarChart2 class="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                            <h3 class="font-bold text-white">Weekly Client Count</h3>
                            <p class="text-xs text-slate-400">Clients per week breakdown</p>
                        </div>
                    </div>

                    <div class="flex-1 flex items-end justify-around h-[250px] border-l border-b border-slate-700 pb-2 pl-2 relative">
                        <div v-for="item in weeklyData.data" :key="item.id" class="flex flex-col items-center w-full group relative h-full justify-end px-2">
                            <div class="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full mb-2 bg-slate-800 border border-slate-600 p-2 rounded-lg text-white text-xs z-10 whitespace-nowrap shadow-lg">
                                Clients: {{ item.clients }}
                            </div>
                            <div class="w-full max-w-[60px] bg-blue-500 rounded-t-lg transition-all duration-500"
                                 :style="{ height: `${weeklyData.maxClients ? (item.clients / weeklyData.maxClients) * 100 : 0}%`, minHeight: item.clients > 0 ? '4px' : '0' }">
                            </div>
                            <span class="text-xs text-slate-400 mt-3 absolute -bottom-6">{{ item.week }}</span>
                        </div>
                    </div>
                </div>

                <div class="bg-slate-800 rounded-2xl border border-slate-700 p-6 shadow-xl flex flex-col">
                    <div class="flex items-center gap-3 mb-6">
                        <div class="bg-amber-500/10 rounded-lg p-2">
                            <TrendingUp class="w-5 h-5 text-amber-500" />
                        </div>
                        <div>
                            <h3 class="font-bold text-white">Weekly Revenue</h3>
                            <p class="text-xs text-slate-400">Estimated revenue per week</p>
                        </div>
                    </div>

                    <div class="flex-1 relative h-[250px] border-l border-b border-slate-700 pb-2 pl-2">
                        <svg viewBox="0 0 400 220" preserveAspectRatio="none" class="w-full h-full overflow-visible">
                            <polyline
                                fill="none"
                                stroke="#f59e0b"
                                stroke-width="3"
                                :points="svgLinePoints"
                            />
                            <circle v-for="(point, idx) in svgPointsCoords" :key="idx"
                                    :cx="point.x" :cy="point.y" r="5" fill="#f59e0b"
                                    class="cursor-pointer hover:r-6 transition-all" />
                        </svg>

                        <div class="absolute bottom-[-24px] left-2 right-0 flex justify-between">
                    <span v-for="item in weeklyData.data" :key="item.id" class="text-xs text-slate-400 text-center w-full">
                        {{ item.week }}
                    </span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="mt-8 mb-8 bg-slate-800 rounded-2xl border border-slate-700 p-6 shadow-xl">
                <div class="flex items-center gap-3 mb-8">
                    <div class="bg-green-500/10 rounded-lg p-2">
                        <BarChart2 class="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                        <h3 class="font-bold text-white">Monthly Client Growth</h3>
                        <p class="text-xs text-slate-400">Total clients per month over the last 12 months</p>
                    </div>
                </div>

                <div class="flex items-end justify-between h-[300px] border-l border-b border-slate-700 pb-2 pl-2">
                    <div v-for="item in monthlyGrowthData.data" :key="item.id" class="flex flex-col items-center w-full group relative h-full justify-end px-1">
                        <div class="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full mb-2 bg-slate-800 border border-slate-600 p-2 rounded-lg text-white text-xs z-10 whitespace-nowrap shadow-lg">
                            {{ item.clients }} clients
                        </div>
                        <div class="w-full max-w-[40px] rounded-t-lg transition-all duration-500"
                             :style="{ backgroundColor: item.color, height: `${monthlyGrowthData.maxClients ? (item.clients / monthlyGrowthData.maxClients) * 100 : 0}%`, minHeight: item.clients > 0 ? '4px' : '0' }">
                        </div>
                        <span class="text-xs text-slate-400 mt-3 absolute -bottom-6">{{ item.month }}</span>
                    </div>
                </div>
            </div>

        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { Home, TrendingUp, DollarSign, Users, Calendar, BarChart2 } from 'lucide-vue-next';
import { appointments, loadAllAppointments } from '../domain/appointmentStore';

defineEmits(['navigate']);

const PRICE_PER_CUT = 50; // RON per haircut

const currentDate = ref(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const yearsFromData = computed(() => {
    const years = appointments.value
        .map((apt) => new Date(apt.date).getFullYear())
        .filter((year) => !Number.isNaN(year));

    return years;
});

const availableYears = computed(() => {
    const currentYear = new Date().getFullYear();
    const baseline = [currentYear - 1, currentYear, currentYear + 1];
    const allYears = [...baseline, ...yearsFromData.value];

    return [...new Set(allYears)].sort((a, b) => a - b);
});

const selectedMonth = computed({
    get: () => currentDate.value.getMonth(),
    set: (month) => {
        currentDate.value = new Date(currentDate.value.getFullYear(), month, 1);
    },
});

const selectedYear = computed({
    get: () => currentDate.value.getFullYear(),
    set: (year) => {
        currentDate.value = new Date(year, currentDate.value.getMonth(), 1);
    },
});

// Numele lunii in Romana pentru header, cum era in React
const monthName = computed(() => {
    return monthNames[currentDate.value.getMonth()];
});

// Calculate monthly statistics
const monthlyStats = computed(() => {
    const currentMonth = appointments.value.filter((apt) => {
        const aptDate = new Date(apt.date);
        return (
            aptDate.getMonth() === currentDate.value.getMonth() &&
            aptDate.getFullYear() === currentDate.value.getFullYear()
        );
    });

    const totalClients = currentMonth.length;
    const estimatedRevenue = totalClients * PRICE_PER_CUT;

    return { totalClients, estimatedRevenue };
});

// Calculate weekly data for chart
const weeklyData = computed(() => {
    const weeks = ["Week 1", "Week 2", "Week 3", "Week 4"];
    const weeklyCounts = [0, 0, 0, 0];

    appointments.value.forEach((apt) => {
        const aptDate = new Date(apt.date);
        if (
            aptDate.getMonth() === currentDate.value.getMonth() &&
            aptDate.getFullYear() === currentDate.value.getFullYear()
        ) {
            const day = aptDate.getDate();
            const weekIndex = Math.min(Math.floor((day - 1) / 7), 3);
            weeklyCounts[weekIndex]++;
        }
    });

    const maxClients = Math.max(...weeklyCounts, 1);
    const maxRevenue = maxClients * PRICE_PER_CUT;

    return {
        data: weeks.map((week, index) => ({
            id: `w${index}`,
            week,
            weekNum: index + 1,
            clients: weeklyCounts[index],
            revenue: weeklyCounts[index] * PRICE_PER_CUT,
        })),
        maxClients,
        maxRevenue
    };
});

// Calcul coordonate pentru graficul LineChart (mimând Recharts)
const svgPointsCoords = computed(() => {
    const data = weeklyData.value.data;
    const maxRevenue = weeklyData.value.maxRevenue;
    const width = 400;
    const height = 220;

    if (data.length === 0 || maxRevenue === 0) return [];

    const stepX = width / (data.length * 2); // Distribuie punctele in centrul coloanelor flex

    return data.map((d, i) => {
        const x = stepX + (i * stepX * 2);
        const y = height - ((d.revenue / maxRevenue) * height);
        return { x, y, revenue: d.revenue };
    });
});

const svgLinePoints = computed(() => {
    return svgPointsCoords.value.map(p => `${p.x},${p.y}`).join(' ');
});

// Calculate monthly client growth for the last 12 months
const monthlyGrowthData = computed(() => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthsToShow = 12;
    const monthlyData = [];

    // Calculate data for each of the last 12 months
    for (let i = monthsToShow - 1; i >= 0; i--) {
        const targetDate = new Date(currentDate.value);
        targetDate.setMonth(currentDate.value.getMonth() - i);

        const monthIndex = targetDate.getMonth();
        const year = targetDate.getFullYear();

        // Count appointments for this month
        const count = appointments.value.filter((apt) => {
            const aptDate = new Date(apt.date);
            return aptDate.getMonth() === monthIndex && aptDate.getFullYear() === year;
        }).length;

        // Alternate colors between blue and orange
        const color = i % 2 === 0 ? "#3b82f6" : "#f59e0b";

        monthlyData.push({
            id: `month-${i}`,
            month: monthNames[monthIndex],
            clients: count,
            color: color
        });
    }

    const maxClients = Math.max(...monthlyData.map(d => d.clients), 1);

    return { data: monthlyData, maxClients };
});

onMounted(async () => {
    await loadAllAppointments();
});
</script>

<style scoped>
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}
.animate-in { animation: fadeIn 0.4s ease-out forwards; }
</style>
