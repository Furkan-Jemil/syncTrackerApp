import { useColorScheme } from 'react-native';
import useSettingsStore from '@/stores/settingsStore';
import { themeTokens, AppTheme } from '@/theme/tokens';

export function useAppTheme(): AppTheme {
  const selectedTheme = useSettingsStore((s) => s.theme);
  const systemColorScheme = useColorScheme();

  const activeTheme = selectedTheme === 'system' 
    ? (systemColorScheme === 'light' ? 'light' : 'dark')
    : selectedTheme;

  return themeTokens[activeTheme as keyof typeof themeTokens] || themeTokens.dark;
}
