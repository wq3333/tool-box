const { ref, computed } = Vue;

export const RsaView = {
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
            <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col gap-4 flex-1 min-h-0">
                <div class="flex-1 min-h-0 flex flex-col gap-3">
                    <label class="text-sm font-semibold text-slate-700">{{ inputLabel }}</label>
                    <textarea v-model="currentInput" :placeholder="inputPlaceholder"
                        class="flex-1 min-h-0 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-700 outline-none resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400"></textarea>
                </div>
                <div v-if="activeTab === 'verify'" class="flex-1 flex flex-col gap-2">
                    <label class="text-sm font-semibold text-slate-700">签名</label>
                    <textarea v-model="signature" placeholder="粘贴签名..."
                        class="flex-1 min-h-0 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-700 outline-none resize-none placeholder:text-slate-400"></textarea>
                </div>
                <div class="flex-1 flex flex-col gap-2">
                    <label class="text-sm font-semibold text-slate-700">密钥</label>
                    <textarea v-model="key" placeholder="粘贴密钥..."
                        class="flex-1 min-h-0 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-700 outline-none resize-none placeholder:text-slate-400"></textarea>
                </div>
            </div>

            <div class="flex flex-col gap-4 self-center w-40">
                <div v-if="activeTab === 'encrypt' || activeTab === 'decrypt'" class="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                    <label class="text-sm font-semibold text-slate-700 mb-2 block">填充方式</label>
                    <FSingleSelect v-model="rsaPadding" :options="paddingOptions"></FSingleSelect>
                </div>
                <template v-if="activeTab === 'sign' || activeTab === 'verify'">
                    <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                        <label class="text-sm font-semibold text-slate-700 mb-2 block">哈希算法</label>
                        <FSingleSelect v-model="hashAlgorithm" :options="hashOptions"></FSingleSelect>
                    </div>
                    <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                        <label class="text-sm font-semibold text-slate-700 mb-2 block">填充方式</label>
                        <FSingleSelect v-model="rsaPadding" :options="paddingOptions"></FSingleSelect>
                    </div>
                </template>

                <FButton type="primary" @click="executeEncryption" block>{{ executeLabel }}</FButton>
            </div>

            <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col gap-4 flex-1 min-h-0">
                <div class="flex items-center justify-between">
                    <label class="text-sm font-semibold text-slate-700">结果</label>
                    <CopyButton v-if="currentOutput" :text="currentOutput"></CopyButton>
                </div>
                <textarea v-model="currentOutput" readonly :placeholder="outputPlaceholder"
                    class="flex-1 min-h-0 px-4 py-3 bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-700 outline-none resize-none placeholder:text-slate-400"></textarea>
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