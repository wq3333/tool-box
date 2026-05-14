const { ref, watch } = Vue;

export const RegexView = {
    template: `
    <div class="h-full flex flex-col gap-4 p-4">
        <div class="flex-1 min-h-0 bg-[var(--bg-surface)] rounded-lg border border-[var(--border-subtle)] p-4 flex flex-col gap-3">
            <div class="flex-none grid grid-cols-1 md:grid-cols-2 gap-3">
                <div class="flex flex-col gap-2">
                    <label class="block text-xs font-medium text-[var(--text-secondary)]">操作</label>
                    <FSingleSelect v-model="mode" :options="[{value:'match',label:'匹配'},{value:'replace',label:'替换'},{value:'split',label:'分割'}]"></FSingleSelect>
                </div>
                <div class="flex flex-col gap-2">
                    <label class="block text-xs font-medium text-[var(--text-secondary)]">标志</label>
                    <div class="flex gap-2">
                        <label class="flex items-center gap-1 cursor-pointer text-xs text-[var(--text-secondary)]"><input type="checkbox" v-model="flags.i" class="w-3 h-3"><span>i</span></label>
                        <label class="flex items-center gap-1 cursor-pointer text-xs text-[var(--text-secondary)]"><input type="checkbox" v-model="flags.m" class="w-3 h-3"><span>m</span></label>
                        <label class="flex items-center gap-1 cursor-pointer text-xs text-[var(--text-secondary)]"><input type="checkbox" v-model="flags.g" class="w-3 h-3"><span>g</span></label>
                        <label class="flex items-center gap-1 cursor-pointer text-xs text-[var(--text-secondary)]"><input type="checkbox" v-model="flags.s" class="w-3 h-3"><span>s</span></label>
                    </div>
                </div>
            </div>
            <div class="flex-none grid grid-cols-1 md:grid-cols-2 gap-3">
                <div class="flex flex-col gap-2">
                    <label class="block text-xs font-medium text-[var(--text-secondary)]">正则表达式</label>
                    <input type="text" v-model="pattern" placeholder="正则表达式..."
                        class="px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none placeholder:text-[var(--text-tertiary)] hover:border-[var(--border-strong)] focus:border-[var(--border-focus)]">
                </div>
                <div v-if="mode === 'replace'" class="flex flex-col gap-2">
                    <label class="block text-xs font-medium text-[var(--text-secondary)]">替换</label>
                    <input type="text" v-model="replacement" placeholder="替换内容..."
                        class="px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none placeholder:text-[var(--text-tertiary)] hover:border-[var(--border-strong)] focus:border-[var(--border-focus)]">
                </div>
            </div>
            <div class="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-3">
                <div class="flex flex-col gap-2 flex-1 min-h-0">
                    <div class="flex items-center justify-between">
                        <label class="block text-xs font-medium text-[var(--text-secondary)]">输入</label>
                        <div class="flex gap-1">
                            <button @click="fileInputEnc.click()" class="px-2 py-1 text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] rounded flex items-center gap-1">
                                <span>📁</span>文件
                            </button>
                            <input type="file" ref="fileInputEnc" @change="onFileEnc($event)" class="hidden">
                        </div>
                    </div>
                    <textarea v-model="input" placeholder="输入文本..." @input="run"
                        class="flex-1 min-h-0 px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none resize-none placeholder:text-[var(--text-tertiary)] hover:border-[var(--border-strong)] focus:border-[var(--border-focus)]"></textarea>
                </div>
                <div class="flex flex-col gap-2 flex-1 min-h-0">
                    <div class="flex items-center justify-between">
                        <label class="block text-xs font-medium text-[var(--text-secondary)]">输出</label>
                        <CopyButton v-if="result" :text="result"></CopyButton>
                    </div>
                    <textarea v-model="result" readonly placeholder="结果..."
                        class="flex-1 min-h-0 px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none resize-none"></textarea>
                </div>
            </div>
            <div class="flex gap-2 flex-none">
                <FButton type="primary" @click="run">执行</FButton>
            </div>
        </div>
    </div>
    `,
    setup() {
        const mode = ref('match');
        const flags = ref({ i: true, m: false, g: true, s: false });
        const pattern = ref('');
        const replacement = ref('');
        const input = ref('');
        const result = ref('');

        const run = () => {
            if (!pattern.value) { result.value = ''; return; }
            try {
                const f = (flags.value.i?'i':'')+(flags.value.m?'m':'')+(flags.value.g?'g':'')+(flags.value.s?'s':'');
                const re = new RegExp(pattern.value, f);
                if (mode.value === 'match') {
                    const m = input.value.matchAll(re);
                    let r = '';
                    let i=0;
                    for (const match of m) {
                        r += `Match ${i++}: ${match[0]}\n`;
                        if (match.length > 1) {
                            for (let j=1; j<match.length; j++) { r += `  Group ${j}: ${match[j]}\n`; }
                        }
                    }
                    result.value = r || '没有匹配';
                } else if (mode.value === 'replace') {
                    result.value = input.value.replace(re, replacement.value);
                } else {
                    result.value = input.value.split(re).map((s,i)=>`${i}: ${s}`).join('\\n');
                }
            } catch (e) {
                result.value = '错误: ' + e.message;
            }
        };

        const onFileEnc = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const text = await file.text();
            input.value = text;
        };

        const refresh = () => {
            mode.value = 'match';
            flags.value = { i: true, m: false, g: true, s: false };
            pattern.value = '';
            replacement.value = '';
            input.value = '';
            result.value = '';
        };

        watch([mode, pattern, replacement], () => { run(); });

        return { mode, flags, pattern, replacement, input, result, run, onFileEnc, refresh };
    }
};
