export const GuidView = {
    template: `
    <div class="space-y-4">
        <div class="flex items-center gap-2 px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded">
            <code class="flex-1 text-xs font-mono text-[var(--text-primary)]">00000000-0000-0000-0000-000000000000</code>
            <CopyButton :text="'00000000-0000-0000-0000-000000000000'"></CopyButton>
        </div>

        <div class="space-y-3">
            <div class="flex flex-wrap gap-3">
                <label class="flex items-center gap-1.5 cursor-pointer">
                    <input type="radio" v-model="format" value="D" class="w-4 h-4 rounded text-[var(--accent)] border-[var(--border-subtle)]">
                    <span class="text-xs text-[var(--text-secondary)]">带连字符</span>
                </label>
                <label class="flex items-center gap-1.5 cursor-pointer">
                    <input type="radio" v-model="format" value="N" class="w-4 h-4 rounded text-[var(--accent)] border-[var(--border-subtle)]">
                    <span class="text-xs text-[var(--text-secondary)]">无连字符</span>
                </label>
                <label class="flex items-center gap-1.5 cursor-pointer">
                    <input type="radio" v-model="format" value="B" class="w-4 h-4 rounded text-[var(--accent)] border-[var(--border-subtle)]">
                    <span class="text-xs text-[var(--text-secondary)]">带花括号</span>
                </label>
                <label class="flex items-center gap-1.5 cursor-pointer">
                    <input type="radio" v-model="format" value="P" class="w-4 h-4 rounded text-[var(--accent)] border-[var(--border-subtle)]">
                    <span class="text-xs text-[var(--text-secondary)]">带圆括号</span>
                </label>
                <label class="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" v-model="uppercase" class="w-4 h-4 rounded border-[var(--border-subtle)] text-[var(--accent)]">
                    <span class="text-xs text-[var(--text-secondary)]">大写</span>
                </label>
            </div>

            <div class="flex flex-col lg:flex-row lg:items-center gap-3">
                <label class="text-xs text-[var(--text-secondary)]">生成数量</label>
                <input type="number" v-model.number="count" min="1" max="100"
                    class="w-24 px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-xs text-[var(--text-primary)] outline-none hover:border-[var(--border-strong)] focus:border-[var(--border-focus)]">
                <FButton type="primary" size="sm" @click="generate">生成</FButton>
            </div>

            <div v-if="guids.length" class="space-y-2">
                <div v-for="(g, i) in guids" :key="i"
                    class="flex items-center gap-2 px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded">
                    <code class="flex-1 text-xs font-mono text-[var(--text-primary)] select-all">{{ g }}</code>
                    <CopyButton :text="g"></CopyButton>
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            format: 'D',
            uppercase: true,
            count: 5,
            guids: [],
        };
    },
    mounted() {
        this.generate();
    },
    methods: {
        generate() {
            this.guids = [];
            for (let i = 0; i < this.count; i++) {
                const raw = this.generateUUID();
                let guid = raw;
                if (this.format === 'N') guid = guid.replace(/-/g, '');
                else if (this.format === 'B') guid = '{' + guid + '}';
                else if (this.format === 'P') guid = '(' + guid + ')';
                if (this.uppercase) guid = guid.toUpperCase();
                this.guids.push(guid);
            }
        },
        generateUUID() {
            if (typeof crypto !== 'undefined' && crypto.randomUUID) {
                return crypto.randomUUID();
            }
            return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
                (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
            );
        },
        refresh() {
            this.generate();
        }
    }
};
