import type { Language } from './preferences';

const strings = {
  en: {
    settingsTitle: 'Settings',
    settingsSubtitle: 'Language, theme, and preferences',
    appearance: 'Appearance',
    theme: 'Theme',
    themeDark: 'Dark',
    themeLight: 'Light',
    language: 'Language',
    behavior: 'Behavior',
    confirmBeforeDelete: 'Confirm before deleting a report',
    confirmBeforeDeleteDesc:
      'Ask for confirmation before permanently removing a saved report',
    showTechnicalDetails: 'Show technical details by default',
    showTechnicalDetailsDesc:
      'Expand raw headers and hop chains in the email detail view',
  },
  it: {
    settingsTitle: 'Impostazioni',
    settingsSubtitle: 'Lingua, tema e preferenze',
    appearance: 'Aspetto',
    theme: 'Tema',
    themeDark: 'Scuro',
    themeLight: 'Chiaro',
    language: 'Lingua',
    behavior: 'Comportamento',
    confirmBeforeDelete: 'Conferma prima di eliminare un report',
    confirmBeforeDeleteDesc:
      'Chiedi conferma prima di rimuovere definitivamente un report salvato',
    showTechnicalDetails: 'Mostra dettagli tecnici di default',
    showTechnicalDetailsDesc:
      'Espandi header grezzi e catena hop nel dettaglio della mail',
  },
} as const;

export function t(
  language: Language,
  key: keyof (typeof strings)['en'],
): string {
  return strings[language][key];
}
