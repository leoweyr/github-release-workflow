export const ChangelogStrip = {
    ALL: 'all',
    FOOTER: 'footer',
    HEADER: 'header',
} as const;


export type ChangelogStrip = typeof ChangelogStrip[keyof typeof ChangelogStrip];
