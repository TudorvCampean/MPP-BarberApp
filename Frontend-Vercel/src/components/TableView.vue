<template>
    <div class="min-h-screen bg-slate-900 p-6 text-white font-sans">
        <div class="max-w-6xl mx-auto">

            <div class="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div class="flex items-center gap-4">
                    <button @click="handleLogout" data-testid="table-logout" class="text-slate-400 hover:text-red-500 transition-colors bg-slate-800 p-2 rounded-full border border-slate-700 hover:border-red-500/50" title="Log Out">
                    <LogOut class="w-5 h-5" /> </button>
                    <div class="flex items-center gap-3">
                        <div class="bg-slate-800/50 rounded-xl p-3 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                            <Scissors class="w-6 h-6 text-amber-500" />
                        </div>
                        <div>
                            <h1 class="text-2xl font-bold text-white tracking-tight">Elite Cuts</h1>
                            <p class="text-sm text-slate-400">Appointment Management</p>
                        </div>
                    </div>
                </div>

                <button @click="goToStatistics" data-testid="table-statistics" class="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-sm hover:border-amber-500/50 hover:text-amber-500">
                    <BarChart3 class="w-4 h-4 text-amber-500" /> Full Statistics
                </button>
            </div>

            <div class="bg-slate-900/50 rounded-2xl border border-slate-800 shadow-2xl p-6 backdrop-blur-sm">

                <div class="flex flex-col lg:flex-row gap-6">

                    <div :class="showInsights ? 'lg:w-2/3' : 'w-full'" class="transition-all duration-500">

                        <div class="flex items-center justify-center mb-8">
                            <div class="bg-slate-950/50 rounded-xl p-1.5 border border-slate-800/60 inline-flex shadow-inner">
                                <button @click="setViewMode('calendar'); selectedTimelineDate = null" data-testid="table-view-calendar" :class="['px-6 py-2.5 rounded-lg font-medium text-sm transition-all duration-300 flex items-center gap-2', viewMode === 'calendar' ? 'bg-slate-800 text-amber-500 shadow-md border border-slate-700/50' : 'text-slate-400 hover:text-white']">
                                    <CalendarIcon class="w-4 h-4" /> Calendar
                                </button>
                                <button @click="setViewMode('cards')" data-testid="table-view-cards" :class="['px-6 py-2.5 rounded-lg font-medium text-sm transition-all duration-300 flex items-center gap-2', viewMode === 'cards' ? 'bg-slate-800 text-amber-500 shadow-md border border-slate-700/50' : 'text-slate-400 hover:text-white']">
                                    <LayoutGrid class="w-4 h-4" /> History
                                </button>
                                <button @click="setViewMode('table')" data-testid="table-view-table" :class="['px-6 py-2.5 rounded-lg font-medium text-sm transition-all duration-300 flex items-center gap-2', viewMode === 'table' ? 'bg-slate-800 text-amber-500 shadow-md border border-slate-700/50' : 'text-slate-400 hover:text-white']">
                                    <TableIcon class="w-4 h-4" /> Table
                                </button>
                            </div>
                        </div>

                        <div v-if="viewMode === 'table'" class="animate-in fade-in duration-500">

                            <div class="flex justify-between items-center mb-6">
                                <div>
                                    <h2 class="text-xl font-bold text-white tracking-tight">Appointments</h2>
                                    <p class="text-sm text-slate-400 mt-1">Manage your schedule and track progress.</p>
                                </div>
                                <button @click="openAddModal" data-testid="table-add-appointment" class="bg-amber-500 hover:bg-amber-600 text-slate-950 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all shadow-lg shadow-amber-500/20">
                                    <Plus class="w-4 h-4"/> Add Appointment
                                </button>
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div class="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5 flex items-center gap-4 shadow-sm hover:border-blue-500/30 transition-colors">
                                    <div class="bg-blue-500/10 p-3 rounded-lg border border-blue-500/20"><Users class="w-6 h-6 text-blue-500"/></div>
                                    <div>
                                        <p class="text-sm text-slate-400 font-medium">Total Appointments</p>
                                        <p class="text-2xl font-bold text-white">{{ totalApts }}</p>
                                    </div>
                                </div>
                                <div class="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5 flex items-center gap-4 shadow-sm hover:border-amber-500/30 transition-colors">
                                    <div class="bg-amber-500/10 p-3 rounded-lg border border-amber-500/20"><Clock class="w-6 h-6 text-amber-500"/></div>
                                    <div>
                                        <p class="text-sm text-slate-400 font-medium">Upcoming</p>
                                        <p class="text-2xl font-bold text-white">{{ upcomingApts }}</p>
                                    </div>
                                </div>
                                <div class="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5 flex items-center gap-4 shadow-sm hover:border-emerald-500/30 transition-colors">
                                    <div class="bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20"><CheckCircle class="w-6 h-6 text-emerald-500"/></div>
                                    <div>
                                        <p class="text-sm text-slate-400 font-medium">Completed</p>
                                        <p class="text-2xl font-bold text-white">{{ completedApts }}</p>
                                    </div>
                                </div>
                            </div>

                            <div class="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden overflow-x-auto">
                                <table class="w-full min-w-[800px] text-sm text-left">
                                    <thead class="bg-slate-950/80 text-slate-400 border-b border-slate-800">
                                    <tr>
                                        <th class="px-6 py-4 font-medium uppercase tracking-wider text-xs">Client Name</th>
                                        <th class="px-6 py-4 font-medium uppercase tracking-wider text-xs">Date & Time</th>
                                        <th class="px-6 py-4 font-medium uppercase tracking-wider text-xs">Status</th>
                                        <th class="px-6 py-4 font-medium uppercase tracking-wider text-xs text-right">Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody class="divide-y divide-slate-800/50">
                                    <tr v-if="paginatedAppointments.length === 0">
                                        <td colspan="4" class="px-6 py-12 text-center text-slate-500">
                                            <div class="flex flex-col items-center gap-2">
                                                <Search class="w-8 h-8 opacity-20" />
                                                <p>No appointments found in RAM.</p>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr v-for="apt in paginatedAppointments" :key="apt.id" class="group transition-colors duration-200" :class="apt.status === 'completed' ? 'bg-slate-900/80 opacity-75' : 'hover:bg-slate-800/40'">
                                        <td class="px-6 py-4">
                                            <div class="font-medium" :class="apt.status === 'completed' ? 'line-through text-slate-500' : 'text-slate-200'">
                                                {{ apt.clientName }}
                                            </div>
                                            <div v-if="apt.status === 'completed'" class="text-xs text-emerald-500/80 mt-0.5">
                                                Income: {{ apt.income }} RON
                                            </div>
                                        </td>
                                        <td class="px-6 py-4">
                                            <div class="flex items-center gap-2">
                                                <div class="inline-flex items-center gap-1.5 text-slate-300 bg-slate-800/50 px-2.5 py-1 rounded-md border border-slate-700/50">
                                                    <CalendarIcon class="w-3.5 h-3.5 text-slate-400" /> {{ formatDate(apt.date) }}
                                                </div>
                                                <div class="inline-flex items-center gap-1.5 font-mono px-2.5 py-1 rounded-md border"
                                                     :class="apt.status === 'completed' ? 'text-slate-400 bg-slate-800/50 border-slate-700/50' : 'text-amber-500/90 bg-amber-500/10 border-amber-500/20'">
                                                    <Clock class="w-3.5 h-3.5" /> {{ apt.time }}
                                                </div>
                                            </div>
                                        </td>
                                        <td class="px-6 py-4">
                                            <span v-if="apt.status === 'completed'" class="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-xs font-semibold uppercase tracking-wider">
                                                <Check class="w-3 h-3"/> Completed
                                            </span>
                                            <span v-else class="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20 text-xs font-semibold uppercase tracking-wider">
                                                <Clock class="w-3 h-3"/> Upcoming
                                            </span>
                                        </td>
                                        <td class="px-6 py-4">
                                            <div class="flex justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
                                                <button v-if="apt.status !== 'completed'" @click.stop.prevent="openCompleteModal(apt)" class="p-2 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/20 rounded-md transition-colors cursor-pointer" title="Mark as Completed">
                                                    <CheckCircle class="w-4 h-4"/>
                                                </button>

                                                <button v-if="apt.status === 'completed'" @click.stop.prevent="revertApt(apt)" class="p-2 text-amber-400 hover:text-amber-300 hover:bg-amber-400/20 rounded-md transition-colors cursor-pointer" title="Revert to Upcoming">
                                                    <Undo class="w-4 h-4"/>
                                                </button>

                                                <button @click="selectedDetail = apt" class="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded-md transition-colors" title="View Details"><Eye class="w-4 h-4"/></button>
                                                <button @click="openEditModal(apt)" class="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-md transition-colors" title="Edit"><Pencil class="w-4 h-4"/></button>
                                                <button @click.stop.prevent="confirmDeleteApt(apt)" class="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-md transition-colors cursor-pointer" title="Delete"><Trash2 class="w-4 h-4"/></button>
                                            </div>
                                        </td>
                                    </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div class="flex items-center justify-between px-2 mt-6">
                                <p class="text-sm text-slate-400">
                                    Showing <span class="font-medium text-slate-200">{{ paginatedAppointments.length }}</span> of <span class="font-medium text-slate-200">{{ appointments.length }}</span> appointments
                                </p>
                                <div class="flex items-center gap-2">
                                    <button @click="currentPage--" :disabled="currentPage === 1" class="px-3 py-2 rounded-lg border border-slate-700 text-sm font-medium text-slate-300 hover:bg-slate-800 disabled:opacity-40 transition-colors flex items-center gap-1"><ChevronLeft class="w-4 h-4" /> Previous</button>
                                    <div class="flex items-center gap-1 px-2 text-sm font-medium text-slate-400">Page <span class="text-white">{{ currentPage }}</span> of {{ totalPages }}</div>
                                    <button @click="currentPage++" :disabled="currentPage === totalPages" class="px-3 py-2 rounded-lg border border-slate-700 text-sm font-medium text-slate-300 hover:bg-slate-800 disabled:opacity-40 transition-colors flex items-center gap-1">Next <ChevronRight class="w-4 h-4" /></button>
                                </div>
                            </div>
                        </div>

                        <div v-if="viewMode === 'cards'" class="animate-in fade-in duration-500">

                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                                <div class="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5 flex items-center gap-4 shadow-sm hover:border-emerald-500/30 transition-colors">
                                    <div class="bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20"><Banknote class="w-6 h-6 text-emerald-500"/></div>
                                    <div>
                                        <p class="text-sm text-slate-400 font-medium">Total Income</p>
                                        <p class="text-2xl font-bold text-emerald-400">{{ totalIncome }} RON</p>
                                    </div>
                                </div>
                                <div class="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5 flex items-center gap-4 shadow-sm hover:border-blue-500/30 transition-colors">
                                    <div class="bg-blue-500/10 p-3 rounded-lg border border-blue-500/20"><CheckCircle class="w-6 h-6 text-blue-500"/></div>
                                    <div>
                                        <p class="text-sm text-slate-400 font-medium">Completed Appointments</p>
                                        <p class="text-2xl font-bold text-white">{{ completedApts }}</p>
                                    </div>
                                </div>
                            </div>

                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div v-if="completedAppointmentsList.length === 0" class="col-span-full py-12 text-center text-slate-500 border border-dashed border-slate-700 rounded-xl">
                                    <p>No completed appointments yet.</p>
                                    <p class="text-xs mt-2">Finish an appointment from the Table or Calendar to see it here.</p>
                                </div>

                                <div v-for="apt in completedAppointmentsList" :key="apt.id" class="bg-slate-800/30 border border-emerald-500/20 hover:border-emerald-500/50 rounded-xl p-5 transition-all group relative overflow-hidden">
                                    <div class="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-bl-full -z-10 group-hover:bg-emerald-500/10 transition-colors"></div>

                                    <div class="flex justify-between items-start gap-2 mb-4">
                                        <div class="flex-1 min-w-0">
                                            <h3 class="text-lg font-semibold text-emerald-400 transition-colors break-words">{{ apt.clientName }}</h3>
                                            <span class="text-xs bg-slate-900 text-slate-300 px-2 py-1 rounded border border-slate-700 mt-2 inline-flex items-center gap-1">
                                                <Banknote class="w-3 h-3 text-emerald-500"/> Income: {{ apt.income }} RON
                                            </span>
                                        </div>
                                        <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                            <button @click="revertApt(apt)" class="p-1.5 text-amber-400 hover:text-amber-300 bg-amber-400/10 rounded-md" title="Revert to Upcoming"><Undo class="w-4 h-4"/></button>
                                            <button @click.stop.prevent="confirmDeleteApt(apt)" class="p-1.5 text-red-400 hover:text-red-300 bg-red-400/10 rounded-md" title="Delete"><Trash2 class="w-4 h-4"/></button>
                                        </div>
                                    </div>
                                    <div class="space-y-2 mt-4 pt-4 border-t border-slate-700/50">
                                        <div class="flex items-center gap-2 text-sm text-slate-300"><CalendarIcon class="w-4 h-4 text-slate-500" /> {{ formatDate(apt.date) }}</div>
                                        <div class="flex items-center gap-2 text-sm font-mono text-emerald-500/80"><Clock class="w-4 h-4" /> {{ apt.time }}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div v-if="viewMode === 'calendar'" class="animate-in fade-in duration-500">
                            <div v-if="!selectedTimelineDate" class="space-y-4">
                                <div class="flex items-center justify-between bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 mb-6 shadow-sm">
                                    <button @click="prevMonth" class="p-2 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"><ChevronLeft class="w-5 h-5"/></button>
                                    <h3 class="text-xl font-bold text-white tracking-wide">{{ currentMonthName }}</h3>
                                    <button @click="nextMonth" class="p-2 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"><ChevronRight class="w-5 h-5"/></button>
                                </div>

                                <div class="grid grid-cols-7 gap-2 mb-2">
                                    <div v-for="d in ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']" :key="d" class="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        {{ d }}
                                    </div>
                                </div>

                                <div class="grid grid-cols-7 gap-2">
                                    <div v-for="(day, idx) in calendarGrid" :key="idx"
                                         class="aspect-square rounded-xl border transition-all relative overflow-hidden group"
                                         :class="[
                                             !day ? 'border-transparent bg-transparent' : 'bg-slate-800/30 border-slate-700/50 cursor-pointer hover:border-amber-500/50 hover:bg-slate-800/80 shadow-sm',
                                             day && day.hasAppointments ? 'ring-1 ring-amber-500/30 bg-amber-500/5' : ''
                                         ]"
                                         @click="day ? selectedTimelineDate = day.date : null"
                                    >
                                        <template v-if="day">
                                            <div class="p-2 sm:p-3 flex flex-col h-full justify-between z-10 relative">
                                                <span class="text-sm sm:text-base font-bold transition-colors" :class="day.hasAppointments ? 'text-amber-500 group-hover:text-amber-400' : 'text-slate-400 group-hover:text-white'">
                                                    {{ day.dayNumber }}
                                                </span>

                                                <div v-if="day.hasAppointments" class="mt-auto">
                                                    <div class="text-[10px] sm:text-xs bg-amber-500 text-slate-900 font-bold px-1.5 py-0.5 rounded flex items-center justify-center w-fit shadow-md">
                                                        {{ day.count }} apts
                                                    </div>
                                                </div>
                                            </div>
                                            <div v-if="day" class="absolute inset-0 bg-gradient-to-br from-amber-500/0 to-amber-500/0 group-hover:from-amber-500/5 group-hover:to-transparent transition-all z-0"></div>
                                        </template>
                                    </div>
                                </div>
                            </div>

                            <div v-else class="animate-in slide-in-from-right-4 duration-300">
                                <div class="flex items-center gap-4 mb-8 bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 shadow-inner">
                                    <button @click="selectedTimelineDate = null" class="p-2 text-slate-400 hover:text-amber-500 hover:bg-slate-700 rounded-lg transition-colors border border-transparent hover:border-slate-600">
                                        <ChevronLeft class="w-5 h-5" />
                                    </button>
                                    <div>
                                        <h3 class="text-lg font-bold text-white flex items-center gap-2">
                                            <Clock class="w-5 h-5 text-amber-500" /> Daily Timeline
                                        </h3>
                                        <p class="text-sm text-slate-400 font-medium tracking-wide">{{ selectedTimelineDate }}</p>
                                    </div>
                                </div>

                                <div class="relative border-l-2 border-slate-800 ml-6 space-y-6 pb-8">
                                    <div v-for="hour in timelineHours" :key="hour" class="relative pl-8">
                                        <div class="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-900 border-2 border-slate-600 z-10"></div>
                                        <div class="text-sm font-mono text-slate-500 mb-3 -mt-1.5 font-bold">{{ hour }}</div>

                                        <div class="space-y-3">
                                            <div v-for="apt in getAppointmentsForHour(selectedTimelineDate, hour)" :key="apt.id"
                                                 class="rounded-xl p-4 transition-all flex justify-between items-center group shadow-md border"
                                                 :class="apt.status === 'completed'
                                                         ? 'bg-emerald-900/10 border-emerald-500/20 hover:border-emerald-500/40 opacity-75'
                                                         : 'bg-blue-900/10 border-blue-500/20 hover:border-blue-500/40'">

                                                <div class="flex items-center gap-4">
                                                    <div class="px-3 py-1.5 rounded-md font-mono text-sm font-bold shadow-inner border"
                                                         :class="apt.status === 'completed'
                                                                 ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                                                 : 'bg-blue-500/10 text-blue-500 border-blue-500/20'">
                                                        {{ apt.time }}
                                                    </div>
                                                    <div>
                                                        <div class="font-bold text-base flex items-center gap-2"
                                                             :class="apt.status === 'completed' ? 'text-emerald-400 line-through decoration-emerald-500/50' : 'text-white'">
                                                            {{ apt.clientName }}
                                                            <CheckCircle v-if="apt.status === 'completed'" class="w-4 h-4 text-emerald-500" />
                                                        </div>
                                                        <div class="text-xs mt-0.5 uppercase tracking-wider font-semibold"
                                                             :class="apt.status === 'completed' ? 'text-emerald-500/50' : 'text-blue-400/60'">
                                                            Ref: #{{ apt.id }}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div class="flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                                    <button v-if="apt.status !== 'completed'" @click.stop.prevent="openCompleteModal(apt)" class="p-2 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10 rounded-lg transition-colors" title="Complete"><CheckCircle class="w-4 h-4"/></button>
                                                    <button v-if="apt.status === 'completed'" @click.stop.prevent="revertApt(apt)" class="p-2 text-amber-400 hover:text-amber-300 hover:bg-amber-400/10 rounded-lg transition-colors" title="Revert"><Undo class="w-4 h-4"/></button>
                                                    <button @click="selectedDetail = apt" class="p-2.5 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"><Eye class="w-4 h-4"/></button>
                                                </div>
                                            </div>
                                            <div v-if="getAppointmentsForHour(selectedTimelineDate, hour).length === 0" class="h-6 border-l-2 border-dashed border-slate-800/70 ml-4"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    <div v-if="showInsights" class="lg:w-1/3 animate-in fade-in duration-300">
                        <div class="bg-slate-800/50 border border-slate-700 rounded-xl p-5 sticky top-6">
                            <h3 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <BarChart3 class="w-5 h-5 text-amber-500" /> Activity Chart
                            </h3>
                            <p class="text-xs text-slate-400 mb-6">Live appointments distribution per day.</p>

                            <div class="space-y-4">
                                <div v-if="appointmentsPerDay.length === 0" class="text-sm text-slate-500 text-center py-4">No data to chart.</div>

                                <div v-for="stat in appointmentsPerDay" :key="stat.date" class="space-y-1">
                                    <div class="flex justify-between text-xs">
                                        <span class="text-slate-300">{{ stat.date }}</span>
                                        <span class="text-amber-500 font-medium">{{ stat.count }}</span>
                                    </div>
                                    <div class="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                                        <div class="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all duration-500 ease-out"
                                             :style="{ width: `${(stat.count / maxAppointmentsInADay) * 100}%` }">
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="mt-8 pt-4 border-t border-slate-700/50">
                                <div class="flex justify-between text-sm">
                                    <span class="text-slate-400">Total Appointments</span>
                                    <span class="text-white font-bold">{{ appointments.length }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="selectedDetail" class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div class="bg-slate-900 p-0 rounded-2xl border border-slate-800 shadow-2xl max-w-sm w-full overflow-hidden relative">
                <div class="h-2 w-full bg-gradient-to-r from-amber-500 to-orange-400"></div>
                <div class="p-6">
                    <div class="flex justify-between items-start mb-6">
                        <div>
                            <h3 class="text-xl font-bold text-white">Appointment Details</h3>
                            <p class="text-xs text-slate-400 mt-1">System ID: {{ selectedDetail.id }}</p>
                        </div>
                        <button @click="selectedDetail = null" class="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-1.5 rounded-md transition-colors"><X class="w-4 h-4"/></button>
                    </div>

                    <div class="space-y-4">
                        <div class="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                            <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Client</p>
                            <p class="text-lg text-white font-medium">{{ selectedDetail.clientName }}</p>
                        </div>

                        <div class="flex gap-4">
                            <div class="flex-1 bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                                <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Date</p>
                                <p class="text-slate-200">{{ formatDate(selectedDetail.date) }}</p>
                            </div>
                            <div class="flex-1 bg-slate-800/50 p-4 rounded-xl border border-amber-500/20">
                                <p class="text-xs font-semibold text-amber-500/80 uppercase tracking-wider mb-1">Time</p>
                                <p class="text-amber-500 font-mono text-lg">{{ selectedDetail.time }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="isFormOpen" class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div class="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-2xl max-w-md w-full">
                <div class="flex justify-between items-center mb-6">
                    <div>
                        <h3 class="text-xl font-bold text-white">{{ form.id ? 'Edit Appointment' : 'New Appointment' }}</h3>
                        <p class="text-sm text-slate-400 mt-1">Select the date and time below.</p>
                    </div>
                    <button @click="isFormOpen=false" class="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-1.5 rounded-md transition-colors"><X class="w-4 h-4"/></button>
                </div>

                <form @submit.prevent="saveApt" class="space-y-6 mt-4">

                    <div>
                        <label class="block text-sm font-medium text-slate-300 mb-2">Client Name</label>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <Users class="w-4 h-4 text-slate-500"/>
                            </div>
                            <input v-model="form.clientName" placeholder="e.g. John Doe" required
                                   data-testid="appointment-client-name"
                                   class="w-full bg-slate-950/50 border border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl py-3 pl-10 pr-4 text-white outline-none transition-all placeholder:text-slate-600 shadow-inner" />
                        </div>

                        <p v-if="formErrors.clientName" class="mt-1 text-xs text-red-500 font-semibold">{{ formErrors.clientName }}</p>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-slate-300 mb-2">Appointment Date</label>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <CalendarIcon class="w-4 h-4 text-slate-500"/>
                            </div>
                            <input
                                v-model="form.date"
                                type="date"
                                :min="todayDate"
                                required
                                data-testid="appointment-date"
                                class="w-full bg-slate-950/50 border focus:ring-1 rounded-xl py-3 pl-10 pr-4 text-white outline-none transition-all [color-scheme:dark] shadow-inner custom-date"
                                :class="formErrors.date ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-700 focus:border-amber-500 focus:ring-amber-500'"
                            />
                        </div>
                        <p v-if="formErrors.date" class="mt-1 text-xs text-red-500 font-semibold">{{ formErrors.date }}</p>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-slate-300 mb-2 flex justify-between items-center">
                            <span>Select Time</span>
                            <span class="text-amber-500 font-mono text-lg bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/20 shadow-inner">
                                {{ String(form.hour).padStart(2, '0') }}:{{ String(form.minute).padStart(2, '0') }}
                            </span>
                        </label>

                        <div class="flex gap-4">
                            <div class="flex-1 relative">
                                <select v-model.number="form.hour" data-testid="appointment-hour" class="w-full bg-slate-950/50 border border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl py-3 px-4 text-white outline-none transition-all appearance-none cursor-pointer font-mono text-lg shadow-inner">
                                    <option v-for="h in hoursList" :key="h" :value="h">{{ String(h).padStart(2, '0') }}</option>
                                </select>
                                <ChevronDown class="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>

                            <div class="flex items-center text-slate-400 font-bold text-xl">:</div>

                            <div class="flex-1 relative">
                                <select v-model.number="form.minute" data-testid="appointment-minute" class="w-full bg-slate-950/50 border border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl py-3 px-4 text-white outline-none transition-all appearance-none cursor-pointer font-mono text-lg shadow-inner">
                                    <option v-for="m in minutesList" :key="m" :value="m">{{ String(m).padStart(2, '0') }}</option>
                                </select>
                                <ChevronDown class="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                        </div>

                        <p v-if="formErrors.time" class="mt-3 text-sm text-red-500 font-bold bg-red-500/10 p-3 rounded-lg border border-red-500/20 flex items-start gap-2">
                            <span class="mt-0.5">⚠️</span> {{ formErrors.time }}
                        </p>
                    </div>

                    <div class="flex gap-3 pt-6 border-t border-slate-800">
                        <button type="button" @click="isFormOpen=false" data-testid="appointment-cancel" class="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-medium py-3 rounded-xl transition-colors">
                            Cancel
                        </button>
                        <button type="submit" data-testid="appointment-save" class="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-3 rounded-xl transition-all shadow-lg shadow-amber-500/20 flex justify-center items-center gap-2">
                            <CheckCircle class="w-4 h-4" v-if="!form.id"/>
                            {{ form.id ? 'Save Changes' : 'Confirm Booking' }}
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <div v-if="deleteModalOpen" class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-[60] animate-in fade-in duration-200">
            <div class="bg-slate-900 rounded-2xl border border-red-500/30 shadow-2xl shadow-red-900/20 max-w-sm w-full overflow-hidden">
                <div class="p-6">
                    <div class="flex items-center gap-4 mb-4">
                        <div class="bg-red-500/10 p-3 rounded-full border border-red-500/20">
                            <Trash2 class="w-6 h-6 text-red-500" />
                        </div>
                        <h3 class="text-xl font-bold text-white">Delete Appointment</h3>
                    </div>

                    <p class="text-slate-300 mb-6 leading-relaxed">
                        Are you sure you want to delete the appointment for <strong class="text-white">{{ appointmentToDelete?.clientName }}</strong>?
                        <span class="block mt-2 text-sm text-slate-500">This action cannot be undone.</span>
                    </p>

                    <div class="flex gap-3 pt-4 border-t border-slate-800">
                        <button @click="cancelDelete" data-testid="delete-cancel" class="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-medium py-2.5 rounded-lg transition-colors">
                            Cancel
                        </button>
                        <button @click="executeDelete" data-testid="delete-confirm" class="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 rounded-lg transition-all shadow-lg shadow-red-500/20">
                            Yes, delete it
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="isCompleteModalOpen" class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-[60] animate-in fade-in duration-200">
            <div class="bg-slate-900 rounded-2xl border border-emerald-500/30 shadow-2xl shadow-emerald-900/20 max-w-sm w-full overflow-hidden">
                <div class="p-6">
                    <div class="flex items-center gap-4 mb-4">
                        <div class="bg-emerald-500/10 p-3 rounded-full border border-emerald-500/20">
                            <CheckCircle class="w-6 h-6 text-emerald-500" />
                        </div>
                        <h3 class="text-xl font-bold text-white">Complete Appointment</h3>
                    </div>

                    <p class="text-slate-300 mb-4 leading-relaxed text-sm">
                        You are about to complete the appointment for <strong class="text-white">{{ appointmentToComplete?.clientName }}</strong>. Please enter the generated income below.
                    </p>

                    <div class="mb-6">
                        <label class="block text-sm font-medium text-slate-300 mb-2">Income Amount (RON)</label>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <Banknote class="w-4 h-4 text-emerald-500"/>
                            </div>
                            <input v-model.number="incomeAmount" type="number" min="0" placeholder="e.g. 50" required data-testid="complete-income"
                                   class="w-full bg-slate-950/50 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl py-3 pl-10 pr-4 text-white outline-none transition-all placeholder:text-slate-600 shadow-inner" />
                        </div>
                    </div>

                    <div class="flex gap-3 pt-4 border-t border-slate-800">
                        <button @click="isCompleteModalOpen = false" data-testid="complete-cancel" class="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-medium py-2.5 rounded-xl transition-colors">
                            Cancel
                        </button>
                        <button @click="executeComplete" data-testid="complete-confirm" :disabled="!incomeAmount && incomeAmount !== 0" class="flex-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed">
                            Confirm
                        </button>
                    </div>
                </div>
            </div>
        </div>

    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { LogOut, Scissors, BarChart3, Calendar as CalendarIcon, LayoutGrid, Table as TableIcon, Plus, Eye, Pencil, Trash2, X, Clock, ChevronLeft, ChevronRight, Search, CheckCircle, Check, Users, ChevronDown, Banknote, Undo } from 'lucide-vue-next';
import {
    appointments,
    addAppointment,
    updateAppointment,
    deleteAppointmentById,
    loadAllAppointments,
} from '../domain/appointmentStore';
import { logout } from '../domain/authStore';
import { validateAppointment } from '../domain/appointmentModel';
import { readBrowserState, recordBrowserEvent } from '../domain/browserState';

const emit = defineEmits(['navigate']);

const browserState = readBrowserState();

const viewMode = ref(browserState.tableViewMode || 'table');
const APPOINTMENT_DURATION = 60;

const hoursList = Array.from({ length: 12 }, (_, i) => i + 8);
const minutesList = Array.from({ length: 12 }, (_, i) => i * 5);

// --- PAGINATION PENTRU TABEL ---
const currentPage = ref(1);
const itemsPerPage = 5;
const totalPages = computed(() => Math.max(1, Math.ceil(appointments.value.length / itemsPerPage)));
const paginatedAppointments = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    return appointments.value.slice(start, start + itemsPerPage);
});

// --- STATE DE BAZA ---
const selectedDetail = ref(null);
const isFormOpen = ref(false);
const form = ref({ id: null, clientName: '', date: '', hour: 8, minute: 0, status: 'upcoming', income: null });
const formErrors = ref({});
const showInsights = ref(false);

const handleLogout = () => {
    appointments.value = []; // Curățăm RAM-ul imediat
    logout(); // Funcția de logout va șterge token-ul și va reîncărca pagina spre root (/)
};
const goToStatistics = () => {
    recordBrowserEvent('navigate', 'statistics');
    emit('navigate', 'statistics');
};

const setViewMode = (mode) => {
    viewMode.value = mode;
    recordBrowserEvent('table_view_mode', mode);
};

const todayDate = computed(() => new Date().toISOString().split('T')[0]);

// STATE MODAL STERGERE
const deleteModalOpen = ref(false);
const appointmentToDelete = ref(null);

// NOU: STATE MODAL FINALIZARE (INCOME)
const isCompleteModalOpen = ref(false);
const appointmentToComplete = ref(null);
const incomeAmount = ref('');

// --- CRUD & VALIDARE ---
const openAddModal = () => {
    formErrors.value = {};
    form.value = { id: null, clientName: '', date: '', hour: 8, minute: 0, status: 'upcoming', income: null };
    isFormOpen.value = true;
};

