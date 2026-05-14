import { FButton } from './components/FButton.js';
import { FSingleSelect } from './components/FSingleSelect.js';
import { CopyButton } from './components/CopyButton.js';
import { 
    IconLogo, IconMenu, IconClose, IconSun, IconMoon, IconHash, IconChevronDown, NavIcon,
    IconClock, IconEdit, IconDocument, IconText, IconType, IconSearch, IconShield,
    IconKey, IconLock, IconUnlock, IconKeyAlt, IconPackage, IconID, IconGlobe, IconTerminal
} from './components/icon.js';
import { TimestampView } from './views/TimestampView.js';
import { JsonView } from './views/JsonView.js';
import { RsaKeyView } from './views/RsaKeyView.js';
import { RsaView } from './views/RsaView.js';
import { AesView } from './views/AesView.js';
import { DesView } from './views/DesView.js';
import { TripleDesView } from './views/TripleDesView.js';
import { StringView } from './views/StringView.js';
import { RegexView } from './views/RegexView.js';
import { EncodingView } from './views/EncodingView.js';
import { HashView } from './views/HashView.js';
import { JwtView } from './views/JwtView.js';
import { GuidView } from './views/GuidView.js';
import { HttpView } from './views/HttpView.js';
import { FileBase64View } from './views/Base64View.js';



const { createApp, ref, computed, inject, onMounted, onBeforeUnmount } = Vue;
const { createRouter, createWebHashHistory, useRoute, useRouter } = VueRouter;

const ThemeSymbol = Symbol('theme');

const navItems = [
    { route: '/timestamp', label: '时间戳', icon: 'clock' },
    { 
        label: '文本工具', 
        icon: 'edit',
        children: [
            { route: '/json', label: 'JSON工具', icon: 'document' },
            { route: '/encoding', label: '编码转换', icon: 'type' },
            { route: '/base64', label: '文件Base64', icon: 'package' },
            { route: '/string', label: '字符串', icon: 'text' },
            { route: '/regex', label: '正则测试', icon: 'search' },
        ],
        group: 'text'
    },
    { 
        label: '加密安全', 
        icon: 'shield',
        children: [
            { route: '/rsa-key', label: 'RSA密钥', icon: 'key' },
            { route: '/rsa', label: 'RSA', icon: 'lock' },
            { route: '/aes', label: 'AES', icon: 'shield' },
            { route: '/des', label: 'DES', icon: 'unlock' },
            { route: '/tripledes', label: '3DES', icon: 'key' },
            { route: '/hash', label: '哈希', icon: 'hash' },
            { route: '/jwt', label: 'JWT', icon: 'key' },
        ],
        group: 'security'
    },
    { route: '/guid', label: 'GUID', icon: 'id' },
    { route: '/http', label: 'HTTP', icon: 'globe' },
];

const ThemePlugin = {
    install(app) {
        const saved = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const theme = ref(saved || (prefersDark ? 'dark' : 'light'));

        const effectiveTheme = () => theme.value;

        const toggle = () => {
            theme.value = theme.value === 'dark' ? 'light' : 'dark';
            localStorage.setItem('theme', theme.value);
            document.documentElement.setAttribute('data-theme', theme.value);
        };

        app.provide(ThemeSymbol, { theme, effectiveTheme, toggle });
    }
};

