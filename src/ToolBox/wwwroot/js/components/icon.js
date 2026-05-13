const icon = (svgContent, defaultSize = 18) => ({
    props: {
        size: { type: Number, default: defaultSize }
    },
    template: `<svg xmlns="http://www.w3.org/2000/svg" :width="size" :height="size" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${svgContent}</svg>`
});

const iconFilled = (svgContent, defaultSize = 18) => ({
    props: {
        size: { type: Number, default: defaultSize }
    },
    template: `<svg xmlns="http://www.w3.org/2000/svg" :width="size" :height="size" viewBox="0 0 24 24">${svgContent}</svg>`
});

export const IconLogo = iconFilled('<rect width="24" height="24" rx="6" fill="var(--accent)"/><path d="M7 8h4v8H7V8zm6 0h4v8h-4V8z" fill="white" opacity="0.9"/><path d="M8 9h2v6H8V9zm6 0h2v6h-2V9z" fill="var(--accent)" opacity="0.3"/>', 28);
export const IconMenu = icon('<line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/>', 20);
export const IconClose = icon('<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>');
export const IconCopy = icon('<rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>');
export const IconCheck = icon('<polyline points="20 6 9 17 4 12"/>');
export const IconSun = icon('<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>');
export const IconMoon = icon('<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>');
export const IconPlus = icon('<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>', 16);
export const IconTrash = icon('<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>', 16);
export const IconFile = icon('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>');
export const IconImage = icon('<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>');
export const IconDownload = icon('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>');
export const IconHash = icon('<line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/>', 16);