const openEditModal = (apt) => {
    formErrors.value = {};
    const [hStr, mStr] = apt.time.split(':');
    form.value = { ...apt, hour: parseInt(hStr, 10), minute: parseInt(mStr, 10) };
    isFormOpen.value = true;
};

const saveApt = async () => {
    const formattedTime = `${String(form.value.hour).padStart(2, '0')}:${String(form.value.minute).padStart(2, '0')}`;
    form.value.time = formattedTime;

    const { isValid, errors } = validateAppointment(form.value);

    if (!isValid) {
        formErrors.value = errors;
        return;
    }

    const result = form.value.id
        ? await updateAppointment(form.value)
        : await addAppointment(form.value);

    if (result.success) {
        recordBrowserEvent(form.value.id ? 'appointment_updated' : 'appointment_created', form.value.clientName, {
            appointmentId: form.value.id,
            date: form.value.date,
            time: form.value.time,
        });
        isFormOpen.value = false;
        formErrors.value = {};
        if (!form.value.id) currentPage.value = 1;
    } else {
        formErrors.value = result.errors;
        if (result.errors.general) {
            alert(result.errors.general);
        }
    }
};

const confirmDeleteApt = (apt) => {
    appointmentToDelete.value = apt;
    deleteModalOpen.value = true;
};

