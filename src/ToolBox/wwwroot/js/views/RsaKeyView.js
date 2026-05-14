import { IconRefresh, IconDiff, IconArrowRight, IconUser, IconLockAlt } from '../components/icon.js';
import { toast } from '../components/Toast.js';

const { ref, onMounted } = Vue;

export const RsaKeyView = {
    components: { IconRefresh, IconDiff, IconArrowRight, IconUser, IconLockAlt },
    template: `
    <div class="h-full flex flex-col gap-4 p-4 bg-gradient-to-br from-slate-50 to-slate-100">
        <div class="flex-none">
            <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-1">
                <div class="flex flex-wrap gap-1">
                    <button v-for="t in rsaTabs" :key="t.key" @click="rsaTab = t.key"
                        :class="['px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200',
                                rsaTab === t.key ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100']">
                        {{ t.label }}
                    </button>
                </div>
            </div>
        </div>

        <div v-if="rsaTab === 'generate'" class="flex-1 min-h-0 bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col gap-4">
            <div class="flex flex-col lg:flex-row lg:items-center gap-4">
                <label class="text-sm font-semibold text-slate-700 whitespace-nowrap">密钥长度</label>
                <FSingleSelect v-model="rsaKeySize" :options="[{value:2048,label:'2048'},{value:4096,label:'4096'}]"></FSingleSelect>
                <FButton type="primary" @click="rsaGenerate" class="flex-1 lg:flex-none">
                    <IconRefresh :size="20" />
                    生成密钥对
                </FButton>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
                <div class="flex flex-col gap-3 flex-1 min-h-0">
                    <div class="flex items-center justify-between">
                        <label class="text-sm font-semibold text-slate-700">私钥</label>
                        <CopyButton v-if="rsaKeys.privateKey" :text="rsaKeys.privateKey"></CopyButton>
                    </div>
                    <textarea v-model="rsaKeys.privateKey" readonly placeholder="私钥..."
                        class="flex-1 min-h-0 px-4 py-3 bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-700 outline-none resize-none"></textarea>
                </div>
                <div class="flex flex-col gap-3 flex-1 min-h-0">
                    <div class="flex items-center justify-between">
                        <label class="text-sm font-semibold text-slate-700">公钥</label>
                        <CopyButton v-if="rsaKeys.publicKey" :text="rsaKeys.publicKey"></CopyButton>
                    </div>
                    <textarea v-model="rsaKeys.publicKey" readonly placeholder="公钥..."
                        class="flex-1 min-h-0 px-4 py-3 bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-700 outline-none resize-none"></textarea>
                </div>
            </div>
        </div>

        <div v-if="rsaTab === 'compare'" class="flex-1 min-h-0 bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col gap-4">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
                <div class="flex flex-col gap-3 flex-1 min-h-0">
                    <label class="text-sm font-semibold text-slate-700">私钥</label>
                    <textarea v-model="comparePrivate" placeholder="粘贴PEM私钥..."
                        class="flex-1 min-h-0 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-700 outline-none resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400"></textarea>
                </div>
                <div class="flex flex-col gap-3 flex-1 min-h-0">
                    <label class="text-sm font-semibold text-slate-700">公钥</label>
                    <textarea v-model="comparePublic" placeholder="粘贴PEM公钥..."
                        class="flex-1 min-h-0 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-700 outline-none resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400"></textarea>
                </div>
            </div>
            <FButton type="primary" @click="rsaCompare" class="w-full py-3 text-base">
                <IconDiff :size="20" />
                比对
            </FButton>
            <div class="px-4 py-3 border rounded-lg flex items-center justify-center flex-shrink-0"
                :class="compareResult === null ? 'bg-slate-50 border-slate-200' : (compareResult ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200')">
                <span v-if="compareResult === null" class="text-sm text-slate-500">点击比对按钮查看结果</span>
                <span v-else :class="compareResult ? 'text-emerald-600' : 'text-red-600'" class="text-sm font-medium">
                    {{ compareResult ? '✓ 密钥匹配' : '✗ 密钥不匹配' }}
                </span>
            </div>
        </div>

        <div v-if="rsaTab === 'convert'" class="flex-1 min-h-0 bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col gap-4">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
                <div class="flex flex-col gap-3 flex-1 min-h-0">
                    <label class="text-sm font-semibold text-slate-700">PEM密钥</label>
                    <textarea v-model="convertPem" placeholder="粘贴PEM密钥..."
                        class="flex-1 min-h-0 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-700 outline-none resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400"></textarea>
                </div>
                <div class="flex flex-col gap-3 flex-1 min-h-0">
                    <div class="flex items-center justify-between">
                        <label class="text-sm font-semibold text-slate-700">转换结果</label>
                        <CopyButton v-if="convertResult" :text="convertResult"></CopyButton>
                    </div>
                    <textarea v-model="convertResult" readonly placeholder="转换结果..."
                        class="flex-1 min-h-0 px-4 py-3 bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-700 outline-none resize-none"></textarea>
                </div>
            </div>
            <div class="flex flex-col lg:flex-row lg:items-center gap-4">
                <label class="text-sm font-semibold text-slate-700 whitespace-nowrap">目标格式</label>
                <FSingleSelect v-model="convertTarget" :options="[{value:'pkcs1',label:'PKCS#1'},{value:'pkcs8',label:'PKCS#8'},{value:'public',label:'公钥(X.509)'}]"></FSingleSelect>
                <FButton type="primary" @click="rsaConvertPem" class="flex-1 lg:flex-none">
                    <IconArrowRight :size="20" />
                    转换
                </FButton>
            </div>
        </div>

        <div v-if="rsaTab === 'xml'" class="flex-1 min-h-0 bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col gap-4">
            <div class="flex gap-2 border-b border-slate-200 pb-3">
                <button @click="xmlConvertDirection = 'pem-to-xml'"
                    :class="['px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200',
                            xmlConvertDirection === 'pem-to-xml' ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100']">
                    PEM → XML
                </button>
                <button @click="xmlConvertDirection = 'xml-to-pem'"
                    :class="['px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200',
                            xmlConvertDirection === 'xml-to-pem' ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100']">
                    XML → PEM
                </button>
            </div>

            <div v-if="xmlConvertDirection === 'pem-to-xml'" class="flex flex-col gap-4 flex-1 min-h-0">
                <div class="flex flex-col gap-3 flex-1 min-h-0">
                    <label class="text-sm font-semibold text-slate-700">PEM密钥</label>
                    <textarea v-model="rsaXmlPem" placeholder="粘贴PEM密钥..."
                        class="flex-1 min-h-0 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-700 outline-none resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400"></textarea>
                </div>
                <div class="flex items-center gap-2">
                    <input type="checkbox" v-model="rsaXmlIncludePrivate" class="w-4 h-4 rounded border-slate-300 text-blue-500 focus:ring-blue-500">
                    <span class="text-sm text-slate-600">包含私钥参数</span>
                </div>
                <FButton type="primary" @click="rsaConvertToXml" class="w-full py-3 text-base">
                    <IconArrowRight :size="20" />
                    转换为XML
                </FButton>
                <div class="flex flex-col gap-3 flex-1 min-h-0">
                    <div class="flex items-center justify-between">
                        <label class="text-sm font-semibold text-slate-700">XML结果</label>
                        <CopyButton v-if="rsaXmlResult" :text="rsaXmlResult"></CopyButton>
                    </div>
                    <textarea v-model="rsaXmlResult" readonly placeholder="XML结果..."
                        class="flex-1 min-h-0 px-4 py-3 bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-700 outline-none resize-none"></textarea>
                </div>
            </div>

            <div v-if="xmlConvertDirection === 'xml-to-pem'" class="flex flex-col gap-4 flex-1 min-h-0">
                <div class="flex flex-col gap-3 flex-1 min-h-0">
                    <label class="text-sm font-semibold text-slate-700">XML密钥</label>
                    <textarea v-model="rsaXmlXml" placeholder="粘贴XML密钥..."
                        class="flex-1 min-h-0 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-700 outline-none resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400"></textarea>
                    <div class="flex flex-col gap-2">
                        <label class="text-sm font-semibold text-slate-700">目标格式</label>
                        <FSingleSelect v-model="rsaXmlTargetFormat" :options="[{value:'pkcs1',label:'PKCS#1'},{value:'pkcs8',label:'PKCS#8'},{value:'public',label:'公钥(X.509)'}]"></FSingleSelect>
                    </div>
                </div>
                <FButton type="primary" @click="rsaConvertFromXml" class="w-full py-3 text-base">
                    <IconArrowRight :size="20" />
                    转换为PEM
                </FButton>
                <div class="flex flex-col gap-3 flex-1 min-h-0">
                    <div class="flex items-center justify-between">
                        <label class="text-sm font-semibold text-slate-700">PEM结果</label>
                        <CopyButton v-if="rsaXmlFromXmlResult" :text="rsaXmlFromXmlResult"></CopyButton>
                    </div>
                    <textarea v-model="rsaXmlFromXmlResult" readonly placeholder="PEM结果..."
                        class="flex-1 min-h-0 px-4 py-3 bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-700 outline-none resize-none"></textarea>
                </div>
            </div>
        </div>

        <div v-if="rsaTab === 'password'" class="flex-1 min-h-0 bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col gap-4">
            <div class="flex gap-2 border-b border-slate-200 pb-3">
                <button @click="passwordOperation = 'add'"
                    :class="['px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200',
                            passwordOperation === 'add' ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100']">
                    添加密码
                </button>
                <button @click="passwordOperation = 'remove'"
                    :class="['px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200',
                            passwordOperation === 'remove' ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100']">
                    移除密码
                </button>
            </div>

            <div v-if="passwordOperation === 'add'" class="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div class="flex flex-col gap-4 flex-1 min-h-0">
                    <div class="flex flex-col gap-3 flex-1 min-h-0">
                        <label class="text-sm font-semibold text-slate-700">PEM密钥</label>
                        <textarea v-model="rsaPasswordPem" placeholder="粘贴PEM密钥..."
                            class="flex-1 min-h-0 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-700 outline-none resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400"></textarea>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div class="flex flex-col gap-2">
                            <label class="text-sm font-semibold text-slate-700">密码</label>
                            <FInput v-model="rsaPasswordPassword" placeholder="输入密码"></FInput>
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="text-sm font-semibold text-slate-700">加密类型</label>
                            <FSingleSelect v-model="rsaPasswordTargetEncryptedType" :options="[{value:'EncryptedPkcs8PrivateKey',label:'Encrypted PKCS#8'},{value:'EncryptedPkcs1PrivateKey',label:'Encrypted PKCS#1'}]"></FSingleSelect>
                        </div>
                    </div>
                    <div v-if="rsaPasswordTargetEncryptedType==='EncryptedPkcs1PrivateKey'" class="flex flex-col gap-2">
                        <label class="text-sm font-semibold text-slate-700">算法</label>
                        <FSingleSelect v-model="rsaPasswordAlgorithm" :options="[{value:'AES-256-CBC',label:'AES-256-CBC'},{value:'DES-EDE3-CBC',label:'DES-EDE3-CBC'}]"></FSingleSelect>
                    </div>
                    <FButton type="primary" @click="rsaAddPassword" class="w-full py-3 text-base">
                        <IconLockAlt :size="20" />
                        添加密码
                    </FButton>
                </div>
                <div class="flex flex-col gap-3 flex-1 min-h-0">
                    <div class="flex items-center justify-between">
                        <label class="text-sm font-semibold text-slate-700">加密后的密钥</label>
                        <CopyButton v-if="rsaPasswordResult" :text="rsaPasswordResult"></CopyButton>
                    </div>
                    <textarea v-model="rsaPasswordResult" readonly placeholder="加密后的密钥..."
                        class="flex-1 min-h-0 px-4 py-3 bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-700 outline-none resize-none"></textarea>
                </div>
            </div>

            <div v-if="passwordOperation === 'remove'" class="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div class="flex flex-col gap-4 flex-1 min-h-0">
                    <div class="flex flex-col gap-3 flex-1 min-h-0">
                        <label class="text-sm font-semibold text-slate-700">加密的PEM密钥</label>
                        <textarea v-model="rsaRemoveEncryptedPem" placeholder="粘贴加密的PEM密钥..."
                            class="flex-1 min-h-0 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-700 outline-none resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400"></textarea>
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="text-sm font-semibold text-slate-700">密码</label>
                        <FInput v-model="rsaRemovePwd" placeholder="输入密码"></FInput>
                    </div>
                    <FButton type="primary" @click="rsaDoRemovePassword" class="w-full py-3 text-base">
                        <IconUser :size="20" />
                        移除密码
                    </FButton>
                </div>
                <div class="flex flex-col gap-3 flex-1 min-h-0">
                    <div class="flex items-center justify-between">
                        <label class="text-sm font-semibold text-slate-700">解密后的密钥</label>
                        <CopyButton v-if="rsaRemoveResult" :text="rsaRemoveResult"></CopyButton>
                    </div>
                    <textarea v-model="rsaRemoveResult" readonly placeholder="解密后的密钥..."
                        class="flex-1 min-h-0 px-4 py-3 bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-700 outline-none resize-none"></textarea>
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
            } catch (e) { toast.error('生成失败: ' + e.message); }
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
            } catch (e) { toast.error('转换失败: ' + e.message); }
        };

        const rsaConvertToXml = async () => {
            try {
                const res = await api('POST', '/encryption/rsa/convert-to-xml', { pem: rsaXmlPem.value, includePrivateParams: rsaXmlIncludePrivate.value });
                rsaXmlResult.value = res.data;
            } catch (e) { toast.error('转换失败: ' + e.message); }
        };

        const rsaConvertFromXml = async () => {
            try {
                const res = await api('POST', '/encryption/rsa/convert-from-xml', { xml: rsaXmlXml.value, targetFormat: rsaXmlTargetFormat.value });
                rsaXmlFromXmlResult.value = res.data;
            } catch (e) { toast.error('转换失败: ' + e.message); }
        };

        const rsaAddPassword = async () => {
            try {
                const res = await api('POST', '/encryption/rsa/add-password', { pem: rsaPasswordPem.value, password: rsaPasswordPassword.value, targetEncryptedType: rsaPasswordTargetEncryptedType.value, algorithm: rsaPasswordAlgorithm.value });
                rsaPasswordResult.value = res.data;
            } catch (e) { toast.error('添加密码失败: ' + e.message); }
        };

        const rsaDoRemovePassword = async () => {
            try {
                const res = await api('POST', '/encryption/rsa/remove-password', { pem: rsaRemoveEncryptedPem.value, password: rsaRemovePwd.value });
                rsaRemoveResult.value = res.data;
            } catch (e) { toast.error('移除密码失败: ' + e.message); }
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