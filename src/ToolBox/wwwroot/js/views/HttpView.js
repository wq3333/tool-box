const { ref, computed } = Vue;

export const HttpView = {
    template: `
    <div class="h-full flex flex-col gap-4 p-4 bg-gradient-to-br from-[var(--bg-gradient-start)] to-[var(--bg-gradient-end)]">
        <div class="flex-none flex flex-col lg:flex-row lg:items-center gap-3">
            <FInput v-model="url" placeholder="https://example.com/api" class="flex-1"></FInput>
            <div class="flex flex-row gap-2">
                <FSingleSelect style="width:100px" class="h-10" v-model="method" :options="methods.map(m => ({ value: m, label: m }))"></FSingleSelect>
                <label class="flex h-10 items-center gap-2 cursor-pointer p-2 bg-[var(--bg-surface)] rounded-lg border border-[var(--border-subtle)] hover:border-[var(--border)] transition-colors">
                    <input type="checkbox" v-model="localMode" class="w-4 h-4 text-[var(--accent)] border-[var(--border-subtle)] focus:ring-[var(--accent)]">
                    <span class="text-sm text-[var(--text-secondary)]">本地模式</span>
                </label>
                <FButton class="h-9 self-center" @click="send" type="primary" :loading="loading" class="flex-1 lg:flex-none">
                    <IconPlay :size="20" />
                    {{ loading ? '请求中...' : '发送' }}
                </FButton>
            </div>
        </div>

        <div v-if="localMode" class="flex-none bg-[var(--warning-light)] border border-[var(--warning)] rounded-xl">
            <div @click="showHelp = !showHelp" class="flex items-center justify-between p-4 cursor-pointer select-none">
                <span class="text-[var(--warning)] text-sm font-semibold">本地模式帮助</span>
                <span class="text-[var(--text-secondary)] text-sm transition-transform" :class="showHelp ? 'rotate-180' : ''">▼</span>
            </div>
            <div v-if="showHelp" class="px-4 pb-4 flex flex-col gap-3">
                <div class="flex items-start gap-2">
                    <span class="text-[var(--warning)] text-sm font-semibold whitespace-nowrap">跨域问题</span>
                    <span class="text-sm text-[var(--text-primary)]">
                        本地模式可能遇到跨域问题，请安装扩展
                        <a href="https://chromewebstore.google.com/detail/allow-cors-access-control/lhobafahddgcelffkeicbaginigeejlf?hl=zh-CN" target="_blank" class="text-[var(--accent)] underline">Allow CORS Access Control</a>
                        ，<a href="CorsHelp.png" target="_blank" class="text-[var(--accent)] underline">并配置</a>
                    </span>
                </div>
                <div class="flex flex-col items-start gap-2">
                    <span class="text-[var(--warning)] text-sm font-semibold whitespace-nowrap">访问localhost问题</span>
                    <span class="text-sm text-[var(--text-primary)]">
                        <p>1.在 Chrome 地址栏输入 chrome://flags 并回车</p>
                        <p>2.在页面顶部的搜索框中输入 Local Network Access Checks</p>
                        <p>3.找到该选项，将右侧的下拉菜单从 Default 改为 Disabled</p>
                        <p>4.重启 Chrome 浏览器，问题通常就能解决</p>
                    </span>
                </div>
            </div>
        </div>

        <div class="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 overflow-y-auto">
            <div class="flex flex-col gap-3">
                <div class="bg-[var(--bg-surface)] rounded-xl shadow-sm border border-[var(--border-subtle)] flex flex-col gap-3 p-5">
                    <div class="flex items-center justify-between mb-3">
                        <label class="text-sm font-semibold text-[var(--text-primary)]">请求头</label>
                    </div>
                    <div class="flex-1 flex flex-col gap-2 overflow-y-auto">
                        <div v-for="(h, i) in headers" :key="i" class="flex gap-2">
                            <FInput v-model="h.key" placeholder="键" class="flex-1 "></FInput>
                            <FInput v-model="h.value" placeholder="值" class="flex-1 "></FInput>
                            <button @click="removeHeader(i)" class="w-8 h-8 flex items-center justify-center text-[var(--text-placeholder)] hover:text-[var(--danger)] hover:bg-[var(--danger-light)] rounded-lg transition-colors">
                                <IconTrash :size="14" />
                            </button>
                        </div>
                    </div>
                    <div class="flex-none">
                        <FButton type="default" size="sm" @click="addHeader"><IconPlus :size="14" />添加请求头</FButton>
                    </div>
                </div>

                <div v-if="method !== 'GET'" class="bg-[var(--bg-surface)] rounded-xl shadow-sm border border-[var(--border-subtle)] p-5 flex flex-col gap-3">
                    <div class="flex flex-col lg:flex-row lg:items-center gap-3">
                        <label class="text-sm font-semibold text-[var(--text-primary)] whitespace-nowrap">请求体</label>
                        <FSingleSelect v-model="contentType"
                            :options="[{value:'application/json',label:'application/json'},{value:'application/x-www-form-urlencoded',label:'application/x-www-form-urlencoded'},{value:'multipart/form-data',label:'multipart/form-data'},{value:'text/plain',label:'text/plain'},{value:'text/xml',label:'text/xml'}]"></FSingleSelect>
                    </div>
                    <div v-if="contentType === 'multipart/form-data' || contentType === 'application/x-www-form-urlencoded'" class="flex flex-col gap-2 flex-1">
                        <div v-for="(f, i) in formFields" :key="i" class="flex gap-2 items-center">
                            <FSingleSelect style="width:80px" class="h-10" v-if="contentType === 'multipart/form-data'" v-model="f.type" class="flex-shrink-0"
                                :options="[{value:'text',label:'文本'},{value:'file',label:'文件'}]"></FSingleSelect>
                            <FInput v-model="f.key" placeholder="字段名" class="flex-1 overflow-hidden"></FInput>
                            <FInput v-if="f.type === 'text' || contentType === 'application/x-www-form-urlencoded'" v-model="f.value" placeholder="字段值" class="flex-1 overflow-hidden"></FInput>
                            <div v-else class="flex-1 flex gap-2 overflow-hidden">
                                <span v-if="f.type === 'file' && f.fileName" class="flex-1 h-10 px-3 py-2 bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded text-sm text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent">{{ f.fileName }}</span>
                                <span v-else @click="f.fileRef.click()" class="flex-1 h-10 px-3 py-2 bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded text-sm text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent">选择文件</span>
                                <input type="file" :ref="el => { if (el) f.fileRef = el }"
                                    class="hidden flex-1 h-10 px-3 py-2 bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded text-sm text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
                                    placeholder="选择文件"
                                    @change="f.fileName = f.fileRef.files[0]?.name || ''">
                            </div>
                            <button @click="removeFormField(i)" class="w-8 h-8 flex items-center justify-center text-[var(--text-placeholder)] hover:text-[var(--danger)] hover:bg-[var(--danger-light)] rounded-lg transition-colors">
                                <IconTrash :size="14" />
                            </button>
                        </div>
                        <div class="flex-none">
                            <FButton type="default" size="sm" @click="addFormField"><IconPlus :size="14" />添加字段</FButton>
                        </div>
                    </div>
                    <textarea v-else v-model="body" placeholder="请求体内容..."
                        class="flex-1 w-full px-4 py-3 bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-lg text-sm font-mono text-[var(--text-primary)] resize-none outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"></textarea>
                </div>
            </div>

            <div v-if="response" class="bg-[var(--bg-surface)] rounded-xl shadow-sm border border-[var(--border-subtle)] p-5 flex flex-col gap-4 flex-1">
                <div class="flex items-center gap-3">
                    <span :class="['px-3 py-1.5 rounded-lg text-sm font-bold', response.statusCode < 300 ? 'bg-[var(--success-light)] text-[var(--success)]' : response.statusCode < 400 ? 'bg-[var(--warning-light)] text-[var(--warning)]' : 'bg-[var(--danger-light)] text-[var(--danger)]']">
                        {{ response.statusCode }} {{ response.statusText }}
                    </span>
                    <span class="text-sm text-[var(--text-placeholder)]">{{ response.duration }}ms</span>
                    <span v-if="localMode" class="text-sm text-[var(--accent)] bg-[var(--accent-light)] px-2 py-1 rounded-full">本地模式</span>
                </div>

                <div class="flex-none">
                    <label class="block text-sm font-semibold text-[var(--text-primary)] mb-2">响应头</label>
                    <div class="bg-[var(--bg-input)] rounded-lg px-4 py-3 text-sm font-mono max-h-[150px] overflow-y-auto">
                        <div v-for="(v, k) in response.headers" :key="k" class="flex flex-wrap">
                            <span class="text-[var(--text-placeholder)]">{{ k }}:</span> <span class="text-[var(--text-primary)] ml-1">{{ v }}</span>
                        </div>
                    </div>
                </div>

                <div class="flex-1 flex flex-col">
                    <div class="flex items-center justify-between mb-3">
                        <label class="text-sm font-semibold text-[var(--text-primary)]">响应体</label>
                        <div class="flex items-center gap-2">
                            <button @click="responseView = 'raw'" :class="['px-3 py-1.5 text-sm rounded-lg', responseView === 'raw' ? 'bg-[var(--accent-light)] text-[var(--accent)]' : 'text-[var(--text-placeholder)] hover:bg-[var(--bg-hover)]']">Raw</button>
                            <button @click="responseView = 'html'" :class="['px-3 py-1.5 text-sm rounded-lg', responseView === 'html' ? 'bg-[var(--accent-light)] text-[var(--accent)]' : 'text-[var(--text-placeholder)] hover:bg-[var(--bg-hover)]']">HTML</button>
                            <button @click="responseView = 'preview'" v-if="isImageResponse" :class="['px-3 py-1.5 text-sm rounded-lg', responseView === 'preview' ? 'bg-[var(--accent-light)] text-[var(--accent)]' : 'text-[var(--text-placeholder)] hover:bg-[var(--bg-hover)]']">图片预览</button>
                            <CopyButton :text="response.body"></CopyButton>
                        </div>
                    </div>
                    <textarea v-if="responseView === 'raw'" :value="response.body" readonly
                        class="flex-1 w-full px-4 py-3 bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-lg text-sm font-mono text-[var(--text-primary)] resize-none outline-none"></textarea>
                    <iframe v-else-if="responseView === 'html'" v-bind:srcdoc="response.body" class="flex-1 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)]"></iframe>
                    <div v-else class="flex-1 flex items-center justify-center overflow-auto bg-[var(--bg-input)] rounded-lg">
                        <img :src="response.body" class="max-w-full max-h-full object-contain rounded-lg border border-[var(--border-subtle)]"></img>
                    </div>
                </div>
            </div>

            <div v-else class="bg-[var(--bg-surface)] rounded-xl shadow-sm border border-[var(--border-subtle)] p-5 flex flex-col items-center justify-center text-[var(--text-placeholder)]">
                <IconPlay class="w-12 h-12 mb-3 text-[var(--border-subtle)]" />
                <span class="text-sm">发送请求后响应将显示在这里</span>
            </div>
        </div>
    </div>
    `,
    setup() {
        const method = ref('GET');
        const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
        const url = ref('https://example.com/api');
        const headers = ref([{ key: '', value: '' }]);
        const contentType = ref('application/json');
        const body = ref('');
        const formFields = ref([{ key: '', value: '', type: 'text', fileRef: null, fileName: '' }]);
        const response = ref(null);
        const loading = ref(false);
        const responseView = ref('raw');
        const localMode = ref(false);
        const showHelp = ref(false);

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
            method, methods, url, headers, contentType, body, formFields, response, loading, responseView, localMode, showHelp,
            isImageResponse,
            addHeader, removeHeader, addFormField, removeFormField, send, refresh
        };
    }
};
