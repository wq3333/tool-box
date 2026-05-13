export const HashView = {
    template: `
    <div class="space-y-4">
        <div>
            <label class="block text-xs font-medium text-[var(--text-secondary)] mb-1">输入文本</label>
            <textarea v-model="text" placeholder="输入要计算哈希的文本..."
                class="min-h-[150px] w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none resize-y placeholder:text-[var(--text-tertiary)] hover:border-[var(--border-strong)] focus:border-[var(--border-focus)]"></textarea>
        </div>

        <div class="space-y-3">
            <div>
                <label class="block text-xs font-medium text-[var(--text-secondary)] mb-1">算法</label>
                <div class="flex flex-wrap gap-2">
                    <button v-for="algo in algorithms" :key="algo.value" @click="algorithm = algo.value"
                        :class="['px-3 py-1.5 rounded text-xs font-medium transition-colors',
                            algorithm === algo.value ? 'bg-[var(--accent)] text-[var(--text-inverse)]' : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] border border-[var(--border-subtle)]']">
                        {{ algo.label }}
                    </button>
                </div>
            </div>
            <div v-if="isHmac" class="flex-1">
                <label class="block text-xs font-medium text-[var(--text-secondary)] mb-1">密钥</label>
                <input type="text" v-model="key" placeholder="HMAC密钥"
                    class="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-tertiary)] hover:border-[var(--border-strong)] focus:border-[var(--border-focus)]">
            </div>
        </div>

        <FButton type="primary">计算</FButton>

        <div v-if="result" class="flex items-center gap-2 px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded">
            <code class="flex-1 text-xs font-mono text-[var(--text-primary)] break-all">{{ result }}</code>
            <CopyButton :text="result"></CopyButton>
        </div>
    </div>
    `,
    data() {
        return {
            text: '',
            algorithm: 'sha256',
            key: '',
            result: '',
            algorithms: [
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
            ]
        };
    },
    computed: {
        isHmac() { return this.algorithm.startsWith('hmac-'); }
    },
    methods: {
        async compute() {
            if (!this.text) return;
            try {
                if (this.isHmac) {
                    const res = await api('POST', '/hash/hmac', { text: this.text, key: this.key, algorithm: this.algorithm });
                    this.result = res.data;
                } else {
                    const res = await api('POST', '/hash/compute', { text: this.text, algorithm: this.algorithm });
                    this.result = res.data;
                }
            } catch(e) { this.result = '计算失败: ' + e.message; }
        },
        refresh() {
            this.text = '';
            this.key = '';
            this.result = '';
            this.algorithm = 'sha256';
        }
    }
};