const executeDelete = async () => {
    if (!appointmentToDelete.value) return;

    const deleted = await deleteAppointmentById(appointmentToDelete.value.id);
    if (!deleted) {
        alert('Could not delete appointment. Please try again.');
        return;
    }

    recordBrowserEvent('appointment_deleted', appointmentToDelete.value.clientName, {
        appointmentId: appointmentToDelete.value.id,
    });
    deleteModalOpen.value = false;
    appointmentToDelete.value = null;

    const empty = paginatedAppointments.value.length === 0;
    const notFirst = currentPage.value > 1;
    if (empty && notFirst) {
        currentPage.value--;
    }
};

const cancelDelete = () => {
    deleteModalOpen.value = false;
    appointmentToDelete.value = null;
};

// NOU: Deschide modalul de completion in loc sa faca actiunea instant
const openCompleteModal = (apt) => {
    appointmentToComplete.value = apt;
    incomeAmount.value = ''; // Resetam input-ul mereu
    isCompleteModalOpen.value = true;
};

// NOU: Executa salvarea statusului completed impreuna cu venitul
const executeComplete = async () => {
    if (!appointmentToComplete.value || (!incomeAmount.value && incomeAmount.value !== 0)) return;

    const updated = {
        ...appointmentToComplete.value,
        status: 'completed',
        income: Number(incomeAmount.value),
    };

    const result = await updateAppointment(updated);
    if (!result.success) {
        alert(result.errors.general || 'Could not complete appointment.');
        return;
    }

    recordBrowserEvent('appointment_completed', updated.clientName, {
        appointmentId: updated.id,
        income: Number(incomeAmount.value),
    });

    isCompleteModalOpen.value = false;
    appointmentToComplete.value = null;
};

