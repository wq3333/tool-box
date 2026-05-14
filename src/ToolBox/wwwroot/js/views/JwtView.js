import { FInput } from '../components/FInput.js';
import { toast } from '../components/Toast.js';

const { ref } = Vue;

export const JwtView = {
    components: { FInput },
    template: `
    <div class="h-full flex flex-col gap-4 p-4 bg-gradient-to-br from-slate-50 to-slate-100">
        <div class="flex-none">
            <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-1">
                <div class="flex flex-wrap gap-1">
                    <button v-for="t in jwtTabs" :key="t.key" @click="jwtTab = t.key"
                        :class="['px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200',
                            jwtTab === t.key ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100']">
                        {{ t.label }}
                    </button>
                </div>
            </div>
        </div>

        <div v-if="jwtTab === 'decode'" class="flex-1 min-h-0 bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col gap-4">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
                <div class="flex flex-col gap-3 flex-1 min-h-0">
                    <label class="text-sm font-semibold text-slate-700">JWT</label>
                    <textarea v-model="jwtDecodeToken" placeholder="粘贴JWT..." @input="jwtDoDecode"
                        class="flex-1 min-h-0 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-700 outline-none resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400"></textarea>
                </div>
                <div class="flex flex-col gap-3 flex-1 min-h-0">
                    <label class="text-sm font-semibold text-slate-700">Header</label>
                    <textarea v-model="jwtHeaderJson" readonly placeholder="Header JSON..."
                        class="flex-1 min-h-0 px-4 py-3 bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-700 outline-none resize-none"></textarea>
                </div>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
                <div class="flex flex-col gap-3 flex-1 min-h-0">
                    <label class="text-sm font-semibold text-slate-700">Payload</label>
                    <textarea v-model="jwtPayloadJson" readonly placeholder="Payload JSON..."
                        class="flex-1 min-h-0 px-4 py-3 bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-700 outline-none resize-none"></textarea>
                </div>
                <div class="flex flex-col gap-3 flex-1 min-h-0">
                    <label class="text-sm font-semibold text-slate-700">Signature</label>
                    <textarea v-model="jwtSignature" readonly placeholder="Signature..."
                        class="flex-1 min-h-0 px-4 py-3 bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-700 outline-none resize-none"></textarea>
                </div>
            </div>
        </div>

        <div v-if="jwtTab === 'sign'" class="flex-1 min-h-0 bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col gap-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 flex-none">
                <div class="flex flex-col gap-3">
                    <label class="text-sm font-semibold text-slate-700">算法</label>
                    <FSingleSelect v-model="jwtSignAlg" :options="jwtAlgOptions"></FSingleSelect>
                </div>
                <div class="flex flex-col gap-3">
                    <label class="text-sm font-semibold text-slate-700">密钥/Secret</label>
                    <FInput v-model="jwtSignKey" placeholder="HMAC密钥或PEM"></FInput>
                </div>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
                <div class="flex flex-col gap-3 flex-1 min-h-0">
                    <label class="text-sm font-semibold text-slate-700">Header</label>
                    <textarea v-model="jwtSignHeader" placeholder='{"alg": "HS256", "typ": "JWT"}'
                        class="flex-1 min-h-0 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-700 outline-none resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400"></textarea>
                </div>
                <div class="flex flex-col gap-3 flex-1 min-h-0">
                    <label class="text-sm font-semibold text-slate-700">Payload</label>
                    <textarea v-model="jwtSignPayload" placeholder='{"sub": "123", "name": "John"}'
                        class="flex-1 min-h-0 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-700 outline-none resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400"></textarea>
                </div>
            </div>
            <div class="flex gap-3">
                <FButton type="primary" @click="jwtDoSign" class="flex-1 py-3 text-base">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    签名
                </FButton>
            </div>
            <div class="flex flex-col gap-3 flex-1 min-h-0">
                <div class="flex items-center justify-between">
                    <label class="text-sm font-semibold text-slate-700">JWT</label>
                    <CopyButton v-if="jwtSignResult" :text="jwtSignResult"></CopyButton>
                </div>
                <textarea v-model="jwtSignResult" readonly placeholder="生成的JWT..."
                    class="flex-1 min-h-0 px-4 py-3 bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-700 outline-none resize-none"></textarea>
            </div>
        </div>

        <div v-if="jwtTab === 'verify'" class="flex-1 min-h-0 bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col gap-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 flex-none">
                <div class="flex flex-col gap-3">
                    <label class="text-sm font-semibold text-slate-700">算法</label>
                    <FSingleSelect v-model="jwtVerifyAlg" :options="jwtAlgOptions"></FSingleSelect>
                </div>
                <div class="flex flex-col gap-3">
                    <label class="text-sm font-semibold text-slate-700">密钥/Secret</label>
                    <FInput v-model="jwtVerifyKey" placeholder="HMAC密钥或PEM"></FInput>
                </div>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
                <div class="flex flex-col gap-3 flex-1 min-h-0">
                    <label class="text-sm font-semibold text-slate-700">JWT</label>
                    <textarea v-model="jwtVerifyToken" placeholder="粘贴JWT..."
                        class="flex-1 min-h-0 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-700 outline-none resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400"></textarea>
                </div>
                <div class="flex flex-col gap-3 flex-1 min-h-0">
                    <div class="flex items-center justify-between">
                        <label class="text-sm font-semibold text-slate-700">结果</label>
                        <div v-if="jwtVerifyResult" class="flex items-center gap-1" :class="jwtVerifyResult.valid ? 'text-emerald-600' : 'text-red-600'">
                            <span class="text-lg">{{ jwtVerifyResult.valid ? '✓' : '✗' }}</span>
                        </div>
                    </div>
                    <textarea v-model="jwtVerifyJson" readonly placeholder="验证结果..."
                        class="flex-1 min-h-0 px-4 py-3 bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-700 outline-none resize-none"></textarea>
                </div>
            </div>
            <div class="flex gap-3">
                <FButton type="primary" @click="jwtDoVerify" class="flex-1 py-3 text-base">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    验证
                </FButton>
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
            } catch (e) { toast.error('签名失败: ' + e.message); }
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