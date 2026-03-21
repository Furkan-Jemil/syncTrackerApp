export const themeTokens = {
  dark: {
    background: '#09090B',
    surface: '#18181B',
    surfaceSecondary: '#27272A',
    text: '#F8FAFC',
    textSecondary: '#A1A1AA',
    textMuted: '#71717A',
    primary: '#A3E635',
    primaryMuted: 'rgba(163, 230, 53, 0.15)',
    border: '#27272A',
    error: '#EF4444',
    warning: '#FACC15',
    info: '#3B82F6',
    success: '#22C55E',
  },
  light: {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    surfaceSecondary: '#F1F5F9',
    text: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#94A3B8',
    primary: '#65A30D', // Darker lime for light mode
    primaryMuted: 'rgba(101, 163, 13, 0.1)',
    border: '#E2E8F0',
    error: '#DC2626',
    warning: '#CA8A04',
    info: '#2563EB',
    success: '#16A34A',
  }
};

export type ThemeType = 'dark' | 'light';
export type AppTheme = typeof themeTokens.dark;