const App = {
    components: { FButton, IconLogo, IconMenu, IconClose, IconSun, IconMoon, IconChevronDown, NavIcon },
    template: `
    <div class="flex h-full overflow-hidden">
        <div v-if="mobileOpen && isMobile" class="fixed inset-0 bg-black/40 z-40 transition-opacity duration-200" :class="mobileOpen ? 'opacity-100' : 'opacity-0'" @click="mobileOpen = false"></div>
        <aside class="sidebar bg-[var(--bg-surface)] border-r border-[var(--border-subtle)] flex flex-col shrink-0 z-30"
            :class="{
                'sidebar--open': sidebarOpen && !isMobile,
                'sidebar--closed': !sidebarOpen && !isMobile,
                'sidebar--mobile-open': mobileOpen && isMobile,
                'sidebar--mobile': isMobile
            }">
            <div class="h-[60px] flex items-center justify-between px-4 py-4 border-b border-[var(--border-subtle)] shrink-0 overflow-hidden">
                <div class="flex items-center gap-2.5 min-w-0">
                    <IconLogo />
                    <div class="font-bold text-[var(--text-primary)] tracking-tight whitespace-nowrap">ToolBox</div>
                </div>
                <button class="inline-flex items-center justify-center w-7 h-7 rounded text-[var(--text-tertiary)] cursor-pointer transition-all duration-150 ease-out hover:bg-[var(--bg-hover)] hover:text-[var(--text-secondary)] shrink-0"
                    @click="closeSidebar" title="关闭侧边栏">
                    <IconClose />
                </button>
            </div>
            <nav class="flex-1 px-2.5 py-3 overflow-y-auto overflow-x-hidden">
                <template v-for="item in navItems" :key="item.route || item.group">
                    <template v-if="item.children">
                        <div class="sidebar-nav-group">
                            <div class="sidebar-nav-item sidebar-nav-item--clickable"
                                :class="{ 'sidebar-nav-item--active': isGroupActive(item) }"
                                @click="toggleGroup(item.group)">
                                <NavIcon :icon="item.icon" />
                                <span class="flex-1 whitespace-nowrap">{{ item.label }}</span>
                                <IconChevronDown class="sidebar-nav-chevron transition-transform duration-200" :class="{ 'rotate-180': openGroups[item.group] }" />
                            </div>
                            <div v-show="openGroups[item.group]" class="sidebar-nav-submenu">
                                <a v-for="child in item.children" :key="child.route"
                                    @click="navigate(child.route); mobileOpen = false;"
                                    :class="['sidebar-nav-item sidebar-nav-item--sub', currentRoute === child.route ? 'sidebar-nav-item--active' : '']">
                                    <NavIcon :icon="child.icon" />
                                    <span class="whitespace-nowrap">{{ child.label }}</span>
                                </a>
                            </div>
                        </div>
                    </template>
                    <template v-else>
                        <a @click="navigate(item.route); mobileOpen = false;"
                            :class="['sidebar-nav-item', currentRoute === item.route ? 'sidebar-nav-item--active' : '']">
                            <NavIcon :icon="item.icon" />
                            <span class="whitespace-nowrap">{{ item.label }}</span>
                        </a>
                    </template>
                </template>
            </nav>
        </aside>
        <div class="flex-1 overflow-hidden flex flex-col min-w-0">
            <header class="h-[60px] flex items-center justify-between px-4 sm:px-6 bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] shrink-0">
                <div class="flex items-center gap-3">
                    <button v-if="isMobile ? !mobileOpen : !sidebarOpen" class="inline-flex items-center justify-center w-9 h-9 rounded border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)] cursor-pointer transition-all duration-150 ease-out hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)]"
                        @click="openSidebar" title="打开菜单">
                        <IconMenu />
                    </button>
                    <IconLogo v-if="isMobile ? !mobileOpen : !sidebarOpen" :size="28" />
                    <h1 class="text-lg font-semibold text-[var(--text-primary)] tracking-tight leading-snug">
                        {{ currentTitle }}
                    </h1>
                    <button @click="refreshPage" class="inline-flex items-center justify-center w-7 h-7 rounded text-[var(--text-tertiary)] cursor-pointer transition-all duration-150 ease-out hover:bg-[var(--bg-hover)] hover:text-[var(--text-secondary)] active:bg-[var(--accent)] active:text-white" title="刷新">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/></svg>
                    </button>
                </div>
                <div class="flex items-center gap-2 sm:gap-4">
                    <button class="inline-flex items-center justify-center w-8 h-8 rounded border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)] cursor-pointer text-sm transition-all duration-150 ease-out hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)]" @click="toggleTheme" :title="isDark ? '切换到浅色模式' : '切换到深色模式'">
                        <IconSun v-if="isDark" /><IconMoon v-else />
                    </button>
                </div>
            </header>
            <main class="flex-1 overflow-y-auto">
                <router-view v-slot="{ Component }">
                    <keep-alive>
                        <component :is="Component" ref="currentViewRef" class="relative h-full" />
                    </keep-alive>
                </router-view>
            </main>
        </div>
    </div>
    `,
    setup() {
        const router = useRouter();
        const route = useRoute();
        const sidebarOpen = ref(true);
        const mobileOpen = ref(false);
        const isMobile = ref(window.innerWidth < 1024);
        const openGroups = ref({ text: true, security: true });
        const currentViewRef = ref(null);
        
        const theme = inject(ThemeSymbol, null);
        const isDark = computed(() => theme ? theme.effectiveTheme() === 'dark' : false);
        const toggleTheme = () => { if (theme) theme.toggle(); };

        const currentRoute = computed(() => route.path);

        const currentTitle = computed(() => {
            for (const item of navItems) {
                if (item.route === route.path) return item.label;
                if (item.children) {
                    const child = item.children.find(c => c.route === route.path);
                    if (child) return child.label;
                }
            }
            return 'ToolBox';
        });

        const isGroupActive = (group) => {
            const groupItem = navItems.find(i => i.group === group);
            if (!groupItem) return false;
            return groupItem.children.some(c => c.route === route.path);
        };

        const toggleGroup = (group) => {
            openGroups.value[group] = !openGroups.value[group];
        };

        const updateIsMobile = () => {
            isMobile.value = window.innerWidth < 1024;
            if (isMobile.value) {
                sidebarOpen.value = true;
                mobileOpen.value = false;
            } else {
                mobileOpen.value = false;
            }
        };

        onMounted(() => { window.addEventListener('resize', updateIsMobile) });
        onBeforeUnmount(() => window.removeEventListener('resize', updateIsMobile));

        const closeSidebar = () => {
            if (isMobile.value) {
                mobileOpen.value = false;
            } else {
                sidebarOpen.value = false;
            }
        };

        const openSidebar = () => {
            if (isMobile.value) {
                mobileOpen.value = true;
            } else {
                sidebarOpen.value = true;
            }
        };

        const navigate = (path) => {
            router.push(path);
            mobileOpen.value = false;
        };

        const refreshPage = () => {
            const instance = currentViewRef.value;
            if (instance && typeof instance.refresh === 'function') {
                instance.refresh();
            }
        };

        return { 
            navItems, 
            currentRoute, 
            currentTitle,
            sidebarOpen, 
            mobileOpen, 
            isMobile, 
            isDark,
            openGroups,
            isGroupActive,
            toggleGroup,
            closeSidebar, 
            openSidebar, 
            navigate, 
            toggleTheme,
            currentViewRef,
            refreshPage
        };
    }
};

