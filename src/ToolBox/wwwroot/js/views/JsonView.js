const { ref, computed } = Vue;

export const JsonView = {
    template: `
    <div class="h-full flex flex-col gap-4 p-4">
        <div class="flex-none">
            <div class="hidden lg:flex gap-1 border-b border-[var(--border-subtle)] pb-3">
                <button v-for="tab in tabs" :key="tab.key" @click="activeTab = tab.key"
                    :class="['px-4 py-2 text-sm rounded transition-colors',
                            activeTab === tab.key ? 'bg-[var(--accent)] text-[var(--text-inverse)]' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]']">
                    {{ tab.label }}
                </button>
            </div>
            <div class="lg:hidden">
                <label class="block text-xs font-medium text-[var(--text-secondary)] mb-1">选择操作</label>
                <FSingleSelect v-model="activeTab" :options="tabs.map(t => ({ value: t.key, label: t.label }))"></FSingleSelect>
            </div>
        </div>

        <div class="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div class="bg-[var(--bg-surface)] rounded-lg border border-[var(--border-subtle)] p-4 flex flex-col gap-3 flex-1 min-h-0">
                <div class="flex-1 min-h-0 flex flex-col gap-2">
                    <label class="block text-xs font-medium text-[var(--text-secondary)]">{{ inputLabel }}</label>
                    <textarea v-model="currentInput" :placeholder="inputPlaceholder"
                        class="flex-1 min-h-0 px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none resize-none placeholder:text-[var(--text-tertiary)] hover:border-[var(--border-strong)] focus:border-[var(--border-focus)]"></textarea>
                </div>

                <div v-if="activeTab === 'to-csharp'" class="flex items-center gap-2">
                    <label class="text-xs text-[var(--text-secondary)]">根类名:</label>
                    <input type="text" v-model="rootName" placeholder="Root"
                        class="w-32 px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded text-xs text-[var(--text-primary)] outline-none placeholder:text-[var(--text-tertiary)] hover:border-[var(--border-strong)] focus:border-[var(--border-focus)]">
                </div>

                <FButton type="primary" @click="execute">{{ executeLabel }}</FButton>
            </div>

            <div class="bg-[var(--bg-surface)] rounded-lg border border-[var(--border-subtle)] p-4 flex flex-col gap-3 flex-1 min-h-0">
                <div class="flex items-center justify-between">
                    <label class="block text-xs font-medium text-[var(--text-secondary)]">结果</label>
                    <CopyButton v-if="currentOutput" :text="currentOutput"></CopyButton>
                </div>
                <textarea v-model="currentOutput" readonly :placeholder="outputPlaceholder"
                    class="flex-1 min-h-0 px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none resize-none placeholder:text-[var(--text-tertiary)]"></textarea>
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
            inputLabel, inputPlaceholder, outputPlaceholder, executeLabel, execute, refresh
        };
    }
};
