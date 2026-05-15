import { FInput } from '../components/FInput.js';
import { CopyButton } from '../components/CopyButton.js';
import { toast } from '../components/Toast.js';
import { IconLock, IconCircleCheck } from '../components/icon.js';

const { ref, computed } = Vue;

export const JwtView = {
    components: { FInput, CopyButton, IconLock, IconCircleCheck },
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

        <div v-if="jwtTab === 'sign'" class="flex-1 min-h-0 bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col gap-4">
            <div class="grid grid-cols-1 gap-4 flex-none">
                <div class="flex flex-col gap-3">
                    <label class="text-sm font-semibold text-slate-700">签名方式</label>
                    <FSingleSelect v-model="signMethod" :options="signMethodOptions"></FSingleSelect>
                </div>
            </div>
            
            <template v-if="signMethod === 'hmac'">
                <div class="grid grid-cols-1 gap-4 flex-none">
                    <div class="flex flex-col gap-3">
                        <label class="text-sm font-semibold text-slate-700">Secret</label>
                        <FInput v-model="signHmacSecret" placeholder="HMAC密钥"></FInput>
                    </div>
                </div>
            </template>
            
            <template v-if="signMethod === 'rsa'">
                <div class="grid grid-cols-1 gap-4 flex-none">
                    <div class="flex flex-col gap-3">
                        <label class="text-sm font-semibold text-slate-700">Private Key</label>
                        <textarea v-model="signRsaPrivateKey" placeholder="RSA私钥 (PEM格式)..."
                            class="min-h-[120px] px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-700 outline-none resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400"></textarea>
                    </div>
                    <div class="flex flex-col gap-3">
                        <label class="text-sm font-semibold text-slate-700">Password (可选)</label>
                        <FInput v-model="signRsaPassword" placeholder="私钥密码（如有）"></FInput>
                    </div>
                </div>
            </template>
            
            <div class="flex-1 min-h-0 flex flex-col gap-3">
                <label class="text-sm font-semibold text-slate-700">Payload</label>
                <textarea v-model="signPayload" placeholder='{"sub": "123", "name": "John"}'
                    class="w-full flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-700 outline-none resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400"></textarea>
            </div>
            
            <div class="flex gap-3">
                <FButton type="primary" @click="jwtDoSign" class="flex-1 py-3 text-base">
                    <IconLock :size="20" />
                    签名
                </FButton>
            </div>
            
            <div class="flex-1 min-h-0 flex flex-col gap-3">
                <div class="flex items-center justify-between">
                    <label class="text-sm font-semibold text-slate-700">JWT</label>
                    <CopyButton :text="signResult"></CopyButton>
                </div>
                <textarea v-model="signResult" readonly placeholder="生成的JWT..."
                    class="flex-1 min-h-0 px-4 py-3 bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-700 outline-none resize-none"></textarea>
            </div>
        </div>

        <div v-if="jwtTab === 'decode'" class="flex-1 min-h-0 bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col gap-4">
            <div class="grid grid-cols-1 gap-4 flex-1 min-h-0">
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
            <div class="grid grid-cols-1 gap-4 flex-1 min-h-0">
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

        <div v-if="jwtTab === 'verify'" class="flex-1 min-h-0 bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col gap-4">
            <div class="grid grid-cols-1 gap-4 flex-none">
                <div class="flex flex-col gap-3">
                    <label class="text-sm font-semibold text-slate-700">验证方式</label>
                    <FSingleSelect v-model="verifyMethod" :options="verifyMethodOptions"></FSingleSelect>
                </div>
            </div>
            
            <template v-if="verifyMethod === 'hmac'">
                <div class="grid grid-cols-1 gap-4 flex-none">
                    <div class="flex flex-col gap-3">
                        <label class="text-sm font-semibold text-slate-700">Secret</label>
                        <FInput v-model="verifyHmacSecret" placeholder="HMAC密钥"></FInput>
                    </div>
                </div>
            </template>
            
            <template v-if="verifyMethod === 'rsa'">
                <div class="grid grid-cols-1 gap-4 flex-none">
                    <div class="flex flex-col gap-3">
                        <label class="text-sm font-semibold text-slate-700">Public Key</label>
                        <textarea v-model="verifyRsaPublicKey" placeholder="RSA公钥 (PEM格式)..."
                            class="min-h-[120px] px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-700 outline-none resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400"></textarea>
                    </div>
                </div>
            </template>
            
            <div class="flex-1 flex flex-col min-h-0 gap-3">
                <label class="text-sm font-semibold text-slate-700">JWT</label>
                <textarea v-model="verifyToken" placeholder="粘贴JWT..."
                    class="w-full flex-1 min-h-0 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-700 outline-none resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400"></textarea>
            </div>
            
            <div class="flex gap-3">
                <FButton type="primary" @click="jwtDoVerify" class="flex-1 py-3 text-base">
                    <IconCircleCheck :size="20" />
                    验签
                </FButton>
            </div>
            
            <div class="flex flex-col gap-3">
                <div class="flex items-center justify-between">
                    <label class="text-sm font-semibold text-slate-700">验证结果</label>
                    <div class="flex items-center gap-2" :class="verifyResult.isVerified ? 'text-emerald-600' : 'text-red-600'">
                        <IconCircleCheck :size="20" />
                        <span class="font-medium">{{ verifyResult.isVerified ? '验证通过' : '验证失败' }}</span>
                    </div>
                </div>
                
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div class="flex flex-col gap-2">
                        <label class="text-sm font-semibold text-slate-700">Header</label>
                        <textarea v-model="verifyHeader" readonly placeholder="Header JSON..."
                            class="flex-1 min-h-[100px] px-4 py-3 bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-700 outline-none resize-none"></textarea>
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="text-sm font-semibold text-slate-700">Payload</label>
                        <textarea v-model="verifyPayload" readonly placeholder="Payload JSON..."
                            class="flex-1 min-h-[100px] px-4 py-3 bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-700 outline-none resize-none"></textarea>
                    </div>
                </div>
                
                <div v-if="verifyResult.Algorithm" class="flex items-center gap-2">
                    <span class="text-sm text-slate-500">算法:</span>
                    <span class="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">{{ verifyResult.Algorithm }}</span>
                </div>
            </div>
        </div>
    </div>
    `,
    setup() {
        const jwtTab = ref('sign');
        const jwtTabs = [
            { key: 'sign', label: '签名' },
            { key: 'decode', label: '解码' },
            { key: 'verify', label: '验签' }
        ];

        const signMethod = ref('hmac');
        const signMethodOptions = [
            { value: 'hmac', label: 'HMAC SHA256' },
            { value: 'rsa', label: 'RSA SHA256' }
        ];

        const verifyMethod = ref('hmac');
        const verifyMethodOptions = [
            { value: 'hmac', label: 'HMAC SHA256' },
            { value: 'rsa', label: 'RSA SHA256' }
        ];

        const jwtDecodeToken = ref('');
        const jwtHeaderJson = ref('');
        const jwtPayloadJson = ref('');
        const jwtSignature = ref('');

        const signHmacSecret = ref('');
        const signRsaPrivateKey = ref('');
        const signRsaPassword = ref('');
        const signPayload = ref('{"sub": "123", "name": "John"}');
        const signResult = ref('');

        const verifyHmacSecret = ref('');
        const verifyRsaPublicKey = ref('');
        const verifyToken = ref('');
        const verifyResult = ref({ isVerified: false, algorithm: '', header: '', payload: '' });
        const verifyHeader = ref('');
        const verifyPayload = ref('');

        const jwtDoDecode = () => {
            if (!jwtDecodeToken.value) {
                jwtHeaderJson.value = '';
                jwtPayloadJson.value = '';
                jwtSignature.value = '';
                return;
            }
            const parts = jwtDecodeToken.value.split('.');
            if (parts.length !== 3) {
                jwtHeaderJson.value = '';
                jwtPayloadJson.value = '';
                jwtSignature.value = '';
                return;
            }
            try {
                const h = JSON.parse(atob(parts[0]));
                const p = JSON.parse(atob(parts[1]));
                jwtHeaderJson.value = JSON.stringify(h, null, 2);
                jwtPayloadJson.value = JSON.stringify(p, null, 2);
                jwtSignature.value = parts[2];
            } catch {
                jwtHeaderJson.value = '';
                jwtPayloadJson.value = '';
                jwtSignature.value = '';
            }
        };

        const jwtDoSign = async () => {
            try {
                if (!signPayload.value) {
                    toast.error('请输入Payload');
                    return;
                }

                let res;
                if (signMethod.value === 'hmac') {
                    if (!signHmacSecret.value) {
                        toast.error('请输入Secret');
                        return;
                    }
                    res = await api('POST', '/jwt/generate-hmac', {
                        payload: signPayload.value,
                        secret: signHmacSecret.value
                    });
                } else {
                    if (!signRsaPrivateKey.value) {
                        toast.error('请输入Private Key');
                        return;
                    }
                    res = await api('POST', '/jwt/generate-rsa', {
                        payload: signPayload.value,
                        privateKey: signRsaPrivateKey.value,
                        password: signRsaPassword.value || undefined
                    });
                }
                signResult.value = res.data;
            } catch (e) {
                toast.error('签名失败: ' + e.message);
            }
        };

        const jwtDoVerify = async () => {
            try {
                if (!verifyToken.value) {
                    toast.error('请输入JWT');
                    return;
                }

                let res;
                if (verifyMethod.value === 'hmac') {
                    if (!verifyHmacSecret.value) {
                        toast.error('请输入Secret');
                        return;
                    }
                    res = await api('POST', '/jwt/verify-hmac', {
                        token: verifyToken.value,
                        secret: verifyHmacSecret.value
                    });
                } else {
                    if (!verifyRsaPublicKey.value) {
                        toast.error('请输入Public Key');
                        return;
                    }
                    res = await api('POST', '/jwt/verify-rsa', {
                        token: verifyToken.value,
                        publicKey: verifyRsaPublicKey.value
                    });
                }
                verifyResult.value = res.data;
                verifyHeader.value = res.data.header || '';
                verifyPayload.value = res.data.payload || '';
            } catch (e) {
                toast.error('验证失败: ' + e.message);
            }
        };

        const refresh = () => {
            jwtDecodeToken.value = '';
            jwtHeaderJson.value = '';
            jwtPayloadJson.value = '';
            jwtSignature.value = '';

            signMethod.value = 'hmac';
            signHmacSecret.value = '';
            signRsaPrivateKey.value = '';
            signRsaPassword.value = '';
            signPayload.value = '';
            signResult.value = '';

            verifyMethod.value = 'hmac';
            verifyHmacSecret.value = '';
            verifyRsaPublicKey.value = '';
            verifyToken.value = '';
            verifyResult.value = null;
            verifyHeader.value = '';
            verifyPayload.value = '';
        };

        return {
            jwtTab, jwtTabs,
            signMethod, signMethodOptions,
            verifyMethod, verifyMethodOptions,
            jwtDecodeToken, jwtHeaderJson, jwtPayloadJson, jwtSignature,
            signHmacSecret, signRsaPrivateKey, signRsaPassword, signPayload, signResult,
            verifyHmacSecret, verifyRsaPublicKey, verifyToken, verifyResult, verifyHeader, verifyPayload,
            jwtDoDecode, jwtDoSign, jwtDoVerify, refresh
        };
    }
};
