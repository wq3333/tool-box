import { FInput } from '../components/FInput.js';

const { ref, computed } = Vue;

export const HttpView = {
    components: { FInput },
    template: `
    <div class="h-full flex flex-col gap-4 p-4 bg-gradient-to-br from-slate-50 to-slate-100">
        <div class="flex-none flex items-center justify-between">
            <div></div>
            <label class="flex items-center gap-2 cursor-pointer p-2 bg-white rounded-lg border border-slate-200 hover:border-slate-300 transition-colors">
                <input type="checkbox" v-model="localMode" class="w-4 h-4 text-blue-500 border-slate-300 focus:ring-blue-500">
                <span class="text-sm text-slate-600">本地模式</span>
            </label>
        </div>

        <div class="flex-1 min-h-0 flex flex-col gap-4">
            <div class="flex-none flex flex-col lg:flex-row lg:items-center gap-3">
                <FSingleSelect v-model="method" :options="methods.map(m => ({ value: m, label: m }))"></FSingleSelect>
                <FInput v-model="url" placeholder="https://example.com/api" class="flex-1"></FInput>
                <FButton @click="send" type="primary" :loading="loading" class="flex-1 lg:flex-none">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    {{ loading ? '请求中...' : '发送' }}
                </FButton>
            </div>

            <div class="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div class="flex flex-col gap-3">
                    <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                        <div class="flex items-center justify-between mb-3">
                            <label class="text-sm font-semibold text-slate-700">请求头</label>
                            <FButton type="default" size="sm" @click="addHeader" class="flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                添加
                            </FButton>
                        </div>
                        <div class="flex flex-col gap-2 max-h-[120px] overflow-y-auto">
                            <div v-for="(h, i) in headers" :key="i" class="flex gap-2">
                                <FInput v-model="h.key" placeholder="键" class="flex-1 min-w-[80px]"></FInput>
                                <FInput v-model="h.value" placeholder="值" class="flex-1 min-w-[80px]"></FInput>
                                <button @click="removeHeader(i)" class="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div v-if="method !== 'GET'" class="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col gap-3 flex-1 min-h-0">
                        <div class="flex flex-col lg:flex-row lg:items-center gap-3">
                            <label class="text-sm font-semibold text-slate-700">请求体</label>
                            <FSingleSelect v-model="contentType"
                                :options="[{value:'application/json',label:'application/json'},{value:'application/x-www-form-urlencoded',label:'application/x-www-form-urlencoded'},{value:'multipart/form-data',label:'multipart/form-data'},{value:'text/plain',label:'text/plain'},{value:'text/xml',label:'text/xml'}]"></FSingleSelect>
                        </div>
                        <div v-if="contentType === 'multipart/form-data' || contentType === 'application/x-www-form-urlencoded'" class="flex flex-col gap-2 flex-1 min-h-0">
                            <div class="flex flex-col gap-2 max-h-[150px] overflow-y-auto">
                                <div v-for="(f, i) in formFields" :key="i" class="flex gap-2 items-center">
                                    <FSingleSelect v-if="contentType === 'multipart/form-data'" v-model="f.type" class="flex-shrink-0"
                                        :options="[{value:'text',label:'文本'},{value:'file',label:'文件'}]"></FSingleSelect>
                                    <FInput v-model="f.key" placeholder="字段名" class="flex-1 min-w-[80px]"></FInput>
                                    <input v-if="f.type === 'text' || contentType === 'application/x-www-form-urlencoded'" type="text" v-model="f.value" placeholder="字段值"
                                        class="flex-1 min-w-[80px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                    <input v-else type="file" :ref="el => { if (el) f.fileRef = el }"
                                        class="flex-1 min-w-[80px] text-xs"
                                        @change="f.fileName = f.fileRef.files[0]?.name || ''">
                                    <span v-if="f.type === 'file' && f.fileName" class="text-xs text-slate-500 truncate max-w-[100px]">{{ f.fileName }}</span>
                                    <button @click="removeFormField(i)" class="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            <div class="flex-none">
                                <FButton type="default" size="sm" @click="addFormField">+ 添加字段</FButton>
                            </div>
                        </div>
                        <textarea v-else v-model="body" placeholder="请求体内容..."
                            class="flex-1 min-h-0 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-700 resize-none outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"></textarea>
                    </div>
                </div>

                <div v-if="response" class="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col gap-4 flex-1 min-h-0">
                    <div class="flex items-center gap-3">
                        <span :class="['px-3 py-1.5 rounded-lg text-sm font-bold', response.statusCode < 300 ? 'bg-emerald-100 text-emerald-700' : response.statusCode < 400 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700']">
                            {{ response.statusCode }} {{ response.statusText }}
                        </span>
                        <span class="text-sm text-slate-500">{{ response.duration }}ms</span>
                        <span v-if="localMode" class="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded-full">本地模式</span>
                    </div>

                    <div class="flex-none">
                        <label class="block text-sm font-semibold text-slate-700 mb-2">响应头</label>
                        <div class="bg-slate-50 rounded-lg px-4 py-3 text-sm font-mono max-h-[100px] overflow-y-auto">
                            <div v-for="(v, k) in response.headers" :key="k" class="flex flex-wrap">
                                <span class="text-slate-500">{{ k }}:</span> <span class="text-slate-700 ml-1">{{ v }}</span>
                            </div>
                        </div>
                    </div>

                    <div class="flex-1 min-h-0 flex flex-col">
                        <div class="flex items-center justify-between mb-3">
                            <label class="text-sm font-semibold text-slate-700">响应体</label>
                            <div class="flex items-center gap-2">
                                <button @click="responseView = 'raw'" :class="['px-3 py-1.5 text-sm rounded-lg', responseView === 'raw' ? 'bg-blue-100 text-blue-700' : 'text-slate-500 hover:bg-slate-100']">Raw</button>
                                <button @click="responseView = 'html'" :class="['px-3 py-1.5 text-sm rounded-lg', responseView === 'html' ? 'bg-blue-100 text-blue-700' : 'text-slate-500 hover:bg-slate-100']">HTML</button>
                                <button @click="responseView = 'preview'" v-if="isImageResponse" :class="['px-3 py-1.5 text-sm rounded-lg', responseView === 'preview' ? 'bg-blue-100 text-blue-700' : 'text-slate-500 hover:bg-slate-100']">图片预览</button>
                                <CopyButton :text="response.body"></CopyButton>
                            </div>
                        </div>
                        <textarea v-if="responseView === 'raw'" :value="response.body" readonly
                            class="flex-1 min-h-0 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-700 resize-none outline-none"></textarea>
                        <iframe v-else-if="responseView === 'html'" v-bind:srcdoc="response.body" class="flex-1 min-h-0 w-full rounded-lg border border-slate-200 bg-white"></iframe>
                        <div v-else class="flex-1 min-h-0 flex items-center justify-center overflow-auto bg-slate-50 rounded-lg">
                            <img :src="response.body" class="max-w-full max-h-full object-contain rounded-lg border border-slate-200"></img>
                        </div>
                    </div>
                </div>

                <div v-else class="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col items-center justify-center text-slate-400">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12 mb-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span class="text-sm">发送请求后响应将显示在这里</span>
                </div>
            </div>
        </div>
    </div>
    `,
    setup() {
        const method = ref('GET');
        const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
        const url = ref('');
        const headers = ref([{ key: '', value: '' }]);
        const contentType = ref('application/json');
        const body = ref('');
        const formFields = ref([{ key: '', value: '', type: 'text', fileRef: null, fileName: '' }]);
        const response = ref(null);
        const loading = ref(false);
        const responseView = ref('raw');
        const localMode = ref(false);

        const isImageResponse = computed(() => {
            if (!response.value) return false;
            const body = response.value.body || '';
            return body.startsWith('data:image/');
        });

        const addHeader = () => { headers.value.push({ key: '', value: '' }); };
        const removeHeader = (i) => { headers.value.splice(i, 1); };
        const addFormField = () => { formFields.value.push({ key: '', value: '', type: 'text', fileRef: null, fileName: '' }); };
        const removeFormField = (i) => { formFields.value.splice(i, 1); };

        const send = async () => {
            if (!url.value) return;
            loading.value = true;
            response.value = null;
            try {
                const reqHeaders = {};
                headers.value.filter(h => h.key).forEach(h => { reqHeaders[h.key] = h.value; });
                let reqBody = null;
                let sendContentType = null;
                let isFormData = false;
                const formDataObj = new FormData();
                if (method.value !== 'GET') {
                    if (contentType.value === 'multipart/form-data') {
                        formFields.value.filter(f => f.key).forEach(f => {
                            if (f.type === 'file' && f.fileRef && f.fileRef.files[0]) {
                                formDataObj.append(f.key, f.fileRef.files[0]);
                            } else {
                                formDataObj.append(f.key, f.value);
                            }
                        });
                        isFormData = true;
                    } else if (contentType.value === 'application/x-www-form-urlencoded') {
                        const params = new URLSearchParams();
                        formFields.value.filter(f => f.key).forEach(f => {
                            params.append(f.key, f.value);
                        });
                        reqBody = params.toString();
                        sendContentType = contentType.value;
                    } else {
                        reqBody = body.value;
                        sendContentType = contentType.value;
                    }
                }
                const startTime = Date.now();
                const res = await (localMode.value ? localHttpSend({ method: method.value, url: url.value, headers: reqHeaders, body: reqBody, contentType: sendContentType, formData: isFormData ? formDataObj : null }) : proxyHttpSend({ method: method.value, url: url.value, headers: reqHeaders, body: reqBody, contentType: sendContentType, formData: isFormData ? formDataObj : null }));
                response.value = res.data;
                response.value.duration = Date.now() - startTime;
            } catch(e) {
                response.value = { statusCode: 0, statusText: 'Error', headers: {}, body: e.message, duration: 0 };
            } finally {
                loading.value = false;
            }
        };

        const proxyHttpSend = async ({ method, url, headers, body, contentType, formData }) => {
            const fullUrl = 'api/http/send';
            
            let fetchBody;
            let fetchHeaders = { ...headers };
            
            if (formData) {
                fetchBody = formData;
                fetchHeaders['X-Http-Method'] = method;
                fetchHeaders['X-Http-Url'] = url;
                delete fetchHeaders['Content-Type'];
            } else if (contentType === 'application/x-www-form-urlencoded') {
                fetchBody = body;
                fetchHeaders['Content-Type'] = contentType;
                fetchHeaders['X-Http-Method'] = method;
                fetchHeaders['X-Http-Url'] = url;
            } else {
                fetchBody = JSON.stringify({ method, url, headers, body, contentType });
                fetchHeaders['Content-Type'] = 'application/json';
                fetchHeaders['X-Http-Url'] = url;
            }
            
            const res = await fetch(fullUrl, {
                method: 'POST',
                headers: fetchHeaders,
                body: fetchBody
            });
            const data = await res.json();
            return { data };
        };

        const localHttpSend = async ({ method, url, headers, body, contentType, formData }) => {
            const fetchHeaders = { ...headers };
            
            if (contentType && !formData) {
                fetchHeaders['Content-Type'] = contentType;
            }
            
            const response = await fetch(url, {
                method: method,
                headers: fetchHeaders,
                body: formData || body,
                credentials: 'include'
            });
            
            const headersObj = {};
            response.headers.forEach((v, k) => { headersObj[k] = v; });
            
            let responseBody;
            const contentTypeHeader = response.headers.get('content-type') || '';
            
            if (contentTypeHeader.includes('application/json')) {
                responseBody = JSON.stringify(await response.json(), null, 2);
            } else if (contentTypeHeader.includes('image/')) {
                const blob = await response.blob();
                responseBody = URL.createObjectURL(blob);
            } else {
                responseBody = await response.text();
            }
            
            return {
                data: {
                    statusCode: response.status,
                    statusText: response.statusText,
                    headers: headersObj,
                    body: responseBody
                }
            };
        };

        const refresh = () => {
            method.value = 'GET';
            url.value = '';
            headers.value = [{ key: '', value: '' }];
            contentType.value = 'application/json';
            body.value = '';
            formFields.value = [{ key: '', value: '', type: 'text', fileRef: null, fileName: '' }];
            response.value = null;
            loading.value = false;
            responseView.value = 'raw';
        };

        return {
            method, methods, url, headers, contentType, body, formFields, response, loading, responseView, localMode,
            isImageResponse,
            addHeader, removeHeader, addFormField, removeFormField, send, refresh
        };
    }
};