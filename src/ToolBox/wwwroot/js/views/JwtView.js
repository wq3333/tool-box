const { ref } = Vue;

export const JwtView = {
    template: `
    <div class="h-full flex flex-col gap-4 p-4">
        <div class="flex-none">
            <div class="hidden lg:flex gap-1 border-b border-[var(--border-subtle)] pb-2">
                <button v-for="t in jwtTabs" :key="t.key" @click="jwtTab = t.key"
                    :class="['px-3 py-1.5 text-xs rounded transition-colors',
                            jwtTab === t.key ? 'bg-[var(--accent)] text-[var(--text-inverse)]' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]']">
                    {{ t.label }}
                </button>
            </div>
            <div class="lg:hidden">
                <label class="block text-xs font-medium text-[var(--text-secondary)] mb-1">选择操作</label>
                <FSingleSelect v-model="jwtTab" :options="jwtTabs.map(t => ({ value: t.key, label: t.label }))"></FSingleSelect>
            </div>
        </div>

        <div v-if="jwtTab === 'decode'" class="flex-1 min-h-0 bg-[var(--bg-surface)] rounded-lg border border-[var(--border-subtle)] p-4 flex flex-col gap-3">
            <div class="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-3">
                <div class="flex flex-col gap-2 flex-1 min-h-0">
                    <label class="block text-xs font-medium text-[var(--text-secondary)]">JWT</label>
                    <textarea v-model="jwtDecodeToken" placeholder="粘贴JWT..." @input="jwtDoDecode"
                        class="flex-1 min-h-0 px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none resize-none placeholder:text-[var(--text-tertiary)] hover:border-[var(--border-strong)] focus:border-[var(--border-focus)]"></textarea>
                </div>
                <div class="flex flex-col gap-2 flex-1 min-h-0">
                    <label class="block text-xs font-medium text-[var(--text-secondary)]">Header</label>
                    <textarea v-model="jwtHeaderJson" readonly placeholder="Header JSON..."
                        class="flex-1 min-h-0 px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none resize-none"></textarea>
                </div>
            </div>
            <div class="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-3">
                <div class="flex flex-col gap-2 flex-1 min-h-0">
                    <label class="block text-xs font-medium text-[var(--text-secondary)]">Payload</label>
                    <textarea v-model="jwtPayloadJson" readonly placeholder="Payload JSON..."
                        class="flex-1 min-h-0 px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none resize-none"></textarea>
                </div>
                <div class="flex flex-col gap-2 flex-1 min-h-0">
                    <label class="block text-xs font-medium text-[var(--text-secondary)]">Signature</label>
                    <textarea v-model="jwtSignature" readonly placeholder="Signature..."
                        class="flex-1 min-h-0 px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none resize-none"></textarea>
                </div>
            </div>
        </div>

        <div v-if="jwtTab === 'sign'" class="flex-1 min-h-0 bg-[var(--bg-surface)] rounded-lg border border-[var(--border-subtle)] p-4 flex flex-col gap-3">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 flex-none">
                <div class="flex flex-col gap-2">
                    <label class="block text-xs font-medium text-[var(--text-secondary)]">算法</label>
                    <FSingleSelect v-model="jwtSignAlg" :options="jwtAlgOptions"></FSingleSelect>
                </div>
                <div class="flex flex-col gap-2">
                    <label class="block text-xs font-medium text-[var(--text-secondary)]">密钥/Secret</label>
                    <input v-model="jwtSignKey" placeholder="HMAC密钥或PEM"
                        class="px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none placeholder:text-[var(--text-tertiary)] hover:border-[var(--border-strong)] focus:border-[var(--border-focus)]">
                </div>
            </div>
            <div class="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-3">
                <div class="flex flex-col gap-2 flex-1 min-h-0">
                    <label class="block text-xs font-medium text-[var(--text-secondary)]">Header</label>
                    <textarea v-model="jwtSignHeader" placeholder='{"alg": "HS256", "typ": "JWT"}'
                        class="flex-1 min-h-0 px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none resize-none placeholder:text-[var(--text-tertiary)] hover:border-[var(--border-strong)] focus:border-[var(--border-focus)]"></textarea>
                </div>
                <div class="flex flex-col gap-2 flex-1 min-h-0">
                    <label class="block text-xs font-medium text-[var(--text-secondary)]">Payload</label>
                    <textarea v-model="jwtSignPayload" placeholder='{"sub": "123", "name": "John"}'
                        class="flex-1 min-h-0 px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none resize-none placeholder:text-[var(--text-tertiary)] hover:border-[var(--border-strong)] focus:border-[var(--border-focus)]"></textarea>
                </div>
            </div>
            <div class="flex gap-2 flex-none">
                <FButton type="primary" @click="jwtDoSign">签名</FButton>
            </div>
            <div class="flex flex-col gap-2 flex-1 min-h-0">
                <div class="flex items-center justify-between">
                    <label class="block text-xs font-medium text-[var(--text-secondary)]">JWT</label>
                    <CopyButton v-if="jwtSignResult" :text="jwtSignResult"></CopyButton>
                </div>
                <textarea v-model="jwtSignResult" readonly placeholder="生成的JWT..."
                    class="flex-1 min-h-0 px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none resize-none"></textarea>
            </div>
        </div>

        <div v-if="jwtTab === 'verify'" class="flex-1 min-h-0 bg-[var(--bg-surface)] rounded-lg border border-[var(--border-subtle)] p-4 flex flex-col gap-3">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 flex-none">
                <div class="flex flex-col gap-2">
                    <label class="block text-xs font-medium text-[var(--text-secondary)]">算法</label>
                    <FSingleSelect v-model="jwtVerifyAlg" :options="jwtAlgOptions"></FSingleSelect>
                </div>
                <div class="flex flex-col gap-2">
                    <label class="block text-xs font-medium text-[var(--text-secondary)]">密钥/Secret</label>
                    <input v-model="jwtVerifyKey" placeholder="HMAC密钥或PEM"
                        class="px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none placeholder:text-[var(--text-tertiary)] hover:border-[var(--border-strong)] focus:border-[var(--border-focus)]">
                </div>
            </div>
            <div class="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-3">
                <div class="flex flex-col gap-2 flex-1 min-h-0">
                    <label class="block text-xs font-medium text-[var(--text-secondary)]">JWT</label>
                    <textarea v-model="jwtVerifyToken" placeholder="粘贴JWT..."
                        class="flex-1 min-h-0 px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none resize-none placeholder:text-[var(--text-tertiary)] hover:border-[var(--border-strong)] focus:border-[var(--border-focus)]"></textarea>
                </div>
                <div class="flex flex-col gap-2 flex-1 min-h-0">
                    <div class="flex items-center justify-between">
                        <label class="block text-xs font-medium text-[var(--text-secondary)]">结果</label>
                        <div v-if="jwtVerifyResult" class="flex items-center gap-1" :class="jwtVerifyResult.valid ? 'text-[var(--success)]' : 'text-[var(--danger)]'">
                            <span class="text-sm">{{ jwtVerifyResult.valid ? '✓' : '✗' }}</span>
                        </div>
                    </div>
                    <textarea v-model="jwtVerifyJson" readonly placeholder="验证结果..."
                        class="flex-1 min-h-0 px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none resize-none"></textarea>
                </div>
            </div>
            <div class="flex gap-2 flex-none">
                <FButton type="primary" @click="jwtDoVerify">验证</FButton>
            </div>
        </div>
    </div>
    `,
    setup() {
        const jwtTab = ref('decode');
        const jwtTabs = [
            { key: 'decode', label: '解码' },
            { key: 'sign', label: '签名' },
            { key: 'verify', label: '验证' }
        ];
        const jwtDecodeToken = ref('');
        const jwtHeaderJson = ref('');
        const jwtPayloadJson = ref('');
        const jwtSignature = ref('');
        const jwtSignAlg = ref('HS256');
        const jwtSignKey = ref('');
        const jwtSignHeader = ref('');
        const jwtSignPayload = ref('');
        const jwtSignResult = ref('');
        const jwtVerifyAlg = ref('HS256');
        const jwtVerifyKey = ref('');
        const jwtVerifyToken = ref('');
        const jwtVerifyResult = ref(null);
        const jwtVerifyJson = ref('');
        const jwtAlgOptions = [
            {value: 'HS256', label: 'HS256 - HMAC SHA256'},
            {value: 'HS384', label: 'HS384 - HMAC SHA384'},
            {value: 'HS512', label: 'HS512 - HMAC SHA512'},
            {value: 'RS256', label: 'RS256 - RSA SHA256'},
            {value: 'RS384', label: 'RS384 - RSA SHA384'},
            {value: 'RS512', label: 'RS512 - RSA SHA512'},
            {value: 'ES256', label: 'ES256 - ECDSA SHA256'},
            {value: 'ES384', label: 'ES384 - ECDSA SHA384'},
            {value: 'ES512', label: 'ES512 - ECDSA SHA512'},
            {value: 'PS256', label: 'PS256 - RSA-PSS SHA256'},
            {value: 'PS384', label: 'PS384 - RSA-PSS SHA384'},
            {value: 'PS512', label: 'PS512 - RSA-PSS SHA512'}
        ];

        const jwtDoDecode = () => {
            if (!jwtDecodeToken.value) { jwtHeaderJson.value = ''; jwtPayloadJson.value = ''; jwtSignature.value = ''; return; }
            const parts = jwtDecodeToken.value.split('.');
            if (parts.length !== 3) { jwtHeaderJson.value = ''; jwtPayloadJson.value = ''; jwtSignature.value = ''; return; }
            try {
                const h = JSON.parse(atob(parts[0]));
                const p = JSON.parse(atob(parts[1]));
                jwtHeaderJson.value = JSON.stringify(h, null, 2);
                jwtPayloadJson.value = JSON.stringify(p, null, 2);
                jwtSignature.value = parts[2];
            } catch { jwtHeaderJson.value = ''; jwtPayloadJson.value = ''; jwtSignature.value = ''; }
        };

        const jwtDoSign = async () => {
            try {
                const res = await api('POST', '/jwt/sign', { alg: jwtSignAlg.value, key: jwtSignKey.value, header: jwtSignHeader.value, payload: jwtSignPayload.value });
                jwtSignResult.value = res.data;
            } catch (e) { alert('签名失败: ' + e.message); }
        };

        const jwtDoVerify = async () => {
            try {
                const res = await api('POST', '/jwt/verify', { alg: jwtVerifyAlg.value, key: jwtVerifyKey.value, token: jwtVerifyToken.value });
                jwtVerifyResult.value = res.data;
                jwtVerifyJson.value = JSON.stringify(res.data, null, 2);
            } catch (e) { jwtVerifyJson.value = '验证失败: ' + e.message; jwtVerifyResult.value = { valid: false }; }
        };

        const refresh = () => {
            jwtDecodeToken.value = '';
            jwtHeaderJson.value = '';
            jwtPayloadJson.value = '';
            jwtSignature.value = '';
            jwtSignAlg.value = 'HS256';
            jwtSignKey.value = '';
            jwtSignHeader.value = '';
            jwtSignPayload.value = '';
            jwtSignResult.value = '';
            jwtVerifyAlg.value = 'HS256';
            jwtVerifyKey.value = '';
            jwtVerifyToken.value = '';
            jwtVerifyResult.value = null;
            jwtVerifyJson.value = '';
        };

        return {
            jwtTab, jwtTabs, jwtDecodeToken, jwtHeaderJson, jwtPayloadJson, jwtSignature,
            jwtSignAlg, jwtSignKey, jwtSignHeader, jwtSignPayload, jwtSignResult,
            jwtVerifyAlg, jwtVerifyKey, jwtVerifyToken, jwtVerifyResult, jwtVerifyJson,
            jwtAlgOptions, jwtDoDecode, jwtDoSign, jwtDoVerify, refresh
        };
    }
};