const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        { path: '/', redirect: '/timestamp' },
        { path: '/timestamp', component: TimestampView },
        { path: '/json', component: JsonView },
        { path: '/rsa-key', component: RsaKeyView },
        { path: '/rsa', component: RsaView },
        { path: '/aes', component: AesView },
        { path: '/des', component: DesView },
        { path: '/tripledes', component: TripleDesView },
        { path: '/string', component: StringView },
        { path: '/regex', component: RegexView },
        { path: '/encoding', component: EncodingView },
        { path: '/hash', component: HashView },
        { path: '/jwt', component: JwtView },
        { path: '/guid', component: GuidView },
        { path: '/base64', component: FileBase64View },
        { path: '/http', component: HttpView },
    ],
});

const app = createApp(App);
app.use(ThemePlugin);
app.use(router);
app.component('FButton', FButton);
app.component('FSingleSelect', FSingleSelect);
app.component('CopyButton', CopyButton);
app.component('IconLogo', IconLogo);
app.component('IconMenu', IconMenu);
app.component('IconClose', IconClose);
app.component('IconSun', IconSun);
app.component('IconMoon', IconMoon);
app.component('IconChevronDown', IconChevronDown);
app.component('NavIcon', NavIcon);
app.component('IconPlus', {
    props: { size: { type: Number, default: 16 } },
    template: '<svg xmlns="http://www.w3.org/2000/svg" :width="size" :height="size" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>'
});
app.component('IconTrash', {
    props: { size: { type: Number, default: 16 } },
    template: '<svg xmlns="http://www.w3.org/2000/svg" :width="size" :height="size" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>'
});
app.mount('#app');

export { FButton, FSingleSelect, CopyButton };