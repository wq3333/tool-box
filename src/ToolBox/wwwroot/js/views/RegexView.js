import { FInput } from '../components/FInput.js';

const { ref, watch } = Vue;

export const RegexView = {
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

        <div v-if="activeTab === 'match'" class="flex-1 min-h-0 flex flex-col md:flex-row gap-4">
            <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col gap-3 flex-1 min-h-0">
                <div class="flex-1 min-h-0 flex flex-col gap-3">
                    <label class="text-sm font-semibold text-slate-700">正则表达式</label>
                    <input v-model="pattern" type="text" placeholder="输入正则表达式..."
                        class="px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400">
                    <label class="text-sm font-semibold text-slate-700">测试文本</label>
                    <textarea v-model="input" placeholder="输入要测试的文本..." @input="run"
                        class="flex-1 min-h-0 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-700 outline-none resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400"></textarea>
                </div>
            </div>

            <div class="flex flex-col gap-3 self-center w-14">
                <div class="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                </div>
                <FButton type="primary" @click="run" block>匹配</FButton>
            </div>

            <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col gap-3 flex-1 min-h-0">
                <div class="flex items-center justify-between">
                    <label class="text-sm font-semibold text-slate-700">匹配结果</label>
                    <CopyButton v-if="result" :text="result"></CopyButton>
                </div>
                <textarea v-model="result" readonly placeholder="匹配结果..."
                    class="flex-1 min-h-0 px-4 py-3 bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-700 outline-none resize-none"></textarea>
            </div>
        </div>

        <div v-if="activeTab === 'replace'" class="flex-1 min-h-0 flex flex-col md:flex-row gap-4">
            <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col gap-3 flex-1 min-h-0">
                <div class="flex-1 min-h-0 flex flex-col gap-3">
                    <label class="text-sm font-semibold text-slate-700">正则表达式</label>
                    <input v-model="pattern" type="text" placeholder="输入正则表达式..."
                        class="px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400">
                    <label class="text-sm font-semibold text-slate-700">替换为</label>
                    <input v-model="replacement" type="text" placeholder="输入替换内容..."
                        class="px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400">
                    <label class="text-sm font-semibold text-slate-700">输入文本</label>
                    <textarea v-model="input" placeholder="输入要替换的文本..."
                        class="flex-1 min-h-0 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-700 outline-none resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400"></textarea>
                </div>
            </div>

            <div class="flex flex-col gap-3 self-center w-14">
                <div class="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                </div>
                <FButton type="primary" @click="runReplace" block>替换</FButton>
            </div>

            <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col gap-3 flex-1 min-h-0">
                <div class="flex items-center justify-between">
                    <label class="text-sm font-semibold text-slate-700">替换结果</label>
                    <CopyButton v-if="replaceResult" :text="replaceResult"></CopyButton>
                </div>
                <textarea v-model="replaceResult" readonly placeholder="替换结果..."
                    class="flex-1 min-h-0 px-4 py-3 bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-700 outline-none resize-none"></textarea>
            </div>
        </div>

        <div v-if="activeTab === 'split'" class="flex-1 min-h-0 flex flex-col md:flex-row gap-4">
            <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col gap-3 flex-1 min-h-0">
                <div class="flex-1 min-h-0 flex flex-col gap-3">
                    <label class="text-sm font-semibold text-slate-700">正则表达式</label>
                    <input v-model="pattern" type="text" placeholder="输入正则表达式..."
                        class="px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400">
                    <label class="text-sm font-semibold text-slate-700">输入文本</label>
                    <textarea v-model="input" placeholder="输入要分割的文本..."
                        class="flex-1 min-h-0 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-700 outline-none resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400"></textarea>
                </div>
            </div>

            <div class="flex flex-col gap-3 self-center w-14">
                <div class="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                </div>
                <FButton type="primary" @click="runSplit" block>分割</FButton>
            </div>

            <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col gap-3 flex-1 min-h-0">
                <div class="flex items-center justify-between">
                    <label class="text-sm font-semibold text-slate-700">分割结果</label>
                    <CopyButton v-if="splitResult" :text="splitResult"></CopyButton>
                </div>
                <textarea v-model="splitResult" readonly placeholder="分割结果..."
                    class="flex-1 min-h-0 px-4 py-3 bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-700 outline-none resize-none"></textarea>
            </div>
        </div>

        <div v-if="activeTab === 'templates'" class="flex-1 min-h-0">
            <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                <label class="text-sm font-semibold text-slate-700 mb-3 block">常用正则表达式</label>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto">
                    <div v-for="(item, index) in regexTemplates" :key="index"
                        class="p-4 bg-slate-50 border border-slate-200 rounded-lg hover:border-blue-300 cursor-pointer transition-colors"
                        @click="selectTemplate(item)">
                        <div class="text-sm font-medium text-slate-700 mb-1">{{ item.name }}</div>
                        <div class="text-xs font-mono text-slate-500 truncate">{{ item.pattern }}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,
    setup() {
        const activeTab = ref('match');
        const tabs = [
            { key: 'match', label: '匹配' },
            { key: 'replace', label: '替换' },
            { key: 'split', label: '分割' },
            { key: 'templates', label: '常用模板' }
        ];
        const pattern = ref('');
        const replacement = ref('');
        const input = ref('');
        const result = ref('');
        const replaceResult = ref('');
        const splitResult = ref('');

        const regexTemplates = [
            { name: '邮箱', pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}', description: '匹配电子邮箱地址' },
            { name: '手机号码', pattern: '1[3-9]\\d{9}', description: '匹配中国大陆手机号' },
            { name: 'URL', pattern: 'https?://[\\w\\-._~:/?#[\\]@!$&\'()*+,;=%]+', description: '匹配URL地址' },
            { name: 'IP地址', pattern: '\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}', description: '匹配IPv4地址' },
            { name: '身份证号', pattern: '\\d{17}[\\dXx]', description: '匹配18位身份证号' },
            { name: '日期(YYYY-MM-DD)', pattern: '\\d{4}-\\d{2}-\\d{2}', description: '匹配日期格式' },
            { name: '时间(HH:MM:SS)', pattern: '\\d{2}:\\d{2}:\\d{2}', description: '匹配时间格式' },
            { name: '整数', pattern: '-?\\d+', description: '匹配整数' },
            { name: '浮点数', pattern: '-?\\d+\\.\\d+', description: '匹配浮点数' },
            { name: '中文字符', pattern: '[\\u4e00-\\u9fa5]+', description: '匹配中文字符' },
            { name: 'HTML标签', pattern: '<[^>]+>', description: '匹配HTML标签' },
            { name: '十六进制颜色', pattern: '#[0-9a-fA-F]{6}', description: '匹配十六进制颜色值' },
            { name: '密码强度', pattern: '(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d]{8,}', description: '至少8位，包含大小写和数字' },
            { name: 'QQ号', pattern: '[1-9]\\d{4,10}', description: '匹配QQ号码' },
            { name: '车牌号', pattern: '[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领][A-Z][A-HJ-NP-Z0-9]{5}', description: '匹配中国车牌号' },
            { name: '邮政编码', pattern: '[1-9]\\d{5}', description: '匹配中国邮政编码' },
            { name: '微信号', pattern: '[a-zA-Z][a-zA-Z0-9_-]{5,19}', description: '匹配微信号' },
            { name: '支付宝账号', pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}|1[3-9]\\d{9}', description: '匹配支付宝账号' },
            { name: '银行卡号', pattern: '\\d{16,19}', description: '匹配银行卡号' },
            { name: 'MAC地址', pattern: '([0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}', description: '匹配MAC地址' }
        ];

        const getFlags = () => {
            return 'gi';
        };

        const run = () => {
            if (!pattern.value) {
                result.value = '';
                return;
            }
            try {
                const re = new RegExp(pattern.value, getFlags());
                const matches = input.value.matchAll(re);
                let output = '';
                let index = 0;
                for (const match of matches) {
                    output += `匹配 ${index++}: ${match[0]}\n`;
                    if (match.length > 1) {
                        for (let j = 1; j < match.length; j++) {
                            output += `  分组 ${j}: ${match[j] || '(空)'}\n`;
                        }
                    }
                }
                result.value = output || '没有找到匹配';
            } catch (e) {
                result.value = '错误: ' + e.message;
            }
        };

        const runReplace = () => {
            if (!pattern.value) {
                replaceResult.value = '';
                return;
            }
            try {
                const re = new RegExp(pattern.value, getFlags());
                replaceResult.value = input.value.replace(re, replacement.value);
            } catch (e) {
                replaceResult.value = '错误: ' + e.message;
            }
        };

        const runSplit = () => {
            if (!pattern.value) {
                splitResult.value = '';
                return;
            }
            try {
                const re = new RegExp(pattern.value, 'g');
                const parts = input.value.split(re);
                splitResult.value = parts.map((s, i) => `${i}: ${s}`).join('\n');
            } catch (e) {
                splitResult.value = '错误: ' + e.message;
            }
        };

        const selectTemplate = (item) => {
            pattern.value = item.pattern;
            activeTab.value = 'match';
        };

        const refresh = () => {
            activeTab.value = 'match';
            pattern.value = '';
            replacement.value = '';
            input.value = '';
            result.value = '';
            replaceResult.value = '';
            splitResult.value = '';
        };

        watch(pattern, () => {
            if (activeTab.value === 'match') {
                run();
            }
        });

        return {
            activeTab, tabs, pattern, replacement, input, result, replaceResult, splitResult, regexTemplates,
            run, runReplace, runSplit, selectTemplate, refresh
        };
    }
};