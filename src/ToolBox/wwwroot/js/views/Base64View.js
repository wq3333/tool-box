const { ref, watch } = Vue;

export const FileBase64View = {
    template: `
    <div class="h-full flex flex-col gap-4 p-4">
        <div class="flex-none">
            <div class="hidden lg:flex gap-1 border-b border-[var(--border-subtle)] pb-3">
                <button v-for="tab in tabs" :key="tab.key" @click="activeTab = tab.key"
                    :class="['px-4 py-2 text-sm rounded transition-colors',
                            activeTab === tab.key ? 'bg-[var(--accent)] text-[var(--text-inverse)]' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]']">
                    {{ tab.label }}
                </button>
            </div>
            <div class="lg:hidden">
                <label class="block text-xs font-medium text-[var(--text-secondary)] mb-1">选择操作</label>
                <FSingleSelect v-model="activeTab" :options="tabs.map(t => ({ value: t.key, label: t.label }))"></FSingleSelect>
            </div>
        </div>

        <div v-if="activeTab === 'encode'" class="flex-none">
            <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" v-model="includePrefix" class="w-4 h-4 rounded border-[var(--border-subtle)] text-[var(--accent)] focus:ring-[var(--accent)]">
                <span class="text-xs text-[var(--text-secondary)]">包含数据URI前缀 (data:xxx;base64,)</span>
            </label>
        </div>

        <div class="flex-1 min-h-0 flex flex-col md:flex-row gap-4">
            <div class="bg-[var(--bg-surface)] rounded-lg border border-[var(--border-subtle)] p-4 flex flex-col gap-3 flex-1 min-h-0">
                <div class="flex-1 min-h-0 flex flex-col gap-2">
                    <div class="flex items-center justify-between">
                        <label class="block text-xs font-medium text-[var(--text-secondary)]">{{ activeTab === 'encode' ? '输入文件' : '输入Base64' }}</label>
                        <button v-if="activeTab === 'encode'" @click="triggerFileInput" class="px-2 py-1 text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] rounded flex items-center gap-1">
                            <span>📁</span>选择文件
                        </button>
                        <input type="file" ref="fileInputRef" @change="onFileSelect($event)" class="hidden">
                    </div>
                    <div v-if="activeTab === 'encode' && fileName" class="px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)]">
                        {{ fileName }}
                    </div>
                    <textarea v-if="activeTab === 'decode'" v-model="result" placeholder="请输入Base64内容..."
                        class="flex-1 min-h-0 px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none resize-none"></textarea>
                    <div v-else-if="activeTab === 'encode' && !fileName" class="flex-1 min-h-[100px] flex items-center justify-center text-[var(--text-tertiary)] text-sm">
                        点击上方按钮选择文件
                    </div>
                </div>
            </div>

            <div class="flex flex-col gap-2 self-center w-40">
                <FButton type="primary" @click="execute">{{ executeLabel }}</FButton>
            </div>

            <div class="bg-[var(--bg-surface)] rounded-lg border border-[var(--border-subtle)] p-4 flex flex-col gap-3 flex-1 min-h-0">
                <div class="flex items-center justify-between">
                    <label class="block text-xs font-medium text-[var(--text-secondary)]">结果</label>
                    <div class="flex gap-2">
                        <button v-if="decodedBlob" @click="downloadResult" class="px-2 py-1 text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] rounded flex items-center gap-1">
                            <span>📥</span>下载
                        </button>
                        <CopyButton v-if="activeTab === 'encode' && result" :text="result"></CopyButton>
                    </div>
                </div>
                <div v-if="activeTab === 'encode' && isImagePreview" class="flex-1 min-h-[100px] flex items-center justify-center">
                    <img :src="imagePreviewUrl" class="max-w-full max-h-[300px] object-contain rounded">
                </div>
                <textarea v-if="activeTab === 'encode'" v-model="result" readonly placeholder="Base64 编码结果..."
                    class="flex-1 min-h-0 px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] outline-none resize-none"></textarea>
                <div v-else-if="activeTab === 'decode' && decodedBlob" class="flex-1 min-h-[100px] flex items-center justify-center">
                    <img v-if="isImage" :src="decodedUrl" class="max-w-full max-h-[300px] object-contain rounded">
                    <div v-else class="text-sm text-[var(--text-secondary)]">
                        文件已解码，点击下载按钮保存
                    </div>
                </div>
                <div v-else-if="activeTab === 'decode'" class="flex-1 min-h-[100px] flex items-center justify-center text-[var(--text-tertiary)] text-sm">
                    解码结果将在此显示...
                </div>
                <div v-else class="flex-1 min-h-[100px] flex items-center justify-center text-[var(--text-tertiary)] text-sm">
                    结果将在此显示...
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