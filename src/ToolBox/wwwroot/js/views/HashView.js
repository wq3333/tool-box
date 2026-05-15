const { ref, computed } = Vue;

export const HashView = {
    template: `
    <div class="h-full flex flex-col gap-4 p-4 bg-gradient-to-br from-[var(--bg-gradient-start)] to-[var(--bg-gradient-end)]">
        <div class="bg-[var(--bg-surface)] rounded-xl shadow-sm border border-[var(--border-subtle)] p-5 flex flex-col gap-4 flex-1 min-h-0">
            <div class="flex-1 min-h-0 flex flex-col gap-3">
                <div class="flex items-center justify-between">
                    <label class="text-sm font-semibold text-[var(--text-primary)]">输入文本</label>
                    <span class="text-xs text-[var(--text-tertiary)]">{{ text.length }} 字符</span>
                </div>
                <textarea v-model="text" placeholder="输入要计算哈希的文本..."
                    class="flex-1 min-h-0 px-4 py-3 bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-lg text-sm font-mono text-[var(--text-primary)] outline-none resize-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent placeholder:text-[var(--text-placeholder)]"></textarea>
            </div>

            <div class="flex flex-col gap-3">
                <div>
                    <label class="block text-sm font-semibold text-[var(--text-primary)] mb-2">算法</label>
                    <div class="flex flex-wrap gap-2">
                        <button v-for="algo in algorithms" :key="algo.value" @click="algorithm = algo.value"
                            :class="['px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                                algorithm === algo.value ? 'bg-gradient-to-r from-[var(--accent)] to-[var(--accent-hover)] text-[var(--text-inverse)] shadow-md' : 'bg-[var(--bg-input)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]']">
                            {{ algo.label }}
                        </button>
                    </div>
                </div>
                <div v-if="isHmac" class="flex flex-col gap-2">
                    <label class="text-sm font-semibold text-[var(--text-primary)]">密钥</label>
                    <FInput v-model="key" placeholder="HMAC密钥" class="w-full"></FInput>
                </div>
            </div>

            <FButton type="primary" @click="compute" class="w-full text-base">
                <IconPlay :size="20" />
                计算
            </FButton>

            <div class="flex-1 flex flex-col gap-3">
                <div class="flex items-center justify-between">
                    <label class="text-sm font-semibold text-[var(--text-primary)]">结果</label>
                    <div class="flex items-center gap-2">
                        <span class="text-xs px-2 py-1 bg-[var(--accent-light)] text-[var(--accent)] rounded-full">{{ algorithm.toUpperCase() }}</span>
                        <CopyButton :text="result"></CopyButton>
                    </div>
                </div>
                <div class="flex-1 min-h-0 px-4 py-3 bg-gradient-to-r from-[var(--bg-input)] to-[var(--accent-light)] border border-[var(--border-subtle)] rounded-lg">
                    <code class="flex-1 text-sm font-mono text-[var(--text-primary)] break-all">{{ result }}</code>
                </div>
            </div>
        </div>
    </div>
    `,
    setup() {
        const text = ref('');
        const algorithm = ref('sha256');
        const key = ref('');
        const result = ref('');
        
        const algorithms = [
            { value: 'md5', label: 'MD5' },
            { value: 'sha1', label: 'SHA1' },
            { value: 'sha256', label: 'SHA256' },
            { value: 'sha384', label: 'SHA384' },
            { value: 'sha512', label: 'SHA512' },
            { value: 'hmac-md5', label: 'HMAC-MD5' },
            { value: 'hmac-sha1', label: 'HMAC-SHA1' },
            { value: 'hmac-sha256', label: 'HMAC-SHA256' },
            { value: 'hmac-sha384', label: 'HMAC-SHA384' },
            { value: 'hmac-sha512', label: 'HMAC-SHA512' }
        ];

        const isHmac = computed(() => algorithm.value.startsWith('hmac-'));

        const compute = async () => {
            if (!text.value) return;
            try {
                if (isHmac.value) {
                    const res = await api('POST', '/hash/hmac', { text: text.value, key: key.value, algorithm: algorithm.value });
                    result.value = res.data;
                } else {
                    const res = await api('POST', '/hash/compute', { text: text.value, algorithm: algorithm.value });
                    result.value = res.data;
                }
            } catch(e) { result.value = '计算失败: ' + e.message; }
        };

        const refresh = () => {
            text.value = '';
            key.value = '';
            result.value = '';
            algorithm.value = 'sha256';
        };

        return { text, algorithm, key, result, algorithms, isHmac, compute, refresh };
    }
};
