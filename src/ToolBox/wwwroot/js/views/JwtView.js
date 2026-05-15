const { ref } = Vue;

export const JwtView = {
    template: `
    <div class="h-full flex flex-col gap-4 p-4 bg-gradient-to-br from-[var(--bg-gradient-start)] to-[var(--bg-gradient-end)]">
        <div class="flex-none">
            <div class="bg-[var(--bg-surface)] rounded-xl shadow-sm border border-[var(--border-subtle)] p-1">
                <div class="flex flex-wrap gap-1">
                    <button v-for="t in jwtTabs" :key="t.key" @click="jwtTab = t.key"
                        :class="['px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200',
                            jwtTab === t.key ? 'bg-gradient-to-r from-[var(--accent)] to-[var(--accent-hover)] text-[var(--text-inverse)] shadow-md' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]']">
                        {{ t.label }}
                    </button>
                </div>
            </div>
        </div>

        <div v-if="jwtTab === 'sign'" class="flex-1 min-h-0 bg-[var(--bg-surface)] rounded-xl shadow-sm border border-[var(--border-subtle)] p-5 flex flex-col gap-4">
            <div class="grid grid-cols-1 gap-4 flex-none">
                <div class="flex flex-col gap-3">
                    <label class="text-sm font-semibold text-[var(--text-primary)]">签名方式</label>
                    <FSingleSelect v-model="signMethod" :options="signMethodOptions"></FSingleSelect>
                </div>
            </div>
            
            <template v-if="signMethod === 'hmac'">
                <div class="grid grid-cols-1 gap-4 flex-none">
                    <div class="flex flex-col gap-3">
                        <label class="text-sm font-semibold text-[var(--text-primary)]">Secret</label>
                        <FInput v-model="signHmacSecret" placeholder="HMAC密钥"></FInput>
                    </div>
                </div>
            </template>
            
            <template v-if="signMethod === 'rsa'">
                <div class="grid grid-cols-1 gap-4 flex-none">
                    <div class="flex flex-col gap-3">
                        <label class="text-sm font-semibold text-[var(--text-primary)]">Private Key</label>
                        <textarea v-model="signRsaPrivateKey" placeholder="RSA私钥 (PEM格式)..."
                            class="flex-1 min-h-0 px-4 py-3 bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-lg text-sm font-mono text-[var(--text-primary)] outline-none resize-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent placeholder:text-[var(--text-placeholder)]"></textarea>
                    </div>
                    <div class="flex flex-col gap-3">
                        <label class="text-sm font-semibold text-[var(--text-primary)]">Password (可选)</label>
                        <FInput v-model="signRsaPassword" placeholder="私钥密码（如有）"></FInput>
                    </div>
                </div>
            </template>
            
            <div class="flex-1 min-h-0 flex flex-col gap-3">
                <label class="text-sm font-semibold text-[var(--text-primary)]">Payload</label>
                <textarea v-model="signPayload" placeholder='{"sub": "123", "name": "John"}'
                    class="w-full flex-1 px-4 py-3 bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-lg text-sm font-mono text-[var(--text-primary)] outline-none resize-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent placeholder:text-[var(--text-placeholder)]"></textarea>
            </div>
            
            <div class="flex gap-3">
                <FButton type="primary" @click="jwtDoSign" class="flex-1 text-base">
                    <IconLock :size="20" />
                    签名
                </FButton>
            </div>
            
            <div class="flex-1 min-h-0 flex flex-col gap-3">
                <div class="flex items-center justify-between">
                    <label class="text-sm font-semibold text-[var(--text-primary)]">JWT</label>
                    <CopyButton :text="signResult"></CopyButton>
                </div>
                <textarea v-model="signResult" readonly placeholder="生成的JWT..."
                    class="flex-1 min-h-0 px-4 py-3 bg-gradient-to-r from-[var(--bg-input)] to-[var(--accent-light)] border border-[var(--border-subtle)] rounded-lg text-sm font-mono text-[var(--text-primary)] outline-none resize-none"></textarea>
            </div>
        </div>

        <div v-if="jwtTab === 'decode'" class="flex-1 min-h-0 bg-[var(--bg-surface)] rounded-xl shadow-sm border border-[var(--border-subtle)] p-5 flex flex-col gap-4">
            <div class="grid grid-cols-1 gap-4 flex-1 min-h-0">
                <div class="flex flex-col gap-3 flex-1 min-h-0">
                    <label class="text-sm font-semibold text-[var(--text-primary)]">JWT</label>
                    <textarea v-model="jwtDecodeToken" placeholder="粘贴JWT..." @input="jwtDoDecode"
                        class="flex-1 min-h-0 px-4 py-3 bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-lg text-sm font-mono text-[var(--text-primary)] outline-none resize-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent placeholder:text-[var(--text-placeholder)]"></textarea>
                </div>
                <div class="flex flex-col gap-3 flex-1 min-h-0">
                    <label class="text-sm font-semibold text-[var(--text-primary)]">Header</label>
                    <textarea v-model="jwtHeaderJson" readonly placeholder="Header JSON..."
                        class="flex-1 min-h-0 px-4 py-3 bg-gradient-to-r from-[var(--bg-input)] to-[var(--accent-light)] border border-[var(--border-subtle)] rounded-lg text-sm font-mono text-[var(--text-primary)] outline-none resize-none"></textarea>
                </div>
            </div>
            <div class="grid grid-cols-1 gap-4 flex-1 min-h-0">
                <div class="flex flex-col gap-3 flex-1 min-h-0">
                    <label class="text-sm font-semibold text-[var(--text-primary)]">Payload</label>
                    <textarea v-model="jwtPayloadJson" readonly placeholder="Payload JSON..."
                        class="flex-1 min-h-0 px-4 py-3 bg-gradient-to-r from-[var(--bg-input)] to-[var(--accent-light)] border border-[var(--border-subtle)] rounded-lg text-sm font-mono text-[var(--text-primary)] outline-none resize-none"></textarea>
                </div>
                <div class="flex flex-col gap-3 flex-1 min-h-0">
                    <label class="text-sm font-semibold text-[var(--text-primary)]">Signature</label>
                    <textarea v-model="jwtSignature" readonly placeholder="Signature..."
                        class="flex-1 min-h-0 px-4 py-3 bg-gradient-to-r from-[var(--bg-input)] to-[var(--accent-light)] border border-[var(--border-subtle)] rounded-lg text-sm font-mono text-[var(--text-primary)] outline-none resize-none"></textarea>
                </div>
            </div>
        </div>

        <div v-if="jwtTab === 'verify'" class="flex-1 min-h-0 bg-[var(--bg-surface)] rounded-xl shadow-sm border border-[var(--border-subtle)] p-5 flex flex-col gap-4">
            <div class="grid grid-cols-1 gap-4 flex-none">
                <div class="flex flex-col gap-3">
                    <label class="text-sm font-semibold text-[var(--text-primary)]">验证方式</label>
                    <FSingleSelect v-model="verifyMethod" :options="verifyMethodOptions"></FSingleSelect>
                </div>
            </div>
            
            <template v-if="verifyMethod === 'hmac'">
                <div class="grid grid-cols-1 gap-4 flex-none">
                    <div class="flex flex-col gap-3">
                        <label class="text-sm font-semibold text-[var(--text-primary)]">Secret</label>
                        <FInput v-model="verifyHmacSecret" placeholder="HMAC密钥"></FInput>
                    </div>
                </div>
            </template>
            
            <template v-if="verifyMethod === 'rsa'">
                <div class="flex-1 gap-4 flex-none">
                    <div class="flex flex-col gap-3">
                        <label class="text-sm font-semibold text-[var(--text-primary)]">Public Key</label>
                        <textarea v-model="verifyRsaPublicKey" placeholder="RSA公钥 (PEM格式)..."
                            class="flex-1 min-h-0 px-4 py-3 bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-lg text-sm font-mono text-[var(--text-primary)] outline-none resize-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent placeholder:text-[var(--text-placeholder)]"></textarea>
                    </div>
                </div>
            </template>
            
            <div class="flex-1 flex flex-col min-h-0 gap-3">
                <label class="text-sm font-semibold text-[var(--text-primary)]">JWT</label>
                <textarea v-model="verifyToken" placeholder="粘贴JWT..."
                    class="w-full flex-1 min-h-0 px-4 py-3 bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-lg text-sm font-mono text-[var(--text-primary)] outline-none resize-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent placeholder:text-[var(--text-placeholder)]"></textarea>
            </div>
            
            <div class="flex gap-3">
                <FButton type="primary" @click="jwtDoVerify" class="flex-1 text-base">
                    <IconCircleCheck :size="20" />
                    验签
                </FButton>
            </div>
            
            <div class="flex flex-col gap-3">
                <div class="flex items-center justify-between">
                    <label class="text-sm font-semibold text-[var(--text-primary)]">验证结果</label>
                    <div class="flex items-center gap-2" :class="verifyResult.isVerified ? 'text-[var(--success)]' : 'text-[var(--danger)]'">
                        <IconCircleCheck :size="20" />
                        <span class="font-medium">{{ verifyResult.isVerified ? '验证通过' : '验证失败' }}</span>
                    </div>
                </div>
                
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div class="flex flex-col gap-2">
                        <label class="text-sm font-semibold text-[var(--text-primary)]">Header</label>
                        <textarea v-model="verifyHeader" readonly placeholder="Header JSON..."
                            class="flex-1 min-h-0 px-4 py-3 bg-gradient-to-r from-[var(--bg-input)] to-[var(--accent-light)] border border-[var(--border-subtle)] rounded-lg text-sm font-mono text-[var(--text-primary)] outline-none resize-none"></textarea>
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="text-sm font-semibold text-[var(--text-primary)]">Payload</label>
                        <textarea v-model="verifyPayload" readonly placeholder="Payload JSON..."
                            class="flex-1 min-h-[100px] px-4 py-3 bg-gradient-to-r from-[var(--bg-input)] to-[var(--accent-light)] border border-[var(--border-subtle)] rounded-lg text-sm font-mono text-[var(--text-primary)] outline-none resize-none"></textarea>
                    </div>
                </div>
                
                <div v-if="verifyResult.Algorithm" class="flex items-center gap-2">
                    <span class="text-sm text-[var(--text-secondary)]">算法:</span>
                    <span class="px-3 py-1 bg-[var(--accent-light)] text-[var(--accent)] rounded-full text-sm font-medium">{{ verifyResult.Algorithm }}</span>
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
