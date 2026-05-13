export const StringView = {
    template: `
    <div class="space-y-4">
        <div class="hidden lg:flex gap-1 border-b border-[var(--border-subtle)] pb-3">
            <button v-for="tab in tabs" :key="tab.key" @click="activeTab = tab.key"
                :class="['px-4 py-2 text-sm rounded transition-colors', activeTab === tab.key ? 'bg-[var(--accent)] text-[var(--text-inverse)]' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]']">
                {{ tab.label }}
            </button>
        </div>
        <div class="lg:hidden">
            <label class="block text-xs font-medium text-[var(--text-secondary)] mb-1">选择操作</label>
            <FSingleSelect v-model="activeTab" :options="tabs.map(t => ({ value: t.key, label: t.label }))"></FSingleSelect>
        </div>

        <div v-if="activeTab === 'diff'" class="space-y-3">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <div>
                    <label class="block text-xs font-medium text-[var(--text-secondary)] mb-1">文本1</label>
                    <textarea v-model="diffText1" rows="10" placeholder="输入文本1..."
                        class="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none resize-y placeholder:text-[var(--text-tertiary)] hover:border-[var(--border-strong)] focus:border-[var(--border-focus)]"></textarea>
                </div>
                <div>
                    <label class="block text-xs font-medium text-[var(--text-secondary)] mb-1">文本2</label>
                    <textarea v-model="diffText2" rows="10" placeholder="输入文本2..."
                        class="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none resize-y placeholder:text-[var(--text-tertiary)] hover:border-[var(--border-strong)] focus:border-[var(--border-focus)]"></textarea>
                </div>
            </div>
            <FButton type="primary" size="sm">比较</FButton>
            <div v-if="diffResult.length" class="space-y-1">
                <div v-for="(line, i) in diffResult" :key="i"
                    :class="['px-3 py-1 text-xs font-mono rounded',
                             line.type === 'add' ? 'bg-[var(--success)]/10 text-[var(--success)]' :
                             line.type === 'del' ? 'bg-[var(--danger)]/10 text-[var(--danger)]' : 'bg-[var(--bg-surface)] text-[var(--text-secondary)]']">
                    <span class="mr-2">{{ line.type === 'add' ? '+' : line.type === 'del' ? '-' : ' ' }}</span>{{ line.text }}
                </div>
            </div>
        </div>

        <div v-if="activeTab === 'escape'" class="space-y-3">
            <div>
                <label class="block text-xs font-medium text-[var(--text-secondary)] mb-1">输入文本</label>
                <textarea v-model="escapeInput" rows="6" placeholder="输入文本..."
                    class="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none resize-y placeholder:text-[var(--text-tertiary)] hover:border-[var(--border-strong)] focus:border-[var(--border-focus)]"></textarea>
            </div>
            <div class="flex gap-2">
                <FButton type="primary" size="sm" @click="doEscape">转义</FButton>
                <FButton type="default" size="sm" @click="doUnescape">去除转义</FButton>
            </div>
            <div v-if="escapeResult">
                <div class="flex items-center justify-between mb-1">
                    <label class="text-xs font-medium text-[var(--text-secondary)]">结果</label>
                    <CopyButton :text="escapeResult"></CopyButton>
                </div>
                <textarea v-model="escapeResult" rows="6" readonly
                    class="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none resize-y"></textarea>
            </div>
        </div>

        <div v-if="activeTab === 'case'" class="space-y-3">
            <div>
                <label class="block text-xs font-medium text-[var(--text-secondary)] mb-1">输入文本</label>
                <textarea v-model="caseInput" rows="4" placeholder="输入文本..."
                    class="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none resize-y placeholder:text-[var(--text-tertiary)] hover:border-[var(--border-strong)] focus:border-[var(--border-focus)]"></textarea>
            </div>
            <div class="flex flex-wrap gap-2">
                <FButton v-for="ct in caseTypes" :key="ct.value" @click="convertCase(ct.value)" type="default" size="sm">{{ ct.label }}</FButton>
            </div>
            <div v-if="caseResult">
                <div class="flex items-center justify-between mb-1">
                    <label class="text-xs font-medium text-[var(--text-secondary)]">结果</label>
                    <CopyButton :text="caseResult"></CopyButton>
                </div>
                <textarea v-model="caseResult" rows="4" readonly
                    class="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none resize-y"></textarea>
            </div>
        </div>

        <div v-if="activeTab === 'random'" class="space-y-3">
            <div class="flex flex-col items-start lg:flex-row lg:items-center gap-3">
                <div class="flex gap-2 items-center">
                    <label class="text-xs text-[var(--text-secondary)]">字符集</label>
                    <FSingleSelect v-model="randomCharSet"
                        :options="[{value:'number',label:'纯数字'},{value:'letter_lower',label:'小写字母'},{value:'letter_upper',label:'大写字母'},{value:'letter',label:'字母'},{value:'number_and_letter',label:'数字+字母'},{value:'mix',label:'混合(含特殊字符)'}]"></FSingleSelect>
                </div>
                <div class="flex gap-2 items-center">
                    <label class="text-xs text-[var(--text-secondary)]">长度</label>
                    <input type="number" v-model.number="randomLength" min="1" max="256"
                        class="w-20 px-3 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-xs text-[var(--text-primary)] outline-none hover:border-[var(--border-strong)] focus:border-[var(--border-focus)]">
                </div>
                <FButton type="primary" size="sm" @click="generateRandom">生成</FButton>
            </div>
            <div v-if="randomResult">
                <div class="flex items-center gap-2 px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded">
                    <code class="flex-1 text-xs font-mono text-[var(--text-primary)]">{{ randomResult }}</code>
                    <CopyButton :text="randomResult"></CopyButton>
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            activeTab: 'diff',
            tabs: [
                { key: 'diff', label: '差异比较' },
                { key: 'escape', label: '转义/去除转义' },
                { key: 'case', label: '大小写转换' },
                { key: 'random', label: '随机字符串' }
            ],
            diffText1: '', diffText2: '', diffResult: [],
            escapeInput: '', escapeResult: '',
            caseInput: '', caseResult: '',
            caseTypes: [
                { label: 'UPPER', value: 'upper' },
                { label: 'lower', value: 'lower' },
                { label: 'camelCase', value: 'camelcase' },
                { label: 'PascalCase', value: 'pascalcase' },
                { label: 'snake_case', value: 'snake_case' },
                { label: 'kebab-case', value: 'kebab-case' }
            ],
            randomLength: 16, randomCharSet: 'number_and_letter', randomResult: ''
        };
    },
    mounted() {
        this.generateRandom();
    },
    methods: {
        computeDiff() {
            const lines1 = this.diffText1.split('\n');
            const lines2 = this.diffText2.split('\n');
            const result = [];
            const maxLen = Math.max(lines1.length, lines2.length);
            for (let i = 0; i < maxLen; i++) {
                const l1 = i < lines1.length ? lines1[i] : undefined;
                const l2 = i < lines2.length ? lines2[i] : undefined;
                if (l1 === l2) {
                    result.push({ type: 'eq', text: l1 });
                } else {
                    if (l1 !== undefined) result.push({ type: 'del', text: l1 });
                    if (l2 !== undefined) result.push({ type: 'add', text: l2 });
                }
            }
            this.diffResult = result;
        },
        async doEscape() {
            try {
                const res = await api('POST', '/string/escape', { text: this.escapeInput });
                this.escapeResult = res.data;
            } catch(e) { this.escapeResult = '转义失败: ' + e.message; }
        },
        async doUnescape() {
            try {
                const res = await api('POST', '/string/unescape', { text: this.escapeInput });
                this.escapeResult = res.data;
            } catch(e) { this.escapeResult = '去除转义失败: ' + e.message; }
        },
        async convertCase(targetCase) {
            try {
                const res = await api('POST', '/string/case', { text: this.caseInput, targetCase });
                this.caseResult = res.data;
            } catch(e) { this.caseResult = '转换失败: ' + e.message; }
        },
        async generateRandom() {
            try {
                const res = await api('POST', '/string/random', { length: this.randomLength, charSet: this.randomCharSet });
                this.randomResult = res.data;
            } catch(e) { this.randomResult = '生成失败: ' + e.message; }
        },
        refresh() {
            this.activeTab = 'diff';
            this.diffText1 = '';
            this.diffText2 = '';
            this.diffResult = [];
            this.escapeInput = '';
            this.escapeResult = '';
            this.caseInput = '';
            this.caseResult = '';
            this.randomLength = 16;
            this.randomCharSet = 'number_and_letter';
            this.generateRandom();
        }
    }
};