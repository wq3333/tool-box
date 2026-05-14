import { FInput } from '../components/FInput.js';

const { ref, computed } = Vue;

export const HashView = {
    components: { FInput },
    template: `
    <div class="h-full flex flex-col gap-4 p-4">
        <div class="flex-1 min-h-0 bg-[var(--bg-surface)] rounded-lg border border-[var(--border-subtle)] p-4 flex flex-col gap-3">
            <div class="flex-1 min-h-0 flex flex-col gap-2">
                <label class="block text-xs font-medium text-[var(--text-secondary)]">输入文本</label>
                <textarea v-model="text" placeholder="输入要计算哈希的文本..."
                    class="flex-1 min-h-0 px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none resize-none placeholder:text-[var(--text-tertiary)] hover:border-[var(--border-strong)] focus:border-[var(--border-focus)]"></textarea>
            </div>

            <div class="flex flex-col gap-2">
                <div>
                    <label class="block text-xs font-medium text-[var(--text-secondary)] mb-1">算法</label>
                    <div class="flex flex-wrap gap-2">
                        <button v-for="algo in algorithms" :key="algo.value" @click="algorithm = algo.value"
                            :class="['px-3 py-1.5 rounded text-xs font-medium transition-colors',
                                algorithm === algo.value ? 'bg-[var(--accent)] text-[var(--text-inverse)]' : 'bg-[var(--bg-base)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] border border-[var(--border-subtle)]']">
                            {{ algo.label }}
                        </button>
                    </div>
                </div>
                <div v-if="isHmac" class="flex flex-col gap-1">
                    <label class="block text-xs font-medium text-[var(--text-secondary)]">密钥</label>
                    <FInput v-model="key" placeholder="HMAC密钥"></FInput>
                </div>
            </div>

            <FButton type="primary" @click="compute">计算</FButton>

            <div v-if="result" class="flex items-center gap-2 px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded">
                <code class="flex-1 text-xs font-mono text-[var(--text-primary)] break-all">{{ result }}</code>
                <CopyButton :text="result"></CopyButton>
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