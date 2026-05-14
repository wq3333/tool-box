import { FInput } from '../components/FInput.js';

const { ref, onMounted } = Vue;

export const TimestampView = {
    components: { FInput },
    template: `
    <div class="h-full flex flex-col gap-4 p-4">
        <div class="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div class="bg-[var(--bg-surface)] rounded-lg border border-[var(--border-subtle)] p-4 flex flex-col gap-3 flex-1 min-h-0">
                <label class="text-sm font-medium text-[var(--text-secondary)]">日期时间</label>
                <FInput type="datetime-local" v-model="datetime"></FInput>
                <FButton type="primary" @click="toUnix">转为时间戳</FButton>
                <div v-if="unixResult" class="flex flex-col gap-2 flex-1 min-h-0">
                    <div class="flex items-center gap-2">
                        <span class="text-xs text-[var(--text-tertiary)] min-w-[40px]">秒:</span>
                        <code class="flex-1 px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)]">{{ unixResult.seconds }}</code>
                        <CopyButton :text="String(unixResult.seconds)"></CopyButton>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="text-xs text-[var(--text-tertiary)] min-w-[40px]">毫秒:</span>
                        <code class="flex-1 px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)]">{{ unixResult.milliseconds }}</code>
                        <CopyButton :text="String(unixResult.milliseconds)"></CopyButton>
                    </div>
                </div>
            </div>

            <div class="bg-[var(--bg-surface)] rounded-lg border border-[var(--border-subtle)] p-4 flex flex-col gap-3 flex-1 min-h-0">
                <div class="flex flex-wrap gap-4 items-center">
                    <label class="text-sm font-medium text-[var(--text-secondary)]">Unix时间戳</label>
                    <div class="flex items-center gap-3">
                        <label class="flex items-center gap-1.5 cursor-pointer">
                            <input type="radio" v-model="unit" value="seconds" class="w-4 h-4 rounded text-[var(--accent)] border-[var(--border-subtle)]">
                            <span class="text-xs text-[var(--text-secondary)]">秒</span>
                        </label>
                        <label class="flex items-center gap-1.5 cursor-pointer">
                            <input type="radio" v-model="unit" value="milliseconds" class="w-4 h-4 rounded text-[var(--accent)] border-[var(--border-subtle)]">
                            <span class="text-xs text-[var(--text-secondary)]">毫秒</span>
                        </label>
                    </div>
                </div>
                <FInput v-model="timestamp" placeholder="输入时间戳（秒或毫秒）"></FInput>
                <FButton type="primary" @click="toDatetime">转为日期时间</FButton>
                <div v-if="datetimeResult" class="flex flex-col gap-2 flex-1 min-h-0">
                    <div class="flex items-center gap-2">
                        <span class="text-xs text-[var(--text-tertiary)] min-w-[40px]">本地:</span>
                        <code class="flex-1 px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)]">{{ datetimeResult.local }}</code>
                        <CopyButton :text="datetimeResult.local"></CopyButton>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="text-xs text-[var(--text-tertiary)] min-w-[40px]">UTC:</span>
                        <code class="flex-1 px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)]">{{ datetimeResult.utc }}</code>
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
