import { IconPlus, IconTrash } from '../components/icon.js';

export const HttpView = {
    template: `
    <div class="space-y-6">
        <div class="flex items-center justify-end">
            <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" v-model="localMode" class="w-4 h-4 rounded text-[var(--accent)] border-[var(--border-subtle)] focus:ring-[var(--accent-subtle)]">
                <span class="text-xs text-[var(--text-secondary)]">本地模式</span>
            </label>
        </div>

        <div class="flex-1 flex flex-col gap-4">
            <div class="flex flex-col lg:flex-row lg:items-center gap-3">
                <FSingleSelect v-model="method" :options="methods.map(m => ({ value: m, label: m }))"></FSingleSelect>
                <input type="text" v-model="url" placeholder="https://example.com/api"
                    class="flex-1 px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-tertiary)] hover:border-[var(--border-strong)] focus:border-[var(--border-focus)]">
                <FButton @click="send" type="primary" :loading="loading">{{ loading ? '请求中...' : '发送' }}</FButton>
            </div>

            <div>
                <div class="flex items-center justify-between mb-2">
                    <label class="text-sm font-medium text-[var(--text-secondary)]">请求头</label>
                    <FButton type="default" size="sm" @click="addHeader">
                        <IconPlus :size="14" />
                        添加
                    </FButton>
                </div>
                <div v-for="(h, i) in headers" :key="i" class="flex gap-2 mb-2">
                    <input type="text" v-model="h.key" placeholder="键"
                        class="flex-1 min-w-[100px] px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-tertiary)] hover:border-[var(--border-strong)] focus:border-[var(--border-focus)]">
                    <input type="text" v-model="h.value" placeholder="值"
                        class="flex-1 min-w-[100px] px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-tertiary)] hover:border-[var(--border-strong)] focus:border-[var(--border-focus)]">
                    <button @click="removeHeader(i)" class="w-8 h-8 flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--danger)] hover:bg-[var(--bg-hover)] rounded transition-colors">
                        <IconTrash :size="14" />
                    </button>
                </div>
            </div>

            <div v-if="method !== 'GET'">
                <div class="flex flex-col lg:flex-row lg:items-center lg:gap-3 mb-2">
                    <label class="text-sm font-medium text-[var(--text-secondary)]">请求体</label>
                    <FSingleSelect v-model="contentType"
                        :options="[{value:'application/json',label:'application/json'},{value:'application/x-www-form-urlencoded',label:'application/x-www-form-urlencoded'},{value:'multipart/form-data',label:'multipart/form-data'},{value:'text/plain',label:'text/plain'},{value:'text/xml',label:'text/xml'}]"></FSingleSelect>
                </div>
                <div v-if="contentType === 'multipart/form-data' || contentType === 'application/x-www-form-urlencoded'">
                    <div v-for="(f, i) in formFields" :key="i" class="flex gap-2 mb-2">
                        <FSingleSelect v-if="contentType === 'multipart/form-data'" v-model="f.type"
                            :options="[{value:'text',label:'文本'},{value:'file',label:'文件'}]"></FSingleSelect>
                        <input type="text" v-model="f.key" placeholder="字段名"
                            class="flex-1 min-w-[100px] px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-tertiary)] hover:border-[var(--border-strong)] focus:border-[var(--border-focus)]">
                        <input v-if="f.type === 'text' || contentType === 'application/x-www-form-urlencoded'" type="text" v-model="f.value" placeholder="字段值"
                            class="flex-1 min-w-[100px] px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-tertiary)] hover:border-[var(--border-strong)] focus:border-[var(--border-focus)]">
                        <input v-else type="file" :ref="el => { if (el) f.fileRef = el }"
                            class="flex-1 min-w-[100px] text-xs self-center"
                            @change="f.fileName = f.fileRef.files[0]?.name || ''">
                        <span v-if="f.type === 'file' && f.fileName" class="text-xs text-[var(--text-tertiary)] truncate self-center max-w-[80px] lg:max-w-[120px]">{{ f.fileName }}</span>
                        <button @click="removeFormField(i)" class="w-8 h-8 flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--danger)] hover:bg-[var(--bg-hover)] rounded transition-colors">
                            <IconTrash :size="14" />
                        </button>
                    </div>
                    <FButton type="default" size="sm" @click="addFormField">+ 添加字段</FButton>
                </div>
                <textarea v-else v-model="body"  placeholder="请求体内容..."
                    class="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-sm text-[var(--text-primary)] font-mono resize-y outline-none placeholder:text-[var(--text-tertiary)] hover:border-[var(--border-strong)] focus:border-[var(--border-focus)]"></textarea>
            </div>

            <div v-if="response" class="flex-1 flex flex-col space-y-3 border-t border-[var(--border-subtle)] pt-4">
                <div class="flex items-center gap-2">
                    <span :class="['px-3 py-1 rounded text-sm font-bold', response.statusCode < 300 ? 'bg-[var(--success)]/10 text-[var(--success)]' : response.statusCode < 400 ? 'bg-[var(--warning)]/10 text-[var(--warning)]' : 'bg-[var(--danger)]/10 text-[var(--danger)]']">
                        {{ response.statusCode }} {{ response.statusText }}
                    </span>
                    <span class="text-xs text-[var(--text-tertiary)]">{{ response.duration }}ms</span>
                    <span v-if="localMode" class="text-xs text-[var(--accent)] bg-[var(--accent-subtle)] px-2 py-0.5 rounded">本地模式</span>
                </div>

                <div>
                    <label class="block text-xs font-medium text-[var(--text-secondary)] mb-1">响应头</label>
                    <div class="bg-[var(--bg-surface)] rounded px-3 py-2 text-xs font-mono">
                        <div v-for="(v, k) in response.headers" :key="k" class="flex flex-wrap">
                            <span class="text-[var(--text-tertiary)]">{{ k }}:</span> <span class="text-[var(--text-primary)] ml-1">{{ v }}</span>
                        </div>
                    </div>
                </div>

                <div class="flex-1 flex flex-col">
                    <div class="flex items-center justify-between mb-2">
                        <label class="text-xs font-medium text-[var(--text-secondary)]">响应体</label>
                        <div class="flex items-center gap-2">
                            <button @click="responseView = 'raw'" :class="['px-2 py-1 text-xs rounded', responseView === 'raw' ? 'bg-[var(--accent-subtle)] text-[var(--accent)]' : 'text-[var(--text-tertiary)] hover:bg-[var(--bg-hover)]']">Raw</button>
                            <button @click="responseView = 'html'" :class="['px-2 py-1 text-xs rounded', responseView === 'html' ? 'bg-[var(--accent-subtle)] text-[var(--accent)]' : 'text-[var(--text-tertiary)] hover:bg-[var(--bg-hover)]']">HTML</button>
                            <button @click="responseView = 'preview'" v-if="isImageResponse" :class="['px-2 py-1 text-xs rounded', responseView === 'preview' ? 'bg-[var(--accent-subtle)] text-[var(--accent)]' : 'text-[var(--text-tertiary)] hover:bg-[var(--bg-hover)]']">图片预览</button>
                            <CopyButton :text="response.body"></CopyButton>
                        </div>
                    </div>
                    <textarea v-if="responseView === 'raw'" :value="response.body" readonly
                        class="w-full flex-1 min-h-[150px] px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] resize-y outline-none"></textarea>
                    <iframe v-else-if="responseView === 'html'" v-bind:srcdoc="response.body" class="flex-1 w-full min-h-[150px] rounded border border-[var(--border-subtle)] bg-white"></iframe>
                    <img v-else :src="response.body" class="max-w-full max-h-[300px] object-contain rounded border border-[var(--border-subtle)]">
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            method: 'GET',
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
            url: '',
            headers: [{ key: '', value: '' }],
            contentType: 'application/json',
            body: '',
            formFields: [{ key: '', value: '', type: 'text', fileRef: null, fileName: '' }],
            response: null,
            loading: false,
            responseView: 'raw',
            localMode: false
        };
    },
    computed: {
        isImageResponse() {
            if (!this.response) return false;
            const body = this.response.body || '';
            return body.startsWith('data:image/');
        }
    },
    methods: {
        addHeader() { this.headers.push({ key: '', value: '' }); },
        removeHeader(i) { this.headers.splice(i, 1); },
        addFormField() { this.formFields.push({ key: '', value: '', type: 'text', fileRef: null, fileName: '' }); },
        removeFormField(i) { this.formFields.splice(i, 1); },
        async send() {
            if (!this.url) return;
            this.loading = true;
            this.response = null;
            try {
                const headers = {};
                this.headers.filter(h => h.key).forEach(h => { headers[h.key] = h.value; });
                let body = null;
                let sendContentType = null;
                let isFormData = false;
                const formDataObj = new FormData();
                if (this.method !== 'GET') {
                    if (this.contentType === 'multipart/form-data') {
                        this.formFields.filter(f => f.key).forEach(f => {
                            if (f.type === 'file' && f.fileRef && f.fileRef.files[0]) {
                                formDataObj.append(f.key, f.fileRef.files[0]);
                            } else {
                                formDataObj.append(f.key, f.value);
                            }
                        });
                        isFormData = true;
                    } else if (this.contentType === 'application/x-www-form-urlencoded') {
                        const params = new URLSearchParams();
                        this.formFields.filter(f => f.key).forEach(f => {
                            params.append(f.key, f.value);
                        });
                        body = params.toString();
                        sendContentType = this.contentType;
                    } else {
                        body = this.body;
                        sendContentType = this.contentType;
                    }
                }
                const startTime = Date.now();
                const res = await (this.localMode ? this.localHttpSend({ method: this.method, url: this.url, headers, body, contentType: sendContentType, formData: isFormData ? formDataObj : null }) : this.proxyHttpSend({ method: this.method, url: this.url, headers, body, contentType: sendContentType, formData: isFormData ? formDataObj : null }));
                this.response = res.data;
                this.response.duration = Date.now() - startTime;
            } catch(e) {
                this.response = { statusCode: 0, statusText: 'Error', headers: {}, body: e.message, duration: 0 };
            } finally {
                this.loading = false;
            }
        },
        async proxyHttpSend({ method, url, headers, body, contentType, formData }) {
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
        },
        async localHttpSend({ method, url, headers, body, contentType, formData }) {
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
        },
        refresh() {
            this.method = 'GET';
            this.url = '';
            this.headers = [{ key: '', value: '' }];
            this.contentType = 'application/json';
            this.body = '';
            this.formFields = [{ key: '', value: '', type: 'text', fileRef: null, fileName: '' }];
            this.response = null;
            this.loading = false;
            this.responseView = 'raw';
        }
    }
};