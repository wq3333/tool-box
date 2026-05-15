import { IconDownload, IconUpload, IconFile, IconClose } from '../components/icon.js';
import { toast } from '../components/Toast.js';

const { ref, computed } = Vue;

export const FileBase64View = {
    components: { IconDownload, IconUpload, IconFile, IconClose },
    template: `
    <div class="h-full flex flex-col gap-3 p-4 bg-gradient-to-br from-slate-50 to-slate-100">
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
                <input type="checkbox" v-model="encode.includePrefix" class="w-4 h-4 rounded border-slate-300 text-blue-500 focus:ring-blue-500 focus:ring-offset-0">
                <span class="text-sm text-slate-600">包含数据URI前缀 (data:xxx;base64,)</span>
            </label>
        </div>

        <div class="flex-1 min-h-0 flex flex-col md:flex-row gap-3">
            <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col gap-3 flex-1 min-h-0">
                <div class="flex-1 min-h-0 flex flex-col gap-3">
                    <label class="text-sm font-semibold text-slate-700">{{ activeTab === 'encode' ? '输入文件' : '输入Base64' }}</label>
                    <input type="file" ref="fileInputRef" @change="onFileSelect" class="hidden">
                    
                    <div v-if="activeTab === 'encode'" class="flex-1 min-h-[120px]">
                        <div v-if="encode.fileName" class="h-full flex flex-col items-center justify-center">
                            <div class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-700 flex items-center justify-between">
                                <div class="flex items-center gap-2">
                                    <IconFile />
                                    {{ encode.fileName }}
                                </div>
                                <FButton type="danger" size="sm" @click="clearEncodeFile">
                                    <IconClose />
                                </FButton>
                            </div>
                        </div>
                        <div 
                            v-else
                            class="h-full flex flex-col items-center justify-center border-2 border-dashed rounded-lg transition-all duration-200"
                            :class="encode.isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300 bg-slate-50'"
                            @dragenter.prevent="handleEncodeDragOver"
                            @dragover.prevent="handleEncodeDragOver"
                            @dragleave.prevent="handleEncodeDragLeave"
                            @drop.prevent="handleEncodeDrop"
                            @click="triggerFileInput"
                        >
                            <IconUpload class="w-12 h-12 mb-3 transition-colors" :class="encode.isDragging ? 'text-blue-500' : 'text-slate-400'"/>
                            <span class="text-sm font-medium" :class="encode.isDragging ? 'text-blue-600' : 'text-slate-500'">{{ encode.isDragging ? '松开以上传文件' : '点击或拖放文件到此处' }}</span>
                        </div>
                    </div>
                    
                    <textarea v-if="activeTab === 'decode'" v-model="decode.input" placeholder="请输入Base64内容..."
                        class="flex-1 min-h-0 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-700 outline-none resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400"></textarea>
                </div>
            </div>

            <div class="flex flex-col gap-3 self-center w-14">
                <FButton type="primary" @click="execute" block>{{ executeLabel }}</FButton>
            </div>

            <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col gap-3 flex-1 min-h-0">
                <div class="flex items-center justify-between">
                    <label class="text-sm font-semibold text-slate-700">结果</label>
                    <div class="flex gap-2">
                        <FButton v-if="decode.blob" size="sm" type="success" @click="downloadDecodeResult">
                            <IconDownload :size="10" />
                        </FButton>
                        <CopyButton v-if="activeTab === 'encode' && encode.result" :text="encode.result"></CopyButton>
                    </div>
                </div>
                
                <template v-if="activeTab === 'encode'">
                    <textarea v-model="encode.result" readonly placeholder="Base64 编码结果..."
                        class="flex-1 min-h-0 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-700 outline-none resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400"></textarea>
                    <div v-if="encode.isImagePreview" class="flex-1 min-h-[100px] flex items-center justify-center bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
                        <img :src="encode.imagePreviewUrl" class="max-w-full max-h-[300px] object-contain">
                    </div>
                </template>
                
                <template v-else-if="activeTab === 'decode'">
                    <div v-if="decode.blob" class="flex-1 min-h-[100px] flex flex-col items-center justify-center bg-slate-50 rounded-lg border border-slate-200 p-4">
                        <img v-if="decode.isImage" :src="decode.url" class="max-w-full max-h-[250px] object-contain rounded-lg">
                        <div v-else class="text-center">
                            <IconUpload :size="48" class="mx-auto mb-2 text-slate-300" />
                            <span class="text-sm text-slate-600">文件已解码，点击下载按钮保存</span>
                        </div>
                    </div>
                    <div v-else class="flex-1 min-h-[100px] flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-lg border border-slate-200">
                        <IconFile :size="48" class="mb-3 text-slate-300" />
                        <span class="text-sm">解码结果将在此显示...</span>
                    </div>
                </template>
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
        
        const encode = ref({
            fileName: '',
            fileData: null,
            result: '',
            includePrefix: true,
            isImagePreview: false,
            imagePreviewUrl: '',
            isDragging: false
        });
        
        const decode = ref({
            input: '',
            blob: null,
            url: '',
            isImage: false
        });
        
        const fileInputRef = ref(null);
        const maxFileSize = 5 * 1024 * 1024;

        const executeLabel = computed(() => activeTab.value === 'encode' ? '编码' : '解码');

        const triggerFileInput = () => {
            fileInputRef.value?.click();
        };

        const clearEncodeFile = () => {
            encode.value.fileName = '';
            encode.value.fileData = null;
            encode.value.result = '';
            encode.value.isImagePreview = false;
            encode.value.imagePreviewUrl = '';
            if (fileInputRef.value) {
                fileInputRef.value.value = '';
            }
        };

        const handleEncodeDragOver = () => {
            encode.value.isDragging = true;
        };

        const handleEncodeDragLeave = () => {
            encode.value.isDragging = false;
        };

        const handleEncodeDrop = (e) => {
            encode.value.isDragging = false;
            const files = e.dataTransfer?.files;
            if (files && files.length > 0) {
                processEncodeFile(files[0]);
            }
        };

        const processEncodeFile = (file) => {
            if (file.size > maxFileSize) {
                toast.warning('文件大小不能超过5MB');
                return;
            }
            
            encode.value.fileName = file.name;
            const reader = new FileReader();
            reader.onload = (event) => {
                const fullDataUrl = event.target.result;
                encode.value.fileData = fullDataUrl;
                
                const mimeType = fullDataUrl.match(/data:([^;]+)/)?.[1] || '';
                encode.value.isImagePreview = mimeType.startsWith('image/');
                encode.value.imagePreviewUrl = fullDataUrl;
            };
            reader.readAsDataURL(file);
        };

        const onFileSelect = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            if (activeTab.value === 'encode') {
                processEncodeFile(file);
            } else {
                file.text().then(text => {
                    decode.value.input = text.trim();
                    executeDecode();
                });
            }
        };

        const execute = () => {
            if (activeTab.value === 'encode') {
                if (!encode.value.fileName) {
                    toast.warning('请先选择文件');
                    return;
                }
                if (encode.value.fileData) {
                    encode.value.result = encode.value.includePrefix 
                        ? encode.value.fileData 
                        : encode.value.fileData.split(',')[1];
                }
            } else {
                executeDecode();
            }
        };

        const executeDecode = () => {
            if (!decode.value.input) {
                toast.warning('请输入Base64内容');
                return;
            }
            
            try {
                const base64Data = decode.value.input.split(',')[1] || decode.value.input;
                const mimeType = decode.value.input.match(/data:([^;]+)/)?.[1] || 'application/octet-stream';
                const byteString = atob(base64Data);
                const ab = new ArrayBuffer(byteString.length);
                const ia = new Uint8Array(ab);
                
                for (let i = 0; i < byteString.length; i++) {
                    ia[i] = byteString.charCodeAt(i);
                }
                
                decode.value.blob = new Blob([ab], { type: mimeType });
                decode.value.url = URL.createObjectURL(decode.value.blob);
                decode.value.isImage = mimeType.startsWith('image/');
            } catch (e) {
                toast.error('解码失败: ' + e.message);
            }
        };

        const downloadDecodeResult = () => {
            if (!decode.value.blob) return;
            const link = document.createElement('a');
            link.href = decode.value.url;
            link.download = 'decoded_file';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };

        const refresh = () => {
            activeTab.value = 'encode';
            encode.value = {
                fileName: '',
                fileData: null,
                result: '',
                includePrefix: true,
                isImagePreview: false,
                imagePreviewUrl: '',
                isDragging: false
            };
            decode.value = {
                input: '',
                blob: null,
                url: '',
                isImage: false
            };
        };

        return {
            activeTab, tabs, encode, decode, fileInputRef,
            executeLabel, triggerFileInput, onFileSelect, execute, 
            downloadDecodeResult, refresh, clearEncodeFile,
            handleEncodeDragOver, handleEncodeDragLeave, handleEncodeDrop
        };
    }
};
