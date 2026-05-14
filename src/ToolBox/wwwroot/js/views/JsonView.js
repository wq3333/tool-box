import { FInput } from '../components/FInput.js';

const { ref, computed } = Vue;

export const JsonView = {
    components: { FInput },
    template: `
    <div class="h-full flex flex-col gap-4 p-4 bg-gradient-to-br from-slate-50 to-slate-100">
        <div class="flex-none">
            <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-1">
                <div class="flex flex-wrap gap-1">
                    <button v-for="tab in tabs" :key="tab.key" @click="activeTab = tab.key"
                        :class="['px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200',
                                activeTab === tab.key ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100']">
                        {{ tab.label }}
                    </button>
                </div>
            </div>
        </div>

        <div class="flex-1 min-h-0 flex flex-col md:flex-row gap-4">
            <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col gap-4 flex-1 min-h-0">
                <div class="flex-1 min-h-0 flex flex-col gap-3">
                    <label class="text-sm font-semibold text-slate-700">{{ inputLabel }}</label>
                    <textarea v-model="currentInput" :placeholder="inputPlaceholder"
                        class="flex-1 min-h-0 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-700 outline-none resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400"></textarea>
                </div>
            </div>

            <div class="flex flex-col gap-3 self-center w-14">
                <div class="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                </div>
                <div v-if="activeTab === 'to-csharp'" class="flex flex-col items-center">
                    <span class="text-xs text-slate-500 mb-1">根类名:</span>
                    <FInput v-model="rootName" placeholder="Root" class="w-24 text-center"></FInput>
                </div>
                <FButton type="primary" @click="execute" block>{{ executeLabel }}</FButton>
            </div>

            <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col gap-4 flex-1 min-h-0">
                <div class="flex items-center justify-between">
                    <label class="text-sm font-semibold text-slate-700">结果</label>
                    <CopyButton v-if="currentOutput" :text="currentOutput"></CopyButton>
                </div>
                <textarea v-model="currentOutput" readonly :placeholder="outputPlaceholder"
                    class="flex-1 min-h-0 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-700 outline-none resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400"></textarea>
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