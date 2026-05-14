const { ref, onMounted } = Vue;

export const StringView = {
    template: `
    <div class="h-full flex flex-col gap-4 p-4">
        <div class="flex-none">
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
        </div>

        <div v-if="activeTab === 'diff'" class="flex-1 min-h-0 flex flex-col gap-3">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-3 flex-1 min-h-0">
                <div class="bg-[var(--bg-surface)] rounded-lg border border-[var(--border-subtle)] p-4 flex flex-col gap-2 flex-1 min-h-0">
                    <label class="block text-xs font-medium text-[var(--text-secondary)]">文本1</label>
                    <textarea v-model="diffText1" placeholder="输入文本1..."
                        class="flex-1 min-h-0 px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none resize-none placeholder:text-[var(--text-tertiary)] hover:border-[var(--border-strong)] focus:border-[var(--border-focus)]"></textarea>
                </div>
                <div class="bg-[var(--bg-surface)] rounded-lg border border-[var(--border-subtle)] p-4 flex flex-col gap-2 flex-1 min-h-0">
                    <label class="block text-xs font-medium text-[var(--text-secondary)]">文本2</label>
                    <textarea v-model="diffText2" placeholder="输入文本2..."
                        class="flex-1 min-h-0 px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none resize-none placeholder:text-[var(--text-tertiary)] hover:border-[var(--border-strong)] focus:border-[var(--border-focus)]"></textarea>
                </div>
            </div>
            <FButton type="primary" @click="computeDiff">比较</FButton>
            <div v-if="diffResult.length" class="flex-1 min-h-0 overflow-y-auto space-y-1">
                <div v-for="(line, i) in diffResult" :key="i"
                    :class="['px-3 py-1 text-xs font-mono rounded',
                            line.type === 'add' ? 'bg-[var(--success)]/10 text-[var(--success)]' :
                            line.type === 'del' ? 'bg-[var(--danger)]/10 text-[var(--danger)]' : 'bg-[var(--bg-surface)] text-[var(--text-secondary)]']">
                    <span class="mr-2">{{ line.type === 'add' ? '+' : line.type === 'del' ? '-' : ' ' }}</span>{{ line.text }}
                </div>
            </div>
        </div>

        <div v-if="activeTab === 'escape'" class="flex-1 min-h-0 flex flex-col gap-3">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-3 flex-1 min-h-0">
                <div class="bg-[var(--bg-surface)] rounded-lg border border-[var(--border-subtle)] p-4 flex flex-col gap-2 flex-1 min-h-0">
                    <label class="block text-xs font-medium text-[var(--text-secondary)]">输入文本</label>
                    <textarea v-model="escapeInput" placeholder="输入文本..."
                        class="flex-1 min-h-0 px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none resize-none placeholder:text-[var(--text-tertiary)] hover:border-[var(--border-strong)] focus:border-[var(--border-focus)]"></textarea>
                </div>
                <div class="bg-[var(--bg-surface)] rounded-lg border border-[var(--border-subtle)] p-4 flex flex-col gap-2 flex-1 min-h-0" v-if="escapeResult">
                    <div class="flex items-center justify-between">
                        <label class="block text-xs font-medium text-[var(--text-secondary)]">结果</label>
                        <CopyButton :text="escapeResult"></CopyButton>
                    </div>
                    <textarea v-model="escapeResult" readonly
                        class="flex-1 min-h-0 px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none resize-none"></textarea>
                </div>
            </div>
            <div class="flex gap-2">
                <FButton type="primary" @click="doEscape">转义</FButton>
                <FButton type="default" @click="doUnescape">去除转义</FButton>
            </div>
        </div>

        <div v-if="activeTab === 'case'" class="flex-1 min-h-0 flex flex-col gap-3">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-3 flex-1 min-h-0">
                <div class="bg-[var(--bg-surface)] rounded-lg border border-[var(--border-subtle)] p-4 flex flex-col gap-2 flex-1 min-h-0">
                    <label class="block text-xs font-medium text-[var(--text-secondary)]">输入文本</label>
                    <textarea v-model="caseInput" placeholder="输入文本..."
                        class="flex-1 min-h-0 px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none resize-none placeholder:text-[var(--text-tertiary)] hover:border-[var(--border-strong)] focus:border-[var(--border-focus)]"></textarea>
                </div>
                <div class="bg-[var(--bg-surface)] rounded-lg border border-[var(--border-subtle)] p-4 flex flex-col gap-2 flex-1 min-h-0" v-if="caseResult">
                    <div class="flex items-center justify-between">
                        <label class="block text-xs font-medium text-[var(--text-secondary)]">结果</label>
                        <CopyButton :text="caseResult"></CopyButton>
                    </div>
                    <textarea v-model="caseResult" readonly
                        class="flex-1 min-h-0 px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none resize-none"></textarea>
                </div>
            </div>
            <div class="flex flex-wrap gap-2">
                <FButton v-for="ct in caseTypes" :key="ct.value" @click="convertCase(ct.value)" type="default">{{ ct.label }}</FButton>
            </div>
        </div>

        <div v-if="activeTab === 'random'" class="flex-1 min-h-0 flex flex-col gap-3">
            <div class="bg-[var(--bg-surface)] rounded-lg border border-[var(--border-subtle)] p-4 flex flex-col gap-3">
                <div class="flex flex-col lg:flex-row lg:items-center gap-3">
                    <div class="flex gap-2 items-center">
                        <label class="text-xs text-[var(--text-secondary)]">字符集</label>
                        <FSingleSelect v-model="randomCharSet"
                            :options="[{value:'number',label:'纯数字'},{value:'letter_lower',label:'小写字母'},{value:'letter_upper',label:'大写字母'},{value:'letter',label:'字母'},{value:'number_and_letter',label:'数字+字母'},{value:'mix',label:'混合(含特殊字符)'}]"></FSingleSelect>
                    </div>
                    <div class="flex gap-2 items-center">
                        <label class="text-xs text-[var(--text-secondary)]">长度</label>
                        <input type="number" v-model.number="randomLength" min="1" max="256"
                            class="w-20 px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded text-xs text-[var(--text-primary)] outline-none hover:border-[var(--border-strong)] focus:border-[var(--border-focus)]">
                    </div>
                    <FButton type="primary" @click="generateRandom">生成</FButton>
                </div>
                <div v-if="randomResult" class="flex items-center gap-2 px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded">
                    <code class="flex-1 text-xs font-mono text-[var(--text-primary)]">{{ randomResult }}</code>
                    <CopyButton :text="randomResult"></CopyButton>
                </div>
            </div>
        </div>
    </div>
    `,
    setup() {
        const activeTab = ref('diff');
        const tabs = [
            { key: 'diff', label: '差异比较' },
            { key: 'escape', label: '转义/去除转义' },
            { key: 'case', label: '大小写转换' },
            { key: 'random', label: '随机字符串' }
        ];
        const diffText1 = ref('');
        const diffText2 = ref('');
        const diffResult = ref([]);
        const escapeInput = ref('');
        const escapeResult = ref('');
        const caseInput = ref('');
        const caseResult = ref('');
        const caseTypes = [
            { label: 'UPPER', value: 'upper' },
            { label: 'lower', value: 'lower' },
            { label: 'camelCase', value: 'camelcase' },
            { label: 'PascalCase', value: 'pascalcase' },
            { label: 'snake_case', value: 'snake_case' },
            { label: 'kebab-case', value: 'kebab-case' }
        ];
        const randomLength = ref(16);
        const randomCharSet = ref('number_and_letter');
        const randomResult = ref('');

        const computeDiff = () => {
            const lines1 = diffText1.value.split('\n');
            const lines2 = diffText2.value.split('\n');
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
            diffResult.value = result;
        };

        const doEscape = async () => {
            try {
                const res = await api('POST', '/string/escape', { text: escapeInput.value });
                escapeResult.value = res.data;
            } catch(e) { escapeResult.value = '转义失败: ' + e.message; }
        };

        const doUnescape = async () => {
            try {
                const res = await api('POST', '/string/unescape', { text: escapeInput.value });
                escapeResult.value = res.data;
            } catch(e) { escapeResult.value = '去除转义失败: ' + e.message; }
        };

        const convertCase = async (targetCase) => {
            try {
                const res = await api('POST', '/string/case', { text: caseInput.value, targetCase });
                caseResult.value = res.data;
            } catch(e) { caseResult.value = '转换失败: ' + e.message; }
        };

        const generateRandom = async () => {
            try {
                const res = await api('POST', '/string/random', { length: randomLength.value, charSet: randomCharSet.value });
                randomResult.value = res.data;
            } catch(e) { randomResult.value = '生成失败: ' + e.message; }
        };

        const refresh = () => {
            activeTab.value = 'diff';
            diffText1.value = '';
            diffText2.value = '';
            diffResult.value = [];
            escapeInput.value = '';
            escapeResult.value = '';
            caseInput.value = '';
            caseResult.value = '';
            randomLength.value = 16;
            randomCharSet.value = 'number_and_letter';
            generateRandom();
        };

        onMounted(() => {
            generateRandom();
        });

        return {
            activeTab, tabs, diffText1, diffText2, diffResult,
            escapeInput, escapeResult, caseInput, caseResult, caseTypes,
            randomLength, randomCharSet, randomResult,
            computeDiff, doEscape, doUnescape, convertCase, generateRandom, refresh
        };
    }
};
