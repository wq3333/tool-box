const { ref, computed } = Vue;

export const EncodingView = {
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
                <label class="block text-xs font-medium text-[var(--text-secondary)] mb-1">选择编码类型</label>
                <FSingleSelect v-model="activeTab" :options="tabs.map(t => ({ value: t.key, label: t.label }))"></FSingleSelect>
            </div>
        </div>

        <div class="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div class="bg-[var(--bg-surface)] rounded-lg border border-[var(--border-subtle)] p-4 flex flex-col gap-3 flex-1 min-h-0">
                <div class="flex-1 min-h-0 flex flex-col gap-2">
                    <label class="block text-xs font-medium text-[var(--text-secondary)]">输入</label>
                    <textarea v-model="currentInput" :placeholder="inputPlaceholder"
                        class="flex-1 min-h-0 px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none resize-none placeholder:text-[var(--text-tertiary)] hover:border-[var(--border-strong)] focus:border-[var(--border-focus)]"></textarea>
                </div>
                <div class="flex gap-2">
                    <FButton type="primary" @click="encode">{{ encodeLabel }}</FButton>
                    <FButton type="default" @click="decode">{{ decodeLabel }}</FButton>
                </div>
            </div>

            <div class="bg-[var(--bg-surface)] rounded-lg border border-[var(--border-subtle)] p-4 flex flex-col gap-3 flex-1 min-h-0">
                <div class="flex items-center justify-between">
                    <label class="block text-xs font-medium text-[var(--text-secondary)]">输出</label>
                    <CopyButton v-if="currentOutput" :text="currentOutput"></CopyButton>
                </div>
                <textarea v-model="currentOutput" readonly :placeholder="outputPlaceholder"
                    class="flex-1 min-h-0 px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none resize-none placeholder:text-[var(--text-tertiary)]"></textarea>
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

        const encodeLabel = computed(() => {
            return { url: 'URL编码', base64: 'Base64编码', base64url: 'Base64Url编码', utf8: 'UTF-8编码', hex: 'Hex编码' }[activeTab.value];
        });

        const decodeLabel = computed(() => {
            return { url: 'URL解码', base64: 'Base64解码', base64url: 'Base64Url解码', utf8: 'UTF-8解码', hex: 'Hex解码' }[activeTab.value];
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
            inputPlaceholder, outputPlaceholder, encodeLabel, decodeLabel,
            encode, decode, utf8Encode, utf8Decode, hexEncode, hexDecode, refresh
        };
    }
};
