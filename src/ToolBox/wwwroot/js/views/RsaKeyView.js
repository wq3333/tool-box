export const RsaKeyView = {
    template: `
    <div class="space-y-3">
        <div class="hidden lg:flex gap-1 border-b border-[var(--border-subtle)] pb-2">
            <button v-for="t in rsaTabs" :key="t.key" @click="rsaTab = t.key"
                :class="['px-3 py-1.5 text-xs rounded transition-colors',
                         rsaTab === t.key ? 'bg-[var(--accent)]/10 text-[var(--accent)]' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]']">
                {{ t.label }}
            </button>
        </div>
        <div class="lg:hidden">
            <label class="block text-xs font-medium text-[var(--text-secondary)] mb-1">选择操作</label>
            <FSingleSelect v-model="rsaTab" :options="rsaTabs.map(t => ({ value: t.key, label: t.label }))" />
        </div>

        <div v-if="rsaTab === 'generate'" class="space-y-3">
            <div class="flex flex-col lg:items-center lg:flex-row gap-3">
                <label class="text-xs text-[var(--text-secondary)]">密钥长度:</label>
                <FSingleSelect v-model="rsaKeySize" :options="[{value:2048,label:'2048'},{value:4096,label:'4096'}]" />
                <FButton type="primary" size="sm" @click="rsaGenerate">生成密钥对</FButton>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <div class="space-y-2">
                    <div class="flex items-center gap-2">
                        <label class="block text-xs font-medium text-[var(--text-secondary)]">私钥</label>
                        <CopyButton v-if="rsaKeys.privateKey" :text="rsaKeys.privateKey" />
                    </div>
                    <textarea v-model="rsaKeys.privateKey" readonly placeholder="私钥..."
                        class="min-h-40 w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none resize-y"
                    ></textarea>
                </div>
                <div class="space-y-2">
                    <div class="flex items-center gap-2">
                        <label class="block text-xs font-medium text-[var(--text-secondary)]">公钥</label>
                        <CopyButton v-if="rsaKeys.publicKey" :text="rsaKeys.publicKey" />
                    </div>
                    <textarea v-model="rsaKeys.publicKey" readonly placeholder="公钥..."
                        class="min-h-40 w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none resize-y"
                    ></textarea>
                </div>
            </div>
        </div>

        <div v-if="rsaTab === 'compare'" class="space-y-3">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <div class="space-y-2">
                    <label class="block text-xs font-medium text-[var(--text-secondary)]">私钥</label>
                    <textarea v-model="comparePrivate" placeholder="粘贴PEM私钥..."
                        class="min-h-32 w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none resize-y hover:border-[var(--border-strong)] focus:border-[var(--border-focus)]"
                    ></textarea>
                </div>
                <div class="space-y-2">
                    <label class="block text-xs font-medium text-[var(--text-secondary)]">公钥</label>
                    <textarea v-model="comparePublic" placeholder="粘贴PEM公钥..."
                        class="min-h-32 w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none resize-y hover:border-[var(--border-strong)] focus:border-[var(--border-focus)]"
                    ></textarea>
                </div>
            </div>
            <FButton type="primary" size="sm" @click="rsaCompare">比对</FButton>
            <div class="px-4 py-3 border rounded flex items-center justify-center"
                :class="compareResult === null ? 'bg-[var(--bg-surface)] border-[var(--border-subtle)]' : (compareResult ? 'bg-[var(--success)]/10 border-[var(--success)]/30' : 'bg-[var(--danger)]/10 border-[var(--danger)]/30')">
                <span v-if="compareResult === null" class="text-xs text-[var(--text-tertiary)]">点击比对按钮查看结果</span>
                <span v-else :class="compareResult ? 'text-[var(--success)]' : 'text-[var(--danger)]'" class="text-sm font-medium">
                    {{ compareResult ? '✓ 密钥匹配' : '✗ 密钥不匹配' }}
                </span>
            </div>
        </div>

        <div v-if="rsaTab === 'convert'" class="space-y-3">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <div class="space-y-2">
                    <label class="block text-xs font-medium text-[var(--text-secondary)]">PEM密钥</label>
                    <textarea v-model="convertPem" placeholder="粘贴PEM密钥..."
                        class="min-h-32 w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none resize-y hover:border-[var(--border-strong)] focus:border-[var(--border-focus)]"
                    ></textarea>
                </div>
                <div class="space-y-2">
                    <div class="flex items-center justify-between">
                        <label class="block text-xs font-medium text-[var(--text-secondary)]">转换结果</label>
                        <CopyButton v-if="convertResult" :text="convertResult" />
                    </div>
                    <textarea v-model="convertResult" readonly placeholder="转换结果..."
                        class="min-h-32 w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none resize-y"
                    ></textarea>
                </div>
            </div>
            <div class="flex flex-col lg:flex-row lg:items-center gap-3">
                <label class="text-xs text-[var(--text-secondary)]">目标格式:</label>
                <FSingleSelect v-model="convertTarget" :options="[{value:'pkcs1',label:'PKCS#1'},{value:'pkcs8',label:'PKCS#8'},{value:'public',label:'公钥(X.509)'}]" />
                <FButton type="primary" size="sm" @click="rsaConvertPem">转换</FButton>
            </div>
        </div>

        <div v-if="rsaTab === 'xml'" class="space-y-3">
            <div class="flex gap-1 border-b border-[var(--border-subtle)] pb-2">
                <button @click="xmlConvertDirection = 'pem-to-xml'"
                    :class="['px-3 py-1.5 text-xs rounded transition-colors',
                             xmlConvertDirection === 'pem-to-xml' ? 'bg-[var(--accent)]/10 text-[var(--accent)]' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]']">
                    PEM → XML
                </button>
                <button @click="xmlConvertDirection = 'xml-to-pem'"
                    :class="['px-3 py-1.5 text-xs rounded transition-colors',
                             xmlConvertDirection === 'xml-to-pem' ? 'bg-[var(--accent)]/10 text-[var(--accent)]' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]']">
                    XML → PEM
                </button>
            </div>

            <div v-if="xmlConvertDirection === 'pem-to-xml'" class="space-y-3">
                <div class="space-y-2">
                    <label class="block text-xs font-medium text-[var(--text-secondary)]">PEM密钥</label>
                    <textarea v-model="rsaXmlPem" placeholder="粘贴PEM密钥..."
                        class="min-h-32 w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none resize-y hover:border-[var(--border-strong)] focus:border-[var(--border-focus)]"
                    ></textarea>
                </div>
                <div class="flex items-center gap-2">
                    <input type="checkbox" v-model="rsaXmlIncludePrivate" class="rounded border-[var(--border-subtle)] text-[var(--accent)]">
                    <span class="text-xs text-[var(--text-secondary)]">包含私钥参数</span>
                </div>
                <FButton type="primary" size="sm" @click="rsaConvertToXml">转换为XML</FButton>
                <div class="space-y-2">
                    <div class="flex items-center justify-between">
                        <label class="block text-xs font-medium text-[var(--text-secondary)]">XML结果</label>
                        <CopyButton v-if="rsaXmlResult" :text="rsaXmlResult" />
                    </div>
                    <textarea v-model="rsaXmlResult" readonly placeholder="XML结果..."
                        class="min-h-32 w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none resize-y break-all"
                    ></textarea>
                </div>
            </div>

            <div v-if="xmlConvertDirection === 'xml-to-pem'" class="space-y-3">
                <div class="space-y-2">
                    <label class="block text-xs font-medium text-[var(--text-secondary)]">XML密钥</label>
                    <textarea v-model="rsaXmlXml" placeholder="粘贴XML密钥..."
                        class="min-h-32 w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none resize-y hover:border-[var(--border-strong)] focus:border-[var(--border-focus)] break-all"
                    ></textarea>
                    <div class="space-y-2">
                        <label class="block text-xs font-medium text-[var(--text-secondary)]">目标格式</label>
                        <FSingleSelect v-model="rsaXmlTargetFormat" :options="[{value:'pkcs1',label:'PKCS#1'},{value:'pkcs8',label:'PKCS#8'},{value:'public',label:'公钥(X.509)'}]" />
                    </div>
                </div>
                <FButton type="primary" size="sm" @click="rsaConvertFromXml">转换为PEM</FButton>
                <div class="space-y-2">
                    <div class="flex items-center justify-between">
                        <label class="block text-xs font-medium text-[var(--text-secondary)]">PEM结果</label>
                        <CopyButton v-if="rsaXmlFromXmlResult" :text="rsaXmlFromXmlResult" />
                    </div>
                    <textarea v-model="rsaXmlFromXmlResult" readonly placeholder="PEM结果..."
                        class="min-h-32 w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none resize-y"
                    ></textarea>
                </div>
            </div>
        </div>

        <div v-if="rsaTab === 'password'" class="space-y-3">
            <div class="flex gap-1 border-b border-[var(--border-subtle)] pb-2">
                <button @click="passwordOperation = 'add'"
                    :class="['px-3 py-1.5 text-xs rounded transition-colors',
                             passwordOperation === 'add' ? 'bg-[var(--accent)]/10 text-[var(--accent)]' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]']">
                    添加密码
                </button>
                <button @click="passwordOperation = 'remove'"
                    :class="['px-3 py-1.5 text-xs rounded transition-colors',
                             passwordOperation === 'remove' ? 'bg-[var(--accent)]/10 text-[var(--accent)]' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]']">
                    移除密码
                </button>
            </div>

            <div v-if="passwordOperation === 'add'" class="space-y-3">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    <div class="space-y-2">
                        <label class="block text-xs font-medium text-[var(--text-secondary)]">PEM密钥</label>
                        <textarea v-model="rsaPasswordPem" placeholder="粘贴PEM密钥..."
                            class="min-h-32 w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none resize-y hover:border-[var(--border-strong)] focus:border-[var(--border-focus)]"
                        ></textarea>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div class="space-y-2">
                                <label class="block text-xs font-medium text-[var(--text-secondary)]">密码</label>
                                <input type="text" v-model="rsaPasswordPassword" placeholder="输入密码"
                                    class="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none placeholder:text-[var(--text-tertiary)] hover:border-[var(--border-strong)] focus:border-[var(--border-focus)]"
                                >
                            </div>
                            <div class="space-y-2">
                                <label class="block text-xs font-medium text-[var(--text-secondary)]">加密类型</label>
                                <FSingleSelect v-model="rsaPasswordTargetEncryptedType" :options="[{value:'EncryptedPkcs8PrivateKey',label:'Encrypted PKCS#8'},{value:'EncryptedPkcs1PrivateKey',label:'Encrypted PKCS#1'}]" />
                            </div>
                        </div>
                        <div v-if="rsaPasswordTargetEncryptedType==='EncryptedPkcs1PrivateKey'" class="space-y-2">
                            <label class="block text-xs font-medium text-[var(--text-secondary)]">算法</label>
                            <FSingleSelect v-model="rsaPasswordAlgorithm" :options="[{value:'AES-256-CBC',label:'AES-256-CBC'},{value:'DES-EDE3-CBC',label:'DES-EDE3-CBC'}]" />
                        </div>
                        <FButton type="primary" size="sm" @click="rsaAddPassword">添加密码</FButton>
                    </div>
                    <div class="space-y-2">
                        <div class="flex items-center justify-between">
                            <label class="block text-xs font-medium text-[var(--text-secondary)]">加密后的密钥</label>
                            <CopyButton v-if="rsaPasswordResult" :text="rsaPasswordResult" />
                        </div>
                        <textarea v-model="rsaPasswordResult" readonly placeholder="加密后的密钥..."
                            class="min-h-32 w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none resize-y"
                        ></textarea>
                    </div>
                </div>
            </div>

            <div v-if="passwordOperation === 'remove'" class="space-y-3">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    <div class="space-y-2">
                        <label class="block text-xs font-medium text-[var(--text-secondary)]">加密的PEM密钥</label>
                        <textarea v-model="rsaRemoveEncryptedPem" placeholder="粘贴加密的PEM密钥..."
                            class="min-h-32 w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none resize-y hover:border-[var(--border-strong)] focus:border-[var(--border-focus)]"
                        ></textarea>
                        <div class="space-y-2">
                            <label class="block text-xs font-medium text-[var(--text-secondary)]">密码</label>
                            <input type="text" v-model="rsaRemovePwd" placeholder="输入密码"
                                class="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none placeholder:text-[var(--text-tertiary)] hover:border-[var(--border-strong)] focus:border-[var(--border-focus)]"
                            >
                        </div>
                        <FButton type="primary" size="sm" @click="rsaDoRemovePassword">移除密码</FButton>
                    </div>
                    <div class="space-y-2">
                        <div class="flex items-center justify-between">
                            <label class="block text-xs font-medium text-[var(--text-secondary)]">解密后的密钥</label>
                            <CopyButton v-if="rsaRemoveResult" :text="rsaRemoveResult" />
                        </div>
                        <textarea v-model="rsaRemoveResult" readonly placeholder="解密后的密钥..."
                            class="min-h-32 w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none resize-y"
                        ></textarea>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            rsaTab: 'generate',
            rsaTabs: [
                { key: 'generate', label: '生成密钥' },
                { key: 'compare', label: '密钥比对' },
                { key: 'convert', label: '格式转换' },
                { key: 'xml', label: 'XML转换' },
                { key: 'password', label: '密码操作' }
            ],
            rsaKeySize: 2048,
            rsaKeys: { publicKey: '', privateKey: '' },
            comparePublic: '', comparePrivate: '', compareResult: null,
            convertPem: '', convertTarget: 'pkcs8', convertResult: '',
            xmlConvertDirection: 'pem-to-xml',
            passwordOperation: 'add',
            rsaXmlPem: '', rsaXmlIncludePrivate: false, rsaXmlPassword: '', rsaXmlResult: '',
            rsaXmlXml: '', rsaXmlTargetFormat: 'pkcs8', rsaXmlFromXmlResult: '',
            rsaPasswordPem: '', rsaPasswordPassword: '', rsaPasswordTargetEncryptedType: 'EncryptedPkcs8PrivateKey', rsaPasswordAlgorithm: 'AES-256-CBC', rsaPasswordResult: '',
            rsaRemoveEncryptedPem: '', rsaRemovePwd: '', rsaRemoveResult: ''
        };
    },
    mounted() {
        this.rsaGenerate();
    },
    methods: {
        async rsaGenerate() {
            try {
                const res = await api('POST', '/encryption/rsa/generate', { keySize: this.rsaKeySize });
                this.rsaKeys = res.data;
            } catch(e) { alert('生成失败: ' + e.message); }
        },
        async rsaCompare() {
            try {
                const res = await api('POST', '/encryption/rsa/compare', { privateKey: this.comparePrivate, publicKey: this.comparePublic });
                this.compareResult = res.data;
            } catch(e) { this.compareResult = false; }
        },
        async rsaConvertPem() {
            try {
                const res = await api('POST', '/encryption/rsa/convert-pem', { pem: this.convertPem, targetFormat: this.convertTarget });
                this.convertResult = res.data;
            } catch(e) { alert('转换失败: ' + e.message); }
        },
        async rsaConvertToXml() {
            try {
                const res = await api('POST', '/encryption/rsa/convert-to-xml', { pem: this.rsaXmlPem, includePrivateParams: this.rsaXmlIncludePrivate });
                this.rsaXmlResult = res.data;
            } catch(e) { alert('转换失败: ' + e.message); }
        },
        async rsaConvertFromXml() {
            try {
                const res = await api('POST', '/encryption/rsa/convert-from-xml', { xml: this.rsaXmlXml, targetFormat: this.rsaXmlTargetFormat });
                this.rsaXmlFromXmlResult = res.data;
            } catch(e) { alert('转换失败: ' + e.message); }
        },
        async rsaAddPassword() {
            try {
                const res = await api('POST', '/encryption/rsa/add-password', { pem: this.rsaPasswordPem, password: this.rsaPasswordPassword, targetEncryptedType: this.rsaPasswordTargetEncryptedType, algorithm: this.rsaPasswordAlgorithm });
                this.rsaPasswordResult = res.data;
            } catch(e) { alert('添加密码失败: ' + e.message); }
        },
        async rsaDoRemovePassword() {
            try {
                const res = await api('POST', '/encryption/rsa/remove-password', { pem: this.rsaRemoveEncryptedPem, password: this.rsaRemovePwd });
                this.rsaRemoveResult = res.data;
            } catch(e) { alert('移除密码失败: ' + e.message); }
        },
        refresh() {
            this.rsaGenerate();
            this.comparePublic = ''; this.comparePrivate = ''; this.compareResult = null;
            this.convertPem = ''; this.convertResult = '';
            this.xmlConvertDirection = 'pem-to-xml';
            this.passwordOperation = 'add';
            this.rsaXmlPem = ''; this.rsaXmlIncludePrivate = false; this.rsaXmlPassword = ''; this.rsaXmlResult = '';
            this.rsaXmlXml = ''; this.rsaXmlTargetFormat = 'pkcs8'; this.rsaXmlFromXmlResult = '';
            this.rsaPasswordPem = ''; this.rsaPasswordPassword = ''; this.rsaPasswordTargetEncryptedType = 'EncryptedPkcs8PrivateKey'; this.rsaPasswordAlgorithm = 'AES-256-CBC'; this.rsaPasswordResult = '';
            this.rsaRemoveEncryptedPem = ''; this.rsaRemovePwd = ''; this.rsaRemoveResult = '';
        }
    }
};
