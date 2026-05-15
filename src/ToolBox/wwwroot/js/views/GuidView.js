import { FInput } from '../components/FInput.js';
import { CopyButton } from '../components/CopyButton.js';
import { IconLock, IconRefresh } from '../components/icon.js';

const { ref, onMounted } = Vue;

export const GuidView = {
    components: { FInput, CopyButton, IconLock, IconRefresh },
    template: `
    <div class="flex-1 overflow-hidden flex flex-col gap-4 p-4 bg-gradient-to-br from-[var(--bg-gradient-start)] to-[var(--bg-gradient-end)]">
        <div class="bg-[var(--bg-surface)] rounded-xl shadow-sm border border-[var(--border-subtle)] p-5 flex-1 overflow-hidden flex flex-col gap-4">
            <div class="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-[var(--bg-input)] to-[var(--accent-light)] border border-[var(--border-subtle)] rounded-lg">
                <IconLock class="w-5 h-5 text-[var(--accent)]" />
                <code class="flex-1 text-sm font-mono text-[var(--text-primary)]">00000000-0000-0000-0000-000000000000</code>
                <CopyButton :text="'00000000-0000-0000-0000-000000000000'"></CopyButton>
            </div>

            <div class="flex-1 overflow-hidden flex flex-col gap-4">
                <div class="flex flex-wrap gap-4">
                    <label class="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-[var(--bg-hover)] transition-colors">
                        <input type="radio" v-model="format" value="D" class="w-4 h-4 text-[var(--accent)] border-[var(--border-subtle)] focus:ring-[var(--accent)]">
                        <span class="text-sm text-[var(--text-secondary)]">带连字符</span>
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-[var(--bg-hover)] transition-colors">
                        <input type="radio" v-model="format" value="N" class="w-4 h-4 text-[var(--accent)] border-[var(--border-subtle)] focus:ring-[var(--accent)]">
                        <span class="text-sm text-[var(--text-secondary)]">无连字符</span>
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-[var(--bg-hover)] transition-colors">
                        <input type="radio" v-model="format" value="B" class="w-4 h-4 text-[var(--accent)] border-[var(--border-subtle)] focus:ring-[var(--accent)]">
                        <span class="text-sm text-[var(--text-secondary)]">带花括号</span>
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-[var(--bg-hover)] transition-colors">
                        <input type="radio" v-model="format" value="P" class="w-4 h-4 text-[var(--accent)] border-[var(--border-subtle)] focus:ring-[var(--accent)]">
                        <span class="text-sm text-[var(--text-secondary)]">带圆括号</span>
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-[var(--bg-hover)] transition-colors">
                        <input type="checkbox" v-model="uppercase" class="w-4 h-4 text-[var(--accent)] border-[var(--border-subtle)] rounded">
                        <span class="text-sm text-[var(--text-secondary)]">大写</span>
                    </label>
                </div>

                <div class="flex flex-col lg:flex-row lg:items-center gap-4">
                    <label class="text-sm font-semibold text-[var(--text-primary)] whitespace-nowrap">生成数量</label>
                    <FInput type="number" v-model.number="count" class="w-24" min="1" max="100"></FInput>
                    <FButton type="primary" @click="generate" class="flex-1 lg:flex-none">
                        <IconRefresh :size="20" />
                        生成
                    </FButton>
                </div>

                <div v-if="guids.length" class="flex-1 min-h-0 overflow-y-auto space-y-2">
                    <div v-for="(g, i) in guids" :key="i"
                        class="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-[var(--bg-input)] to-[var(--accent-light)] border border-[var(--border-subtle)] rounded-lg">
                        <span class="text-xs text-[var(--text-placeholder)] w-6">#{{ i + 1 }}</span>
                        <code class="flex-1 text-sm font-mono text-[var(--text-primary)] select-all">{{ g }}</code>
                        <CopyButton :text="g"></CopyButton>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,
    setup() {
        const format = ref('D');
        const uppercase = ref(true);
        const count = ref(5);
        const guids = ref([]);

        const generateUUID = () => {
            if (typeof crypto !== 'undefined' && crypto.randomUUID) {
                return crypto.randomUUID();
            }
            return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
                (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
            );
        };

        const generate = () => {
            guids.value = [];
            for (let i = 0; i < count.value; i++) {
                const raw = generateUUID();
                let guid = raw;
                if (format.value === 'N') guid = guid.replace(/-/g, '');
                else if (format.value === 'B') guid = '{' + guid + '}';
                else if (format.value === 'P') guid = '(' + guid + ')';
                if (uppercase.value) guid = guid.toUpperCase();
                guids.value.push(guid);
            }
        };

        const refresh = () => {
            generate();
        };

        onMounted(() => {
            generate();
        });

        return { format, uppercase, count, guids, generate, refresh };
    }
};
