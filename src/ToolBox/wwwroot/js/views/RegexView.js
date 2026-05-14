import { FInput } from '../components/FInput.js';

const { ref, watch } = Vue;

export const RegexView = {
    components: { FInput },
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

        <div v-if="activeTab === 'match'" class="flex-1 min-h-0 flex flex-col md:flex-row gap-4">
            <div class="bg-[var(--bg-surface)] rounded-lg border border-[var(--border-subtle)] p-4 flex flex-col gap-3 flex-1 min-h-0">
                <div class="flex-1 min-h-0 flex flex-col gap-2">
                    <label class="block text-xs font-medium text-[var(--text-secondary)]">正则表达式</label>
                    <input v-model="pattern" type="text" placeholder="输入正则表达式..."
                        class="px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none placeholder:text-[var(--text-tertiary)] hover:border-[var(--border-strong)] focus:border-[var(--border-focus)]">
                    <label class="block text-xs font-medium text-[var(--text-secondary)]">测试文本</label>
                    <textarea v-model="input" placeholder="输入要测试的文本..." @input="run"
                        class="flex-1 min-h-0 px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none resize-none placeholder:text-[var(--text-tertiary)] hover:border-[var(--border-strong)] focus:border-[var(--border-focus)]"></textarea>
                </div>
            </div>

            <div class="flex flex-col gap-2 self-center w-40">
                <FButton type="primary" @click="run">匹配</FButton>
            </div>

            <div class="bg-[var(--bg-surface)] rounded-lg border border-[var(--border-subtle)] p-4 flex flex-col gap-3 flex-1 min-h-0">
                <div class="flex items-center justify-between">
                    <label class="block text-xs font-medium text-[var(--text-secondary)]">匹配结果</label>
                    <CopyButton v-if="result" :text="result"></CopyButton>
                </div>
                <textarea v-model="result" readonly placeholder="匹配结果..."
                    class="flex-1 min-h-0 px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none resize-none"></textarea>
            </div>
        </div>

        <div v-if="activeTab === 'replace'" class="flex-1 min-h-0 flex flex-col md:flex-row gap-4">
            <div class="bg-[var(--bg-surface)] rounded-lg border border-[var(--border-subtle)] p-4 flex flex-col gap-3 flex-1 min-h-0">
                <div class="flex-1 min-h-0 flex flex-col gap-2">
                    <label class="block text-xs font-medium text-[var(--text-secondary)]">正则表达式</label>
                    <input v-model="pattern" type="text" placeholder="输入正则表达式..."
                        class="px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none placeholder:text-[var(--text-tertiary)] hover:border-[var(--border-strong)] focus:border-[var(--border-focus)]">
                    <label class="block text-xs font-medium text-[var(--text-secondary)]">替换为</label>
                    <input v-model="replacement" type="text" placeholder="输入替换内容..."
                        class="px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none placeholder:text-[var(--text-tertiary)] hover:border-[var(--border-strong)] focus:border-[var(--border-focus)]">
                    <label class="block text-xs font-medium text-[var(--text-secondary)]">输入文本</label>
                    <textarea v-model="input" placeholder="输入要替换的文本..."
                        class="flex-1 min-h-0 px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none resize-none placeholder:text-[var(--text-tertiary)] hover:border-[var(--border-strong)] focus:border-[var(--border-focus)]"></textarea>
                </div>
            </div>

            <div class="flex flex-col gap-2 self-center w-40">
                <FButton type="primary" @click="runReplace">替换</FButton>
            </div>

            <div class="bg-[var(--bg-surface)] rounded-lg border border-[var(--border-subtle)] p-4 flex flex-col gap-3 flex-1 min-h-0">
                <div class="flex items-center justify-between">
                    <label class="block text-xs font-medium text-[var(--text-secondary)]">替换结果</label>
                    <CopyButton v-if="replaceResult" :text="replaceResult"></CopyButton>
                </div>
                <textarea v-model="replaceResult" readonly placeholder="替换结果..."
                    class="flex-1 min-h-0 px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none resize-none"></textarea>
            </div>
        </div>

        <div v-if="activeTab === 'split'" class="flex-1 min-h-0 flex flex-col md:flex-row gap-4">
            <div class="bg-[var(--bg-surface)] rounded-lg border border-[var(--border-subtle)] p-4 flex flex-col gap-3 flex-1 min-h-0">
                <div class="flex-1 min-h-0 flex flex-col gap-2">
                    <label class="block text-xs font-medium text-[var(--text-secondary)]">正则表达式</label>
                    <input v-model="pattern" type="text" placeholder="输入正则表达式..."
                        class="px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none placeholder:text-[var(--text-tertiary)] hover:border-[var(--border-strong)] focus:border-[var(--border-focus)]">
                    <label class="block text-xs font-medium text-[var(--text-secondary)]">输入文本</label>
                    <textarea v-model="input" placeholder="输入要分割的文本..."
                        class="flex-1 min-h-0 px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none resize-none placeholder:text-[var(--text-tertiary)] hover:border-[var(--border-strong)] focus:border-[var(--border-focus)]"></textarea>
                </div>
            </div>

            <div class="flex flex-col gap-2 self-center w-40">
                <FButton type="primary" @click="runSplit">分割</FButton>
            </div>

            <div class="bg-[var(--bg-surface)] rounded-lg border border-[var(--border-subtle)] p-4 flex flex-col gap-3 flex-1 min-h-0">
                <div class="flex items-center justify-between">
                    <label class="block text-xs font-medium text-[var(--text-secondary)]">分割结果</label>
                    <CopyButton v-if="splitResult" :text="splitResult"></CopyButton>
                </div>
                <textarea v-model="splitResult" readonly placeholder="分割结果..."
                    class="flex-1 min-h-0 px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none resize-none"></textarea>
            </div>
        </div>

        <div v-if="activeTab === 'templates'" class="flex-1 min-h-0">
            <div class="bg-[var(--bg-surface)] rounded-lg border border-[var(--border-subtle)] p-4">
                <label class="block text-xs font-medium text-[var(--text-secondary)] mb-3">常用正则表达式</label>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[400px] overflow-y-auto">
                    <div v-for="(item, index) in regexTemplates" :key="index"
                        class="p-3 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-lg hover:border-[var(--border-strong)] cursor-pointer transition-colors"
                        @click="selectTemplate(item)">
                        <div class="text-sm font-medium text-[var(--text-primary)] mb-1">{{ item.name }}</div>
                        <div class="text-xs font-mono text-[var(--text-secondary)] truncate">{{ item.pattern }}</div>
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
