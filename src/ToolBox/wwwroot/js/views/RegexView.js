export const RegexView = {
    template: `
    <div class="space-y-4">
        <div class="flex-1 flex flex-col lg:flex-row gap-4">
            <div class="flex-0 lg:flex-3 flex flex-col gap-3">
                <div>
                    <label class="block text-xs font-medium text-[var(--text-secondary)] mb-1">正则表达式</label>
                    <input type="text" v-model="pattern" placeholder="输入正则表达式..."
                        class="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-sm font-mono text-[var(--text-primary)] outline-none placeholder:text-[var(--text-tertiary)] hover:border-[var(--border-strong)] focus:border-[var(--border-focus)]">
                </div>

                <div class="flex items-center gap-4">
                    <label class="flex items-center gap-1.5 cursor-pointer">
                        <input type="checkbox" v-model="ignoreCase" class="w-4 h-4 rounded text-[var(--accent)] border-[var(--border-subtle)]">
                        <span class="text-xs text-[var(--text-secondary)]">忽略大小写</span>
                    </label>
                    <label class="flex items-center gap-1.5 cursor-pointer">
                        <input type="checkbox" v-model="multiline" class="w-4 h-4 rounded text-[var(--accent)] border-[var(--border-subtle)]">
                        <span class="text-xs text-[var(--text-secondary)]">多行模式</span>
                    </label>
                </div>

                <div>
                    <label class="block text-xs font-medium text-[var(--text-secondary)] mb-1">测试文本</label>
                    <textarea v-model="text" rows="6" placeholder="输入测试文本..."
                        class="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none resize-y placeholder:text-[var(--text-tertiary)] hover:border-[var(--border-strong)] focus:border-[var(--border-focus)]"></textarea>
                </div>

                <FButton type="primary">测试</FButton>

                <div v-if="result">
                    <div v-if="!result.isValid" class="px-3 py-2 bg-[var(--danger)]/10 text-[var(--danger)] rounded text-xs">
                        无效的正则表达式: {{ result.error }}
                    </div>
                    <div v-else class="space-y-2">
                        <div class="px-3 py-2 bg-[var(--success)]/10 text-[var(--success)] rounded text-xs">
                            找到 {{ result.matches.length }} 个匹配
                        </div>
                        <div v-for="(m, i) in result.matches" :key="i" class="px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded">
                            <div class="text-xs text-[var(--text-secondary)]">匹配 {{ i + 1 }}: 索引 {{ m.index }}, 长度 {{ m.length }}</div>
                            <code class="text-xs font-mono text-[var(--accent)]">{{ m.value }}</code>
                            <div v-if="m.groups.length" class="mt-1 space-y-0.5">
                                <div v-for="(g, gi) in m.groups" :key="gi" class="text-xs text-[var(--text-tertiary)]">
                                    组 {{ g.name || gi }}: <span class="text-[var(--text-secondary)]">{{ g.value }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="flex-1">
                <h3 class="text-xs font-semibold text-[var(--text-secondary)] mb-2">常用正则</h3>
                <div class="space-y-1 overflow-y-auto max-h-[300px]">
                    <div v-for="p in patterns" :key="p.name"
                        @click="usePattern(p)"
                        class="px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded cursor-pointer hover:border-[var(--border-strong)]">
                        <div class="text-xs font-medium text-[var(--text-primary)]">{{ p.name }}</div>
                        <div class="text-xs text-[var(--text-tertiary)] truncate">{{ p.description }}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            pattern: '',
            text: '',
            ignoreCase: false,
            multiline: false,
            result: null,
            patterns: []
        };
    },
    async mounted() {
        try {
            const res = await api('GET', '/regex/patterns');
            this.patterns = res.data;
        } catch(e) {}
    },
    methods: {
        async test() {
            if (!this.pattern) return;
            try {
                const res = await api('POST', '/regex/test', {
                    pattern: this.pattern,
                    text: this.text,
                    ignoreCase: this.ignoreCase,
                    multiline: this.multiline
                });
                this.result = res.data;
            } catch(e) {
                this.result = { isValid: false, error: e.message, matches: [] };
            }
        },
        usePattern(p) {
            this.pattern = p.pattern;
        },
        refresh() {
            this.pattern = '';
            this.text = '';
            this.ignoreCase = false;
            this.multiline = false;
            this.result = null;
        }
    }
};