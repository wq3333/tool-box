import { IconCopy, IconCheck, IconX } from './icon.js';

const { ref } = Vue;

export const CopyButton = {
    name: 'CopyButton',
    props: {
        text: { type: String, default: '' }
    },
    components: {
        IconCopy,
        IconCheck,
        IconX
    },
    template: `
        <button 
            class="inline-flex items-center justify-center size-[15px] rounded border border-transparent text-[var(--text-tertiary)] cursor-pointer transition-all duration-150 ease-out hover:bg-[var(--bg-hover)] hover:text-[var(--text-secondary)] relative"
            :title="tooltip"
            @click="handleCopy">
            <IconCopy v-if="status === 'idle'" :size="16" />
            <IconCheck v-else-if="status === 'success'" :size="16" class="text-[var(--success)]" />
            <IconX v-else :size="16" class="text-[var(--danger)]" />
        </button>
    `,
    setup(props) {
        const status = ref('idle'); // idle, success, error
        const tooltip = ref('复制');

        const resetStatus = () => {
            setTimeout(() => {
                status.value = 'idle';
                tooltip.value = '复制';
            }, 2000);
        };

        const fallbackCopy = async (text) => {
            // 传统降级方案
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.top = '0';
            textArea.style.left = '0';
            textArea.style.width = '2em';
            textArea.style.height = '2em';
            textArea.style.padding = '0';
            textArea.style.border = 'none';
            textArea.style.outline = 'none';
            textArea.style.boxShadow = 'none';
            textArea.style.background = 'transparent';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                const successful = document.execCommand('copy');
                document.body.removeChild(textArea);
                return successful;
            } catch (err) {
                document.body.removeChild(textArea);
                return false;
            }
        };

        const handleCopy = async () => {
            if (!props.text) return;

            try {
                // 尝试使用现代 Clipboard API
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    await navigator.clipboard.writeText(props.text);
                    status.value = 'success';
                    tooltip.value = '已复制';
                    resetStatus();
                    return;
                }
            } catch (err) {
                console.warn('Modern clipboard API failed, falling back:', err);
            }

            // 降级方案
            const success = await fallbackCopy(props.text);
            if (success) {
                status.value = 'success';
                tooltip.value = '已复制';
            } else {
                status.value = 'error';
                tooltip.value = '复制失败，请手动选择文本复制';
            }
            resetStatus();
        };

        return { status, tooltip, handleCopy };
    }
};
