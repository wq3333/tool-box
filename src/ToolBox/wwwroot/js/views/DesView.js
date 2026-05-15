const { ref } = Vue;

export const DesView = {
    template: `
    <div class="h-full flex flex-col gap-4 p-4 bg-gradient-to-br from-[var(--bg-gradient-start)] to-[var(--bg-gradient-end)]">
        <div class="bg-[var(--bg-surface)] rounded-xl shadow-sm border border-[var(--border-subtle)] p-5 flex flex-col gap-4 flex-1 min-h-0">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div class="flex flex-col gap-2">
                    <label class="text-sm font-semibold text-[var(--text-primary)]">密钥</label>
                    <FInput v-model="key" placeholder="输入DES密钥"></FInput>
                </div>
                <div v-if="mode !== 'ECB'" class="flex flex-col gap-2">
                    <label class="text-sm font-semibold text-[var(--text-primary)]">IV(必需)</label>
                    <FInput v-model="iv" placeholder="输入IV"></FInput>
                </div>
                <div class="flex flex-col gap-2">
                    <label class="text-sm font-semibold text-[var(--text-primary)]">模式</label>
                    <FSingleSelect v-model="mode" :options="[{value:'CBC',label:'CBC'},{value:'ECB',label:'ECB'},{value:'CFB',label:'CFB'}]"></FSingleSelect>
                </div>
                <div class="flex flex-col gap-2">
                    <label class="text-sm font-semibold text-[var(--text-primary)]">填充</label>
                    <FSingleSelect v-model="padding" :options="[{value:'PKCS7',label:'PKCS7'},{value:'Zeros',label:'Zeros'},{value:'ANSIX923',label:'ANSIX923'},{value:'ISO10126',label:'ISO10126'},{value:'None',label:'None'}]"></FSingleSelect>
                </div>
            </div>

            <div class="flex-1 min-h-0 flex flex-col gap-3">
                <label class="text-sm font-semibold text-[var(--text-primary)]">输入</label>
                <textarea v-model="input" placeholder="输入明文或密文..."
                    class="flex-1 min-h-0 px-4 py-3 bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-lg text-sm font-mono text-[var(--text-primary)] outline-none resize-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent placeholder:text-[var(--text-placeholder)]"></textarea>
            </div>

            <div class="flex gap-3">
                <FButton type="primary" @click="encrypt" class="flex-1 text-base">
                    <IconLock />
                    加密
                </FButton>
                <FButton type="success" @click="decrypt" class="flex-1 text-base">
                    <IconUnlock />
                    解密
                </FButton>
            </div>

            <div class="flex flex-col gap-3 flex-1 min-h-0">
                <div class="flex items-center justify-between">
                    <label class="text-sm font-semibold text-[var(--text-primary)]">输出</label>
                    <CopyButton :text="result"></CopyButton>
                </div>
                <textarea v-model="result" readonly placeholder="结果将在此显示..."
                    class="flex-1 min-h-0 px-4 py-3 bg-gradient-to-r from-[var(--bg-input)] to-[var(--accent-light)] border border-[var(--border-subtle)] rounded-lg text-sm font-mono text-[var(--text-primary)] outline-none resize-none"></textarea>
            </div>
        </div>
    </div>
    `,
    setup() {
        const key = ref('');
        const iv = ref('');
        const input = ref('');
        const result = ref('');
        const mode = ref('CBC');
        const padding = ref('PKCS7');

        const encrypt = async () => {
            try {
                const res = await api('POST', '/encryption/des/encrypt', { plaintext: input.value, key: key.value, iv: iv.value || null, mode: mode.value, padding: padding.value });
                result.value = res.data;
            } catch (e) {
                result.value = e.message;
                toast.error('加密失败: ' + e.message);
            }
        };

        const decrypt = async () => {
            try {
                const res = await api('POST', '/encryption/des/decrypt', { ciphertext: input.value, key: key.value, iv: iv.value || null, mode: mode.value, padding: padding.value });
                result.value = res.data;
            } catch (e) {
                result.value = e.message;
                toast.error('解密失败: ' + e.message);
            }
        };

        const refresh = () => {
            key.value = '';
            iv.value = '';
            input.value = '';
            result.value = '';
            mode.value = 'CBC';
            padding.value = 'PKCS7';
        };

        return { key, iv, input, result, mode, padding, encrypt, decrypt, refresh };
    }
};
