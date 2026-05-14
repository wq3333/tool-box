const { ref, watch } = Vue;

export const FileBase64View = {
    template: `
    <div class="h-full flex flex-col gap-4 p-4 bg-gradient-to-br from-slate-50 to-slate-100">
        <div class="flex-none">
            <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-1">
                <div class="flex gap-1">
                    <button v-for="tab in tabs" :key="tab.key" @click="activeTab = tab.key"
                        :class="['px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200',
                                activeTab === tab.key ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100']">
                        {{ tab.label }}
                    </button>
                </div>
            </div>
        </div>

        <div v-if="activeTab === 'encode'" class="flex-none">
            <label class="flex items-center gap-2 cursor-pointer p-3 bg-white rounded-xl shadow-sm border border-slate-200 hover:border-slate-300 transition-colors">
                <input type="checkbox" v-model="includePrefix" class="w-4 h-4 rounded border-slate-300 text-blue-500 focus:ring-blue-500 focus:ring-offset-0">
                <span class="text-sm text-slate-600">包含数据URI前缀 (data:xxx;base64,)</span>
            </label>
        </div>

        <div class="flex-1 min-h-0 flex flex-col md:flex-row gap-4">
            <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col gap-4 flex-1 min-h-0">
                <div class="flex-1 min-h-0 flex flex-col gap-3">
                    <div class="flex items-center justify-between">
                        <label class="text-sm font-semibold text-slate-700">{{ activeTab === 'encode' ? '输入文件' : '输入Base64' }}</label>
                        <button v-if="activeTab === 'encode'" @click="triggerFileInput" class="px-3 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center gap-1.5 shadow-md hover:shadow-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            选择文件
                        </button>
                        <input type="file" ref="fileInputRef" @change="onFileSelect($event)" class="hidden">
                    </div>
                    <div v-if="activeTab === 'encode' && fileName" class="px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-700 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        {{ fileName }}
                    </div>
                    <textarea v-if="activeTab === 'decode'" v-model="result" placeholder="请输入Base64内容..."
                        class="flex-1 min-h-0 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-700 outline-none resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400"></textarea>
                    <div v-else-if="activeTab === 'encode' && !fileName" class="flex-1 min-h-[120px] flex flex-col items-center justify-center text-slate-400">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12 mb-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <span class="text-sm">点击上方按钮选择文件</span>
                    </div>
                </div>
            </div>

            <div class="flex flex-col gap-3 self-center w-14">
                <div class="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                </div>
                <FButton type="primary" @click="execute" block>{{ executeLabel }}</FButton>
            </div>

            <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col gap-4 flex-1 min-h-0">
                <div class="flex items-center justify-between">
                    <label class="text-sm font-semibold text-slate-700">结果</label>
                    <div class="flex gap-2">
                        <button v-if="decodedBlob" @click="downloadResult" class="px-3 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 flex items-center gap-1.5 shadow-md hover:shadow-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            下载
                        </button>
                        <CopyButton v-if="activeTab === 'encode' && result" :text="result"></CopyButton>
                    </div>
                </div>
                <div v-if="activeTab === 'encode' && isImagePreview" class="flex-1 min-h-[100px] flex items-center justify-center bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
                    <img :src="imagePreviewUrl" class="max-w-full max-h-[300px] object-contain">
                </div>
                <textarea v-if="activeTab === 'encode'" v-model="result" readonly placeholder="Base64 编码结果..."
                    class="flex-1 min-h-0 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-700 outline-none resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400"></textarea>
                <div v-else-if="activeTab === 'decode' && decodedBlob" class="flex-1 min-h-[100px] flex flex-col items-center justify-center bg-slate-50 rounded-lg border border-slate-200 p-4">
                    <img v-if="isImage" :src="decodedUrl" class="max-w-full max-h-[250px] object-contain rounded-lg">
                    <div v-else class="text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12 mx-auto mb-2 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span class="text-sm text-slate-600">文件已解码，点击下载按钮保存</span>
                    </div>
                </div>
                <div v-else-if="activeTab === 'decode'" class="flex-1 min-h-[100px] flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-lg border border-slate-200">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12 mb-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span class="text-sm">解码结果将在此显示...</span>
                </div>
                <div v-else class="flex-1 min-h-[100px] flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-lg border border-slate-200">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12 mb-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span class="text-sm">结果将在此显示...</span>
                </div>
            </div>
        </div>
    </div>
    `,
    setup() {
        const activeTab = ref('encode');
        const tabs = [
            { key: 'encode', label: '文件转Base64' },
            { key: 'decode', label: 'Base64转文件' }
        ];
        const fileName = ref('');
        const fileData = ref(null);
        const result = ref('');
        const decodedBlob = ref(null);
        const decodedUrl = ref('');
        const isImage = ref(false);
        const fileInputRef = ref(null);
        const includePrefix = ref(true);
        const isImagePreview = ref(false);
        const imagePreviewUrl = ref('');

        const executeLabel = ref('执行');

        watch(activeTab, (newTab, oldTab) => {
            if (newTab === 'decode') {
                fileName.value = '';
                fileData.value = null;
                isImagePreview.value = false;
                imagePreviewUrl.value = '';
            } else {
                decodedBlob.value = null;
                decodedUrl.value = '';
                isImage.value = false;
            }
        });

        const triggerFileInput = () => {
            fileInputRef.value?.click();
        };

        const maxFileSize = 5 * 1024 * 1024;

        const onFileSelect = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            if (file.size > maxFileSize) {
                alert('文件大小不能超过5MB');
                return;
            }
            
            fileName.value = file.name;
            if (activeTab.value === 'encode') {
                const reader = new FileReader();
                reader.onload = (e) => {
                    fileData.value = e.target.result;
                    const fullDataUrl = e.target.result;
                    const mimeType = fullDataUrl.match(/data:([^;]+)/)?.[1] || '';
                    isImagePreview.value = mimeType.startsWith('image/');
                    imagePreviewUrl.value = fullDataUrl;
                    
                    if (includePrefix.value) {
                        result.value = fullDataUrl;
                    } else {
                        result.value = fullDataUrl.split(',')[1];
                    }
                };
                reader.readAsDataURL(file);
            } else {
                const text = await file.text();
                result.value = text.trim();
                executeDecode();
            }
        };

        const execute = () => {
            if (activeTab.value === 'encode') {
                if (!fileName.value) {
                    alert('请先选择文件');
                    return;
                }
                if (fileData.value) {
                    if (includePrefix.value) {
                        result.value = fileData.value;
                    } else {
                        result.value = fileData.value.split(',')[1];
                    }
                }
            } else {
                executeDecode();
            }
        };

        const executeDecode = () => {
            if (!result.value) {
                alert('请输入Base64内容或选择包含Base64的文件');
                return;
            }
            try {
                const base64Data = result.value.split(',')[1] || result.value;
                const mimeType = result.value.match(/data:([^;]+)/)?.[1] || 'application/octet-stream';
                const byteString = atob(base64Data);
                const ab = new ArrayBuffer(byteString.length);
                const ia = new Uint8Array(ab);
                for (let i = 0; i < byteString.length; i++) {
                    ia[i] = byteString.charCodeAt(i);
                }
                decodedBlob.value = new Blob([ab], { type: mimeType });
                decodedUrl.value = URL.createObjectURL(decodedBlob.value);
                isImage.value = mimeType.startsWith('image/');
            } catch (e) {
                alert('解码失败: ' + e.message);
            }
        };

        const downloadResult = () => {
            if (!decodedBlob.value) return;
            const link = document.createElement('a');
            link.href = decodedUrl.value;
            link.download = 'decoded_file';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };

        const refresh = () => {
            activeTab.value = 'encode';
            fileName.value = '';
            fileData.value = null;
            result.value = '';
            decodedBlob.value = null;
            decodedUrl.value = '';
            isImage.value = false;
            isImagePreview.value = false;
            imagePreviewUrl.value = '';
        };

        return {
            activeTab, tabs, fileName, result, decodedBlob, decodedUrl, isImage, fileInputRef,
            includePrefix, isImagePreview, imagePreviewUrl,
            executeLabel, triggerFileInput, onFileSelect, execute, downloadResult, refresh
        };
    }
};