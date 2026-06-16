const { ref, computed } = Vue;

export const JsonTreeView = {
    name: 'JsonTreeView',
    template: `
    <div class="json-tree">
        <div class="json-tree-line" :style="{ paddingLeft: depth * 20 + 'px' }">
            <span v-if="label !== null" class="json-tree-label">{{ label }}<span class="json-tree-colon">: </span></span>
            <template v-if="isLeaf">
                <span :class="'json-tree-' + (node === null ? 'null' : typeof node)">{{ displayValue }}</span>
            </template>
            <template v-else-if="isEmpty">
                <span class="json-tree-bracket">{{ isArray ? '[]' : '{}' }}</span>
            </template>
            <template v-else>
                <span class="json-tree-toggle" :class="{ expanded }" @click="toggle">
                    <svg class="json-tree-arrow" width="12" height="12" viewBox="0 0 12 12"><path d="M4 2l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>
                </span>
                <span class="json-tree-bracket">{{ isArray ? '[' : '{' }}</span>
                <span class="json-tree-count">{{ childCount }} 项</span>
                <template v-if="!expanded">
                    <span class="json-tree-bracket">{{ isArray ? ']' : '}' }}</span>
                </template>
            </template>
        </div>
        <template v-if="!isLeaf && !isEmpty && expanded">
            <JsonTreeView v-for="([key, val]) in entries" :key="key" :node="val" :label="key" :depth="depth + 1" />
            <div class="json-tree-line" :style="{ paddingLeft: depth * 20 + 'px' }">
                <span class="json-tree-bracket">{{ isArray ? ']' : '}' }}</span>
            </div>
        </template>
    </div>
    `,
    props: {
        node: { required: true },
        label: { type: String, default: null },
        depth: { type: Number, default: 0 }
    },
    setup(props) {
        const expanded = ref(props.depth < 1);

        const isLeaf = computed(() => props.node === null || typeof props.node !== 'object');
        const isArray = computed(() => Array.isArray(props.node));

        const entries = computed(() => {
            if (isLeaf.value) return [];
            if (isArray.value) return props.node.map((v, i) => [String(i), v]);
            return Object.entries(props.node);
        });

        const childCount = computed(() => entries.value.length);
        const isEmpty = computed(() => !isLeaf.value && childCount.value === 0);

        const displayValue = computed(() => {
            if (props.node === null) return 'null';
            if (typeof props.node === 'string') return JSON.stringify(props.node);
            return String(props.node);
        });

        const toggle = () => { expanded.value = !expanded.value; };

        return { expanded, isLeaf, isArray, entries, childCount, isEmpty, displayValue, toggle };
    }
};
