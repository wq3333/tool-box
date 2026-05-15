const { ref, computed, watch } = Vue;

export const RegexView = {
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

        <div v-if="activeTab === 'match'" class="flex-1 min-h-0 flex flex-col md:flex-row gap-4">
            <div class="bg-[var(--bg-surface)] rounded-xl shadow-sm border border-[var(--border-subtle)] p-5 flex flex-col gap-3 flex-1 min-h-0">
                <div class="flex-1 min-h-0 flex flex-col gap-3">
                    <label class="text-sm font-semibold text-[var(--text-primary)]">正则表达式</label>
                    <FInput v-model="currentPattern" placeholder="输入正则表达式..."></FInput>
                    <label class="text-sm font-semibold text-[var(--text-primary)]">测试文本</label>
                    <textarea v-model="currentInput" placeholder="输入要测试的文本..."
                        class="flex-1 min-h-0 px-4 py-3 bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-lg text-sm font-mono text-[var(--text-primary)] outline-none resize-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent placeholder:text-[var(--text-placeholder)]"></textarea>
                </div>
            </div>

            <div class="flex flex-col gap-3 self-center w-20 gap-2">
                <FButton type="primary" @click="run" block>匹配</FButton>
            </div>

            <div class="bg-[var(--bg-surface)] rounded-xl shadow-sm border border-[var(--border-subtle)] p-5 flex flex-col gap-3 flex-1 min-h-0">
                <div class="flex items-center justify-between">
                    <label class="text-sm font-semibold text-[var(--text-primary)]">匹配结果</label>
                    <CopyButton v-if="currentResult" :text="currentResult"></CopyButton>
                </div>
                <textarea v-model="currentResult" readonly placeholder="匹配结果..."
                    class="flex-1 min-h-0 px-4 py-3 bg-gradient-to-r from-[var(--bg-input)] to-[var(--accent-light)] border border-[var(--border-subtle)] rounded-lg text-sm font-mono text-[var(--text-primary)] outline-none resize-none"></textarea>
            </div>
        </div>

        <div v-if="activeTab === 'replace'" class="flex-1 min-h-0 flex flex-col md:flex-row gap-4">
            <div class="bg-[var(--bg-surface)] rounded-xl shadow-sm border border-[var(--border-subtle)] p-5 flex flex-col gap-3 flex-1 min-h-0">
                <div class="flex-1 min-h-0 flex flex-col gap-3">
                    <label class="text-sm font-semibold text-[var(--text-primary)]">正则表达式</label>
                    <FInput v-model="replacePattern" placeholder="输入正则表达式..."></FInput>
                    <label class="text-sm font-semibold text-[var(--text-primary)]">替换为</label>
                    <input v-model="replacement" type="text" placeholder="输入替换内容..."
                        class="px-4 py-3 bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-lg text-sm font-mono text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent placeholder:text-[var(--text-placeholder)]">
                    <label class="text-sm font-semibold text-[var(--text-primary)]">输入文本</label>
                    <textarea v-model="replaceInput" placeholder="输入要替换的文本..."
                        class="flex-1 min-h-0 px-4 py-3 bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-lg text-sm font-mono text-[var(--text-primary)] outline-none resize-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent placeholder:text-[var(--text-placeholder)]"></textarea>
                </div>
            </div>

            <div class="flex flex-col gap-3 self-center w-20 gap-2">
                <FButton type="primary" @click="runReplace" block>替换</FButton>
            </div>

            <div class="bg-[var(--bg-surface)] rounded-xl shadow-sm border border-[var(--border-subtle)] p-5 flex flex-col gap-3 flex-1 min-h-0">
                <div class="flex items-center justify-between">
                    <label class="text-sm font-semibold text-[var(--text-primary)]">替换结果</label>
                    <CopyButton v-if="replaceResult" :text="replaceResult"></CopyButton>
                </div>
                <textarea v-model="replaceResult" readonly placeholder="替换结果..."
                    class="flex-1 min-h-0 px-4 py-3 bg-gradient-to-r from-[var(--bg-input)] to-[var(--accent-light)] border border-[var(--border-subtle)] rounded-lg text-sm font-mono text-[var(--text-primary)] outline-none resize-none"></textarea>
            </div>
        </div>

        <div v-if="activeTab === 'split'" class="flex-1 min-h-0 flex flex-col md:flex-row gap-4">
            <div class="bg-[var(--bg-surface)] rounded-xl shadow-sm border border-[var(--border-subtle)] p-5 flex flex-col gap-3 flex-1 min-h-0">
                <div class="flex-1 min-h-0 flex flex-col gap-3">
                    <label class="text-sm font-semibold text-[var(--text-primary)]">正则表达式</label>
                    <FInput v-model="splitPattern" placeholder="输入正则表达式..."></FInput>
                    <label class="text-sm font-semibold text-[var(--text-primary)]">输入文本</label>
                    <textarea v-model="splitInput" placeholder="输入要分割的文本..."
                        class="flex-1 min-h-0 px-4 py-3 bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-lg text-sm font-mono text-[var(--text-primary)] outline-none resize-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent placeholder:text-[var(--text-placeholder)]"></textarea>
                </div>
            </div>

            <div class="flex flex-col gap-3 self-center w-20 gap-2">
                <FButton type="primary" @click="runSplit" block>分割</FButton>
            </div>

            <div class="bg-[var(--bg-surface)] rounded-xl shadow-sm border border-[var(--border-subtle)] p-5 flex flex-col gap-3 flex-1 min-h-0">
                <div class="flex items-center justify-between">
                    <label class="text-sm font-semibold text-[var(--text-primary)]">分割结果</label>
                    <CopyButton v-if="splitResult" :text="splitResult"></CopyButton>
                </div>
                <textarea v-model="splitResult" readonly placeholder="分割结果..."
                    class="flex-1 min-h-0 px-4 py-3 bg-gradient-to-r from-[var(--bg-input)] to-[var(--accent-light)] border border-[var(--border-subtle)] rounded-lg text-sm font-mono text-[var(--text-primary)] outline-none resize-none"></textarea>
            </div>
        </div>

        <template v-if="activeTab === 'templates'">
            <div class="flex-1 overflow-hidden flex flex-col gap-2 bg-[var(--bg-surface)] rounded-xl shadow-sm border border-[var(--border-subtle)] p-5">
                <label class="text-sm font-semibold text-[var(--text-primary)] mb-3 block">常用正则表达式</label>
                <div class="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 overflow-y-auto">
                    <div v-for="(item, index) in regexTemplates" :key="index"
                        class="p-4 bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-lg hover:border-[var(--accent)]/50 cursor-pointer transition-colors"
                        @click="selectTemplate(item)">
                        <div class="text-sm font-medium text-[var(--text-primary)] mb-1">{{ item.name }}</div>
                        <div class="text-xs font-mono text-[var(--text-secondary)] truncate">{{ item.pattern }}</div>
                    </div>
                </div>
            </div>
        </template>
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
        
        const patterns = ref({
            match: '',
            replace: '',
            split: ''
        });
        const inputs = ref({
            match: '',
            replace: '',
            split: ''
        });
        const results = ref({
            match: '',
            replace: '',
            split: ''
        });
        
        const replacement = ref('');

        const currentPattern = computed({
            get() { return patterns.value[activeTab.value] || ''; },
            set(v) { patterns.value[activeTab.value] = v; }
        });

        const currentInput = computed({
            get() { return inputs.value[activeTab.value] || ''; },
            set(v) { inputs.value[activeTab.value] = v; }
        });

        const currentResult = computed({
            get() { return results.value[activeTab.value] || ''; },
            set(v) { results.value[activeTab.value] = v; }
        });

        const replacePattern = computed({
            get() { return patterns.value.replace || ''; },
            set(v) { patterns.value.replace = v; }
        });

        const replaceInput = computed({
            get() { return inputs.value.replace || ''; },
            set(v) { inputs.value.replace = v; }
        });

        const splitPattern = computed({
            get() { return patterns.value.split || ''; },
            set(v) { patterns.value.split = v; }
        });

        const splitInput = computed({
            get() { return inputs.value.split || ''; },
            set(v) { inputs.value.split = v; }
        });

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
            if (!currentPattern.value) {
                currentResult.value = '';
                return;
            }
            try {
                const re = new RegExp(currentPattern.value, getFlags());
                const matches = currentInput.value.matchAll(re);
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
                currentResult.value = output || '没有找到匹配';
            } catch (e) {
                currentResult.value = '错误: ' + e.message;
            }
        };

        const runReplace = () => {
            if (!replacePattern.value) {
                results.value.replace = '';
                return;
            }
            try {
                const re = new RegExp(replacePattern.value, getFlags());
                results.value.replace = replaceInput.value.replace(re, replacement.value);
            } catch (e) {
                results.value.replace = '错误: ' + e.message;
            }
        };

        const runSplit = () => {
            if (!splitPattern.value) {
                results.value.split = '';
                return;
            }
            try {
                const re = new RegExp(splitPattern.value, 'g');
                const parts = splitInput.value.split(re);
                results.value.split = parts.map((s, i) => `${i}: ${s}`).join('\n');
            } catch (e) {
                results.value.split = '错误: ' + e.message;
            }
        };

        const selectTemplate = (item) => {
            patterns.value.match = item.pattern;
            activeTab.value = 'match';
        };

        const refresh = () => {
            activeTab.value = 'match';
            patterns.value = { match: '', replace: '', split: '' };
            inputs.value = { match: '', replace: '', split: '' };
            results.value = { match: '', replace: '', split: '' };
            replacement.value = '';
        };

        watch(currentPattern, () => {
            if (activeTab.value === 'match') {
                run();
            }
        });

        return {
            activeTab, tabs, currentPattern, replacement, currentInput, currentResult,
            replacePattern, replaceInput, replaceResult: computed({
                get() { return results.value.replace; },
                set(v) { results.value.replace = v; }
            }),
            splitPattern, splitInput, splitResult: computed({
                get() { return results.value.split; },
                set(v) { results.value.split = v; }
            }),
            regexTemplates,
            run, runReplace, runSplit, selectTemplate, refresh
        };
    }
};
