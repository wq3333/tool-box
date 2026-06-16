const { ref, computed } = Vue;
import { JsonTreeView } from '../components/JsonTreeView.js';

export const JsonView = {
    components: { JsonTreeView },
    template: `
    <div class="h-full flex flex-col gap-4 p-4 bg-gradient-to-br from-[var(--bg-gradient-start)] to-[var(--bg-gradient-end)]">
        <div class="flex-none">
            <div class="bg-[var(--bg-surface)] rounded-xl shadow-sm border border-[var(--border-subtle)] p-1">
                <div class="flex flex-wrap gap-1">
                    <button v-for="tab in tabs" :key="tab.key" @click="activeTab = tab.key"
                        :class="['px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200',
                                activeTab === tab.key ? 'bg-gradient-to-r from-[var(--accent)] to-[var(--accent-hover)] text-[var(--text-inverse)] shadow-md' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]']">
                        {{ tab.label }}
                    </button>
                </div>
            </div>
        </div>

        <div class="flex-1 min-h-0 flex flex-col md:flex-row gap-4">
            <div class="bg-[var(--bg-surface)] rounded-xl shadow-sm border border-[var(--border-subtle)] p-5 flex flex-col gap-4 flex-1 min-h-0">
                <div class="flex-1 min-h-0 flex flex-col gap-3">
                    <label class="text-sm font-semibold text-[var(--text-primary)]">{{ inputLabel }}</label>
                    <textarea v-model="currentInput" :placeholder="inputPlaceholder"
                        class="flex-1 min-h-0 px-4 py-3 bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-lg text-sm font-mono text-[var(--text-primary)] outline-none resize-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent placeholder:text-[var(--text-placeholder)]"></textarea>
                </div>
            </div>

            <div class="flex flex-col gap-3 self-center w-20">
                <div v-if="activeTab === 'to-csharp'" class="flex flex-col items-center">
                    <span class="text-xs self-start text-[var(--text-secondary)] mb-1">根类名:</span>
                    <FInput v-model="rootName" placeholder="Root" class="w-24 text-center"></FInput>
                </div>
                <FButton type="primary" @click="execute" block>{{ executeLabel }}</FButton>
            </div>

            <div class="bg-[var(--bg-surface)] rounded-xl shadow-sm border border-[var(--border-subtle)] p-5 flex flex-col gap-4 flex-1 min-h-0">
                <div class="flex items-center justify-between">
                    <label class="text-sm font-semibold text-[var(--text-primary)]">结果</label>
                    <CopyButton v-if="currentOutput" :text="currentOutput"></CopyButton>
                </div>
                <JsonTreeView v-if="showTree" :node="parsedJson" class="json-tree-container" />
                <textarea v-else v-model="currentOutput" readonly :placeholder="outputPlaceholder"
                    class="flex-1 min-h-0 px-4 py-3 bg-gradient-to-r from-[var(--bg-input)] to-[var(--accent-light)] border border-[var(--border-subtle)] rounded-lg text-sm font-mono text-[var(--text-primary)] outline-none resize-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent placeholder:text-[var(--text-placeholder)]"></textarea>
            </div>
        </div>
    </div>
    `,
    setup() {
        const activeTab = ref('format');
        const rootName = ref('Root');
        const tabs = [
            { key: 'format', label: '格式化' },
            { key: 'compress', label: '压缩' },
            { key: 'to-csharp', label: 'JSON转C#' },
            { key: 'from-csharp', label: 'C#转JSON' },
            { key: 'escape', label: '转义' },
            { key: 'unescape', label: '去除转义' }
        ];
        const inputs = ref({});
        const outputs = ref({});

        const currentInput = computed({
            get() { return inputs.value[activeTab.value] || ''; },
            set(v) { inputs.value[activeTab.value] = v; }
        });
        const currentOutput = computed({
            get() { return outputs.value[activeTab.value] || ''; },
            set(v) { outputs.value[activeTab.value] = v; }
        });

        const parsedJson = computed(() => {
            try { return JSON.parse(currentOutput.value); }
            catch { return null; }
        });

        const showTree = computed(() => activeTab.value === 'format' && parsedJson.value !== null);

        const inputLabel = computed(() => {
            return { format: 'JSON输入', compress: 'JSON输入', 'to-csharp': 'JSON输入', 'from-csharp': 'C#类代码', escape: '文本输入', unescape: '转义文本输入' }[activeTab.value];
        });

        const inputPlaceholder = computed(() => {
            return { format: '粘贴JSON...', compress: '粘贴JSON...', 'to-csharp': '粘贴JSON...', 'from-csharp': '粘贴C#类代码...', escape: '输入需要转义的文本...', unescape: '输入需要去除转义的文本...' }[activeTab.value];
        });

        const outputPlaceholder = computed(() => {
            return '结果将在此显示...';
        });

        const executeLabel = computed(() => {
            return { format: '格式化', compress: '压缩', 'to-csharp': '转换', 'from-csharp': '转换', escape: '转义', unescape: '去除转义' }[activeTab.value];
        });

        const execute = async () => {
            if (!currentInput.value) return;
            currentOutput.value = '';
            try {
                let res;
                switch (activeTab.value) {
                    case 'format': res = await api('POST', '/json/format', { json: currentInput.value }); break;
                    case 'compress': res = await api('POST', '/json/compress', { json: currentInput.value }); break;
                    case 'to-csharp': res = await api('POST', '/json/to-csharp', { json: currentInput.value, rootName: rootName.value }); break;
                    case 'from-csharp': res = await api('POST', '/json/from-csharp', { code: currentInput.value }); break;
                    case 'escape': res = await api('POST', '/json/escape', { json: currentInput.value }); break;
                    case 'unescape': res = await api('POST', '/json/unescape', { json: currentInput.value }); break;
                }
                currentOutput.value = res.data;
            } catch(e) { currentOutput.value = '操作失败: ' + e.message; }
        };

        const refresh = () => {
            inputs.value = {};
            outputs.value = {};
            activeTab.value = 'format';
        };

        return {
            activeTab, rootName, tabs, inputs, outputs, currentInput, currentOutput,
            inputLabel, inputPlaceholder, outputPlaceholder, executeLabel, execute, refresh,
            parsedJson, showTree
        };
    }
};