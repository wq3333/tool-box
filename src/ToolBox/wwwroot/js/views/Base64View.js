const { ref, onMounted } = Vue;

export const Base64View = {
    template: `
    <div class="h-full flex flex-col gap-4 p-4">
        <div class="flex-1 min-h-0 bg-[var(--bg-surface)] rounded-lg border border-[var(--border-subtle)] p-4 flex flex-col gap-3">
            <div class="flex-none grid grid-cols-1 md:grid-cols-3 gap-3">
                <div class="flex flex-col gap-2">
                    <label class="block text-xs font-medium text-[var(--text-secondary)]">操作</label>
                    <FSingleSelect v-model="mode" :options="[{value:'encode',label:'编码'},{value:'decode',label:'解码'}]"></FSingleSelect>
                </div>
                <div class="flex flex-col gap-2">
                    <label class="block text-xs font-medium text-[var(--text-secondary)]">换行</label>
                    <FSingleSelect v-model="lineBreak" :options="[{value:'None',label:'不换行'},{value:'76',label:'76字符'},{value:'64',label:'64字符'}]"></FSingleSelect>
                </div>
                <div class="flex flex-col gap-2">
                    <label class="block text-xs font-medium text-[var(--text-secondary)]">编码</label>
                    <FSingleSelect v-model="charset" :options="charsetOptions"></FSingleSelect>
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
                    <textarea v-model="input" placeholder="输入文本..."
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
                <FButton type="default" @click="swap">交换</FButton>
            </div>
        </div>
    </div>
    `,
    setup() {
        const mode = ref('encode');
        const lineBreak = ref('None');
        const charset = ref('UTF-8');
        const charsetOptions = ref([]);
        const input = ref('');
        const result = ref('');

        const run = async () => {
            try {
                const res = await api('POST', '/base64/' + mode.value, { input: input.value, lineBreak: lineBreak.value, charset: charset.value });
                result.value = res.data;
            } catch(e) { alert('执行失败: ' + e.message); }
        };

        const swap = () => {
            mode.value = mode.value === 'encode' ? 'decode' : 'encode';
            [input.value, result.value] = [result.value, input.value];
        };

        const onFileEnc = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const text = await file.text();
            input.value = text;
        };

        const refresh = () => {
            mode.value = 'encode';
            lineBreak.value = 'None';
            charset.value = 'UTF-8';
            input.value = '';
            result.value = '';
        };

        onMounted(async () => {
            try {
                const res = await api('GET', '/encoding/charsets');
                charsetOptions.value = res.data.map(c => ({ value: c, label: c }));
            } catch(e) {
                charsetOptions.value = [{value:'UTF-8',label:'UTF-8'}];
            }
        });

        return { mode, lineBreak, charset, charsetOptions, input, result, run, swap, onFileEnc, refresh };
    }
};
