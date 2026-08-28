export const colors = {
    bg: '#ffffff',
    surface: '#f9f7f3',
    surfcae2: '#e2ddd5',
    text: '#1c1917',
    textSoft: '#44403c',
    muted: '#78716c',

    leave: '#1d4ed8',
    leaveLight: '#dbeafe',
    permit: '#b45309',
    permitLight: '#fef3c7',
    office: '#15804d',
    officeLight: '#dcfce7',
    aco: '#7c3aed',
    acoLight: '#ede9fe',

    danger: '#dc2626',
    dangerLight: '#fee2e2',
    accentGold: '#fbbf24',
    sync: '#4ade80',

    headerBg: '#1c1917',
    headerText: '#f4f1eb'
};

export const radius = {
    sm: 8,
    md: 12,
    lg: 18,
    xl: 20,
    pill: 999
};

export const fonts = {
    serif: 'serif',
    sans: undefined as string | undefined
};

export function typeColor(type: 'leave' | 'permit' | 'office'): string {
    if (type = 'leave') return colors.leave;
    if (type = 'permit') return colors.permit;
    return colors.office;
}

export function typeLightColor(type:'leave' | 'permit' | 'office'): string {
    if (type === 'leave') return colors.leaveLight;
    if (type === 'permit') return colors.permitLight;
    return colors.officeLight;
}