// NOU: Revert reseteaza statusul si curata venitul
const revertApt = async (apt) => {
    const result = await updateAppointment({
        ...apt,
        status: 'upcoming',
        income: null,
    });

    if (!result.success) {
        alert(result.errors.general || 'Could not revert appointment.');
        return;
    }
    recordBrowserEvent('appointment_reverted', apt.clientName, {
        appointmentId: apt.id,
    });
};

onMounted(() => {
    loadAllAppointments();
});

// --- FORMATTING & STATS ---
const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if(parts.length === 3) return `${parts[2]}.${parts[1]}.${parts[0]}`;
    return dateStr;
};

const totalApts = computed(() => appointments.value.length);
const completedApts = computed(() => appointments.value.filter(a => a.status === 'completed').length);
const upcomingApts = computed(() => appointments.value.filter(a => a.status !== 'completed').length);

// NOU: Lista doar cu cele completate pentru tab-ul "History"
const completedAppointmentsList = computed(() => {
    return appointments.value.filter(a => a.status === 'completed');
});

// NOU: Calculăm venitul total
const totalIncome = computed(() => {
    return completedAppointmentsList.value.reduce((sum, apt) => sum + (apt.income || 0), 0);
});

const appointmentsPerDay = computed(() => {
    const counts = {};
    appointments.value.forEach(apt => {
        counts[apt.date] = (counts[apt.date] || 0) + 1;
    });
    return Object.entries(counts)
        .sort((a, b) => new Date(a[0]) - new Date(b[0]))
        .map(([date, count]) => ({ date: formatDate(date), count }));
});

