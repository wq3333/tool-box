const { ref } = Vue;

export const RsaView = {
    template: `
    <div class="h-full flex flex-col gap-4 p-4">
        <div class="flex-1 min-h-0 bg-[var(--bg-surface)] rounded-lg border border-[var(--border-subtle)] p-4 flex flex-col gap-3">
            <div class="flex flex-col gap-2 flex-none">
                <label class="block text-xs font-medium text-[var(--text-secondary)]">密钥</label>
                <textarea v-model="key" placeholder="粘贴公钥(加密)或私钥(解密)..."
                    class="px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none resize-none placeholder:text-[var(--text-tertiary)] hover:border-[var(--border-strong)] focus:border-[var(--border-focus)]" rows="3"></textarea>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 flex-none">
                <div class="flex flex-col gap-2">
                    <label class="block text-xs font-medium text-[var(--text-secondary)]">加密方式</label>
                    <FSingleSelect v-model="rsaEncoding" :options="[{value:'base64',label:'Base64'},{value:'hex',label:'Hex'}]"></FSingleSelect>
                </div>
                <div class="flex flex-col gap-2">
                    <label class="block text-xs font-medium text-[var(--text-secondary)]">填充方式</label>
                    <FSingleSelect v-model="rsaPadding" :options="[{value:'Pkcs1',label:'PKCS#1'},{value:'OaepSHA1',label:'OAEP SHA-1'},{value:'OaepSHA256',label:'OAEP SHA-256'},{value:'OaepSHA384',label:'OAEP SHA-384'},{value:'OaepSHA512',label:'OAEP SHA-512'}]"></FSingleSelect>
                </div>
            </div>
            <div class="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-3">
                <div class="flex flex-col gap-2 flex-1 min-h-0">
                    <div class="flex items-center justify-between">
                        <label class="block text-xs font-medium text-[var(--text-secondary)]">输入</label>
                        <div class="flex gap-1">
                            <button @click="fileInputEnc.click()" class="px-2 py-1 text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] rounded flex items-center gap-1">
                                <span>📁</span>文件
                            </button>
                            <input type="file" ref="fileInputEnc" @change="onFileEnc($event)" class="hidden">
                        </div>
                    </div>
                    <textarea v-model="input" placeholder="输入文本..."
                        class="flex-1 min-h-0 px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none resize-none placeholder:text-[var(--text-tertiary)] hover:border-[var(--border-strong)] focus:border-[var(--border-focus)]"></textarea>
                </div>
                <div class="flex flex-col gap-2 flex-1 min-h-0">
                    <div class="flex items-center justify-between">
                        <label class="block text-xs font-medium text-[var(--text-secondary)]">输出</label>
                        <CopyButton v-if="result" :text="result"></CopyButton>
                    </div>
                    <textarea v-model="result" readonly placeholder="结果..."
                        class="flex-1 min-h-0 px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none resize-none"></textarea>
                </div>
            </div>
            <div class="flex gap-2 flex-none">
                <FButton type="primary" @click="encrypt">加密</FButton>
                <FButton type="default" @click="decrypt">解密</FButton>
            </div>
        </div>
    </div>
    `,
    setup() {
        const key = ref('');
        const rsaEncoding = ref('base64');
        const rsaPadding = ref('Pkcs1');
        const input = ref('');
        const result = ref('');

        const encrypt = async () => {
            try {
                const res = await api('POST', '/encryption/rsa/encrypt', { text: input.value, pem: key.value, encoding: rsaEncoding.value, padding: rsaPadding.value });
                result.value = res.data;
            } catch(e) { alert('加密失败: ' + e.message); }
        };

        const decrypt = async () => {
            try {
                const res = await api('POST', '/encryption/rsa/decrypt', { cipherText: input.value, pem: key.value, encoding: rsaEncoding.value, padding: rsaPadding.value });
                result.value = res.data;
            } catch(e) { alert('解密失败: ' + e.message); }
        };

        const onFileEnc = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const text = await file.text();
            input.value = text;
        };

        const refresh = () => {
            key.value = '';
            rsaEncoding.value = 'base64';
            rsaPadding.value = 'Pkcs1';
            input.value = '';
            result.value = '';
        };

        return { key, rsaEncoding, rsaPadding, input, result, encrypt, decrypt, onFileEnc, refresh };
    }
};
