import { FInput } from '../components/FInput.js';

const { ref } = Vue;

export const DesView = {
    components: { FInput },
    template: `
    <div class="h-full flex flex-col gap-4 p-4">
        <div class="flex-1 min-h-0 bg-[var(--bg-surface)] rounded-lg border border-[var(--border-subtle)] p-4 flex flex-col gap-3">
            <div class="flex flex-col gap-2">
                <label class="block text-xs font-medium text-[var(--text-secondary)]">密钥</label>
                <FInput v-model="key" placeholder="输入DES密钥"></FInput>
            </div>
            <div v-if="mode !== 'ECB'" class="flex flex-col gap-2">
                <label class="block text-xs font-medium text-[var(--text-secondary)]">IV(必需)</label>
                <FInput v-model="iv" placeholder="输入IV"></FInput>
            </div>
            <div class="flex flex-col gap-2">
                <label class="block text-xs font-medium text-[var(--text-secondary)]">模式</label>
                <FSingleSelect v-model="mode" :options="[{value:'CBC',label:'CBC'},{value:'ECB',label:'ECB'},{value:'CFB',label:'CFB'}]"></FSingleSelect>
            </div>
            <div class="flex flex-col gap-2">
                <label class="block text-xs font-medium text-[var(--text-secondary)]">填充</label>
                <FSingleSelect v-model="padding" :options="[{value:'PKCS7',label:'PKCS7'},{value:'Zeros',label:'Zeros'},{value:'ANSIX923',label:'ANSIX923'},{value:'ISO10126',label:'ISO10126'},{value:'None',label:'None'}]"></FSingleSelect>
            </div>
            <div class="flex-1 min-h-0 flex flex-col gap-2">
                <label class="block text-xs font-medium text-[var(--text-secondary)]">输入</label>
                <textarea v-model="input" placeholder="输入明文或密文..."
                    class="flex-1 min-h-0 px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none resize-none placeholder:text-[var(--text-tertiary)] hover:border-[var(--border-strong)] focus:border-[var(--border-focus)]"></textarea>
            </div>
            <div class="flex gap-2">
                <FButton type="primary" @click="encrypt">加密</FButton>
                <FButton type="default" @click="decrypt">解密</FButton>
            </div>
            <div v-if="result" class="flex flex-col gap-2 flex-1 min-h-0">
                <div class="flex items-center justify-between">
                    <label class="block text-xs font-medium text-[var(--text-secondary)]">输出</label>
                    <CopyButton :text="result"></CopyButton>
                </div>
                <textarea v-model="result" readonly placeholder="结果将在此显示..."
                    class="flex-1 min-h-0 px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none resize-none"></textarea>
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
            } catch(e) { alert('加密失败: ' + e.message); }
        };

        const decrypt = async () => {
            try {
                const res = await api('POST', '/encryption/des/decrypt', { ciphertext: input.value, key: key.value, iv: iv.value || null, mode: mode.value, padding: padding.value });
                result.value = res.data;
            } catch(e) { alert('解密失败: ' + e.message); }
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
