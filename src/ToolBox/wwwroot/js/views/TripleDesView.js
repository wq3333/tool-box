export const TripleDesView = {
    template: `
    <div class="space-y-3">
        <div class="space-y-2">
            <label class="block text-xs font-medium text-[var(--text-secondary)]">密钥</label>
            <input type="text" v-model="tripleDesKey" placeholder="输入3DES密钥"
                class="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none placeholder:text-[var(--text-tertiary)] hover:border-[var(--border-strong)] focus:border-[var(--border-focus)]"
            >
        </div>
        <div v-if="tripleDesMode !== 'ECB'" class="space-y-2">
            <label class="block text-xs font-medium text-[var(--text-secondary)]">IV(必需)</label>
            <input type="text" v-model="tripleDesIv" placeholder="输入IV"
                class="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none placeholder:text-[var(--text-tertiary)] hover:border-[var(--border-strong)] focus:border-[var(--border-focus)]"
            >
        </div>
        <div class="space-y-2">
            <label class="block text-xs font-medium text-[var(--text-secondary)]">模式</label>
            <FSingleSelect v-model="tripleDesMode" :options="[{value:'CBC',label:'CBC'},{value:'ECB',label:'ECB'},{value:'CFB',label:'CFB'}]" />
        </div>
        <div class="space-y-2">
            <label class="block text-xs font-medium text-[var(--text-secondary)]">填充</label>
            <FSingleSelect v-model="tripleDesPadding" :options="[{value:'PKCS7',label:'PKCS7'},{value:'Zeros',label:'Zeros'},{value:'ANSIX923',label:'ANSIX923'},{value:'ISO10126',label:'ISO10126'},{value:'None',label:'None'}]" />
        </div>
        <div class="space-y-2">
            <label class="block text-xs font-medium text-[var(--text-secondary)]">输入</label>
            <textarea v-model="tripleDesInput" placeholder="输入明文或密文..."
                class="min-h-32 w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none resize-y hover:border-[var(--border-strong)] focus:border-[var(--border-focus)]"
            ></textarea>
        </div>
        <div class="flex gap-2">
            <FButton type="primary" size="sm" @click="tripleDesEncrypt">加密</FButton>
            <FButton type="default" size="sm" @click="tripleDesDecrypt">解密</FButton>
        </div>
        <div class="space-y-2">
            <div class="flex items-center justify-between">
                <label class="block text-xs font-medium text-[var(--text-secondary)]">输出</label>
                <CopyButton v-if="tripleDesResult" :text="tripleDesResult" />
            </div>
            <textarea v-model="tripleDesResult" readonly placeholder="结果将在此显示..."
                class="min-h-32 w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none resize-y"
            ></textarea>
        </div>
    </div>
    `,
    data() {
        return {
            tripleDesKey: '', tripleDesIv: '', tripleDesInput: '', tripleDesResult: '', tripleDesMode: 'CBC', tripleDesPadding: 'PKCS7'
        };
    },
    methods: {
        async tripleDesEncrypt() {
            try {
                const res = await api('POST', '/encryption/tripledes/encrypt', { plaintext: this.tripleDesInput, key: this.tripleDesKey, iv: this.tripleDesIv || null, mode: this.tripleDesMode, padding: this.tripleDesPadding });
                this.tripleDesResult = res.data;
            } catch(e) { alert('加密失败: ' + e.message); }
        },
        async tripleDesDecrypt() {
            try {
                const res = await api('POST', '/encryption/tripledes/decrypt', { ciphertext: this.tripleDesInput, key: this.tripleDesKey, iv: this.tripleDesIv || null, mode: this.tripleDesMode, padding: this.tripleDesPadding });
                this.tripleDesResult = res.data;
            } catch(e) { alert('解密失败: ' + e.message); }
        },
        refresh() {
            this.tripleDesKey = ''; this.tripleDesIv = ''; this.tripleDesInput = ''; this.tripleDesResult = ''; this.tripleDesMode = 'CBC'; this.tripleDesPadding = 'PKCS7';
        }
    }
};
