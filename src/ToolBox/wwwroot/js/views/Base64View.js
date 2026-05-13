import { IconFile, IconDownload } from '../components/icon.js';
import { CopyButton } from '../components/CopyButton.js';
import { FInput } from '../components/FInput.js';

const { ref } = Vue;

export const Base64View = {
    name: 'Base64View',
    template: `
    <div class="space-y-6">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="space-y-3">
                <div class="flex items-center justify-between">
                    <label class="text-sm font-medium text-[var(--text-secondary)]">文件转Base64</label>
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" v-model="addPrefix" class="w-4 h-4 rounded text-[var(--accent)] border-[var(--border-subtle)] focus:ring-[var(--accent-subtle)]">
                        <span class="text-xs text-[var(--text-tertiary)]">添加前缀</span>
                    </label>
                </div>
                
                <div class="relative border-2 border-dashed border-[var(--border-subtle)] rounded-lg p-8 text-center hover:border-[var(--border-strong)] transition-colors cursor-pointer"
                    @click="triggerFileInput"
                    @dragover.prevent
                    @drop.prevent="handleDrop">
                    <input ref="fileInputRef" type="file" class="hidden" @change="handleFileSelect">
                    <IconUpload class="mx-auto mb-2 text-[var(--text-tertiary)]" :size="32" />
                    <p class="text-sm text-[var(--text-secondary)]">点击或拖拽文件到此处</p>
                    <p v-if="selectedFile" class="text-xs text-[var(--accent)] mt-2">{{ selectedFile.name }}</p>
                </div>

                <FButton v-if="selectedFile" type="primary" @click="convertFileToBase64" :loading="converting">
                    {{ converting ? '转换中...' : '转换为Base64' }}
                </FButton>

                <div v-if="fileBase64" class="space-y-2">
                    <div class="flex items-center justify-between">
                        <span class="text-xs text-[var(--text-tertiary)]">转换结果</span>
                        <CopyButton :text="fileBase64" />
                    </div>
                    <textarea 
                        :value="fileBase64" 
                        readonly 
                        class="w-full h-32 px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] resize-y outline-none"
                    ></textarea>
                </div>

                <div v-if="imagePreview" class="space-y-2">
                    <span class="text-xs text-[var(--text-tertiary)]">图片预览</span>
                    <img :src="imagePreview" class="max-w-full max-h-48 object-contain rounded border border-[var(--border-subtle)]" />
                </div>
            </div>

            <div class="space-y-3">
                <label class="text-sm font-medium text-[var(--text-secondary)]">Base64转文件</label>
                
                <textarea 
                    v-model="base64Input" 
                    placeholder="粘贴Base64编码..."
                    class="w-full h-40 px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] resize-y outline-none placeholder:text-[var(--text-tertiary)]"
                ></textarea>

                <div class="flex gap-2">
                    <FInput v-model="fileName" placeholder="文件名（含扩展名）" class="flex-1" />
                    <FButton type="primary" @click="downloadFile" :disabled="!base64Input || !fileName">
                        <IconDownload :size="14" />
                        下载文件
                    </FButton>
                </div>

                <div v-if="inputImagePreview" class="space-y-2">
                    <span class="text-xs text-[var(--text-tertiary)]">输入预览</span>
                    <img :src="inputImagePreview" class="max-w-full max-h-48 object-contain rounded border border-[var(--border-subtle)]" />
                </div>
            </div>
        </div>
    </div>
    `,
    setup() {
        const fileInputRef = ref(null);
        const selectedFile = ref(null);
        const addPrefix = ref(true);
        const fileBase64 = ref('');
        const imagePreview = ref('');
        const base64Input = ref('');
        const fileName = ref('');
        const inputImagePreview = ref('');
        const converting = ref(false);

        const IconUpload = {
            props: { size: { type: Number, default: 24 } },
            template: `<svg xmlns="http://www.w3.org/2000/svg" :width="size" :height="size" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>`
        };

        const triggerFileInput = () => {
            fileInputRef.value?.click();
        };

        const handleFileSelect = (e) => {
            const file = e.target.files?.[0];
            if (file) {
                selectedFile.value = file;
                fileBase64.value = '';
                imagePreview.value = '';
            }
        };

        const handleDrop = (e) => {
            const file = e.dataTransfer?.files?.[0];
            if (file) {
                selectedFile.value = file;
                fileBase64.value = '';
                imagePreview.value = '';
            }
        };

        const convertFileToBase64 = async () => {
            if (!selectedFile.value) return;
            
            converting.value = true;
            const reader = new FileReader();
            
            reader.onload = (e) => {
                let result = e.target?.result;
                if (!addPrefix.value) {
                    result = result.split(',')[1] || result;
                }
                fileBase64.value = result;
                
                if (selectedFile.value.type.startsWith('image/')) {
                    imagePreview.value = e.target?.result;
                } else {
                    imagePreview.value = '';
                }
                converting.value = false;
            };
            
            reader.readAsDataURL(selectedFile.value);
        };

        const downloadFile = () => {
            if (!base64Input.value || !fileName.value) return;
            
            let data = base64Input.value;
            if (!data.startsWith('data:')) {
                const ext = fileName.value.split('.').pop()?.toLowerCase();
                let mimeType = 'application/octet-stream';
                if (ext === 'png') mimeType = 'image/png';
                else if (ext === 'jpg' || ext === 'jpeg') mimeType = 'image/jpeg';
                else if (ext === 'gif') mimeType = 'image/gif';
                else if (ext === 'svg') mimeType = 'image/svg+xml';
                else if (ext === 'pdf') mimeType = 'application/pdf';
                else if (ext === 'txt') mimeType = 'text/plain';
                data = `data:${mimeType};base64,${data}`;
            }
            
            const link = document.createElement('a');
            link.href = data;
            link.download = fileName.value;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };

        const checkInputImage = () => {
            const input = base64Input.value.trim();
            if (input.startsWith('data:image/')) {
                inputImagePreview.value = input;
            } else if (input.length > 100) {
                const ext = fileName.value.split('.').pop()?.toLowerCase();
                if (['png', 'jpg', 'jpeg', 'gif', 'svg'].includes(ext)) {
                    inputImagePreview.value = `data:image/${ext};base64,${input}`;
                } else {
                    inputImagePreview.value = '';
                }
            } else {
                inputImagePreview.value = '';
            }
        };

        base64Input.value = '';
        base64Input.value = '';

        const refresh = () => {
            selectedFile.value = null;
            fileBase64.value = '';
            imagePreview.value = '';
            base64Input.value = '';
            fileName.value = '';
            inputImagePreview.value = '';
            converting.value = false;
        };

        return {
            fileInputRef,
            selectedFile,
            addPrefix,
            fileBase64,
            imagePreview,
            base64Input,
            fileName,
            inputImagePreview,
            converting,
            IconUpload,
            triggerFileInput,
            handleFileSelect,
            handleDrop,
            convertFileToBase64,
            downloadFile,
            checkInputImage,
            refresh
        };
    },
    watch: {
        base64Input() {
            this.checkInputImage();
        },
        fileName() {
            this.checkInputImage();
        }
    }
};