const maxAppointmentsInADay = computed(() => {
    if (appointmentsPerDay.value.length === 0) return 1;
    return Math.max(...appointmentsPerDay.value.map(d => d.count));
});

// --- TIMELINE & CALENDAR STATE ---
const selectedTimelineDate = ref(null);

const timelineHours = computed(() => {
    return Array.from({ length: 13 }, (_, i) => {
        return `${(i + 8).toString().padStart(2, '0')}:00`;
    });
});

const getAppointmentsForHour = (date, hourString) => {
    const hourPrefix = hourString.split(':')[0];
    return appointments.value.filter(apt => {
        return formatDate(apt.date) === date && apt.time.startsWith(hourPrefix);
    }).sort((a, b) => a.time.localeCompare(b.time));
};

const currentMonthDate = ref(new Date(2026, 2, 1));

const nextMonth = () => {
    currentMonthDate.value = new Date(currentMonthDate.value.getFullYear(), currentMonthDate.value.getMonth() + 1, 1);
};

const prevMonth = () => {
    currentMonthDate.value = new Date(currentMonthDate.value.getFullYear(), currentMonthDate.value.getMonth() - 1, 1);
};

const currentMonthName = computed(() => {
    return currentMonthDate.value.toLocaleString('en-US', { month: 'long', year: 'numeric' });
});

const calendarGrid = computed(() => {
    const year = currentMonthDate.value.getFullYear();
    const month = currentMonthDate.value.getMonth();

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

    const days = [];
    for (let i = 0; i < firstDayOffset; i++) { days.push(null); }
    for (let i = 1; i <= daysInMonth; i++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        const formatted = formatDate(dateStr);
        const count = appointments.value.filter(a => formatDate(a.date) === formatted).length;
        days.push({ date: formatted, dayNumber: i, count: count, hasAppointments: count > 0 });
    }
    return days;
});
</script>

<style scoped>
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(4px); }
    to { opacity: 1; transform: translateY(0); }
}
.animate-in {
    animation: fadeIn 0.3s ease-out forwards;
}

.custom-date::-webkit-calendar-picker-indicator {
    cursor: pointer;
    opacity: 0.6;
    transition: 0.2s ease;
}
.custom-date::-webkit-calendar-picker-indicator:hover {
    opacity: 1;
}
</style>
