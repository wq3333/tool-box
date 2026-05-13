export const TimestampView = {
    template: `
    <div class="space-y-6">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="space-y-3">
                <label class="text-sm font-medium text-[var(--text-secondary)]">日期时间</label>
                <input type="datetime-local" v-model="datetime"
                    class="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-sm text-[var(--text-primary)] outline-none hover:border-[var(--border-strong)] focus:border-[var(--border-focus)]">
                <FButton type="primary" @click="toUnix">转为时间戳</FButton>
                <div v-if="unixResult" class="space-y-2">
                    <div class="flex items-center gap-2">
                        <span class="text-xs text-[var(--text-tertiary)] min-w-[40px]">秒:</span>
                        <code class="flex-1 px-3 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)]">{{ unixResult.seconds }}</code>
                        <CopyButton :text="String(unixResult.seconds)"></CopyButton>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="text-xs text-[var(--text-tertiary)] min-w-[40px]">毫秒:</span>
                        <code class="flex-1 px-3 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)]">{{ unixResult.milliseconds }}</code>
                        <CopyButton :text="String(unixResult.milliseconds)"></CopyButton>
                    </div>
                </div>
            </div>

            <div class="space-y-3">
                <div class="flex flex-wrap gap-4">
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
                <input type="text" v-model="timestamp" placeholder="输入时间戳（秒或毫秒）"
                    class="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-sm font-mono text-[var(--text-primary)] outline-none placeholder:text-[var(--text-tertiary)] hover:border-[var(--border-strong)] focus:border-[var(--border-focus)]">
                <FButton type="primary" @click="toDatetime">转为日期时间</FButton>
                <div v-if="datetimeResult" class="space-y-2">
                    <div class="flex items-center gap-2">
                        <span class="text-xs text-[var(--text-tertiary)] min-w-[40px]">本地:</span>
                        <code class="flex-1 px-3 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)]">{{ datetimeResult.local }}</code>
                        <CopyButton :text="datetimeResult.local"></CopyButton>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="text-xs text-[var(--text-tertiary)] min-w-[40px]">UTC:</span>
                        <code class="flex-1 px-3 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)]">{{ datetimeResult.utc }}</code>
                        <CopyButton :text="datetimeResult.utc"></CopyButton>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            datetime: '',
            timestamp: '',
            unit: 'seconds',
            unixResult: null,
            datetimeResult: null,
        };
    },
    mounted() {
        this.updateNow();
        this.toUnix();
        this.toDatetime();
    },
    methods: {
        updateNow() {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            this.datetime = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
            this.timestamp = parseInt(now.getTime() / 1000);
        },
        toUnix() {
            if (!this.datetime) return;
            const ms = new Date(this.datetime).getTime();
            this.unixResult = {
                seconds: Math.floor(ms / 1000),
                milliseconds: ms
            };
        },
        toDatetime() {
            if (!this.timestamp) return;
            let ts = parseInt(this.timestamp);
            if (isNaN(ts)) return;
            if (this.unit === 'seconds') ts *= 1000;
            const date = new Date(ts);
            this.datetimeResult = {
                local: date.toLocaleString('zh-CN', { hour12: false }),
                utc: date.toUTCString()
            };
        },
        refresh() {
            this.updateNow();
            this.toUnix();
            this.toDatetime();
        }
    }
};