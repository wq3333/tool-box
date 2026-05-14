import { FInput } from '../components/FInput.js';
import { toast } from '../components/Toast.js';

const { ref, onMounted } = Vue;

export const EncryptionView = {
    components: { FInput },
    template: `
    <div class="h-full flex flex-col gap-4 p-4 bg-gradient-to-br from-slate-50 to-slate-100">
        <div class="flex-none">
            <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-1">
                <div class="flex flex-wrap gap-1">
                    <button v-for="tab in mainTabs" :key="tab.key" @click="mainTab = tab.key"
                        :class="['px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200',
                                 mainTab === tab.key ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100']">
                        {{ tab.label }}
                    </button>
                </div>
            </div>
        </div>

        <div v-if="mainTab === 'rsa-key'" class="flex-1 min-h-0 bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col gap-4">
            <div class="flex flex-col lg:flex-row lg:items-center gap-4">
                <label class="text-sm font-semibold text-slate-700 whitespace-nowrap">密钥长度:</label>
                <FSingleSelect v-model="rsaKeySize" :options="[{value:2048,label:'2048'},{value:4096,label:'4096'}]" />
                <FButton type="primary" @click="rsaGenerate" class="flex-1 lg:flex-none py-3">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    生成密钥对
                </FButton>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
                <div class="flex flex-col gap-3 flex-1 min-h-0">
                    <div class="flex items-center justify-between">
                        <label class="text-sm font-semibold text-slate-700">私钥</label>
                        <CopyButton v-if="rsaKeys.privateKey" :text="rsaKeys.privateKey" />
                    </div>
                    <textarea v-model="rsaKeys.privateKey" readonly placeholder="私钥..."
                        class="flex-1 min-h-0 px-4 py-3 bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-700 outline-none resize-none"></textarea>
                </div>
                <div class="flex flex-col gap-3 flex-1 min-h-0">
                    <div class="flex items-center justify-between">
                        <label class="text-sm font-semibold text-slate-700">公钥</label>
                        <CopyButton v-if="rsaKeys.publicKey" :text="rsaKeys.publicKey" />
                    </div>
                    <textarea v-model="rsaKeys.publicKey" readonly placeholder="公钥..."
                        class="flex-1 min-h-0 px-4 py-3 bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-700 outline-none resize-none"></textarea>
                </div>
            </div>
        </div>

        <div v-if="mainTab === 'rsa'" class="flex-1 min-h-0 flex flex-col gap-4">
            <div class="flex-none">
                <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-1">
                    <div class="flex flex-wrap gap-1">
                        <button v-for="t in rsaTabs" :key="t.key" @click="rsaTab = t.key"
                            :class="['px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                                     rsaTab === t.key ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100']">
                            {{ t.label }}
                        </button>
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
                <FButton type="primary" @click="rsaCompare" class="w-full py-3">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    比对
                </FButton>
                <div class="px-4 py-3 border rounded-lg flex items-center justify-center"
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
                            <CopyButton v-if="convertResult" :text="convertResult" />
                        </div>
                        <textarea v-model="convertResult" readonly placeholder="转换结果..."
                            class="flex-1 min-h-0 px-4 py-3 bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-700 outline-none resize-none"></textarea>
                    </div>
                </div>
                <div class="flex flex-col lg:flex-row lg:items-center gap-4">
                    <label class="text-sm font-semibold text-slate-700 whitespace-nowrap">目标格式:</label>
                    <FSingleSelect v-model="convertTarget" :options="[{value:'pkcs1',label:'PKCS#1'},{value:'pkcs8',label:'PKCS#8'},{value:'public',label:'公钥(X.509)'}]" />
                    <FButton type="primary" @click="rsaConvertPem" class="flex-1 lg:flex-none py-3">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        转换
                    </FButton>
                </div>
            </div>

            <div v-if="rsaTab === 'xml'" class="flex-1 min-h-0 bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col gap-4">
                <div class="flex gap-2 border-b border-slate-200 pb-3">
                    <button @click="xmlConvertDirection = 'pem-to-xml'"
                        :class="['px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                                 xmlConvertDirection === 'pem-to-xml' ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100']">
                        PEM → XML
                    </button>
                    <button @click="xmlConvertDirection = 'xml-to-pem'"
                        :class="['px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200',
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
                    <FButton type="primary" @click="rsaConvertToXml" class="w-full py-3">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        转换为XML
                    </FButton>
                    <div class="flex flex-col gap-3 flex-1 min-h-0">
                        <div class="flex items-center justify-between">
                            <label class="text-sm font-semibold text-slate-700">XML结果</label>
                            <CopyButton v-if="rsaXmlResult" :text="rsaXmlResult" />
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
                            <FSingleSelect v-model="rsaXmlTargetFormat" :options="[{value:'pkcs1',label:'PKCS#1'},{value:'pkcs8',label:'PKCS#8'},{value:'public',label:'公钥(X.509)'}]" />
                        </div>
                    </div>
                    <FButton type="primary" @click="rsaConvertFromXml" class="w-full py-3">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        转换为PEM
                    </FButton>
                    <div class="flex flex-col gap-3 flex-1 min-h-0">
                        <div class="flex items-center justify-between">
                            <label class="text-sm font-semibold text-slate-700">PEM结果</label>
                            <CopyButton v-if="rsaXmlFromXmlResult" :text="rsaXmlFromXmlResult" />
                        </div>
                        <textarea v-model="rsaXmlFromXmlResult" readonly placeholder="PEM结果..."
                            class="flex-1 min-h-0 px-4 py-3 bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-700 outline-none resize-none"></textarea>
                    </div>
                </div>
            </div>

            <div v-if="rsaTab === 'password'" class="flex-1 min-h-0 bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col gap-4">
                <div class="flex gap-2 border-b border-slate-200 pb-3">
                    <button @click="passwordOperation = 'add'"
                        :class="['px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                                 passwordOperation === 'add' ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100']">
                        添加密码
                    </button>
                    <button @click="passwordOperation = 'remove'"
                        :class="['px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200',
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
                                <FSingleSelect v-model="rsaPasswordTargetEncryptedType" :options="[{value:'EncryptedPkcs8PrivateKey',label:'Encrypted PKCS#8'},{value:'EncryptedPkcs1PrivateKey',label:'Encrypted PKCS#1'}]" />
                            </div>
                        </div>
                        <div v-if="rsaPasswordTargetEncryptedType==='EncryptedPkcs1PrivateKey'" class="flex flex-col gap-2">
                            <label class="text-sm font-semibold text-slate-700">算法</label>
                            <FSingleSelect v-model="rsaPasswordAlgorithm" :options="[{value:'AES-256-CBC',label:'AES-256-CBC'},{value:'DES-EDE3-CBC',label:'DES-EDE3-CBC'}]" />
                        </div>
                        <FButton type="primary" @click="rsaAddPassword" class="w-full py-3">
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            添加密码
                        </FButton>
                    </div>
                    <div class="flex flex-col gap-3 flex-1 min-h-0">
                        <div class="flex items-center justify-between">
                            <label class="text-sm font-semibold text-slate-700">加密后的密钥</label>
                            <CopyButton v-if="rsaPasswordResult" :text="rsaPasswordResult" />
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
                        <FButton type="primary" @click="rsaDoRemovePassword" class="w-full py-3">
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            移除密码
                        </FButton>
                    </div>
                    <div class="flex flex-col gap-3 flex-1 min-h-0">
                        <div class="flex items-center justify-between">
                            <label class="text-sm font-semibold text-slate-700">解密后的密钥</label>
                            <CopyButton v-if="rsaRemoveResult" :text="rsaRemoveResult" />
                        </div>
                        <textarea v-model="rsaRemoveResult" readonly placeholder="解密后的密钥..."
                            class="flex-1 min-h-0 px-4 py-3 bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-700 outline-none resize-none"></textarea>
                    </div>
                </div>
            </div>

            <div v-if="rsaTab === 'encrypt'" class="flex-1 min-h-0 bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col gap-4">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
                    <div class="flex flex-col gap-4 flex-1 min-h-0">
                        <div class="flex flex-col gap-3 flex-1 min-h-0">
                            <label class="text-sm font-semibold text-slate-700">公钥</label>
                            <textarea v-model="rsaEncPublic" placeholder="粘贴PEM公钥..."
                                class="flex-1 min-h-0 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-700 outline-none resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400"></textarea>
                        </div>
                        <div class="flex flex-col gap-3">
                            <label class="text-sm font-semibold text-slate-700">明文</label>
                            <textarea v-model="rsaEncPlaintext" placeholder="输入明文..."
                                class="h-24 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-700 outline-none resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400"></textarea>
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="text-sm font-semibold text-slate-700">填充模式</label>
                            <FSingleSelect v-model="rsaEncPadding" :options="[{value:'OAEP-SHA256',label:'OAEP-SHA256'},{value:'OAEP-SHA384',label:'OAEP-SHA384'},{value:'OAEP-SHA512',label:'OAEP-SHA512'},{value:'OAEP-SHA1',label:'OAEP-SHA1'},{value:'PKCS1',label:'PKCS1'}]" />
                        </div>
                        <FButton type="primary" @click="rsaEncrypt" class="w-full py-3">
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            加密
                        </FButton>
                    </div>
                    <div class="flex flex-col gap-3 flex-1 min-h-0">
                        <div class="flex items-center justify-between">
                            <label class="text-sm font-semibold text-slate-700">密文(Base64)</label>
                            <CopyButton v-if="rsaEncResult" :text="rsaEncResult" />
                        </div>
                        <textarea v-model="rsaEncResult" readonly placeholder="加密结果..."
                            class="flex-1 min-h-0 px-4 py-3 bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-700 outline-none resize-none"></textarea>
                    </div>
                </div>
            </div>

            <div v-if="rsaTab === 'decrypt'" class="flex-1 min-h-0 bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col gap-4">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
                    <div class="flex flex-col gap-4 flex-1 min-h-0">
                        <div class="flex flex-col gap-3 flex-1 min-h-0">
                            <label class="text-sm font-semibold text-slate-700">私钥</label>
                            <textarea v-model="rsaDecPrivate" placeholder="粘贴PEM私钥..."
                                class="flex-1 min-h-0 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-700 outline-none resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400"></textarea>
                        </div>
                        <div class="flex flex-col gap-3">
                            <label class="text-sm font-semibold text-slate-700">密文(Base64)</label>
                            <textarea v-model="rsaDecCiphertext" placeholder="粘贴Base64密文..."
                                class="h-24 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-700 outline-none resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400"></textarea>
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div class="flex flex-col gap-2">
                                <label class="text-sm font-semibold text-slate-700">填充模式</label>
                                <FSingleSelect v-model="rsaDecPadding" :options="[{value:'OAEP-SHA256',label:'OAEP-SHA256'},{value:'OAEP-SHA384',label:'OAEP-SHA384'},{value:'OAEP-SHA512',label:'OAEP-SHA512'},{value:'OAEP-SHA1',label:'OAEP-SHA1'},{value:'PKCS1',label:'PKCS1'}]" />
                            </div>
                            <div class="flex flex-col gap-2">
                                <label class="text-sm font-semibold text-slate-700">密码(当私钥有密码保护时传入)</label>
                                <FInput v-model="rsaDecPassword" placeholder="密钥密码"></FInput>
                            </div>
                        </div>
                        <FButton type="primary" @click="rsaDecrypt" class="w-full py-3">
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            解密
                        </FButton>
                    </div>
                    <div class="flex flex-col gap-3 flex-1 min-h-0">
                        <div class="flex items-center justify-between">
                            <label class="text-sm font-semibold text-slate-700">明文</label>
                            <CopyButton v-if="rsaDecResult" :text="rsaDecResult" />
                        </div>
                        <textarea v-model="rsaDecResult" readonly placeholder="解密结果..."
                            class="flex-1 min-h-0 px-4 py-3 bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-700 outline-none resize-none"></textarea>
                    </div>
                </div>
            </div>

            <div v-if="rsaTab === 'sign'" class="flex-1 min-h-0 bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col gap-4">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
                    <div class="flex flex-col gap-4 flex-1 min-h-0">
                        <div class="flex flex-col gap-3 flex-1 min-h-0">
                            <label class="text-sm font-semibold text-slate-700">私钥</label>
                            <textarea v-model="rsaSignPrivate" placeholder="粘贴PEM私钥..."
                                class="flex-1 min-h-0 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-700 outline-none resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400"></textarea>
                        </div>
                        <div class="flex flex-col gap-3">
                            <label class="text-sm font-semibold text-slate-700">待签名数据</label>
                            <textarea v-model="rsaSignData" placeholder="输入待签名数据..."
                                class="h-24 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-700 outline-none resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400"></textarea>
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div class="flex flex-col gap-2">
                                <label class="text-sm font-semibold text-slate-700">哈希算法</label>
                                <FSingleSelect v-model="rsaSignHashAlgorithm" :options="[{value:'SHA256',label:'SHA256'},{value:'SHA384',label:'SHA384'},{value:'SHA512',label:'SHA512'},{value:'SHA1',label:'SHA1'}]" />
                            </div>
                            <div class="flex flex-col gap-2">
                                <label class="text-sm font-semibold text-slate-700">填充模式</label>
                                <FSingleSelect v-model="rsaSignPadding" :options="[{value:'PKCS1',label:'PKCS1'},{value:'PSS',label:'PSS'}]" />
                            </div>
                        </div>
                        <FButton type="primary" @click="rsaSign" class="w-full py-3">
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            签名
                        </FButton>
                    </div>
                    <div class="flex flex-col gap-3 flex-1 min-h-0">
                        <div class="flex items-center justify-between">
                            <label class="text-sm font-semibold text-slate-700">签名(Base64)</label>
                            <CopyButton v-if="rsaSignResult" :text="rsaSignResult" />
                        </div>
                        <textarea v-model="rsaSignResult" readonly placeholder="签名结果..."
                            class="flex-1 min-h-0 px-4 py-3 bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-700 outline-none resize-none"></textarea>
                    </div>
                </div>
            </div>

            <div v-if="rsaTab === 'verify'" class="flex-1 min-h-0 bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col gap-4">
                <div class="flex flex-col gap-4 flex-1 min-h-0">
                    <div class="flex flex-col gap-3 flex-1 min-h-0">
                        <label class="text-sm font-semibold text-slate-700">公钥</label>
                        <textarea v-model="rsaVerifySignPublic" placeholder="粘贴PEM公钥..."
                            class="flex-1 min-h-0 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-700 outline-none resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400"></textarea>
                    </div>
                    <div class="flex flex-col gap-3">
                        <label class="text-sm font-semibold text-slate-700">原始数据</label>
                        <textarea v-model="rsaVerifySignData" placeholder="输入原始数据..."
                            class="h-24 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-700 outline-none resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400"></textarea>
                    </div>
                    <div class="flex flex-col gap-3">
                        <label class="text-sm font-semibold text-slate-700">签名(Base64)</label>
                        <textarea v-model="rsaVerifySignSignature" placeholder="粘贴Base64签名..."
                            class="h-24 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-700 outline-none resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400"></textarea>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div class="flex flex-col gap-2">
                            <label class="text-sm font-semibold text-slate-700">哈希算法</label>
                            <FSingleSelect v-model="rsaVerifySignHashAlgorithm" :options="[{value:'SHA256',label:'SHA256'},{value:'SHA384',label:'SHA384'},{value:'SHA512',label:'SHA512'},{value:'SHA1',label:'SHA1'}]" />
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="text-sm font-semibold text-slate-700">填充模式</label>
                            <FSingleSelect v-model="rsaVerifySignPadding" :options="[{value:'PKCS1',label:'PKCS1'},{value:'PSS',label:'PSS'}]" />
                        </div>
                    </div>
                    <FButton type="primary" @click="rsaVerifySign" class="w-full py-3">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        验签
                    </FButton>
                    <div class="px-4 py-3 border rounded-lg flex items-center justify-center"
                        :class="rsaVerifySignResult === null ? 'bg-slate-50 border-slate-200' : (rsaVerifySignResult ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200')">
                        <span v-if="rsaVerifySignResult === null" class="text-sm text-slate-500">点击验签按钮查看结果</span>
                        <span v-else :class="rsaVerifySignResult ? 'text-emerald-600' : 'text-red-600'" class="text-sm font-medium">
                            {{ rsaVerifySignResult ? '✓ 签名有效' : '✗ 签名无效' }}
                        </span>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="mainTab === 'aes'" class="flex-1 min-h-0 bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col gap-4">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div class="flex flex-col gap-2">
                    <label class="text-sm font-semibold text-slate-700">密钥</label>
                    <FInput v-model="aesKey" placeholder="输入AES密钥"></FInput>
                </div>
                <div v-if="aesMode !== 'ECB'" class="flex flex-col gap-2">
                    <label class="text-sm font-semibold text-slate-700">IV(必需)</label>
                    <FInput v-model="aesIv" placeholder="输入IV"></FInput>
                </div>
                <div class="flex flex-col gap-2">
                    <label class="text-sm font-semibold text-slate-700">模式</label>
                    <FSingleSelect v-model="aesMode" :options="[{value:'CBC',label:'CBC'},{value:'ECB',label:'ECB'},{value:'CFB',label:'CFB'}]" />
                </div>
                <div class="flex flex-col gap-2">
                    <label class="text-sm font-semibold text-slate-700">填充</label>
                    <FSingleSelect v-model="aesPadding" :options="[{value:'PKCS7',label:'PKCS7'},{value:'Zeros',label:'Zeros'},{value:'ANSIX923',label:'ANSIX923'},{value:'ISO10126',label:'ISO10126'},{value:'None',label:'None'}]" />
                </div>
            </div>
            <div class="flex-1 min-h-0 flex flex-col gap-3">
                <label class="text-sm font-semibold text-slate-700">输入</label>
                <textarea v-model="aesInput" placeholder="输入明文或密文..."
                    class="flex-1 min-h-0 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-700 outline-none resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400"></textarea>
            </div>
            <div class="flex gap-3">
                <FButton type="primary" @click="aesEncrypt" class="flex-1 py-3">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    加密
                </FButton>
                <FButton type="default" @click="aesDecrypt" class="flex-1 py-3">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    解密
                </FButton>
            </div>
            <div v-if="aesResult" class="flex flex-col gap-3 flex-1 min-h-0">
                <div class="flex items-center justify-between">
                    <label class="text-sm font-semibold text-slate-700">输出</label>
                    <CopyButton :text="aesResult" />
                </div>
                <textarea v-model="aesResult" readonly placeholder="结果将在此显示..."
                    class="flex-1 min-h-0 px-4 py-3 bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-700 outline-none resize-none"></textarea>
            </div>
        </div>

        <div v-if="mainTab === 'des'" class="flex-1 min-h-0 bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col gap-4">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div class="flex flex-col gap-2">
                    <label class="text-sm font-semibold text-slate-700">密钥</label>
                    <FInput v-model="desKey" placeholder="输入DES密钥"></FInput>
                </div>
                <div v-if="desMode !== 'ECB'" class="flex flex-col gap-2">
                    <label class="text-sm font-semibold text-slate-700">IV(必需)</label>
                    <FInput v-model="desIv" placeholder="输入IV"></FInput>
                </div>
                <div class="flex flex-col gap-2">
                    <label class="text-sm font-semibold text-slate-700">模式</label>
                    <FSingleSelect v-model="desMode" :options="[{value:'CBC',label:'CBC'},{value:'ECB',label:'ECB'},{value:'CFB',label:'CFB'}]" />
                </div>
                <div class="flex flex-col gap-2">
                    <label class="text-sm font-semibold text-slate-700">填充</label>
                    <FSingleSelect v-model="desPadding" :options="[{value:'PKCS7',label:'PKCS7'},{value:'Zeros',label:'Zeros'},{value:'ANSIX923',label:'ANSIX923'},{value:'ISO10126',label:'ISO10126'},{value:'None',label:'None'}]" />
                </div>
            </div>
            <div class="flex-1 min-h-0 flex flex-col gap-3">
                <label class="text-sm font-semibold text-slate-700">输入</label>
                <textarea v-model="desInput" placeholder="输入明文或密文..."
                    class="flex-1 min-h-0 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-700 outline-none resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400"></textarea>
            </div>
            <div class="flex gap-3">
                <FButton type="primary" @click="desEncrypt" class="flex-1 py-3">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    加密
                </FButton>
                <FButton type="default" @click="desDecrypt" class="flex-1 py-3">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    解密
                </FButton>
            </div>
            <div v-if="desResult" class="flex flex-col gap-3 flex-1 min-h-0">
                <div class="flex items-center justify-between">
                    <label class="text-sm font-semibold text-slate-700">输出</label>
                    <CopyButton :text="desResult" />
                </div>
                <textarea v-model="desResult" readonly placeholder="结果将在此显示..."
                    class="flex-1 min-h-0 px-4 py-3 bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-700 outline-none resize-none"></textarea>
            </div>
        </div>

        <div v-if="mainTab === '3des'" class="flex-1 min-h-0 bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col gap-4">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div class="flex flex-col gap-2">
                    <label class="text-sm font-semibold text-slate-700">密钥</label>
                    <FInput v-model="tripleDesKey" placeholder="输入3DES密钥"></FInput>
                </div>
                <div v-if="tripleDesMode !== 'ECB'" class="flex flex-col gap-2">
                    <label class="text-sm font-semibold text-slate-700">IV(必需)</label>
                    <FInput v-model="tripleDesIv" placeholder="输入IV"></FInput>
                </div>
                <div class="flex flex-col gap-2">
                    <label class="text-sm font-semibold text-slate-700">模式</label>
                    <FSingleSelect v-model="tripleDesMode" :options="[{value:'CBC',label:'CBC'},{value:'ECB',label:'ECB'},{value:'CFB',label:'CFB'}]" />
                </div>
                <div class="flex flex-col gap-2">
                    <label class="text-sm font-semibold text-slate-700">填充</label>
                    <FSingleSelect v-model="tripleDesPadding" :options="[{value:'PKCS7',label:'PKCS7'},{value:'Zeros',label:'Zeros'},{value:'ANSIX923',label:'ANSIX923'},{value:'ISO10126',label:'ISO10126'},{value:'None',label:'None'}]" />
                </div>
            </div>
            <div class="flex-1 min-h-0 flex flex-col gap-3">
                <label class="text-sm font-semibold text-slate-700">输入</label>
                <textarea v-model="tripleDesInput" placeholder="输入明文或密文..."
                    class="flex-1 min-h-0 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-700 outline-none resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400"></textarea>
            </div>
            <div class="flex gap-3">
                <FButton type="primary" @click="tripleDesEncrypt" class="flex-1 py-3">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    加密
                </FButton>
                <FButton type="default" @click="tripleDesDecrypt" class="flex-1 py-3">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    解密
                </FButton>
            </div>
            <div v-if="tripleDesResult" class="flex flex-col gap-3 flex-1 min-h-0">
                <div class="flex items-center justify-between">
                    <label class="text-sm font-semibold text-slate-700">输出</label>
                    <CopyButton :text="tripleDesResult" />
                </div>
                <textarea v-model="tripleDesResult" readonly placeholder="结果将在此显示..."
                    class="flex-1 min-h-0 px-4 py-3 bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-700 outline-none resize-none"></textarea>
            </div>
        </div>
    </div>
    `,
    setup() {
        const mainTab = ref('rsa-key');
        const mainTabs = [
            { key: 'rsa-key', label: 'RSA密钥' },
            { key: 'rsa', label: 'RSA' },
            { key: 'aes', label: 'AES' },
            { key: 'des', label: 'DES' },
            { key: '3des', label: '3DES' }
        ];
        const rsaTab = ref('encrypt');
        const rsaTabs = [
            { key: 'compare', label: '密钥比对' },
            { key: 'convert', label: '格式转换' },
            { key: 'xml', label: 'XML转换' },
            { key: 'password', label: '密码操作' },
            { key: 'encrypt', label: '加密' },
            { key: 'decrypt', label: '解密' },
            { key: 'sign', label: '签名' },
            { key: 'verify', label: '验签' }
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
        const rsaEncPublic = ref('');
        const rsaEncPlaintext = ref('');
        const rsaEncPadding = ref('OAEP-SHA256');
        const rsaEncResult = ref('');
        const rsaDecPrivate = ref('');
        const rsaDecCiphertext = ref('');
        const rsaDecPadding = ref('OAEP-SHA256');
        const rsaDecPassword = ref('');
        const rsaDecResult = ref('');
        const rsaSignPrivate = ref('');
        const rsaSignData = ref('');
        const rsaSignHashAlgorithm = ref('SHA256');
        const rsaSignPadding = ref('PKCS1');
        const rsaSignResult = ref('');
        const rsaVerifySignPublic = ref('');
        const rsaVerifySignData = ref('');
        const rsaVerifySignSignature = ref('');
        const rsaVerifySignHashAlgorithm = ref('SHA256');
        const rsaVerifySignPadding = ref('PKCS1');
        const rsaVerifySignResult = ref(null);
        const aesKey = ref('');
        const aesIv = ref('');
        const aesInput = ref('');
        const aesResult = ref('');
        const aesMode = ref('CBC');
        const aesPadding = ref('PKCS7');
        const desKey = ref('');
        const desIv = ref('');
        const desInput = ref('');
        const desResult = ref('');
        const desMode = ref('CBC');
        const desPadding = ref('PKCS7');
        const tripleDesKey = ref('');
        const tripleDesIv = ref('');
        const tripleDesInput = ref('');
        const tripleDesResult = ref('');
        const tripleDesMode = ref('CBC');
        const tripleDesPadding = ref('PKCS7');

        const rsaGenerate = async () => {
            try {
                const res = await api('POST', '/encryption/rsa/generate', { keySize: rsaKeySize.value });
                rsaKeys.value = res.data;
            } catch(e) { toast.error('生成失败: ' + e.message); }
        };
        const rsaCompare = async () => {
            try {
                const res = await api('POST', '/encryption/rsa/compare', { privateKey: comparePrivate.value, publicKey: comparePublic.value });
                compareResult.value = res.data;
            } catch(e) { compareResult.value = false; }
        };
        const rsaConvertPem = async () => {
            try {
                const res = await api('POST', '/encryption/rsa/convert-pem', { pem: convertPem.value, targetFormat: convertTarget.value });
                convertResult.value = res.data;
            } catch(e) { toast.error('转换失败: ' + e.message); }
        };
        const aesEncrypt = async () => {
            try {
                const res = await api('POST', '/encryption/aes/encrypt', { plaintext: aesInput.value, key: aesKey.value, iv: aesIv.value || null, mode: aesMode.value, padding: aesPadding.value });
                aesResult.value = res.data;
            } catch(e) { toast.error('加密失败: ' + e.message); }
        };
        const aesDecrypt = async () => {
            try {
                const res = await api('POST', '/encryption/aes/decrypt', { ciphertext: aesInput.value, key: aesKey.value, iv: aesIv.value || null, mode: aesMode.value, padding: aesPadding.value });
                aesResult.value = res.data;
            } catch(e) { toast.error('解密失败: ' + e.message); }
        };
        const desEncrypt = async () => {
            try {
                const res = await api('POST', '/encryption/des/encrypt', { plaintext: desInput.value, key: desKey.value, iv: desIv.value || null, mode: desMode.value, padding: desPadding.value });
                desResult.value = res.data;
            } catch(e) { toast.error('加密失败: ' + e.message); }
        };
        const desDecrypt = async () => {
            try {
                const res = await api('POST', '/encryption/des/decrypt', { ciphertext: desInput.value, key: desKey.value, iv: desIv.value || null, mode: desMode.value, padding: desPadding.value });
                desResult.value = res.data;
            } catch(e) { toast.error('解密失败: ' + e.message); }
        };
        const tripleDesEncrypt = async () => {
            try {
                const res = await api('POST', '/encryption/tripledes/encrypt', { plaintext: