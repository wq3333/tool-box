export const RsaView = {
    template: `
    <div class="space-y-3">
        <div class="hidden lg:flex gap-1 border-b border-[var(--border-subtle)] pb-2">
            <button v-for="t in rsaTabs" :key="t.key" @click="rsaTab = t.key"
                :class="['px-3 py-1.5 text-xs rounded transition-colors',
                         rsaTab === t.key ? 'bg-[var(--accent)]/10 text-[var(--accent)]' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]']">
                {{ t.label }}
            </button>
        </div>
        <div class="lg:hidden">
            <label class="block text-xs font-medium text-[var(--text-secondary)] mb-1">选择操作</label>
            <FSingleSelect v-model="rsaTab" :options="rsaTabs.map(t => ({ value: t.key, label: t.label }))" />
        </div>

        <div v-if="rsaTab === 'encrypt'" class="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div class="space-y-2">
                <label class="block text-xs font-medium text-[var(--text-secondary)]">公钥</label>
                <textarea v-model="rsaEncPublic" placeholder="粘贴PEM公钥..."
                    class="min-h-32 w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none resize-y hover:border-[var(--border-strong)] focus:border-[var(--border-focus)]"
                ></textarea>
                <label class="block text-xs font-medium text-[var(--text-secondary)]">明文</label>
                <textarea v-model="rsaEncPlaintext" placeholder="输入明文..."
                    class="min-h-24 w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none resize-y hover:border-[var(--border-strong)] focus:border-[var(--border-focus)]"
                ></textarea>
                <div class="space-y-2">
                    <label class="block text-xs font-medium text-[var(--text-secondary)]">填充模式</label>
                    <FSingleSelect v-model="rsaEncPadding" :options="[{value:'OAEP-SHA256',label:'OAEP-SHA256'},{value:'OAEP-SHA384',label:'OAEP-SHA384'},{value:'OAEP-SHA512',label:'OAEP-SHA512'},{value:'OAEP-SHA1',label:'OAEP-SHA1'},{value:'PKCS1',label:'PKCS1'}]" />
                </div>
                <FButton type="primary" size="sm" @click="rsaEncrypt">加密</FButton>
            </div>
            <div class="space-y-2">
                <div class="flex items-center justify-between">
                    <label class="block text-xs font-medium text-[var(--text-secondary)]">密文(Base64)</label>
                    <CopyButton v-if="rsaEncResult" :text="rsaEncResult" />
                </div>
                <textarea v-model="rsaEncResult" readonly placeholder="加密结果..."
                    class="min-h-40 w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none resize-y"
                ></textarea>
            </div>
        </div>

        <div v-if="rsaTab === 'decrypt'" class="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div class="space-y-2">
                <label class="block text-xs font-medium text-[var(--text-secondary)]">私钥</label>
                <textarea v-model="rsaDecPrivate" placeholder="粘贴PEM私钥..."
                    class="min-h-32 w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none resize-y hover:border-[var(--border-strong)] focus:border-[var(--border-focus)]"
                ></textarea>
                <label class="block text-xs font-medium text-[var(--text-secondary)]">密文(Base64)</label>
                <textarea v-model="rsaDecCiphertext" placeholder="粘贴Base64密文..."
                    class="min-h-24 w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none resize-y hover:border-[var(--border-strong)] focus:border-[var(--border-focus)]"
                ></textarea>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div class="space-y-2">
                        <label class="block text-xs font-medium text-[var(--text-secondary)]">填充模式</label>
                        <FSingleSelect v-model="rsaDecPadding" :options="[{value:'OAEP-SHA256',label:'OAEP-SHA256'},{value:'OAEP-SHA384',label:'OAEP-SHA384'},{value:'OAEP-SHA512',label:'OAEP-SHA512'},{value:'OAEP-SHA1',label:'OAEP-SHA1'},{value:'PKCS1',label:'PKCS1'}]" />
                    </div>
                    <div class="space-y-2">
                        <label class="block text-xs font-medium text-[var(--text-secondary)]">密码(当私钥有密码保护时传入)</label>
                        <input type="text" v-model="rsaDecPassword" placeholder="密钥密码"
                            class="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none placeholder:text-[var(--text-tertiary)] hover:border-[var(--border-strong)] focus:border-[var(--border-focus)]"
                        >
                    </div>
                </div>
                <FButton type="primary" size="sm" @click="rsaDecrypt">解密</FButton>
            </div>
            <div class="space-y-2">
                <div class="flex items-center justify-between">
                    <label class="block text-xs font-medium text-[var(--text-secondary)]">明文</label>
                    <CopyButton v-if="rsaDecResult" :text="rsaDecResult" />
                </div>
                <textarea v-model="rsaDecResult" readonly placeholder="解密结果..."
                    class="min-h-40 w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none resize-y"
                ></textarea>
            </div>
        </div>

        <div v-if="rsaTab === 'sign'" class="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div class="space-y-2">
                <label class="block text-xs font-medium text-[var(--text-secondary)]">私钥</label>
                <textarea v-model="rsaSignPrivate" placeholder="粘贴PEM私钥..."
                    class="min-h-32 w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none resize-y hover:border-[var(--border-strong)] focus:border-[var(--border-focus)]"
                ></textarea>
                <label class="block text-xs font-medium text-[var(--text-secondary)]">待签名数据</label>
                <textarea v-model="rsaSignData" placeholder="输入待签名数据..."
                    class="min-h-24 w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none resize-y hover:border-[var(--border-strong)] focus:border-[var(--border-focus)]"
                ></textarea>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div class="space-y-2">
                        <label class="block text-xs font-medium text-[var(--text-secondary)]">哈希算法</label>
                        <FSingleSelect v-model="rsaSignHashAlgorithm" :options="[{value:'SHA256',label:'SHA256'},{value:'SHA384',label:'SHA384'},{value:'SHA512',label:'SHA512'},{value:'SHA1',label:'SHA1'}]" />
                    </div>
                    <div class="space-y-2">
                        <label class="block text-xs font-medium text-[var(--text-secondary)]">填充模式</label>
                        <FSingleSelect v-model="rsaSignPadding" :options="[{value:'PKCS1',label:'PKCS1'},{value:'PSS',label:'PSS'}]" />
                    </div>
                </div>
                <FButton type="primary" size="sm" @click="rsaSign">签名</FButton>
            </div>
            <div class="space-y-2">
                <div class="flex items-center justify-between">
                    <label class="block text-xs font-medium text-[var(--text-secondary)]">签名(Base64)</label>
                    <CopyButton v-if="rsaSignResult" :text="rsaSignResult" />
                </div>
                <textarea v-model="rsaSignResult" readonly placeholder="签名结果..."
                    class="min-h-40 w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none resize-y"
                ></textarea>
            </div>
        </div>

        <div v-if="rsaTab === 'verify'" class="space-y-3">
            <div class="space-y-2">
                <label class="block text-xs font-medium text-[var(--text-secondary)]">公钥</label>
                <textarea v-model="rsaVerifySignPublic" placeholder="粘贴PEM公钥..."
                    class="min-h-32 w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none resize-y hover:border-[var(--border-strong)] focus:border-[var(--border-focus)]"
                ></textarea>
                <label class="block text-xs font-medium text-[var(--text-secondary)]">原始数据</label>
                <textarea v-model="rsaVerifySignData" placeholder="输入原始数据..."
                    class="min-h-24 w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none resize-y hover:border-[var(--border-strong)] focus:border-[var(--border-focus)]"
                ></textarea>
                <label class="block text-xs font-medium text-[var(--text-secondary)]">签名(Base64)</label>
                <textarea v-model="rsaVerifySignSignature" placeholder="粘贴Base64签名..."
                    class="min-h-24 w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none resize-y hover:border-[var(--border-strong)] focus:border-[var(--border-focus)]"
                ></textarea>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div class="space-y-2">
                        <label class="block text-xs font-medium text-[var(--text-secondary)]">哈希算法</label>
                        <FSingleSelect v-model="rsaVerifySignHashAlgorithm" :options="[{value:'SHA256',label:'SHA256'},{value:'SHA384',label:'SHA384'},{value:'SHA512',label:'SHA512'},{value:'SHA1',label:'SHA1'}]" />
                    </div>
                    <div class="space-y-2">
                        <label class="block text-xs font-medium text-[var(--text-secondary)]">填充模式</label>
                        <FSingleSelect v-model="rsaVerifySignPadding" :options="[{value:'PKCS1',label:'PKCS1'},{value:'PSS',label:'PSS'}]" />
                    </div>
                </div>
                <FButton type="primary" size="sm" @click="rsaVerifySign">验签</FButton>
            </div>
            <div class="px-4 py-3 border rounded flex items-center justify-center"
                :class="rsaVerifySignResult === null ? 'bg-[var(--bg-surface)] border-[var(--border-subtle)]' : (rsaVerifySignResult ? 'bg-[var(--success)]/10 border-[var(--success)]/30' : 'bg-[var(--danger)]/10 border-[var(--danger)]/30')">
                <span v-if="rsaVerifySignResult === null" class="text-xs text-[var(--text-tertiary)]">点击验签按钮查看结果</span>
                <span v-else :class="rsaVerifySignResult ? 'text-[var(--success)]' : 'text-[var(--danger)]'" class="text-sm font-medium">
                    {{ rsaVerifySignResult ? '✓ 签名有效' : '✗ 签名无效' }}
                </span>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            rsaTab: 'encrypt',
            rsaTabs: [
                { key: 'encrypt', label: '加密' },
                { key: 'decrypt', label: '解密' },
                { key: 'sign', label: '签名' },
                { key: 'verify', label: '验签' }
            ],
            rsaEncPublic: '', rsaEncPlaintext: '', rsaEncPadding: 'OAEP-SHA256', rsaEncResult: '',
            rsaDecPrivate: '', rsaDecCiphertext: '', rsaDecPadding: 'OAEP-SHA256', rsaDecPassword: '', rsaDecResult: '',
            rsaSignPrivate: '', rsaSignData: '', rsaSignHashAlgorithm: 'SHA256', rsaSignPadding: 'PKCS1', rsaSignPassword: '', rsaSignResult: '',
            rsaVerifySignPublic: '', rsaVerifySignData: '', rsaVerifySignSignature: '', rsaVerifySignHashAlgorithm: 'SHA256', rsaVerifySignPadding: 'PKCS1', rsaVerifySignResult: null
        };
    },
    methods: {
        async rsaEncrypt() {
            try {
                const res = await api('POST', '/encryption/rsa/encrypt', { publicKey: this.rsaEncPublic, plaintext: this.rsaEncPlaintext, padding: this.rsaEncPadding });
                this.rsaEncResult = res.data;
            } catch(e) { alert('加密失败: ' + e.message); }
        },
        async rsaDecrypt() {
            try {
                const res = await api('POST', '/encryption/rsa/decrypt', { privateKey: this.rsaDecPrivate, ciphertext: this.rsaDecCiphertext, padding: this.rsaDecPadding, password: this.rsaDecPassword || null });
                this.rsaDecResult = res.data;
            } catch(e) { alert('解密失败: ' + e.message); }
        },
        async rsaSign() {
            try {
                const res = await api('POST', '/encryption/rsa/sign', { privateKey: this.rsaSignPrivate, data: this.rsaSignData, hashAlgorithm: this.rsaSignHashAlgorithm, padding: this.rsaSignPadding, password: this.rsaSignPassword || null });
                this.rsaSignResult = res.data;
            } catch(e) { alert('签名失败: ' + e.message); }
        },
        async rsaVerifySign() {
            try {
                const res = await api('POST', '/encryption/rsa/verify-sign', { publicKey: this.rsaVerifySignPublic, data: this.rsaVerifySignData, signature: this.rsaVerifySignSignature, hashAlgorithm: this.rsaVerifySignHashAlgorithm, padding: this.rsaVerifySignPadding });
                this.rsaVerifySignResult = res.data;
            } catch(e) { this.rsaVerifySignResult = false; }
        },
        refresh() {
            this.rsaTab = 'encrypt';
            this.rsaEncPublic = ''; this.rsaEncPlaintext = ''; this.rsaEncPadding = 'OAEP-SHA256'; this.rsaEncResult = '';
            this.rsaDecPrivate = ''; this.rsaDecCiphertext = ''; this.rsaDecPadding = 'OAEP-SHA256'; this.rsaDecPassword = ''; this.rsaDecResult = '';
            this.rsaSignPrivate = ''; this.rsaSignData = ''; this.rsaSignHashAlgorithm = 'SHA256'; this.rsaSignPadding = 'PKCS1'; this.rsaSignPassword = ''; this.rsaSignResult = '';
            this.rsaVerifySignPublic = ''; this.rsaVerifySignData = ''; this.rsaVerifySignSignature = ''; this.rsaVerifySignHashAlgorithm = 'SHA256'; this.rsaVerifySignPadding = 'PKCS1'; this.rsaVerifySignResult = null;
        }
    }
};
