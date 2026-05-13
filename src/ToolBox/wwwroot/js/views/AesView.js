export const AesView = {
    template: `
    <div class="space-y-3">
        <div class="space-y-2">
            <label class="block text-xs font-medium text-[var(--text-secondary)]">密钥</label>
            <input type="text" v-model="aesKey" placeholder="输入AES密钥"
                class="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none placeholder:text-[var(--text-tertiary)] hover:border-[var(--border-strong)] focus:border-[var(--border-focus)]"
            >
        </div>
        <div v-if="aesMode !== 'ECB'" class="space-y-2">
            <label class="block text-xs font-medium text-[var(--text-secondary)]">IV(必需)</label>
            <input type="text" v-model="aesIv" placeholder="输入IV"
                class="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none placeholder:text-[var(--text-tertiary)] hover:border-[var(--border-strong)] focus:border-[var(--border-focus)]"
            >
        </div>
        <div class="space-y-2">
            <label class="block text-xs font-medium text-[var(--text-secondary)]">模式</label>
            <FSingleSelect v-model="aesMode" :options="[{value:'CBC',label:'CBC'},{value:'ECB',label:'ECB'},{value:'CFB',label:'CFB'}]" />
        </div>
        <div class="space-y-2">
            <label class="block text-xs font-medium text-[var(--text-secondary)]">填充</label>
            <FSingleSelect v-model="aesPadding" :options="[{value:'PKCS7',label:'PKCS7'},{value:'Zeros',label:'Zeros'},{value:'ANSIX923',label:'ANSIX923'},{value:'ISO10126',label:'ISO10126'},{value:'None',label:'None'}]" />
        </div>
        <div class="space-y-2">
            <label class="block text-xs font-medium text-[var(--text-secondary)]">输入</label>
            <textarea v-model="aesInput" placeholder="输入明文或密文..."
                class="min-h-32 w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none resize-y hover:border-[var(--border-strong)] focus:border-[var(--border-focus)]"
            ></textarea>
        </div>
        <div class="flex gap-2">
            <FButton type="primary" size="sm" @click="aesEncrypt">加密</FButton>
            <FButton type="default" size="sm" @click="aesDecrypt">解密</FButton>
        </div>
        <div class="space-y-2">
            <div class="flex items-center justify-between">
                <label class="block text-xs font-medium text-[var(--text-secondary)]">输出</label>
                <CopyButton v-if="aesResult" :text="aesResult" />
            </div>
            <textarea v-model="aesResult" readonly placeholder="结果将在此显示..."
                class="min-h-32 w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none resize-y"
            ></textarea>
        </div>
    </div>
    `,
    data() {
        return {
            aesKey: '', aesIv: '', aesInput: '', aesResult: '', aesMode: 'CBC', aesPadding: 'PKCS7'
        };
    },
    methods: {
        async aesEncrypt() {
            try {
                const res = await api('POST', '/encryption/aes/encrypt', { plaintext: this.aesInput, key: this.aesKey, iv: this.aesIv || null, mode: this.aesMode, padding: this.aesPadding });
                this.aesResult = res.data;
            } catch(e) { alert('加密失败: ' + e.message); }
        },
        async aesDecrypt() {
            try {
                const res = await api('POST', '/encryption/aes/decrypt', { ciphertext: this.aesInput, key: this.aesKey, iv: this.aesIv || null, mode: this.aesMode, padding: this.aesPadding });
                this.aesResult = res.data;
            } catch(e) { alert('解密失败: ' + e.message); }
        },
        refresh() {
            this.aesKey = ''; this.aesIv = ''; this.aesInput = ''; this.aesResult = ''; this.aesMode = 'CBC'; this.aesPadding = 'PKCS7';
        }
    }
};
