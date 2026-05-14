const { ref, computed } = Vue;

export const EncodingView = {
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
            <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col gap-3 flex-1 min-h-0">
                <div class="flex-1 min-h-0 flex flex-col gap-3">
                    <label class="text-sm font-semibold text-slate-700">输入</label>
                    <textarea v-model="currentInput" :placeholder="inputPlaceholder"
                        class="flex-1 min-h-0 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-700 outline-none resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400"></textarea>
                </div>
            </div>

            <div class="flex flex-col gap-3 self-center w-20">
                <FButton type="primary" @click="encode" block>编码</FButton>
                <FButton type="success" @click="decode" block>解码</FButton>
            </div>

            <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col gap-3 flex-1 min-h-0">
                <div class="flex items-center justify-between">
                    <label class="text-sm font-semibold text-slate-700">输出</label>
                    <CopyButton v-if="currentOutput" :text="currentOutput"></CopyButton>
                </div>
                <textarea v-model="currentOutput" readonly :placeholder="outputPlaceholder"
                    class="flex-1 min-h-0 px-4 py-3 bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-700 outline-none resize-none placeholder:text-slate-400"></textarea>
            </div>
        </div>
    </div>
    `,
    setup() {
        const activeTab = ref('url');
        const tabs = [
            { key: 'url', label: 'URL' },
            { key: 'base64', label: 'Base64' },
            { key: 'base64url', label: 'Base64Url' },
            { key: 'utf8', label: 'UTF-8' },
            { key: 'hex', label: 'Hex' }
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

        const inputPlaceholder = computed(() => {
            return { url: '输入文本...', base64: '输入文本...', base64url: '输入文本...', utf8: '输入字节数组（空格分隔）...', hex: '输入字节数组（空格分隔）...' }[activeTab.value];
        });

        const outputPlaceholder = computed(() => {
            return '编码/解码结果...';
        });

        const encode = () => {
            if (!currentInput.value) return;
            try {
                switch (activeTab.value) {
                    case 'url': currentOutput.value = encodeURIComponent(currentInput.value); break;
                    case 'base64': currentOutput.value = btoa(unescape(encodeURIComponent(currentInput.value))); break;
                    case 'base64url': currentOutput.value = btoa(unescape(encodeURIComponent(currentInput.value))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); break;
                    case 'utf8': utf8Encode(); break;
                    case 'hex': hexEncode(); break;
                }
            } catch (e) { currentOutput.value = '编码失败: ' + e.message; }
        };

        const decode = () => {
            if (!currentInput.value) return;
            try {
                switch (activeTab.value) {
                    case 'url': currentOutput.value = decodeURIComponent(currentInput.value); break;
                    case 'base64': currentOutput.value = decodeURIComponent(escape(atob(currentInput.value))); break;
                    case 'base64url':
                        let s = currentInput.value.replace(/-/g, '+').replace(/_/g, '/');
                        while (s.length % 4) s += '=';
                        currentOutput.value = decodeURIComponent(escape(atob(s)));
                        break;
                    case 'utf8': utf8Decode(); break;
                    case 'hex': hexDecode(); break;
                }
            } catch (e) { currentOutput.value = '解码失败: ' + e.message; }
        };

        const utf8Encode = async () => {
            const arr = currentInput.value.split(/\s+/).filter(v => v).map(Number);
            if (arr.some(isNaN)) { currentOutput.value = '请输入有效的字节数组（空格分隔）'; return; }
            const res = await api('POST', '/encoding/utf8-encode', { data: arr });
            currentOutput.value = res.data;
        };

        const utf8Decode = async () => {
            const res = await api('POST', '/encoding/utf8-decode', { text: currentInput.value });
            currentOutput.value = res.data;
        };

        const hexEncode = async () => {
            const arr = currentInput.value.split(/\s+/).filter(v => v).map(Number);
            if (arr.some(isNaN)) { currentOutput.value = '请输入有效的字节数组（空格分隔）'; return; }
            const res = await api('POST', '/encoding/hex-encode', { data: arr });
            currentOutput.value = res.data;
        };

        const hexDecode = async () => {
            const res = await api('POST', '/encoding/hex-decode', { text: currentInput.value });
            currentOutput.value = res.data;
        };

        const refresh = () => {
            inputs.value = {};
            outputs.value = {};
            activeTab.value = 'url';
        };

        return {
            activeTab, tabs, inputs, outputs, currentInput, currentOutput,
            inputPlaceholder, outputPlaceholder, encode, decode, utf8Encode, utf8Decode, hexEncode, hexDecode, refresh
        };
    }
};