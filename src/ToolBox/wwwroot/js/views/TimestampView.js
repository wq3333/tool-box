import { IconClockArrow, IconCalendar } from '../components/icon.js';

const { ref, onMounted } = Vue;

export const TimestampView = {
    components: { IconClockArrow, IconCalendar },
    template: `
    <div class="h-full flex flex-col gap-4 p-4 bg-gradient-to-br from-slate-50 to-slate-100">
        <div class="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col gap-4 flex-1 min-h-0">
                <label class="text-sm font-semibold text-slate-700">日期时间</label>
                <input type="datetime-local" v-model="datetime"
                    class="h-10 w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-sm text-[var(--text-primary)] font-mono outline-none transition-all duration-150 ease-out hover:border-[var(--border-strong)] focus:border-[var(--border-focus)] focus:shadow-[0_0_0_3px_var(--accent-subtle)]">
                <FButton type="primary" @click="toUnix" class="w-full text-base">
                    <IconClockArrow :size="20" />
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
                <FButton type="primary" @click="toDatetime" class="w-full text-base">
                    <IconCalendar :size="20" />
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
            const pad = (n) => String(n).padStart(2, '0');
            datetimeResult.value = {
                local: `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`,
                utc: `${date.getUTCFullYear()}/${pad(date.getUTCMonth() + 1)}/${pad(date.getUTCDate())} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`
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