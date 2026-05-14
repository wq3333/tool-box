import { FInput } from '../components/FInput.js';

const { ref, onMounted } = Vue;

export const TimestampView = {
    components: { FInput },
    template: `
    <div class="h-full flex flex-col gap-4 p-4 bg-gradient-to-br from-slate-50 to-slate-100">
        <div class="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col gap-4 flex-1 min-h-0">
                <div class="flex items-center justify-between">
                    <label class="text-sm font-semibold text-slate-700">日期时间</label>
                    <button @click="updateNow" class="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        现在
                    </button>
                </div>
                <input type="datetime-local" v-model="datetime"
                    class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <FButton type="primary" @click="toUnix" class="w-full py-3 text-base">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    转为时间戳
                </FButton>
                <div v-if="unixResult" class="flex flex-col gap-3">
                    <div class="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200 rounded-lg">
                        <span class="text-xs text-slate-500 min-w-[50px]">秒:</span>
                        <code class="flex-1 text-sm font-mono text-slate-700">{{ unixResult.seconds }}</code>
                        <CopyButton :text="String(unixResult.seconds)"></CopyButton>
                    </div>
                    <div class="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200 rounded-lg">
                        <span class="text-xs text-slate-500 min-w-[50px]">毫秒:</span>
                        <code class="flex-1 text-sm font-mono text-slate-700">{{ unixResult.milliseconds }}</code>
                        <CopyButton :text="String(unixResult.milliseconds)"></CopyButton>
                    </div>
                </div>
            </div>

            <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col gap-4 flex-1 min-h-0">
                <div class="flex flex-wrap gap-4 items-center">
                    <label class="text-sm font-semibold text-slate-700">Unix时间戳</label>
                    <div class="flex items-center gap-4">
                        <label class="flex items-center gap-2 cursor-pointer">
                            <input type="radio" v-model="unit" value="seconds" class="w-4 h-4 text-blue-500 border-slate-300 focus:ring-blue-500">
                            <span class="text-sm text-slate-600">秒</span>
                        </label>
                        <label class="flex items-center gap-2 cursor-pointer">
                            <input type="radio" v-model="unit" value="milliseconds" class="w-4 h-4 text-blue-500 border-slate-300 focus:ring-blue-500">
                            <span class="text-sm text-slate-600">毫秒</span>
                        </label>
                    </div>
                </div>
                <FInput v-model="timestamp" placeholder="输入时间戳（秒或毫秒）"></FInput>
                <FButton type="primary" @click="toDatetime" class="w-full py-3 text-base">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    转为日期时间
                </FButton>
                <div v-if="datetimeResult" class="flex flex-col gap-3">
                    <div class="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-slate-50 to-emerald-50 border border-slate-200 rounded-lg">
                        <span class="text-xs text-slate-500 min-w-[50px]">本地:</span>
                        <code class="flex-1 text-sm font-mono text-slate-700">{{ datetimeResult.local }}</code>
                        <CopyButton :text="datetimeResult.local"></CopyButton>
                    </div>
                    <div class="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-slate-50 to-emerald-50 border border-slate-200 rounded-lg">
                        <span class="text-xs text-slate-500 min-w-[50px]">UTC:</span>
                        <code class="flex-1 text-sm font-mono text-slate-700">{{ datetimeResult.utc }}</code>
                        <CopyButton :text="datetimeResult.utc"></CopyButton>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,
    setup() {
        const datetime = ref('');
        const timestamp = ref('');
        const unit = ref('seconds');
        const unixResult = ref(null);
        const datetimeResult = ref(null);

        const updateNow = () => {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            datetime.value = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
            timestamp.value = parseInt(now.getTime() / 1000);
        };

        const toUnix = () => {
            if (!datetime.value) return;
            const ms = new Date(datetime.value).getTime();
            unixResult.value = {
                seconds: Math.floor(ms / 1000),
                milliseconds: ms
            };
        };

        const toDatetime = () => {
            if (!timestamp.value) return;
            let ts = parseInt(timestamp.value);
            if (isNaN(ts)) return;
            if (unit.value === 'seconds') ts *= 1000;
            const date = new Date(ts);
            datetimeResult.value = {
                local: date.toLocaleString('zh-CN', { hour12: false }),
                utc: date.toUTCString()
            };
        };

        const refresh = () => {
            updateNow();
            toUnix();
            toDatetime();
        };

        onMounted(() => {
            updateNow();
            toUnix();
            toDatetime();
        });

        return { datetime, timestamp, unit, unixResult, datetimeResult, toUnix, toDatetime, refresh };
    }
};