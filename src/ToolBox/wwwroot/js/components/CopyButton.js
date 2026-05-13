import { IconCopy, IconCheck } from './icon.js';

const { ref } = Vue;

export const CopyButton = {
    name: 'CopyButton',
    props: {
        text: { type: String, default: '' }
    },
    template: `
        <button 
            class="inline-flex items-center justify-center w-7 h-7 rounded border border-transparent text-[var(--text-tertiary)] cursor-pointer transition-all duration-150 ease-out hover:bg-[var(--bg-hover)] hover:text-[var(--text-secondary)]"
            :title="copied ? '已复制' : '复制'"
            @click="handleCopy">
            <IconCopy v-if="!copied" :size="16" />
            <IconCheck v-else :size="16" class="text-[var(--success)]" />
        </button>
    `,
    setup(props) {
        const copied = ref(false);

        const handleCopy = async () => {
            if (!props.text) return;
            await navigator.clipboard.writeText(props.text);
            copied.value = true;
            setTimeout(() => { copied.value = false; }, 1500);
        };

        return { copied, handleCopy };
    }
};