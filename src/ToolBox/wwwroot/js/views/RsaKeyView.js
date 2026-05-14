import { FInput } from '../components/FInput.js';

const { ref, onMounted } = Vue;

export const RsaKeyView = {
    components: { FInput },
    template: `
    <div class="h-full flex flex-col gap-4 p-4">
        <div class="flex-none">
            <div class="hidden lg:flex gap-1 border-b border-[var(--border-subtle)] pb-2">
                <button v-for="t in rsaTabs" :key="t.key" @click="rsaTab = t.key"
                    :class="['px-3 py-1.5 text-xs rounded transition-colors',
                        rsaTab === t.key ? 'bg-[var(--accent)] text-[var(--text-inverse)]' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]']">
                    {{ t.label }}
                </button>
            </div>
            <div class="lg:hidden">
                <label class="block text-xs font-medium text-[var(--text-secondary)] mb-1">选择操作</label>
                <FSingleSelect v-model="rsaTab" :options="rsaTabs.map(t => ({value: t.key, label: t.label}))"></FSingleSelect>
            </div>
        </div>

        <div v-if="rsaTab === 'generate'" class="flex-1 min-h-0 bg-[var(--bg-surface)] rounded-lg border border-[var(--border-subtle)] p-4 flex flex-col gap-3">
            <div class="flex flex-col lg:flex-row lg:items-center gap-3">
                <label class="text-xs text-[var(--text-secondary)]">密钥长度</label>
                <FSingleSelect v-model="rsaKeySize" :options="[{value:2048,label:'2048'},{value:4096,label:'4096'}]"></FSingleSelect>
                <FButton type="primary" @click="rsaGenerate">生成密钥对</FButton>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-3 flex-1 min-h-0">
                <div class="flex flex-col gap-2 flex-1 min-h-0">
                    <div class="flex items-center justify-between">
                        <label class="block text-xs font-medium text-[var(--text-secondary)]">私钥</label>
                        <CopyButton v-if="rsaKeys.privateKey" :text="rsaKeys.privateKey"></CopyButton>
                    </div>
                    <textarea v-model="rsaKeys.privateKey" readonly placeholder="私钥..."
                        class="flex-1 min-h-0 px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none resize-none"></textarea>
                </div>
                <div class="flex flex-col gap-2 flex-1 min-h-0">
                    <div class="flex items-center justify-between">
                        <label class="block text-xs font-medium text-[var(--text-secondary)]">公钥</label>
                        <CopyButton v-if="rsaKeys.publicKey" :text="rsaKeys.publicKey"></CopyButton>
                    </div>
                    <textarea v-model="rsaKeys.publicKey" readonly placeholder="公钥..."
                        class="flex-1 min-h-0 px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none resize-none"></textarea>
                </div>
            </div>
        </div>

        <div v-if="rsaTab === 'compare'" class="flex-1 min-h-0 bg-[var(--bg-surface)] rounded-lg border border-[var(--border-subtle)] p-4 flex flex-col gap-3">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-3 flex-1 min-h-0">
                <div class="flex flex-col gap-2 flex-1 min-h-0">
                    <label class="block text-xs font-medium text-[var(--text-secondary)]">私钥</label>
                    <textarea v-model="comparePrivate" placeholder="粘贴PEM私钥..."
                        class="flex-1 min-h-0 px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none resize-none placeholder:text-[var(--text-tertiary)] hover:border-[var(--border-strong)] focus:border-[var(--border-focus)]"></textarea>
                </div>
                <div class="flex flex-col gap-2 flex-1 min-h-0">
                    <label class="block text-xs font-medium text-[var(--text-secondary)]">公钥</label>
                    <textarea v-model="comparePublic" placeholder="粘贴PEM公钥..."
                        class="flex-1 min-h-0 px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none resize-none placeholder:text-[var(--text-tertiary)] hover:border-[var(--border-strong)] focus:border-[var(--border-focus)]"></textarea>
                </div>
            </div>
            <FButton type="primary" @click="rsaCompare">比对</FButton>
            <div class="px-4 py-3 border rounded flex items-center justify-center flex-shrink-0"
                :class="compareResult === null ? 'bg-[var(--bg-base)] border-[var(--border-subtle)]' : (compareResult ? 'bg-[var(--success)]/10 border-[var(--success)]/30' : 'bg-[var(--danger)]/10 border-[var(--danger)]/30')">
                <span v-if="compareResult === null" class="text-xs text-[var(--text-tertiary)]">点击比对按钮查看结果</span>
                <span v-else :class="compareResult ? 'text-[var(--success)]' : 'text-[var(--danger)]'" class="text-sm font-medium">
                    {{ compareResult ? '✓ 密钥匹配' : '✗ 密钥不匹配' }}
                </span>
            </div>
        </div>

        <div v-if="rsaTab === 'convert'" class="flex-1 min-h-0 bg-[var(--bg-surface)] rounded-lg border border-[var(--border-subtle)] p-4 flex flex-col gap-3">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-3 flex-1 min-h-0">
                <div class="flex flex-col gap-2 flex-1 min-h-0">
                    <label class="block text-xs font-medium text-[var(--text-secondary)]">PEM密钥</label>
                    <textarea v-model="convertPem" placeholder="粘贴PEM密钥..."
                        class="flex-1 min-h-0 px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none resize-none placeholder:text-[var(--text-tertiary)] hover:border-[var(--border-strong)] focus:border-[var(--border-focus)]"></textarea>
                </div>
                <div class="flex flex-col gap-2 flex-1 min-h-0">
                    <div class="flex items-center justify-between">
                        <label class="block text-xs font-medium text-[var(--text-secondary)]">转换结果</label>
                        <CopyButton v-if="convertResult" :text="convertResult"></CopyButton>
                    </div>
                    <textarea v-model="convertResult" readonly placeholder="转换结果..."
                        class="flex-1 min-h-0 px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none resize-none"></textarea>
                </div>
            </div>
            <div class="flex flex-col lg:flex-row lg:items-center gap-3">
                <label class="text-xs text-[var(--text-secondary)]">目标格式</label>
                <FSingleSelect v-model="convertTarget" :options="[{value:'pkcs1',label:'PKCS#1'},{value:'pkcs8',label:'PKCS#8'},{value:'public',label:'公钥(X.509)'}]"></FSingleSelect>
                <FButton type="primary" @click="rsaConvertPem">转换</FButton>
            </div>
        </div>

        <div v-if="rsaTab === 'xml'" class="flex-1 min-h-0 bg-[var(--bg-surface)] rounded-lg border border-[var(--border-subtle)] p-4 flex flex-col gap-3">
            <div class="flex gap-1 border-b border-[var(--border-subtle)] pb-2">
                <button @click="xmlConvertDirection = 'pem-to-xml'"
                    :class="['px-3 py-1.5 text-xs rounded transition-colors',
                        xmlConvertDirection === 'pem-to-xml' ? 'bg-[var(--accent)] text-[var(--text-inverse)]' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]']">
                    PEM → XML
                </button>
                <button @click="xmlConvertDirection = 'xml-to-pem'"
                    :class="['px-3 py-1.5 text-xs rounded transition-colors',
                        xmlConvertDirection === 'xml-to-pem' ? 'bg-[var(--accent)] text-[var(--text-inverse)]' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]']">
                    XML → PEM
                </button>
            </div>

            <div v-if="xmlConvertDirection === 'pem-to-xml'" class="flex flex-col gap-3 flex-1 min-h-0">
                <div class="flex flex-col gap-2 flex-1 min-h-0">
                    <label class="block text-xs font-medium text-[var(--text-secondary)]">PEM密钥</label>
                    <textarea v-model="rsaXmlPem" placeholder="粘贴PEM密钥..."
                        class="flex-1 min-h-0 px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none resize-none placeholder:text-[var(--text-tertiary)] hover:border-[var(--border-strong)] focus:border-[var(--border-focus)]"></textarea>
                </div>
                <div class="flex items-center gap-2">
                    <input type="checkbox" v-model="rsaXmlIncludePrivate" class="rounded border-[var(--border-subtle)] text-[var(--accent)]">
                    <span class="text-xs text-[var(--text-secondary)]">包含私钥参数</span>
                </div>
                <FButton type="primary" @click="rsaConvertToXml">转换为XML</FButton>
                <div class="flex flex-col gap-2 flex-1 min-h-0">
                    <div class="flex items-center justify-between">
                        <label class="block text-xs font-medium text-[var(--text-secondary)]">XML结果</label>
                        <CopyButton v-if="rsaXmlResult" :text="rsaXmlResult"></CopyButton>
                    </div>
                    <textarea v-model="rsaXmlResult" readonly placeholder="XML结果..."
                        class="flex-1 min-h-0 px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none resize-none"></textarea>
                </div>
            </div>

            <div v-if="xmlConvertDirection === 'xml-to-pem'" class="flex flex-col gap-3 flex-1 min-h-0">
                <div class="flex flex-col gap-2 flex-1 min-h-0">
                    <label class="block text-xs font-medium text-[var(--text-secondary)]">XML密钥</label>
                    <textarea v-model="rsaXmlXml" placeholder="粘贴XML密钥..."
                        class="flex-1 min-h-0 px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none resize-none placeholder:text-[var(--text-tertiary)] hover:border-[var(--border-strong)] focus:border-[var(--border-focus)]"></textarea>
                    <div class="flex flex-col gap-2">
                        <label class="block text-xs font-medium text-[var(--text-secondary)]">目标格式</label>
                        <FSingleSelect v-model="rsaXmlTargetFormat" :options="[{value:'pkcs1',label:'PKCS#1'},{value:'pkcs8',label:'PKCS#8'},{value:'public',label:'公钥(X.509)'}]"></FSingleSelect>
                    </div>
                </div>
                <FButton type="primary" @click="rsaConvertFromXml">转换为PEM</FButton>
                <div class="flex flex-col gap-2 flex-1 min-h-0">
                    <div class="flex items-center justify-between">
                        <label class="block text-xs font-medium text-[var(--text-secondary)]">PEM结果</label>
                        <CopyButton v-if="rsaXmlFromXmlResult" :text="rsaXmlFromXmlResult"></CopyButton>
                    </div>
                    <textarea v-model="rsaXmlFromXmlResult" readonly placeholder="PEM结果..."
                        class="flex-1 min-h-0 px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none resize-none"></textarea>
                </div>
            </div>
        </div>

        <div v-if="rsaTab === 'password'" class="flex-1 min-h-0 bg-[var(--bg-surface)] rounded-lg border border-[var(--border-subtle)] p-4 flex flex-col gap-3">
            <div class="flex gap-1 border-b border-[var(--border-subtle)] pb-2">
                <button @click="passwordOperation = 'add'"
                    :class="['px-3 py-1.5 text-xs rounded transition-colors',
                        passwordOperation === 'add' ? 'bg-[var(--accent)] text-[var(--text-inverse)]' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]']">
                    添加密码
                </button>
                <button @click="passwordOperation = 'remove'"
                    :class="['px-3 py-1.5 text-xs rounded transition-colors',
                        passwordOperation === 'remove' ? 'bg-[var(--accent)] text-[var(--text-inverse)]' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]']">
                    移除密码
                </button>
            </div>

            <div v-if="passwordOperation === 'add'" class="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-3">
                <div class="flex flex-col gap-2 flex-1 min-h-0">
                    <label class="block text-xs font-medium text-[var(--text-secondary)]">PEM密钥</label>
                    <textarea v-model="rsaPasswordPem" placeholder="粘贴PEM密钥..."
                        class="flex-1 min-h-0 px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none resize-none placeholder:text-[var(--text-tertiary)] hover:border-[var(--border-strong)] focus:border-[var(--border-focus)]"></textarea>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div class="flex flex-col gap-2">
                            <label class="block text-xs font-medium text-[var(--text-secondary)]">密码</label>
                            <FInput v-model="rsaPasswordPassword" placeholder="输入密码"></FInput>
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="block text-xs font-medium text-[var(--text-secondary)]">加密类型</label>
                            <FSingleSelect v-model="rsaPasswordTargetEncryptedType" :options="[{value:'EncryptedPkcs8PrivateKey',label:'Encrypted PKCS#8'},{value:'EncryptedPkcs1PrivateKey',label:'Encrypted PKCS#1'}]"></FSingleSelect>
                        </div>
                    </div>
                    <div v-if="rsaPasswordTargetEncryptedType==='EncryptedPkcs1PrivateKey'" class="flex flex-col gap-2">
                        <label class="block text-xs font-medium text-[var(--text-secondary)]">算法</label>
                        <FSingleSelect v-model="rsaPasswordAlgorithm" :options="[{value:'AES-256-CBC',label:'AES-256-CBC'},{value:'DES-EDE3-CBC',label:'DES-EDE3-CBC'}]"></FSingleSelect>
                    </div>
                    <FButton type="primary" @click="rsaAddPassword">添加密码</FButton>
                </div>
                <div class="flex flex-col gap-2 flex-1 min-h-0">
                    <div class="flex items-center justify-between">
                        <label class="block text-xs font-medium text-[var(--text-secondary)]">加密后的密钥</label>
                        <CopyButton v-if="rsaPasswordResult" :text="rsaPasswordResult"></CopyButton>
                    </div>
                    <textarea v-model="rsaPasswordResult" readonly placeholder="加密后的密钥..."
                        class="flex-1 min-h-0 px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none resize-none"></textarea>
                </div>
            </div>

            <div v-if="passwordOperation === 'remove'" class="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-3">
                <div class="flex flex-col gap-2 flex-1 min-h-0">
                    <label class="block text-xs font-medium text-[var(--text-secondary)]">加密的PEM密钥</label>
                    <textarea v-model="rsaRemoveEncryptedPem" placeholder="粘贴加密的PEM密钥..."
                        class="flex-1 min-h-0 px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none resize-none placeholder:text-[var(--text-tertiary)] hover:border-[var(--border-strong)] focus:border-[var(--border-focus)]"></textarea>
                    <div class="flex flex-col gap-2">
                        <label class="block text-xs font-medium text-[var(--text-secondary)]">密码</label>
                        <FInput v-model="rsaRemovePwd" placeholder="输入密码"></FInput>
                    </div>
                    <FButton type="primary" @click="rsaDoRemovePassword">移除密码</FButton>
                </div>
                <div class="flex flex-col gap-2 flex-1 min-h-0">
                    <div class="flex items-center justify-between">
                        <label class="block text-xs font-medium text-[var(--text-secondary)]">解密后的密钥</label>
                        <CopyButton v-if="rsaRemoveResult" :text="rsaRemoveResult"></CopyButton>
                    </div>
                    <textarea v-model="rsaRemoveResult" readonly placeholder="解密后的密钥..."
                        class="flex-1 min-h-0 px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none resize-none"></textarea>
                </div>
            </div>
        </div>
    </div>
    `,
    setup() {
        const rsaTab = ref('generate');
        const rsaTabs = [
            { key: 'generate', label: '生成密钥' },
            { key: 'compare', label: '密钥比对' },
            { key: 'convert', label: '格式转换' },
            { key: 'xml', label: 'XML转换' },
            { key: 'password', label: '密码操作' }
        ];
        const rsaKeySize = ref(2048);
        const rsaKeys = ref({ publicKey: '', privateKey: '' });
        const comparePublic = ref('');
        const comparePrivate = ref('');
        const compareResult = ref(null);
        const convertPem = ref('');
        const convertTarget = ref('pkcs8');
        const convertResult = ref('');
        const xmlConvertDirection = ref('pem-to-xml');
        const passwordOperation = ref('add');
        const rsaXmlPem = ref('');
        const rsaXmlIncludePrivate = ref(false);
        const rsaXmlResult = ref('');
        const rsaXmlXml = ref('');
        const rsaXmlTargetFormat = ref('pkcs8');
        const rsaXmlFromXmlResult = ref('');
        const rsaPasswordPem = ref('');
        const rsaPasswordPassword = ref('');
        const rsaPasswordTargetEncryptedType = ref('EncryptedPkcs8PrivateKey');
        const rsaPasswordAlgorithm = ref('AES-256-CBC');
        const rsaPasswordResult = ref('');
        const rsaRemoveEncryptedPem = ref('');
        const rsaRemovePwd = ref('');
        const rsaRemoveResult = ref('');

        const rsaGenerate = async () => {
            try {
                const res = await api('POST', '/encryption/rsa/generate', { keySize: rsaKeySize.value });
                rsaKeys.value = res.data;
            } catch (e) { alert('生成失败: ' + e.message); }
        };

        const rsaCompare = async () => {
            try {
                const res = await api('POST', '/encryption/rsa/compare', { privateKey: comparePrivate.value, publicKey: comparePublic.value });
                compareResult.value = res.data;
            } catch (e) { compareResult.value = false; }
        };

        const rsaConvertPem = async () => {
            try {
                const res = await api('POST', '/encryption/rsa/convert-pem', { pem: convertPem.value, targetFormat: convertTarget.value });
                convertResult.value = res.data;
            } catch (e) { alert('转换失败: ' + e.message); }
        };

        const rsaConvertToXml = async () => {
            try {
                const res = await api('POST', '/encryption/rsa/convert-to-xml', { pem: rsaXmlPem.value, includePrivateParams: rsaXmlIncludePrivate.value });
                rsaXmlResult.value = res.data;
            } catch (e) { alert('转换失败: ' + e.message); }
        };

        const rsaConvertFromXml = async () => {
            try {
                const res = await api('POST', '/encryption/rsa/convert-from-xml', { xml: rsaXmlXml.value, targetFormat: rsaXmlTargetFormat.value });
                rsaXmlFromXmlResult.value = res.data;
            } catch (e) { alert('转换失败: ' + e.message); }
        };

        const rsaAddPassword = async () => {
            try {
                const res = await api('POST', '/encryption/rsa/add-password', { pem: rsaPasswordPem.value, password: rsaPasswordPassword.value, targetEncryptedType: rsaPasswordTargetEncryptedType.value, algorithm: rsaPasswordAlgorithm.value });
                rsaPasswordResult.value = res.data;
            } catch (e) { alert('添加密码失败: ' + e.message); }
        };

        const rsaDoRemovePassword = async () => {
            try {
                const res = await api('POST', '/encryption/rsa/remove-password', { pem: rsaRemoveEncryptedPem.value, password: rsaRemovePwd.value });
                rsaRemoveResult.value = res.data;
            } catch (e) { alert('移除密码失败: ' + e.message); }
        };

        const refresh = () => {
            rsaGenerate();
            comparePublic.value = '';
            comparePrivate.value = '';
            compareResult.value = null;
            convertPem.value = '';
            convertResult.value = '';
            xmlConvertDirection.value = 'pem-to-xml';
            passwordOperation.value = 'add';
            rsaXmlPem.value = '';
            rsaXmlIncludePrivate.value = false;
            rsaXmlResult.value = '';
            rsaXmlXml.value = '';
            rsaXmlTargetFormat.value = 'pkcs8';
            rsaXmlFromXmlResult.value = '';
            rsaPasswordPem.value = '';
            rsaPasswordPassword.value = '';
            rsaPasswordTargetEncryptedType.value = 'EncryptedPkcs8PrivateKey';
            rsaPasswordAlgorithm.value = 'AES-256-CBC';
            rsaPasswordResult.value = '';
            rsaRemoveEncryptedPem.value = '';
            rsaRemovePwd.value = '';
            rsaRemoveResult.value = '';
        };

        onMounted(() => {
            rsaGenerate();
        });

        return {
            rsaTab, rsaTabs, rsaKeySize, rsaKeys,
            comparePublic, comparePrivate, compareResult,
            convertPem, convertTarget, convertResult,
            xmlConvertDirection, passwordOperation,
            rsaXmlPem, rsaXmlIncludePrivate, rsaXmlResult,
            rsaXmlXml, rsaXmlTargetFormat, rsaXmlFromXmlResult,
            rsaPasswordPem, rsaPasswordPassword, rsaPasswordTargetEncryptedType, rsaPasswordAlgorithm, rsaPasswordResult,
            rsaRemoveEncryptedPem, rsaRemovePwd, rsaRemoveResult,
            rsaGenerate, rsaCompare, rsaConvertPem, rsaConvertToXml, rsaConvertFromXml,
            rsaAddPassword, rsaDoRemovePassword, refresh
        };
    }
};
