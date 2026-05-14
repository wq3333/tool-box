import { FInput } from '../components/FInput.js';

const { ref, onMounted } = Vue;

export const StringView = {
    components: { FInput },
    template: `
    <div class="h-full flex flex-col gap-4 p-4 bg-gradient-to-br from-slate-50 to-slate-100">
        <div class="flex-none">
            <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-1">
                <div class="flex flex-wrap gap-1">
                    <button v-for="tab in tabs" :key="tab.key" @click="activeTab = tab.key"
                        :class="['px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200', activeTab === tab.key ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100']">
                        {{ tab.label }}
                    </button>
                </div>
            </div>
        </div>

        <div v-if="activeTab === 'diff'" class="flex-1 min-h-0 flex flex-col gap-4">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
                <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col gap-3 flex-1 min-h-0">
                    <label class="text-sm font-semibold text-slate-700">文本1</label>
                    <textarea v-model="diffText1" placeholder="输入文本1..."
                        class="flex-1 min-h-0 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-700 outline-none resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400"></textarea>
                </div>
                <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col gap-3 flex-1 min-h-0">
                    <label class="text-sm font-semibold text-slate-700">文本2</label>
                    <textarea v-model="diffText2" placeholder="输入文本2..."
                        class="flex-1 min-h-0 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-700 outline-none resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400"></textarea>
                </div>
            </div>
            <FButton type="primary" @click="computeDiff" class="w-full py-3 text-base">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                比较
            </FButton>
            <div v-if="diffResult.length" class="flex-1 min-h-0 overflow-y-auto bg-white rounded-xl shadow-sm border border-slate-200 p-4 space-y-1">
                <div v-for="(line, i) in diffResult" :key="i"
                    :class="['px-3 py-2 rounded-lg text-sm font-mono',
                        line.type === 'add' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        line.type === 'del' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-slate-50 text-slate-600']">
                    <span class="mr-2 font-bold">{{ line.type === 'add' ? '+' : line.type === 'del' ? '-' : '~' }}</span>{{ line.text }}
                </div>
            </div>
        </div>

        <div v-if="activeTab === 'escape'" class="flex-1 min-h-0 flex flex-col gap-4">
            <div class="flex flex-col md:flex-row gap-4 flex-1 min-h-0">
                <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col gap-3 flex-1 min-h-0">
                    <label class="text-sm font-semibold text-slate-700">输入文本</label>
                    <textarea v-model="escapeInput" placeholder="输入文本..."
                        class="flex-1 min-h-0 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-700 outline-none resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400"></textarea>
                </div>
                <div class="flex flex-col self-center w-14">
                    <div class="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center shadow-lg mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </div>
                    <FButton type="primary" @click="doEscape" block>转义</FButton>
                    <FButton type="success" @click="doUnescape" block>去除转义</FButton>
                </div>
                <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col gap-3 flex-1 min-h-0">
                    <div class="flex items-center justify-between">
                        <label class="text-sm font-semibold text-slate-700">结果</label>
                        <CopyButton :text="escapeResult"></CopyButton>
                    </div>
                    <textarea v-model="escapeResult" readonly
                        class="flex-1 min-h-0 px-4 py-3 bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-700 outline-none resize-none"></textarea>
                </div>
            </div>
        </div>

        <div v-if="activeTab === 'case'" class="flex-1 min-h-0 flex flex-col gap-4">
            <div class="flex flex-col md:flex-row gap-4 flex-1 min-h-0">
                <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col gap-3 flex-1 min-h-0">
                    <label class="text-sm font-semibold text-slate-700">输入文本</label>
                    <textarea v-model="caseInput" placeholder="输入文本..."
                        class="flex-1 min-h-0 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-700 outline-none resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400"></textarea>
                </div>
                <div class="flex flex-col self-center w-14">
                    <div class="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center shadow-lg mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </div>
                    <FButton v-for="ct in caseTypes" :key="ct.value" @click="convertCase(ct.value)" type="primary" block>{{ ct.label }}</FButton>
                </div>
                <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col gap-3 flex-1 min-h-0">
                    <div class="flex items-center justify-between">
                        <label class="text-sm font-semibold text-slate-700">结果</label>
                        <CopyButton :text="caseResult"></CopyButton>
                    </div>
                    <textarea v-model="caseResult" readonly
                        class="flex-1 min-h-0 px-4 py-3 bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-700 outline-none resize-none"></textarea>
                </div>
            </div>
        </div>

        <div v-if="activeTab === 'random'" class="flex-1 min-h-0 flex flex-col gap-4">
            <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col gap-4">
                <div class="flex flex-col lg:flex-row lg:items-center gap-4">
                    <label class="text-sm font-semibold text-slate-700 whitespace-nowrap">字符集</label>
                    <FSingleSelect v-model="randomCharSet" :options="randomCharSetTypes"></FSingleSelect>
                    <label class="text-sm font-semibold text-slate-700 whitespace-nowrap">生成长度</label>
                    <FInput type="number" v-model.number="randomLength" class="w-24" min="1" max="256"></FInput>
                    <FButton type="primary" @click="generateRandom" class="flex-1 lg:flex-none">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        生成
                    </FButton>
                </div>
                <div v-if="randomResult" class="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <code class="flex-1 text-sm font-mono text-slate-700">{{ randomResult }}</code>
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
        const randomCharSetTypes = [
            { label: '数字', value: 'number' },
            { label: '小写字母', value: 'letter_lower' },
            { label: '大写字母', value: 'letter_upper' },
            { label: '字母', value: 'letter' },
            { label: '数字和字母', value: 'number_and_letter' },
            { label: '混合', value: 'mix' }
        ];
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
            randomLength, randomCharSet, randomCharSetTypes, randomResult,
            computeDiff, doEscape, doUnescape, convertCase, generateRandom, refresh
        };
    }
};