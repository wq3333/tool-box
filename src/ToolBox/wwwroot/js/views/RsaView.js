const { ref, computed } = Vue;

export const RsaView = {
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

        <div class="flex-1 min-h-0 flex flex-col md:flex-row gap-4">
            <div class="bg-[var(--bg-surface)] rounded-xl shadow-sm border border-[var(--border-subtle)] p-5 flex flex-col gap-4 flex-2 md:flex-1 min-h-0">
                <div class="flex-1 min-h-0 flex flex-col gap-3">
                    <label class="text-sm font-semibold text-[var(--text-primary)]">{{ inputLabel }}</label>
                    <textarea v-model="currentInput" :placeholder="inputPlaceholder"
                        class="flex-1 min-h-0 px-4 py-3 bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-lg text-sm font-mono text-[var(--text-primary)] outline-none resize-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent placeholder:text-[var(--text-placeholder)]"></textarea>
                </div>
                <div v-if="activeTab === 'verify'" class="flex-1 flex flex-col gap-2">
                    <label class="text-sm font-semibold text-[var(--text-primary)]">签名</label>
                    <textarea v-model="signature" placeholder="粘贴签名..."
                        class="flex-1 min-h-0 px-3 py-2 bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-lg text-xs font-mono text-[var(--text-primary)] outline-none resize-none placeholder:text-[var(--text-placeholder)]"></textarea>
                </div>
                <div class="flex-1 flex flex-col gap-2">
                    <label class="text-sm font-semibold text-[var(--text-primary)]">密钥</label>
                    <textarea v-model="key" placeholder="粘贴密钥..."
                        class="flex-1 min-h-0 px-3 py-2 bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-lg text-xs font-mono text-[var(--text-primary)] outline-none resize-none placeholder:text-[var(--text-placeholder)]"></textarea>
                </div>
            </div>

            <div class="flex flex-col gap-4 self-stretch md:self-center w-auto md:w-40">
                <div v-if="activeTab === 'encrypt' || activeTab === 'decrypt'" class="bg-[var(--bg-surface)] rounded-xl shadow-sm border border-[var(--border-subtle)] p-4">
                    <label class="text-sm font-semibold text-[var(--text-primary)] mb-2 block">填充方式</label>
                    <FSingleSelect v-model="rsaPadding" :options="paddingOptions"></FSingleSelect>
                </div>
                <div v-if="activeTab === 'sign' || activeTab === 'verify'" class="flex-1 flex flex-row md:flex-col gap-4">
                    <div class="flex-1 bg-[var(--bg-surface)] rounded-xl shadow-sm border border-[var(--border-subtle)] p-4">
                        <label class="text-sm font-semibold text-[var(--text-primary)] mb-2 block">哈希算法</label>
                        <FSingleSelect v-model="hashAlgorithm" :options="hashOptions"></FSingleSelect>
                    </div>
                    <div class="flex-1 bg-[var(--bg-surface)] rounded-xl shadow-sm border border-[var(--border-subtle)] p-4">
                        <label class="text-sm font-semibold text-[var(--text-primary)] mb-2 block">填充方式</label>
                        <FSingleSelect v-model="rsaPadding" :options="paddingOptions"></FSingleSelect>
                    </div>
                </div>

                <FButton class="flex-1" type="primary" @click="executeEncryption" block>{{ executeLabel }}</FButton>
            </div>

            <div class="bg-[var(--bg-surface)] rounded-xl shadow-sm border border-[var(--border-subtle)] p-5 flex flex-col gap-4 flex-1 min-h-0">
                <div class="flex items-center justify-between">
                    <label class="text-sm font-semibold text-[var(--text-primary)]">结果</label>
                    <CopyButton v-if="currentOutput" :text="currentOutput"></CopyButton>
                </div>
                <textarea v-model="currentOutput" readonly :placeholder="outputPlaceholder"
                    class="flex-1 min-h-0 px-4 py-3 bg-gradient-to-r from-[var(--bg-input)] to-[var(--accent-light)] border border-[var(--border-subtle)] rounded-lg text-sm font-mono text-[var(--text-primary)] outline-none resize-none placeholder:text-[var(--text-placeholder)]"></textarea>
            </div>
        </div>
    </div>
    `,
    setup() {
        const activeTab = ref('encrypt');
        const tabs = [
            { key: 'encrypt', label: '加密' },
            { key: 'decrypt', label: '解密' },
            { key: 'sign', label: '签名' },
            { key: 'verify', label: '验签' }
        ];
        const rsaEncoding = ref('base64');
        const rsaPadding = ref('Pkcs1');
        const hashAlgorithm = ref('SHA256');
        const key = ref('');
        const input = ref('');
        const output = ref('');
        const signature = ref('');

        const encodingOptions = [
            { value: 'base64', label: 'Base64' },
            { value: 'hex', label: 'Hex' }
        ];

        const paddingOptions = [
            { value: 'Pkcs1', label: 'PKCS#1' },
            { value: 'OaepSHA1', label: 'OAEP SHA-1' },
            { value: 'OaepSHA256', label: 'OAEP SHA-256' },
            { value: 'OaepSHA384', label: 'OAEP SHA-384' },
            { value: 'OaepSHA512', label: 'OAEP SHA-512' }
        ];

        const hashOptions = [
            { value: 'SHA1', label: 'SHA-1' },
            { value: 'SHA256', label: 'SHA-256' },
            { value: 'SHA384', label: 'SHA-384' },
            { value: 'SHA512', label: 'SHA-512' }
        ];

        const currentInput = computed({
            get() { return input.value; },
            set(v) { input.value = v; }
        });

        const currentOutput = computed({
            get() { return output.value; },
            set(v) { output.value = v; }
        });

        const inputLabel = computed(() => {
            return {
                encrypt: '明文',
                decrypt: '密文',
                sign: '待签名数据',
                verify: '原始数据'
            }[activeTab.value];
        });

        const inputPlaceholder = computed(() => {
            return {
                encrypt: '输入要加密的明文...',
                decrypt: '输入要解密的密文...',
                sign: '输入要签名的数据...',
                verify: '输入原始数据...'
            }[activeTab.value];
        });

        const outputPlaceholder = computed(() => {
            return {
                encrypt: '加密结果...',
                decrypt: '解密结果...',
                sign: '签名结果...',
                verify: '验签结果...'
            }[activeTab.value];
        });

        const executeLabel = computed(() => {
            return {
                encrypt: '加密',
                decrypt: '解密',
                sign: '签名',
                verify: '验签'
            }[activeTab.value];
        });

        const executeEncryption = async () => {
            if (!key.value.trim()) {
                output.value = '请输入密钥';
                return;
            }
            if (!input.value.trim()) {
                output.value = '请输入数据';
                return;
            }

            try {
                let res;
                switch (activeTab.value) {
                    case 'encrypt':
                        res = await api('POST', '/encryption/rsa/encrypt', {
                            plaintext: input.value,
                            publicKey: key.value,
                            padding: rsaPadding.value
                        });
                        output.value = res.data;
                        break;
                    case 'decrypt':
                        res = await api('POST', '/encryption/rsa/decrypt', {
                            cipherText: input.value,
                            privateKey: key.value,
                            padding: rsaPadding.value
                        });
                        output.value = res.data;
                        break;
                    case 'sign':
                        res = await api('POST', '/encryption/rsa/sign', {
                            data: input.value,
                            privateKey: key.value,
                            padding: rsaPadding.value,
                            hashAlgorithm: hashAlgorithm.value
                        });
                        output.value = res.data;
                        break;
                    case 'verify':
                        if (!signature.value.trim()) {
                            output.value = '请输入签名';
                            return;
                        }
                        res = await api('POST', '/encryption/rsa/verify-sign', {
                            data: input.value,
                            publicKey: key.value,
                            signature: signature.value,
                            padding: rsaPadding.value,
                            hashAlgorithm: hashAlgorithm.value
                        });
                        output.value = res.data ? '✓ 签名验证通过' : '✗ 签名验证失败';
                        break;
                }
            } catch (e) {
                output.value = '操作失败: ' + e.message;
            }
        };

        const refresh = () => {
            activeTab.value = 'encrypt';
            rsaEncoding.value = 'base64';
            rsaPadding.value = 'Pkcs1';
            hashAlgorithm.value = 'SHA256';
            key.value = '';
            input.value = '';
            output.value = '';
            signature.value = '';
        };

        return {
            activeTab, tabs, rsaEncoding, rsaPadding, hashAlgorithm, key, signature,
            currentInput, currentOutput, inputLabel, inputPlaceholder, outputPlaceholder, executeLabel,
            encodingOptions, paddingOptions, hashOptions,
            executeEncryption, refresh
        };
    }
};