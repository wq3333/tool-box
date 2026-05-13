export const JwtView = {
    template: `
    <div class="space-y-4">
        <!-- Desktop tabs -->
        <div class="hidden lg:flex gap-1 border-b border-[var(--border-subtle)] pb-3">
            <button @click="activeTab = 'generate'"
                :class="['px-4 py-2 text-sm rounded transition-colors', activeTab === 'generate' ? 'bg-[var(--accent)] text-[var(--text-inverse)]' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]']">
                生成Token
            </button>
            <button @click="activeTab = 'parse'"
                :class="['px-4 py-2 text-sm rounded transition-colors', activeTab === 'parse' ? 'bg-[var(--accent)] text-[var(--text-inverse)]' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]']">
                解析Token
            </button>
        </div>
        <!-- Mobile dropdown -->
        <div class="lg:hidden">
            <label class="block text-xs font-medium text-[var(--text-secondary)] mb-1">选择操作</label>
            <FSingleSelect v-model="activeTab" :options="[{value:'generate',label:'生成Token'},{value:'parse',label:'解析Token'}]"></FSingleSelect>
        </div>

        <!-- Generate -->
        <div v-if="activeTab === 'generate'" class="space-y-3">
            <div class="space-y-2">
                <label class="block text-xs font-medium text-[var(--text-secondary)]">算法</label>
                <FSingleSelect v-model="genAlgorithm" :options="[{value:'HS256',label:'HS256 (HMAC)'},{value:'RS256',label:'RS256 (RSA)'}]"></FSingleSelect>
            </div>

            <div class="space-y-2">
                <label class="block text-xs font-medium text-[var(--text-secondary)]">Payload (JSON)</label>
                <textarea v-model="genPayload" rows="6" placeholder='{"sub":"1234567890","name":"John"}'
                    class="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none resize-y placeholder:text-[var(--text-tertiary)] hover:border-[var(--border-strong)] focus:border-[var(--border-focus)]"></textarea>
            </div>

            <div v-if="genAlgorithm === 'HS256'" class="space-y-2">
                <label class="block text-xs font-medium text-[var(--text-secondary)]">密钥</label>
                <input type="text" v-model="genSecret" placeholder="输入HMAC密钥"
                    class="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none placeholder:text-[var(--text-tertiary)] hover:border-[var(--border-strong)] focus:border-[var(--border-focus)]">
            </div>

            <div v-if="genAlgorithm === 'RS256'" class="space-y-3">
                <div class="space-y-2">
                    <label class="block text-xs font-medium text-[var(--text-secondary)]">RSA私钥(PEM)</label>
                    <textarea v-model="genRsaKey" rows="5" placeholder="粘贴PEM私钥..."
                        class="w-full min-h-40 px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none resize-y placeholder:text-[var(--text-tertiary)] hover:border-[var(--border-strong)] focus:border-[var(--border-focus)]"></textarea>
                </div>
                <div class="space-y-2">
                    <label class="block text-xs font-medium text-[var(--text-secondary)]">密钥密码（可选）</label>
                    <input type="password" v-model="genRsaPassword" placeholder="私钥密码"
                        class="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none placeholder:text-[var(--text-tertiary)] hover:border-[var(--border-strong)] focus:border-[var(--border-focus)]">
                </div>
            </div>

            <FButton type="primary" @click="generate">生成</FButton>

            <div v-if="genResult" class="space-y-2">
                <div class="flex items-center justify-between">
                    <label class="block text-xs font-medium text-[var(--text-secondary)]">Token</label>
                    <CopyButton :text="genResult"></CopyButton>
                </div>
                <textarea v-model="genResult" rows="4" readonly
                    class="w-full min-h-40 px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none resize-y"></textarea>
            </div>
        </div>

        <!-- Parse -->
        <div v-if="activeTab === 'parse'" class="space-y-3">
            <div class="space-y-2">
                <label class="block text-xs font-medium text-[var(--text-secondary)]">JWT Token</label>
                <textarea v-model="parseToken" rows="4" placeholder="粘贴JWT token..."
                    class="w-full min-h-40 px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none resize-y placeholder:text-[var(--text-tertiary)] hover:border-[var(--border-strong)] focus:border-[var(--border-focus)]"></textarea>
            </div>

            <div class="space-y-2">
                <label class="block text-xs font-medium text-[var(--text-secondary)]">算法</label>
                <FSingleSelect v-model="parseAlgorithm" :options="[{value:'HS256',label:'HS256'},{value:'RS256',label:'RS256'}]"></FSingleSelect>
            </div>

            <div v-if="parseAlgorithm === 'HS256'" class="space-y-2">
                <label class="block text-xs font-medium text-[var(--text-secondary)]">密钥</label>
                <input type="text" v-model="parseSecret" placeholder="输入HMAC密钥"
                    class="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none placeholder:text-[var(--text-tertiary)] hover:border-[var(--border-strong)] focus:border-[var(--border-focus)]">
            </div>

            <div v-if="parseAlgorithm === 'RS256'" class="space-y-2">
                <label class="block text-xs font-medium text-[var(--text-secondary)]">RSA公钥(PEM)</label>
                <textarea v-model="parseRsaKey" rows="3" placeholder="粘贴PEM公钥..."
                    class="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none resize-y placeholder:text-[var(--text-tertiary)] hover:border-[var(--border-strong)] focus:border-[var(--border-focus)]"></textarea>
            </div>

            <FButton type="primary" @click="parse">解析/验证</FButton>

            <div v-if="parseResult" class="space-y-3">
                <div :class="['px-4 py-2 rounded text-sm', parseResult.isVerified ? 'bg-[var(--success)]/10 text-[var(--success)]' : 'bg-[var(--danger)]/10 text-[var(--danger)]']">
                    {{ parseResult.isVerified ? '签名验证通过' : '签名验证失败' }}
                </div>
                <div v-if="parseResult.header" class="space-y-2">
                    <label class="block text-xs font-medium text-[var(--text-secondary)]">Header</label>
                    <textarea v-model="parseResult.header" rows="1" readonly
                        class="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none resize-y"></textarea>
                </div>
                <div v-if="parseResult.payload" class="space-y-2">
                    <label class="block text-xs font-medium text-[var(--text-secondary)]">Payload</label>
                    <textarea v-model="parseResult.payload" rows="5" readonly
                        class="w-full min-h-40 px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none resize-y"></textarea>
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            activeTab: 'generate',
            genAlgorithm: 'HS256',
            genPayload: '{\n  "sub": "1234567890",\n  "name": "John Doe",\n  "iat": 1516239022\n}',
            genSecret: 'your-256-bit-secret',
            genRsaKey: '', genRsaPassword: '',
            genResult: '',
            parseToken: '', parseAlgorithm: 'HS256',
            parseSecret: '', parseRsaKey: '',
            parseResult: null
        };
    },
    methods: {
        async generate() {
            try {
                let res;
                if (this.genAlgorithm === 'HS256') {
                    res = await api('POST', '/jwt/generate-hmac', { payload: this.genPayload, secret: this.genSecret });
                } else {
                    res = await api('POST', '/jwt/generate-rsa', { payload: this.genPayload, privateKey: this.genRsaKey, password: this.genRsaPassword || null });
                }
                this.genResult = res.data;
            } catch(e) { alert('生成失败: ' + e.message); }
        },
        async parse() {
            try {
                let res;
                if (this.parseAlgorithm === 'HS256') {
                    res = await api('POST', '/jwt/verify-hmac', { token: this.parseToken, secret: this.parseSecret });
                } else {
                    res = await api('POST', '/jwt/verify-rsa', { token: this.parseToken, publicKey: this.parseRsaKey });
                }
                this.parseResult = res.data;
            } catch(e) { alert('解析失败: ' + e.message); }
        },
        refresh() {
            this.activeTab = 'generate';
            this.genAlgorithm = 'HS256';
            this.genPayload = '{\n  "sub": "1234567890",\n  "name": "John Doe",\n  "iat": 1516239022\n}';
            this.genSecret = 'your-256-bit-secret';
            this.genRsaKey = '';
            this.genRsaPassword = '';
            this.genResult = '';
            this.parseToken = '';
            this.parseAlgorithm = 'HS256';
            this.parseSecret = '';
            this.parseRsaKey = '';
            this.parseResult = null;
        }
    }
};