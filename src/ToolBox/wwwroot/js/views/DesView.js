export const DesView = {
    template: `
    <div class="space-y-3">
        <div class="space-y-2">
            <label class="block text-xs font-medium text-[var(--text-secondary)]">密钥</label>
            <input type="text" v-model="desKey" placeholder="输入DES密钥"
                class="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none placeholder:text-[var(--text-tertiary)] hover:border-[var(--border-strong)] focus:border-[var(--border-focus)]"
            >
        </div>
        <div v-if="desMode !== 'ECB'" class="space-y-2">
            <label class="block text-xs font-medium text-[var(--text-secondary)]">IV(必需)</label>
            <input type="text" v-model="desIv" placeholder="输入IV"
                class="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none placeholder:text-[var(--text-tertiary)] hover:border-[var(--border-strong)] focus:border-[var(--border-focus)]"
            >
        </div>
        <div class="space-y-2">
            <label class="block text-xs font-medium text-[var(--text-secondary)]">模式</label>
            <FSingleSelect v-model="desMode" :options="[{value:'CBC',label:'CBC'},{value:'ECB',label:'ECB'},{value:'CFB',label:'CFB'}]" />
        </div>
        <div class="space-y-2">
            <label class="block text-xs font-medium text-[var(--text-secondary)]">填充</label>
            <FSingleSelect v-model="desPadding" :options="[{value:'PKCS7',label:'PKCS7'},{value:'Zeros',label:'Zeros'},{value:'ANSIX923',label:'ANSIX923'},{value:'ISO10126',label:'ISO10126'},{value:'None',label:'None'}]" />
        </div>
        <div class="space-y-2">
            <label class="block text-xs font-medium text-[var(--text-secondary)]">输入</label>
            <textarea v-model="desInput" placeholder="输入明文或密文..."
                class="min-h-32 w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none resize-y hover:border-[var(--border-strong)] focus:border-[var(--border-focus)]"
            ></textarea>
        </div>
        <div class="flex gap-2">
            <FButton type="primary" size="sm" @click="desEncrypt">加密</FButton>
            <FButton type="default" size="sm" @click="desDecrypt">解密</FButton>
        </div>
        <div class="space-y-2">
            <div class="flex items-center justify-between">
                <label class="block text-xs font-medium text-[var(--text-secondary)]">输出</label>
                <CopyButton v-if="desResult" :text="desResult" />
            </div>
            <textarea v-model="desResult" readonly placeholder="结果将在此显示..."
                class="min-h-32 w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none resize-y"
            ></textarea>
        </div>
    </div>
    `,
    data() {
        return {
            desKey: '', desIv: '', desInput: '', desResult: '', desMode: 'CBC', desPadding: 'PKCS7'
        };
    },
    methods: {
        async desEncrypt() {
            try {
                const res = await api('POST', '/encryption/des/encrypt', { plaintext: this.desInput, key: this.desKey, iv: this.desIv || null, mode: this.desMode, padding: this.desPadding });
                this.desResult = res.data;
            } catch(e) { alert('加密失败: ' + e.message); }
        },
        async desDecrypt() {
            try {
                const res = await api('POST', '/encryption/des/decrypt', { ciphertext: this.desInput, key: this.desKey, iv: this.desIv || null, mode: this.desMode, padding: this.desPadding });
                this.desResult = res.data;
            } catch(e) { alert('解密失败: ' + e.message); }
        },
        refresh() {
            this.desKey = ''; this.desIv = ''; this.desInput = ''; this.desResult = ''; this.desMode = 'CBC'; this.desPadding = 'PKCS7';
        }
    }
};
